import React, { useEffect, useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { ScreenContainer } from '../components/ScreenContainer';
import { PrimaryButton } from '../components/PrimaryButton';
import { useAppTheme } from '../hooks/useAppTheme';
import { useAuth } from '../context/AuthContext';
import { getSocket } from '../services/socket';
import { GameResultPayload } from '../types/multiplayer';

type Props = NativeStackScreenProps<RootStackParamList, 'OnlineGame'>;

const BOARD = 9;

function clone(grid: number[][]) {
  return grid.map(row => [...row]);
}

function formatClock(seconds: number) {
  const m = String(Math.floor(seconds / 60)).padStart(2, '0');
  const s = String(seconds % 60).padStart(2, '0');
  return `${m}:${s}`;
}

export function OnlineGameScreen({ navigation, route }: Props) {
  const { matchId, puzzle, opponent } = route.params;
  const theme = useAppTheme();
  const { user } = useAuth();

  const [grid, setGrid] = useState<number[][]>(() => clone(puzzle));
  const [selected, setSelected] = useState<{ row: number; col: number } | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const editable = useMemo(
    () => puzzle.map(row => row.map(value => value === 0)),
    [puzzle],
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const onResult = (result: GameResultPayload) => {
      if (result.matchId !== matchId) return;
      if (result.status === 'retry') {
        Alert.alert('Incorrect', result.message || 'Try again');
        return;
      }

      navigation.replace('Result', {
        matchId,
        winnerId: result.winnerId,
        stats: result.stats,
      });
    };

    socket.on('game_result', onResult);
    return () => {
      socket.off('game_result', onResult);
    };
  }, [matchId, navigation]);

  const setValue = (value: number) => {
    if (!selected) return;
    const { row, col } = selected;
    if (!editable[row][col]) return;

    // Count local rule violations as mistakes for gameplay feel.
    let invalid = false;
    for (let i = 0; i < BOARD; i += 1) {
      if (i !== col && grid[row][i] === value) invalid = true;
      if (i !== row && grid[i][col] === value) invalid = true;
    }

    setGrid(prev => {
      const next = clone(prev);
      next[row][col] = value;
      return next;
    });
    if (invalid) setMistakes(prev => prev + 1);
  };

  const submitSolution = () => {
    if (!user?._id || submitting) return;
    setSubmitting(true);
    getSocket()?.emit('submit_solution', {
      matchId,
      userId: user._id,
      solutionGrid: grid,
      elapsedSeconds: elapsed,
      mistakes,
    });
    setTimeout(() => setSubmitting(false), 800);
  };

  return (
    <ScreenContainer>
      <View
        style={[
          styles.topCard,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
          },
        ]}>
        <Text style={[styles.topTitle, { color: theme.colors.text }]}>Opponent: {opponent.name}</Text>
        <Text style={[styles.topSub, { color: theme.colors.textMuted }]}>
          Time {formatClock(elapsed)} • Mistakes {mistakes}
        </Text>
      </View>

      <View style={styles.grid}>
        {grid.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map((value, colIndex) => {
              const isSelected = selected?.row === rowIndex && selected?.col === colIndex;
              const isEditable = editable[rowIndex][colIndex];
              return (
                <PrimaryButton
                  key={`${rowIndex}-${colIndex}`}
                  label={value === 0 ? '' : `${value}`}
                  variant={isSelected ? 'primary' : isEditable ? 'secondary' : 'ghost'}
                  onPress={() => setSelected({ row: rowIndex, col: colIndex })}
                  minWidth={34}
                />
              );
            })}
          </View>
        ))}
      </View>

      <View style={styles.numberPad}>
        {Array.from({ length: 9 }, (_, i) => i + 1).map(num => (
          <PrimaryButton key={num} label={`${num}`} onPress={() => setValue(num)} minWidth={66} />
        ))}
      </View>

      <PrimaryButton
        label={submitting ? 'Submitting...' : 'Submit Solution'}
        onPress={submitSolution}
        fullWidth
        disabled={submitting}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  topCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    gap: 6,
  },
  topTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  topSub: {
    fontSize: 14,
    fontWeight: '600',
  },
  grid: {
    gap: 6,
  },
  row: {
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
  },
  numberPad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
});

