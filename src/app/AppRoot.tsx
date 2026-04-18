import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { enableScreens } from 'react-native-screens';
import { RootNavigator } from '../navigation/RootNavigator';
import { AppTheme } from '../utils/theme';

enableScreens();

interface Props {
  theme: AppTheme;
}

export function AppRoot({ theme }: Props) {
  const navigationTheme = theme.mode === 'dark' ? DarkTheme : DefaultTheme;

  return (
    <NavigationContainer
      theme={{
        ...navigationTheme,
        colors: {
          ...navigationTheme.colors,
          background: theme.colors.background,
          card: theme.colors.surface,
          text: theme.colors.text,
          border: theme.colors.border,
          primary: theme.colors.primary,
        },
      }}>
      <RootNavigator theme={theme} />
    </NavigationContainer>
  );
}
