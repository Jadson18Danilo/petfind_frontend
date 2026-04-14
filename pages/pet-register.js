/* eslint-disable @next/next/no-img-element */
import { Heart, Plus, X, Dog, Calendar, Scale, Palette, Ruler, FileText, Award, Syringe, Dna, Activity, Shield, Upload, ChevronLeft, ChevronRight, Check, Image as ImageIcon } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import { createPet } from '../src/services/pets';
import Header from '../src/components/Header';

export default function PetRegister({
  onNavigateToInicioMatch,
  onNavigateToPerfil,
  onPetCadastrado,
  onNavigateToMatches,
}) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);

  const [mainPhoto, setMainPhoto] = useState(null);
  const [mainPhotoFile, setMainPhotoFile] = useState(null);
  const [additionalPhotos, setAdditionalPhotos] = useState([null, null, null, null]);
  const [additionalPhotoFiles, setAdditionalPhotoFiles] = useState([null, null, null, null]);

  const mainPhotoInputRef = useRef(null);
  const additionalPhotoRefs = useRef([]);
  const pedigreeFileInputRef = useRef(null);

  const [pedigreeFile, setPedigreeFile] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [me, setMe] = useState(null);

  const [formData, setFormData] = useState({
    nome: '',
    especie: 'cachorro',
    dataNascimento: '',
    sexo: 'macho',
    raca: '',
    peso: '',
    cor: '',
    tamanho: 'médio',
    temperamento: [],
    vacinacao: [],
    genetica: [],
    alergias: [],
    medicamentos: [],
    objetivo: 'amizades',
    pedigreePai: '',
    pedigreeMae: '',
    pedigreeAvoPaterno: '',
    pedigreeAvoMaterno: '',
    pedigreeVerificado: false,
    ninhadas: '',
    ultimaReproducao: '',
    observacoesReproducao: '',
    biografia: '',
  });

  const [tempInputs, setTempInputs] = useState({
    temperamento: '',
    vacinacao: '',
    genetica: '',
    alergia: '',
    medicamento: '',
  });

  useEffect(() => {
    let mounted = true;

    import('../src/services/auth')
      .then(({ getMe }) => getMe())
      .then((data) => {
        if (mounted) setMe(data);
      })
      .catch(() => {});

    return () => {
      mounted = false;
    };
  }, []);

  const steps = [
    { number: 1, title: 'Fotos do Pet', icon: Upload },
    { number: 2, title: 'Informações Básicas', icon: Dog },
    { number: 3, title: 'Objetivo', icon: Heart },
    { number: 4, title: 'Histórico de Saúde', icon: Shield },
    { number: 5, title: 'Pedigree', icon: Award },
  ];

  const handleMainPhotoChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setMainPhotoFile(file);

    const reader = new FileReader();
    reader.onloadend = () => setMainPhoto(reader.result);
    reader.readAsDataURL(file);
  };

  const handleAdditionalPhotoChange = (index, event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setAdditionalPhotoFiles((prev) => {
      const updated = [...prev];
      updated[index] = file;
      return updated;
    });

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

  const handlePedigreeFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) setPedigreeFile(file);
  };

  const removeMainPhoto = () => {
    setMainPhoto(null);
    setMainPhotoFile(null);
    if (mainPhotoInputRef.current) mainPhotoInputRef.current.value = '';
  };

  const removeAdditionalPhoto = (index) => {
    setAdditionalPhotos((prev) => {
      const updated = [...prev];
      updated[index] = null;
      return updated;
    });

    setAdditionalPhotoFiles((prev) => {
      const updated = [...prev];
      updated[index] = null;
      return updated;
    });

    if (additionalPhotoRefs.current[index]) {
      additionalPhotoRefs.current[index].value = '';
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addTag = (field, tempField) => {
    const value = tempInputs[tempField].trim();
    if (!value) return;

    if (Array.isArray(formData[field])) {
      handleChange(field, [...formData[field], value]);
      setTempInputs((prev) => ({ ...prev, [tempField]: '' }));
    }
  };

  const removeTag = (field, index) => {
    if (!Array.isArray(formData[field])) return;

    const newArray = [...formData[field]];
    newArray.splice(index, 1);
    handleChange(field, newArray);
  };

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

  const getAgeInMonthsFromDate = (birthDate) => {
    if (!birthDate) return '';

    const birth = new Date(birthDate);
    if (Number.isNaN(birth.getTime())) return '';

    const today = new Date();
    let months = (today.getFullYear() - birth.getFullYear()) * 12;
    months += today.getMonth() - birth.getMonth();

    if (today.getDate() < birth.getDate()) months -= 1;

    return months >= 0 ? String(months) : '';
  };

  const buildDescription = () => {
    const blocks = [];

    if (formData.biografia?.trim()) {
      blocks.push(formData.biografia.trim());
    }

    if (formData.dataNascimento) {
      blocks.push(`Data de nascimento: ${formData.dataNascimento}`);
    }

    const baseTraits = [];
    if (formData.peso) baseTraits.push(`Peso: ${formData.peso}`);
    if (formData.cor) baseTraits.push(`Cor: ${formData.cor}`);
    if (formData.tamanho) baseTraits.push(`Tamanho: ${formData.tamanho}`);
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
    switch (currentStep) {
      case 1:
        return mainPhoto !== null;
      case 2:
        return (
          formData.nome.trim() &&
          formData.raca.trim() &&
          formData.dataNascimento &&
          formData.peso.trim() &&
          formData.cor.trim()
        );
      default:
        return true;
    }
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

  const handleSubmit = async () => {
    if (isSubmitting) return;

    setError('');
    setIsSubmitting(true);

    try {
      const form = new FormData();
      form.append('name', formData.nome.trim());
      form.append('species', formData.especie);
      form.append('ageMonths', getAgeInMonthsFromDate(formData.dataNascimento));
      if (formData.dataNascimento) {
        form.append('birthDate', formData.dataNascimento);
      }
      form.append('sex', formData.sexo);
      form.append('breed', formData.raca.trim());
      form.append('description', buildDescription());

      if (me?.cep) form.append('cep', me.cep);
      if (mainPhotoFile) form.append('mainPhoto', mainPhotoFile);
      additionalPhotoFiles.filter(Boolean).forEach((file) => form.append('additionalPhotos', file));

      if (pedigreeFile) form.append('pedigreeDocument', pedigreeFile);

      await createPet(form);

      if (onPetCadastrado) {
        onPetCadastrado(formData);
      }

      setShowSuccessModal(true);
    } catch (err) {
      setError(err?.response?.data?.error || 'Falha ao cadastrar pet');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF7F1]">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg p-4 sm:p-6 lg:p-10">
          <div className="mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#0a0a0a] mb-2">Criar Perfil do Pet</h2>
            <p className="text-xs sm:text-sm lg:text-base text-[#4a5565]">Preencha as informações do seu pet para encontrar o match perfeito!</p>
          </div>

          <div className="mb-6 sm:mb-8">
            <div className="hidden sm:flex items-start justify-between mb-4">
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
                      <span className={`text-xs font-medium text-center transition-colors leading-tight min-h-8 flex items-start justify-center ${
                        isCurrent ? 'text-[#FFAD93]' : isCompleted ? 'text-[#0a0a0a]' : 'text-gray-400'
                      }`}>
                        {step.title}
                      </span>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`h-1 flex-1 mx-2 rounded transition-all ${
                        isCompleted ? 'bg-gradient-to-r from-[#ffa98f] to-[#ff8566]' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>

            <div className="sm:hidden space-y-3">
              <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#ffa98f] to-[#ff8566] transition-all duration-300"
                  style={{ width: `${(currentStep / 5) * 100}%` }}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {(() => {
                    const StepIcon = steps[currentStep - 1].icon;
                    return (
                      <div className="size-10 rounded-full bg-[#FFAD93] text-white flex items-center justify-center shadow-md">
                        <StepIcon className="size-5" />
                      </div>
                    );
                  })()}
                  <div>
                    <p className="text-xs text-[#6a7282]">Etapa {currentStep} de 5</p>
                    <p className="text-sm font-bold text-[#FFAD93]">{steps[currentStep - 1].title}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={(event) => event.preventDefault()}>
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="block text-base font-bold text-[#0a0a0a]">
                    <Upload className="inline size-5 mr-2 text-[#FFAD93]" />
                    Fotos do Pet *
                  </label>

                  <div className="flex flex-col lg:flex-row gap-3">
                    <div className="flex-1 lg:flex-[2]">
                      <div className="relative bg-[rgba(255,169,143,0.1)] border-2 border-[rgba(255,169,143,0.75)] border-dashed rounded-2xl overflow-hidden hover:border-[#ffa98f] transition-colors">
                        {mainPhoto ? (
                          <div className="relative aspect-square lg:aspect-[4/3]">
                            <img src={mainPhoto} alt="Foto principal" className="w-full h-full object-contain" />
                            <button type="button" onClick={removeMainPhoto} className="absolute top-3 right-3 size-10 rounded-full bg-gradient-to-r from-[#ffa98f] to-[#ff8566] text-white flex items-center justify-center hover:shadow-xl transition-all shadow-lg">
                              <X className="size-5" />
                            </button>
                          </div>
                        ) : (
                          <label className="block aspect-square lg:aspect-[4/3] cursor-pointer hover:bg-[rgba(255,169,143,0.15)] transition-colors flex items-center justify-center">
                            <div className="text-center py-8">
                              <ImageIcon className="size-12 sm:size-14 mx-auto mb-3 text-[#ffa98f]" strokeWidth={1.5} />
                              <p className="text-base sm:text-lg font-bold bg-gradient-to-r from-[#ffa98f] to-[#ff8566] bg-clip-text text-transparent mb-1">
                                Adicionar foto principal
                              </p>
                              <p className="text-xs sm:text-sm text-[#6a7282]">Clique ou arraste uma imagem</p>
                            </div>
                            <input type="file" accept="image/*" ref={mainPhotoInputRef} onChange={handleMainPhotoChange} className="hidden" />
                          </label>
                        )}
                      </div>
                    </div>

                    <div className="flex-1">
                      <p className="text-sm text-[#6a7282] mb-2 lg:mb-3">Fotos adicionais (opcional)</p>
                      <div className="grid grid-cols-2 gap-3">
                        {additionalPhotos.map((photo, index) => (
                          <div key={index} className="relative rounded-xl overflow-hidden bg-[rgba(255,169,143,0.1)] border-2 border-[rgba(255,169,143,0.75)] border-dashed hover:border-[#ffa98f] transition-colors">
                            {photo ? (
                              <div className="relative">
                                <img src={photo} alt={`Foto ${index + 1}`} className="w-full aspect-square object-contain" />
                                <button type="button" onClick={() => removeAdditionalPhoto(index)} className="absolute top-2 right-2 size-8 rounded-full bg-gradient-to-r from-[#ffa98f] to-[#ff8566] text-white flex items-center justify-center hover:shadow-xl transition-all shadow-lg">
                                  <X className="size-4" />
                                </button>
                              </div>
                            ) : (
                              <label className="block aspect-square cursor-pointer hover:bg-[rgba(255,169,143,0.15)] transition-colors flex items-center justify-center">
                                <ImageIcon className="size-8 text-[#ffa98f]" strokeWidth={1.5} />
                                <input type="file" accept="image/*" ref={(element) => { additionalPhotoRefs.current[index] = element; }} onChange={(event) => handleAdditionalPhotoChange(index, event)} className="hidden" />
                              </label>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-[#0a0a0a] pb-2 border-b-2 border-[#FFAD93]">Informações Básicas</h3>

                  <div className="space-y-2">
                    <label htmlFor="nome" className="block text-sm font-medium text-[#0a0a0a]">
                      <Dog className="inline size-4 mr-1.5 text-[#FFAD93]" />
                      Nome do Pet *
                    </label>
                    <input id="nome" type="text" value={formData.nome} onChange={(event) => handleChange('nome', event.target.value)} placeholder="Ex: Luna" className={getInputClassName('nome')} required />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="especie" className="block text-sm font-medium text-[#0a0a0a]">
                        <Dog className="inline size-4 mr-1.5 text-[#FFAD93]" />
                        Espécie *
                      </label>
                      <div className="relative">
                        <select id="especie" value={formData.especie} onChange={(event) => handleChange('especie', event.target.value)} className={getSelectClassName('especie')} required>
                          <option value="cachorro">Cachorro</option>
                          <option value="gato">Gato</option>
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                          <svg className="size-5 text-[#FFAD93]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="raca" className="block text-sm font-medium text-[#0a0a0a]">
                        <Dog className="inline size-4 mr-1.5 text-[#FFAD93]" />
                        Raça *
                      </label>
                      <input id="raca" type="text" value={formData.raca} onChange={(event) => handleChange('raca', event.target.value)} placeholder="Ex: Golden Retriever" className={getInputClassName('raca')} required />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="dataNascimento" className="block text-sm font-medium text-[#0a0a0a]">
                        <Calendar className="inline size-4 mr-1.5 text-[#FFAD93]" />
                        Data de Nasc. *
                      </label>
                      <input id="dataNascimento" type="date" value={formData.dataNascimento} onChange={(event) => handleChange('dataNascimento', event.target.value)} className={getInputClassName('dataNascimento')} required />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="sexo" className="block text-sm font-medium text-[#0a0a0a]">
                        <Dog className="inline size-4 mr-1.5 text-[#FFAD93]" />
                        Sexo *
                      </label>
                      <div className="relative">
                        <select id="sexo" value={formData.sexo} onChange={(event) => handleChange('sexo', event.target.value)} className={getSelectClassName('sexo')} required>
                          <option value="macho">Macho</option>
                          <option value="femea">Fêmea</option>
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                          <svg className="size-5 text-[#FFAD93]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="peso" className="block text-sm font-medium text-[#0a0a0a]">
                        <Scale className="inline size-4 mr-1.5 text-[#FFAD93]" />
                        Peso *
                      </label>
                      <input id="peso" type="text" value={formData.peso} onChange={(event) => handleChange('peso', event.target.value)} placeholder="Ex: 28kg" className={getInputClassName('peso')} required />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="cor" className="block text-sm font-medium text-[#0a0a0a]">
                        <Palette className="inline size-4 mr-1.5 text-[#FFAD93]" />
                        Cor *
                      </label>
                      <input id="cor" type="text" value={formData.cor} onChange={(event) => handleChange('cor', event.target.value)} placeholder="Ex: Dourado" className={getInputClassName('cor')} required />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="tamanho" className="block text-sm font-medium text-[#0a0a0a]">
                      <Ruler className="inline size-4 mr-1.5 text-[#FFAD93]" />
                      Porte *
                    </label>
                    <div className="relative">
                      <select id="tamanho" value={formData.tamanho} onChange={(event) => handleChange('tamanho', event.target.value)} className={getSelectClassName('tamanho')} required>
                        <option value="pequeno">Pequeno</option>
                        <option value="médio">Médio</option>
                        <option value="grande">Grande</option>
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg className="size-5 text-[#FFAD93]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="temperamentoInput" className="block text-sm font-medium text-[#0a0a0a]">
                      <Heart className="inline size-4 mr-1.5 text-[#FFAD93]" />
                      Temperamento
                    </label>
                    <div className="flex gap-2">
                      <input
                        id="temperamentoInput"
                        type="text"
                        value={tempInputs.temperamento}
                        onChange={(event) => setTempInputs((prev) => ({ ...prev, temperamento: event.target.value }))}
                        onKeyDown={(event) => event.key === 'Enter' && (event.preventDefault(), addTag('temperamento', 'temperamento'))}
                        placeholder="Ex: Dócil"
                        className="flex-1 px-4 py-3 border border-[#d1d5dc] rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-[#ffa98f] placeholder:text-[rgba(10,10,10,0.5)]"
                      />
                      <button type="button" onClick={() => addTag('temperamento', 'temperamento')} className="px-6 bg-[#FFAD93] hover:bg-[#FF9D8B] text-white rounded-xl font-medium transition-colors">
                        Adicionar
                      </button>
                    </div>
                    {formData.temperamento.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.temperamento.map((tag, index) => (
                          <span key={`${tag}-${index}`} className="px-3 py-1.5 rounded-full border-2 border-[#FFAD93] bg-[rgba(255,173,147,0.03)] text-[#FFAD93] text-sm font-bold flex items-center gap-1.5">
                            {tag}
                            <button type="button" onClick={() => removeTag('temperamento', index)} className="hover:bg-[rgba(255,173,147,0.2)] rounded-full p-0.5">
                              <X className="size-3.5" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="biografia" className="block text-sm font-medium text-[#0a0a0a]">
                      <FileText className="inline size-4 mr-1.5 text-[#FFAD93]" />
                      Biografia
                    </label>
                    <textarea
                      id="biografia"
                      value={formData.biografia}
                      onChange={(event) => handleChange('biografia', event.target.value)}
                      placeholder="Conte um pouco sobre a personalidade do seu pet..."
                      rows={4}
                      className={`w-full px-4 py-3 rounded-xl text-base resize-none transition-all placeholder:text-[rgba(10,10,10,0.5)] ${
                        formData.biografia.length > 0
                          ? 'border-2 border-[#FFAD93] bg-[rgba(255,173,147,0.03)] focus:outline-none focus:ring-2 focus:ring-[#ffa98f]'
                          : 'border border-[#d1d5dc] bg-white focus:outline-none focus:ring-2 focus:ring-[#ffa98f] focus:border-transparent'
                      }`}
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-[#0a0a0a] pb-2 border-b-2 border-[#FFAD93]">Histórico de Saúde</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="vacinacaoInput" className="block text-sm font-medium text-[#0a0a0a]">
                        <Syringe className="inline size-4 mr-1.5 text-[#FFAD93]" />
                        Vacinação
                      </label>
                      <div className="flex gap-2">
                        <input
                          id="vacinacaoInput"
                          type="text"
                          value={tempInputs.vacinacao}
                          onChange={(event) => setTempInputs((prev) => ({ ...prev, vacinacao: event.target.value }))}
                          onKeyDown={(event) => event.key === 'Enter' && (event.preventDefault(), addTag('vacinacao', 'vacinacao'))}
                          placeholder="Ex: V10"
                          className="flex-1 px-3 py-2.5 border border-[#d1d5dc] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#ffa98f] placeholder:text-[rgba(10,10,10,0.5)]"
                        />
                        <button type="button" onClick={() => addTag('vacinacao', 'vacinacao')} className="px-5 bg-[#FFAD93] hover:bg-[#FF9D8B] text-white rounded-lg text-sm font-bold transition-colors">+</button>
                      </div>
                      {formData.vacinacao.length > 0 && (
                        <div className="space-y-1.5 mt-2">
                          {formData.vacinacao.map((item, index) => (
                            <div key={`${item}-${index}`} className="flex items-center justify-between px-3 py-2 rounded-lg border-2 border-[#FFAD93] bg-[rgba(255,173,147,0.03)] text-sm font-bold">
                              <span>{item}</span>
                              <button type="button" onClick={() => removeTag('vacinacao', index)} className="text-red-500 hover:text-red-600">
                                <X className="size-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="geneticaInput" className="block text-sm font-medium text-[#0a0a0a]">
                        <Dna className="inline size-4 mr-1.5 text-[#FFAD93]" />
                        Genética
                      </label>
                      <div className="flex gap-2">
                        <input
                          id="geneticaInput"
                          type="text"
                          value={tempInputs.genetica}
                          onChange={(event) => setTempInputs((prev) => ({ ...prev, genetica: event.target.value }))}
                          onKeyDown={(event) => event.key === 'Enter' && (event.preventDefault(), addTag('genetica', 'genetica'))}
                          placeholder="Ex: Teste DNA"
                          className="flex-1 px-3 py-2.5 border border-[#d1d5dc] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#ffa98f] placeholder:text-[rgba(10,10,10,0.5)]"
                        />
                        <button type="button" onClick={() => addTag('genetica', 'genetica')} className="px-5 bg-[#FFAD93] hover:bg-[#FF9D8B] text-white rounded-lg text-sm font-bold transition-colors">+</button>
                      </div>
                      {formData.genetica.length > 0 && (
                        <div className="space-y-1.5 mt-2">
                          {formData.genetica.map((item, index) => (
                            <div key={`${item}-${index}`} className="flex items-center justify-between px-3 py-2 rounded-lg border-2 border-[#FFAD93] bg-[rgba(255,173,147,0.03)] text-sm font-bold">
                              <span>{item}</span>
                              <button type="button" onClick={() => removeTag('genetica', index)} className="text-red-500 hover:text-red-600">
                                <X className="size-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="alergiaInput" className="block text-sm font-medium text-[#0a0a0a]">
                        <Activity className="inline size-4 mr-1.5 text-[#FFAD93]" />
                        Alergias
                      </label>
                      <div className="flex gap-2">
                        <input
                          id="alergiaInput"
                          type="text"
                          value={tempInputs.alergia}
                          onChange={(event) => setTempInputs((prev) => ({ ...prev, alergia: event.target.value }))}
                          onKeyDown={(event) => event.key === 'Enter' && (event.preventDefault(), addTag('alergias', 'alergia'))}
                          placeholder="Ex: Frango"
                          className="flex-1 px-3 py-2.5 border border-[#d1d5dc] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#ffa98f] placeholder:text-[rgba(10,10,10,0.5)]"
                        />
                        <button type="button" onClick={() => addTag('alergias', 'alergia')} className="px-5 bg-[#FFAD93] hover:bg-[#FF9D8B] text-white rounded-lg text-sm font-bold transition-colors">+</button>
                      </div>
                      {formData.alergias.length > 0 && (
                        <div className="space-y-1.5 mt-2">
                          {formData.alergias.map((item, index) => (
                            <div key={`${item}-${index}`} className="flex items-center justify-between px-3 py-2 rounded-lg border-2 border-[#FFAD93] bg-[rgba(255,173,147,0.03)] text-sm font-bold">
                              <span>{item}</span>
                              <button type="button" onClick={() => removeTag('alergias', index)} className="text-red-500 hover:text-red-600">
                                <X className="size-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="medicamentoInput" className="block text-sm font-medium text-[#0a0a0a]">
                        <Shield className="inline size-4 mr-1.5 text-[#FFAD93]" />
                        Medicamentos
                      </label>
                      <div className="flex gap-2">
                        <input
                          id="medicamentoInput"
                          type="text"
                          value={tempInputs.medicamento}
                          onChange={(event) => setTempInputs((prev) => ({ ...prev, medicamento: event.target.value }))}
                          onKeyDown={(event) => event.key === 'Enter' && (event.preventDefault(), addTag('medicamentos', 'medicamento'))}
                          placeholder="Ex: Antipulgas"
                          className="flex-1 px-3 py-2.5 border border-[#d1d5dc] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#ffa98f] placeholder:text-[rgba(10,10,10,0.5)]"
                        />
                        <button type="button" onClick={() => addTag('medicamentos', 'medicamento')} className="px-5 bg-[#FFAD93] hover:bg-[#FF9D8B] text-white rounded-lg text-sm font-bold transition-colors">+</button>
                      </div>
                      {formData.medicamentos.length > 0 && (
                        <div className="space-y-1.5 mt-2">
                          {formData.medicamentos.map((item, index) => (
                            <div key={`${item}-${index}`} className="flex items-center justify-between px-3 py-2 rounded-lg border-2 border-[#FFAD93] bg-[rgba(255,173,147,0.03)] text-sm font-bold">
                              <span>{item}</span>
                              <button type="button" onClick={() => removeTag('medicamentos', index)} className="text-red-500 hover:text-red-600">
                                <X className="size-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-[#0a0a0a] pb-2 border-b-2 border-[#FFAD93]">O que você busca?</h3>

                  <div className="space-y-4">
                    <label className={`flex items-start gap-4 p-5 rounded-xl border-2 cursor-pointer transition-all ${formData.objetivo === 'amizades' ? 'border-[#ffa98f] bg-[rgba(255,169,143,0.08)] shadow-md' : 'border-[#e5e7eb] bg-white hover:border-[#ffa98f] hover:shadow-sm'}`}>
                      <div className="mt-0.5">
                        <div className="size-7 rounded-full border-2 border-[#ffa98f] flex items-center justify-center">
                          {formData.objetivo === 'amizades' && <div className="size-4 rounded-full bg-gradient-to-r from-[#ffa98f] to-[#ff8566]" />}
                        </div>
                      </div>
                      <input type="radio" name="objetivo" value="amizades" checked={formData.objetivo === 'amizades'} onChange={(event) => handleChange('objetivo', event.target.value)} className="sr-only" />
                      <div className="flex-1">
                        <div className="font-bold text-[#0a0a0a] mb-1 text-lg">Amizades</div>
                        <div className="text-sm text-[#4a5565]">Encontre companheiros de brincadeira e socialização para seu pet</div>
                      </div>
                    </label>

                    <label className={`flex items-start gap-4 p-5 rounded-xl border-2 cursor-pointer transition-all ${formData.objetivo === 'encontros' ? 'border-[#ffa98f] bg-[rgba(255,169,143,0.08)] shadow-md' : 'border-[#e5e7eb] bg-white hover:border-[#ffa98f] hover:shadow-sm'}`}>
                      <div className="mt-0.5">
                        <div className="size-7 rounded-full border-2 border-[#ffa98f] flex items-center justify-center">
                          {formData.objetivo === 'encontros' && <div className="size-4 rounded-full bg-gradient-to-r from-[#ffa98f] to-[#ff8566]" />}
                        </div>
                      </div>
                      <input type="radio" name="objetivo" value="encontros" checked={formData.objetivo === 'encontros'} onChange={(event) => handleChange('objetivo', event.target.value)} className="sr-only" />
                      <div className="flex-1">
                        <div className="font-bold text-[#0a0a0a] mb-1 text-lg">Encontros</div>
                        <div className="text-sm text-[#4a5565]">Conexão para reprodução responsável com animais de pedigree</div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 5 && (
              <div className="space-y-6">
                <div className="space-y-4 p-6 rounded-xl bg-[rgba(255,173,147,0.05)] border-2 border-[#FFAD93]">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-[#0a0a0a] flex items-center gap-2">
                      <Award className="size-5 text-[#FFAD93]" />
                      Informações de Pedigree
                    </h3>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <span className="text-sm font-medium text-[#0a0a0a]">Verificado</span>
                      <button
                        type="button"
                        onClick={() => handleChange('pedigreeVerificado', !formData.pedigreeVerificado)}
                        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${formData.pedigreeVerificado ? 'bg-gradient-to-r from-[#ffa98f] to-[#ff8566]' : 'bg-gray-300'}`}
                      >
                        <span className={`inline-block size-5 transform rounded-full bg-white transition-transform ${formData.pedigreeVerificado ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="pedigreePai" className="block text-sm font-medium text-[#0a0a0a]">Pai</label>
                      <input id="pedigreePai" type="text" value={formData.pedigreePai} onChange={(event) => handleChange('pedigreePai', event.target.value)} placeholder="Nome do pai" className={getInputClassName('pedigreePai')} />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="pedigreeMae" className="block text-sm font-medium text-[#0a0a0a]">Mãe</label>
                      <input id="pedigreeMae" type="text" value={formData.pedigreeMae} onChange={(event) => handleChange('pedigreeMae', event.target.value)} placeholder="Nome da mãe" className={getInputClassName('pedigreeMae')} />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="pedigreeAvoPaterno" className="block text-sm font-medium text-[#0a0a0a]">Avô Paterno</label>
                      <input id="pedigreeAvoPaterno" type="text" value={formData.pedigreeAvoPaterno} onChange={(event) => handleChange('pedigreeAvoPaterno', event.target.value)} placeholder="Nome do avô paterno" className={getInputClassName('pedigreeAvoPaterno')} />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="pedigreeAvoMaterno" className="block text-sm font-medium text-[#0a0a0a]">Avó Materna</label>
                      <input id="pedigreeAvoMaterno" type="text" value={formData.pedigreeAvoMaterno} onChange={(event) => handleChange('pedigreeAvoMaterno', event.target.value)} placeholder="Nome da avó materna" className={getInputClassName('pedigreeAvoMaterno')} />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#FFAD93]">
                    <label className="block text-sm font-medium text-[#0a0a0a] mb-2">
                      <FileText className="inline size-4 mr-1.5 text-[#FFAD93]" />
                      Certificado de Pedigree (PDF ou Imagem)
                    </label>
                    {pedigreeFile ? (
                      <div className="flex items-center justify-between p-4 rounded-xl bg-white border-2 border-[#FFAD93]">
                        <div className="flex items-center gap-3">
                          <div className="size-10 rounded-lg bg-[rgba(255,173,147,0.1)] flex items-center justify-center">
                            <FileText className="size-5 text-[#FFAD93]" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-[#0a0a0a]">{pedigreeFile.name}</p>
                            <p className="text-xs text-[#6a7282]">{(pedigreeFile.size / 1024).toFixed(2)} KB</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setPedigreeFile(null);
                            if (pedigreeFileInputRef.current) pedigreeFileInputRef.current.value = '';
                          }}
                          className="size-8 rounded-full bg-gradient-to-r from-[#ffa98f] to-[#ff8566] text-white flex items-center justify-center hover:shadow-xl transition-all"
                        >
                          <X className="size-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="block">
                        <div className="flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-[#ffa98f] to-[#ff8566] text-white rounded-xl cursor-pointer hover:shadow-lg transition-shadow">
                          <Upload className="size-5" />
                          <span className="font-medium">Adicionar Documento</span>
                        </div>
                        <input
                          type="file"
                          accept="application/pdf,image/*"
                          ref={pedigreeFileInputRef}
                          onChange={handlePedigreeFileChange}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="mt-6 bg-red-50 border-2 border-red-200 rounded-lg p-4 text-red-700" role="alert" aria-live="assertive">
                {error}
              </div>
            )}

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
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex-1 px-6 py-3 border-2 border-[#d1d5dc] text-[#0a0a0a] rounded-xl font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                  <ChevronLeft className="size-5" />
                  Anterior
                </button>
              )}

              {currentStep < 5 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={!canProceedToNextStep()}
                  className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                    canProceedToNextStep()
                      ? 'bg-gradient-to-r from-[#ffa98f] to-[#ff8566] text-white hover:shadow-lg'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Próximo
                  <ChevronRight className="size-5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-1 bg-gradient-to-r from-[#ffa98f] to-[#ff8566] text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-shadow flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  <Check className="size-5" />
                  {isSubmitting ? 'Finalizando...' : 'Finalizar Cadastro'}
                </button>
              )}
            </div>
          </form>
        </div>
      </main>

      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8">
            <div className="flex justify-center mb-4">
              <div className="size-16 sm:size-20 rounded-full bg-gradient-to-r from-[#ffa98f] to-[#ff8566] flex items-center justify-center">
                <Check className="size-8 sm:size-10 text-white" strokeWidth={3} />
              </div>
            </div>

            <div className="text-center mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-[#0a0a0a] mb-3">Pet Cadastrado com Sucesso!</h2>
              <p className="text-sm sm:text-base text-[#4a5565] mb-4">
                {formData.nome} foi adicionado ao seu perfil. Agora você pode encontrar o match perfeito para ele!
              </p>

              <div className="bg-[rgba(255,173,147,0.08)] border-2 border-[#FFAD93] rounded-xl p-4 text-left">
                <div className="flex items-center gap-3 mb-3">
                  {mainPhoto && (
                    <div className="size-16 rounded-full overflow-hidden bg-gray-200">
                      <img src={mainPhoto} alt={formData.nome} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[#0a0a0a] truncate">{formData.nome}</p>
                    <p className="text-sm text-[#6a7282] truncate">{formData.raca} • {formData.sexo === 'macho' ? 'Macho' : 'Fêmea'}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-[#4a5565]">
                  <span className="flex items-center gap-1">
                    <Dog className="size-3.5 text-[#FFAD93]" />
                    {formData.especie === 'cachorro' ? 'Cachorro' : 'Gato'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="size-3.5 text-[#FFAD93]" />
                    {formData.objetivo === 'amizades' ? 'Amizades' : 'Encontros'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowSuccessModal(false);
                  if (onNavigateToPerfil) {
                    onNavigateToPerfil();
                  } else {
                    router.push('/tutor-profile');
                  }
                }}
                className="flex-1 px-6 py-3 border-2 border-[#FFAD93] text-[#FFAD93] rounded-xl font-medium hover:bg-[rgba(255,173,147,0.1)] transition-colors"
              >
                Ver Perfil
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowSuccessModal(false);
                  if (onNavigateToInicioMatch) {
                    onNavigateToInicioMatch();
                  } else if (onNavigateToMatches) {
                    onNavigateToMatches();
                  } else {
                    router.push('/match-display');
                  }
                }}
                className="flex-1 bg-gradient-to-r from-[#ffa98f] to-[#ff8566] text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-shadow flex items-center justify-center gap-2"
              >
                <Heart className="size-5" />
                Buscar Matches
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
