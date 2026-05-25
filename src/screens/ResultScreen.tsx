import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { ScreenContainer } from '../components/ScreenContainer';
import { PrimaryButton } from '../components/PrimaryButton';
import { useAuth } from '../context/AuthContext';
import { useAppTheme } from '../hooks/useAppTheme';

type Props = NativeStackScreenProps<RootStackParamList, 'Result'>;

export function ResultScreen({ route, navigation }: Props) {
  const theme = useAppTheme();
  const { user } = useAuth();
  const { winnerId, stats } = route.params;
  const isWinner = user?._id === winnerId;

  const myStat = useMemo(
    () => stats.find(entry => String(entry.userId) === String(user?._id)),
    [stats, user?._id],
  );

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
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {isWinner ? 'You Won' : 'You Lost'}
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>
          Time: {myStat?.elapsedSeconds ?? '--'}s • Mistakes: {myStat?.mistakes ?? '--'}
        </Text>
        <PrimaryButton label="Play Online Again" fullWidth onPress={() => navigation.replace('Matchmaking')} />
        <PrimaryButton label="Back Home" variant="secondary" fullWidth onPress={() => navigation.navigate('Home')} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 120,
    borderWidth: 1,
    borderRadius: 24,
    padding: 24,
    gap: 12,
  },
  title: {
    fontSize: 34,
    fontWeight: '900',
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
  },
});

