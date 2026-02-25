import React, { useEffect, useState } from "react";
import {
  ChevronRight,
  Edit,
  LogOut,
  Plus,
  Settings,
  Trash2,
} from "lucide-react";
import Layout from "../src/components/Layout";
import { useRouter } from "next/router";
import { getMe, logoutUser } from "../src/services/auth";
import { deletePet, listPets } from "../src/services/pets";
import { showToast } from "../src/services/toast";

export default function PerfilTutor({
  onNavigateToMatches,
  onNavigateToChat,
  onNavigateToPerfil,
  onNavigateToHome,
  onNavigateToEditarPet,
  onNavigateToEditarTutor,
  petData,
  tutorData,
}) {
  const router = useRouter();

  const [me, setMe] = useState(null);
  const [pets, setPets] = useState([]);
  const [selectedPetId, setSelectedPetId] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);

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

        const storedId =
          typeof window !== "undefined"
            ? Number(window.localStorage.getItem("activePetId"))
            : null;
        const hasStored =
          storedId && ownedPets.some((pet) => pet.id === storedId);
        const initialId = hasStored ? storedId : (ownedPets[0]?.id ?? null);

        setSelectedPetId(initialId);
        if (typeof window !== "undefined") {
          if (initialId) {
            window.localStorage.setItem("activePetId", String(initialId));
          } else {
            window.localStorage.removeItem("activePetId");
          }
        }
      } catch (err) {
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

  const tutorSource = tutorData || me || {};
  const tutor = {
    nome: tutorSource.nome ?? tutorSource.name ?? "",
    email: tutorSource.email ?? "",
    telefone: tutorSource.telefone ?? "",
    cidade: tutorSource.cidade ?? "",
    estado: tutorSource.estado ?? "",
    avatar: tutorSource.avatar ?? tutorSource.foto ?? "",
  };

  const formatarIdade = (idade) => {
    const idadeNum = parseInt(idade, 10);
    if (isNaN(idadeNum)) return "-";
    if (idadeNum === 0 || idadeNum === 1) return "Filhote (0-1 ano)";
    if (idadeNum <= 7) return "Adulto (2-7 anos)";
    return "Idoso (8+ anos)";
  };

  const handleSelectPet = (petId) => {
    setSelectedPetId(petId);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("activePetId", String(petId));
    }
  };

  const handleVerMatches = (petId) => {
    handleSelectPet(petId);
    router.push("/match-display");
  };

  const mappedPets = Array.isArray(pets)
    ? pets.map((pet) => ({
        id: pet.id,
        nome: pet.nome ?? pet.name ?? "-",
        raca: pet.raca ?? pet.breed ?? "-",
        tipo: pet.especie ?? pet.species ?? "-",
        idade: formatarIdade(pet.idade ?? pet.age ?? pet.ageMonths),
        sexo: pet.sexo ?? pet.sex ?? "-",
        foto: pet.mainPhoto || "",
      }))
    : [];

  const handleSair = () => {
    setConfirmAction({ type: "logout" });
  };

  const handleEditarPerfil = () => {
    if (onNavigateToEditarTutor) return onNavigateToEditarTutor();
    router.push("/tutor-edit");
  };

  const handleEditarPet = (petId) => {
    if (onNavigateToEditarPet) return onNavigateToEditarPet(petId);
    router.push(`/pet-edit?id=${petId}`);
  };

  const handleExcluirPet = (petId) => {
    setConfirmAction({ type: "delete-pet", petId });
  };

  const closeConfirmModal = () => setConfirmAction(null);

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
              await logoutUser();
            } catch (error) {
              showToast("Não foi possível encerrar a sessão agora.", "error");
            } finally {
              router.push("/login");
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

              setPets((previousPets) => {
                const nextPets = previousPets.filter((pet) => pet.id !== petId);

                if (selectedPetId === petId) {
                  const nextSelected = nextPets[0]?.id ?? null;
                  setSelectedPetId(nextSelected);

                  if (typeof window !== "undefined") {
                    if (nextSelected) {
                      window.localStorage.setItem("activePetId", String(nextSelected));
                    } else {
                      window.localStorage.removeItem("activePetId");
                    }
                  }
                }

                return nextPets;
              });

              showToast("Pet excluído com sucesso.", "success");
            } catch (error) {
              const message = error?.response?.data?.error || "Não foi possível excluir o pet.";
              showToast(message, "error");
            }
          },
        }
    : null;

  const handleCadastrarPet = () => {
    router.push("/pet-register");
  };

  const handleOpenSetting = (settingKey) => {
    if (settingKey === "match") {
      router.push("/settings/match");
      return;
    }

    if (settingKey === "notifications") {
      router.push("/settings/notifications");
      return;
    }

    if (settingKey === "privacy") {
      router.push("/settings/privacy");
      return;
    }

    if (settingKey === "support") {
      router.push("/settings/support");
    }
  };

  const settingsItems = [
    {
      key: "match",
      label: "Preferências de Match",
      description: "Ajuste tipo de pet e critérios de conexão.",
    },
    {
      key: "notifications",
      label: "Notificações",
      description: "Controle alertas de mensagens, likes e matches.",
    },
    {
      key: "privacy",
      label: "Privacidade",
      description: "Gerencie visibilidade de informações do perfil.",
    },
    {
      key: "support",
      label: "Ajuda e Suporte",
      description: "Fale com o suporte do PetFind quando precisar.",
    },
  ];

  return (
    <Layout>
      <div className="min-h-screen page-bg">
        <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
          <div className="rounded-3xl bg-white shadow-[0_16px_45px_rgba(15,23,42,0.08)] p-6 sm:p-8 mb-6 border border-[#F4E4DA]">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 sm:gap-6">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-[#0a0a0a]">
                  Meu Perfil
                </h1>
                <p className="mt-2 text-[#4a5565] text-sm sm:text-base">
                  Gerencie suas informações e os dados dos seus pets.
                </p>
              </div>

              <button
                onClick={handleSair}
                className="btn-secondary self-start border-[#F2D4C8] bg-[#FFF7F1] text-[#ff8566] hover:bg-[#FFEFE6]"
              >
                <LogOut className="size-4" />
                Sair
              </button>
            </div>
          </div>

          <section className="bg-white rounded-3xl shadow-[0_12px_35px_rgba(15,23,42,0.08)] border border-[#F4E4DA] p-6 sm:p-8 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl sm:text-2xl font-bold text-[#0a0a0a]">
                Informações do Tutor
              </h3>
              <button
                onClick={handleEditarPerfil}
                className="btn-text"
                aria-label="Editar perfil do tutor"
              >
                <Edit className="size-4" />
                Editar
              </button>
            </div>

            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="size-24 rounded-2xl overflow-hidden bg-[#FFF2EA] border border-[#F2D4C8] shrink-0">
                {tutor.avatar ? (
                  <img
                    src={tutor.avatar}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#b4897a] text-sm">
                    Sem foto
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 w-full text-sm sm:text-base">
                <p className="text-[#364153]">
                  <span className="font-semibold text-[#0a0a0a]">Nome:</span>{" "}
                  {tutor.nome || "-"}
                </p>
                <p className="text-[#364153]">
                  <span className="font-semibold text-[#0a0a0a]">Email:</span>{" "}
                  {tutor.email || "-"}
                </p>
                <p className="text-[#364153]">
                  <span className="font-semibold text-[#0a0a0a]">
                    Telefone:
                  </span>{" "}
                  {tutor.telefone || "-"}
                </p>
                <p className="text-[#364153]">
                  <span className="font-semibold text-[#0a0a0a]">Local:</span>{" "}
                  {tutor.cidade
                    ? `${tutor.cidade}${tutor.estado ? ` - ${tutor.estado}` : ""}`
                    : "-"}
                </p>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-3xl shadow-[0_12px_35px_rgba(15,23,42,0.08)] border border-[#F4E4DA] p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6 gap-3">
              <h3 className="text-xl sm:text-2xl font-bold text-[#0a0a0a]">
                Meus Pets
              </h3>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-[#FFF1E8] px-3 py-1 text-sm font-semibold text-[#ff8566]">
                  {mappedPets.length}
                </span>
                <button
                  type="button"
                  onClick={handleCadastrarPet}
                  className="btn-icon hidden sm:inline-flex border-[#F2D4C8] text-[#ff8566] hover:bg-[#ff8566] hover:text-[#FFF9F5]"
                  aria-label="Cadastrar pet"
                >
                  <Plus className="size-4" />
                </button>
              </div>
            </div>

            {mappedPets.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#F2D4C8] bg-[#FFF9F5] p-8 text-center">
                <p className="text-[#4a5565]">Você ainda não cadastrou pets.</p>
                <button onClick={handleCadastrarPet} className="btn mt-4">
                  <Plus className="size-4" />
                  Cadastrar pet
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {mappedPets.map((pet) => (
                  <article
                    key={pet.id}
                    className={`rounded-2xl border p-4 sm:p-5 transition-all ${
                      pet.id === selectedPetId
                        ? "border-[#FFB39B] bg-[#FFF7F1] shadow-[0_8px_24px_rgba(255,133,102,0.14)]"
                        : "border-[#ECEEF2] bg-white hover:border-[#F2D4C8]"
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="size-16 rounded-xl overflow-hidden bg-[#FFF2EA] border border-[#F2D4C8] shrink-0">
                          {pet.foto ? (
                            <img
                              src={pet.foto}
                              alt={pet.nome}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xl">
                              🐾
                            </div>
                          )}
                        </div>

                        <div className="min-w-0">
                          <h4 className="font-bold text-[#0a0a0a] text-lg truncate">
                            {pet.nome}
                          </h4>
                          <p className="text-sm text-[#4a5565] truncate">
                            {pet.raca} • {pet.tipo}
                          </p>
                          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                            <span className="rounded-full bg-[#F8FAFC] text-[#475467] px-2.5 py-1">
                              {pet.idade}
                            </span>
                            <span className="rounded-full bg-[#F8FAFC] text-[#475467] px-2.5 py-1">
                              Sexo: {pet.sexo}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => handleSelectPet(pet.id)}
                          className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                            pet.id === selectedPetId
                              ? "bg-[#FFDCCF] text-[#ff8566]"
                              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                          }`}
                          aria-pressed={pet.id === selectedPetId}
                        >
                          {pet.id === selectedPetId
                            ? "Selecionado"
                            : "Selecionar"}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleVerMatches(pet.id)}
                          className="btn"
                          aria-label={`Ver matches para ${pet.nome}`}
                        >
                          Ver Matches
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEditarPet(pet.id)}
                          aria-label={`Editar pet ${pet.nome}`}
                          className="btn-icon border-[#F2D4C8] text-[#ff8566] hover:bg-[#FFF7F1]"
                        >
                          <Edit className="size-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleExcluirPet(pet.id)}
                          aria-label={`Excluir pet ${pet.nome}`}
                          className="btn-danger-icon border-[#F2D4C8] text-[#ff8566] hover:bg-[#FFF7F1]"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="bg-white rounded-3xl shadow-[0_12px_35px_rgba(15,23,42,0.08)] border border-[#F4E4DA] p-6 sm:p-8 mt-6">
            <h3 className="text-xl sm:text-2xl font-bold text-[#0a0a0a] mb-5">
              Configurações
            </h3>

            <div className="space-y-2">
              {settingsItems.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => handleOpenSetting(item.key)}
                  className="w-full flex items-center justify-between gap-3 rounded-2xl border border-transparent bg-white p-4 hover:bg-[#FFF9F5] hover:border-[#F2D4C8]"
                >
                  <div className="flex items-start gap-3 text-left">
                    <div className="mt-0.5 inline-flex items-center justify-center size-9 rounded-xl bg-[#FFF1E8] text-[#ff8566]">
                      <Settings className="size-5" />
                    </div>
                    <div>
                      <p className="text-base sm:text-lg font-semibold text-[#0a0a0a]">
                        {item.label}
                      </p>
                      <p className="text-xs sm:text-sm text-[#4a5565] mt-0.5">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <ChevronRight className="size-5 text-[#4a5565] shrink-0" />
                </button>
              ))}
            </div>
          </section>

          <button
            type="button"
            onClick={handleCadastrarPet}
            className="btn btn-pill sm:hidden fixed bottom-6 right-4 z-50 shadow-[0_10px_24px_rgba(255,133,102,0.35)] active:scale-[0.98]"
            aria-label="Cadastrar novo pet"
          >
            <Plus className="size-4" />
            Cadastrar pet
          </button>
        </main>
      </div>

      {confirmModal && (
        <div className="fixed inset-0 z-130 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl border border-[#F2D4C8] bg-white p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-[#0a0a0a] mb-2">{confirmModal.title}</h3>
            <p className="text-sm text-[#4a5565] mb-6">{confirmModal.description}</p>

            <div className="flex justify-end gap-3">
              <button type="button" onClick={closeConfirmModal} className="btn-secondary">
                Cancelar
              </button>
              <button type="button" onClick={confirmModal.onConfirm} className={confirmModal.confirmStyle}>
                {confirmModal.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
