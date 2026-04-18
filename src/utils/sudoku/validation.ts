import { SudokuBoard } from '../../types/sudoku';
import { boardToMatrix } from './generator';
import { getBoxIndex, isPlacementValid, isBoardSolved } from './solver';

export const getConflictingCellIds = (board: SudokuBoard): Set<string> => {
  const matrix = boardToMatrix(board);
  const conflicts = new Set<string>();

  for (const cell of board) {
    if (!cell.value) {
      continue;
    }

    if (!isPlacementValid(matrix, cell.row, cell.col, cell.value)) {
      conflicts.add(cell.id);
    }
  }

  return conflicts;
};

export const getIncorrectCellIds = (board: SudokuBoard): Set<string> => {
  const incorrect = new Set<string>();

  for (const cell of board) {
    if (!cell.value || cell.isGiven) {
      continue;
    }

    if (cell.value !== cell.solution) {
      incorrect.add(cell.id);
    }
  }

  return incorrect;
};

export const hydrateBoardConflicts = (board: SudokuBoard): SudokuBoard => {
  const conflicts = getConflictingCellIds(board);
  const incorrect = getIncorrectCellIds(board);

  return board.map(cell => ({
    ...cell,
    hasConflict: conflicts.has(cell.id) || incorrect.has(cell.id),
  }));
};

export const getRelatedCellIds = (
  board: SudokuBoard,
  selectedCellId: string | null,
): Set<string> => {
  if (!selectedCellId) {
    return new Set();
  }

  const selected = board.find(cell => cell.id === selectedCellId);

  if (!selected) {
    return new Set();
  }

  return new Set(
    board
      .filter(
        cell =>
          cell.row === selected.row ||
          cell.col === selected.col ||
          getBoxIndex(cell.row, cell.col) === selected.box,
      )
      .map(cell => cell.id),
  );
};

export const checkCompletion = (board: SudokuBoard): boolean =>
  isBoardSolved(boardToMatrix(board));
