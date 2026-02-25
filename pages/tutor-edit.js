/* eslint-disable @next/next/no-img-element */
import React, { useState, useRef, useEffect } from 'react';
import Layout from '../src/components/Layout';
import { UserPlus } from 'lucide-react';
import { useRouter } from 'next/router';

const normalizeTutor = (data = {}) => ({
  nome: data.nome ?? data.name ?? '',
  email: data.email ?? '',
  telefone: data.telefone ?? '',
  cidade: data.cidade ?? '',
  estado: data.estado ?? data.siglaEstado ?? '',
  avatar: data.avatar ?? data.foto ?? null,
});

export default function TutorEdit({ tutorData = null, onSalvar, onNavigateToMatches, onNavigateToChat, onNavigateToPerfil }) {
  const router = useRouter();

  const initial = normalizeTutor(tutorData || {});
  const [foto, setFoto] = useState(initial.avatar || null);
  const [fotoFile, setFotoFile] = useState(null);
  const fotoInputRef = useRef(null);

  const [formData, setFormData] = useState({
    nome: initial.nome || '',
    email: initial.email || '',
    telefone: initial.telefone || '',
    cidade: initial.cidade || '',
    estado: initial.estado || 'SP',
  });

  useEffect(() => {
    if (tutorData) return;
    let active = true;
    async function loadTutor() {
      try {
        const { getMe } = await import('../src/services/auth');
        const data = await getMe();
        if (!active) return;
        const normalized = normalizeTutor(data);
        setFormData({
          nome: normalized.nome,
          email: normalized.email,
          telefone: normalized.telefone,
          cidade: normalized.cidade,
          estado: normalized.estado || 'SP',
        });
        setFoto(normalized.avatar || null);
        setFotoFile(null);
      } catch (err) {
        console.error(err);
      }
    }

    loadTutor();
    return () => { active = false; };
  }, [tutorData]);

  const handleFotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFotoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setFoto(reader.result);
    reader.readAsDataURL(file);
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: formData.nome,
      email: formData.email,
      telefone: formData.telefone || '',
      cidade: formData.cidade || '',
      estado: formData.estado || '',
    };
    try {
      const { updateMe } = await import('../src/services/auth');
      let updated;
      if (fotoFile) {
        const fd = new FormData();
        fd.append('name', payload.name);
        fd.append('email', payload.email);
        fd.append('telefone', payload.telefone);
        fd.append('cidade', payload.cidade);
        fd.append('estado', payload.estado);
        fd.append('avatar', fotoFile);
        updated = await updateMe(fd);
      } else {
        updated = await updateMe(payload);
      }

      const normalized = normalizeTutor(updated || {});
      setFormData({
        nome: normalized.nome,
        email: normalized.email,
        telefone: normalized.telefone,
        cidade: normalized.cidade,
        estado: normalized.estado || 'SP',
      });
      setFoto(normalized.avatar || null);
      setFotoFile(null);

      if (onSalvar) onSalvar(updated);
      else router.push('/tutor-profile');
    } catch (err) {
      console.error(err);
    }
  };

  const estados = [
    { sigla: 'AC', nome: 'Acre' },
    { sigla: 'AL', nome: 'Alagoas' },
    { sigla: 'AP', nome: 'Amapá' },
    { sigla: 'AM', nome: 'Amazonas' },
    { sigla: 'BA', nome: 'Bahia' },
    { sigla: 'CE', nome: 'Ceará' },
    { sigla: 'DF', nome: 'Distrito Federal' },
    { sigla: 'ES', nome: 'Espírito Santo' },
    { sigla: 'GO', nome: 'Goiás' },
    { sigla: 'MA', nome: 'Maranhão' },
    { sigla: 'MT', nome: 'Mato Grosso' },
    { sigla: 'MS', nome: 'Mato Grosso do Sul' },
    { sigla: 'MG', nome: 'Minas Gerais' },
    { sigla: 'PA', nome: 'Pará' },
    { sigla: 'PB', nome: 'Paraíba' },
    { sigla: 'PR', nome: 'Paraná' },
    { sigla: 'PE', nome: 'Pernambuco' },
    { sigla: 'PI', nome: 'Piauí' },
    { sigla: 'RJ', nome: 'Rio de Janeiro' },
    { sigla: 'RN', nome: 'Rio Grande do Norte' },
    { sigla: 'RS', nome: 'Rio Grande do Sul' },
    { sigla: 'RO', nome: 'Rondônia' },
    { sigla: 'RR', nome: 'Roraima' },
    { sigla: 'SC', nome: 'Santa Catarina' },
    { sigla: 'SP', nome: 'São Paulo' },
    { sigla: 'SE', nome: 'Sergipe' },
    { sigla: 'TO', nome: 'Tocantins' },
  ];

  return (
    <Layout>
      <div className="page min-h-screen page-bg">
        <main className="container-page py-12">
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="md:flex md:items-start md:gap-8">
                  {/* Foto */}
                  <div className="md:w-1/3">
                    <h3 className="text-2xl font-semibold mb-4">Foto de Perfil</h3>
                    <div className="flex items-center gap-6">
                      <div
                        role="button"
                        tabIndex={0}
                        aria-label={foto ? 'Alterar foto de perfil' : 'Adicionar foto de perfil'}
                        onClick={() => fotoInputRef.current && fotoInputRef.current.click()}
                        onKeyPress={(e) => { if (e.key === 'Enter' || e.key === ' ') fotoInputRef.current && fotoInputRef.current.click(); }}
                        className="bg-white rounded-xl p-1 cursor-pointer inline-block"
                      >
                        <div className="w-60 h-50 rounded-xl bg-[#ffa98f] overflow-hidden flex items-center justify-center">
                          {foto ? (
                            <img src={foto} alt="Foto de perfil" className="w-full h-full object-cover rounded-lg" />
                          ) : (
                            <UserPlus className="size-20 text-white" />
                          )}
                        </div>
                      </div>
                      <input ref={fotoInputRef} type="file" accept="image/*" onChange={handleFotoChange} className="hidden" />
                    </div>
                  </div>

                  {/* Informações */}
                  <div className="md:flex-1 mt-6 md:mt-0">
                    <div className="space-y-4">
                      <div>
                        <label className="label">Nome</label>
                        <input value={formData.nome} onChange={(e) => handleChange('nome', e.target.value)} className="input" placeholder="Seu nome" />
                      </div>

                      <div>
                        <label className="label">Email</label>
                        <input value={formData.email} onChange={(e) => handleChange('email', e.target.value)} className="input" placeholder="seu@email.com" />
                      </div>

                      <div>
                        <label className="label">Telefone</label>
                        <input value={formData.telefone} onChange={(e) => handleChange('telefone', e.target.value)} className="input" placeholder="(xx) xxxxx-xxxx" />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="label">Cidade</label>
                          <input value={formData.cidade} onChange={(e) => handleChange('cidade', e.target.value)} className="input" placeholder="Cidade" />
                        </div>

                        <div>
                          <label className="label">Estado</label>
                          <select value={formData.estado} onChange={(e) => handleChange('estado', e.target.value)} className="input">
                            {estados.map((estado) => (
                              <option key={estado.sigla} value={estado.sigla}>{estado.nome}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-4 mt-8">
                  <button type="button" onClick={() => onNavigateToPerfil?.() || router.back()} className="btn-secondary border-transparent px-8 py-3 rounded-2xl">Cancelar</button>
                  <button type="submit" className="btn px-8 py-3 rounded-2xl">Salvar Alterações</button>
                </div>
              </div>
            </form>
          </div>
        </main>
      </div>
    </Layout>
  );
}
