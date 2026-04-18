import React, { useEffect, useRef } from 'react';
import { Alert, Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { AdBanner } from '../components/AdBanner';
import { CompletionModal } from '../components/CompletionModal';
import { GameHeader } from '../components/GameHeader';
import { NumberPad } from '../components/NumberPad';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenContainer } from '../components/ScreenContainer';
import { SudokuGrid } from '../components/SudokuGrid';
import { useAppTheme } from '../hooks/useAppTheme';
import { useGameTimer } from '../hooks/useGameTimer';
import { showInterstitialAd, showRewardedHintAd } from '../services/ads';
import { vibrateLight, vibrateSuccess } from '../services/haptics';
import { useGameStore } from '../store/useGameStore';

type Props = NativeStackScreenProps<RootStackParamList, 'Game'>;

export function GameScreen({ navigation }: Props) {
  useGameTimer();

  const theme = useAppTheme();
  const screenAnim = useRef(new Animated.Value(0)).current;
  const pauseAnim = useRef(new Animated.Value(0)).current;
  const {
    currentGame,
    completionSummary,
    selectCell,
    setCellValue,
    rewardMistakeChance,
    undo,
    redo,
    togglePause,
    startNewGame,
    startDailyGame,
    dismissCompletion,
    settings,
  } = useGameStore(state => state);

  useEffect(() => {
    if (completionSummary) {
      if (settings.vibrationEnabled) {
        vibrateSuccess();
      }
      showInterstitialAd();
    }
  }, [completionSummary, settings.vibrationEnabled]);

  useEffect(() => {
    Animated.timing(screenAnim, {
      toValue: 1,
      duration: 320,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [screenAnim]);

  useEffect(() => {
    Animated.spring(pauseAnim, {
      toValue: currentGame?.paused ? 1 : 0,
      useNativeDriver: true,
      speed: 14,
      bounciness: 6,
    }).start();
  }, [currentGame?.paused, pauseAnim]);

  if (!currentGame) {
    return (
      <ScreenContainer scrollable={false}>
        <View style={styles.emptyState}>
          <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
            No active puzzle
          </Text>
          <PrimaryButton label="Back Home" onPress={() => navigation.goBack()} />
        </View>
      </ScreenContainer>
    );
  }

  const handleValuePress = (value: number) => {
    const result = setCellValue(value);

    if (result === 'blocked') {
      Alert.alert(
        'No chances left',
        'Watch a rewarded ad to borrow one more chance and continue playing.',
      );
      return;
    }

    if (settings.vibrationEnabled) {
      vibrateLight();
    }

    if (result === 'mistake' && currentGame.remainingMistakes - 1 <= 0) {
      Alert.alert(
        'Chances exhausted',
        'You have used all 3 chances. Watch an ad to borrow one more chance.',
      );
    }
  };

  const handleRewardChance = async () => {
    const rewarded = await showRewardedHintAd(() => rewardMistakeChance());

    if (!rewarded) {
      Alert.alert('Ad not ready', 'The rewarded ad is still loading. Try again in a moment.');
    }
  };

  return (
    <>
      <ScreenContainer>
        <Animated.View
          style={{
            opacity: screenAnim,
            transform: [
              {
                translateY: screenAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [18, 0],
                }),
              },
            ],
          }}>
          <GameHeader
            elapsedMs={currentGame.elapsedMs}
            difficulty={currentGame.puzzle.difficulty}
            mistakesRemaining={currentGame.remainingMistakes}
            paused={currentGame.paused}
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.topActions,
            {
              opacity: screenAnim,
            },
          ]}>
          <PrimaryButton
            label={currentGame.paused ? 'Resume' : 'Pause'}
            variant="secondary"
            flex
            onPress={togglePause}
          />
          <PrimaryButton
            label="Home"
            variant="ghost"
            flex
            onPress={() => navigation.navigate('Home')}
          />
        </Animated.View>

        <Animated.View
          style={{
            opacity: currentGame.paused
              ? pauseAnim
              : screenAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 1],
                }),
            transform: [
              {
                translateY: currentGame.paused
                  ? pauseAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [24, 0],
                    })
                  : 0,
              },
              {
                scale: currentGame.paused
                  ? pauseAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.96, 1],
                    })
                  : 1,
              },
            ],
          }}>
          {!currentGame.paused ? (
            <View
              style={[
                styles.tipCard,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                },
              ]}>
              <Text style={[styles.tipTitle, { color: theme.colors.text }]}>Focus Mode</Text>
              <Text style={[styles.tipCopy, { color: theme.colors.textMuted }]}>
                Wrong entries cost a chance. Watch your row, column, and box before locking a number.
              </Text>
            </View>
          ) : null}
          {currentGame.paused ? (
            <View
              style={[
                styles.pauseCard,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                },
              ]}>
              <Text style={[styles.pauseTitle, { color: theme.colors.text }]}>Game Paused</Text>
              <Text style={[styles.pauseText, { color: theme.colors.textMuted }]}>
                Your progress and timer are safely frozen.
              </Text>
            </View>
          ) : (
            <SudokuGrid
              board={currentGame.puzzle.board}
              selectedCellId={currentGame.selectedCellId}
              onSelectCell={selectCell}
            />
          )}
        </Animated.View>

        <NumberPad
          onValuePress={handleValuePress}
          onErase={() => setCellValue(null)}
          onUndo={undo}
          onRedo={redo}
          onRewardChance={handleRewardChance}
          chancesRemaining={currentGame.remainingMistakes}
        />

        <Animated.View style={{ opacity: screenAnim }}>
          <AdBanner />
        </Animated.View>
      </ScreenContainer>

      {completionSummary ? (
        <CompletionModal
          visible={!!completionSummary}
          elapsedMs={completionSummary.elapsedMs}
          difficulty={completionSummary.difficulty}
          isDailyChallenge={completionSummary.isDailyChallenge}
          onHome={() => {
            dismissCompletion();
            navigation.navigate('Home');
          }}
          onReplay={() => {
            dismissCompletion();
            if (completionSummary.isDailyChallenge) {
              startDailyGame();
            } else {
              startNewGame(completionSummary.difficulty);
            }
          }}
        />
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  topActions: {
    flexDirection: 'row',
    gap: 12,
  },
  tipCard: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 16,
    gap: 4,
    marginBottom: 12,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  tipCopy: {
    fontSize: 14,
    lineHeight: 20,
  },
  pauseCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 28,
    gap: 8,
    alignItems: 'center',
  },
  pauseTitle: {
    fontSize: 24,
    fontWeight: '800',
  },
  pauseText: {
    fontSize: 16,
    textAlign: 'center',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '800',
  },
});
