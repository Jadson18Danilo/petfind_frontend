import api from './api';
import { resolveMediaList, resolveMediaUrl } from './media';

function normalizePet(pet) {
  if (!pet) return pet;

  const name = pet.name ?? pet.nome ?? '';
  const age = pet.age ?? pet.ageMonths ?? pet.idade ?? '';
  const description = pet.description ?? pet.bio ?? pet.biografia ?? '';
  const rawLocation = typeof pet.location === 'string' ? pet.location.trim() : '';
  const location = rawLocation || [pet.neighborhood, pet.city, pet.state].filter(Boolean).join(', ');
  const mainPhotoRaw = pet.mainPhoto ?? pet.image ?? pet.imageUrl ?? '';
  const mainPhoto = resolveMediaUrl(mainPhotoRaw);
  const image = resolveMediaUrl(pet.image ?? '');
  const imageUrl = resolveMediaUrl(pet.imageUrl ?? '');
  const additionalPhotos = resolveMediaList(pet.additionalPhotos);

  const tutorName = (pet.tutorName ?? pet.tutor?.name ?? pet.owner?.name ?? pet.User?.name ?? '').toString().trim();

  return {
    ...pet,
    name,
    age,
    description,
    location,
    tutorName,
    mainPhoto,
    image,
    imageUrl,
    additionalPhotos,
  };
}

export async function listPets(params = undefined) {
  const response = await api.get('/api/pets', params ? { params } : undefined);
  const data = response.data;
  if (Array.isArray(data)) return data.map(normalizePet);
  return [];
}

export async function createPet(payload) {
  const response = await api.post('/api/pets', payload, {
    withCredentials: true,
    headers: undefined,
  });
  return normalizePet(response.data);
}

export async function updatePet(id, payload) {
  const response = await api.put(`/api/pets/${id}`, payload, {
    withCredentials: true,
    headers: undefined,
  });
  return normalizePet(response.data);
}

export async function deletePet(id) {
  const response = await api.delete(`/api/pets/${id}`, { withCredentials: true });
  return response.data;
}
