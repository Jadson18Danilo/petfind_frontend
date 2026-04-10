import api from './api';
import { resolveMediaList, resolveMediaUrl } from './media';

export async function likePet(toPetId, fromPetId) {
  const response = await api.post(`/api/pets/${toPetId}/like`, { fromPetId }, { withCredentials: true });
  return response.data;
}

export async function openDirectChat(toPetId, fromPetId) {
  const response = await api.post(
    '/api/matches/direct',
    { toPetId, fromPetId },
    { withCredentials: true }
  );
  return response.data;
}

export async function listReceivedLikes(toPetId) {
  if (!toPetId) return [];
  const response = await api.get(`/api/pets/${toPetId}/like/received`, { withCredentials: true });
  const data = response.data;
  if (!Array.isArray(data)) return [];

  return data.map((pet) => ({
    ...pet,
    image: resolveMediaUrl(pet?.image),
    imageUrl: resolveMediaUrl(pet?.imageUrl),
    mainPhoto: resolveMediaUrl(pet?.mainPhoto),
    additionalPhotos: resolveMediaList(pet?.additionalPhotos),
  }));
}

export async function listMatches() {
  const response = await api.get('/api/matches', { withCredentials: true });
  const data = response.data;
  if (!Array.isArray(data)) return [];

  return data.map((match) => ({
    ...match,
    image: resolveMediaUrl(match?.image),
    imageUrl: resolveMediaUrl(match?.imageUrl),
    mainPhoto: resolveMediaUrl(match?.mainPhoto),
    additionalPhotos: resolveMediaList(match?.additionalPhotos),
  }));
}

export async function listMessages(matchId) {
  const response = await api.get(`/api/matches/${matchId}/messages`, { withCredentials: true });
  return response.data;
}

export async function sendMessage(matchId, text) {
  const response = await api.post(`/api/matches/${matchId}/messages`, { text }, { withCredentials: true });
  return response.data;
}

export async function getUnreadMessagesCount() {
  try {
    const response = await api.get('/api/matches/unread/count', { withCredentials: true });
    return response.data?.count || 0;
  } catch (err) {
    console.error('Failed to get unread count', err);
    return 0;
  }
}

export async function markMessagesAsRead(matchId) {
  try {
    const response = await api.put(`/api/matches/${matchId}/messages/read`, {}, { withCredentials: true });
    return response.data;
  } catch (err) {
    console.error('Failed to mark as read', err);
  }
}
