import api from './api';
import { resolveMediaList, resolveMediaUrl } from './media';

function normalizePet(pet) {
  if (!pet) return pet;

  const name = pet.name ?? pet.nome ?? '';
  const age = pet.age ?? pet.ageMonths ?? pet.idade ?? '';
  const description = pet.description ?? pet.bio ?? pet.biografia ?? '';
  const location = pet.location ?? [pet.city, pet.state].filter(Boolean).join(', ');
  const mainPhotoRaw = pet.mainPhoto ?? pet.image ?? pet.imageUrl ?? '';
  const mainPhoto = resolveMediaUrl(mainPhotoRaw);
  const image = resolveMediaUrl(pet.image ?? '');
  const imageUrl = resolveMediaUrl(pet.imageUrl ?? '');
  const additionalPhotos = resolveMediaList(pet.additionalPhotos);

  return {
    ...pet,
    name,
    age,
    description,
    location,
    mainPhoto,
    image,
    imageUrl,
    additionalPhotos,
  };
}

export async function listPets() {
  const response = await api.get('/api/pets');
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
