import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ScreenContainer } from '../components/ScreenContainer';
import { StatCard } from '../components/StatCard';
import { useGameStore } from '../store/useGameStore';
import { useAppTheme } from '../hooks/useAppTheme';
import { formatElapsedTime, formatPercent } from '../utils/format';

export function StatsScreen() {
  const theme = useAppTheme();
  const stats = useGameStore(state => state.stats);
  const winRate = stats.gamesPlayed === 0 ? 0 : stats.gamesWon / stats.gamesPlayed;

  return (
    <ScreenContainer>
      <View
        style={[
          styles.hero,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
          },
        ]}>
        <Text style={[styles.heroTitle, { color: theme.colors.text }]}>Your Progress</Text>
        <Text style={[styles.heroCopy, { color: theme.colors.textMuted }]}>
          Track streaks, best runs, and how consistently you clear each difficulty.
        </Text>
      </View>
      <View style={styles.row}>
        <StatCard label="Games played" value={`${stats.gamesPlayed}`} />
        <StatCard label="Win rate" value={formatPercent(winRate)} />
      </View>
      <View style={styles.row}>
        <StatCard label="Current streak" value={`${stats.currentStreak}`} />
        <StatCard label="Daily clears" value={`${stats.dailyChallengeCompletions}`} />
      </View>

      <View
        style={[
          styles.section,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
          },
        ]}>
        <Text style={[styles.heading, { color: theme.colors.text }]}>Best Times</Text>
        <Text style={[styles.item, { color: theme.colors.textMuted }]}>
          Easy: {stats.bestTimes.easy ? formatElapsedTime(stats.bestTimes.easy) : '---'}
        </Text>
        <Text style={[styles.item, { color: theme.colors.textMuted }]}>
          Medium: {stats.bestTimes.medium ? formatElapsedTime(stats.bestTimes.medium) : '---'}
        </Text>
        <Text style={[styles.item, { color: theme.colors.textMuted }]}>
          Hard: {stats.bestTimes.hard ? formatElapsedTime(stats.bestTimes.hard) : '---'}
        </Text>
      </View>

      <View
        style={[
          styles.section,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
          },
        ]}>
        <Text style={[styles.heading, { color: theme.colors.text }]}>Wins by Difficulty</Text>
        <Text style={[styles.item, { color: theme.colors.textMuted }]}>
          Easy: {stats.winsByDifficulty.easy}
        </Text>
        <Text style={[styles.item, { color: theme.colors.textMuted }]}>
          Medium: {stats.winsByDifficulty.medium}
        </Text>
        <Text style={[styles.item, { color: theme.colors.textMuted }]}>
          Hard: {stats.winsByDifficulty.hard}
        </Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  hero: {
    borderRadius: 28,
    borderWidth: 1,
    padding: 20,
    gap: 8,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '900',
  },
  heroCopy: {
    fontSize: 15,
    lineHeight: 22,
  },
  section: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
    gap: 10,
  },
  heading: {
    fontSize: 18,
    fontWeight: '800',
  },
  item: {
    fontSize: 15,
  },
});
