import { BOX_SIZE, DIGITS, GRID_SIZE } from './constants';

export type MatrixBoard = number[][];

const cloneBoard = (board: MatrixBoard): MatrixBoard =>
  board.map(row => [...row]);

export const getBoxIndex = (row: number, col: number) =>
  Math.floor(row / BOX_SIZE) * BOX_SIZE + Math.floor(col / BOX_SIZE);

export const isPlacementValid = (
  board: MatrixBoard,
  row: number,
  col: number,
  value: number,
): boolean => {
  for (let i = 0; i < GRID_SIZE; i += 1) {
    if (board[row][i] === value && i !== col) {
      return false;
    }

    if (board[i][col] === value && i !== row) {
      return false;
    }
  }

  const startRow = Math.floor(row / BOX_SIZE) * BOX_SIZE;
  const startCol = Math.floor(col / BOX_SIZE) * BOX_SIZE;

  for (let r = startRow; r < startRow + BOX_SIZE; r += 1) {
    for (let c = startCol; c < startCol + BOX_SIZE; c += 1) {
      if (board[r][c] === value && (r !== row || c !== col)) {
        return false;
      }
    }
  }

  return true;
};

export const findEmptyCell = (
  board: MatrixBoard,
): { row: number; col: number } | null => {
  let bestCandidate: { row: number; col: number; options: number[] } | null =
    null;

  for (let row = 0; row < GRID_SIZE; row += 1) {
    for (let col = 0; col < GRID_SIZE; col += 1) {
      if (board[row][col] !== 0) {
        continue;
      }

      const options = DIGITS.filter(value =>
        isPlacementValid(board, row, col, value),
      );

      if (options.length === 0) {
        return { row, col };
      }

      if (!bestCandidate || options.length < bestCandidate.options.length) {
        bestCandidate = { row, col, options };
      }
    }
  }

  return bestCandidate
    ? { row: bestCandidate.row, col: bestCandidate.col }
    : null;
};

export const solveBoard = (board: MatrixBoard): MatrixBoard | null => {
  const workingBoard = cloneBoard(board);

  const solve = (): boolean => {
    const next = findEmptyCell(workingBoard);

    if (!next) {
      return true;
    }

    const { row, col } = next;

    for (const value of DIGITS) {
      if (!isPlacementValid(workingBoard, row, col, value)) {
        continue;
      }

      workingBoard[row][col] = value;

      if (solve()) {
        return true;
      }

      workingBoard[row][col] = 0;
    }

    return false;
  };

  return solve() ? workingBoard : null;
};

export const countSolutions = (
  board: MatrixBoard,
  limit = 2,
): number => {
  const workingBoard = cloneBoard(board);
  let solutions = 0;

  const search = () => {
    if (solutions >= limit) {
      return;
    }

    const next = findEmptyCell(workingBoard);

    if (!next) {
      solutions += 1;
      return;
    }

    const { row, col } = next;

    for (const value of DIGITS) {
      if (!isPlacementValid(workingBoard, row, col, value)) {
        continue;
      }

      workingBoard[row][col] = value;
      search();
      workingBoard[row][col] = 0;
    }
  };

  search();
  return solutions;
};

export const isBoardSolved = (board: MatrixBoard): boolean => {
  for (let row = 0; row < GRID_SIZE; row += 1) {
    for (let col = 0; col < GRID_SIZE; col += 1) {
      const value = board[row][col];

      if (value === 0 || !isPlacementValid(board, row, col, value)) {
        return false;
      }
    }
  }

  return true;
};
