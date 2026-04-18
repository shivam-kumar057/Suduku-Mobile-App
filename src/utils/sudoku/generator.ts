import { Difficulty, SudokuBoard, SudokuCellData, SudokuPuzzle } from '../../types/sudoku';
import { BOX_SIZE, DIFFICULTY_EMPTY_CELLS, DIGITS, GRID_SIZE } from './constants';
import { countSolutions, MatrixBoard, solveBoard } from './solver';

/* eslint-disable no-bitwise */
const mulberry32 = (seed: number) => {
  let t = seed;

  return () => {
    t += 0x6d2b79f5;
    let next = Math.imul(t ^ (t >>> 15), t | 1);
    next ^= next + Math.imul(next ^ (next >>> 7), next | 61);
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
  };
};

export const stringToSeed = (value: string) =>
  value.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

const shuffle = <T>(items: T[], random: () => number): T[] => {
  const copy = [...items];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1));
    [copy[index], copy[target]] = [copy[target], copy[index]];
  }

  return copy;
};

const createEmptyMatrix = (): MatrixBoard =>
  Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(0));

const fillDiagonalBoxes = (board: MatrixBoard, random: () => number) => {
  for (let box = 0; box < BOX_SIZE; box += 1) {
    const values = shuffle([...DIGITS], random);
    const start = box * BOX_SIZE;
    let pointer = 0;

    for (let row = start; row < start + BOX_SIZE; row += 1) {
      for (let col = start; col < start + BOX_SIZE; col += 1) {
        board[row][col] = values[pointer];
        pointer += 1;
      }
    }
  }
};

export const generateSolvedBoard = (seed = `${Date.now()}`): MatrixBoard => {
  const board = createEmptyMatrix();
  const random = mulberry32(stringToSeed(seed));

  fillDiagonalBoxes(board, random);

  const solved = solveBoard(board);

  if (!solved) {
    throw new Error('Unable to generate solved Sudoku board.');
  }

  return solved;
};

const removeValuesForDifficulty = (
  solution: MatrixBoard,
  difficulty: Difficulty,
  random: () => number,
): MatrixBoard => {
  const puzzle = solution.map(row => [...row]);
  const positions = shuffle(
    Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, index) => index),
    random,
  );
  let removals = DIFFICULTY_EMPTY_CELLS[difficulty];

  for (const position of positions) {
    if (removals === 0) {
      break;
    }

    const row = Math.floor(position / GRID_SIZE);
    const col = position % GRID_SIZE;
    const existing = puzzle[row][col];

    if (existing === 0) {
      continue;
    }

    puzzle[row][col] = 0;

    if (countSolutions(puzzle, 2) !== 1) {
      puzzle[row][col] = existing;
      continue;
    }

    removals -= 1;
  }

  return puzzle;
};

export const matrixToBoard = (
  puzzle: MatrixBoard,
  solution: MatrixBoard,
): SudokuBoard =>
  puzzle.flatMap((rowValues, row) =>
    rowValues.map<SudokuCellData>((value, col) => ({
      id: `${row}-${col}`,
      row,
      col,
      box: Math.floor(row / BOX_SIZE) * BOX_SIZE + Math.floor(col / BOX_SIZE),
      value: value === 0 ? null : value,
      solution: solution[row][col],
      isGiven: value !== 0,
      notes: {},
      hasConflict: false,
      isHint: false,
    })),
  );

export const boardToMatrix = (board: SudokuBoard): MatrixBoard =>
  Array.from({ length: GRID_SIZE }, (_rowEntry, row) =>
    Array.from({ length: GRID_SIZE }, (_colEntry, col) => {
      const cell = board.find(entry => entry.row === row && entry.col === col);
      return cell?.value ?? 0;
    }),
  );

export const generatePuzzle = (
  difficulty: Difficulty,
  seed = `${Date.now()}`,
): SudokuPuzzle => {
  const random = mulberry32(stringToSeed(seed));
  const solution = generateSolvedBoard(seed);
  const matrix = removeValuesForDifficulty(solution, difficulty, random);

  return {
    id: `${difficulty}-${seed}`,
    difficulty,
    board: matrixToBoard(matrix, solution),
    solution,
    createdAt: new Date().toISOString(),
    seed,
  };
};
