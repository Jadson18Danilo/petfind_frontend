import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  Activity,
  Award,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Dna,
  Edit2,
  FileText,
  LogOut,
  Mail,
  MoreVertical,
  Phone,
  Plus,
  Settings,
  Share2,
  Shield,
  Syringe,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useRouter } from "next/router";
import Header from "../src/components/Header";
import { getMe, logoutUser } from "../src/services/auth";
import { deletePet, listPets } from "../src/services/pets";
import { showToast } from "../src/services/toast";

function parseListField(text) {
  if (!text) return [];
  return text
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseDescription(description) {
  const parsed = {
    about: "",
    dataNascimento: "",
    peso: "",
    cor: "",
    tamanho: "",
    temperamento: [],
    vacinacao: [],
    genetica: [],
    alergias: [],
    medicamentos: [],
    objetivo: "",
    pedigreePai: "",
    pedigreeMae: "",
    pedigreeVerificado: false,
    ninhadas: "",
    ultimaReproducao: "",
    observacoesReproducao: "",
  };

  if (!description || typeof description !== "string") return parsed;

  const blocks = description.split("\n\n").map((part) => part.trim()).filter(Boolean);
  parsed.about = blocks[0] || "";

  const joined = blocks.join(" | ");
  const parts = joined.split("|").map((item) => item.trim()).filter(Boolean);

  parts.forEach((item) => {
    if (item.startsWith("Data de nascimento:")) parsed.dataNascimento = item.replace("Data de nascimento:", "").trim();
    if (item.startsWith("Peso:")) parsed.peso = item.replace("Peso:", "").trim();
    if (item.startsWith("Cor:")) parsed.cor = item.replace("Cor:", "").trim();
    if (item.startsWith("Tamanho:")) parsed.tamanho = item.replace("Tamanho:", "").trim();
    if (item.startsWith("Temperamento:")) parsed.temperamento = parseListField(item.replace("Temperamento:", ""));
    if (item.startsWith("Vacinação:")) parsed.vacinacao = parseListField(item.replace("Vacinação:", ""));
    if (item.startsWith("Genética:")) parsed.genetica = parseListField(item.replace("Genética:", ""));
    if (item.startsWith("Alergias:")) parsed.alergias = parseListField(item.replace("Alergias:", ""));
    if (item.startsWith("Medicamentos:")) parsed.medicamentos = parseListField(item.replace("Medicamentos:", ""));
    if (item.startsWith("Objetivo:")) parsed.objetivo = item.replace("Objetivo:", "").trim();
    if (item.startsWith("Pai:")) parsed.pedigreePai = item.replace("Pai:", "").trim();
    if (item.startsWith("Mãe:")) parsed.pedigreeMae = item.replace("Mãe:", "").trim();
    if (item.startsWith("Pedigree verificado:")) {
      parsed.pedigreeVerificado = item.toLowerCase().includes("sim");
    }
    if (item.startsWith("Ninhadas:")) parsed.ninhadas = item.replace("Ninhadas:", "").trim();
    if (item.startsWith("Última reprodução:")) parsed.ultimaReproducao = item.replace("Última reprodução:", "").trim();
    if (item.startsWith("Obs:")) parsed.observacoesReproducao = item.replace("Obs:", "").trim();
  });

  return parsed;
}

function formatBirthDate(ageMonths) {
  const months = Number(ageMonths);
  if (!Number.isFinite(months)) return "";
  const date = new Date();
  date.setMonth(date.getMonth() - months);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDateForDisplay(value) {
  if (!value || typeof value !== "string") return "";

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-");
    return `${day}/${month}/${year}`;
  }

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
    return value;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("pt-BR");
}

export default function PerfilTutor({
  onNavigateToMatches,
  onNavigateToEditarPet,
  onNavigateToEditarTutor,
  onEditProfile,
  onSettings,
  onLogout,
  onNavigateToCadastrarPet,
  tutorData,
}) {
  const router = useRouter();

  const [me, setMe] = useState(null);
  const [pets, setPets] = useState([]);
  const [selectedPetId, setSelectedPetId] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showMenu, setShowMenu] = useState(false);
  const [petMenuOpen, setPetMenuOpen] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);

  const tutorMenuRef = useRef(null);
  const petMenuRefs = useRef({});

  useEffect(() => {
    let mounted = true;

    async function loadProfile() {
      try {
        const [meData, allPets] = await Promise.all([getMe(), listPets()]);
        if (!mounted) return;

        setMe(meData);

        const ownedPets = Array.isArray(allPets)
          ? allPets.filter((pet) => pet.ownerId === meData?.id)
          : [];

        setPets(ownedPets);

        const storedId = typeof window !== "undefined"
          ? Number(window.localStorage.getItem("activePetId"))
          : null;
        const hasStored = storedId && ownedPets.some((pet) => pet.id === storedId);
        const initialId = hasStored ? storedId : (ownedPets[0]?.id ?? null);

        setSelectedPetId(initialId);

        if (typeof window !== "undefined") {
          if (initialId) window.localStorage.setItem("activePetId", String(initialId));
          else window.localStorage.removeItem("activePetId");
        }
      } catch {
        if (!mounted) return;
        setMe(null);
        setPets([]);
        setSelectedPetId(null);
      }
    }

    loadProfile();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (showMenu && tutorMenuRef.current && !tutorMenuRef.current.contains(event.target)) {
        setShowMenu(false);
      }

      if (petMenuOpen !== null) {
        const menuElement = petMenuRefs.current[petMenuOpen];
        if (menuElement && !menuElement.contains(event.target)) {
          setPetMenuOpen(null);
        }
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMenu, petMenuOpen]);

  const mappedPets = useMemo(() => {
    if (!Array.isArray(pets)) return [];

    return pets.map((pet) => {
      const parsed = parseDescription(pet.description || "");
      const images = [pet.mainPhoto, ...(Array.isArray(pet.additionalPhotos) ? pet.additionalPhotos : [])].filter(Boolean);

      return {
        id: pet.id,
        name: pet.name || "-",
        species: pet.species || "-",
        breed: pet.breed || "-",
        sex: pet.sex || "-",
        birthDate: pet.birthDate || parsed.dataNascimento || formatBirthDate(pet.ageMonths),
        images,
        about: parsed.about,
        weight: parsed.peso,
        color: parsed.cor,
        size: parsed.tamanho,
        temperament: parsed.temperamento,
        objective: parsed.objetivo,
        healthHistory: {
          vaccinations: parsed.vacinacao,
          genetics: parsed.genetica,
          allergies: parsed.alergias,
          medications: parsed.medicamentos,
        },
        pedigree: {
          hasDocument: Boolean(parsed.pedigreePai || parsed.pedigreeMae || parsed.pedigreeVerificado),
          verified: parsed.pedigreeVerificado,
          father: parsed.pedigreePai,
          mother: parsed.pedigreeMae,
        },
        breedingHistory: {
          litters: parsed.ninhadas,
          lastBreeding: parsed.ultimaReproducao,
          notes: parsed.observacoesReproducao,
        },
      };
    });
  }, [pets]);

  const selectedPet = mappedPets.find((pet) => pet.id === selectedPetId) || mappedPets[0] || null;

  const tutorSource = tutorData || me || {};
  const tutor = {
    name: tutorSource.name || tutorSource.nome || "",
    email: tutorSource.email || "",
    phone: tutorSource.telefone || "",
    location: tutorSource.cidade
      ? `${tutorSource.cidade}${tutorSource.estado ? `, ${tutorSource.estado}` : ""}`
      : "",
    avatar: tutorSource.avatar || tutorSource.foto || "",
    bio: "Perfil de tutor PetFind",
    memberSince: tutorSource.createdAt
      ? new Date(tutorSource.createdAt).toLocaleDateString("pt-BR", { month: "long", year: "numeric" })
      : "",
  };

  const handlePetSelect = (petId) => {
    setSelectedPetId(petId);
    setCurrentImageIndex(0);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("activePetId", String(petId));
    }
  };

  const handleVerMatches = (petId) => {
    handlePetSelect(petId);
    if (onNavigateToMatches) {
      onNavigateToMatches();
      return;
    }
    router.push("/match-display");
  };

  const handleCadastrarPet = () => {
    if (onNavigateToCadastrarPet) {
      onNavigateToCadastrarPet();
      return;
    }
    router.push("/pet-register");
  };

  const handleEditarTutor = () => {
    if (onEditProfile) {
      onEditProfile();
      return;
    }
    if (onNavigateToEditarTutor) {
      onNavigateToEditarTutor();
      return;
    }
    router.push("/tutor-edit");
  };

  const handleEditarPet = (petId) => {
    if (onNavigateToEditarPet) {
      onNavigateToEditarPet(petId);
      return;
    }
    router.push(`/pet-edit?id=${petId}`);
  };

  const handleSharePet = async (pet) => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/pet-details?id=${pet.id}`);
      showToast("Link do pet copiado.", "success");
    } catch {
      showToast("Não foi possível copiar o link.", "error");
    }
  };

  const handleOpenSetting = () => {
    if (onSettings) {
      onSettings();
      return;
    }
    router.push("/settings/privacy");
  };

  const handleLogoutClick = () => {
    setConfirmAction({ type: "logout" });
  };

  const handleDeletePetClick = (petId) => {
    setConfirmAction({ type: "delete-pet", petId });
  };

  const closeConfirmModal = () => setConfirmAction(null);

  const nextImage = () => {
    if (!selectedPet || selectedPet.images.length === 0) return;
    setCurrentImageIndex((prev) => (prev === selectedPet.images.length - 1 ? 0 : prev + 1));
  };

  const prevImage = () => {
    if (!selectedPet || selectedPet.images.length === 0) return;
    setCurrentImageIndex((prev) => (prev === 0 ? selectedPet.images.length - 1 : prev - 1));
  };

  const confirmModal = confirmAction
    ? confirmAction.type === "logout"
      ? {
          title: "Sair da conta",
          description: "Tem certeza que deseja sair agora?",
          confirmText: "Sair",
          confirmStyle: "btn-secondary bg-[#FFF7F1] text-[#ff8566] border-[#F2D4C8]",
          onConfirm: async () => {
            closeConfirmModal();
            try {
              if (onLogout) {
                onLogout();
                return;
              }
              await logoutUser();
              router.push("/login");
            } catch {
              showToast("Não foi possível encerrar a sessão agora.", "error");
            }
          },
        }
      : {
          title: "Excluir pet",
          description: "Essa ação não pode ser desfeita. Deseja continuar?",
          confirmText: "Excluir",
          confirmStyle: "btn-secondary bg-red-50 text-red-600 border-red-200",
          onConfirm: async () => {
            const petId = confirmAction.petId;
            closeConfirmModal();

            try {
              await deletePet(petId);
              setPets((prevPets) => {
                const next = prevPets.filter((pet) => pet.id !== petId);
                if (selectedPetId === petId) {
                  const nextSelected = next[0]?.id ?? null;
                  setSelectedPetId(nextSelected);
                  if (typeof window !== "undefined") {
                    if (nextSelected) window.localStorage.setItem("activePetId", String(nextSelected));
                    else window.localStorage.removeItem("activePetId");
                  }
                }
                return next;
              });
              showToast("Pet excluído com sucesso.", "success");
            } catch (error) {
              const message = error?.response?.data?.error || "Não foi possível excluir o pet.";
              showToast(message, "error");
            }
          },
        }
    : null;

  return (
    <div className="min-h-screen bg-[#FFF7F1] flex flex-col">
      <Header />

      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-10 max-w-6xl mx-auto w-full">
        {!selectedPet ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <p className="text-[#4a5565]">Você ainda não tem pets cadastrados.</p>
            <button type="button" onClick={handleCadastrarPet} className="btn mt-4">
              <Plus className="size-4" />
              Cadastrar pet
            </button>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden mb-3 sm:mb-4">
              <div className="relative aspect-4/3 sm:aspect-video lg:aspect-16/6 bg-gray-100">
                {selectedPet.images[currentImageIndex] ? (
                  <Image
                    src={selectedPet.images[currentImageIndex]}
                    alt={selectedPet.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 1200px"
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-sm text-[#6a7282]">
                    Sem foto
                  </div>
                )}

                {selectedPet.images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={prevImage}
                      className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 size-8 sm:size-10 rounded-full bg-white/90 hover:bg-white flex items-center justify-center transition-all shadow-lg active:scale-95"
                    >
                      <ChevronLeft className="size-5 sm:size-6 text-[#0a0a0a]" />
                    </button>
                    <button
                      type="button"
                      onClick={nextImage}
                      className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 size-8 sm:size-10 rounded-full bg-white/90 hover:bg-white flex items-center justify-center transition-all shadow-lg active:scale-95"
                    >
                      <ChevronRight className="size-5 sm:size-6 text-[#0a0a0a]" />
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg mb-3 sm:mb-4">
              <div className="px-4 sm:px-5 py-4 sm:py-5">
                <div className="flex items-start gap-3 sm:gap-4">
                  <button
                    type="button"
                    onClick={() => setShowImageModal(true)}
                    className="size-16 sm:size-20 rounded-full overflow-hidden bg-gray-200 shrink-0 shadow-md hover:shadow-lg transition-shadow"
                  >
                    {tutor.avatar ? (
                      <Image
                        src={tutor.avatar}
                        alt={tutor.name}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover object-center"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-[#6a7282]">Sem foto</div>
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg sm:text-xl font-bold text-[#0a0a0a] mb-1 truncate">{tutor.name || "Tutor"}</h2>
                    <p className="text-xs text-[#4a5565] mb-1 truncate">{tutor.location || "-"}</p>
                    <p className="text-sm text-[#364153] mb-2 line-clamp-2 sm:line-clamp-none">{tutor.bio}</p>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3 text-xs text-[#6a7282]">
                      <span className="flex items-center gap-1.5 truncate">
                        <Mail className="size-3.5 text-[#FFAD93] shrink-0" />
                        <span className="truncate">{tutor.email || "-"}</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Phone className="size-3.5 text-[#FFAD93] shrink-0" />
                        {tutor.phone || "-"}
                      </span>
                      {tutor.memberSince && (
                        <span className="flex items-center gap-1.5 whitespace-nowrap">
                          <Calendar className="size-3.5 text-[#FFAD93] shrink-0" />
                          Membro desde {tutor.memberSince}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="relative" ref={tutorMenuRef}>
                    <button
                      type="button"
                      onClick={() => setShowMenu(!showMenu)}
                      className="size-9 sm:size-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
                    >
                      <MoreVertical className="size-5 text-[#4A5565]" />
                    </button>

                    {showMenu && (
                      <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-xl border border-gray-100 py-1.5 z-20">
                        <button
                          type="button"
                          onClick={() => {
                            setShowMenu(false);
                            handleEditarTutor();
                          }}
                          className="w-full px-3 py-2 text-left text-xs text-[#0a0a0a] hover:bg-gray-50 transition-colors flex items-center gap-2"
                        >
                          <Edit2 className="size-3.5 text-[#FFAD93]" />
                          Editar Perfil
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowMenu(false);
                            handleOpenSetting();
                          }}
                          className="w-full px-3 py-2 text-left text-xs text-[#0a0a0a] hover:bg-gray-50 transition-colors flex items-center gap-2"
                        >
                          <Settings className="size-3.5 text-[#FFAD93]" />
                          Configurações
                        </button>
                        <div className="h-px bg-gray-100 my-1" />
                        <button
                          type="button"
                          onClick={() => {
                            setShowMenu(false);
                            handleLogoutClick();
                          }}
                          className="w-full px-3 py-2 text-left text-xs text-red-500 hover:bg-red-50 transition-colors flex items-center gap-2"
                        >
                          <LogOut className="size-3.5" />
                          Sair
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
              <div className="space-y-3 sm:space-y-4">
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-5">
                  <h3 className="text-base font-bold text-[#0a0a0a] mb-3">Sobre {selectedPet.name}</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-[#6a7282]">Raça:</span>
                      <span className="text-[#0a0a0a] font-medium">{selectedPet.breed}</span>
                    </div>
                    {selectedPet.birthDate && (
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-[#6a7282]">Data de Nascimento:</span>
                        <span className="text-[#0a0a0a] font-medium">{formatDateForDisplay(selectedPet.birthDate)}</span>
                      </div>
                    )}
                    <div className="pt-2 border-t border-gray-100">
                      <p className="text-xs text-[#364153] leading-relaxed">{selectedPet.about || "Sem descrição."}</p>
                    </div>
                    {selectedPet.temperament.length > 0 && (
                      <div className="pt-2 border-t border-gray-100">
                        <p className="text-xs text-[#6a7282] mb-2">Temperamento:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedPet.temperament.map((trait, index) => (
                            <span key={`${trait}-${index}`} className="px-2.5 py-0.5 rounded-full border border-[#FFAD93] bg-[rgba(255,173,147,0.05)] text-[#FFAD93] text-xs">
                              {trait}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base font-bold text-[#0a0a0a]">Meus Pets</h3>
                    <button type="button" onClick={handleCadastrarPet} className="size-8 rounded-full bg-[#FFAD93] hover:bg-[#FF9D8B] flex items-center justify-center transition-colors shadow-md">
                      <Plus className="size-4 text-white" />
                    </button>
                  </div>

                  <div className="space-y-2 max-h-70 pr-2 overflow-y-auto custom-scrollbar">
                    {mappedPets.map((pet) => (
                      <div key={pet.id} className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-all relative ${pet.id === selectedPet.id ? "bg-[rgba(255,173,147,0.08)] border-2 border-[#FFAD93]" : "bg-gray-50 border-2 border-transparent hover:bg-gray-100"}`}>
                        <button type="button" onClick={() => handlePetSelect(pet.id)} className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="size-10 sm:size-12 rounded-full overflow-hidden bg-gray-200 shrink-0">
                            {pet.images[0] ? (
                              <Image
                                src={pet.images[0]}
                                alt={pet.name}
                                width={48}
                                height={48}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xs text-[#6a7282]">🐾</div>
                            )}
                          </div>
                          <div className="flex-1 text-left min-w-0">
                            <p className={`font-bold text-xs truncate ${pet.id === selectedPet.id ? "text-[#FFAD93]" : "text-[#0a0a0a]"}`}>{pet.name}</p>
                            <p className="text-xs text-[#6a7282] truncate">{pet.breed}</p>
                          </div>
                        </button>

                        <div className="relative" ref={(element) => { petMenuRefs.current[pet.id] = element; }}>
                          <button type="button" onClick={() => setPetMenuOpen(petMenuOpen === pet.id ? null : pet.id)} className="size-8 rounded-full hover:bg-gray-200 flex items-center justify-center transition-colors">
                            <MoreVertical className="size-3.5 text-[#4A5565]" />
                          </button>

                          {petMenuOpen === pet.id && (
                            <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-xl border border-gray-100 py-1.5 z-20">
                              <button type="button" onClick={() => { setPetMenuOpen(null); handleEditarPet(pet.id); }} className="w-full px-3 py-2 text-left text-xs text-[#0a0a0a] hover:bg-gray-50 transition-colors flex items-center gap-2">
                                <Edit2 className="size-3.5 text-[#FFAD93]" />
                                Editar
                              </button>
                              <button type="button" onClick={() => { setPetMenuOpen(null); handleSharePet(pet); }} className="w-full px-3 py-2 text-left text-xs text-[#0a0a0a] hover:bg-gray-50 transition-colors flex items-center gap-2">
                                <Share2 className="size-3.5 text-[#FFAD93]" />
                                Compartilhar
                              </button>
                              <div className="h-px bg-gray-100 my-1" />
                              <button type="button" onClick={() => { setPetMenuOpen(null); handleDeletePetClick(pet.id); }} className="w-full px-3 py-2 text-left text-xs text-red-500 hover:bg-red-50 transition-colors flex items-center gap-2">
                                <Trash2 className="size-3.5" />
                                Excluir
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-5">
                  <h3 className="text-base font-bold text-[#0a0a0a] mb-3 flex items-center gap-2">
                    <Award className="size-4 text-[#FFAD93]" />
                    Linhagem
                  </h3>
                  {selectedPet.pedigree.hasDocument ? (
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-[#6a7282] mb-0.5">Pai</p>
                        <p className="text-xs font-medium text-[#0a0a0a]">{selectedPet.pedigree.father || "-"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[#6a7282] mb-0.5">Mãe</p>
                        <p className="text-xs font-medium text-[#0a0a0a]">{selectedPet.pedigree.mother || "-"}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <Award className="size-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-xs text-[#6a7282]">Informações de linhagem não disponíveis</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="lg:col-span-2 space-y-3 sm:space-y-4">
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-5">
                  <h3 className="text-base font-bold text-[#0a0a0a] mb-3 sm:mb-4">Histórico de Saúde</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="bg-white rounded-xl shadow-md p-3 sm:p-4">
                      <div className="flex items-center gap-2 mb-2 sm:mb-3">
                        <div className="size-7 sm:size-8 rounded-full bg-[rgba(255,173,147,0.12)] flex items-center justify-center shrink-0">
                          <Syringe className="size-3.5 sm:size-4 text-[#FFAD93]" />
                        </div>
                        <h4 className="text-sm font-bold text-[#0a0a0a]">Vacinação</h4>
                      </div>
                      <div className="space-y-1.5">
                        {(selectedPet.healthHistory.vaccinations.length > 0 ? selectedPet.healthHistory.vaccinations : ["Sem registros"]).map((item, index) => (
                          <div key={`vac-${index}`} className="text-xs text-[#364153] bg-gray-50 px-2.5 py-1.5 rounded-lg">{item}</div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-3 sm:p-4">
                      <div className="flex items-center gap-2 mb-2 sm:mb-3">
                        <div className="size-7 sm:size-8 rounded-full bg-[rgba(255,173,147,0.12)] flex items-center justify-center shrink-0">
                          <Dna className="size-3.5 sm:size-4 text-[#FFAD93]" />
                        </div>
                        <h4 className="text-sm font-bold text-[#0a0a0a]">Genética</h4>
                      </div>
                      <div className="space-y-1.5">
                        {(selectedPet.healthHistory.genetics.length > 0 ? selectedPet.healthHistory.genetics : ["Nenhum teste genético registrado"]).map((item, index) => (
                          <div key={`gen-${index}`} className="text-xs text-[#364153] bg-gray-50 px-2.5 py-1.5 rounded-lg">{item}</div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-3 sm:p-4">
                      <div className="flex items-center gap-2 mb-2 sm:mb-3">
                        <div className="size-7 sm:size-8 rounded-full bg-[rgba(255,173,147,0.12)] flex items-center justify-center shrink-0">
                          <Activity className="size-3.5 sm:size-4 text-[#FFAD93]" />
                        </div>
                        <h4 className="text-sm font-bold text-[#0a0a0a]">Alergias</h4>
                      </div>
                      <div className="space-y-1.5">
                        {(selectedPet.healthHistory.allergies.length > 0 ? selectedPet.healthHistory.allergies : ["Nenhuma alergia conhecida"]).map((item, index) => (
                          <div key={`ale-${index}`} className="text-xs text-[#364153] bg-gray-50 px-2.5 py-1.5 rounded-lg">{item}</div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-3 sm:p-4">
                      <div className="flex items-center gap-2 mb-2 sm:mb-3">
                        <div className="size-7 sm:size-8 rounded-full bg-[rgba(255,173,147,0.12)] flex items-center justify-center shrink-0">
                          <Shield className="size-3.5 sm:size-4 text-[#FFAD93]" />
                        </div>
                        <h4 className="text-sm font-bold text-[#0a0a0a]">Medicamentos</h4>
                      </div>
                      <div className="space-y-1.5">
                        {(selectedPet.healthHistory.medications.length > 0 ? selectedPet.healthHistory.medications : ["Sem uso contínuo registrado"]).map((item, index) => (
                          <div key={`med-${index}`} className="text-xs text-[#364153] bg-gray-50 px-2.5 py-1.5 rounded-lg">{item}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0 mb-3">
                    <h3 className="text-base font-bold text-[#0a0a0a] flex items-center gap-2">
                      <FileText className="size-4 text-[#FFAD93]" />
                      Certificado de Pedigree
                    </h3>
                    {selectedPet.pedigree.hasDocument && (
                      <button type="button" className="flex items-center gap-2 px-3 py-1.5 bg-[rgba(255,173,147,0.12)] text-[#FFAD93] rounded-lg hover:bg-[rgba(255,173,147,0.2)] transition-colors text-xs font-medium self-start sm:self-auto">
                        <Upload className="size-3" />
                        Verificado
                      </button>
                    )}
                  </div>
                  {selectedPet.pedigree.hasDocument ? (
                    <div className="bg-linear-to-br from-[#FFA98F]/5 to-[#FF8566]/5 border-2 border-dashed border-[#FFAD93] rounded-xl p-5 sm:p-6 text-center">
                      <Award className="size-8 sm:size-10 text-[#FFAD93] mx-auto mb-2" />
                      <p className="text-xs font-medium text-[#0a0a0a] mb-1">Linhagem cadastrada</p>
                      <p className="text-xs text-[#6a7282]">Informações de pedigree disponíveis no perfil</p>
                    </div>
                  ) : (
                    <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-5 sm:p-6 text-center">
                      <FileText className="size-8 sm:size-10 text-gray-300 mx-auto mb-2" />
                      <p className="text-xs font-medium text-[#6a7282] mb-1">Certificado não disponível</p>
                      <p className="text-xs text-[#9ca3af]">Nenhum documento de pedigree cadastrado</p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-5">
                    <h3 className="text-base font-bold text-[#0a0a0a] mb-3">Informações Físicas</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
                        <span className="text-xs text-[#6a7282]">Peso</span>
                        <span className="text-xs font-bold text-[#0a0a0a]">{selectedPet.weight || "-"}</span>
                      </div>
                      <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
                        <span className="text-xs text-[#6a7282]">Cor</span>
                        <span className="text-xs font-bold text-[#0a0a0a]">{selectedPet.color || "-"}</span>
                      </div>
                      <div className="flex justify-between items-center py-1.5">
                        <span className="text-xs text-[#6a7282]">Tamanho</span>
                        <span className="text-xs font-bold text-[#0a0a0a]">{selectedPet.size || "-"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-5">
                    <h3 className="text-base font-bold text-[#0a0a0a] mb-3">Histórico de Reprodução</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
                        <span className="text-xs text-[#6a7282]">Ninhadas</span>
                        <span className="text-xs font-bold text-[#0a0a0a]">{selectedPet.breedingHistory.litters || "-"}</span>
                      </div>
                      <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
                        <span className="text-xs text-[#6a7282]">Última Reprodução</span>
                        <span className="text-xs font-bold text-[#0a0a0a]">{selectedPet.breedingHistory.lastBreeding || "-"}</span>
                      </div>
                      <div className="pt-1.5">
                        <p className="text-xs text-[#6a7282] mb-0.5">Observações:</p>
                        <p className="text-xs text-[#364153]">{selectedPet.breedingHistory.notes || "Sem observações."}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      {showImageModal && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-60 p-4"
          onClick={() => setShowImageModal(false)}
        >
          <button
            type="button"
            onClick={() => setShowImageModal(false)}
            className="absolute top-4 sm:top-6 right-4 sm:right-6 size-10 sm:size-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <X className="size-5 sm:size-6 text-white" />
          </button>
          {tutor.avatar ? (
            <Image
              src={tutor.avatar}
              alt={tutor.name}
              width={1200}
              height={900}
              className="max-w-full sm:max-w-3xl max-h-[70vh] sm:max-h-[80vh] rounded-xl sm:rounded-2xl shadow-2xl w-auto h-auto"
              onClick={(event) => event.stopPropagation()}
            />
          ) : null}
        </div>
      )}

      {confirmModal && (
        <div className="fixed inset-0 z-130 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl border border-[#F2D4C8] bg-white p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-[#0a0a0a] mb-2">{confirmModal.title}</h3>
            <p className="text-sm text-[#4a5565] mb-6">{confirmModal.description}</p>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={closeConfirmModal} className="btn-secondary">Cancelar</button>
              <button type="button" onClick={confirmModal.onConfirm} className={confirmModal.confirmStyle}>{confirmModal.confirmText}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
