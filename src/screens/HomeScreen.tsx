import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { ScreenContainer } from '../components/ScreenContainer';
import { PrimaryButton } from '../components/PrimaryButton';
import { StatCard } from '../components/StatCard';
import { useGameStore } from '../store/useGameStore';
import { useAppTheme } from '../hooks/useAppTheme';
import { preloadAds, showInterstitialAd } from '../services/ads';
import { useAuth } from '../context/AuthContext';
import { Difficulty } from '../types/sudoku';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export function HomeScreen({ navigation }: Props) {
  const theme = useAppTheme();
  const heroAnim = useRef(new Animated.Value(0)).current;
  const statsAnim = useRef(new Animated.Value(0)).current;
  const buttonsAnim = useRef(new Animated.Value(0)).current;
  const startNewGame = useGameStore(state => state.startNewGame);
  const startDailyGame = useGameStore(state => state.startDailyGame);
  const currentGame = useGameStore(state => state.currentGame);
  const stats = useGameStore(state => state.stats);
  const { user, logout } = useAuth();

  const handleStartGameWithAd = async (difficulty: Difficulty) => {
    await showInterstitialAd();
    startNewGame(difficulty);
    navigation.navigate('Game');
  };

  useEffect(() => {
    preloadAds();
    Animated.stagger(110, [
      Animated.timing(heroAnim, {
        toValue: 1,
        duration: 360,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(statsAnim, {
        toValue: 1,
        duration: 320,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(buttonsAnim, {
        toValue: 1,
        duration: 380,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [buttonsAnim, heroAnim, statsAnim]);

  return (
    <ScreenContainer>
      <Animated.View
        style={[
          styles.hero,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
            opacity: heroAnim,
            transform: [
              {
                translateY: heroAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [24, 0],
                }),
              },
            ],
          },
        ]}>
        <View
          style={[
            styles.heroPill,
            {
              backgroundColor: theme.colors.accentSoft,
            },
          ]}>
          <Text style={[styles.heroPillText, { color: theme.colors.text }]}>
            {user?.name ?? 'Player'} • {user?.coins ?? 0} coins
          </Text>
        </View>
        <Text style={[styles.title, { color: theme.colors.text }]}>Sudoku Master</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>
          Train focus with elegant puzzles, animated feedback, and a gentle three-chance challenge
          loop.
        </Text>
        <View style={styles.heroStats}>
          <View
            style={[
              styles.heroMiniCard,
              {
                backgroundColor: theme.colors.primarySoft,
              },
            ]}>
            <Text style={[styles.heroMiniLabel, { color: theme.colors.textMuted }]}>Current</Text>
            <Text style={[styles.heroMiniValue, { color: theme.colors.text }]}>
              {currentGame ? 'Resumeable' : 'Fresh start'}
            </Text>
          </View>
          <View
            style={[
              styles.heroMiniCard,
              {
                backgroundColor: theme.colors.accentSoft,
              },
            ]}>
            <Text style={[styles.heroMiniLabel, { color: theme.colors.textMuted }]}>Wins</Text>
            <Text style={[styles.heroMiniValue, { color: theme.colors.text }]}>{stats.gamesWon}</Text>
          </View>
        </View>
      </Animated.View>

      <Animated.View
        style={[
          styles.statsRow,
          {
            opacity: statsAnim,
            transform: [
              {
                translateY: statsAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [18, 0],
                }),
              },
            ],
          },
        ]}>
        <StatCard label="Games won" value={`${stats.gamesWon}`} />
        <StatCard label="Best streak" value={`${stats.bestStreak}`} />
      </Animated.View>

      <Animated.View
        style={[
          styles.buttonGroup,
          {
            opacity: buttonsAnim,
            transform: [
              {
                translateY: buttonsAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [22, 0],
                }),
              },
            ],
          },
        ]}>
        <PrimaryButton
          label="Play Online"
          fullWidth
          onPress={() => navigation.navigate('Matchmaking')}
        />
        <PrimaryButton
          label="Easy Game"
          fullWidth
          onPress={() => {
            void handleStartGameWithAd('easy');
          }}
        />
        <PrimaryButton
          label="Medium Game"
          fullWidth
          onPress={() => {
            void handleStartGameWithAd('medium');
          }}
        />
        <PrimaryButton
          label="Hard Game"
          fullWidth
          onPress={() => {
            void handleStartGameWithAd('hard');
          }}
        />
        <PrimaryButton
          label="Daily Challenge"
          variant="secondary"
          fullWidth
          onPress={() => {
            startDailyGame();
            navigation.navigate('Game');
          }}
        />
        <PrimaryButton
          label="Leaderboard"
          variant="secondary"
          fullWidth
          onPress={() => navigation.navigate('Leaderboard')}
        />
        {currentGame ? (
          <PrimaryButton
            label="Resume Current Game"
            variant="ghost"
            fullWidth
            onPress={() => navigation.navigate('Game')}
          />
        ) : null}
      </Animated.View>

      <Animated.View
        style={[
          styles.row,
          {
            opacity: buttonsAnim,
          },
        ]}>
        <PrimaryButton
          label="Stats"
          variant="secondary"
          flex
          onPress={() => navigation.navigate('Stats')}
        />
        <PrimaryButton
          label="Settings"
          variant="secondary"
          flex
          onPress={() => navigation.navigate('Settings')}
        />
      </Animated.View>

      <PrimaryButton label="Logout" variant="ghost" fullWidth onPress={logout} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  hero: {
    borderRadius: 32,
    borderWidth: 1,
    padding: 24,
    gap: 12,
    shadowColor: '#9EB7E9',
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 18 },
    shadowRadius: 26,
    elevation: 5,
  },
  heroPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  heroPillText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
  },
  heroStats: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  heroMiniCard: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 4,
  },
  heroMiniLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  heroMiniValue: {
    fontSize: 16,
    fontWeight: '800',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  buttonGroup: {
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
});
