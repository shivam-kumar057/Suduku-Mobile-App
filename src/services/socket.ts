import { io, Socket } from 'socket.io-client';
import { getSocketBaseUrl } from './api';

let socket: Socket | null = null;

export function getSocket() {
  return socket;
}

export function connectSocket() {
  if (socket && socket.connected) return socket;

  const baseUrl = getSocketBaseUrl();

  socket = io(baseUrl, {
    transports: ['websocket'],
    autoConnect: true,
  });

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
