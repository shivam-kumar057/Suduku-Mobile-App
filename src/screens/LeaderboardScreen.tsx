import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ScreenContainer } from '../components/ScreenContainer';
import { getGlobalLeaderboard } from '../services/api';
import { useAppTheme } from '../hooks/useAppTheme';

interface Entry {
  userId: string;
  name: string;
  score: number;
  rank: number;
  rating: number;
  winRate: number;
}

export function LeaderboardScreen() {
  const theme = useAppTheme();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getGlobalLeaderboard()
      .then(data => {
        if (mounted) setEntries(data.entries);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <ScreenContainer>
      <Text style={[styles.title, { color: theme.colors.text }]}>Global Leaderboard</Text>
      <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>
        Ranking based on win rate, speed, and rating.
      </Text>
      {loading ? <Text style={{ color: theme.colors.textMuted }}>Loading...</Text> : null}
      {entries.slice(0, 20).map(entry => (
        <View
          key={entry.userId}
          style={[
            styles.row,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}>
          <Text style={[styles.rank, { color: theme.colors.text }]}>#{entry.rank}</Text>
          <View style={styles.nameWrap}>
            <Text style={[styles.name, { color: theme.colors.text }]}>{entry.name}</Text>
            <Text style={[styles.meta, { color: theme.colors.textMuted }]}>
              Rating {entry.rating} • Win rate {(entry.winRate * 100).toFixed(1)}%
            </Text>
          </View>
          <Text style={[styles.score, { color: theme.colors.primary }]}>{entry.score}</Text>
        </View>
      ))}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 30,
    fontWeight: '900',
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
  },
  row: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  rank: {
    fontSize: 17,
    fontWeight: '800',
    width: 42,
  },
  nameWrap: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
  },
  meta: {
    fontSize: 12,
    marginTop: 2,
  },
  score: {
    fontSize: 16,
    fontWeight: '900',
  },
});

