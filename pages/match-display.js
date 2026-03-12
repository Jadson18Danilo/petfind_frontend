import React, { useState, useEffect, useCallback } from 'react';
import { Heart, MessageCircle, User, MapPin, X, Sparkles } from 'lucide-react';
import { likePet, listMatches } from '../src/services/matches';
import { listPets } from '../src/services/pets';
import { getMe } from '../src/services/auth';
import { resolveMediaUrl } from '../src/services/media';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Layout from '../src/components/Layout';

const IMAGE_DURATION_MS = 10000;
const MATCH_PREFS_KEY = 'matchPreferences';

export default function MatchDisplay({
  onNavigateToMatches,
  onNavigateToChat,
  onNavigateToPerfil,
  onMatch,
  matches = [],
  currentPetId // id of the user's active pet used when liking other profiles
}) {
  const router = useRouter();
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPet, setSelectedPet] = useState(null);
  const [selectionIssue, setSelectionIssue] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageProgress, setImageProgress] = useState(0);
  const [isImagePaused, setIsImagePaused] = useState(false);
  const [showMatchNotification, setShowMatchNotification] = useState(false);
  const [currentMatch, setCurrentMatch] = useState(null);
  const [swipeDirection, setSwipeDirection] = useState(null);

  const currentProfile = pets[currentIndex];
  const currentProfileImages = currentProfile ? getProfileImageUrls(currentProfile) : [];
  const currentNeighborhood = currentProfile?.neighborhood || currentProfile?.bairro || '';
  const currentCity = currentProfile?.city || currentProfile?.cidade || '';
  const currentState = currentProfile?.state || currentProfile?.estado || '';
  const fallbackLocation = [currentNeighborhood, currentCity, currentState].filter(Boolean).join(', ');
  const displayLocation = (currentProfile?.location || '').toString().trim() || fallbackLocation || 'Localização não informada';
  const displayTutorName =
    (currentProfile?.tutorName || '').toString().trim() ||
    currentProfile?.tutor?.name ||
    currentProfile?.owner?.name ||
    currentProfile?.User?.name ||
    'Tutor';
  const currentImageUrl = currentProfileImages[currentImageIndex] || '';
  const selectedPetLat = Number(selectedPet?.latitude ?? selectedPet?.lat ?? selectedPet?.latitude);
  const selectedPetLng = Number(selectedPet?.longitude ?? selectedPet?.lng ?? selectedPet?.longitude);
  const currentPetLat = Number(currentProfile?.latitude ?? currentProfile?.lat ?? currentProfile?.latitude);
  const currentPetLng = Number(currentProfile?.longitude ?? currentProfile?.lng ?? currentProfile?.longitude);
  const computedDistanceKm =
    Number.isFinite(selectedPetLat) &&
    Number.isFinite(selectedPetLng) &&
    Number.isFinite(currentPetLat) &&
    Number.isFinite(currentPetLng)
      ? getDistanceKm(selectedPetLat, selectedPetLng, currentPetLat, currentPetLng)
      : null;
  const displayDistanceKm = Number.isFinite(Number(currentProfile?.distanceKm))
    ? Number(currentProfile.distanceKm)
    : computedDistanceKm;
  const currentMatchImageUrl = currentMatch ? getImageUrl(currentMatch) : '';
  const hasMoreProfiles = currentIndex < pets.length - 1;
  const noProfiles = !loading && !error && pets.length === 0;
  const activePetId = selectedPet?.id ?? currentPetId;
  const [cardImageFailed, setCardImageFailed] = useState(false);
  const [matchImageFailed, setMatchImageFailed] = useState(false);

  const normalizeText = useCallback((value) => {
    if (!value) return '';
    return value
      .toString()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }, []);

  const getOppositeSex = useCallback((value) => {
    const sex = normalizeText(value);
    if (sex === 'macho') return 'femea';
    if (sex === 'femea') return 'macho';
    return '';
  }, [normalizeText]);

  function getAgeGroupForPet(pet) {
    const rawAge = Number(pet?.ageMonths ?? pet?.age ?? pet?.idade ?? 0);
    if (!Number.isFinite(rawAge)) return 'adulto';

    const months = rawAge > 24 ? rawAge * 12 : rawAge;
    if (months <= 12) return 'filhote';
    if (months <= 84) return 'adulto';
    return 'idoso';
  }

  function getDistanceKm(lat1, lng1, lat2, lng2) {
    const toRadians = (value) => (value * Math.PI) / 180;
    const earthRadiusKm = 6371;
    const dLat = toRadians(lat2 - lat1);
    const dLng = toRadians(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return earthRadiusKm * c;
  }

  useEffect(() => {
    let mounted = true;

    async function fetchPets() {
      setLoading(true);
      setSelectionIssue('');
      try {
        const [meData, data, matchesData] = await Promise.all([
          getMe().catch(() => null),
          listPets(),
          listMatches().catch(() => [])
        ]);
        if (!mounted) return;

        const allPets = Array.isArray(data) ? data : [];
        const realMatches = Array.isArray(matchesData) ? matchesData : [];
        const myUserId = meData?.id != null ? Number(meData.id) : null;
        const savedPrefs = typeof window !== 'undefined'
          ? JSON.parse(window.localStorage.getItem(MATCH_PREFS_KEY) || '{}')
          : {};

        const ownedPets = myUserId != null
          ? allPets.filter((pet) => Number(pet.ownerId) === myUserId)
          : [];
        const ownedPetIds = new Set(ownedPets.map((pet) => Number(pet.id)));
        const storedId = typeof window !== 'undefined'
          ? Number(window.localStorage.getItem('activePetId'))
          : null;
        const activePet = storedId
          ? ownedPets.find((pet) => pet.id === storedId)
          : ownedPets[0];

        const activePetNumericId = activePet?.id != null ? Number(activePet.id) : null;
        const matchedPetIds = new Set();

        if (activePetNumericId != null) {
          realMatches.forEach((match) => {
            const petAId = Number(match?.petAId);
            const petBId = Number(match?.petBId);

            if (petAId === activePetNumericId && Number.isFinite(petBId)) {
              matchedPetIds.add(petBId);
            }

            if (petBId === activePetNumericId && Number.isFinite(petAId)) {
              matchedPetIds.add(petAId);
            }
          });
        }

        if (typeof window !== 'undefined') {
          if (activePet?.id) {
            window.localStorage.setItem('activePetId', String(activePet.id));
          } else {
            window.localStorage.removeItem('activePetId');
          }
        }

        setSelectedPet(activePet || null);

        if (!activePet) {
          const publicCandidates = allPets.filter((pet) => {
            if (myUserId != null && Number(pet.ownerId) === myUserId) return false;
            return true;
          });

          setPets(publicCandidates);
          setSelectionIssue(
            publicCandidates.length > 0
              ? 'Não foi possível identificar o pet ativo. Exibindo perfis disponíveis.'
              : 'Selecione um pet no perfil para ver os matches.'
          );
          return;
        }

        const species = normalizeText(activePet.species || activePet.especie);
        const opposite = getOppositeSex(activePet.sex || activePet.sexo);

        const candidatePets = allPets;

        const fallbackCandidates = candidatePets.filter((pet) => {
          if (ownedPetIds.has(Number(pet.id))) return false;
          if (myUserId != null && Number(pet.ownerId) === myUserId) return false;
          if (activePet?.id && Number(pet.id) === Number(activePet.id)) return false;
          return true;
        });

        if (!species || !opposite) {
          setPets(fallbackCandidates);
          setSelectionIssue(
            fallbackCandidates.length > 0
              ? 'Complete a espécie e o sexo do pet selecionado para melhorar os resultados. Exibindo perfis disponíveis.'
              : 'Complete a espécie e o sexo do pet selecionado.'
          );
          return;
        }

        const preferredSex = normalizeText(savedPrefs?.sex || 'oposto');
        const preferredAgeRange = normalizeText(savedPrefs?.ageRange || 'todos');

        const filtered = candidatePets.filter((pet) => {
          if (ownedPetIds.has(Number(pet.id))) return false;
          if (myUserId != null && Number(pet.ownerId) === myUserId) return false;
          if (activePet?.id && Number(pet.id) === Number(activePet.id)) return false;

          const petSpecies = normalizeText(pet.species || pet.especie);
          const petSex = normalizeText(pet.sex || pet.sexo);
          const petAgeGroup = getAgeGroupForPet(pet);

          const speciesMatchesPreference = petSpecies === species;

          const sexMatchesPreference =
            preferredSex === 'qualquer'
              ? true
              : preferredSex === 'mesmo'
                ? petSex === normalizeText(activePet.sex || activePet.sexo)
                : petSex === opposite;

          const ageMatchesPreference =
            preferredAgeRange === 'todos' ? true : petAgeGroup === preferredAgeRange;

          return speciesMatchesPreference && sexMatchesPreference && ageMatchesPreference;
        });

        if (filtered.length > 0) {
          setPets(filtered);
          return;
        }

        setPets(fallbackCandidates);

        if (fallbackCandidates.length > 0) {
          setSelectionIssue('Nenhum perfil encontrado com os filtros atuais. Exibindo perfis disponíveis.');
        } else {
          setSelectionIssue('Nenhum perfil encontrado com os filtros atuais. Ajuste em Configurações > Preferências de Match.');
        }
      } catch (err) {
        console.error('Error loading pets', err);
        if (mounted) setError(err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchPets();

    return () => { mounted = false; };
  }, [getOppositeSex, normalizeText]);

  function toAbsoluteUrl(url) {
    return resolveMediaUrl(url) || '';
  }

  function getProfileImageUrls(profile) {
    if (!profile) return '';

    const allUrls = [];

    if (typeof profile.mainPhoto === 'string' && profile.mainPhoto.trim()) {
      allUrls.push(profile.mainPhoto.trim());
    }

    if (Array.isArray(profile.additionalPhotos)) {
      profile.additionalPhotos.forEach((photo) => {
        if (typeof photo === 'string' && photo.trim()) allUrls.push(photo.trim());
        if (photo && typeof photo === 'object' && typeof photo.url === 'string' && photo.url.trim()) {
          allUrls.push(photo.url.trim());
        }
      });
    }

    if (Array.isArray(profile.images)) {
      profile.images.forEach((photo) => {
        if (typeof photo === 'string' && photo.trim()) allUrls.push(photo.trim());
        if (photo && typeof photo === 'object' && typeof photo.url === 'string' && photo.url.trim()) {
          allUrls.push(photo.url.trim());
        }
      });
    }

    if (Array.isArray(profile.photos)) {
      profile.photos.forEach((photo) => {
        if (typeof photo === 'string' && photo.trim()) allUrls.push(photo.trim());
        if (photo && typeof photo === 'object' && typeof photo.url === 'string' && photo.url.trim()) {
          allUrls.push(photo.url.trim());
        }
      });
    }

    if (typeof profile.image === 'string' && profile.image.trim()) {
      allUrls.push(profile.image.trim());
    }
    if (profile.image && typeof profile.image === 'object' && typeof profile.image.url === 'string' && profile.image.url.trim()) {
      allUrls.push(profile.image.url.trim());
    }
    if (typeof profile.imageUrl === 'string' && profile.imageUrl.trim()) {
      allUrls.push(profile.imageUrl.trim());
    }

    const dedupedUrls = [...new Set(allUrls)];
    return dedupedUrls.map(toAbsoluteUrl).filter(Boolean);
  }

  function getImageUrl(profile) {
    const urls = getProfileImageUrls(profile);
    return urls[0] || '';
  }

  const handlePrevImage = () => {
    if (!currentProfileImages.length) return;
    setCurrentImageIndex((prev) => (prev - 1 + currentProfileImages.length) % currentProfileImages.length);
    setImageProgress(0);
  };

  const handleNextImage = () => {
    if (!currentProfileImages.length) return;
    setCurrentImageIndex((prev) => (prev + 1) % currentProfileImages.length);
    setImageProgress(0);
  };

  useEffect(() => {
    setCurrentImageIndex(0);
    setImageProgress(0);
    setIsImagePaused(false);
    setCardImageFailed(false);
  }, [currentIndex]);

  useEffect(() => {
    setCardImageFailed(false);
  }, [currentImageUrl]);

  useEffect(() => {
    setMatchImageFailed(false);
  }, [currentMatchImageUrl]);

  useEffect(() => {
    if (!currentProfile || !currentProfileImages.length || isImagePaused) return;

    const tickMs = 100;
    const intervalId = setInterval(() => {
      setImageProgress((previousProgress) => {
        const nextProgress = previousProgress + (tickMs / IMAGE_DURATION_MS) * 100;
        if (nextProgress >= 100) {
          setCurrentImageIndex((prev) => (prev + 1) % currentProfileImages.length);
          return 0;
        }
        return nextProgress;
      });
    }, tickMs);

    return () => clearInterval(intervalId);
  }, [currentProfile, currentProfileImages.length, isImagePaused]);

  const handleSwipe = async (direction) => {
    if (!currentProfile) return;

    setSwipeDirection(direction);

    // If user swiped right, notify backend of the like. Backend will create a match
    // if the other side already liked this pet.
    if (direction === 'right' && activePetId) {
      try {
        const resp = await likePet(currentProfile.id, activePetId);

        // Match real apenas quando backend confirma reciprocidade.
        const matched = !!(
          resp && (
            resp.matched === true ||
            resp.isMatch === true ||
            (resp.match && (resp.match.id || resp.match.petAId || resp.match.petBId))
          )
        );

        if (matched) {
          setCurrentMatch(currentProfile);
          setShowMatchNotification(true);

          if (onMatch) {
            onMatch(resp.match || { id: currentProfile.id, petProfile: currentProfile, timestamp: new Date() });
          }
        }
      } catch (err) {
        // ignore for now; could show a toast later
      }
    }

    setTimeout(() => {
      setSwipeDirection(null);
      if (hasMoreProfiles) {
        setCurrentIndex((prev) => prev + 1);
      }
    }, 300);
  };

  const handleLike = () => handleSwipe('right');
  const handleReject = () => handleSwipe('left');

  const closeMatchNotification = () => {
    setShowMatchNotification(false);
    setCurrentMatch(null);
  };

  const handleChatFromMatch = () => {
    closeMatchNotification();
    if (onNavigateToChat) return onNavigateToChat();
    router.push('/chat-on');
  };

  const handleGoMatches = () => {
    if (onNavigateToMatches) return onNavigateToMatches();
    router.push('/matches');
  };

  const handleGoChat = () => {
    if (onNavigateToChat) return onNavigateToChat();
    router.push('/chat-on');
  };

  const handleGoRegister = () => {
    router.push('/pet-register');
  };

  const handleGoPerfil = () => {
    if (onNavigateToPerfil) return onNavigateToPerfil();
    router.push('/tutor-profile');
  };

  return (
    <Layout>
      <div className="min-h-screen page-bg">
        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-6 sm:py-8 min-h-screen">
          {loading ? (
            <div className="w-full max-w-md animate-pulse">
              <div className="bg-white rounded-2xl overflow-hidden shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)]">
                <div className="h-96 bg-slate-100" />
                <div className="p-5 space-y-3">
                  <div className="h-6 w-2/3 bg-slate-100 rounded" />
                  <div className="h-4 w-1/2 bg-slate-100 rounded" />
                  <div className="h-4 w-full bg-slate-100 rounded" />
                  <div className="h-4 w-5/6 bg-slate-100 rounded" />
                </div>
              </div>
            </div>
          ) : error ? (
            <div className="text-center">
              <p className="text-red-500">Erro ao carregar perfis.</p>
            </div>
          ) : selectionIssue && !currentProfile ? (
            <div className="text-center">
              <p className="text-gray-500">{selectionIssue}</p>
              <button onClick={handleGoPerfil} className="mt-4 btn">Ir para perfil</button>
            </div>
          ) : currentProfile ? (
            <div className="w-full max-w-[min(100%,28rem)]">
              {selectionIssue && (
                <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  {selectionIssue}
                </div>
              )}
              {/* Card do Pet */}
              <div 
                className={`group bg-white rounded-2xl shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] transition-all duration-300 relative group-hover:ring-2 group-hover:ring-[#ffa98f] ring-inset ${
                  swipeDirection === 'left' ? 'translate-x-[-100vw] opacity-0' : 
                  swipeDirection === 'right' ? 'translate-x-[100vw] opacity-0' : 
                  'translate-x-0 opacity-100'
                }`}
              >
                {/* Borda gradiente no hover */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10" 
                  style={{
                    background: '#FFA98F',
                    padding: '2px',
                    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                    WebkitMaskComposite: 'xor',
                    maskComposite: 'exclude'
                  }}
                />
                
                {/* Imagem */}
                <div className="relative z-10 h-72 sm:h-96 overflow-hidden rounded-t-2xl">
                  {currentProfileImages.length > 0 && (
                    <div className="absolute top-3 left-3 right-3 z-20 flex gap-1.5">
                      {currentProfileImages.map((img, index) => {
                        const progress = index < currentImageIndex ? 100 : index === currentImageIndex ? imageProgress : 0;
                        return (
                          <div key={`${img}-${index}`} className="h-1.5 flex-1 rounded-full bg-[rgba(255,255,255,0.35)] overflow-hidden">
                            <div
                              className="h-full bg-white transition-all duration-100"
                              style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
                            />
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {currentProfileImages.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={handlePrevImage}
                        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 size-9 rounded-full bg-[rgba(0,0,0,0.35)] text-white flex items-center justify-center hover:bg-[rgba(0,0,0,0.55)]"
                        aria-label="Imagem anterior"
                      >
                        ‹
                      </button>

                      <button
                        type="button"
                        onClick={handleNextImage}
                        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 size-9 rounded-full bg-[rgba(0,0,0,0.35)] text-white flex items-center justify-center hover:bg-[rgba(0,0,0,0.55)]"
                        aria-label="Próxima imagem"
                      >
                        ›
                      </button>
                    </>
                  )}

                  <button
                    type="button"
                    onPointerDown={() => setIsImagePaused(true)}
                    onPointerUp={() => setIsImagePaused(false)}
                    onPointerLeave={() => setIsImagePaused(false)}
                    onPointerCancel={() => setIsImagePaused(false)}
                    className="absolute inset-y-0 left-1/2 -translate-x-1/2 z-20 w-2/5 bg-transparent"
                    aria-label="Segure para pausar"
                  />

                  {currentImageUrl && !cardImageFailed ? (
                    <Image
                      src={currentImageUrl}
                      alt={currentProfile.name || 'Pet'}
                      fill
                      sizes="(max-width: 640px) 100vw, 28rem"
                      className="object-cover"
                      priority={currentIndex === 0}
                      onError={() => setCardImageFailed(true)}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      Sem foto
                    </div>
                  )}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.5), rgba(0,0,0,0))' }}
                  />
                  
                  {/* Badges */}
                  <div className="absolute top-3 left-3">
                    <div className="bg-linear-to-r from-[#ffa98f] to-[#ff8566] px-3 py-1 rounded-full">
                      <p className="text-xs font-bold text-white">NOVO!</p>
                    </div>
                  </div>
                  <div className="absolute top-3 right-3">
                    <div className="bg-[rgba(255,255,255,0.9)] px-3 py-1 rounded-full">
                      <p className="text-xs text-[#0a0a0a]">{currentProfile.species || 'Pet'}</p>
                    </div>
                  </div>
                </div>

                {/* Informações */}
                <div className="p-5">
                  {/* Nome e informações */}
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h2 className="text-2xl font-bold text-[#0a0a0a]">
                        {currentProfile.name || 'Pet'}, {currentProfile.age || '-'}
                      </h2>
                      <p className="text-[#4a5565]">{currentProfile.breed || '-'}</p>
                    </div>
                    <div className="text-3xl">🐾</div>
                  </div>

                  {/* Localização */}
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="size-4 text-[#4a5565]" />
                    <p className="text-sm text-[#4a5565]">
                      {displayLocation}
                      {Number.isFinite(displayDistanceKm) && (
                        <span className="ml-2 text-[#6a7282]">
                          • {Number(displayDistanceKm).toFixed(1)} km
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Descrição */}
                  <p className="text-sm text-[#364153] mb-4 leading-relaxed">
                    {currentProfile.description || 'Sem descrição.'}
                  </p>

                  {/* Tutor */}
                  <div className="pt-4 border-t border-[#e5e7eb] flex items-center justify-between">
                    <div>
                      <p className="text-xs text-[#6a7282]">Tutor</p>
                      <p className="text-sm text-[#0a0a0a]">{displayTutorName}</p>
                    </div>
                    
                    {currentProfile.hasLikedYou && (
                      <div className="flex items-center gap-1 text-[#ffa98f]">
                        <Sparkles className="size-4" />
                        <p className="text-xs font-medium">Curtiu você!</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="flex items-center justify-center gap-3 sm:gap-4 mt-5 sm:mt-6">
                <button
                  onClick={handleReject}
                  className="size-14 sm:size-16 rounded-full border-4 border-[#ff6b6b] bg-white flex items-center justify-center hover:bg-[#fff5f5] transition-all hover:scale-110 active:scale-95"
                  aria-label="Rejeitar perfil"
                >
                  <X className="size-7 sm:size-8 text-[#ff6b6b]" />
                </button>
                <button
                  onClick={handleLike}
                  className="size-16 sm:size-20 rounded-full bg-linear-to-r from-[#ffa98f] to-[#ff8566] flex items-center justify-center hover:shadow-2xl transition-all hover:scale-110 active:scale-95"
                  aria-label="Curtir perfil"
                >
                  <Heart className="size-8 sm:size-10 text-white fill-white" />
                </button>
              </div>

              {/* Contador de Perfis */}
              <div className="text-center mt-4">
                <p className="text-sm text-[#6a7282]">
                  {currentIndex + 1} de {pets.length} perfis
                </p>
              </div>
            </div>
          ) : noProfiles ? (
            <div className="text-center">
              <div className="size-24 mx-auto mb-4 rounded-full bg-[rgba(255,169,143,0.13)] flex items-center justify-center">
                <Heart className="size-12 text-[#ffa98f]" />
              </div>
              <h2 className="text-2xl font-bold text-[#0a0a0a] mb-2">
                Nenhum perfil disponível
              </h2>
              <p className="text-[#4a5565] mb-6">
                Cadastre um pet para começar a encontrar matches 💕
              </p>
              <button
                onClick={handleGoRegister}
                className="btn btn-pill px-6 py-3"
              >
                Cadastrar pet
              </button>
            </div>
          ) : (
            <div className="text-center">
              <div className="size-24 mx-auto mb-4 rounded-full bg-[rgba(255,169,143,0.13)] flex items-center justify-center">
                <Heart className="size-12 text-[#ffa98f]" />
              </div>
              <h2 className="text-2xl font-bold text-[#0a0a0a] mb-2">
                Você viu todos os perfis!
              </h2>
              <p className="text-[#4a5565] mb-6">
                Volte mais tarde para ver novos pets 💕
              </p>
              <button
                onClick={handleGoMatches}
                className="btn btn-pill px-6 py-3"
              >
                Ver Meus Matches
              </button>
            </div>
          )}
        </main>

      {/* Notificação de Match */}
      {showMatchNotification && currentMatch && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-100 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 text-center animate-in zoom-in duration-500">
            <div className="size-24 mx-auto mb-6 rounded-full bg-linear-to-r from-[#ffa98f] to-[#ff8566] flex items-center justify-center animate-bounce">
              <Heart className="size-12 text-white fill-white" />
            </div>
            
            <h2 className="text-3xl font-bold text-[#0a0a0a] mb-3">
              É um Match! 🎉
            </h2>
            
            <p className="text-[#4a5565] mb-2">
              Você e <span className="font-bold text-[#0a0a0a]">{currentMatch.name || 'este pet'}</span>
            </p>
            {Number.isFinite(Number(currentMatch?.distanceKm)) && (
              <p className="text-xs text-[#6a7282] mb-2">
                Distância aproximada: {Number(currentMatch.distanceKm).toFixed(1)} km
              </p>
            )}
            <p className="text-[#4a5565] mb-8">
              demonstraram interesse mútuos!
            </p>

            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="size-20 rounded-full overflow-hidden border-4 border-white shadow-lg bg-slate-100 relative">
                {currentMatchImageUrl && !matchImageFailed ? (
                  <Image
                    src={currentMatchImageUrl}
                    alt={currentMatch.name || 'Pet'}
                    fill
                    sizes="80px"
                    className="object-cover"
                    onError={() => setMatchImageFailed(true)}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    🐾
                  </div>
                )}
              </div>
              <div className="size-16 rounded-full bg-linear-to-r from-[#ffa98f] to-[#ff8566] flex items-center justify-center">
                <Heart className="size-8 text-white fill-white" />
              </div>
              <div className="size-20 rounded-full bg-[#e5e7eb] flex items-center justify-center text-3xl">
                🐕
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={closeMatchNotification}
                className="btn-secondary btn-pill flex-1 px-4 py-3 border-2 border-[#e5e7eb] text-[#4a5565]"
              >
                Continuar
              </button>
              <button
                onClick={handleChatFromMatch}
                className="btn btn-pill flex-1 px-4 py-3"
              >
                Conversar
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </Layout>
  );
}
