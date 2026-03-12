/* eslint-disable @next/next/no-img-element */
import React, { useState, useRef, useEffect } from 'react';
import Layout from '../src/components/Layout';
import { Heart, MessageCircle, User, Plus, X } from 'lucide-react';
import { useRouter } from 'next/router';
import { listPets, updatePet } from '../src/services/pets';
import { showToast } from '../src/services/toast';

export default function PetEdit({ petData: initialPetData = null }) {
  const router = useRouter();
  const petId = router.query.id ? Number(router.query.id) : null;

  const [petData, setPetData] = useState(initialPetData || null);
  const [loading, setLoading] = useState(!!petId);

  // Load pet from API if ID is provided in query
  useEffect(() => {
    if (!petId) return;

    let mounted = true;
    async function loadPet() {
      try {
        const allPets = await listPets();
        const pet = Array.isArray(allPets) ? allPets.find(p => p.id === petId) : null;
        if (!mounted) return;
        setPetData(pet || null);
      } catch (err) {
        console.error('Error loading pet', err);
        if (mounted) setPetData(null);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadPet();
    return () => { mounted = false; };
  }, [petId]);

  const initialMainPhoto = petData?.mainPhoto || null;

  const initialAdditionalPhotos = petData?.additionalPhotos
    ? [...petData.additionalPhotos, ...Array(4 - petData.additionalPhotos.length).fill(null)].slice(0, 4)
    : [null, null, null, null];

  const [mainPhoto, setMainPhoto] = useState(initialMainPhoto);
  const [additionalPhotos, setAdditionalPhotos] = useState(initialAdditionalPhotos);

  const mainPhotoInputRef = useRef(null);
  const additionalPhotoRefs = useRef([]);
  const registroMedicoInputRef = useRef(null);

  const [formData, setFormData] = useState({
    nome: petData?.nome || '',
    especie: petData?.especie || 'cachorro',
    idade: petData?.idade || '',
    sexo: petData?.sexo || 'macho',
    raca: petData?.raca || '',
    objetivo: petData?.objetivo || 'encontros',
    breedingEnabled: petData?.breedingEnabled || false,
    pedigree: petData?.pedigree || '',
    registroMedico: petData?.registroMedico || '',
    biografia: petData?.biografia || '',
    cep: petData?.cep || '',
  });

  const [registroMedicoFile, setRegistroMedicoFile] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!petData) return;

    const nextMainPhoto = petData.mainPhoto || petData.image || petData.imageUrl || null;
    const nextAdditionalPhotos = Array.isArray(petData.additionalPhotos)
      ? [...petData.additionalPhotos, ...Array(4 - petData.additionalPhotos.length).fill(null)].slice(0, 4)
      : [null, null, null, null];

    setMainPhoto(nextMainPhoto);
    setAdditionalPhotos(nextAdditionalPhotos);

    setFormData({
      nome: petData.nome ?? petData.name ?? '',
      especie: petData.especie ?? petData.species ?? 'cachorro',
      idade: String(petData.idade ?? petData.age ?? petData.ageMonths ?? ''),
      sexo: petData.sexo ?? petData.sex ?? 'macho',
      raca: petData.raca ?? petData.breed ?? '',
      objetivo: petData.objetivo || 'encontros',
      breedingEnabled: Boolean(petData.breedingEnabled),
      pedigree: petData.pedigree || '',
      registroMedico: petData.registroMedico || '',
      biografia: petData.biografia ?? petData.description ?? petData.bio ?? '',
      cep: petData.cep ?? '',
    });
  }, [petData]);

  const handleMainPhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => setMainPhoto(reader.result);
    reader.readAsDataURL(file);
  };

  const handleAdditionalPhotoChange = (index, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const newPhotos = [...additionalPhotos];
      newPhotos[index] = reader.result;
      setAdditionalPhotos(newPhotos);
    };
    reader.readAsDataURL(file);
  };

  const handleRegistroMedicoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setRegistroMedicoFile(file);
    setFormData((prev) => ({ ...prev, registroMedico: file.name }));
  };

  const removeMainPhoto = () => {
    setMainPhoto(null);
    if (mainPhotoInputRef.current) {
      mainPhotoInputRef.current.value = '';
    }
  };

  const removeAdditionalPhoto = (index) => {
    const newPhotos = [...additionalPhotos];
    newPhotos[index] = null;
    setAdditionalPhotos(newPhotos);

    if (additionalPhotoRefs.current[index]) {
      additionalPhotoRefs.current[index].value = '';
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!petId || isSaving) return;

    setIsSaving(true);

    const payload = {
      name: formData.nome || '',
      species: formData.especie || '',
      ageMonths: formData.idade === '' ? null : Number(formData.idade),
      sex: formData.sexo || null,
      breed: formData.raca || null,
      description: formData.biografia || null,
      cep: formData.cep || null,
      mainPhoto: mainPhoto || null,
      additionalPhotos: additionalPhotos.filter(Boolean),
    };

    try {
      await updatePet(petId, payload);
      showToast('Informações do pet salvas com sucesso.', 'success');
      router.push('/tutor-profile');
    } catch (err) {
      console.error('Erro ao salvar pet', err);
      showToast(err?.response?.data?.error || 'Falha ao salvar informações do pet.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleVoltar = () => {
    router.back();
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {loading ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <p className="text-gray-500">Carregando informações do pet...</p>
          </div>
        ) : (
          <>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="section-title">Editar perfil do pet</h2>
              <div className="flex items-center gap-2">
                <button onClick={() => router.push('/match-display')} className="btn-icon" aria-label="Ir para Match">
                  <Heart />
                </button>
                <button onClick={() => router.push('/chat-on')} className="btn-icon" aria-label="Abrir Chat">
                  <MessageCircle />
                </button>
            <button onClick={() => router.push('/tutor-profile')} className="btn-icon" aria-label="Abrir Perfil">
              <User />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="card p-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <div className="relative">
                  <div className="w-full h-64 bg-slate-100 rounded-xl flex items-center justify-center overflow-hidden">
                    {mainPhoto ? (
                      <img src={mainPhoto} className="object-cover w-full h-full" alt="Main" loading="lazy" decoding="async" />
                    ) : (
                      <div className="text-center text-gray-400 px-4">
                        <div className="mb-2">Foto principal</div>
                        <div className="text-xs">Adicione uma foto que represente melhor o seu pet.</div>
                      </div>
                    )}
                  </div>

                  <div className="absolute left-4 top-4 flex gap-2">
                    <label className="btn-secondary cursor-pointer">
                      <input ref={mainPhotoInputRef} type="file" accept="image/*" onChange={handleMainPhotoChange} onClick={(e) => e.stopPropagation()} className="hidden" />
                      <Plus className="size-4" />
                    </label>
                    {mainPhoto && (
                      <button type="button" onClick={removeMainPhoto} className="btn-secondary">
                        <X className="size-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <div className="text-sm font-semibold mb-2">Galeria</div>
                  <div className="grid grid-cols-4 gap-2">
                    {additionalPhotos.map((p, i) => (
                      <div key={i} className="relative w-full pb-[100%] bg-slate-50 rounded-lg overflow-hidden">
                        {p ? <img src={p} alt="Foto do pet" className="absolute inset-0 w-full h-full object-cover" loading="lazy" decoding="async" /> : <div className="absolute inset-0 flex items-center justify-center text-gray-300">+</div>}
                        <input ref={(el) => (additionalPhotoRefs.current[i] = el)} type="file" accept="image/*" onChange={(e) => handleAdditionalPhotoChange(i, e)} onClick={(e) => e.stopPropagation()} className="absolute inset-0 opacity-0 cursor-pointer" />
                        {p && (
                          <button type="button" onClick={() => removeAdditionalPhoto(i)} className="btn-icon absolute top-1 right-1 size-6 p-0 rounded-full shadow">
                            <X className="size-3" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="md:col-span-2">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Nome</label>
                    <input value={formData.nome} onChange={(e) => handleChange('nome', e.target.value)} className="input" placeholder="Nome do pet" />
                  </div>

                  <div>
                    <label className="label">Espécie</label>
                    <select value={formData.especie} onChange={(e) => handleChange('especie', e.target.value)} className="input">
                      <option value="cachorro">Cachorro</option>
                      <option value="gato">Gato</option>
                    </select>
                  </div>

                  <div>
                    <label className="label">Idade (meses)</label>
                    <input value={formData.idade} onChange={(e) => handleChange('idade', e.target.value)} className="input" placeholder="0" />
                  </div>

                  <div>
                    <label className="label">Sexo</label>
                    <select value={formData.sexo} onChange={(e) => handleChange('sexo', e.target.value)} className="input">
                      <option value="macho">Macho</option>
                      <option value="femea">Fêmea</option>
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className="label">Raça</label>
                    <input value={formData.raca} onChange={(e) => handleChange('raca', e.target.value)} className="input" placeholder="Ex: Labrador" />
                  </div>

                  <div className="col-span-2">
                    <label className="label">Objetivo</label>
                    <select value={formData.objetivo} onChange={(e) => handleChange('objetivo', e.target.value)} className="input">
                      <option value="encontros">Encontros</option>
                      <option value="adocao">Adoção</option>
                      <option value="criacao">Criação</option>
                    </select>
                  </div>

                  <div className="col-span-2 flex items-center gap-3">
                    <input id="breedToggle" type="checkbox" checked={formData.breedingEnabled} onChange={(e) => handleChange('breedingEnabled', e.target.checked)} />
                    <label htmlFor="breedToggle" className="text-sm">Disponível para reprodução</label>
                  </div>

                  <div className="col-span-2">
                    <label className="label">Pedigree</label>
                    <input value={formData.pedigree} onChange={(e) => handleChange('pedigree', e.target.value)} className="input" placeholder="Número do pedigree" />
                  </div>

                  <div className="col-span-2">
                    <label className="label">Registro médico (arquivo)</label>
                    <div className="flex items-center gap-3">
                      <label className="btn-secondary cursor-pointer">
                        <input ref={registroMedicoInputRef} type="file" accept="application/pdf,image/*" onChange={handleRegistroMedicoChange} onClick={(e) => e.stopPropagation()} className="hidden" />
                        <Plus />
                      </label>
                      <div className="text-sm text-gray-600">{formData.registroMedico || 'Nenhum arquivo selecionado'}</div>
                    </div>
                  </div>

                  <div className="col-span-2">
                    <label className="label">Biografia</label>
                    <textarea rows={4} placeholder="Conte mais sobre o seu pet..." value={formData.biografia} onChange={(e) => handleChange('biografia', e.target.value)} className="input resize-none" />
                  </div>
                  <div className="col-span-2">
                    <label className="label">CEP</label>
                    <input value={formData.cep} onChange={(e) => handleChange('cep', e.target.value)} className="input" placeholder="00000-000" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button type="button" onClick={handleVoltar} className="btn-secondary">Voltar</button>
            <button type="submit" className="btn" disabled={isSaving} aria-busy={isSaving}>
              {isSaving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
          </>
        )}
      </div>
    </Layout>
  );
}
