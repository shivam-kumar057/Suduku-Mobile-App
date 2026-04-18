import { Difficulty, SudokuPuzzle } from '../../types/sudoku';
import { generatePuzzle } from './generator';

export const getDailyChallengeSeed = (date = new Date()): string => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');

  return `${year}-${month}-${day}`;
};

export const getDailyChallengeDifficulty = (date = new Date()): Difficulty => {
  const day = date.getDate();

  if (day % 3 === 0) {
    return 'hard';
  }

  if (day % 2 === 0) {
    return 'medium';
  }

  return 'easy';
};

export const createDailyChallenge = (date = new Date()): SudokuPuzzle => {
  const seed = `daily-${getDailyChallengeSeed(date)}`;
  const difficulty = getDailyChallengeDifficulty(date);

  return generatePuzzle(difficulty, seed);
};
