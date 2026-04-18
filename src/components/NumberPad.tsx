import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '../hooks/useAppTheme';
import { PrimaryButton } from './PrimaryButton';

interface Props {
  onValuePress: (value: number) => void;
  onErase: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onRewardChance: () => void;
  chancesRemaining: number;
}

export function NumberPad({
  onValuePress,
  onErase,
  onUndo,
  onRedo,
  onRewardChance,
  chancesRemaining,
}: Props) {
  const theme = useAppTheme();
  const entrance = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(entrance, {
      toValue: 1,
      duration: 320,
      useNativeDriver: true,
    }).start();
  }, [entrance]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: entrance,
          transform: [
            {
              translateY: entrance.interpolate({
                inputRange: [0, 1],
                outputRange: [18, 0],
              }),
            },
          ],
        },
      ]}>
      <View style={styles.grid}>
        {Array.from({ length: 9 }, (_, index) => {
          const value = index + 1;

          return (
            <PrimaryButton
              key={value}
              label={`${value}`}
              minWidth={68}
              disabled={chancesRemaining <= 0}
              onPress={() => onValuePress(value)}
            />
          );
        })}
      </View>
      <View
        style={[
          styles.actions,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
            shadowColor: theme.colors.primary,
          },
        ]}>
        <Text style={[styles.actionsLabel, { color: theme.colors.textMuted }]}>
          Actions
        </Text>
        <View style={styles.row}>
          <PrimaryButton label="Undo" variant="secondary" flex onPress={onUndo} />
          <PrimaryButton label="Redo" variant="secondary" flex onPress={onRedo} />
        </View>
        <View style={styles.row}>
          <PrimaryButton label="Erase" variant="secondary" flex onPress={onErase} />
        </View>
        {chancesRemaining <= 0 ? (
          <PrimaryButton
            label="Watch Ad for +1 Chance"
            variant="ghost"
            fullWidth
            onPress={onRewardChance}
          />
        ) : null}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
  },
  actions: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 16,
    gap: 14,
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 14 },
    shadowRadius: 22,
    elevation: 3,
  },
  actionsLabel: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
});
