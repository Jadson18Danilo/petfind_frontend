import React from "react";
import Layout from "../src/components/Layout";
import { useRouter } from "next/router";

export default function PerfilOff({
  onNavigateToCadastro,
  onNavigateToMatches,
  onNavigateToChat,
  onNavigateToPerfil,
}) {
  const router = useRouter();

  const goToLogin = () => {
    router.push("/login");
  };

  return (
    <Layout>
      <div className="min-h-screen page-bg flex flex-col">
        <main className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="max-w-md w-full text-center">
            {/* Icon */}
            <div className="mb-8 flex justify-center">
              <div className="size-16">
                <svg
                  className="block size-full"
                  fill="none"
                  viewBox="0 0 64 64"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden
                >
                  <defs>
                    <linearGradient id="paint0_user_lo" x1="0" x2="1">
                      <stop offset="0%" stopColor="#FFA98F" />
                      <stop offset="100%" stopColor="#FFA98F" />
                    </linearGradient>
                    <linearGradient id="paint1_user_lo" x1="0" x2="1">
                      <stop offset="0%" stopColor="#FFA98F" />
                      <stop offset="100%" stopColor="#FFA98F" />
                    </linearGradient>
                  </defs>
                  <g>
                    <circle
                      cx="32"
                      cy="24"
                      r="10"
                      stroke="url(#paint0_user_lo)"
                      strokeWidth="3"
                    />
                    <path
                      d="M16 50C16 45.8 18.8 42 22.6 40.4C25.2 39.4 28 38.8 32 38.8C36 38.8 38.8 39.4 41.4 40.4C45.2 42 48 45.8 48 50"
                      stroke="url(#paint1_user_lo)"
                      strokeWidth="3"
                    />
                  </g>
                </svg>
              </div>
            </div>

            {/* Text */}
            <h2 className="text-2xl font-normal text-[#0a0a0a] mb-4">
              Você ainda não está logado
            </h2>

            <p className="text-base text-[#4a5565] mb-8">
              Entre na sua conta para começar a encontrar o match perfeito para seu
              pet!
            </p>

            {/* CTA */}
            <button
              onClick={goToLogin}
              className="btn btn-lg mt-6 w-full max-w-xs mx-auto"
            >
              Entrar
            </button>
          </div>
        </main>
      </div>
    </Layout>
  );
}
