import { Router, Request, Response, NextFunction } from 'express';
import { randomBytes, scryptSync, timingSafeEqual } from 'crypto';
import db from '../database';

const router = Router();
const TRACKS = new Set(['private', 'instrument', 'commercial', 'cfi']);
const SESSION_LIFETIME_MS = 30 * 24 * 60 * 60 * 1000;

type Session = { playerId: number; expiresAt: number };
type AuthedRequest = Request & { playerId?: number };
const sessions = new Map<string, Session>();

function hashCode(code: string, salt: string): Buffer {
  return scryptSync(code, salt, 64);
}

function publicPlayer(playerId: number) {
  const player = db.prepare(`
    SELECT id, name, xp, current_level AS currentLevel,
           games_played AS gamesPlayed, created_at AS createdAt
    FROM game_players WHERE id = ?
  `).get(playerId) as Record<string, unknown> | undefined;

  if (!player) return null;

  const bestScores = db.prepare(`
    SELECT track, MAX(score) AS score
    FROM game_scores
    WHERE player_id = ?
    GROUP BY track
  `).all(playerId) as Array<{ track: string; score: number }>;

  return {
    ...player,
    bestScores: Object.fromEntries(bestScores.map((row) => [row.track, row.score])),
  };
}

function requirePlayer(req: AuthedRequest, res: Response, next: NextFunction) {
  const authorization = req.header('authorization') || '';
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
  const session = sessions.get(token);

  if (!session || session.expiresAt < Date.now()) {
    if (token) sessions.delete(token);
    res.status(401).json({ error: 'Your Darcy Aviation Jeopardy session has expired. Sign in again.' });
    return;
  }

  req.playerId = session.playerId;
  next();
}

router.post('/login', (req, res) => {
  const name = String(req.body?.name || '').trim().replace(/\s+/g, ' ');
  const code = String(req.body?.code || '').trim();

  if (!/^[A-Za-z0-9 _.-]{2,24}$/.test(name)) {
    res.status(400).json({ error: 'Use 2–24 letters, numbers, spaces, dots, dashes, or underscores for your pilot name.' });
    return;
  }
  if (!/^[A-Za-z0-9]{4,12}$/.test(code)) {
    res.status(400).json({ error: 'Your access code must be 4–12 letters or numbers.' });
    return;
  }

  let player = db.prepare('SELECT * FROM game_players WHERE name = ? COLLATE NOCASE').get(name) as any;
  let created = false;

  if (player) {
    const candidate = hashCode(code, player.access_code_salt);
    const stored = Buffer.from(player.access_code_hash, 'hex');
    if (candidate.length !== stored.length || !timingSafeEqual(candidate, stored)) {
      res.status(401).json({ error: 'That pilot name and access code do not match.' });
      return;
    }
    db.prepare('UPDATE game_players SET last_login = CURRENT_TIMESTAMP WHERE id = ?').run(player.id);
  } else {
    const salt = randomBytes(16).toString('hex');
    const result = db.prepare(`
      INSERT INTO game_players (name, access_code_hash, access_code_salt)
      VALUES (?, ?, ?)
    `).run(name, hashCode(code, salt).toString('hex'), salt);
    player = { id: Number(result.lastInsertRowid) };
    created = true;
  }

  const token = randomBytes(32).toString('hex');
  sessions.set(token, { playerId: player.id, expiresAt: Date.now() + SESSION_LIFETIME_MS });
  res.json({ token, created, player: publicPlayer(player.id) });
});

router.get('/profile', requirePlayer, (req: AuthedRequest, res) => {
  const player = publicPlayer(req.playerId!);
  if (!player) {
    res.status(404).json({ error: 'Pilot profile not found.' });
    return;
  }
  res.json({ player });
});

router.post('/results', requirePlayer, (req: AuthedRequest, res) => {
  const track = String(req.body?.track || '');
  const score = Number(req.body?.score);
  const maxScore = Number(req.body?.maxScore);
  const correctAnswers = Number(req.body?.correctAnswers);
  const answeredCount = Number(req.body?.answeredCount);

  if (!TRACKS.has(track)) {
    res.status(400).json({ error: 'Unknown training track.' });
    return;
  }
  if (![score, maxScore, correctAnswers, answeredCount].every(Number.isInteger)
      || score < 0 || maxScore <= 0 || score > maxScore
      || correctAnswers < 0 || answeredCount < 1 || correctAnswers > answeredCount
      || answeredCount > 30) {
    res.status(400).json({ error: 'Invalid game result.' });
    return;
  }

  const xpEarned = correctAnswers * 10 + (answeredCount >= 25 ? 25 : 0);
  const saveResult = db.transaction(() => {
    db.prepare(`
      INSERT INTO game_scores
        (player_id, track, score, max_score, correct_answers, answered_count)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(req.playerId, track, score, maxScore, correctAnswers, answeredCount);

    const current = db.prepare('SELECT xp FROM game_players WHERE id = ?').get(req.playerId) as { xp: number };
    const nextXp = current.xp + xpEarned;
    const nextLevel = Math.floor(nextXp / 250) + 1;
    db.prepare(`
      UPDATE game_players
      SET xp = ?, current_level = ?, games_played = games_played + 1
      WHERE id = ?
    `).run(nextXp, nextLevel, req.playerId);
  });
  saveResult();

  res.json({ xpEarned, player: publicPlayer(req.playerId!) });
});

router.get('/leaderboard', (req, res) => {
  const track = String(req.query.track || 'all');
  if (track !== 'all' && !TRACKS.has(track)) {
    res.status(400).json({ error: 'Unknown training track.' });
    return;
  }

  const rows = track === 'all'
    ? db.prepare(`
        SELECT p.name, p.current_level AS level, p.games_played AS gamesPlayed,
               SUM(best.best_score) AS score
        FROM game_players p
        JOIN (
          SELECT player_id, track, MAX(score) AS best_score
          FROM game_scores
          GROUP BY player_id, track
        ) best ON best.player_id = p.id
        GROUP BY p.id
        ORDER BY score DESC, p.name COLLATE NOCASE ASC
        LIMIT 20
      `).all()
    : db.prepare(`
        SELECT p.name, p.current_level AS level, p.games_played AS gamesPlayed,
               MAX(s.score) AS score
        FROM game_players p
        JOIN game_scores s ON s.player_id = p.id
        WHERE s.track = ?
        GROUP BY p.id
        ORDER BY score DESC, p.name COLLATE NOCASE ASC
        LIMIT 20
      `).all(track);

  res.json({ track, leaderboard: rows });
});

router.post('/logout', requirePlayer, (req, res) => {
  const token = (req.header('authorization') || '').slice(7);
  sessions.delete(token);
  res.status(204).end();
});

export default router;
