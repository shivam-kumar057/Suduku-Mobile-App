import { Platform } from 'react-native';
import { AuthUser } from '../types/multiplayer';

const PORT = 4000;
const RENDER_BASE_URL = 'https://suduku-backend.onrender.com';
const RENDER_BASE_URLS = [RENDER_BASE_URL];
const ALLOW_LOCAL_FALLBACK = false;
const HOSTS =
  Platform.OS === 'android'
    ? ['10.0.2.2', '10.0.3.2', 'localhost']
    : ['localhost', '127.0.0.1'];

let activeBaseUrl = RENDER_BASE_URL;

const sleep = (ms: number) => new Promise<void>(resolve => setTimeout(() => resolve(), ms));

function getCandidates() {
  const ordered = [
    activeBaseUrl,
    ...RENDER_BASE_URLS,
    ...(ALLOW_LOCAL_FALLBACK ? HOSTS.map(host => `http://${host}:${PORT}`) : []),
  ];
  return [...new Set(ordered)];
}

async function fetchWithTimeout(url: string, init?: RequestInit, timeoutMs = 4500) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const candidates = getCandidates();
  let lastNetworkError = 'Network request failed';
  const method = (init?.method ?? 'GET').toUpperCase();

  for (const baseUrl of candidates) {
    const timeoutMs = baseUrl.includes('onrender.com') ? 90000 : 5000;
    const url = `${baseUrl}/api${path}`;
    const maxAttempts = baseUrl.includes('onrender.com') ? 2 : 1;

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      let response: Response;
      const startedAt = Date.now();

      try {
        if (__DEV__) {
          // eslint-disable-next-line no-console
          console.log(`[API] ${method} ${url} (attempt ${attempt}/${maxAttempts})`);
        }
        response = await fetchWithTimeout(
          url,
          {
            headers: {
              'Content-Type': 'application/json',
              ...(init?.headers ?? {}),
            },
            ...init,
          },
          timeoutMs,
        );
      } catch (error) {
        lastNetworkError = error instanceof Error ? error.message : 'Network request failed';
        if (__DEV__) {
          // eslint-disable-next-line no-console
          console.log(
            `[API ERROR] ${method} ${url} (${Date.now() - startedAt}ms) -> ${lastNetworkError}`,
          );
        }
        if (attempt < maxAttempts) {
          await sleep(1500);
          continue;
        }
        break;
      }

      const data = await response.json().catch(() => ({}));
      if (__DEV__) {
        // eslint-disable-next-line no-console
        console.log(
          `[API RES] ${method} ${url} -> ${response.status} (${Date.now() - startedAt}ms)`,
        );
      }
      if (!response.ok) {
        throw new Error(data?.message || 'Request failed');
      }

      activeBaseUrl = baseUrl;
      return data as T;
    }
  }

  throw new Error(
    `Cannot reach backend. Tried: ${candidates.join(', ')}. Last error: ${lastNetworkError}`,
  );
}

export function getSocketBaseUrl() {
  return activeBaseUrl;
}

export function getApiBaseUrl() {
  return activeBaseUrl;
}

export async function loginUser(name: string, deviceId: string): Promise<AuthUser> {
  const data = await request<{ user: AuthUser }>('/users/login', {
    method: 'POST',
    body: JSON.stringify({ name, deviceId }),
  });
  return data.user;
}

export async function getUserProfile(userId: string): Promise<AuthUser> {
  const data = await request<{ user: AuthUser }>(`/users/profile/${userId}`);
  return data.user;
}

export async function getGlobalLeaderboard() {
  return request<{
    entries: Array<{
      userId: string;
      name: string;
      score: number;
      rank: number;
      rating: number;
      winRate: number;
    }>;
  }>('/leaderboard/global?limit=50');
}

export async function rewardCoins(userId: string, amount = 20) {
  return request<{ coins: number }>('/users/reward-coins', {
    method: 'POST',
    body: JSON.stringify({ userId, amount }),
  });
}

export async function getDailyChallenge() {
  return request<{
    challenge: {
      _id: string;
      date: string;
      difficulty: 'easy' | 'medium' | 'hard';
      puzzle: number[][];
    };
  }>('/users/daily-challenge');
}
