/* eslint-disable @next/next/no-img-element */
import { Upload, ChevronLeft, ChevronRight, Check, Image as ImageIcon, X, Dog, Shield, Heart, Award } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import Header from '../src/components/Header';
import { getMe } from '../src/services/auth';
import { listPets, updatePet } from '../src/services/pets';
import { showToast } from '../src/services/toast';

function parseListField(text) {
  if (!text) return [];
  return String(text).split(',').map((item) => item.trim()).filter(Boolean);
}

function parseExistingDescription(description) {
  const parsed = {
    bio: '', dataNascimento: '', peso: '', cor: '', porte: '',
    temperamento: [], vacinacao: [], genetica: [], alergias: [], medicamentos: [],
    objetivo: 'amizades', pedigreePai: '', pedigreeMae: '', pedigreeVerificado: false,
    ninhadas: '', ultimaReproducao: '', observacoesReproducao: '',
  };

  if (!description || typeof description !== 'string') return parsed;
  const text = description.replace(/\r/g, '').trim();
  if (!text) return parsed;

  const blocks = text.split('\n\n').map((part) => part.trim()).filter(Boolean);
  parsed.bio = blocks[0] || '';
  const parts = blocks.join(' | ').split('|').map((item) => item.trim()).filter(Boolean);

  const getValueByLabel = (value, labels) => {
    for (const label of labels) {
      const regex = new RegExp(`^${label}\\s*:\\s*(.+)$`, 'i');
      const match = value.match(regex);
      if (match?.[1]) return match[1].trim();
    }
    return '';
  };

  parts.forEach((part) => {
    const dataNascimento = getValueByLabel(part, ['Data de nascimento']);
    if (dataNascimento) parsed.dataNascimento = dataNascimento;

    const peso = getValueByLabel(part, ['Peso']);
    if (peso) parsed.peso = peso;

    const cor = getValueByLabel(part, ['Cor']);
    if (cor) parsed.cor = cor;

    const porte = getValueByLabel(part, ['Porte', 'Tamanho']);
    if (porte) parsed.porte = porte;

    const temperamento = getValueByLabel(part, ['Temperamento']);
    if (temperamento) parsed.temperamento = parseListField(temperamento);

    const vacinacao = getValueByLabel(part, ['Vacinação', 'Vacinacao']);
    if (vacinacao) parsed.vacinacao = parseListField(vacinacao);

    const genetica = getValueByLabel(part, ['Genética', 'Genetica']);
    if (genetica) parsed.genetica = parseListField(genetica);

    const alergias = getValueByLabel(part, ['Alergias']);
    if (alergias) parsed.alergias = parseListField(alergias);

    const medicamentos = getValueByLabel(part, ['Medicamentos']);
    if (medicamentos) parsed.medicamentos = parseListField(medicamentos);

    const objetivo = getValueByLabel(part, ['Objetivo']);
    if (objetivo) parsed.objetivo = objetivo.toLowerCase().includes('encontro') ? 'encontros' : 'amizades';

    const pai = getValueByLabel(part, ['Pai']);
    if (pai) parsed.pedigreePai = pai;

    const mae = getValueByLabel(part, ['Mãe', 'Mae']);
    if (mae) parsed.pedigreeMae = mae;

    const pedigreeVerificado = getValueByLabel(part, ['Pedigree verificado']);
    if (pedigreeVerificado) parsed.pedigreeVerificado = pedigreeVerificado.toLowerCase().includes('sim');

    const ninhadas = getValueByLabel(part, ['Ninhadas']);
    if (ninhadas) parsed.ninhadas = ninhadas;

    const ultimaReproducao = getValueByLabel(part, ['Última reprodução', 'Ultima reproducao', 'Ultima reprodução']);
    if (ultimaReproducao) parsed.ultimaReproducao = ultimaReproducao;

    const observacoes = getValueByLabel(part, ['Obs']);
    if (observacoes) parsed.observacoesReproducao = observacoes;
  });

  parsed.bio = parsed.bio
    .replace(/\b(data\s+de\s+nascimento|peso|cor|porte|tamanho|temperamento|objetivo|pai|m[ãa]e|pedigree\s+verificado|ninhadas|[úu]ltima\s+reprodu[cç][ãa]o|obs)\b\s*[:=-].*$/i, '')
    .trim();

  return parsed;
}

function getAgeInMonthsFromDate(birthDate) {
  if (!birthDate) return '';
  const birth = new Date(birthDate);
  if (Number.isNaN(birth.getTime())) return '';
  const today = new Date();
  let months = (today.getFullYear() - birth.getFullYear()) * 12;
  months += today.getMonth() - birth.getMonth();
  if (today.getDate() < birth.getDate()) months -= 1;
  return months >= 0 ? String(months) : '';
}

export default function PetEdit() {
  const router = useRouter();
  const petId = router.query.id ? Number(router.query.id) : null;

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [mainPhoto, setMainPhoto] = useState(null);
  const [additionalPhotos, setAdditionalPhotos] = useState([null, null, null, null]);
  const mainPhotoInputRef = useRef(null);
  const additionalPhotoRefs = useRef([]);

  const [formData, setFormData] = useState({
    nome: '', especie: 'cachorro', dataNascimento: '', sexo: 'macho', raca: '',
    peso: '', cor: '', tamanho: 'médio', temperamento: [], vacinacao: [], genetica: [],
    alergias: [], medicamentos: [], objetivo: 'amizades', pedigreePai: '', pedigreeMae: '',
    pedigreeVerificado: false, ninhadas: '', ultimaReproducao: '', observacoesReproducao: '',
    biografia: '', cep: '',
  });

  const [tempInputs, setTempInputs] = useState({ temperamento: '', vacinacao: '', genetica: '', alergia: '', medicamento: '' });

  const steps = [
    { number: 1, title: 'Fotos do Pet', icon: Upload },
    { number: 2, title: 'Informações Básicas', icon: Dog },
    { number: 3, title: 'Objetivo', icon: Heart },
    { number: 4, title: 'Histórico de Saúde', icon: Shield },
    { number: 5, title: 'Pedigree', icon: Award },
  ];

  useEffect(() => {
    if (!petId) return;
    let mounted = true;

    async function loadPet() {
      try {
        const [allPets, me] = await Promise.all([listPets(), getMe().catch(() => null)]);
        if (!mounted) return;
        const pet = Array.isArray(allPets) ? allPets.find((item) => Number(item.id) === Number(petId)) : null;
        if (!pet) {
          setError('Pet não encontrado para edição.');
          return;
        }

        const parsed = parseExistingDescription(pet.description || '');
        setMainPhoto(pet.mainPhoto || pet.image || pet.imageUrl || null);
        setAdditionalPhotos([...(Array.isArray(pet.additionalPhotos) ? pet.additionalPhotos : []), null, null, null, null].slice(0, 4));

        setFormData((prev) => ({
          ...prev,
          nome: pet.name || '', especie: pet.species || 'cachorro', dataNascimento: pet.birthDate || parsed.dataNascimento || '',
          sexo: pet.sex || 'macho', raca: pet.breed || '', peso: parsed.peso || '', cor: parsed.cor || '', tamanho: parsed.porte || 'médio',
          temperamento: parsed.temperamento, vacinacao: parsed.vacinacao, genetica: parsed.genetica, alergias: parsed.alergias,
          medicamentos: parsed.medicamentos, objetivo: parsed.objetivo || 'amizades', pedigreePai: parsed.pedigreePai,
          pedigreeMae: parsed.pedigreeMae, pedigreeVerificado: parsed.pedigreeVerificado, ninhadas: parsed.ninhadas,
          ultimaReproducao: parsed.ultimaReproducao, observacoesReproducao: parsed.observacoesReproducao,
          biografia: parsed.bio || '', cep: pet.cep || me?.cep || '',
        }));
      } catch (loadError) {
        console.error('Erro ao carregar pet para edição', loadError);
        if (mounted) setError('Não foi possível carregar o pet.');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadPet();
    return () => { mounted = false; };
  }, [petId]);

  const getInputClassName = (field) => {
    const value = formData[field];
    const hasValue = typeof value === 'string' ? value.trim().length > 0 : Boolean(value);
    return `w-full px-4 py-3 rounded-xl text-base transition-all placeholder:text-[rgba(10,10,10,0.5)] ${
      hasValue
        ? 'border-2 border-[#FFAD93] bg-[rgba(255,173,147,0.03)] focus:outline-none focus:ring-2 focus:ring-[#ffa98f]'
        : 'border border-[#d1d5dc] bg-white focus:outline-none focus:ring-2 focus:ring-[#ffa98f] focus:border-transparent'
    }`;
  };

  const getSelectClassName = (field) => {
    const value = formData[field];
    const hasValue = typeof value === 'string' ? value.trim().length > 0 : Boolean(value);
    return `w-full px-4 py-3 rounded-xl text-base appearance-none cursor-pointer transition-all ${
      hasValue
        ? 'border-2 border-[#FFAD93] bg-[rgba(255,173,147,0.03)] focus:outline-none focus:ring-2 focus:ring-[#ffa98f]'
        : 'border border-[#d1d5dc] bg-white focus:outline-none focus:ring-2 focus:ring-[#ffa98f] focus:border-transparent'
    }`;
  };

  const handleMainPhotoChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setMainPhoto(reader.result);
    reader.readAsDataURL(file);
  };

  const handleAdditionalPhotoChange = (index, event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setAdditionalPhotos((prev) => {
        const updated = [...prev];
        updated[index] = reader.result;
        return updated;
      });
    };
    reader.readAsDataURL(file);
  };

  const removeMainPhoto = () => {
    setMainPhoto(null);
    if (mainPhotoInputRef.current) mainPhotoInputRef.current.value = '';
  };

  const removeAdditionalPhoto = (index) => {
    setAdditionalPhotos((prev) => {
      const updated = [...prev];
      updated[index] = null;
      return updated;
    });
    if (additionalPhotoRefs.current[index]) additionalPhotoRefs.current[index].value = '';
  };

  const handleChange = (field, value) => setFormData((prev) => ({ ...prev, [field]: value }));

  const addTag = (field, tempField) => {
    const value = tempInputs[tempField].trim();
    if (!value || !Array.isArray(formData[field])) return;
    handleChange(field, [...formData[field], value]);
    setTempInputs((prev) => ({ ...prev, [tempField]: '' }));
  };

  const removeTag = (field, index) => {
    if (!Array.isArray(formData[field])) return;
    const next = [...formData[field]];
    next.splice(index, 1);
    handleChange(field, next);
  };

  const buildDescription = () => {
    const blocks = [];
    if (formData.biografia?.trim()) blocks.push(formData.biografia.trim());
    if (formData.dataNascimento) blocks.push(`Data de nascimento: ${formData.dataNascimento}`);

    const baseTraits = [];
    if (formData.peso) baseTraits.push(`Peso: ${formData.peso}`);
    if (formData.cor) baseTraits.push(`Cor: ${formData.cor}`);
    if (formData.tamanho) baseTraits.push(`Porte: ${formData.tamanho}`);
    if (formData.temperamento.length > 0) baseTraits.push(`Temperamento: ${formData.temperamento.join(', ')}`);
    if (baseTraits.length > 0) blocks.push(baseTraits.join(' | '));

    const health = [];
    if (formData.vacinacao.length > 0) health.push(`Vacinação: ${formData.vacinacao.join(', ')}`);
    if (formData.genetica.length > 0) health.push(`Genética: ${formData.genetica.join(', ')}`);
    if (formData.alergias.length > 0) health.push(`Alergias: ${formData.alergias.join(', ')}`);
    if (formData.medicamentos.length > 0) health.push(`Medicamentos: ${formData.medicamentos.join(', ')}`);
    if (health.length > 0) blocks.push(health.join(' | '));

    const intent = [`Objetivo: ${formData.objetivo}`];
    if (formData.objetivo === 'encontros') {
      if (formData.pedigreePai) intent.push(`Pai: ${formData.pedigreePai}`);
      if (formData.pedigreeMae) intent.push(`Mãe: ${formData.pedigreeMae}`);
      intent.push(`Pedigree verificado: ${formData.pedigreeVerificado ? 'Sim' : 'Não'}`);
    }
    blocks.push(intent.join(' | '));

    if (formData.ninhadas || formData.ultimaReproducao || formData.observacoesReproducao) {
      const reproduction = [];
      if (formData.ninhadas) reproduction.push(`Ninhadas: ${formData.ninhadas}`);
      if (formData.ultimaReproducao) reproduction.push(`Última reprodução: ${formData.ultimaReproducao}`);
      if (formData.observacoesReproducao) reproduction.push(`Obs: ${formData.observacoesReproducao}`);
      blocks.push(reproduction.join(' | '));
    }

    return blocks.filter(Boolean).join('\n\n');
  };

  const canProceedToNextStep = () => {
    if (currentStep === 1) return mainPhoto !== null;
    if (currentStep === 2) {
      return formData.nome.trim() && formData.raca.trim() && formData.dataNascimento && formData.peso.trim() && formData.cor.trim();
    }
    return true;
  };

  const nextStep = () => {
    if (currentStep >= 5) return;
    if (!canProceedToNextStep()) {
      setError('Preencha os campos obrigatórios da etapa para continuar.');
      return;
    }
    setError('');
    setCurrentStep((prev) => prev + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const prevStep = () => {
    if (currentStep <= 1) return;
    setError('');
    setCurrentStep((prev) => prev - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!petId || isSubmitting) return;

    setError('');
    setIsSubmitting(true);

    try {
      const payload = {
        name: formData.nome.trim(),
        species: formData.especie,
        ageMonths: getAgeInMonthsFromDate(formData.dataNascimento),
        birthDate: formData.dataNascimento || null,
        sex: formData.sexo,
        breed: formData.raca.trim(),
        description: buildDescription(),
        cep: formData.cep || null,
        mainPhoto: mainPhoto || null,
        additionalPhotos: additionalPhotos.filter(Boolean),
      };

      await updatePet(petId, payload);
      showToast('Perfil do pet atualizado com sucesso.', 'success');
      setShowSuccessModal(true);
    } catch (submitError) {
      console.error('Falha ao atualizar pet', submitError);
      const message = submitError?.response?.data?.error || 'Falha ao atualizar perfil do pet.';
      setError(message);
      showToast(message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF7F1]">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg p-4 sm:p-6 lg:p-10">
          {loading ? (
            <div className="py-20 text-center text-[#6a7282]">Carregando perfil do pet...</div>
          ) : (
            <>
              <div className="mb-6 sm:mb-8">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#0a0a0a] mb-2">Editar Perfil do Pet</h2>
                <p className="text-xs sm:text-sm lg:text-base text-[#4a5565]">Atualize as informações no mesmo fluxo do cadastro.</p>
              </div>

              <div className="mb-6 sm:mb-8 hidden sm:flex items-start justify-between">
                {steps.map((step, index) => {
                  const StepIcon = step.icon;
                  const isCompleted = currentStep > step.number;
                  const isCurrent = currentStep === step.number;

                  return (
                    <div key={step.number} className="flex items-center flex-1">
                      <div className="flex flex-col items-center flex-1 self-start min-h-21">
                        <div className={`size-10 sm:size-12 rounded-full flex items-center justify-center transition-all mb-2 ${
                          isCompleted
                            ? 'bg-gradient-to-r from-[#ffa98f] to-[#ff8566] text-white'
                            : isCurrent
                              ? 'bg-[#FFAD93] text-white ring-4 ring-[rgba(255,173,147,0.3)]'
                              : 'bg-gray-200 text-gray-400'
                        }`}>
                          {isCompleted ? <Check className="size-5 sm:size-6" /> : <StepIcon className="size-5 sm:size-6" />}
                        </div>
                        <span className={`text-xs font-medium text-center leading-tight min-h-8 flex items-start justify-center ${isCurrent ? 'text-[#FFAD93]' : isCompleted ? 'text-[#0a0a0a]' : 'text-gray-400'}`}>
                          {step.title}
                        </span>
                      </div>
                      {index < steps.length - 1 && (
                        <div className={`h-1 flex-1 mx-2 rounded ${isCompleted ? 'bg-gradient-to-r from-[#ffa98f] to-[#ff8566]' : 'bg-gray-200'}`} />
                      )}
                    </div>
                  );
                })}
              </div>

              <form onSubmit={handleSubmit}>
                {currentStep === 1 && (
                  <div className="space-y-3">
                    <label className="block text-base font-bold text-[#0a0a0a]">Fotos do Pet *</label>
                    <div className="flex flex-col lg:flex-row gap-3">
                      <div className="flex-1 lg:flex-[2]">
                        <div className="relative bg-[rgba(255,169,143,0.1)] border-2 border-[rgba(255,169,143,0.75)] border-dashed rounded-2xl overflow-hidden">
                          {mainPhoto ? (
                            <div className="relative aspect-square lg:aspect-[4/3]">
                              <img src={mainPhoto} alt="Foto principal" className="w-full h-full object-contain" />
                              <button type="button" onClick={removeMainPhoto} className="absolute top-3 right-3 size-10 rounded-full bg-gradient-to-r from-[#ffa98f] to-[#ff8566] text-white flex items-center justify-center"><X className="size-5" /></button>
                            </div>
                          ) : (
                            <label className="block aspect-square lg:aspect-[4/3] cursor-pointer flex items-center justify-center">
                              <ImageIcon className="size-12 sm:size-14 text-[#ffa98f]" strokeWidth={1.5} />
                              <input type="file" accept="image/*" ref={mainPhotoInputRef} onChange={handleMainPhotoChange} className="hidden" />
                            </label>
                          )}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="grid grid-cols-2 gap-3">
                          {additionalPhotos.map((photo, index) => (
                            <div key={index} className="relative rounded-xl overflow-hidden bg-[rgba(255,169,143,0.1)] border-2 border-[rgba(255,169,143,0.75)] border-dashed">
                              {photo ? (
                                <div className="relative">
                                  <img src={photo} alt={`Foto ${index + 1}`} className="w-full aspect-square object-contain" />
                                  <button type="button" onClick={() => removeAdditionalPhoto(index)} className="absolute top-2 right-2 size-8 rounded-full bg-gradient-to-r from-[#ffa98f] to-[#ff8566] text-white flex items-center justify-center"><X className="size-4" /></button>
                                </div>
                              ) : (
                                <label className="block aspect-square cursor-pointer flex items-center justify-center">
                                  <ImageIcon className="size-8 text-[#ffa98f]" strokeWidth={1.5} />
                                  <input type="file" accept="image/*" ref={(el) => { additionalPhotoRefs.current[index] = el; }} onChange={(event) => handleAdditionalPhotoChange(index, event)} className="hidden" />
                                </label>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-[#0a0a0a] pb-2 border-b-2 border-[#FFAD93]">Informações Básicas</h3>
                    <input type="text" value={formData.nome} onChange={(event) => handleChange('nome', event.target.value)} placeholder="Nome" className={getInputClassName('nome')} required />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <select value={formData.especie} onChange={(event) => handleChange('especie', event.target.value)} className={getSelectClassName('especie')} required><option value="cachorro">Cachorro</option><option value="gato">Gato</option></select>
                      <input type="text" value={formData.raca} onChange={(event) => handleChange('raca', event.target.value)} placeholder="Raça" className={getInputClassName('raca')} required />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <input type="date" value={formData.dataNascimento} onChange={(event) => handleChange('dataNascimento', event.target.value)} className={getInputClassName('dataNascimento')} required />
                      <select value={formData.sexo} onChange={(event) => handleChange('sexo', event.target.value)} className={getSelectClassName('sexo')} required><option value="macho">Macho</option><option value="femea">Fêmea</option></select>
                      <input type="text" value={formData.peso} onChange={(event) => handleChange('peso', event.target.value)} placeholder="Peso" className={getInputClassName('peso')} required />
                      <input type="text" value={formData.cor} onChange={(event) => handleChange('cor', event.target.value)} placeholder="Cor" className={getInputClassName('cor')} required />
                    </div>
                    <select value={formData.tamanho} onChange={(event) => handleChange('tamanho', event.target.value)} className={getSelectClassName('tamanho')} required>
                      <option value="pequeno">Pequeno</option><option value="médio">Médio</option><option value="grande">Grande</option>
                    </select>
                    <div className="flex gap-2">
                      <input type="text" value={tempInputs.temperamento} onChange={(event) => setTempInputs((prev) => ({ ...prev, temperamento: event.target.value }))} onKeyDown={(event) => event.key === 'Enter' && (event.preventDefault(), addTag('temperamento', 'temperamento'))} placeholder="Temperamento" className="flex-1 px-4 py-3 border border-[#d1d5dc] rounded-xl text-base" />
                      <button type="button" onClick={() => addTag('temperamento', 'temperamento')} className="px-6 bg-[#FFAD93] text-white rounded-xl">Adicionar</button>
                    </div>
                    {formData.temperamento.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.temperamento.map((tag, index) => (
                          <span key={`${tag}-${index}`} className="px-3 py-1.5 rounded-full border-2 border-[#FFAD93] bg-[rgba(255,173,147,0.03)] text-[#FFAD93] text-sm font-bold flex items-center gap-1.5">
                            {tag}<button type="button" onClick={() => removeTag('temperamento', index)}><X className="size-3.5" /></button>
                          </span>
                        ))}
                      </div>
                    )}
                    <textarea rows={4} value={formData.biografia} onChange={(event) => handleChange('biografia', event.target.value)} placeholder="Biografia" className={getInputClassName('biografia')} />
                  </div>
                )}

                {currentStep === 4 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-[#0a0a0a] pb-2 border-b-2 border-[#FFAD93]">Histórico de Saúde</h3>
                    {[
                      ['vacinacao', 'vacinacao', 'Vacinação'],
                      ['genetica', 'genetica', 'Genética'],
                      ['alergias', 'alergia', 'Alergias'],
                      ['medicamentos', 'medicamento', 'Medicamentos'],
                    ].map(([field, tempField, label]) => (
                      <div key={field} className="space-y-2">
                        <label className="block text-sm font-medium text-[#0a0a0a]">{label}</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={tempInputs[tempField]}
                            onChange={(event) => setTempInputs((prev) => ({ ...prev, [tempField]: event.target.value }))}
                            onKeyDown={(event) => event.key === 'Enter' && (event.preventDefault(), addTag(field, tempField))}
                            className="flex-1 px-3 py-2.5 border border-[#d1d5dc] rounded-lg text-sm"
                          />
                          <button type="button" onClick={() => addTag(field, tempField)} className="px-5 bg-[#FFAD93] hover:bg-[#FF9D8B] text-white rounded-lg text-sm font-bold transition-colors">+</button>
                        </div>
                        {formData[field].length > 0 && (
                          <div className="space-y-1.5 mt-2">
                            {formData[field].map((item, index) => (
                              <div key={`${item}-${index}`} className="flex items-center justify-between px-3 py-2 rounded-lg border-2 border-[#FFAD93] bg-[rgba(255,173,147,0.03)] text-sm font-bold">
                                <span>{item}</span>
                                <button type="button" onClick={() => removeTag(field, index)} className="text-red-500 hover:text-red-600">
                                  <X className="size-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-bold text-[#0a0a0a] pb-2 border-b-2 border-[#FFAD93]">O que você busca?</h3>
                    <div className="space-y-4">
                      {[
                        ['amizades', 'Amizades', 'Encontre companheiros de brincadeira e socialização para seu pet'],
                        ['encontros', 'Encontros', 'Conexão para reprodução responsável com animais de pedigree'],
                      ].map(([value, title, subtitle]) => (
                        <label key={value} className={`flex items-start gap-4 p-5 rounded-xl border-2 cursor-pointer transition-all ${formData.objetivo === value ? 'border-[#ffa98f] bg-[rgba(255,169,143,0.08)] shadow-md' : 'border-[#e5e7eb] bg-white hover:border-[#ffa98f] hover:shadow-sm'}`}>
                          <input type="radio" name="objetivo" value={value} checked={formData.objetivo === value} onChange={(event) => handleChange('objetivo', event.target.value)} className="sr-only" />
                          <div>
                            <div className="font-bold text-[#0a0a0a] mb-1 text-lg">{title}</div>
                            <div className="text-sm text-[#4a5565]">{subtitle}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {currentStep === 5 && (
                  <div className="space-y-6">
                    <div className="space-y-4 p-6 rounded-xl bg-[rgba(255,173,147,0.05)] border-2 border-[#FFAD93]">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-[#0a0a0a]">Informações de Pedigree</h3>
                        <button
                          type="button"
                          onClick={() => handleChange('pedigreeVerificado', !formData.pedigreeVerificado)}
                          className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${formData.pedigreeVerificado ? 'bg-linear-to-r from-[#ffa98f] to-[#ff8566]' : 'bg-gray-300'}`}
                        >
                          <span className={`inline-block size-5 transform rounded-full bg-white transition-transform ${formData.pedigreeVerificado ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <input type="text" value={formData.pedigreePai} onChange={(event) => handleChange('pedigreePai', event.target.value)} placeholder="Pai" className={getInputClassName('pedigreePai')} />
                        <input type="text" value={formData.pedigreeMae} onChange={(event) => handleChange('pedigreeMae', event.target.value)} placeholder="Mãe" className={getInputClassName('pedigreeMae')} />
                      </div>
                    </div>
                  </div>
                )}

                {error && <div className="mt-6 bg-red-50 border-2 border-red-200 rounded-lg p-4 text-red-700">{error}</div>}

                <div className="flex flex-col sm:flex-row gap-3 pt-8">
                  {currentStep === 1 && (
                    <button
                      type="button"
                      onClick={() => router.push('/tutor-profile')}
                      className="flex-1 px-6 py-3 border-2 border-[#d1d5dc] text-[#0a0a0a] rounded-xl font-medium hover:bg-gray-50 transition-colors"
                    >
                      Cancelar
                    </button>
                  )}

                  {currentStep > 1 && (
                    <button type="button" onClick={prevStep} className="flex-1 px-6 py-3 border-2 border-[#d1d5dc] text-[#0a0a0a] rounded-xl font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"><ChevronLeft className="size-5" />Anterior</button>
                  )}
                  {currentStep < 5 ? (
                    <button type="button" onClick={nextStep} disabled={!canProceedToNextStep()} className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${canProceedToNextStep() ? 'bg-linear-to-r from-[#ffa98f] to-[#ff8566] text-white hover:shadow-lg' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>Próximo<ChevronRight className="size-5" /></button>
                  ) : (
                    <button type="submit" disabled={isSubmitting} className="flex-1 bg-linear-to-r from-[#ffa98f] to-[#ff8566] text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-shadow flex items-center justify-center gap-2 disabled:opacity-70"><Check className="size-5" />{isSubmitting ? 'Salvando...' : 'Salvar Alterações'}</button>
                  )}
                </div>
              </form>
            </>
          )}
        </div>
      </main>

      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8">
            <div className="flex justify-center mb-4"><div className="size-16 sm:size-20 rounded-full bg-linear-to-r from-[#ffa98f] to-[#ff8566] flex items-center justify-center"><Check className="size-8 sm:size-10 text-white" strokeWidth={3} /></div></div>
            <div className="text-center mb-6"><h2 className="text-xl sm:text-2xl font-bold text-[#0a0a0a] mb-3">Perfil atualizado com sucesso!</h2><p className="text-sm sm:text-base text-[#4a5565]">As alterações de {formData.nome || 'seu pet'} já estão salvas.</p></div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button type="button" onClick={() => router.push('/tutor-profile')} className="flex-1 px-6 py-3 border-2 border-[#FFAD93] text-[#FFAD93] rounded-xl font-medium hover:bg-[rgba(255,173,147,0.1)] transition-colors">Ver Perfil</button>
              <button type="button" onClick={() => router.push('/match-display')} className="flex-1 bg-linear-to-r from-[#ffa98f] to-[#ff8566] text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-shadow">Buscar Matches</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
