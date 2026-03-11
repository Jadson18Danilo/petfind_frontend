/* eslint-disable @next/next/no-img-element */
import React, { useState, useRef, useEffect } from "react";
import { Plus, X, Upload, ChevronDown, Heart } from "lucide-react";
import { useRouter } from "next/router";
import { createPet } from "../src/services/pets";

export default function PetRegister({
  onPetCadastrado,
  onNavigateToInicioMatch,
  onNavigateToMatches,
  onNavigateToChat,
  onNavigateToPerfil,
}) {
  const router = useRouter();
  const defaultFieldClassName =
    "w-full px-4 py-3 rounded-lg border-2 border-[#d1d5dc] bg-white text-[#0a0a0a] focus:border-[#FFA98F] focus:outline-none transition-colors";
  const dirtyFieldClassName =
    "w-full px-4 py-3 rounded-lg border-2 border-[#FFA98F]/70 bg-[#FFF7F1]/72 text-[#0a0a0a] focus:border-[#FFA98F] focus:outline-none focus:ring-4 focus:ring-[#FFA98F]/14 transition-all";
  const defaultSelectClassName =
    "w-full appearance-none px-4 pr-12 py-3 rounded-lg border-2 border-[#d1d5dc] bg-white text-[#0a0a0a] focus:border-[#FFA98F] focus:outline-none transition-colors";
  const dirtySelectClassName =
    "w-full appearance-none px-4 pr-12 py-3 rounded-lg border-2 border-[#FFA98F]/70 bg-[#FFF7F1]/72 text-[#0a0a0a] focus:border-[#FFA98F] focus:outline-none focus:ring-4 focus:ring-[#FFA98F]/14 transition-all";

  const [mainPhoto, setMainPhoto] = useState(null);
  const [mainPhotoFile, setMainPhotoFile] = useState(null);
  const [additionalPhotos, setAdditionalPhotos] = useState([
    null,
    null,
    null,
    null,
  ]);
  const [additionalPhotoFiles, setAdditionalPhotoFiles] = useState([
    null,
    null,
    null,
    null,
  ]);

  const mainPhotoInputRef = useRef(null);
  const additionalPhotoRefs = useRef([]);

  const [formData, setFormData] = useState({
    nome: "",
    especie: "cachorro",
    idade: "",
    sexo: "macho",
    raca: "",
    objetivo: "amizades",
    pedigree: "",
    biografia: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [me, setMe] = useState(null);
  const [touched, setTouched] = useState({});

  useEffect(() => {
    let mounted = true;
    import("../src/services/auth").then(({ getMe }) => {
      getMe()
        .then((data) => {
          if (mounted) setMe(data);
        })
        .catch(() => {});
    });
    return () => {
      mounted = false;
    };
  }, []);

  const handleMainPhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMainPhotoFile(file);

    const reader = new FileReader();
    reader.onloadend = () => setMainPhoto(reader.result);
    reader.readAsDataURL(file);
  };

  const handleAdditionalPhotoChange = (index, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAdditionalPhotoFiles((prev) => {
      const updated = [...prev];
      updated[index] = file;
      return updated;
    });

    const reader = new FileReader();
    reader.onloadend = () => {
      const newPhotos = [...additionalPhotos];
      newPhotos[index] = reader.result;
      setAdditionalPhotos(newPhotos);
    };
    reader.readAsDataURL(file);
  };

  const removeMainPhoto = () => {
    setMainPhoto(null);
    setMainPhotoFile(null);
    if (mainPhotoInputRef.current) mainPhotoInputRef.current.value = "";
  };

  const removeAdditionalPhoto = (index) => {
    const newPhotos = [...additionalPhotos];
    newPhotos[index] = null;
    setAdditionalPhotos(newPhotos);
    setAdditionalPhotoFiles((prev) => {
      const next = [...prev];
      next[index] = null;
      return next;
    });
    if (additionalPhotoRefs.current[index])
      additionalPhotoRefs.current[index].value = "";
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const getFieldClassName = (field) =>
    touched[field] ? dirtyFieldClassName : defaultFieldClassName;
  const getSelectClassName = (field) =>
    touched[field] ? dirtySelectClassName : defaultSelectClassName;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setMessage("");
    setError("");
    const form = new FormData();
    form.append("name", formData.nome);
    form.append("species", formData.especie);
    form.append("ageMonths", formData.idade || "");
    form.append("sex", formData.sexo);
    form.append("breed", formData.raca);
    form.append("description", formData.biografia);
    // attach tutor CEP if available
    if (me?.cep) form.append("cep", me.cep);

    if (mainPhotoFile) form.append("mainPhoto", mainPhotoFile);
    additionalPhotoFiles
      .filter(Boolean)
      .forEach((file) => form.append("additionalPhotos", file));

    (async () => {
      try {
        if (createPet) {
          await createPet(form);
        }
        setMessage("Pet cadastrado com sucesso.");
        if (onPetCadastrado) {
          onPetCadastrado(formData);
        } else if (onNavigateToInicioMatch) {
          onNavigateToInicioMatch();
        } else if (onNavigateToMatches) {
          onNavigateToMatches();
        } else {
          router.push("/match-display");
        }
      } catch (err) {
        console.error("Failed to create pet", err);
        setError(err?.response?.data?.error || "Falha ao cadastrar pet");
      } finally {
        setIsSubmitting(false);
      }
    })();
  };

  return (
    <div className="min-h-screen page-bg">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 h-20 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[#ffa98f]">PetMatch</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 lg:px-8 py-16">
        <div className="bg-white rounded-3xl shadow-lg p-8 md:p-12">
          <h2 className="text-4xl font-bold text-[#0a0a0a] mb-2">
            Cadastrar novo pet
          </h2>
          <p className="text-lg text-[#4a5565] mb-12">
            Preencha os dados do seu pet para começar a encontrar matches
          </p>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Seção de Fotos */}
            <div>
              <h3 className="text-2xl font-bold text-[#0a0a0a] mb-6">
                Fotos do Pet
              </h3>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                {/* Foto Principal */}
                <div className="lg:col-span-1">
                  <label className="block text-sm font-semibold text-[#0a0a0a] mb-3">
                    Foto Principal
                  </label>
                  <div className="relative group">
                    <div className="w-full aspect-4/5 sm:aspect-square bg-[#FFF7F1]/80 rounded-2xl flex items-center justify-center overflow-hidden border-2 border-dashed border-[#FFA98F]/60">
                      {mainPhoto ? (
                        <img
                          src={mainPhoto}
                          className="w-full h-full object-cover"
                          alt="Foto principal do pet"
                          loading="lazy"
                          decoding="async"
                        />
                      ) : (
                        <div className="text-center">
                          <Upload className="w-12 h-12 text-[#FFA98F] mx-auto mb-2 opacity-50" />
                          <p className="text-sm text-[#4a5565]">
                            Clique para adicionar
                          </p>
                        </div>
                      )}
                    </div>

                    <input
                      ref={mainPhotoInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleMainPhotoChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />

                    {mainPhoto && (
                      <button
                        type="button"
                        onClick={removeMainPhoto}
                        className="btn-danger-icon absolute top-2 right-2 size-9 p-0 rounded-full shadow-lg"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Galeria de Fotos (4 espaços) */}
                <div className="lg:col-span-2">
                  <label className="block text-sm font-semibold text-[#0a0a0a] mb-3">
                    Galeria (até 4 fotos)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {additionalPhotos.map((photo, index) => (
                      <div key={index} className="relative group">
                        <div className="w-full aspect-square bg-[#FFF7F1]/75 rounded-2xl flex items-center justify-center overflow-hidden border-2 border-dashed border-[#FFA98F]/45 hover:border-[#FFA98F]/75 transition-colors">
                          {photo ? (
                            <img
                              src={photo}
                              alt={`Foto ${index + 1}`}
                              className="w-full h-full object-cover"
                              loading="lazy"
                              decoding="async"
                            />
                          ) : (
                            <div className="text-center">
                              <Plus className="w-6 h-6 text-[#FFA98F] mx-auto opacity-50" />
                            </div>
                          )}
                        </div>

                        <input
                          ref={(el) =>
                            (additionalPhotoRefs.current[index] = el)
                          }
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            handleAdditionalPhotoChange(index, e)
                          }
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />

                        {photo && (
                          <button
                            type="button"
                            onClick={() => removeAdditionalPhoto(index)}
                            className="btn-danger-icon absolute -top-2 -right-2 size-7 p-0 rounded-full shadow-lg"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>


            {/* Seção de Informações Básicas */}
            <div>
              <h3 className="text-2xl font-bold text-[#0a0a0a] mb-6">
                Informações do Pet
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nome */}
                <div>
                  <label className="block text-sm font-semibold text-[#0a0a0a] mb-2">
                    Nome *
                  </label>
                  <input
                    type="text"
                    value={formData.nome}
                    onChange={(e) => handleChange("nome", e.target.value)}
                    placeholder="Ex: Max"
                    className={getFieldClassName("nome")}
                    required
                  />
                </div>

                {/* Espécie */}
                <div>
                  <label className="block text-sm font-semibold text-[#0a0a0a] mb-2">
                    Espécie *
                  </label>
                  <div className="relative">
                    <select
                      value={formData.especie}
                      onChange={(e) => handleChange("especie", e.target.value)}
                      className={getSelectClassName("especie")}
                    >
                      <option value="cachorro">Cachorro</option>
                      <option value="gato">Gato</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 size-4 text-[#ff8566]" />
                  </div>
                </div>

                {/* Idade */}
                <div>
                  <label className="block text-sm font-semibold text-[#0a0a0a] mb-2">
                    Idade (anos) *
                  </label>
                  <input
                    type="number"
                    value={formData.idade}
                    onChange={(e) => handleChange("idade", e.target.value)}
                    placeholder="Ex: 2"
                    min="0"
                    className={getFieldClassName("idade")}
                    required
                  />
                </div>

                {/* Sexo */}
                <div>
                  <label className="block text-sm font-semibold text-[#0a0a0a] mb-2">
                    Sexo *
                  </label>
                  <div className="relative">
                    <select
                      value={formData.sexo}
                      onChange={(e) => handleChange("sexo", e.target.value)}
                      className={getSelectClassName("sexo")}
                    >
                      <option value="macho">Macho</option>
                      <option value="femea">Fêmea</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 size-4 text-[#ff8566]" />
                  </div>
                </div>

                {/* Raça */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-[#0a0a0a] mb-2">
                    Raça *
                  </label>
                  <input
                    type="text"
                    value={formData.raca}
                    onChange={(e) => handleChange("raca", e.target.value)}
                    placeholder="Ex: Labrador Retriever"
                    className={getFieldClassName("raca")}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Seção de Preferências */}
            <div>
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-[#0a0a0a]">
                  O que você busca? *
                </h3>

                <div className="space-y-1">
                  {/* Amizades */}
                  <label
                    className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      formData.objetivo === "amizades"
                        ? "border-[#ffa98f] bg-[rgba(255,169,143,0.05)]"
                        : "border-[#e5e7eb] bg-white hover:border-[#ffa98f]"
                    }`}
                  >
                    <div className="mt-0.5">
                      <div className="size-6 rounded-full border-2 border-[#ffa98f] flex items-center justify-center">
                        {formData.objetivo === "amizades" && (
                          <div className="size-3 rounded-full bg-linear-to-r from-[#ffa98f] to-[#ff8566]" />
                        )}
                      </div>
                    </div>
                    <input
                      type="radio"
                      name="objetivo"
                      value="amizades"
                      checked={formData.objetivo === "amizades"}
                      onChange={(e) => handleChange("objetivo", e.target.value)}
                      className="sr-only"
                    />
                    <div className="flex-1">
                      <div className="font-bold text-[#0a0a0a] mb-1">
                        Amizades
                      </div>
                      <div className="text-sm text-[#4a5565]">
                        Find playmates and friends for your pet
                      </div>
                    </div>
                  </label>

                  {/* Encontros */}
                  <label
                    className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      formData.objetivo === "encontros"
                        ? "border-[#ffa98f] bg-[rgba(255,169,143,0.05)]"
                        : "border-[#e5e7eb] bg-white hover:border-[#ffa98f]"
                    }`}
                  >
                    <div className="mt-0.5">
                      <div className="size-6 rounded-full border-2 border-[#ffa98f] flex items-center justify-center">
                        {formData.objetivo === "encontros" && (
                          <div className="size-3 rounded-full bg-linear-to-r from-[#ffa98f] to-[#ff8566]" />
                        )}
                      </div>
                    </div>
                    <input
                      type="radio"
                      name="objetivo"
                      value="encontros"
                      checked={formData.objetivo === "encontros"}
                      onChange={(e) => handleChange("objetivo", e.target.value)}
                      className="sr-only"
                    />
                    <div className="flex-1">
                      <div className="font-bold text-[#0a0a0a] mb-1">
                        Encontros
                      </div>
                      <div className="text-sm text-[#4a5565]">
                        Connect for responsible breeding
                      </div>
                    </div>
                  </label>

                  {/* Breeding Intent - Aparece apenas quando "Encontros" está selecionado */}
                  {formData.objetivo === "encontros" && (
                    <div className="mt-1 px-6 py-8 bg-[#FFA98F]/12 rounded-lg border-2 border-[#FFA98F]/28">
                      <div className="flex items-start gap-5 mb-4">
                        <div className="size-9 rounded-full bg-white border border-[#F2D4C8] flex items-center justify-center shrink-0">
                          <Heart className="size-5 text-[#ff8566]" />
                        </div>
                        <div>
                          <h4 className="text-base font-bold text-[#0a0a0a] leading-tight">
                            Breeding Intent (Namoro)
                          </h4>
                          <p className="text-sm text-[#4a5565] mt-1">
                            Procuro parceiro(a) para cruzar, que tenham pedigree
                            certificado, para ensuring pet.
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-bold text-[#0a0a0a] mb-3">
                            Pedigree *
                          </label>
                          <div className="relative">
                            <select
                              value={formData.pedigree}
                              onChange={(e) =>
                                handleChange("pedigree", e.target.value)
                              }
                              className={`${touched.pedigree ? "border-[#FFA98F]/70 bg-[#FFF7F1]/72 focus:ring-[#FFA98F]/14 transition-all" : "border-transparent bg-white transition-colors"} w-full appearance-none px-4 pr-12 py-2 rounded-lg border-2 text-[#0a0a0a] focus:border-[#FFA98F] focus:outline-none h-11.5`}
                              required={formData.objetivo === "encontros"}
                            >
                              <option value="">Selecione uma opção</option>
                              <option value="sim">Sim, Verificado</option>
                              <option value="nao">Não Possui</option>
                            </select>
                            <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 size-4 text-[#ff8566]" />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-[#0a0a0a] mb-3">
                            Registro Médico
                          </label>
                          <label className="flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-[#ffa98f] hover:bg-[#ff8566] transition-colors cursor-pointer bg-[#ffa98f] w-full h-11.5">
                            <Plus className="w-5 h-5 text-white shrink-0" />
                            <span className="text-sm text-white">
                              Adicionar arquivo
                            </span>
                            <input
                              type="file"
                              accept="application/pdf,image/*"
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Seção Opcional - Biografia */}
            <div>
              <h3 className="text-2xl font-bold text-[#0a0a0a] mb-6">
                Sobre o Pet
              </h3>

              <div>
                <label className="block text-sm font-semibold text-[#0a0a0a] mb-2">
                  Biografia (opcional)
                </label>
                <textarea
                  value={formData.biografia}
                  onChange={(e) => handleChange("biografia", e.target.value)}
                  placeholder="Conte mais sobre a personalidade, características especiais e preferências do seu pet..."
                  rows={5}
                  className={`${touched.biografia ? "border-[#FFA98F]/70 bg-[#FFF7F1]/72 focus:ring-[#FFA98F]/14 transition-all" : "border-[#d1d5dc] bg-white transition-colors"} w-full px-4 py-3 rounded-lg border-2 text-[#0a0a0a] focus:border-[#FFA98F] focus:outline-none resize-none`}
                />
                <p className="text-xs text-[#4a5565] mt-2">
                  Máximo 500 caracteres
                </p>
              </div>
            </div>

            {/* Mensagens */}
            {message && (
              <div
                className="bg-green-50 border-2 border-green-200 rounded-lg p-4 text-green-700"
                role="status"
                aria-live="polite"
              >
                {message}
              </div>
            )}
            {error && (
              <div
                className="bg-red-50 border-2 border-red-200 rounded-lg p-4 text-red-700"
                role="alert"
                aria-live="assertive"
              >
                {error}
              </div>
            )}

            {/* Botões de Ação */}
            <div className="flex justify-end gap-4 pt-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="btn-secondary h-11.5 px-6 border-transparent"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn h-11.5 px-6"
              >
                {isSubmitting ? "Cadastrando..." : "Cadastrar Pet"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
