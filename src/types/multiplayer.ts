export interface AuthUser {
  _id: string;
  name: string;
  deviceId: string;
  coins: number;
  streak: number;
  rating: number;
  wins: number;
  losses: number;
}

export interface MatchFoundPayload {
  matchId: string;
  difficulty: 'easy' | 'medium' | 'hard';
  puzzle: number[][];
  startedAt: string;
  opponent: {
    userId: string;
    name: string;
    rating: number;
  };
}

export interface GameResultPayload {
  success: boolean;
  matchId: string;
  winnerId: string;
  stats: Array<{
    userId: string;
    name: string;
    elapsedSeconds: number | null;
    mistakes: number;
    isCorrect: boolean;
  }>;
  message?: string;
  status?: 'retry';
}

