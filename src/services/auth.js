import api from './api';
import { resolveMediaUrl } from './media';

export async function registerUser(payload) {
  const response = await api.post('/api/auth/register', payload, { withCredentials: true });
  return response.data;
}

export async function loginUser(payload) {
  const response = await api.post('/api/auth/login', payload, { withCredentials: true });
  return response.data;
}

export async function logoutUser() {
  const response = await api.post('/api/auth/logout', {}, { withCredentials: true });
  return response.data;
}

export async function getMe() {
  const response = await api.get('/api/me', {
    withCredentials: true,
    skipAuthRedirect: true,
  });
  const me = response.data;
  if (me && typeof me === 'object') {
    return {
      ...me,
      avatar: resolveMediaUrl(me.avatar),
      foto: resolveMediaUrl(me.foto),
    };
  }
  return me;
}

export async function updateMe(payload) {
  // payload can be FormData or plain object
  const isForm = payload instanceof FormData;
  const response = await api.put('/api/me', payload, {
    withCredentials: true,
    headers: isForm ? { 'Content-Type': 'multipart/form-data' } : undefined,
  });
  const me = response.data;
  if (me && typeof me === 'object') {
    return {
      ...me,
      avatar: resolveMediaUrl(me.avatar),
      foto: resolveMediaUrl(me.foto),
    };
  }
  return me;
}
