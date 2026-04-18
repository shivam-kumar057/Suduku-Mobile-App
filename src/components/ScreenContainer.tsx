import React, { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../hooks/useAppTheme';

interface Props extends PropsWithChildren {
  scrollable?: boolean;
}

export function ScreenContainer({ children, scrollable = true }: Props) {
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();

  const content = (
    <View
      style={[
        styles.content,
        {
          paddingTop: 20,
          paddingBottom: insets.bottom + 16,
          backgroundColor: theme.colors.background,
        },
      ]}>
      <View
        pointerEvents="none"
        style={[
          styles.orb,
          {
            backgroundColor:
              theme.mode === 'dark' ? `${theme.colors.primary}18` : `${theme.colors.primary}14`,
          },
        ]}
      />
      <View
        pointerEvents="none"
        style={[
          styles.orbSecondary,
          {
            backgroundColor:
              theme.mode === 'dark' ? `${theme.colors.accent}18` : `${theme.colors.accent}18`,
          },
        ]}
      />
      {children}
    </View>
  );

  if (!scrollable) {
    return content;
  }

  return (
    <ScrollView style={{ backgroundColor: theme.colors.background }}>
      {content}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    paddingHorizontal: 16,
    gap: 16,
    overflow: 'hidden',
  },
  orb: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    top: -70,
    right: -50,
  },
  orbSecondary: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    top: 180,
    left: -60,
  },
});
