import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, View } from 'react-native';
import { SudokuBoard } from '../types/sudoku';
import { useAppTheme } from '../hooks/useAppTheme';
import { getRelatedCellIds } from '../utils/sudoku/validation';
import { SudokuCell } from './SudokuCell';

interface Props {
  board: SudokuBoard;
  selectedCellId: string | null;
  onSelectCell: (cellId: string) => void;
}

export function SudokuGrid({ board, selectedCellId, onSelectCell }: Props) {
  const screenWidth = Dimensions.get('window').width;
  const gridSize = Math.min(screenWidth - 32, 420);
  const cellSize = Math.floor(gridSize / 9);
  const boardAnim = useRef(new Animated.Value(0)).current;
  const theme = useAppTheme();

  const relatedIds = useMemo(
    () => getRelatedCellIds(board, selectedCellId),
    [board, selectedCellId],
  );

  const selectedValue = useMemo(
    () => board.find(cell => cell.id === selectedCellId)?.value ?? null,
    [board, selectedCellId],
  );

  useEffect(() => {
    Animated.spring(boardAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 16,
      bounciness: 5,
    }).start();
  }, [boardAnim]);

  useEffect(() => {
    boardAnim.setValue(0.985);
    Animated.spring(boardAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 4,
    }).start();
  }, [boardAnim, selectedCellId]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          width: gridSize,
          height: gridSize,
          backgroundColor: theme.colors.surfaceAlt,
          borderColor: theme.colors.border,
          opacity: boardAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0.78, 1],
          }),
          transform: [{ scale: boardAnim }],
        },
      ]}>
      {Array.from({ length: 9 }, (_, row) => (
        <View key={row} style={styles.row}>
          {board
            .filter(cell => cell.row === row)
            .map(cell => (
              <SudokuCell
                key={cell.id}
                cell={cell}
                size={cellSize}
                selected={cell.id === selectedCellId}
                related={relatedIds.has(cell.id)}
                sameValue={!!selectedValue && cell.value === selectedValue}
                onPress={onSelectCell}
              />
            ))}
        </View>
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    borderWidth: 1,
    borderRadius: 18,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
  },
});
