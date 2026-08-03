import type { GameQuestion, GameTrack } from './dGameQuestions';
import { createExpandedTrack } from './dGameExtraQuestions';
import { TOTAL_CATEGORY_COUNT } from './dGameCategoryExpansion';

export const TOTAL_QUESTION_COUNT = 7500;
export const QUESTIONS_PER_TRACK = 1875;
export { TOTAL_CATEGORY_COUNT };

const promptFrames: Array<(clue: string, variant: number) => string> = [
  (clue) => clue,
  (clue) => `Checkride oral: ${clue}`,
  (clue) => `Darcy Ground rapid-fire: ${clue}`,
  (clue) => `Preflight briefing question: ${clue}`,
  (clue) => `Knowledge check: ${clue}`,
  (clue) => `Your examiner asks: ${clue}`,
  (clue) => `Flight-room challenge: ${clue}`,
  (clue) => `Before engine start, answer this: ${clue}`,
  (clue) => `Scenario briefing: ${clue}`,
  (clue) => `Pilot decision point: ${clue}`,
  (clue) => `Dispatch desk asks: ${clue}`,
  (clue) => `Training flight warm-up: ${clue}`,
  (clue) => `On the oral exam, identify this: ${clue}`,
  (clue) => `A fellow pilot asks: ${clue}`,
  (clue) => `Cockpit knowledge callout: ${clue}`,
  (clue) => `Darcy Aviation challenge: ${clue}`,
  (clue) => `Before today’s flight: ${clue}`,
  (clue) => `Safety meeting question: ${clue}`,
  (clue) => `Instructor spot-check: ${clue}`,
  (clue) => `Cross-country briefing: ${clue}`,
  (clue) => `Hangar-talk test: ${clue}`,
  (clue) => `The chief pilot asks: ${clue}`,
  (clue) => `End-of-lesson review: ${clue}`,
  (clue) => `No-notes challenge: ${clue}`,
  (clue, variant) => `Question set ${String(variant + 1).padStart(2, '0')}: ${clue}`,
];

function expandQuestion(question: GameQuestion): GameQuestion[] {
  return promptFrames.map((frame, variant) => ({
    ...question,
    id: `${question.id}-v${String(variant + 1).padStart(2, '0')}`,
    clue: frame(question.clue, variant),
  }));
}

function randomItem<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

export function createMegaTrack(track: GameTrack): GameTrack {
  const expanded = createExpandedTrack(track);
  return {
    ...expanded,
    categories: expanded.categories.map((category) => ({
      ...category,
      questions: category.questions.flatMap(expandQuestion),
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
