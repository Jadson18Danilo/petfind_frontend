import { io } from 'socket.io-client';
import api from './api';

let socketInstance = null;

function resolveSocketUrl() {
  return api.defaults.baseURL || process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_FALLBACK_URL;
}

export function getChatSocket() {
  if (typeof window === 'undefined') return null;

  if (socketInstance) {
    return socketInstance;
  }

  socketInstance = io(resolveSocketUrl(), {
    withCredentials: true,
    transports: ['websocket', 'polling'],
  });

  return socketInstance;
}
