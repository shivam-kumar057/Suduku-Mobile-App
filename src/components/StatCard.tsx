import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '../hooks/useAppTheme';

interface Props {
  label: string;
  value: string;
}

export function StatCard({ label, value }: Props) {
  const theme = useAppTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          shadowColor: theme.colors.primary,
        },
      ]}>
      <View style={styles.headerRow}>
        <Text
          style={[
            styles.topLabel,
            {
              color: theme.colors.textMuted,
            },
          ]}>
          {label}
        </Text>
        <View
          style={[
            styles.badge,
            {
              backgroundColor: theme.colors.primarySoft,
            },
          ]}
        />
      </View>
      <Text style={[styles.value, { color: theme.colors.text }]}>{value}</Text>
      <Text style={[styles.label, { color: theme.colors.textMuted }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    gap: 4,
    overflow: 'hidden',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 14 },
    shadowRadius: 22,
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  topLabel: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    flex: 1,
    paddingRight: 8,
  },
  badge: {
    width: 42,
    height: 8,
    borderRadius: 999,
  },
  value: {
    fontSize: 24,
    fontWeight: '900',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
});
