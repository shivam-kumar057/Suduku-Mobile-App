import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthScreen } from '../screens/AuthScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { GameScreen } from '../screens/GameScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { StatsScreen } from '../screens/StatsScreen';
import { MatchmakingScreen } from '../screens/MatchmakingScreen';
import { OnlineGameScreen } from '../screens/OnlineGameScreen';
import { ResultScreen } from '../screens/ResultScreen';
import { LeaderboardScreen } from '../screens/LeaderboardScreen';
import { useAuth } from '../context/AuthContext';
import { AppTheme } from '../utils/theme';
import { GameResultPayload, MatchFoundPayload } from '../types/multiplayer';

export type RootStackParamList = {
  Auth: undefined;
  Home: undefined;
  Game: undefined;
  Settings: undefined;
  Stats: undefined;
  Matchmaking: undefined;
  OnlineGame: MatchFoundPayload;
  Result: Pick<GameResultPayload, 'matchId' | 'winnerId' | 'stats'>;
  Leaderboard: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

interface Props {
  theme: AppTheme;
}

export function RootNavigator({ theme }: Props) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShadowVisible: false,
        headerStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerTintColor: theme.colors.text,
        contentStyle: {
          backgroundColor: theme.colors.background,
        },
      }}>
      {!user ? (
        <Stack.Screen name="Auth" component={AuthScreen} options={{ headerShown: false }} />
      ) : (
        <>
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ title: 'Sudoku Master' }}
          />
          <Stack.Screen
            name="Game"
            component={GameScreen}
            options={{ title: 'Puzzle' }}
          />
          <Stack.Screen name="Matchmaking" component={MatchmakingScreen} />
          <Stack.Screen name="OnlineGame" component={OnlineGameScreen} options={{ title: 'Battle' }} />
          <Stack.Screen name="Result" component={ResultScreen} />
          <Stack.Screen name="Leaderboard" component={LeaderboardScreen} />
          <Stack.Screen name="Stats" component={StatsScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}
