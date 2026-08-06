import type { GameQuestion, GameTrack } from './dGameQuestions';
import { createExpandedTrack } from './dGameExtraQuestions';
import { TOTAL_CATEGORY_COUNT } from './dGameCategoryExpansion';

export const TOTAL_QUESTION_COUNT = 7500;
export const QUESTIONS_PER_TRACK = 1875;
export { TOTAL_CATEGORY_COUNT };

const challengeFrames = [
  'Checkride oral', 'Dispatch release', 'Cross-country brief', 'Diversion review', 'Stage-check oral',
  'Weather-room challenge', 'Before-start brief', 'Systems cross-check', 'Risk-management review', 'Chief-pilot spot check',
  'IFR release review', 'Post-flight debrief', 'Scenario evaluation', 'Cockpit decision gate', 'Line-check challenge',
  'Safety meeting', 'No-notes oral', 'Abnormal-operations brief', 'Preflight decision', 'Training-room challenge',
  'Operational cross-check', 'Crew briefing', 'Examiner follow-up', 'Go/no-go review', 'Darcy pilot challenge',
] as const;

function withoutFinalPeriod(text: string) {
  return text.trim().replace(/[.?!]+$/, '');
}

function pairedAnswer(first: string, second: string) {
  return `A: ${first}  /  B: ${second}`;
}

function maskAnswer(explanation: string, answer: string) {
  const escapedAnswer = answer.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const stopWords = new Set(['and', 'the', 'this', 'that', 'with', 'from', 'into', 'only', 'about', 'your']);
  const answerTokens = (answer.match(/[A-Za-z0-9]+/g) || [])
    .filter((token) => (token.length >= 3 || /^\d/.test(token)) && !stopWords.has(token.toLowerCase()));
  return answerTokens.reduce(
    (masked, token) => masked.replace(new RegExp(`\\b${token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi'), '_____'),
    explanation.replace(new RegExp(`\\b${escapedAnswer}\\b`, 'gi'), 'the correct response'),
  );
}

function expandQuestion(question: GameQuestion, partnerQuestions: GameQuestion[], anchorIndex: number): GameQuestion[] {
  return challengeFrames.map((frame, variant) => {
    const id = `${question.id}-v${String(variant + 1).padStart(2, '0')}`;

    // Three of the 25 variants are two-part cross-checks. Most of the bank
    // remains a single aviation question, with some clues inverted into an
    // explanation-based oral to keep the rhythm and difficulty varied.
    const isPairedChallenge = variant % 8 === 7;
    if (!isPairedChallenge) {
      const isExplanationChallenge = variant % 3 === 1;
      return {
        ...question,
        id,
        clue: isExplanationChallenge
          ? `${frame}: ${maskAnswer(question.explanation, question.answer)} Which response identifies the concept, action, or limitation being described?`
          : `${frame}: ${question.clue}`,
      };
    }

    const partner = partnerQuestions[(anchorIndex + 1 + variant * 7) % partnerQuestions.length];
    const firstWrong = question.choices[(variant % (question.choices.length - 1)) + 1];
    const secondWrong = partner.choices[((variant + 1) % (partner.choices.length - 1)) + 1];
    const alternateFirstWrong = question.choices[((variant + 1) % (question.choices.length - 1)) + 1];
    const alternateSecondWrong = partner.choices[((variant + 2) % (partner.choices.length - 1)) + 1];
    const answer = pairedAnswer(question.answer, partner.answer);

    return {
      id,
      value: question.value,
      clue: `${frame}: resolve both items before choosing. A — ${withoutFinalPeriod(question.clue)}. B — ${withoutFinalPeriod(partner.clue)}. Which paired response is fully correct?`,
      answer,
      choices: [
        answer,
        pairedAnswer(firstWrong, partner.answer),
        pairedAnswer(question.answer, secondWrong),
        pairedAnswer(alternateFirstWrong, alternateSecondWrong),
      ],
      explanation: `A — ${question.explanation} B — ${partner.explanation}`,
    };
  });
}

function randomItem<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

export function createMegaTrack(track: GameTrack): GameTrack {
  const expanded = createExpandedTrack(track);
  const partnerQuestions = expanded.categories.flatMap((category) => category.questions);
  const anchorIndexes = new Map(partnerQuestions.map((question, index) => [question.id, index]));
  return {
    ...expanded,
    categories: expanded.categories.map((category) => ({
      ...category,
      questions: category.questions.flatMap((question) => expandQuestion(question, partnerQuestions, anchorIndexes.get(question.id) || 0)),
    })),
  };
}

export function createUnseenFirstBoard(track: GameTrack, seenQuestionIds: Set<string>) {
  const megaTrack = createMegaTrack(track);
  const selectedIds: string[] = [];
  const selectedCategories = megaTrack.categories
    .map((category) => ({
      category,
      seenCount: category.questions.reduce((count, question) => count + (seenQuestionIds.has(question.id) ? 1 : 0), 0),
      tieBreaker: Math.random(),
    }))
    .sort((a, b) => a.seenCount - b.seenCount || a.tieBreaker - b.tieBreaker)
    .slice(0, 5)
    .map(({ category }) => category);
  const board: GameTrack = {
    ...megaTrack,
    categories: selectedCategories.map((category) => ({
      ...category,
      questions: [100, 200, 300, 400, 500].map((value) => {
        const tier = category.questions.filter((question) => question.value === value);
        const unseen = tier.filter((question) => !seenQuestionIds.has(question.id));
        const selected = randomItem(unseen.length ? unseen : tier);
        selectedIds.push(selected.id);
        return selected;
      }),
    })),
  };
  return { board, selectedIds };
}
