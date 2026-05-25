import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { useAuth } from '../context/AuthContext';
import { connectSocket, getSocket } from '../services/socket';
import { MatchFoundPayload } from '../types/multiplayer';
import { ScreenContainer } from '../components/ScreenContainer';
import { PrimaryButton } from '../components/PrimaryButton';
import { useAppTheme } from '../hooks/useAppTheme';

type Props = NativeStackScreenProps<RootStackParamList, 'Matchmaking'>;

export function MatchmakingScreen({ navigation }: Props) {
  const theme = useAppTheme();
  const { user } = useAuth();
  const [status, setStatus] = useState('Finding opponent...');

  useEffect(() => {
    if (!user?._id) return;
    const socket = connectSocket();

    const onQueueWaiting = () => setStatus('Finding opponent...');
    const onMatchFound = (payload: MatchFoundPayload) => {
      navigation.replace('OnlineGame', payload);
    };
    const onQueueError = (error: { message?: string }) => {
      setStatus(error.message || 'Queue error');
    };

    socket.on('queue_waiting', onQueueWaiting);
    socket.on('match_found', onMatchFound);
    socket.on('queue_error', onQueueError);
    socket.emit('join_queue', { userId: user._id, difficulty: 'medium', mode: 'realtime' });

    return () => {
      socket.emit('leave_queue');
      socket.off('queue_waiting', onQueueWaiting);
      socket.off('match_found', onMatchFound);
      socket.off('queue_error', onQueueError);
    };
  }, [navigation, user?._id]);

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
        <Text style={[styles.title, { color: theme.colors.text }]}>Matchmaking</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>{status}</Text>
        <PrimaryButton
          label="Cancel"
          variant="ghost"
          fullWidth
          onPress={() => {
            getSocket()?.emit('leave_queue');
            navigation.goBack();
          }}
        />
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
    fontSize: 28,
    fontWeight: '900',
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
  },
});

