import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Difficulty } from '../types/sudoku';
import { useAppTheme } from '../hooks/useAppTheme';
import { formatElapsedTime } from '../utils/format';

interface Props {
  elapsedMs: number;
  difficulty: Difficulty;
  mistakesRemaining: number;
  paused: boolean;
}

export function GameHeader({
  elapsedMs,
  difficulty,
  mistakesRemaining,
  paused,
}: Props) {
  const theme = useAppTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          shadowColor: theme.colors.primary,
        },
      ]}>
      <View style={styles.metric}>
        <Text style={[styles.label, { color: theme.colors.textMuted }]}>Mode</Text>
        <Text style={[styles.value, { color: theme.colors.text }]}>
          {difficulty.toUpperCase()}
        </Text>
      </View>
      <View style={styles.metric}>
        <Text style={[styles.label, { color: theme.colors.textMuted }]}>Timer</Text>
        <Text style={[styles.value, { color: theme.colors.text }]}>
          {paused ? 'Paused' : formatElapsedTime(elapsedMs)}
        </Text>
      </View>
      <View style={styles.metric}>
        <Text style={[styles.label, { color: theme.colors.textMuted }]}>Chances</Text>
        <Text style={[styles.value, { color: theme.colors.text }]}>{mistakesRemaining}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 14 },
    shadowRadius: 24,
    elevation: 4,
  },
  metric: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  value: {
    fontSize: 20,
    fontWeight: '900',
  },
});
