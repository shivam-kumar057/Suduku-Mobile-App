import React from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { useAppTheme } from '../hooks/useAppTheme';

interface Props {
  label: string;
  value: boolean;
  onValueChange: () => void;
}

export function SettingRow({ label, value, onValueChange }: Props) {
  const theme = useAppTheme();

  return (
    <View
      style={[
        styles.row,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          shadowColor: theme.colors.primary,
        },
      ]}>
      <Text style={[styles.label, { color: theme.colors.text }]}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ true: theme.colors.primary }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 18,
    elevation: 2,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
  },
});
