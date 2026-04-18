import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ScreenContainer } from '../components/ScreenContainer';
import { SettingRow } from '../components/SettingRow';
import { PrimaryButton } from '../components/PrimaryButton';
import { useAppTheme } from '../hooks/useAppTheme';
import { useGameStore } from '../store/useGameStore';

export function SettingsScreen() {
  const theme = useAppTheme();
  const {
    settings,
    toggleSound,
    toggleVibration,
    setThemeMode,
    resetStats,
  } = useGameStore(state => state);

  return (
    <ScreenContainer>
      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
          },
        ]}>
        <Text style={[styles.heading, { color: theme.colors.text }]}>Appearance</Text>
        <Text style={[styles.copy, { color: theme.colors.textMuted }]}>
          Choose between light, dark, or automatic system appearance.
        </Text>
        <View style={styles.row}>
          <PrimaryButton
            label="System"
            variant={settings.themeMode === 'system' ? 'primary' : 'secondary'}
            flex
            onPress={() => setThemeMode('system')}
          />
          <PrimaryButton
            label="Light"
            variant={settings.themeMode === 'light' ? 'primary' : 'secondary'}
            flex
            onPress={() => setThemeMode('light')}
          />
          <PrimaryButton
            label="Dark"
            variant={settings.themeMode === 'dark' ? 'primary' : 'secondary'}
            flex
            onPress={() => setThemeMode('dark')}
          />
        </View>
      </View>

      <SettingRow
        label="Sound effects"
        value={settings.soundEnabled}
        onValueChange={toggleSound}
      />
      <SettingRow
        label="Vibration feedback"
        value={settings.vibrationEnabled}
        onValueChange={toggleVibration}
      />

      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
          },
        ]}>
        <Text style={[styles.heading, { color: theme.colors.text }]}>AdMob Setup</Text>
        <Text style={[styles.copy, { color: theme.colors.textMuted }]}>
          The app uses Google test ad unit IDs during development. Replace them with your
          production IDs before store release.
        </Text>
      </View>

      <PrimaryButton label="Reset Stats" variant="ghost" fullWidth onPress={resetStats} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
    gap: 12,
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 22,
    elevation: 3,
  },
  heading: {
    fontSize: 20,
    fontWeight: '900',
  },
  copy: {
    fontSize: 15,
    lineHeight: 22,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
});
