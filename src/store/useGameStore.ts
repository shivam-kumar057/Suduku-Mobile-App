import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import {
  DailyChallengeRecord,
  Difficulty,
  GameProgress,
  GameStats,
  MoveSnapshot,
  SudokuBoard,
  SudokuPuzzle,
} from '../types/sudoku';
import { MAX_MISTAKES } from '../utils/sudoku';
import { createDailyChallenge, generatePuzzle } from '../utils/sudoku';
import { checkCompletion, hydrateBoardConflicts } from '../utils/sudoku/validation';

type GameMode = 'standard' | 'daily';
type ThemeMode = 'system' | 'light' | 'dark';

interface SettingsState {
  themeMode: ThemeMode;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

interface CompletionSummary {
  difficulty: Difficulty;
  elapsedMs: number;
  isDailyChallenge: boolean;
}

interface GameState {
  currentGame: GameProgress | null;
  currentMode: GameMode;
  stats: GameStats;
  settings: SettingsState;
  dailyHistory: DailyChallengeRecord[];
  completionSummary: CompletionSummary | null;
  startNewGame: (difficulty: Difficulty) => void;
  startDailyGame: () => void;
  resumeGame: () => void;
  selectCell: (cellId: string) => void;
  setCellValue: (value: number | null) => 'noop' | 'blocked' | 'updated' | 'mistake' | 'completed';
  rewardMistakeChance: () => void;
  undo: () => void;
  redo: () => void;
  togglePause: () => void;
  tick: (deltaMs: number) => void;
  dismissCompletion: () => void;
  setThemeMode: (themeMode: ThemeMode) => void;
  toggleSound: () => void;
  toggleVibration: () => void;
  resetStats: () => void;
}

const defaultStats: GameStats = {
  gamesPlayed: 0,
  gamesWon: 0,
  currentStreak: 0,
  bestStreak: 0,
  totalTimePlayed: 0,
  dailyChallengeCompletions: 0,
  winsByDifficulty: {
    easy: 0,
    medium: 0,
    hard: 0,
  },
  bestTimes: {},
};

const buildGameProgress = (puzzle: SudokuPuzzle): GameProgress => ({
  puzzle,
  elapsedMs: 0,
  remainingMistakes: MAX_MISTAKES,
  selectedCellId: null,
  moves: [],
  undoneMoves: [],
  paused: false,
  startedAt: new Date().toISOString(),
});

const normalizeGameProgress = (
  game: (GameProgress & { remainingHints?: number }) | null,
): GameProgress | null => {
  if (!game) {
    return null;
  }

  return {
    ...game,
    remainingMistakes:
      game.remainingMistakes ?? game.remainingHints ?? MAX_MISTAKES,
  };
};

const updateBoardCell = (
  board: SudokuBoard,
  cellId: string,
  updater: (value: SudokuBoard[number]) => SudokuBoard[number],
) => board.map(cell => (cell.id === cellId ? updater(cell) : cell));

const findSelectedEditableCell = (
  game: GameProgress,
): SudokuBoard[number] | null => {
  if (!game.selectedCellId) {
    return null;
  }

  const cell = game.puzzle.board.find(entry => entry.id === game.selectedCellId);

  if (!cell || cell.isGiven) {
    return null;
  }

  return cell;
};

const applyMove = (game: GameProgress, move: MoveSnapshot) => {
  game.puzzle.board = hydrateBoardConflicts(
    updateBoardCell(game.puzzle.board, move.cellId, cell => ({
      ...cell,
      value: move.nextValue,
      notes: move.nextNotes,
      isHint: false,
    })),
  );
  game.moves = [...game.moves, move];
  game.undoneMoves = [];
};

const finalizeCompletion = (
  game: GameProgress,
  stats: GameStats,
  isDailyChallenge: boolean,
): CompletionSummary => {
  const difficulty = game.puzzle.difficulty;
  const nextBestTime = Math.min(
    stats.bestTimes[difficulty] ?? Number.MAX_SAFE_INTEGER,
    game.elapsedMs,
  );

  stats.gamesWon += 1;
  stats.currentStreak += 1;
  stats.bestStreak = Math.max(stats.bestStreak, stats.currentStreak);
  stats.winsByDifficulty[difficulty] += 1;
  stats.bestTimes[difficulty] = nextBestTime;
  stats.totalTimePlayed += game.elapsedMs;
  if (isDailyChallenge) {
    stats.dailyChallengeCompletions += 1;
  }

  game.completedAt = new Date().toISOString();

  return {
    difficulty,
    elapsedMs: game.elapsedMs,
    isDailyChallenge,
  };
};

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      currentGame: null,
      currentMode: 'standard',
      stats: defaultStats,
      dailyHistory: [],
      completionSummary: null,
      settings: {
        themeMode: 'system',
        soundEnabled: true,
        vibrationEnabled: true,
      },
      startNewGame: difficulty => {
        const puzzle = generatePuzzle(difficulty);

        set(state => ({
          currentGame: buildGameProgress(puzzle),
          currentMode: 'standard',
          completionSummary: null,
          stats: {
            ...state.stats,
            gamesPlayed: state.stats.gamesPlayed + 1,
          },
        }));
      },
      startDailyGame: () => {
        const puzzle = createDailyChallenge();
        const today = new Date().toISOString().slice(0, 10);

        set(state => ({
          currentGame: buildGameProgress(puzzle),
          currentMode: 'daily',
          completionSummary: null,
          stats: {
            ...state.stats,
            gamesPlayed: state.stats.gamesPlayed + 1,
          },
          dailyHistory: state.dailyHistory.some(entry => entry.date === today)
            ? state.dailyHistory
            : [
                ...state.dailyHistory,
                {
                  date: today,
                  puzzleId: puzzle.id,
                  completed: false,
                },
              ],
        }));
      },
      resumeGame: () => {
        const currentGame = normalizeGameProgress(get().currentGame);
        if (!currentGame) {
          return;
        }

        set({
          currentGame: {
            ...currentGame,
            paused: false,
          },
        });
      },
      selectCell: cellId => {
        set(state =>
          normalizeGameProgress(state.currentGame)
            ? {
                currentGame: {
                  ...normalizeGameProgress(state.currentGame)!,
                  selectedCellId: cellId,
                },
              }
            : state,
        );
      },
      setCellValue: value => {
        const state = get();
        const game = normalizeGameProgress(state.currentGame);

        if (!game || game.paused || game.completedAt) {
          return 'noop';
        }

        const selectedCell = findSelectedEditableCell(game);

        if (!selectedCell) {
          return 'noop';
        }

        if (value !== null && game.remainingMistakes <= 0) {
          return 'blocked';
        }

        const move: MoveSnapshot = {
          cellId: selectedCell.id,
          previousValue: selectedCell.value,
          nextValue: value,
          previousNotes: selectedCell.notes,
          nextNotes: {},
          timestamp: Date.now(),
        };

        const nextGame: GameProgress = {
          ...game,
          puzzle: {
            ...game.puzzle,
            board: [...game.puzzle.board],
          },
          moves: [...game.moves],
          undoneMoves: [],
        };

        applyMove(nextGame, move);
        let result: 'updated' | 'mistake' | 'completed' = 'updated';

        if (value !== null && value !== selectedCell.solution) {
          nextGame.remainingMistakes = Math.max(0, game.remainingMistakes - 1);
          result = 'mistake';
        }

        const isComplete = checkCompletion(nextGame.puzzle.board);

        set(prev => {
          const nextStats = { ...prev.stats, bestTimes: { ...prev.stats.bestTimes }, winsByDifficulty: { ...prev.stats.winsByDifficulty } };
          const nextDailyHistory = [...prev.dailyHistory];
          let completionSummary = prev.completionSummary;

          if (isComplete) {
            completionSummary = finalizeCompletion(
              nextGame,
              nextStats,
              prev.currentMode === 'daily',
            );

            if (prev.currentMode === 'daily') {
              const today = new Date().toISOString().slice(0, 10);
              const recordIndex = nextDailyHistory.findIndex(item => item.date === today);

              if (recordIndex >= 0) {
                nextDailyHistory[recordIndex] = {
                  ...nextDailyHistory[recordIndex],
                  completed: true,
                  elapsedMs: nextGame.elapsedMs,
                };
              }
            }
          }

          return {
            currentGame: nextGame,
            stats: nextStats,
            dailyHistory: nextDailyHistory,
            completionSummary,
          };
        });
        return isComplete ? 'completed' : result;
      },
      rewardMistakeChance: () => {
        set(state =>
          normalizeGameProgress(state.currentGame)
            ? {
                currentGame: {
                  ...normalizeGameProgress(state.currentGame)!,
                  remainingMistakes:
                    normalizeGameProgress(state.currentGame)!.remainingMistakes + 1,
                },
              }
            : state,
        );
      },
      undo: () => {
        const game = get().currentGame;

        if (!game || game.moves.length === 0 || game.completedAt) {
          return;
        }

        const lastMove = game.moves[game.moves.length - 1];
        const restoredBoard = hydrateBoardConflicts(
          updateBoardCell(game.puzzle.board, lastMove.cellId, cell => ({
            ...cell,
            value: lastMove.previousValue,
            notes: lastMove.previousNotes,
            isHint: false,
          })),
        );

        set({
          currentGame: {
            ...game,
            puzzle: {
              ...game.puzzle,
              board: restoredBoard,
            },
            moves: game.moves.slice(0, -1),
            undoneMoves: [...game.undoneMoves, lastMove],
          },
        });
      },
      redo: () => {
        const game = get().currentGame;

        if (!game || game.undoneMoves.length === 0 || game.completedAt) {
          return;
        }

        const move = game.undoneMoves[game.undoneMoves.length - 1];
        const nextGame: GameProgress = {
          ...game,
          puzzle: {
            ...game.puzzle,
            board: [...game.puzzle.board],
          },
          moves: [...game.moves],
          undoneMoves: game.undoneMoves.slice(0, -1),
        };

        applyMove(nextGame, move);

        const isComplete = checkCompletion(nextGame.puzzle.board);

        set(prev => {
          const nextStats = { ...prev.stats, bestTimes: { ...prev.stats.bestTimes }, winsByDifficulty: { ...prev.stats.winsByDifficulty } };
          const nextDailyHistory = [...prev.dailyHistory];
          let completionSummary = prev.completionSummary;

          if (isComplete) {
            completionSummary = finalizeCompletion(
              nextGame,
              nextStats,
              prev.currentMode === 'daily',
            );

            if (prev.currentMode === 'daily') {
              const today = new Date().toISOString().slice(0, 10);
              const recordIndex = nextDailyHistory.findIndex(item => item.date === today);

              if (recordIndex >= 0) {
                nextDailyHistory[recordIndex] = {
                  ...nextDailyHistory[recordIndex],
                  completed: true,
                  elapsedMs: nextGame.elapsedMs,
                };
              }
            }
          }

          return {
            currentGame: nextGame,
            stats: nextStats,
            dailyHistory: nextDailyHistory,
            completionSummary,
          };
        });
      },
      togglePause: () => {
        set(state =>
          normalizeGameProgress(state.currentGame)
            ? {
                currentGame: {
                  ...normalizeGameProgress(state.currentGame)!,
                  paused: !normalizeGameProgress(state.currentGame)!.paused,
                },
              }
            : state,
        );
      },
      tick: deltaMs => {
        set(state =>
          normalizeGameProgress(state.currentGame) &&
          !normalizeGameProgress(state.currentGame)!.paused &&
          !normalizeGameProgress(state.currentGame)!.completedAt
            ? {
                currentGame: {
                  ...normalizeGameProgress(state.currentGame)!,
                  elapsedMs:
                    normalizeGameProgress(state.currentGame)!.elapsedMs + deltaMs,
                },
              }
            : state,
        );
      },
      dismissCompletion: () => set({ completionSummary: null }),
      setThemeMode: themeMode =>
        set(state => ({
          settings: {
            ...state.settings,
            themeMode,
          },
        })),
      toggleSound: () =>
        set(state => ({
          settings: {
            ...state.settings,
            soundEnabled: !state.settings.soundEnabled,
          },
        })),
      toggleVibration: () =>
        set(state => ({
          settings: {
            ...state.settings,
            vibrationEnabled: !state.settings.vibrationEnabled,
          },
        })),
      resetStats: () =>
        set({
          stats: defaultStats,
          dailyHistory: [],
        }),
    }),
    {
      name: 'sudoku-master-store',
      storage: createJSONStorage(() => AsyncStorage),
      merge: (persistedState, currentState) => {
        const typedPersistedState = persistedState as Partial<GameState> & {
          currentGame?: GameProgress & { remainingHints?: number };
        };

        return {
          ...currentState,
          ...typedPersistedState,
          currentGame: normalizeGameProgress(typedPersistedState.currentGame ?? null),
        };
      },
      partialize: state => ({
        currentGame: state.currentGame,
        currentMode: state.currentMode,
        stats: state.stats,
        settings: state.settings,
        dailyHistory: state.dailyHistory,
      }),
    },
  ),
);
