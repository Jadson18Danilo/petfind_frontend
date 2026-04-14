/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect, useCallback } from 'react';
import { Heart, MapPin, X, Sparkles, Eye, MessageCircle, RotateCcw, User } from 'lucide-react';
import { likePet, listMatches, listReceivedLikes, openDirectChat } from '../src/services/matches';
import { listPets } from '../src/services/pets';
import { getMe, getMyAccess } from '../src/services/auth';
import { resolveMediaUrl } from '../src/services/media';
import { useRouter } from 'next/router';
import Layout from '../src/components/Layout';
import UpgradePlansModal from '../src/components/UpgradePlansModal';
import { showToast } from '../src/services/toast';

const IMAGE_DURATION_MS = 10000;
const MATCH_PREFS_KEY = 'matchPreferences';
const DAILY_LIKES_STORAGE_KEY = 'dailyLikesUsage';
const LIKED_PETS_DISMISSED_KEY = 'dismissedLikedPetsByActivePet';
const LIKED_PETS_SEEN_KEY = 'seenLikedPetsByActivePet';
const TUTOR_PREVIEW_STORAGE_KEY = 'matchTutorProfilePreview';
const FALLBACK_FREE_DAILY_LIKE_LIMIT = 2;

function getInitialDailyLikesState() {
  return {
    date: getTodayDateKey(),
    countsByPet: {},
  };
}

function getTodayDateKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalizeReadableValue(value) {
  if (value == null) return '';
  const text = String(value).trim();
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function resolveAvatarCandidate(value) {
  if (typeof value === 'string' && value.trim()) {
    const resolved = resolveMediaUrl(value);
    return typeof resolved === 'string' ? resolved : '';
  }

  if (value && typeof value === 'object') {
    if (typeof value.url === 'string' && value.url.trim()) {
      const resolved = resolveMediaUrl(value.url);
      return typeof resolved === 'string' ? resolved : '';
    }

    if (typeof value.avatar === 'string' && value.avatar.trim()) {
      const resolved = resolveMediaUrl(value.avatar);
      return typeof resolved === 'string' ? resolved : '';
    }
  }

  return '';
}

function getBirthDateFromProfile(profile) {
  const directBirthDate = String(profile?.birthDate || '').trim();
  if (directBirthDate) return directBirthDate;

  const description = String(profile?.description || '').replace(/\r/g, ' ').trim();
  const match = description.match(/\bdata\s+de\s+nascimento\s*:\s*(\d{4}-\d{2}-\d{2})/i);
  return match?.[1] ? match[1].trim() : '';
}

function getAgeInYearsFromDates(birthDateValue, referenceDateValue) {
  if (!birthDateValue) return null;

  const birthDate = new Date(birthDateValue);
  if (Number.isNaN(birthDate.getTime())) return null;

  const referenceDate = referenceDateValue ? new Date(referenceDateValue) : new Date();
  if (Number.isNaN(referenceDate.getTime())) return null;

  let ageYears = referenceDate.getFullYear() - birthDate.getFullYear();
  const monthDelta = referenceDate.getMonth() - birthDate.getMonth();

  if (monthDelta < 0 || (monthDelta === 0 && referenceDate.getDate() < birthDate.getDate())) {
    ageYears -= 1;
  }

  if (ageYears < 0) return 0;
  return ageYears;
}

function getProfileAgeYears(profile) {
  const birthDate = getBirthDateFromProfile(profile);
  const referenceDate = profile?.createdAt || null;
  return getAgeInYearsFromDates(birthDate, referenceDate);
}

function extractAboutOnly(fullText) {
  if (!fullText) return '';

  const metadataRegex = /\b(data\s+de\s+nascimento|sexo|peso|cor|porte|tamanho|temperamento|vacina[cç][aã]o|gen[ée]tica|alergias|medicamentos|objetivo|pai|m[ãa]e|pedigree\s+verificado|ninhadas|[úu]ltima\s+reprodu[cç][ãa]o|obs)\b\s*:/i;
  const metadataMatch = fullText.match(metadataRegex);

  let aboutText = metadataMatch
    ? fullText.slice(0, metadataMatch.index)
    : fullText;

  if (aboutText.includes('|')) {
    aboutText = aboutText
      .split('|')
      .map((part) => part.trim())
      .filter((part) => part && !metadataRegex.test(part))
      .join(' ');
  }

  return aboutText.replace(/\s+/g, ' ').trim();
}

function parseProfilePresentation(profile) {
  const rawDescription = String(profile?.description || '').replace(/\r/g, ' ').trim();
  const fields = {
    sexo: profile?.sex || profile?.sexo || '',
    peso: profile?.weight || profile?.peso || '',
    porte: profile?.porte || profile?.size || profile?.tamanho || '',
    temperamento: profile?.temperament || profile?.temperamento || '',
    pedigreeVerificado:
      typeof profile?.pedigreeVerified === 'boolean'
        ? profile.pedigreeVerified
        : profile?.pedigreeVerificado,
  };

  const fieldLabels = {
    sexo: ['Sexo'],
    peso: ['Peso'],
    porte: ['Porte', 'Tamanho'],
    temperamento: ['Temperamento'],
    pedigreeVerificado: ['Pedigree verificado'],
  };
  const hiddenOnlyLabels = [
    'Cor',
    'Objetivo',
    'Data de nascimento',
    'Vacinação',
    'Vacinacao',
    'Genética',
    'Genetica',
    'Alergias',
    'Medicamentos',
    'Pai',
    'Mãe',
    'Mae',
    'Ninhadas',
    'Última reprodução',
    'Ultima reprodução',
    'Ultima reproducao',
    'Obs',
  ];

  Object.entries(fieldLabels).forEach(([key, labels]) => {
    if (fields[key]) return;
    for (const label of labels) {
      const pattern = new RegExp(`\\b${escapeRegex(label)}\\s*:\\s*([^|\\n]+)`, 'i');
      const match = rawDescription.match(pattern);
      if (match?.[1]) {
        fields[key] = match[1].trim();
        break;
      }
    }
  });

  let cleanBio = rawDescription;
  [...Object.values(fieldLabels).flat(), ...hiddenOnlyLabels].forEach((label) => {
    const cleanupPattern = new RegExp(`\\s*${escapeRegex(label)}\\s*:\\s*([^|\\n]+)`, 'ig');
    cleanBio = cleanBio.replace(cleanupPattern, ' ');
  });

  cleanBio = extractAboutOnly(cleanBio)
    .replace(/\s*\|\s*/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();

  const isPedigreeVerified =
    typeof fields.pedigreeVerificado === 'boolean'
      ? fields.pedigreeVerificado
      : /^(sim|yes|true|1)$/i.test(String(fields.pedigreeVerificado || '').trim());

  const tags = [
    fields.sexo ? `Sexo: ${normalizeReadableValue(fields.sexo)}` : null,
    fields.peso ? `Peso: ${fields.peso}` : null,
    fields.porte ? `Porte: ${normalizeReadableValue(fields.porte)}` : null,
    fields.temperamento ? `Temperamento: ${fields.temperamento}` : null,
    `Pedigree: ${isPedigreeVerified ? 'Verificado' : 'Não verificado'}`,
  ].filter(Boolean);

  return {
    bio: cleanBio,
    tags,
  };
}

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
  const [accessProfile, setAccessProfile] = useState(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState('likes-limit');
  const [dailyLikeUsage, setDailyLikeUsage] = useState(getInitialDailyLikesState());
  const [likesHydrated, setLikesHydrated] = useState(false);
  const [activeTab, setActiveTab] = useState('matches');
  const [likedPets, setLikedPets] = useState([]);
  const [unseenLikedCount, setUnseenLikedCount] = useState(0);
  const [likedImageFailedMap, setLikedImageFailedMap] = useState({});
  const [swipeHistory, setSwipeHistory] = useState([]);
  const [lastNotifiedUnseenCount, setLastNotifiedUnseenCount] = useState(0);

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
  const displayTutorAvatar =
    resolveAvatarCandidate(currentProfile?.tutorAvatar)
    || resolveAvatarCandidate(currentProfile?.tutor?.avatar)
    || resolveAvatarCandidate(currentProfile?.owner?.avatar)
    || resolveAvatarCandidate(currentProfile?.User?.avatar)
    || resolveAvatarCandidate(currentProfile?.ownerAvatar)
    || '';
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
  const currentProfilePresentation = parseProfilePresentation(currentProfile);
  const currentProfileAgeYears = getProfileAgeYears(currentProfile);
  const displayAgeYears = Number.isFinite(currentProfileAgeYears) ? currentProfileAgeYears : null;
  const hasMoreProfiles = currentIndex < pets.length - 1;
  const noProfiles = !loading && !error && pets.length === 0;
  const activePetId = selectedPet?.id ?? currentPetId;
  const activePetStorageKey = activePetId != null ? String(activePetId) : null;
  const activePetDailyLikesCount = activePetStorageKey
    ? Number(dailyLikeUsage?.countsByPet?.[activePetStorageKey] || 0)
    : 0;
  const [cardImageFailed, setCardImageFailed] = useState(false);
  const [matchImageFailed, setMatchImageFailed] = useState(false);
  const currentTier = accessProfile?.tier || 'free';
  const isPremiumUser = currentTier === 'premium' || currentTier === 'admin';
  const entitlements = accessProfile?.entitlements || {};
  const freeDailyLikeLimit = Number.isFinite(Number(entitlements?.dailyLikeLimit))
    ? Number(entitlements.dailyLikeLimit)
    : null;
  const reachedLikeLimit =
    freeDailyLikeLimit != null &&
    freeDailyLikeLimit >= 0 &&
    Number(activePetDailyLikesCount || 0) >= freeDailyLikeLimit;

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

  const readDismissedLikedPetIds = useCallback((petId) => {
    if (typeof window === 'undefined' || petId == null) return new Set();

    try {
      const parsed = JSON.parse(window.localStorage.getItem(LIKED_PETS_DISMISSED_KEY) || '{}');
      const ids = Array.isArray(parsed?.[String(petId)]) ? parsed[String(petId)] : [];
      return new Set(ids.map((value) => Number(value)).filter(Number.isFinite));
    } catch {
      return new Set();
    }
  }, []);

  const persistDismissedLikedPetId = useCallback((basePetId, dismissedPetId) => {
    if (typeof window === 'undefined' || basePetId == null) return;

    try {
      const parsed = JSON.parse(window.localStorage.getItem(LIKED_PETS_DISMISSED_KEY) || '{}');
      const baseKey = String(basePetId);
      const currentIds = Array.isArray(parsed?.[baseKey])
        ? parsed[baseKey].map((value) => Number(value)).filter(Number.isFinite)
        : [];
      const nextSet = new Set([...currentIds, Number(dismissedPetId)]);

      parsed[baseKey] = [...nextSet];
      window.localStorage.setItem(LIKED_PETS_DISMISSED_KEY, JSON.stringify(parsed));
    } catch {
      // noop
    }
  }, []);

  const readSeenLikedPetIds = useCallback((petId) => {
    if (typeof window === 'undefined' || petId == null) return new Set();

    try {
      const parsed = JSON.parse(window.localStorage.getItem(LIKED_PETS_SEEN_KEY) || '{}');
      const ids = Array.isArray(parsed?.[String(petId)]) ? parsed[String(petId)] : [];
      return new Set(ids.map((value) => Number(value)).filter(Number.isFinite));
    } catch {
      return new Set();
    }
  }, []);

  const persistSeenLikedPetIds = useCallback((basePetId, likedPetIds) => {
    if (typeof window === 'undefined' || basePetId == null) return;

    try {
      const parsed = JSON.parse(window.localStorage.getItem(LIKED_PETS_SEEN_KEY) || '{}');
      const baseKey = String(basePetId);
      const previousIds = Array.isArray(parsed?.[baseKey])
        ? parsed[baseKey].map((value) => Number(value)).filter(Number.isFinite)
        : [];
      const nextIds = Array.isArray(likedPetIds)
        ? likedPetIds.map((value) => Number(value)).filter(Number.isFinite)
        : [];

      parsed[baseKey] = [...new Set([...previousIds, ...nextIds])];
      window.localStorage.setItem(LIKED_PETS_SEEN_KEY, JSON.stringify(parsed));
    } catch {
      // noop
    }
  }, []);

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
    if (typeof window === 'undefined') return;

    try {
      const saved = JSON.parse(window.localStorage.getItem(DAILY_LIKES_STORAGE_KEY) || '{}');
      const today = getTodayDateKey();
      const persistedDate = typeof saved.date === 'string' ? saved.date : '';

      if (persistedDate === today && saved && typeof saved === 'object') {
        const rawCounts = saved.countsByPet;
        const normalizedCounts = {};

        if (rawCounts && typeof rawCounts === 'object') {
          Object.keys(rawCounts).forEach((key) => {
            const numericCount = Number(rawCounts[key]);
            normalizedCounts[key] = Number.isFinite(numericCount) && numericCount > 0 ? numericCount : 0;
          });
        }

        setDailyLikeUsage({
          date: today,
          countsByPet: normalizedCounts,
        });
      } else {
        const resetUsage = getInitialDailyLikesState();
        setDailyLikeUsage(resetUsage);
        window.localStorage.setItem(DAILY_LIKES_STORAGE_KEY, JSON.stringify(resetUsage));
      }
    } catch {
      const fallbackUsage = getInitialDailyLikesState();
      setDailyLikeUsage(fallbackUsage);
      window.localStorage.setItem(DAILY_LIKES_STORAGE_KEY, JSON.stringify(fallbackUsage));
    } finally {
      setLikesHydrated(true);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    async function fetchAccess() {
      try {
        const access = await getMyAccess();
        if (!mounted) return;
        setAccessProfile(access || null);
      } catch {
        if (!mounted) return;
        setAccessProfile({
          tier: 'free',
          role: 'user',
          entitlements: {
            canLike: true,
            dailyLikeLimit: FALLBACK_FREE_DAILY_LIKE_LIMIT,
            canSeeWhoLiked: false,
            canRelikeRejected: false,
            canDirectChat: false,
            canAccessAdminPanel: false,
          },
        });
      }
    }

    fetchAccess();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!likesHydrated) return;
    window.localStorage.setItem(DAILY_LIKES_STORAGE_KEY, JSON.stringify(dailyLikeUsage));
  }, [dailyLikeUsage, likesHydrated]);

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
        setLikedImageFailedMap({});

        if (!activePet) {
          const publicCandidates = allPets.filter((pet) => {
            if (myUserId != null && Number(pet.ownerId) === myUserId) return false;
            return true;
          });

          setPets(publicCandidates);
          setLikedPets([]);
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

  useEffect(() => {
    if (!activePetId) {
      setLikedPets([]);
      setUnseenLikedCount(0);
      setLastNotifiedUnseenCount(0);
      return;
    }

    let mounted = true;

    async function refreshLikedPets() {
      const receivedLikes = await listReceivedLikes(activePetId).catch(() => []);
      if (!mounted) return;

      const dismissedLikedPetIds = readDismissedLikedPetIds(activePetId);
      const uniqueLikedPets = [];
      const dedupe = new Set();

      receivedLikes.forEach((pet) => {
        const petId = Number(pet?.id);
        if (!Number.isFinite(petId)) return;
        if (petId === Number(activePetId)) return;
        if (dismissedLikedPetIds.has(petId)) return;
        if (dedupe.has(petId)) return;

        dedupe.add(petId);
        uniqueLikedPets.push(pet);
      });

      setLikedPets(uniqueLikedPets);

      const allLikedPetIds = uniqueLikedPets
        .map((pet) => Number(pet?.id))
        .filter(Number.isFinite);

      if (activeTab === 'curtiram') {
        persistSeenLikedPetIds(activePetId, allLikedPetIds);
        setUnseenLikedCount(0);
        setLastNotifiedUnseenCount(0);
        return;
      }

      const seenLikedPetIds = readSeenLikedPetIds(activePetId);
      const unseenCount = allLikedPetIds.filter((petId) => !seenLikedPetIds.has(petId)).length;
      setUnseenLikedCount(unseenCount);

      if (unseenCount > lastNotifiedUnseenCount) {
        const delta = unseenCount - lastNotifiedUnseenCount;
        const message = delta === 1
          ? 'Você recebeu uma nova curtida!'
          : `Você recebeu ${delta} novas curtidas!`;
        showToast(message, 'success');
      }

      if (unseenCount !== lastNotifiedUnseenCount) {
        setLastNotifiedUnseenCount(unseenCount);
      }
    }

    refreshLikedPets();

    const intervalId = setInterval(refreshLikedPets, 15000);
    const handleFocus = () => refreshLikedPets();

    if (typeof window !== 'undefined') {
      window.addEventListener('focus', handleFocus);
    }

    return () => {
      mounted = false;
      clearInterval(intervalId);
      if (typeof window !== 'undefined') {
        window.removeEventListener('focus', handleFocus);
      }
    };
  }, [
    activePetId,
    activeTab,
    lastNotifiedUnseenCount,
    persistSeenLikedPetIds,
    readDismissedLikedPetIds,
    readSeenLikedPetIds,
  ]);

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

    if (direction === 'right' && !activePetId) {
      showToast('Selecione um pet ativo antes de curtir perfis.', 'error');
      setSelectionIssue('Selecione um pet no seu perfil para registrar curtidas e gerar matches.');
      return;
    }

    if (direction === 'right' && reachedLikeLimit) {
      setUpgradeReason('likes-limit');
      setShowUpgradeModal(true);
      return;
    }

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

        setDailyLikeUsage((previousUsage) => {
          const today = getTodayDateKey();
          const isSameDay = previousUsage?.date === today;
          const currentCounts = isSameDay && previousUsage?.countsByPet && typeof previousUsage.countsByPet === 'object'
            ? previousUsage.countsByPet
            : {};
          const petKey = String(activePetId);
          const nextCount = Number(currentCounts[petKey] || 0) + 1;

          return {
            date: today,
            countsByPet: {
              ...currentCounts,
              [petKey]: nextCount,
            },
          };
        });
      } catch (err) {
        const status = err?.response?.status;
        if (status === 402 || status === 403 || status === 429) {
          setUpgradeReason('likes-limit');
          setShowUpgradeModal(true);
        } else {
          showToast('Não foi possível registrar sua curtida agora.', 'error');
        }
      }
    }

    setTimeout(() => {
      setSwipeDirection(null);
      if (hasMoreProfiles) {
        setSwipeHistory((previous) => [...previous, currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }
    }, 300);
  };

  const handleLike = () => handleSwipe('right');
  const handleReject = () => handleSwipe('left');

  const handleUndoSwipe = () => {
    if (!isPremiumUser) {
      setUpgradeReason('chat-locked');
      setShowUpgradeModal(true);
      return;
    }

    if (swipeHistory.length === 0) {
      showToast('Não há perfil anterior para voltar agora.', 'info');
      return;
    }

    const previousIndex = swipeHistory[swipeHistory.length - 1];
    setSwipeHistory((previous) => previous.slice(0, -1));
    setSwipeDirection(null);
    setCurrentIndex(previousIndex);
  };

  const handleDirectChat = async () => {
    if (!currentProfile) return;

    if (!entitlements?.canDirectChat && currentTier !== 'admin') {
      setUpgradeReason('chat-locked');
      setShowUpgradeModal(true);
      return;
    }

    if (!activePetId) {
      showToast('Selecione um pet ativo para iniciar conversa.', 'error');
      setSelectionIssue('Selecione um pet no seu perfil para abrir o chat direto.');
      return;
    }

    try {
      const response = await openDirectChat(currentProfile.id, activePetId);
      const directMatchId = response?.match?.id;

      if (!directMatchId) {
        showToast('Não foi possível abrir a conversa agora.', 'error');
        return;
      }

      if (onNavigateToChat) {
        onNavigateToChat({ matchId: directMatchId, source: 'direct-chat' });
        return;
      }

      router.push({
        pathname: '/chat-on',
        query: { matchId: String(directMatchId) },
      });
    } catch (err) {
      const status = err?.response?.status;
      if (status === 402 || status === 403 || status === 429) {
        setUpgradeReason('chat-locked');
        setShowUpgradeModal(true);
        return;
      }

      showToast('Não foi possível iniciar o chat direto agora.', 'error');
    }
  };

  const closeMatchNotification = () => {
    setShowMatchNotification(false);
    setCurrentMatch(null);
  };

  const handleChatFromMatch = () => {
    if (!entitlements?.canDirectChat && currentTier !== 'admin') {
      setUpgradeReason('chat-locked');
      setShowUpgradeModal(true);
      return;
    }

    closeMatchNotification();
    if (onNavigateToChat) return onNavigateToChat();
    router.push('/chat-on');
  };

  const handleSelectPlan = (plan) => {
    const monthlyUrl = process.env.NEXT_PUBLIC_STRIPE_MONTHLY_URL || '';
    const annualUrl = process.env.NEXT_PUBLIC_STRIPE_ANNUAL_URL || '';

    if (plan === 'monthly' && monthlyUrl) {
      window.location.href = monthlyUrl;
      return;
    }

    if (plan === 'annual' && annualUrl) {
      window.location.href = annualUrl;
      return;
    }

    showToast('Checkout Stripe será conectado na próxima etapa.', 'info');
    setShowUpgradeModal(false);
  };

  const handlePremiumAction = () => {
    if (isPremiumUser) {
      if (onNavigateToChat) return onNavigateToChat();
      router.push('/chat-on');
      return;
    }

    setUpgradeReason('chat-locked');
    setShowUpgradeModal(true);
  };

  const handleRejectLikedPet = (petId) => {
    const numericPetId = Number(petId);
    setLikedPets((previous) => previous.filter((pet) => Number(pet.id) !== numericPetId));

    const basePetId = selectedPet?.id ?? currentPetId;
    if (basePetId != null) {
      persistDismissedLikedPetId(basePetId, numericPetId);
    }
  };

  const handleLikedImageError = (petId) => {
    setLikedImageFailedMap((previous) => ({
      ...previous,
      [petId]: true,
    }));
  };

  const handleViewLikedPet = async (pet) => {
    if (!pet) return;

    if (!isPremiumUser) {
      setUpgradeReason('chat-locked');
      setShowUpgradeModal(true);
      return;
    }

    if (!activePetId) {
      setSelectionIssue('Selecione um pet ativo para visualizar quem curtiu.');
      return;
    }

    try {
      await likePet(pet.id, activePetId);
    } catch {
      // noop: segue para lista de matches mesmo com like já existente
    }

    setLikedPets((previous) => previous.filter((candidate) => Number(candidate.id) !== Number(pet.id)));

    router.push({
      pathname: '/matches',
      query: {
        petId: String(pet.id),
        from: 'curtiram',
      },
    });
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

  const handleOpenTutorProfile = () => {
    if (!currentProfile) return;

    if (!isPremiumUser) {
      setUpgradeReason('chat-locked');
      setShowUpgradeModal(true);
      return;
    }

    if (typeof window !== 'undefined') {
      const previewPayload = {
        tutorName: displayTutorName,
        tutorAvatar: displayTutorAvatar || null,
        tutorEmail: currentProfile?.tutor?.email || currentProfile?.owner?.email || currentProfile?.User?.email || null,
        tutorPhone: currentProfile?.tutor?.phone || currentProfile?.owner?.phone || currentProfile?.User?.phone || null,
        location: displayLocation,
        pet: {
          id: currentProfile?.id,
          name: currentProfile?.name,
          breed: currentProfile?.breed,
          species: currentProfile?.species,
          description: currentProfile?.description,
          image: currentImageUrl || getImageUrl(currentProfile) || null,
        },
      };

      window.localStorage.setItem(TUTOR_PREVIEW_STORAGE_KEY, JSON.stringify(previewPayload));
    }

    router.push('/tutor-public');
  };

  return (
    <Layout>
      <div className="min-h-screen page-bg">
        {/* Main Content */}
        <main className="flex-1 flex justify-center px-4 sm:px-6 py-6 sm:py-8 min-h-screen">
          <div className="w-full max-w-5xl flex flex-col items-center">
            <div className="sticky top-2 z-30 mb-4 sm:mb-5 w-full">
              <div className="mx-auto flex w-full max-w-md justify-center gap-0 rounded-xl bg-white p-1 shadow-sm">
                <button
                  type="button"
                  onClick={() => setActiveTab('matches')}
                  className={`flex-1 rounded-l-[10px] px-8 py-2.5 font-semibold transition-all ${
                    activeTab === 'matches'
                      ? 'bg-linear-to-r from-[#FFA98F] to-[#FF8566] text-white shadow-lg'
                      : 'bg-white text-[#4A5565] hover:bg-white/80'
                  }`}
                >
                  Matches
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('curtiram')}
                  className={`relative flex-1 rounded-r-[10px] px-8 py-2.5 font-semibold transition-all ${
                    activeTab === 'curtiram'
                      ? 'bg-linear-to-r from-[#FFA98F] to-[#FF8566] text-white shadow-lg'
                      : 'bg-white text-[#4A5565] hover:bg-white/80'
                  }`}
                >
                  Curtiram
                  {unseenLikedCount > 0 && (
                    <span className="absolute -top-2 -right-2 size-6 rounded-full bg-linear-to-r from-[#ffa98f] to-[#ff8566] text-white text-xs flex items-center justify-center font-bold shadow-lg animate-pulse">
                      {unseenLikedCount}
                    </span>
                  )}
                </button>
              </div>
            </div>

            <div className={activeTab === 'matches' ? 'w-full flex justify-center' : 'hidden'}>
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
                    <img
                      src={currentImageUrl}
                      alt={currentProfile.name || 'Pet'}
                      className="w-full h-full object-cover"
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
                  
                </div>

                {/* Informações */}
                <div className="p-5">
                  {/* Nome e informações */}
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h2 className="text-2xl font-bold text-[#0a0a0a]">
                        {currentProfile.name || 'Pet'}, {displayAgeYears ?? '-'}
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
                  <p className="text-sm text-[#364153] mb-3 leading-relaxed">
                    {currentProfilePresentation.bio}
                  </p>

                  <div className="mb-4 flex flex-wrap gap-2">
                    {currentProfilePresentation.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center rounded-full border border-[#ffa98f] bg-[rgba(255,169,143,0.12)] px-2.5 py-1 text-xs font-medium text-[#ffa98f]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Tutor */}
                  <div className="pt-4 border-t border-[#e5e7eb] flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="size-8 rounded-full overflow-hidden bg-[#f3f4f6] shrink-0">
                        {displayTutorAvatar ? (
                          <img
                            src={toAbsoluteUrl(displayTutorAvatar)}
                            alt={displayTutorName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[11px] text-[#6a7282]">👤</div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-[#6a7282]">Tutor</p>
                        <p className="text-sm text-[#0a0a0a] truncate">{displayTutorName}</p>
                      </div>
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
              <div className="flex items-center justify-center gap-2 sm:gap-3 mt-5 sm:mt-6">
                <button
                  onClick={handleUndoSwipe}
                  className="size-11 sm:size-12 rounded-full border-2 border-[#f1d4cb] bg-white flex items-center justify-center hover:bg-[#fff7f4] transition-all hover:scale-105 active:scale-95"
                  aria-label="Voltar ao perfil anterior"
                  title="Voltar (premium)"
                >
                  <RotateCcw className="size-5 sm:size-5.5 text-[#c78d7a]" />
                </button>
                <button
                  onClick={handleReject}
                  className="size-14 sm:size-16 rounded-full border-4 border-[#ff6b6b] bg-white flex items-center justify-center hover:bg-[#fff5f5] transition-all hover:scale-110 active:scale-95"
                  aria-label="Rejeitar perfil"
                >
                  <X className="size-7 sm:size-8 text-[#ff6b6b]" />
                </button>
                <button
                  onClick={handleDirectChat}
                  className="size-18 sm:size-22 rounded-full border-4 border-[#7c8bff] bg-white flex items-center justify-center hover:bg-[#f4f6ff] transition-all hover:scale-110 active:scale-95 shadow-lg"
                  aria-label="Abrir chat direto"
                  title="Chat direto"
                >
                  <MessageCircle className="size-9 sm:size-11 text-[#7c8bff]" />
                </button>
                <button
                  onClick={handleLike}
                  className="size-14 sm:size-16 rounded-full bg-linear-to-r from-[#ffa98f] to-[#ff8566] flex items-center justify-center hover:shadow-2xl transition-all hover:scale-110 active:scale-95"
                  aria-label="Curtir perfil"
                >
                  <Heart className="size-7 sm:size-8 text-white fill-white" />
                </button>
                <button
                  onClick={handleOpenTutorProfile}
                  className="size-11 sm:size-12 rounded-full border-2 border-[#d7c8f6] bg-white flex items-center justify-center hover:bg-[#f8f4ff] transition-all hover:scale-105 active:scale-95"
                  aria-label="Ver perfil do tutor"
                  title="Perfil do tutor (premium)"
                >
                  <User className="size-5 sm:size-5.5 text-[#8d6dc4]" />
                </button>
              </div>

              {/* Contador de Perfis */}
              <div className="text-center mt-4">
                <p className="text-sm text-[#6a7282]">
                  {currentIndex + 1} de {pets.length} perfis
                </p>
                {freeDailyLikeLimit != null && currentTier === 'free' && (
                  <p className="text-xs text-[#ff8566] mt-1">
                    Curtidas hoje: {activePetDailyLikesCount}/{freeDailyLikeLimit}
                  </p>
                )}
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
            </div>
            {activeTab === 'curtiram' && (
              <div className="flex-1 min-h-0 w-full">
                {loading ? (
                  <div className="h-full overflow-y-auto pr-1">
                    <div className="flex flex-wrap justify-center gap-4">
                      {Array.from({ length: 6 }).map((_, index) => (
                        <div key={index} className="mx-auto w-full max-w-72 rounded-2xl bg-white p-3 shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] animate-pulse">
                          <div className="h-56 bg-slate-100 rounded-xl" />
                          <div className="mt-3 space-y-2">
                            <div className="h-4 w-3/4 rounded bg-slate-100" />
                            <div className="h-3 w-full rounded bg-slate-100" />
                            <div className="h-3 w-5/6 rounded bg-slate-100" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : error ? (
                  <div className="h-full flex items-center justify-center text-center">
                    <p className="text-red-500">Erro ao carregar curtidas recebidas.</p>
                  </div>
                ) : !selectedPet ? (
                  <div className="h-full flex items-center justify-center text-center py-6">
                    <div>
                      <p className="text-[#4a5565]">Selecione um pet no seu perfil para ver quem curtiu.</p>
                      <button onClick={handleGoPerfil} className="mt-4 btn btn-pill px-6 py-3">Ir para perfil</button>
                    </div>
                  </div>
                ) : !isPremiumUser ? (
                  <div className="h-full flex items-center justify-center text-center py-6">
                    <div>
                      <div className="size-24 mx-auto mb-4 rounded-full bg-[rgba(255,169,143,0.13)] flex items-center justify-center">
                        <Eye className="size-12 text-[#ffa98f]" />
                      </div>
                      <h2 className="text-2xl font-bold text-[#0a0a0a] mb-2">Ver quem curtiu é premium</h2>
                      <p className="text-[#4a5565] mb-5">
                        Faça upgrade para desbloquear a visualização de quem curtiu seu pet.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setUpgradeReason('chat-locked');
                          setShowUpgradeModal(true);
                        }}
                        className="btn btn-pill px-6 py-3"
                      >
                        Ver planos premium
                      </button>
                    </div>
                  </div>
                ) : likedPets.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-center py-6">
                    <div>
                      <div className="size-24 mx-auto mb-4 rounded-full bg-[rgba(255,169,143,0.13)] flex items-center justify-center">
                        <Heart className="size-12 text-[#ffa98f]" />
                      </div>
                      <h2 className="text-2xl font-bold text-[#0a0a0a] mb-2">Nenhuma curtida por aqui</h2>
                      <p className="text-[#4a5565]">Quando alguém curtir seu pet, aparece nesta aba.</p>
                    </div>
                  </div>
                ) : (
                  <div className="h-full overflow-y-auto pr-1">
                    <div className="flex flex-wrap justify-center gap-4 pb-2">
                      {likedPets.map((pet) => {
                        const likedImageUrl = getImageUrl(pet);
                        const likedImageFailed = likedImageFailedMap?.[pet.id] === true;
                        const likedLocation =
                          (pet?.location || '').toString().trim() ||
                          [pet?.neighborhood || pet?.bairro, pet?.city || pet?.cidade, pet?.state || pet?.estado]
                            .filter(Boolean)
                            .join(', ') ||
                          'Localização não informada';
                        const likedTutorName =
                          (pet?.tutorName || '').toString().trim() ||
                          pet?.tutor?.name ||
                          pet?.owner?.name ||
                          pet?.User?.name ||
                          'Tutor';

                        return (
                          <article
                            key={pet.id}
                            className="group mx-auto w-full max-w-72 rounded-2xl bg-white shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)]"
                          >
                            <div className="relative h-56 overflow-hidden rounded-t-2xl bg-slate-100">
                              {likedImageUrl && !likedImageFailed ? (
                                <img
                                  src={likedImageUrl}
                                  alt={pet.name || 'Pet'}
                                  className={`object-cover transition-all duration-300 ${isPremiumUser ? 'group-hover:scale-105' : 'blur-xl scale-110'}`}
                                  onError={() => handleLikedImageError(pet.id)}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">
                                  Sem foto
                                </div>
                              )}

                              {!isPremiumUser && (
                                <div className="absolute inset-0 flex items-center justify-center bg-[rgba(10,10,10,0.18)]">
                                  <div className="size-12 rounded-full bg-white/95 shadow-lg flex items-center justify-center">
                                    <Eye className="size-6 text-[#ff8566]" />
                                  </div>
                                </div>
                              )}
                            </div>

                            <div className="p-3">
                              <h3 className="text-sm font-semibold text-[#0a0a0a] truncate">{pet.name || 'Pet'}</h3>
                              <p className="mt-0.5 text-xs text-[#6a7282]">{pet?.breed || pet?.raca || 'Raça não informada'}</p>
                              <p className="mt-2 text-xs text-[#4a5565]"><span className="font-semibold">Tutor:</span> {likedTutorName}</p>
                              <p className="mt-1 text-xs text-[#4a5565]">{likedLocation}</p>

                              {!isPremiumUser && (
                                <p className="mt-2 text-xs font-medium text-[#ff8566]">
                                  Assine o premium para desbloquear quem curtiu você.
                                </p>
                              )}

                              <div className="mt-3 grid grid-cols-2 gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleRejectLikedPet(pet.id)}
                                  className="h-10 rounded-[10px] bg-[#f3f4f6] hover:bg-[#e5e7eb] text-[#4a5565] flex items-center justify-center transition-colors"
                                  aria-label="Recusar curtida"
                                >
                                  <X className="size-5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleViewLikedPet(pet)}
                                  className="h-10 rounded-[10px] bg-linear-to-r from-[#ffa98f] to-[#ff8566] text-white font-semibold hover:shadow-lg flex items-center justify-center gap-1.5 transition-all"
                                >
                                  <Eye className="size-4" />
                                  Ver
                                </button>
                              </div>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
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
                  <img
                    src={currentMatchImageUrl}
                    alt={currentMatch.name || 'Pet'}
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

      <UpgradePlansModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onSelectPlan={handleSelectPlan}
        currentTier={currentTier}
        reason={upgradeReason}
      />
      </div>
    </Layout>
  );
}
