import { Difficulty } from '../../types/sudoku';

export const GRID_SIZE = 9;
export const BOX_SIZE = 3;

export const DIFFICULTY_EMPTY_CELLS: Record<Difficulty, number> = {
  easy: 38,
  medium: 46,
  hard: 54,
};

export const MAX_MISTAKES = 3;

export const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;
