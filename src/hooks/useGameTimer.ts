import { useEffect } from 'react';
import { useGameStore } from '../store/useGameStore';

export const useGameTimer = () => {
  const paused = useGameStore(state => state.currentGame?.paused ?? true);
  const completedAt = useGameStore(state => state.currentGame?.completedAt);
  const tick = useGameStore(state => state.tick);

  useEffect(() => {
    if (paused || completedAt) {
      return;
    }

    const interval = setInterval(() => {
      tick(1000);
    }, 1000);

    return () => clearInterval(interval);
  }, [completedAt, paused, tick]);
};
