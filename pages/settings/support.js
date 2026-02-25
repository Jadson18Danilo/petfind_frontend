import { ArrowLeft, HelpCircle, MessageCircle, Shield } from "lucide-react";
import { useRouter } from "next/router";
import Layout from "../../src/components/Layout";

export default function SupportSettingsPage() {
  const router = useRouter();

  return (
    <Layout>
      <div className="min-h-screen page-bg">
        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
          <section className="bg-white rounded-3xl border border-[#F4E4DA] shadow-[0_12px_35px_rgba(15,23,42,0.08)] p-6 sm:p-8">
            <div className="flex items-center justify-between gap-3 mb-6">
              <button type="button" onClick={() => router.push("/tutor-profile")} className="btn-text px-4 py-2.5 rounded-2xl text-[#4a5565] hover:bg-[#FFF7F1]">
                <ArrowLeft className="size-4" />
                Voltar
              </button>
              <div className="inline-flex items-center gap-2 rounded-xl bg-[#FFF1E8] text-[#ff8566] px-3 py-2">
                <HelpCircle className="size-4" />
                Ajuda e Suporte
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-[#0a0a0a]">Ajuda e Suporte</h1>
            <p className="text-[#4a5565] mt-2 mb-8">Encontre respostas rápidas e, se precisar, fale com nossa equipe pelo chat.</p>

            <div className="grid gap-3 sm:gap-4 mb-8">
              <div className="rounded-2xl border border-[#F2D4C8] bg-[#FFF9F5] p-4">
                <p className="font-semibold text-[#0a0a0a] mb-1">Como aumentar meus matches?</p>
                <p className="text-sm text-[#4a5565]">Mantenha fotos atualizadas, descrição clara e perfil do tutor completo.</p>
              </div>

              <div className="rounded-2xl border border-[#F2D4C8] bg-[#FFF9F5] p-4">
                <p className="font-semibold text-[#0a0a0a] mb-1">Não estou recebendo mensagens</p>
                <p className="text-sm text-[#4a5565]">Verifique se as notificações estão ativadas em Configurações &gt; Notificações.</p>
              </div>

              <div className="rounded-2xl border border-[#F2D4C8] bg-[#FFF9F5] p-4">
                <p className="font-semibold text-[#0a0a0a] mb-1">Como manter segurança no app?</p>
                <p className="text-sm text-[#4a5565]">Evite compartilhar dados sensíveis e prefira encontros em locais públicos.</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={() => router.push("/chat-on")} className="btn">
                <MessageCircle className="size-4" />
                Falar com o suporte
              </button>

              <button type="button" onClick={() => router.push("/settings/privacy")} className="btn-secondary">
                <Shield className="size-4" />
                Ver dicas de privacidade
              </button>
            </div>
          </section>
        </main>
      </div>
    </Layout>
  );
}
