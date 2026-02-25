import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { registerUser } from '../src/services/auth';
import { useRouter } from 'next/router';
import Layout from '../src/components/Layout';

export default function Register() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    telefone: '',
    estado: '',
    siglaEstado: ''
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (formData.senha !== formData.confirmarSenha) {
      setError('As senhas não coincidem.');
      return;
    }

    setLoading(true);
    try {
      await registerUser({ name: formData.nome, email: formData.email, password: formData.senha });
      setMessage('Cadastro realizado. Você será redirecionado para entrar.');
      setFormData({ nome: '', email: '', senha: '', confirmarSenha: '', telefone: '', estado: '', siglaEstado: '' });
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
            className="btn-text px-2 py-1 text-[#0a0a0a] hover:bg-transparent"
          >
            <ArrowLeft className="size-4" />
            <span className="text-sm">Voltar</span>
          </button>

          <div>
            <h2 className="text-4xl font-bold">Criar Conta</h2>
            <p className="text-[#4a5565]">Cadastre-se para começar a usar o PetFind</p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 ">
            <form onSubmit={handleSubmit} className="space-y-5">
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
                type="submit"
                className="btn w-full py-3"
                disabled={loading}
                aria-disabled={loading}
                aria-busy={loading}
              >
                {loading ? 'Criando...' : 'Criar conta'}
              </button>

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