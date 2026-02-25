/* eslint-disable @next/next/no-img-element */
import { Plus, X } from 'lucide-react';
import { useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { createPet } from '../src/services/pets';
import { getMe } from '../src/services/auth';
import { useEffect } from 'react';
import Layout from '../src/components/Layout';

export default function Pets() {
  const router = useRouter();
  const [mainPhoto, setMainPhoto] = useState(null);
  const [mainPhotoFile, setMainPhotoFile] = useState(null);
  const [additionalPhotos, setAdditionalPhotos] = useState([null, null, null, null]);
  const [additionalPhotoFiles, setAdditionalPhotoFiles] = useState([null, null, null, null]);

  const mainPhotoInputRef = useRef(null);
  const additionalPhotoRefs = useRef([]);
  const registroMedicoInputRef = useRef(null);
  const pedigreeInputRef = useRef(null);

  const [pedigreeFile, setPedigreeFile] = useState(null);

  const [formData, setFormData] = useState({
    nome: '',
    especie: 'cachorro',
    idade: '',
    sexo: 'macho',
    raca: '',
    objetivo: 'amizades',
    breedingEnabled: false,
    pedigree: '',
    registroMedico: '',
    pedigreeFileName: '',
    biografia: ''
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [me, setMe] = useState(null);

  useEffect(() => {
    let mounted = true;
    getMe().then((data) => { if (mounted) setMe(data); }).catch(() => {});
    return () => { mounted = false; };
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
      const updated = [...additionalPhotos];
      updated[index] = reader.result;
      setAdditionalPhotos(updated);
    };
    reader.readAsDataURL(file);
  };

  const handleRegistroMedicoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFormData((prev) => ({
      ...prev,
      registroMedico: file.name
    }));
  };

  const handlePedigreeFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPedigreeFile(file);
    setFormData((prev) => ({ ...prev, pedigreeFileName: file.name }));
  };

  const removeMainPhoto = () => {
    setMainPhoto(null);
    setMainPhotoFile(null);
    if (mainPhotoInputRef.current) mainPhotoInputRef.current.value = '';
  };

  const removeAdditionalPhoto = (index) => {
    const updated = [...additionalPhotos];
    updated[index] = null;
    setAdditionalPhotos(updated);
    setAdditionalPhotoFiles((prev) => {
      const next = [...prev];
      next[index] = null;
      return next;
    });
    if (additionalPhotoRefs.current[index]) additionalPhotoRefs.current[index].value = '';
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setMessage('');
    setError('');

    try {
      const form = new FormData();
      form.append('name', formData.nome);
      form.append('species', formData.especie);
      form.append('ageMonths', formData.idade || '');
      form.append('sex', formData.sexo);
      form.append('breed', formData.raca);
      form.append('description', formData.biografia);
      if (me?.cidade) form.append('city', me.cidade);
      if (me?.estado) form.append('state', me.estado);
      form.append('objective', formData.objetivo);

      if (mainPhotoFile) form.append('mainPhoto', mainPhotoFile);
      additionalPhotoFiles.filter(Boolean).forEach((file) => form.append('additionalPhotos', file));

      // Breeding fields quando houver encontros
      if (formData.objetivo === 'encontros') {
        form.append('breeding', 'true');
        form.append('pedigree', formData.pedigree || '');
        if (pedigreeFile) form.append('pedigreeFile', pedigreeFile);
      }

      await createPet(form);
      setError('');
      setMessage('Pet criado.');
      setFormData({ nome: '', especie: 'cachorro', idade: '', sexo: 'macho', raca: '', objetivo: 'amizades', breedingEnabled: false, pedigree: '', registroMedico: '', pedigreeFileName: '', biografia: '' });
      setMainPhoto(null);
      setMainPhotoFile(null);
      setAdditionalPhotos([null, null, null, null]);
      setAdditionalPhotoFiles([null, null, null, null]);
      setPedigreeFile(null);
      if (mainPhotoInputRef.current) mainPhotoInputRef.current.value = '';
      additionalPhotoRefs.current.forEach((ref) => { if (ref) ref.value = ''; });
      if (pedigreeInputRef.current) pedigreeInputRef.current.value = '';
      // After creating, navigate to match-display so the newly created pet appears there
      router.push('/match-display');
    } catch (err) {
      console.error(err);
      setMessage('');
      setError(err?.response?.data?.error || 'Falha ao criar pet');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen page-bg">
        <main className="max-w-4xl mx-auto px-6 lg:px-8 py-16">
          <div className="bg-white rounded-3xl shadow-lg p-8 md:p-12">
            <h2 className="text-4xl font-bold text-[#0a0a0a] mb-2">Cadastrar novo pet</h2>
            <p className="text-lg text-[#4a5565] mb-12">Preencha os dados do seu pet para começar a encontrar matches</p>

            <form onSubmit={handleCreate} className="space-y-8">
              {/* Fotos do Pet */}
              <div>
                <h3 className="text-2xl font-bold text-[#0a0a0a] mb-6">Fotos do Pet</h3>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-1">
                    <label className="block text-sm font-semibold text-[#0a0a0a] mb-3">Foto Principal</label>
                    <div className="relative group">
                      <div className="w-full aspect-square bg-linear-to-br from-[#FFA98F]/10 to-[#FF8566]/10 rounded-2xl flex items-center justify-center overflow-hidden border-2 border-dashed border-[#FFA98F]">
                        {mainPhoto ? (
                          <img src={mainPhoto} className="w-full h-full object-cover" alt="Foto principal do pet" loading="lazy" decoding="async" />
                        ) : (
                          <div className="text-center">
                            <div className="w-12 h-12 rounded-full bg-[rgba(255,168,143,0.12)] flex items-center justify-center mx-auto mb-2">
                              <Plus className="text-[#FFA98F]" />
                            </div>
                            <p className="text-sm text-[#4a5565]">Clique para adicionar</p>
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
                        <button type="button" onClick={removeMainPhoto} className="btn-danger-icon absolute top-2 right-2 size-9 p-0 rounded-full shadow-lg">
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="lg:col-span-2">
                    <label className="block text-sm font-semibold text-[#0a0a0a] mb-3">Galeria (até 4 fotos)</label>
                    <div className="grid grid-cols-4 gap-3">
                      {additionalPhotos.map((p, idx) => (
                        <div key={idx} className="relative group">
                          <div className="w-full aspect-square bg-linear-to-br from-[#FFA98F]/10 to-[#FF8566]/10 rounded-xl flex items-center justify-center overflow-hidden border-2 border-dashed border-[#FFA98F]/50 hover:border-[#FFA98F] transition-colors">
                            {p ? <img src={p} alt={`add-${idx}`} className="w-full h-full object-cover" loading="lazy" decoding="async" /> : <div className="text-center"><Plus className="w-6 h-6 text-[#FFA98F] mx-auto opacity-50" /></div>}
                          </div>
                          <input ref={(el) => (additionalPhotoRefs.current[idx] = el)} type="file" accept="image/*" onChange={(e) => handleAdditionalPhotoChange(idx, e)} className="absolute inset-0 opacity-0 cursor-pointer" />
                          {p && <button type="button" onClick={() => removeAdditionalPhoto(idx)} className="btn-danger-icon absolute -top-2 -right-2 size-7 p-0 rounded-full shadow-lg"><X className="w-4 h-4" /></button>}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Informações do Pet */}
              <div>
                <h3 className="text-2xl font-bold text-[#0a0a0a] mb-6">Informações do Pet</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-[#0a0a0a] mb-2">Nome *</label>
                    <input type="text" placeholder="Ex: Max" value={formData.nome} onChange={(e) => handleChange('nome', e.target.value)} className="w-full px-4 py-3 rounded-lg border-2 border-[#d1d5dc] focus:border-[#FFA98F] focus:outline-none transition-colors" required />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#0a0a0a] mb-2">Espécie *</label>
                    <select value={formData.especie} onChange={(e) => handleChange('especie', e.target.value)} className="w-full px-4 pr-10 py-3 rounded-lg border-2 border-[#d1d5dc] focus:border-[#FFA98F] focus:outline-none transition-colors bg-white">
                      <option value="cachorro">Cachorro</option>
                      <option value="gato">Gato</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#0a0a0a] mb-2">Idade (anos) *</label>
                    <input type="number" placeholder="Ex: 2" value={formData.idade} onChange={(e) => handleChange('idade', e.target.value)} min="0" className="w-full px-4 py-3 rounded-lg border-2 border-[#d1d5dc] focus:border-[#FFA98F] focus:outline-none transition-colors" required />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#0a0a0a] mb-2">Sexo *</label>
                    <select value={formData.sexo} onChange={(e) => handleChange('sexo', e.target.value)} className="w-full px-4 pr-10 py-3 rounded-lg border-2 border-[#d1d5dc] focus:border-[#FFA98F] focus:outline-none transition-colors bg-white">
                      <option value="macho">Macho</option>
                      <option value="femea">Fêmea</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-[#0a0a0a] mb-2">Raça *</label>
                    <input type="text" placeholder="Ex: Golden Retriever, Vira-Lata" value={formData.raca} onChange={(e) => handleChange('raca', e.target.value)} className="w-full px-4 py-3 rounded-lg border-2 border-[#d1d5dc] focus:border-[#FFA98F] focus:outline-none transition-colors" />
                  </div>
                </div>
              </div>

              {/* Preferências */}
              <div>
                <div className="space-y-3">
                  <h3 className="text-lg font-bold text-[#0a0a0a]">O que você busca? *</h3>

                  <div className="space-y-3">
                    <label className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      formData.objetivo === 'amizades'
                        ? 'border-[#ffa98f] bg-[rgba(255,169,143,0.05)]'
                        : 'border-[#e5e7eb] bg-white hover:border-[#ffa98f]'
                    }`}>
                      <div className="mt-0.5">
                        <div className="size-6 rounded-full border-2 border-[#ffa98f] flex items-center justify-center">
                          {formData.objetivo === 'amizades' && (
                            <div className="size-3 rounded-full bg-linear-to-r from-[#ffa98f] to-[#ff8566]" />
                          )}
                        </div>
                      </div>
                      <input type="radio" name="objetivo" value="amizades" checked={formData.objetivo === 'amizades'} onChange={(e) => handleChange('objetivo', e.target.value)} className="sr-only" />
                      <div className="flex-1">
                        <div className="font-bold text-[#0a0a0a] mb-1">Amizades</div>
                        <div className="text-sm text-[#4a5565]">Find playmates and friends for your pet</div>
                      </div>
                    </label>

                    <label className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      formData.objetivo === 'encontros'
                        ? 'border-[#ffa98f] bg-[rgba(255,169,143,0.05)]'
                        : 'border-[#e5e7eb] bg-white hover:border-[#ffa98f]'
                    }`}>
                      <div className="mt-0.5">
                        <div className="size-6 rounded-full border-2 border-[#ffa98f] flex items-center justify-center">
                          {formData.objetivo === 'encontros' && (
                            <div className="size-3 rounded-full bg-linear-to-r from-[#ffa98f] to-[#ff8566]" />
                          )}
                        </div>
                      </div>
                      <input type="radio" name="objetivo" value="encontros" checked={formData.objetivo === 'encontros'} onChange={(e) => handleChange('objetivo', e.target.value)} className="sr-only" />
                      <div className="flex-1">
                        <div className="font-bold text-[#0a0a0a] mb-1">Encontros</div>
                        <div className="text-sm text-[#4a5565]">Connect for responsible breeding</div>
                      </div>
                    </label>

                    {formData.objetivo === 'encontros' && (
                      <div className="mt-6 p-4 bg-linear-to-r from-[#FFA98F]/20 to-[#FF8566]/10 rounded-lg border-2 border-[#FFA98F]/30">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-bold text-[#0a0a0a] mb-3">Pedigree *</label>
                            <select value={formData.pedigree} onChange={(e) => handleChange('pedigree', e.target.value)} className="w-full px-4 pr-10 py-2 rounded-lg border-2 border-[#FFA98F]/20 focus:border-[#FFA98F] focus:outline-none transition-colors bg-white h-11.5">
                              <option value="">Selecione uma opção</option>
                              <option value="sim">Sim, Verificado</option>
                              <option value="nao">Não Possui</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-bold text-[#0a0a0a] mb-3">Registro Médico</label>
                            <label className="flex items-center justify-center gap-3 px-4 py-3 rounded-lg border-2 border-[#FFA98F]/20 hover:border-[#FFA98F] transition-colors cursor-pointer bg-white w-full h-11.5">
                              <Plus className="w-5 h-5 text-[#FFA98F] shrink-0" />
                              <span className="text-sm text-[#4a5565]">Adicionar arquivo</span>
                              <input ref={registroMedicoInputRef} type="file" accept="application/pdf,image/*" className="hidden" onChange={handleRegistroMedicoChange} />
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
                <h3 className="text-2xl font-bold text-[#0a0a0a] mb-6">Sobre o Pet</h3>
                <div>
                  <label className="block text-sm font-semibold text-[#0a0a0a] mb-2">Biografia (opcional)</label>
                  <textarea
                    value={formData.biografia}
                    onChange={(e) => handleChange('biografia', e.target.value)}
                    placeholder="Conte mais sobre a personalidade, características especiais e preferências do seu pet..."
                    rows={5}
                    className="w-full px-4 py-3 rounded-lg border-2 border-[#d1d5dc] focus:border-[#FFA98F] focus:outline-none transition-colors resize-none"
                  />
                  <p className="text-xs text-[#4a5565] mt-2">Máximo 500 caracteres</p>
                </div>
              </div>

                    <div className="flex justify-end gap-4 pt-4">
                      <button type="button" onClick={() => router.back()} className="btn-secondary px-8 py-3 text-lg">Cancelar</button>
                      <button type="submit" disabled={isSubmitting} className="btn px-8 py-3 text-lg">{isSubmitting ? 'Cadastrando...' : 'Cadastrar Pet'}</button>
                    </div>

                    {message && (
                      <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 text-green-700" role="status" aria-live="polite">{message}</div>
                    )}
                    {error && (
                      <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 text-red-700" role="alert" aria-live="assertive">{error}</div>
                    )}
                  </form>
                </div>
              </main>
            </div>
          </Layout>
  );
}