import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../screens/HomeScreen';
import { GameScreen } from '../screens/GameScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { StatsScreen } from '../screens/StatsScreen';
import { AppTheme } from '../utils/theme';

export type RootStackParamList = {
  Home: undefined;
  Game: undefined;
  Settings: undefined;
  Stats: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

interface Props {
  theme: AppTheme;
}

export function RootNavigator({ theme }: Props) {
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
      <Stack.Screen name="Stats" component={StatsScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
}
