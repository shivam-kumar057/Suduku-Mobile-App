import React, { memo, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text } from 'react-native';
import { SudokuCellData } from '../types/sudoku';
import { useAppTheme } from '../hooks/useAppTheme';

interface Props {
  cell: SudokuCellData;
  size: number;
  selected: boolean;
  related: boolean;
  sameValue: boolean;
  onPress: (cellId: string) => void;
}

export const SudokuCell = memo(
  ({ cell, size, selected, related, sameValue, onPress }: Props) => {
    const theme = useAppTheme();
    const scale = useRef(new Animated.Value(1)).current;

    const handlePress = () => {
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 0.96,
          duration: 80,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 80,
          useNativeDriver: true,
        }),
      ]).start();
      onPress(cell.id);
    };

    const backgroundColor = selected
      ? theme.colors.selectedCell
      : cell.hasConflict
        ? `${theme.colors.danger}22`
        : cell.isHint
          ? `${theme.colors.accent}22`
          : cell.isGiven
            ? theme.colors.givenCell
            : related || sameValue
              ? theme.colors.highlight
              : theme.colors.surface;

    return (
      <Animated.View style={{ transform: [{ scale }] }}>
        <Pressable
          onPress={handlePress}
          style={[
            styles.cell,
            {
              width: size,
              height: size,
              backgroundColor,
              borderColor: theme.colors.border,
              borderTopWidth: cell.row % 3 === 0 ? 2 : 0.5,
              borderLeftWidth: cell.col % 3 === 0 ? 2 : 0.5,
              borderRightWidth: cell.col === 8 ? 2 : 0.5,
              borderBottomWidth: cell.row === 8 ? 2 : 0.5,
            },
          ]}>
          <Text
            style={[
              styles.value,
              {
                color: cell.isGiven
                  ? theme.colors.text
                  : cell.hasConflict
                    ? theme.colors.danger
                    : theme.colors.primary,
                fontWeight: cell.isGiven ? '800' : '700',
              },
            ]}>
            {cell.value ?? ''}
          </Text>
        </Pressable>
      </Animated.View>
    );
  },
);

const styles = StyleSheet.create({
  cell: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontSize: 22,
  },
});
