import React, { useState, useRef } from 'react';
import { useRouter } from 'next/router';
import Layout from '../src/components/Layout';
import { Plus, X } from 'lucide-react';

/* eslint-disable @next/next/no-img-element */

export default function PetDetails({ petData }) {
  const router = useRouter();
  const initialMainPhoto = petData?.mainPhoto || null;

  const initialAdditionalPhotos = petData?.additionalPhotos
    ? [...petData.additionalPhotos, ...Array(4 - petData.additionalPhotos.length).fill(null)].slice(0, 4)
    : [null, null, null, null];

  const [mainPhoto, setMainPhoto] = useState(initialMainPhoto);
  const [additionalPhotos, setAdditionalPhotos] = useState(initialAdditionalPhotos);

  const mainPhotoInputRef = useRef(null);
  const additionalPhotoRefs = useRef([]);

  const [formData, setFormData] = useState({
    nome: petData?.nome || '',
    especie: petData?.especie || 'cachorro',
    idade: petData?.idade || '',
    sexo: petData?.sexo || 'macho',
    raca: petData?.raca || '',
    objetivo: petData?.objetivo || 'encontros',
    pedigree: petData?.pedigree || '',
    registroMedico: petData?.registroMedico || '',
    biografia: petData?.biografia || ''
  });

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

  const removeMainPhoto = () => {
    setMainPhoto(null);
    if (mainPhotoInputRef.current) mainPhotoInputRef.current.value = '';
  };

  const removeAdditionalPhoto = (index) => {
    const newPhotos = [...additionalPhotos];
    newPhotos[index] = null;
    setAdditionalPhotos(newPhotos);
    if (additionalPhotoRefs.current[index]) additionalPhotoRefs.current[index].value = '';
  };

  const handleChange = (field, value) => setFormData((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    // For now just log — you can wire this to onSalvar or API
    console.log('Salvar pet', { ...formData, mainPhoto, additionalPhotos: additionalPhotos.filter(Boolean) });
  };

  return (
    <Layout>
      <div className="py-12">
        {!petData ? (
          <div className="card p-8 text-center max-w-lg mx-auto">
            <h1 className="section-title">Nenhum pet encontrado</h1>
            <p className="section-subtitle mt-2">Cadastre um pet para começar a editar o perfil.</p>
            <button onClick={() => router.push('/pet-register')} className="mt-6 btn">
              Cadastrar pet
            </button>
          </div>
        ) : (
          <div className="card p-8">
            <h1 className="section-title">Editar Perfil do Pet</h1>
            <p className="section-subtitle mt-1">Atualize as informações do seu pet</p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-6">
              <div className="grid md:grid-cols-3 gap-4 items-start">
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Foto principal</label>
                  <div
                    className="relative w-full h-44 bg-gray-50 rounded-xl flex items-center justify-center overflow-hidden cursor-pointer"
                  >
                    {mainPhoto ? (
                      <img src={mainPhoto} alt="main" className="object-cover w-full h-full" loading="lazy" decoding="async" />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-sm text-gray-400">
                        <div className="w-12 h-12 rounded-full bg-[rgba(255,168,143,0.12)] flex items-center justify-center">
                          <Plus className="text-[#FFA98F]" />
                        </div>
                        <span>Clique para adicionar</span>
                      </div>
                    )}
                    <input ref={mainPhotoInputRef} type="file" accept="image/*" onChange={handleMainPhotoChange} onClick={(e) => e.stopPropagation()} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" aria-label="Selecionar foto principal" />
                  </div>
                  {mainPhoto && (
                    <button type="button" onClick={removeMainPhoto} className="btn-text mt-2 text-slate-600">
                      <X className="size-4" /> Remover foto
                    </button>
                  )}
                </div>

                <div className="md:col-span-2 space-y-3">
                  <input
                    placeholder="Nome do pet"
                    value={formData.nome}
                    onChange={(e) => handleChange('nome', e.target.value)}
                    className="input"
                    required
                  />

                  <textarea
                    placeholder="Biografia"
                    value={formData.biografia}
                    onChange={(e) => handleChange('biografia', e.target.value)}
                    className="input resize-none"
                    rows={4}
                  />

                  <div className="grid md:grid-cols-3 gap-3">
                    <input type="text" placeholder="Raça" value={formData.raca} onChange={(e) => handleChange('raca', e.target.value)} className="input" />
                    <input type="text" placeholder="Idade" value={formData.idade} onChange={(e) => handleChange('idade', e.target.value)} className="input" />
                    <select value={formData.sexo} onChange={(e) => handleChange('sexo', e.target.value)} className="input">
                      <option value="macho">Macho</option>
                      <option value="femea">Fêmea</option>
                    </select>
                  </div>

                  <div className="flex gap-3 mt-2">
                    {additionalPhotos.map((p, idx) => (
                      <div key={idx} className="w-20 h-20 bg-gray-50 rounded-xl overflow-hidden relative">
                        {p ? <img src={p} alt={`add-${idx}`} className="w-full h-full object-cover" loading="lazy" decoding="async" /> : <div className="flex items-center justify-center h-full text-gray-300">+</div>}
                        <input ref={(el) => (additionalPhotoRefs.current[idx] = el)} type="file" accept="image/*" onChange={(e) => handleAdditionalPhotoChange(idx, e)} className="absolute inset-0 opacity-0 cursor-pointer" />
                        {p && <button type="button" onClick={() => removeAdditionalPhoto(idx)} className="btn-icon absolute top-1 right-1 size-6 p-0 rounded-full shadow"><X className="size-3 text-gray-600" /></button>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => window.history.back()} className="btn-secondary flex-1">Voltar</button>
                <button type="submit" className="btn flex-1">Salvar</button>
              </div>
            </form>
          </div>
        )}
      </div>
    </Layout>
  );
}