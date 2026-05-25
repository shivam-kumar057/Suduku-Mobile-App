import React, { useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import { ScreenContainer } from '../components/ScreenContainer';
import { PrimaryButton } from '../components/PrimaryButton';
import { useAppTheme } from '../hooks/useAppTheme';
import { useAuth } from '../context/AuthContext';

export function AuthScreen() {
  const theme = useAppTheme();
  const { login } = useAuth();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const canSubmit = useMemo(() => name.trim().length >= 2, [name]);

  const handleLogin = async () => {
    if (!canSubmit || loading) return;
    try {
      setLoading(true);
      await login(name);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Try again';
      Alert.alert('Login failed', `${message}\n\nPlease check your internet and try again.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer scrollable={false}>
      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
          },
        ]}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Welcome to Sudoku Arena</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>
          Enter your name to create your profile and start online battles.
        </Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Your player name"
          placeholderTextColor={theme.colors.textMuted}
          style={[
            styles.input,
            {
              color: theme.colors.text,
              borderColor: theme.colors.border,
              backgroundColor: theme.colors.surfaceAlt,
            },
          ]}
          maxLength={40}
          autoCapitalize="words"
        />
        <PrimaryButton
          label={loading ? 'Joining...' : 'Continue'}
          onPress={handleLogin}
          fullWidth
          disabled={!canSubmit || loading}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 80,
    borderWidth: 1,
    borderRadius: 28,
    padding: 24,
    gap: 14,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    lineHeight: 38,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
  },
  input: {
    minHeight: 52,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    fontSize: 16,
    fontWeight: '600',
  },
});
