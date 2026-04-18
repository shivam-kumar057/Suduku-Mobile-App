import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Modal, StyleSheet, Text } from 'react-native';
import { useAppTheme } from '../hooks/useAppTheme';
import { Difficulty } from '../types/sudoku';
import { formatElapsedTime } from '../utils/format';
import { PrimaryButton } from './PrimaryButton';

interface Props {
  visible: boolean;
  elapsedMs: number;
  difficulty: Difficulty;
  isDailyChallenge: boolean;
  onHome: () => void;
  onReplay: () => void;
}

export function CompletionModal({
  visible,
  elapsedMs,
  difficulty,
  isDailyChallenge,
  onHome,
  onReplay,
}: Props) {
  const theme = useAppTheme();
  const cardAnim = useRef(new Animated.Value(0)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) {
      cardAnim.setValue(0);
      overlayAnim.setValue(0);
      return;
    }

    Animated.parallel([
      Animated.timing(overlayAnim, {
        toValue: 1,
        duration: 220,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.spring(cardAnim, {
        toValue: 1,
        useNativeDriver: true,
        speed: 14,
        bounciness: 7,
      }),
    ]).start();
  }, [cardAnim, overlayAnim, visible]);

  return (
    <Modal visible={visible} animationType="none" transparent>
      <Animated.View
        style={[
          styles.overlay,
          {
            opacity: overlayAnim,
          },
        ]}>
        <Animated.View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              transform: [
                {
                  translateY: cardAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [30, 0],
                  }),
                },
                {
                  scale: cardAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.94, 1],
                  }),
                },
              ],
              opacity: cardAnim,
            },
          ]}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Puzzle Complete</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>
            {isDailyChallenge ? 'Daily Challenge cleared' : `${difficulty} board solved`}
          </Text>
          <Text style={[styles.time, { color: theme.colors.primary }]}>
            {formatElapsedTime(elapsedMs)}
          </Text>
          <PrimaryButton label="Play Again" onPress={onReplay} />
          <PrimaryButton label="Back Home" variant="secondary" onPress={onHome} />
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(34, 55, 90, 0.22)',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    gap: 12,
    shadowColor: '#2A4C8F',
    shadowOpacity: 0.16,
    shadowOffset: { width: 0, height: 18 },
    shadowRadius: 28,
    elevation: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
  },
  time: {
    fontSize: 34,
    fontWeight: '900',
    marginBottom: 8,
  },
});
