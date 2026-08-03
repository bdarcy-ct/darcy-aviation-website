import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { GAME_TRACKS, GameQuestion, GameTrack, GameTrackId } from '../data/dGameQuestions';
import { createUnseenFirstBoard, TOTAL_CATEGORY_COUNT, TOTAL_QUESTION_COUNT } from '../data/dGameMegaBank';
import './DGame.css';

type Player = {
  id: number;
  name: string;
  xp: number;
  currentLevel: number;
  gamesPlayed: number;
  bestScores: Partial<Record<GameTrackId, number>>;
};

type Leader = { name: string; level: number; gamesPlayed: number; score: number };
type Answered = Record<string, { correct: boolean; value: number }>;
type GameMode = 'single' | 'multi';
type Participant = { player: Player; token: string };
type PilotStats = { score: number; correct: number; attempts: number };

const SESSION_KEY = 'darcy-d-game-session';
const MAX_SCORE = 7500;

function apiHeaders(token?: string) {
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function readJson(response: Response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'The tower could not complete that request.');
  return data;
}

function shuffledChoices(question: GameQuestion) {
  const choices = [...question.choices];
  let seed = [...question.id].reduce((total, character) => total + character.charCodeAt(0), 0);
  for (let i = choices.length - 1; i > 0; i -= 1) {
    seed = (seed * 9301 + 49297) % 233280;
    const j = Math.floor((seed / 233280) * (i + 1));
    [choices[i], choices[j]] = [choices[j], choices[i]];
  }
  return choices;
}

function loadSeenQuestions(key: string) {
  try {
    const saved = JSON.parse(localStorage.getItem(key) || '[]');
    return new Set<string>(Array.isArray(saved) ? saved : []);
  } catch {
    return new Set<string>();
  }
}

function Altimeter({ level }: { level: number }) {
  const rotation = -120 + ((level - 1) % 10) * 24;
  return (
    <div className="dg-altimeter" aria-label={`Pilot level ${level}`}>
      <span className="dg-altimeter__number">{level}</span>
      <span className="dg-altimeter__label">LEVEL</span>
      <span className="dg-altimeter__needle" style={{ transform: `rotate(${rotation}deg)` }} />
    </div>
  );
}

export default function DGame() {
  const [token, setToken] = useState(() => localStorage.getItem(SESSION_KEY) || '');
  const [player, setPlayer] = useState<Player | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(Boolean(token));
  const [loginName, setLoginName] = useState('');
  const [loginCode, setLoginCode] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginBusy, setLoginBusy] = useState(false);
  const [gameMode, setGameMode] = useState<GameMode>('single');
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [crewName, setCrewName] = useState('');
  const [crewCode, setCrewCode] = useState('');
  const [crewError, setCrewError] = useState('');
  const [crewBusy, setCrewBusy] = useState(false);
  const [track, setTrack] = useState<GameTrack | null>(null);
  const [leaderboardTrack, setLeaderboardTrack] = useState<GameTrackId>('private');
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [activeQuestion, setActiveQuestion] = useState<GameQuestion | null>(null);
  const [choices, setChoices] = useState<string[]>([]);
  const [selectedChoice, setSelectedChoice] = useState('');
  const [answered, setAnswered] = useState<Answered>({});
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [pilotStats, setPilotStats] = useState<Record<number, PilotStats>>({});
  const [buzzedPlayerId, setBuzzedPlayerId] = useState<number | null>(null);
  const [questionAttempts, setQuestionAttempts] = useState<number[]>([]);
  const [revealAnswer, setRevealAnswer] = useState(false);
  const [showDebrief, setShowDebrief] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const resultSaved = useRef(false);

  useEffect(() => {
    document.title = 'Darcy Aviation Jeopardy Game';
  }, []);

  const answeredCount = Object.keys(answered).length;
  const progress = answeredCount / 25;
  const xpWithinLevel = player ? player.xp % 250 : 0;
  const activeCrew = gameMode === 'single' ? participants.slice(0, 1) : participants;
  const buzzedParticipant = participants.find((participant) => participant.player.id === buzzedPlayerId);
  const multiplayerStandings = [...activeCrew].sort((a, b) => (pilotStats[b.player.id]?.score || 0) - (pilotStats[a.player.id]?.score || 0));

  useEffect(() => {
    if (!token) return;
    fetch('/api/game/profile', { headers: apiHeaders(token) })
      .then(readJson)
      .then((data) => setPlayer(data.player))
      .catch(() => {
        localStorage.removeItem(SESSION_KEY);
        setToken('');
      })
      .finally(() => setLoadingProfile(false));
  }, [token]);

  useEffect(() => {
    if (!player || !token) return;
    setParticipants((current) => [
      { player, token },
      ...current.filter((participant) => participant.player.id !== player.id),
    ]);
  }, [player, token]);

  useEffect(() => {
    fetch(`/api/game/leaderboard?track=${leaderboardTrack}`)
      .then(readJson)
      .then((data) => setLeaders(data.leaderboard))
      .catch(() => setLeaders([]));
  }, [leaderboardTrack, player]);

  const rank = useMemo(() => {
    if (!player) return null;
    const index = leaders.findIndex((leader) => leader.name.toLowerCase() === player.name.toLowerCase());
    return index >= 0 ? index + 1 : null;
  }, [leaders, player]);

  async function handleLogin(event: FormEvent) {
    event.preventDefault();
    setLoginBusy(true);
    setLoginError('');
    try {
      const response = await fetch('/api/game/login', {
        method: 'POST', headers: apiHeaders(), body: JSON.stringify({ name: loginName, code: loginCode }),
      });
      const data = await readJson(response);
      localStorage.setItem(SESSION_KEY, data.token);
      setToken(data.token);
      setPlayer(data.player);
      setLoginCode('');
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : 'Unable to sign in.');
    } finally {
      setLoginBusy(false);
    }
  }

  async function addCrewMember(event: FormEvent) {
    event.preventDefault();
    if (participants.length >= 4) return;
    setCrewBusy(true);
    setCrewError('');
    try {
      const response = await fetch('/api/game/login', {
        method: 'POST', headers: apiHeaders(), body: JSON.stringify({ name: crewName, code: crewCode }),
      });
      const data = await readJson(response);
      if (participants.some((participant) => participant.player.id === data.player.id)) {
        throw new Error('That pilot is already on this crew.');
      }
      setParticipants((current) => [...current, { player: data.player, token: data.token }]);
      setCrewName('');
      setCrewCode('');
    } catch (error) {
      setCrewError(error instanceof Error ? error.message : 'Unable to add that pilot.');
    } finally {
      setCrewBusy(false);
    }
  }

  function removeCrewMember(playerId: number) {
    if (playerId === player?.id) return;
    setParticipants((current) => current.filter((participant) => participant.player.id !== playerId));
  }

  function selectTrack(selected: GameTrack) {
    if (!player || (gameMode === 'multi' && participants.length < 2)) return;
    const historyKey = `darcy-d-game-seen:${player.id}:${selected.id}`;
    const seen = loadSeenQuestions(historyKey);
    const { board: randomizedTrack, selectedIds } = createUnseenFirstBoard(selected, seen);
    selectedIds.forEach((id) => seen.add(id));
    localStorage.setItem(historyKey, JSON.stringify([...seen]));
    const crew = gameMode === 'single' ? participants.slice(0, 1) : participants;
    setTrack(randomizedTrack);
    setLeaderboardTrack(selected.id);
    setAnswered({});
    setScore(0);
    setCorrectCount(0);
    setPilotStats(Object.fromEntries(crew.map((participant) => [participant.player.id, { score: 0, correct: 0, attempts: 0 }])));
    setBuzzedPlayerId(null);
    setQuestionAttempts([]);
    setRevealAnswer(false);
    setShowDebrief(false);
    setSaveMessage('');
    resultSaved.current = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function openQuestion(question: GameQuestion) {
    if (answered[question.id]) return;
    setActiveQuestion(question);
    setChoices(shuffledChoices(question));
    setSelectedChoice('');
    setBuzzedPlayerId(null);
    setQuestionAttempts([]);
    setRevealAnswer(false);
  }

  function chooseAnswer(choice: string) {
    if (!activeQuestion || selectedChoice) return;
    const answeringPlayerId = gameMode === 'single' ? player?.id : buzzedPlayerId;
    if (!answeringPlayerId) return;
    const correct = choice === activeQuestion.answer;
    setSelectedChoice(choice);
    setPilotStats((current) => {
      const stats = current[answeringPlayerId] || { score: 0, correct: 0, attempts: 0 };
      return { ...current, [answeringPlayerId]: {
        score: correct ? stats.score + activeQuestion.value : Math.max(0, stats.score - activeQuestion.value),
        correct: stats.correct + (correct ? 1 : 0), attempts: stats.attempts + 1,
      }};
    });

    if (gameMode === 'single') {
      setAnswered((current) => ({ ...current, [activeQuestion.id]: { correct, value: activeQuestion.value } }));
      setScore((current) => correct ? current + activeQuestion.value : Math.max(0, current - activeQuestion.value));
      if (correct) setCorrectCount((current) => current + 1);
      setRevealAnswer(true);
      return;
    }

    const attempts = [...questionAttempts, answeringPlayerId];
    setQuestionAttempts(attempts);
    if (correct) {
      setAnswered((current) => ({ ...current, [activeQuestion.id]: { correct: true, value: activeQuestion.value } }));
      setRevealAnswer(true);
    } else if (attempts.length >= participants.length) {
      setAnswered((current) => ({ ...current, [activeQuestion.id]: { correct: false, value: activeQuestion.value } }));
      setRevealAnswer(true);
    }
  }

  function reopenBuzzers() {
    setBuzzedPlayerId(null);
    setSelectedChoice('');
  }

  function closeQuestion() {
    const willFinish = answeredCount === 25;
    setActiveQuestion(null);
    setSelectedChoice('');
    if (willFinish) finishGame();
  }

  async function finishGame() {
    if (!track || !token || !player || answeredCount < 1) return;
    setShowDebrief(true);
    if (resultSaved.current) return;
    resultSaved.current = true;
    setSaveMessage('Logging your flight…');
    try {
      if (gameMode === 'single') {
        const response = await fetch('/api/game/results', {
          method: 'POST', headers: apiHeaders(token),
          body: JSON.stringify({ track: track.id, score, maxScore: MAX_SCORE, correctAnswers: correctCount, answeredCount }),
        });
        const data = await readJson(response);
        setPlayer(data.player);
        setSaveMessage(`Flight logged · +${data.xpEarned} XP`);
      } else {
        const results = await Promise.all(participants.map(async (participant) => {
          const stats = pilotStats[participant.player.id] || { score: 0, correct: 0, attempts: 0 };
          const response = await fetch('/api/game/results', {
            method: 'POST', headers: apiHeaders(participant.token),
            body: JSON.stringify({ track: track.id, score: stats.score, maxScore: MAX_SCORE, correctAnswers: stats.correct, answeredCount: Math.max(1, stats.attempts) }),
          });
          return { participant, data: await readJson(response) };
        }));
        const hostResult = results.find((result) => result.participant.player.id === player.id);
        if (hostResult) setPlayer(hostResult.data.player);
        setParticipants((current) => current.map((participant) => {
          const result = results.find((entry) => entry.participant.player.id === participant.player.id);
          return result ? { ...participant, player: result.data.player } : participant;
        }));
        setSaveMessage(`${results.length} pilot scores logged to the standings`);
      }
    } catch (error) {
      resultSaved.current = false;
      setSaveMessage(error instanceof Error ? error.message : 'Score could not be saved.');
    }
  }

  async function logout() {
    if (token) fetch('/api/game/logout', { method: 'POST', headers: apiHeaders(token) }).catch(() => {});
    localStorage.removeItem(SESSION_KEY);
    setToken('');
    setPlayer(null);
    setTrack(null);
  }

  if (loadingProfile) {
    return <div className="dg-shell dg-loading"><div className="dg-radar" /><p>Calling Darcy Ground…</p></div>;
  }

  if (!player) {
    return (
      <div className="dg-shell dg-auth">
        <div className="dg-chart-lines" />
        <header className="dg-auth__header">
          <Link to="/" className="dg-home-link">← Darcy Aviation</Link>
          <span className="dg-frequency">KDXR · 118.775</span>
        </header>
        <main className="dg-auth__main">
          <section className="dg-auth__intro">
            <div className="dg-kicker"><span /> Darcy Aviation presents</div>
            <h1><small>DARCY AVIATION</small>{' '}JEOPARDY</h1>
            <p className="dg-auth__tagline">Train your head.<br />Fly ahead.</p>
            <div className="dg-auth__tracks" aria-label="Available training tracks">
              {GAME_TRACKS.map((item, index) => <span key={item.id}>0{index + 1} / {item.shortName}</span>)}
            </div>
          </section>
          <section className="dg-login-card">
            <div className="dg-login-card__rivets"><i /><i /><i /><i /></div>
            <p className="dg-panel-label">PILOT ACCESS PANEL</p>
            <h2>Enter the flight deck</h2>
            <p>New name? Your profile is created on first sign-in. Returning pilot? Use the same access code.</p>
            <form onSubmit={handleLogin}>
              <label>
                <span>Pilot name</span>
                <input value={loginName} onChange={(event) => setLoginName(event.target.value)} placeholder="Your callsign" autoComplete="username" maxLength={24} required />
              </label>
              <label>
                <span>Access code</span>
                <input value={loginCode} onChange={(event) => setLoginCode(event.target.value)} placeholder="4–12 letters or numbers" autoComplete="current-password" type="password" minLength={4} maxLength={12} required />
              </label>
              {loginError && <div className="dg-error" role="alert">{loginError}</div>}
              <button type="submit" disabled={loginBusy}>{loginBusy ? 'CONTACTING TOWER…' : 'START ENGINES'} <b>→</b></button>
            </form>
            <small>Training aid only. Always verify procedures and regulations against current FAA publications.</small>
          </section>
        </main>
      </div>
    );
  }

  if (!track) {
    return (
      <div className="dg-shell dg-hangar">
        <DGameHeader player={player} onLogout={logout} />
        <main className="dg-hangar__main">
          <section className="dg-welcome">
            <div>
              <p className="dg-kicker"><span /> Pilot briefing</p>
              <h1>Good to see you, <em>{player.name}</em>.</h1>
              <p>Pick today’s training track. Each board has 25 questions and a possible 7,500 points.</p>
            </div>
            <div className="dg-level-card">
              <Altimeter level={player.currentLevel} />
              <div><span>{xpWithinLevel} / 250 XP</span><div><i style={{ width: `${(xpWithinLevel / 250) * 100}%` }} /></div><small>{250 - xpWithinLevel} XP to next level</small></div>
            </div>
          </section>

          <section className="dg-mode-panel">
            <div className="dg-mode-panel__choice">
              <p className="dg-panel-label">CHOOSE GAME MODE</p>
              <div className="dg-mode-toggle">
                <button className={gameMode === 'single' ? 'is-active' : ''} onClick={() => setGameMode('single')}><span>01</span><b>Single Player</b><small>Solo run · personal best</small></button>
                <button className={gameMode === 'multi' ? 'is-active' : ''} onClick={() => setGameMode('multi')}><span>02</span><b>Multiplayer</b><small>2–4 pilots · buzz-in battle</small></button>
              </div>
              <p className="dg-bank-note">{TOTAL_QUESTION_COUNT.toLocaleString()} question bank · {TOTAL_CATEGORY_COUNT} categories · every board randomized</p>
            </div>

            {gameMode === 'multi' && (
              <div className="dg-crew-panel">
                <div className="dg-crew-panel__top"><div><p className="dg-panel-label">FLIGHT CREW</p><h2>Build the matchup</h2></div><span>{participants.length}/4 PILOTS</span></div>
                <div className="dg-crew-list">
                  {participants.map((participant, index) => (
                    <div key={participant.player.id}><span>{String(index + 1).padStart(2, '0')}</span><strong>{participant.player.name}</strong><small>LVL {participant.player.currentLevel}{participant.player.id === player.id ? ' · HOST' : ''}</small>{participant.player.id !== player.id && <button onClick={() => removeCrewMember(participant.player.id)} aria-label={`Remove ${participant.player.name}`}>×</button>}</div>
                  ))}
                </div>
                {participants.length < 4 && (
                  <form className="dg-crew-form" onSubmit={addCrewMember}>
                    <input aria-label="Crew pilot name" value={crewName} onChange={(event) => setCrewName(event.target.value)} placeholder="Pilot name" maxLength={24} required />
                    <input aria-label="Crew access code" value={crewCode} onChange={(event) => setCrewCode(event.target.value)} placeholder="Access code" type="password" minLength={4} maxLength={12} required />
                    <button disabled={crewBusy}>{crewBusy ? 'ADDING…' : '+ ADD PILOT'}</button>
                  </form>
                )}
                {crewError && <div className="dg-error" role="alert">{crewError}</div>}
                {participants.length < 2 && <p className="dg-crew-hint">Add at least one more pilot to unlock the boards.</p>}
              </div>
            )}
          </section>

          <section className="dg-track-grid">
            {GAME_TRACKS.map((item, index) => (
              <button className="dg-track-card" key={item.id} onClick={() => selectTrack(item)} disabled={gameMode === 'multi' && participants.length < 2} style={{ '--track-accent': item.accent } as React.CSSProperties}>
                <span className="dg-track-card__number">0{index + 1}</span>
                <span className="dg-track-card__eyebrow">{item.eyebrow}</span>
                <strong>{item.name}</strong>
                <p>{item.description}</p>
                <span className="dg-track-card__meta">Best <b>{player.bestScores[item.id]?.toLocaleString() || '—'}</b><i>{gameMode === 'multi' && participants.length < 2 ? 'ADD PILOT' : 'BOARD →'}</i></span>
              </button>
            ))}
          </section>

          <Leaderboard track={leaderboardTrack} setTrack={setLeaderboardTrack} leaders={leaders} playerName={player.name} />
        </main>
      </div>
    );
  }

  return (
    <div className="dg-shell dg-game" style={{ '--track-accent': track.accent } as React.CSSProperties}>
      <DGameHeader player={player} onLogout={logout} compact />
      <main className="dg-game__main">
        <section className={`dg-score-strip ${gameMode === 'multi' ? 'is-multi' : ''}`}>
          <button className="dg-back" onClick={() => setTrack(null)}>← TRACKS</button>
          <div className="dg-score-strip__title"><small>{track.eyebrow}</small><h1>{track.name}</h1></div>
          {gameMode === 'single' ? <div className="dg-score"><small>SCORE</small><strong>{score.toLocaleString()}</strong></div> : (
            <div className="dg-match-scores">{activeCrew.map((participant) => <div key={participant.player.id}><span>{participant.player.name}</span><b>{(pilotStats[participant.player.id]?.score || 0).toLocaleString()}</b></div>)}</div>
          )}
          <div className="dg-progress" aria-label={`${answeredCount} of 25 questions answered`}><span><i style={{ width: `${progress * 100}%` }} /></span><b>{answeredCount}/25</b></div>
          <button className="dg-finish" onClick={finishGame} disabled={!answeredCount}>END FLIGHT</button>
        </section>

        <section className="dg-board" aria-label={`${track.name} question board`}>
          {track.categories.map((category) => (
            <div className="dg-board__column" key={category.name}>
              <header><span>{category.shortName}</span><strong>{category.name}</strong></header>
              {category.questions.map((question) => {
                const result = answered[question.id];
                return (
                  <button key={question.id} data-question-id={question.id} onClick={() => openQuestion(question)} disabled={Boolean(result)} className={result ? (result.correct ? 'is-correct' : 'is-wrong') : ''}>
                    {result ? <span>{result.correct ? '✓' : '×'}</span> : <><small>PT</small>{question.value}</>}
                  </button>
                );
              })}
            </div>
          ))}
        </section>
        <p className="dg-board-note">Correct answers add points. Incorrect answers subtract points, but your score never drops below zero.</p>
      </main>

      {activeQuestion && (
        <div className="dg-modal" role="dialog" aria-modal="true" aria-labelledby="question-title">
          <div className="dg-question-card">
            <div className="dg-question-card__top"><span>{track.shortName} · {activeQuestion.value} PT</span><span>QUESTION {answeredCount + (selectedChoice ? 0 : 1)} / 25</span></div>
            <h2 id="question-title">{activeQuestion.clue}</h2>
            {gameMode === 'multi' && buzzedPlayerId === null && (
              <div className="dg-buzzer-stage"><p>BUZZ IN TO ANSWER</p><div>{activeCrew.map((participant) => <button key={participant.player.id} disabled={questionAttempts.includes(participant.player.id)} onClick={() => setBuzzedPlayerId(participant.player.id)}><span>{participant.player.name.slice(0, 1).toUpperCase()}</span><b>{participant.player.name}</b><small>{questionAttempts.includes(participant.player.id) ? 'LOCKED OUT' : 'BUZZ'}</small></button>)}</div></div>
            )}
            {(gameMode === 'single' || buzzedPlayerId !== null) && (
              <>
                {gameMode === 'multi' && <p className="dg-answering-pilot"><span /> {buzzedParticipant?.player.name} has control</p>}
                <div className="dg-choices">
                  {choices.map((choice, index) => {
                    const className = revealAnswer && choice === activeQuestion.answer ? 'is-answer' : selectedChoice && choice === selectedChoice ? 'is-picked-wrong' : '';
                    return <button key={choice} className={className} disabled={Boolean(selectedChoice)} onClick={() => chooseAnswer(choice)}><span>{String.fromCharCode(65 + index)}</span>{choice}</button>;
                  })}
                </div>
              </>
            )}
            {selectedChoice && revealAnswer && (
              <div className={`dg-explanation ${selectedChoice === activeQuestion.answer ? 'is-correct' : 'is-wrong'}`}>
                <strong>{selectedChoice === activeQuestion.answer ? (gameMode === 'multi' ? `${buzzedParticipant?.player.name} SCORES` : 'NICE FLYING') : (gameMode === 'multi' ? 'NO PILOT HAD IT' : 'CHECK THAT HEADING')}</strong>
                <p>{activeQuestion.explanation}</p>
                <button onClick={closeQuestion}>{answeredCount === 25 ? 'VIEW DEBRIEF' : 'BACK TO BOARD'} →</button>
              </div>
            )}
            {selectedChoice && !revealAnswer && (
              <div className="dg-explanation is-wrong"><strong>{buzzedParticipant?.player.name} missed it</strong><p>The clue is still live. Reopen the buzzers for the remaining pilots.</p><button onClick={reopenBuzzers}>REOPEN BUZZERS →</button></div>
            )}
          </div>
        </div>
      )}

      {showDebrief && (
        <div className="dg-modal" role="dialog" aria-modal="true" aria-labelledby="debrief-title">
          <div className="dg-debrief">
            <p className="dg-panel-label">POST-FLIGHT DEBRIEF</p>
            <h2 id="debrief-title">Flight complete.</h2>
            {gameMode === 'single' ? <><div className="dg-debrief__score"><strong>{score.toLocaleString()}</strong><span>POINTS</span></div><div className="dg-debrief__stats"><div><b>{correctCount}</b><span>Correct</span></div><div><b>{answeredCount - correctCount}</b><span>Review</span></div><div><b>{Math.round((correctCount / answeredCount) * 100)}%</b><span>Accuracy</span></div></div></> : (
              <div className="dg-match-results">{multiplayerStandings.map((participant, index) => { const stats = pilotStats[participant.player.id] || { score: 0, correct: 0, attempts: 0 }; return <div key={participant.player.id} className={index === 0 ? 'is-winner' : ''}><span>{index === 0 ? 'WINNER' : `#${index + 1}`}</span><strong>{participant.player.name}</strong><b>{stats.score.toLocaleString()} PT</b><small>{stats.correct} correct · {stats.attempts} buzzes</small></div>; })}</div>
            )}
            <p className="dg-save-message">{saveMessage}</p>
            <div className="dg-debrief__actions"><button onClick={() => selectTrack(GAME_TRACKS.find((item) => item.id === track.id)!)}>FLY AGAIN</button><button onClick={() => setTrack(null)}>CHANGE TRACK</button></div>
          </div>
        </div>
      )}
    </div>
  );
}

function DGameHeader({ player, onLogout, compact = false }: { player: Player; onLogout: () => void; compact?: boolean }) {
  return (
    <header className={`dg-header ${compact ? 'is-compact' : ''}`}>
      <Link to="/" className="dg-brand"><img src="/logo-darcy-v3.png" alt="" /><span><b>JEOPARDY</b><small>DARCY AVIATION</small></span></Link>
      <div className="dg-header__status"><span><i /> KDXR ONLINE</span><span>PILOT <b>{player.name}</b></span><button onClick={onLogout}>SIGN OUT</button></div>
    </header>
  );
}

function Leaderboard({ track, setTrack, leaders, playerName }: { track: GameTrackId; setTrack: (track: GameTrackId) => void; leaders: Leader[]; playerName: string }) {
  return (
    <section className="dg-leaderboard">
      <div className="dg-leaderboard__heading"><div><p className="dg-kicker"><span /> Flight-line standings</p><h2>Top of the pattern</h2></div><select value={track} onChange={(event) => setTrack(event.target.value as GameTrackId)} aria-label="Leaderboard track">{GAME_TRACKS.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></div>
      <div className="dg-leaderboard__rows">
        {leaders.length === 0 && <p className="dg-empty">No logged flights yet. Put the first score on the board.</p>}
        {leaders.slice(0, 8).map((leader, index) => <div key={leader.name} className={leader.name.toLowerCase() === playerName.toLowerCase() ? 'is-you' : ''}><span className="dg-rank">{String(index + 1).padStart(2, '0')}</span><strong>{leader.name}{leader.name.toLowerCase() === playerName.toLowerCase() && <small>YOU</small>}</strong><span>LVL {leader.level}</span><b>{leader.score.toLocaleString()}</b></div>)}
      </div>
    </section>
  );
}
