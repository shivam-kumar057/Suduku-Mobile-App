import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';
import { getUserProfile, loginUser } from '../services/api';
import { connectSocket, disconnectSocket } from '../services/socket';
import { AuthUser } from '../types/multiplayer';

const USER_KEY = 'sudoku_auth_user';
const DEVICE_ID_KEY = 'sudoku_device_id';

interface AuthContextState {
  user: AuthUser | null;
  loading: boolean;
  login: (name: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextState | undefined>(undefined);

async function getOrCreateDeviceId() {
  const existing = await AsyncStorage.getItem(DEVICE_ID_KEY);
  if (existing) return existing;
  const generated = `device-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  await AsyncStorage.setItem(DEVICE_ID_KEY, generated);
  return generated;
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const bootstrap = async () => {
      try {
        const raw = await AsyncStorage.getItem(USER_KEY);
        if (!raw) return;
        const cached = JSON.parse(raw) as AuthUser;
        const fresh = await getUserProfile(cached._id);
        if (mounted) setUser(fresh);
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(fresh));
      } catch {
        await AsyncStorage.removeItem(USER_KEY);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    bootstrap();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (user?._id) {
      connectSocket();
    } else {
      disconnectSocket();
    }
  }, [user?._id]);

  const value = useMemo<AuthContextState>(
    () => ({
      user,
      loading,
      login: async (name: string) => {
        const deviceId = await getOrCreateDeviceId();
        const profile = await loginUser(name.trim(), deviceId);
        setUser(profile);
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(profile));
      },
      logout: async () => {
        setUser(null);
        await AsyncStorage.removeItem(USER_KEY);
      },
      refreshProfile: async () => {
        if (!user?._id) return;
        const profile = await getUserProfile(user._id);
        setUser(profile);
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(profile));
      },
    }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}
