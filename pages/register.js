/* eslint-disable @next/next/no-img-element */
import { ArrowLeft, Camera } from 'lucide-react';
import { useRef, useState } from 'react';
import { registerUser } from '../src/services/auth';
import { useRouter } from 'next/router';
import Layout from '../src/components/Layout';

export default function Register() {
  const router = useRouter();
  const avatarInputRef = useRef(null);
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    sexo: '',
    idade: '',
    telefone: '',
    cep: '',
    numero: '',
    avatar: null,
    avatarPreview: '',
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setFormData({
      nome: '',
      email: '',
      senha: '',
      confirmarSenha: '',
      sexo: '',
      idade: '',
      telefone: '',
      cep: '',
      numero: '',
      avatar: null,
      avatarPreview: '',
    });
    setStep(1);
  };

  const validateStepOne = () => {
    if (!formData.nome.trim() || !formData.email.trim() || !formData.senha || !formData.confirmarSenha) {
      setError('Preencha todos os campos da fase 1.');
      return false;
    }

    if (formData.senha !== formData.confirmarSenha) {
      setError('As senhas não coincidem.');
      return false;
    }

    if (formData.senha.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres.');
      return false;
    }

    return true;
  };

  const handleNextStep = () => {
    setError('');
    if (!validateStepOne()) return;
    setStep(2);
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const preview = URL.createObjectURL(file);
    setFormData((prev) => ({
      ...prev,
      avatar: file,
      avatarPreview: preview,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!validateStepOne()) {
      return;
    }

    setLoading(true);
    try {
      if (formData.avatar) {
        const payload = new FormData();
        payload.append('name', formData.nome.trim());
        payload.append('email', formData.email.trim());
        payload.append('password', formData.senha);
        payload.append('sexo', formData.sexo || '');
        payload.append('idade', formData.idade || '');
        payload.append('telefone', formData.telefone || '');
        payload.append('cep', formData.cep || '');
        payload.append('numero', formData.numero || '');
        payload.append('avatar', formData.avatar);
        await registerUser(payload);
      } else {
        await registerUser({
          name: formData.nome.trim(),
          email: formData.email.trim(),
          password: formData.senha,
          sexo: formData.sexo || null,
          idade: formData.idade ? Number(formData.idade) : null,
          telefone: formData.telefone || null,
          cep: formData.cep || null,
          numero: formData.numero || null,
        });
      }

      setMessage('Cadastro realizado. Você será redirecionado para entrar.');
      resetForm();
      setTimeout(() => router.push('/login'), 1200);
    } catch (err) {
      setError(err?.response?.data?.error || 'Falha no cadastro');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const onNavigateToHome = () => router.push('/');
  const onNavigateToLogin = () => router.push('/login');

  return (
    <Layout>
      <div className="min-h-screen page-bg">
        <main className="max-w-md mx-auto px-6 py-12">
        <div className="space-y-8">
          <button
            onClick={onNavigateToHome}
            className="btn-text text-[#0a0a0a]"
          >
            <ArrowLeft className="size-4" />
            <span className="text-sm">Voltar</span>
          </button>

          <div>
            <h2 className="text-4xl font-bold">Criar Conta</h2>
            <p className="text-[#4a5565]">Cadastre-se para começar a usar o PetFind</p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 ">
            <div className="mb-6">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="font-semibold text-[#4a5565]">Etapa {step} de 2</span>
                <span className="text-[#ff8566]">{step === 1 ? 'Começando' : 'Quase lá'}</span>
              </div>
              <div className="h-2 rounded-full bg-[#ffe6dc] overflow-hidden">
                <div
                  className="h-full bg-linear-to-r from-[#ffa98f] to-[#ff8566] transition-all duration-300"
                  style={{ width: step === 1 ? '50%' : '100%' }}
                />
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {step === 1 ? (
                <>
                  <input
                    type="text"
                    placeholder="Nome completo"
                    value={formData.nome}
                    onChange={(e) => handleChange('nome', e.target.value)}
                    className="input px-4 py-3"
                    required
                  />

                  <input
                    type="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className="input px-4 py-3"
                    required
                  />

                  <input
                    type="password"
                    placeholder="Senha"
                    value={formData.senha}
                    onChange={(e) => handleChange('senha', e.target.value)}
                    className="input px-4 py-3"
                    minLength={6}
                    required
                  />

                  <input
                    type="password"
                    placeholder="Confirmar senha"
                    value={formData.confirmarSenha}
                    onChange={(e) => handleChange('confirmarSenha', e.target.value)}
                    className="input px-4 py-3"
                    minLength={6}
                    required
                  />

                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="btn w-full py-3"
                  >
                    Próxima etapa
                  </button>
                </>
              ) : (
                <>
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <p className="text-sm font-semibold text-[#4a5565]">Foto do Tutor</p>
                      <button
                        type="button"
                        onClick={() => avatarInputRef.current?.click()}
                        className="w-full rounded-2xl border-2 border-dashed border-[#f2d4c8] bg-[#fff7f3] overflow-hidden flex items-center justify-center"
                        style={{ aspectRatio: '4 / 3' }}
                      >
                        {formData.avatarPreview ? (
                          <img src={formData.avatarPreview} alt="Prévia do tutor" className="w-full h-full object-cover" />
                        ) : (
                          <div className="text-center text-[#b4897a]">
                            <Camera className="size-8 mx-auto mb-2" />
                            <span className="text-xs">Adicionar foto</span>
                          </div>
                        )}
                      </button>
                      <input
                        ref={avatarInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <select
                        value={formData.sexo}
                        onChange={(e) => handleChange('sexo', e.target.value)}
                        className="input px-4 py-3"
                      >
                        <option value="">Sexo</option>
                        <option value="Masculino">Masculino</option>
                        <option value="Feminino">Feminino</option>
                        <option value="Outro">Outro</option>
                      </select>
                      <input
                        type="number"
                        min="0"
                        placeholder="Idade"
                        value={formData.idade}
                        onChange={(e) => handleChange('idade', e.target.value)}
                        className="input px-4 py-3"
                      />
                    </div>

                    <input
                      type="tel"
                      placeholder="Telefone"
                      value={formData.telefone}
                      onChange={(e) => handleChange('telefone', e.target.value)}
                      className="input px-4 py-3"
                    />

                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="CEP"
                        value={formData.cep}
                        onChange={(e) => handleChange('cep', e.target.value)}
                        className="input px-4 py-3"
                      />
                      <input
                        type="text"
                        placeholder="Número"
                        value={formData.numero}
                        onChange={(e) => handleChange('numero', e.target.value)}
                        className="input px-4 py-3"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="btn-secondary py-3"
                      disabled={loading}
                    >
                      Voltar
                    </button>
                    <button
                      type="submit"
                      className="btn py-3"
                      disabled={loading}
                      aria-disabled={loading}
                      aria-busy={loading}
                    >
                      {loading ? 'Salvando...' : 'Finalizar cadastro'}
                    </button>
                  </div>
                </>
              )}

              <div className="text-center text-sm">
                Já tem uma conta?{' '}
                <button
                  type="button"
                  onClick={onNavigateToLogin}
                  className="font-medium text-[#ff8566] hover:underline"
                >
                  Entrar
                </button>
              </div>
            </form>

            {step === 2 && !error && (
              <div className="mt-4 text-green-700 text-sm">
                Fase 1 concluída! Complete os dados do tutor.
              </div>
            )}

            {message && <p className="mt-3 text-green-600" role="status" aria-live="polite">{message}</p>}
            {error && <p className="mt-3 text-red-600" role="alert" aria-live="assertive">{error}</p>}
          </div>
        </div>
        </main>
      </div>
    </Layout>
  );
}










// import { Home, MessageCircle, User, ArrowLeft } from 'lucide-react';
// import { useState } from 'react';
// import { registerUser } from '../src/services/auth';
// import { useRouter } from 'next/router';

// export default function Register() {
//   const router = useRouter();

//   const [formData, setFormData] = useState({
//     nome: '',
//     email: '',
//     senha: '',
//     confirmarSenha: '',
//     telefone: '',
//     estado: '',
//     siglaEstado: ''
//   });

//   const [message, setMessage] = useState('');
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');
//     setMessage('');

//     if (formData.senha !== formData.confirmarSenha) {
//       setError('As senhas não coincidem.');
//       return;
//     }

//     setLoading(true);
//     try {
//       await registerUser({ name: formData.nome, email: formData.email, password: formData.senha });
//       setMessage('Cadastro realizado. Você será redirecionado para entrar.');
//       setFormData({ nome: '', email: '', senha: '', confirmarSenha: '', telefone: '', estado: '', siglaEstado: '' });
//       setTimeout(() => router.push('/login'), 1200);
//     } catch (err) {
//       setError(err?.response?.data?.error || 'Falha no cadastro');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleChange = (field, value) => {
//     setFormData((prev) => ({ ...prev, [field]: value }));
//   };

//   const onNavigateToHome = () => router.push('/');
//   const onNavigateToLogin = () => router.push('/login');

//   return (
//     <div className="min-h-screen bg-[#fffaeb]">
//       {/* Header */}
//       <header className="bg-white shadow-sm sticky top-0 z-50">
//         <div className="max-w-7xl mx-auto px-6 lg:px-8 h-20 flex items-center justify-between">
//           {/* Logo */}
//           <div className="flex items-center gap-3">
//             <div className="size-8">
//               {/* Inline fallback logo (removed external svg import) */}
//               <svg className="block size-full" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden>
//                 <defs>
//                   <linearGradient id="logo_grad" x1="0" x2="1">
//                     <stop offset="0%" stopColor="#FFA98F" />
//                     <stop offset="100%" stopColor="#FF8566" />
//                   </linearGradient>
//                 </defs>
//                 <circle cx="16" cy="12" r="6" stroke="url(#logo_grad)" strokeWidth="2.5" fill="rgba(255,168,143,0.06)" />
//                 <path d="M10 22c1-2 3-3 6-3s5 1 6 3" stroke="#F6AD55" strokeWidth="1.6" fill="none" strokeLinecap="round" />
//                 <circle cx="11.5" cy="11" r="1.2" fill="#FF8566" />
//                 <circle cx="20.5" cy="11" r="1.2" fill="#FF8566" />
//               </svg>
//             </div>

//             <h1 className="text-2xl font-bold bg-gradient-to-r from-[#ffa98f] to-[#ff8566] bg-clip-text text-transparent">
//               PetFind
//             </h1>
//           </div>

//           {/* Navigation */}
//           <div className="hidden md:flex items-center gap-2">
//             <button className="size-12 rounded-xl bg-[rgba(255,169,143,0.13)] flex items-center justify-center hover:bg-[rgba(255,169,143,0.2)] transition-colors">
//               <Home className="size-6 text-[#FFA98F]" />
//             </button>
//             <button className="size-12 rounded-xl flex items-center justify-center hover:bg-gray-50 transition-colors">
//               <MessageCircle className="size-6 text-[#4A5565]" />
//             </button>
//             <button className="size-12 rounded-xl flex items-center justify-center hover:bg-gray-50 transition-colors">
//               <User className="size-6 text-[#4A5565]" />
//             </button>
//           </div>
//         </div>
//       </header>

//       {/* Main */}
//       <main className="max-w-md mx-auto px-6 py-12">
//         <div className="space-y-8">
//           <button
//             onClick={onNavigateToHome}
//             className="flex items-center gap-2 px-4 py-3 bg-[#fffbec] rounded-xl hover:bg-[#fff5d6] transition-colors"
//           >
//             <ArrowLeft className="size-5" />
//             <span className="text-xl">Voltar</span>
//           </button>

//           <div>
//             <h2 className="text-4xl font-bold">Criar Conta</h2>
//             <p className="text-[#4a5565]">Cadastre-se para começar a usar o PetFind</p>
//           </div>

//           <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8">
//             <form onSubmit={handleSubmit} className="space-y-5">
//               <input
//                 type="text"
//                 placeholder="Nome completo"
//                 value={formData.nome}
//                 onChange={(e) => handleChange('nome', e.target.value)}
//                 className="w-full px-4 py-3 border rounded-xl"
//                 required
//               />

//               <input
//                 type="email"
//                 placeholder="Email"
//                 value={formData.email}
//                 onChange={(e) => handleChange('email', e.target.value)}
//                 className="w-full px-4 py-3 border rounded-xl"
//                 required
//               />

//               <input
//                 type="password"
//                 placeholder="Senha"
//                 value={formData.senha}
//                 onChange={(e) => handleChange('senha', e.target.value)}
//                 className="w-full px-4 py-3 border rounded-xl"
//                 minLength={6}
//                 required
//               />

//               <input
//                 type="password"
//                 placeholder="Confirmar senha"
//                 value={formData.confirmarSenha}
//                 onChange={(e) => handleChange('confirmarSenha', e.target.value)}
//                 className="w-full px-4 py-3 border rounded-xl"
//                 minLength={6}
//                 required
//               />

//               <button
//                 type="submit"
//                 className="w-full bg-gradient-to-r from-[#ffa98f] to-[#ff8566] text-white py-3 rounded-xl disabled:opacity-60"
//                 disabled={loading}
//               >
//                 {loading ? 'Criando...' : 'Criar conta'}
//               </button>

//               <div className="text-center text-sm">
//                 Já tem uma conta?{' '}
//                 <button
//                   type="button"
//                   onClick={onNavigateToLogin}
//                   className="font-medium text-[#ff8566] hover:underline"
//                 >
//                   Entrar
//                 </button>
//               </div>
//             </form>

//             {message && <p className="mt-3 text-green-600">{message}</p>}
//             {error && <p className="mt-3 text-red-600">{error}</p>}
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// }