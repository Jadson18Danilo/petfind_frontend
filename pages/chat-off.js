import React from "react";
import Layout from "../src/components/Layout";
import { useRouter } from "next/router";

export default function ChatOff() {
  const router = useRouter();
  return (
    <Layout>
      <div className="min-h-screen page-bg flex flex-col">
        <main className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="max-w-md w-full text-center">
            <div className="mb-8 flex justify-center">
              <div className="size-16">
                <svg
                  className="block size-full"
                  viewBox="0 0 60 61"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden
                >
                  <defs>
                    <linearGradient id="chat_grad" x1="0" x2="1">
                      <stop offset="0%" stopColor="#FFA98F" />
                      <stop offset="100%" stopColor="#FFA98F" />
                    </linearGradient>
                  </defs>
                  <rect
                    x="3"
                    y="8"
                    width="54"
                    height="36"
                    rx="8"
                    stroke="url(#chat_grad)"
                    strokeWidth="3"
                    fill="none"
                  />
                  <path
                    d="M18 42l-3 6 6-3"
                    stroke="url(#chat_grad)"
                    strokeWidth="3"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>

            <h2 className="text-2xl font-normal text-[#0a0a0a] mb-4">
              Nenhum conversa ainda
            </h2>

            <p className="text-base text-[#4a5565]">
              Entre na conta para encontrar o par perfeito para seu pet!
            </p>

            <button
              onClick={() => router.push("/login")}
              className="mt-6 w-full max-w-xs mx-auto inline-flex items-center justify-center gap-2 rounded-xl px-8 py-4 text-lg font-bold text-white bg-linear-to-r from-[#ffa98f] to-[#ff8566] hover:shadow-lg"
            >
              Entrar
            </button>
          </div>
        </main>
      </div>
    </Layout>
  );
}
