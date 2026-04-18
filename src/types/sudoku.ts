export type Difficulty = 'easy' | 'medium' | 'hard';

export type CellValue = number | null;

export interface CellNotes {
  [key: number]: boolean;
}

export interface SudokuCellData {
  id: string;
  row: number;
  col: number;
  box: number;
  value: CellValue;
  solution: number;
  isGiven: boolean;
  notes: CellNotes;
  hasConflict: boolean;
  isHint: boolean;
}

export type SudokuBoard = SudokuCellData[];

export interface SudokuPuzzle {
  id: string;
  difficulty: Difficulty;
  board: SudokuBoard;
  solution: number[][];
  createdAt: string;
  seed: string;
}

export interface MoveSnapshot {
  cellId: string;
  previousValue: CellValue;
  nextValue: CellValue;
  previousNotes: CellNotes;
  nextNotes: CellNotes;
  timestamp: number;
}

export interface GameStats {
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  bestStreak: number;
  totalTimePlayed: number;
  winsByDifficulty: Record<Difficulty, number>;
  bestTimes: Partial<Record<Difficulty, number>>;
  dailyChallengeCompletions: number;
}

export interface GameProgress {
  puzzle: SudokuPuzzle;
  elapsedMs: number;
  remainingMistakes: number;
  selectedCellId: string | null;
  moves: MoveSnapshot[];
  undoneMoves: MoveSnapshot[];
  paused: boolean;
  startedAt: string;
  completedAt?: string;
}

export interface DailyChallengeRecord {
  date: string;
  puzzleId: string;
  completed: boolean;
  elapsedMs?: number;
}
