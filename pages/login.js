import React, { useState } from "react";
import Layout from "../src/components/Layout";
import { getMe, loginUser } from "../src/services/auth";
import { listPets } from "../src/services/pets";
import { useRouter } from "next/router";
import { ArrowLeft } from "lucide-react";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    if (isSubmitting) return;
    setError("");
    setMessage("");
    setIsSubmitting(true);

    try {
      await loginUser({ email, password });
      setMessage("Login realizado.");

      let destination = "/tutor-profile";
      try {
        const me = await getMe();
        const pets = await listPets();
        const hasPet = Array.isArray(pets) && pets.some((pet) => pet.ownerId === me?.id);
        destination = hasPet ? "/match-display" : "/tutor-profile";
      } catch (fetchErr) {
        destination = "/tutor-profile";
      }

      router.push(destination);
    } catch (err) {
      setError(err?.response?.data?.error || "Falha no login");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Layout>
      <div className="space-y-8">
        <div className="max-w-sm mx-auto space-y-6">
          <button
            onClick={() => router.push("/")}
            className="btn-text px-2 py-1 text-[#0a0a0a] hover:bg-transparent"
          >
            <ArrowLeft className="w-4 h-4 text-[#0a0a0a]" />
            <span className="text-sm text-[#0a0a0a]">Voltar</span>
          </button>

          <div>
            <h2 className="text-4xl font-bold text-[#0a0a0a] mb-2">Entrar</h2>
            <p className="text-[#4a5565]">
              Entre com suas credenciais para acessar sua conta
            </p>
          </div>
        </div>

        <div className="max-w-sm mx-auto bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm text-[#0a0a0a]">
                Email *
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full px-4 py-3 border border-[#d1d5dc] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ffa98f] focus:border-transparent transition-all"
                required
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block text-sm text-[#0a0a0a]"
              >
                Senha *
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full px-4 py-3 border border-[#d1d5dc] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ffa98f] focus:border-transparent transition-all"
                required
                minLength={6}
              />
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                className="text-sm bg-linear-to-r from-[#ffa98f] to-[#ff8566] bg-clip-text text-transparent hover:underline"
              >
                Esqueceu a senha?
              </button>
            </div>

            <button
              type="submit"
              className="btn w-full py-3"
              disabled={isSubmitting}
              aria-disabled={isSubmitting}
              aria-busy={isSubmitting}
            >
              {isSubmitting ? "Entrando..." : "Entrar"}
            </button>

            <div className="text-center text-sm">
              <span className="text-[#4a5565]">Não tem uma conta? </span>
              <button
                type="button"
                className="bg-linear-to-r from-[#ffa98f] to-[#ff8566] bg-clip-text text-transparent font-medium hover:underline"
                onClick={() => router.push("/register")}
              >
                Cadastre-se
              </button>
            </div>
          </form>

          {message && (
            <p className="mt-3 text-green-600" role="status" aria-live="polite">
              {message}
            </p>
          )}
          {error && (
            <p className="mt-3 text-red-600" role="alert" aria-live="assertive">
              {error}
            </p>
          )}
        </div>
      </div>
    </Layout>
  );
}

// import React, { useState } from 'react';
// import Header from '../src/components/Header';
// import { loginUser } from '../src/services/auth';
// import { useRouter } from 'next/router';
// import { Home, MessageCircle, User, ArrowLeft } from 'lucide-react';

// export default function Login() {
//   const router = useRouter();
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [message, setMessage] = useState('');
//   const [error, setError] = useState('');

//   async function handleSubmit(event) {
//     event.preventDefault();
//     setError('');
//     setMessage('');

//     try {
//       await loginUser({ email, password });
//       setMessage('Login realizado.');
//       // navegar para pets (ou página de matches)
//       router.push('/pets');
//     } catch (err) {
//       setError(err?.response?.data?.error || 'Falha no login');
//     }
//   }

//   return (
//     <div className="min-h-screen bg-[#fffaeb]">
//       <Header />

//       <main className="max-w-md mx-auto px-6 py-20">
//         <div className="space-y-8">
//           <div className="space-y-6">
//             <button
//               onClick={() => router.push('/')}
//               className="flex items-center gap-2 px-4 py-3 bg-[#fffbec] rounded-xl hover:bg-[#fff5d6] transition-colors"
//             >
//               <ArrowLeft className="w-5 h-5 text-[#0a0a0a]" />
//               <span className="text-xl text-[#0a0a0a]">Voltar</span>
//             </button>

//             <div>
//               <h2 className="text-4xl font-bold text-[#0a0a0a] mb-2">Entrar</h2>
//               <p className="text-[#4a5565]">Entre com suas credenciais para acessar sua conta</p>
//             </div>
//           </div>

//           <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8">
//             <form onSubmit={handleSubmit} className="space-y-6">
//               <div className="space-y-2">
//                 <label htmlFor="email" className="block text-sm text-[#0a0a0a]">
//                   Email *
//                 </label>
//                 <input
//                   id="email"
//                   type="email"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   placeholder="seu@email.com"
//                   className="w-full px-4 py-3 border border-[#d1d5dc] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ffa98f] focus:border-transparent transition-all"
//                   required
//                 />
//               </div>

//               <div className="space-y-2">
//                 <label htmlFor="password" className="block text-sm text-[#0a0a0a]">
//                   Senha *
//                 </label>
//                 <input
//                   id="password"
//                   type="password"
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   placeholder="Mínimo 6 caracteres"
//                   className="w-full px-4 py-3 border border-[#d1d5dc] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ffa98f] focus:border-transparent transition-all"
//                   required
//                   minLength={6}
//                 />
//               </div>

//               <div className="flex justify-end">
//                 <button
//                   type="button"
//                   className="text-sm bg-gradient-to-r from-[#ffa98f] to-[#ff8566] bg-clip-text text-transparent hover:underline"
//                 >
//                   Esqueceu a senha?
//                 </button>
//               </div>

//               <button
//                 type="submit"
//                 className="w-full bg-gradient-to-r from-[#ffa98f] to-[#ff8566] text-white py-3 rounded-xl font-medium hover:shadow-lg transition-shadow"
//               >
//                 Entrar
//               </button>

//               <div className="text-center text-sm">
//                 <span className="text-[#4a5565]">Não tem uma conta? </span>
//                 <button
//                   type="button"
//                   className="bg-gradient-to-r from-[#ffa98f] to-[#ff8566] bg-clip-text text-transparent font-medium hover:underline"
//                   onClick={() => router.push('/register')}
//                 >
//                   Cadastre-se
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
