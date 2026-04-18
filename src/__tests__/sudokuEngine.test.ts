import {
  createDailyChallenge,
  generatePuzzle,
  generateSolvedBoard,
  solveBoard,
} from '../utils/sudoku';
import { hydrateBoardConflicts } from '../utils/sudoku/validation';

describe('Sudoku engine', () => {
  it('creates a fully solved valid board', () => {
    const board = generateSolvedBoard('test-seed');

    expect(board).toHaveLength(9);
    expect(board.every(row => row.length === 9)).toBe(true);
    expect(board.every(row => new Set(row).size === 9)).toBe(true);
  });

  it('solves a generated puzzle back to a completed board', () => {
    const puzzle = generatePuzzle('medium', 'solver-seed');
    const matrix = Array.from({ length: 9 }, (_rowEntry, row) =>
      Array.from({ length: 9 }, (_colEntry, col) => {
        const cell = puzzle.board.find(entry => entry.row === row && entry.col === col);
        return cell?.value ?? 0;
      }),
    );
    const solved = solveBoard(matrix);

    expect(solved).not.toBeNull();
    expect(solved).toEqual(puzzle.solution);
  });

  it('creates deterministic daily challenges for the same date', () => {
    const date = new Date('2026-04-17T00:00:00.000Z');
    const first = createDailyChallenge(date);
    const second = createDailyChallenge(date);

    expect(first.id).toBe(second.id);
    expect(first.solution).toEqual(second.solution);
  });

  it('flags incorrect user-entered values even without row or column duplicates', () => {
    const puzzle = generatePuzzle('easy', 'validation-seed');
    const editableCell = puzzle.board.find(cell => !cell.isGiven);

    expect(editableCell).toBeDefined();

    const wrongValue = editableCell?.solution === 9 ? 8 : 9;
    const boardWithWrongEntry = puzzle.board.map(cell =>
      cell.id === editableCell?.id
        ? {
            ...cell,
            value: wrongValue,
          }
        : cell,
    );

    const hydrated = hydrateBoardConflicts(boardWithWrongEntry);
    const updatedCell = hydrated.find(cell => cell.id === editableCell?.id);

    expect(updatedCell?.hasConflict).toBe(true);
  });
});
