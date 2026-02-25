import { ArrowRight } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Layout from '../src/components/Layout';

export default function Home() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);
  const heroRef = useRef(null);
  const router = useRouter();

  const onNavigateToLogin = () => router.push('/login');
  const onNavigateToCadastrar = () => router.push('/register');

  // Parallax 3D com movimento do mouse
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!heroRef.current) return;

      const rect = heroRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Calcula a distância do mouse em relação ao centro (-1 a 1)
      const x = (e.clientX - centerX) / (rect.width / 2);
      const y = (e.clientY - centerY) / (rect.height / 2);

      setMousePosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Parallax no scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <Layout>
      <div className="rounded-3xl p-4 sm:p-6 md:p-12 space-y-14 sm:space-y-20 md:space-y-24">
          {/* Hero Section */}
          <section className="flex flex-col items-center text-center space-y-8 relative" ref={heroRef} style={{ perspective: '1000px' }}>
          {/* Elementos de fundo decorativos com parallax */}
          <div
            className="absolute top-10 left-10 w-20 h-20 rounded-full bg-linear-to-br from-[#FFA98F] to-[#FF8566] opacity-20 blur-2xl"
            style={{
              transform: `translate(${mousePosition.x * 30}px, ${mousePosition.y * 30}px) translateY(${scrollY * 0.5}px)`,
              transition: 'transform 0.3s ease-out'
            }}
          />
          <div
            className="absolute top-32 right-20 w-32 h-32 rounded-full bg-linear-to-br from-[#FF8566] to-[#FFA98F] opacity-15 blur-3xl"
            style={{
              transform: `translate(${mousePosition.x * -40}px, ${mousePosition.y * -40}px) translateY(${scrollY * 0.3}px)`,
              transition: 'transform 0.3s ease-out'
            }}
          />
          <div
            className="absolute bottom-20 left-1/4 w-24 h-24 rounded-full bg-linear-to-br from-[#FFA98F] to-[#FF8566] opacity-10 blur-2xl"
            style={{
              transform: `translate(${mousePosition.x * 25}px, ${mousePosition.y * 25}px) translateY(${scrollY * 0.4}px)`,
              transition: 'transform 0.3s ease-out'
            }}
          />

          {/* Conteúdo principal com parallax 3D */}
          <div
            className="bg-[#ffa98f] rounded-full w-17.5 h-17.5 flex items-center justify-center p-3 relative z-10 shadow-lg"
            style={{
              transform: `translate(${mousePosition.x * 20}px, ${mousePosition.y * 20}px) translateY(${scrollY * 0.2}px) rotateX(${mousePosition.y * 5}deg) rotateY(${mousePosition.x * 5}deg)`,
              transition: 'transform 0.3s ease-out'
            }}
          >
            <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </div>

          <h2
            className="text-3xl sm:text-4xl md:text-6xl font-bold text-[#0a0a0a] max-w-4xl leading-tight relative z-10"
            style={{
              transform: `translate(${mousePosition.x * 10}px, ${mousePosition.y * 10}px) translateY(${scrollY * 0.15}px)`,
              transition: 'transform 0.3s ease-out'
            }}
          >
            Encontre o par perfeito para seu pet!
          </h2>

          <p
            className="text-base sm:text-lg md:text-2xl text-[#4a5565] max-w-2xl leading-relaxed relative z-10"
            style={{
              transform: `translate(${mousePosition.x * 5}px, ${mousePosition.y * 5}px) translateY(${scrollY * 0.1}px)`,
              transition: 'transform 0.3s ease-out'
            }}
          >
            Conecte tutores de cães e gatos que buscam companhia e reprodução responsável para seus bichinhos.
          </p>

          <button
            onClick={onNavigateToLogin}
            className="btn btn-lg hover:shadow-2xl relative z-10 w-full sm:w-auto"
            style={{
              transform: `translate(${mousePosition.x * 8}px, ${mousePosition.y * 8}px) translateY(${scrollY * 0.05}px)`,
              transition: 'transform 0.3s ease-out'
            }}
          >
            Começar Agora
            <ArrowRight className="size-6" />
          </button>
        </section>

        {/* Features Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {/* Feature 1 */}
          <div
            className="group overflow-hidden rounded-2xl border-2 border-transparent hover:border-[#FFA98F] bg-white transition-all duration-300 cursor-pointer shadow-sm"
            style={{
              transform: `translateY(${-scrollY * 0.05}px)`,
              transition: 'transform 0.1s ease-out'
            }}
          >
            <div className="bg-white rounded-[14px] p-8 text-center space-y-4 h-full group-hover:scale-[1.02] transition-transform duration-300">
              <div className="flex justify-center">
                <div className="bg-[rgba(255,169,143,0.2)] rounded-full w-16 h-16 flex items-center justify-center">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="url(#gradientStroke)">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    <defs>
                      <linearGradient id="gradientStroke" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#FFA98F" />
                        <stop offset="100%" stopColor="#FFA98F" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-[#0a0a0a]">Match Perfeito</h3>
              <p className="text-[#4a5565] leading-relaxed">
                Deslize para a direita ou esquerda para demonstrar interesse em outros pets da sua região.
              </p>
            </div>
          </div>

          {/* Feature 2 */}
          <div
            className="group overflow-hidden rounded-2xl border-2 border-transparent hover:border-[#FFA98F] bg-white transition-all duration-300 cursor-pointer shadow-sm"
            style={{
              transform: `translateY(${-scrollY * 0.08}px)`,
              transition: 'transform 0.1s ease-out'
            }}
          >
            <div className="bg-white rounded-[14px] p-8 text-center space-y-4 h-full group-hover:scale-[1.02] transition-transform duration-300">
              <div className="flex justify-center">
                <div className="bg-[rgba(255,169,143,0.2)] rounded-full w-16 h-16 flex items-center justify-center">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="url(#gradientStroke2)">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    <defs>
                      <linearGradient id="gradientStroke2" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#FFA98F" />
                        <stop offset="100%" stopColor="#FFA98F" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-[#0a0a0a]">Perfis Completos</h3>
              <p className="text-[#4a5565] leading-relaxed">
                Crie perfis detalhados com fotos, idade, raça, preferências e muito mais sobre seu pet.
              </p>
            </div>
          </div>

          {/* Feature 3 */}
          <div
            className="group overflow-hidden rounded-2xl border-2 border-transparent hover:border-[#FFA98F] bg-white transition-all duration-300 cursor-pointer shadow-sm"
            style={{
              transform: `translateY(${-scrollY * 0.06}px)`,
              transition: 'transform 0.1s ease-out'
            }}
          >
            <div className="bg-white rounded-[14px] p-8 text-center space-y-4 h-full group-hover:scale-[1.02] transition-transform duration-300">
              <div className="flex justify-center">
                <div className="bg-[rgba(255,169,143,0.2)] rounded-full w-16 h-16 flex items-center justify-center">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="url(#gradientStroke3)">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    <defs>
                      <linearGradient id="gradientStroke3" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#FFA98F" />
                        <stop offset="100%" stopColor="#FFA98F" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-[#0a0a0a]">Chat Integrado</h3>
              <p className="text-[#4a5565] leading-relaxed">
                Quando houver match mútuo, converse com outros tutores e combine encontros seguros.
              </p>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="group overflow-hidden rounded-3xl border-2 border-transparent hover:border-[#FFA98F] bg-white transition-all duration-300 cursor-pointer shadow-sm">
          <div className="bg-white rounded-[22px] p-8 md:p-12 h-full group-hover:scale-[1.02] transition-transform duration-300">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#0a0a0a] text-center mb-10 sm:mb-16">Como Funciona</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Step 1 */}
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="bg-linear-to-r from-[#ffa98f] to-[#ff8566] rounded-full w-12 h-12 flex items-center justify-center text-white font-bold text-xl">
                    1
                  </div>
                </div>
                <h3 className="text-lg font-bold text-[#0a0a0a]">Cadastre-se</h3>
                <p className="text-sm text-[#4a5565] leading-relaxed">
                  Crie sua conta e adicione as informações do seu pet
                </p>
              </div>

              {/* Step 2 */}
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="bg-linear-to-r from-[#ffa98f] to-[#ff8566] rounded-full w-12 h-12 flex items-center justify-center text-white font-bold text-xl">
                    2
                  </div>
                </div>
                <h3 className="text-lg font-bold text-[#0a0a0a]">Defina Preferências</h3>
                <p className="text-sm text-[#4a5565] leading-relaxed">
                  Escolha o que você busca: companhia ou reprodução
                </p>
              </div>

              {/* Step 3 */}
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="bg-linear-to-r from-[#ffa98f] to-[#ff8566] rounded-full w-12 h-12 flex items-center justify-center text-white font-bold text-xl">
                    3
                  </div>
                </div>
                <h3 className="text-lg font-bold text-[#0a0a0a]">Encontre Matches</h3>
                <p className="text-sm text-[#4a5565] leading-relaxed">
                  Navegue por perfis e dê like nos que interessam
                </p>
              </div>

              {/* Step 4 */}
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="bg-linear-to-r from-[#ffa98f] to-[#ff8566] rounded-full w-12 h-12 flex items-center justify-center text-white font-bold text-xl">
                    4
                  </div>
                </div>
                <h3 className="text-lg font-bold text-[#0a0a0a]">Converse</h3>
                <p className="text-sm text-[#4a5565] leading-relaxed">
                  Com match mútuo, converse e marque encontros
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center space-y-6 py-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#0a0a0a]">Pronto para começar?</h2>
          <p className="text-lg text-[#4a5565] max-w-2xl mx-auto">
            Junte-se a milhares de tutores que já encontraram companhia para seus pets!
          </p>
          <button
            onClick={onNavigateToCadastrar}
            className="btn btn-lg hover:shadow-lg mx-auto"
          >
            Criar Conta Grátis
            <ArrowRight className="size-6" />
          </button>
        </section>
      </div>
    </Layout>
  );
}