import { ArrowLeft, Bell, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Layout from "../../src/components/Layout";

const STORAGE_KEY = "notificationSettings";

const DEFAULT_SETTINGS = {
  messages: true,
  likes: true,
  matches: true,
  tips: false,
  email: false,
};

export default function NotificationSettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const rawSettings = window.localStorage.getItem(STORAGE_KEY);
      if (!rawSettings) return;
      const parsed = JSON.parse(rawSettings);
      setSettings({ ...DEFAULT_SETTINGS, ...parsed });
    } catch {
      setSettings(DEFAULT_SETTINGS);
    }
  }, []);

  const toggleField = (fieldName) => {
    setSaved(false);
    setSettings((previous) => ({ ...previous, [fieldName]: !previous[fieldName] }));
  };

  const handleSave = () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    }
    setSaved(true);
  };

  const notificationItems = [
    { key: "messages", label: "Mensagens", description: "Avisar quando chegar nova mensagem." },
    { key: "likes", label: "Curtidas", description: "Avisar quando seu pet receber curtida." },
    { key: "matches", label: "Matches", description: "Avisar quando houver match mútuo." },
    { key: "tips", label: "Dicas do PetFind", description: "Receber novidades e dicas do app." },
    { key: "email", label: "Resumo por e-mail", description: "Receber resumo semanal por e-mail." },
  ];

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
                <Bell className="size-4" />
                Notificações
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-[#0a0a0a]">Notificações</h1>
            <p className="text-[#4a5565] mt-2 mb-8">Escolha quando e como você deseja ser avisado sobre atividades importantes.</p>

            <div className="space-y-3">
              {notificationItems.map((item) => (
                <div key={item.key} className="flex items-center justify-between gap-4 rounded-2xl border border-[#F2D4C8] bg-[#FFF9F5] p-4">
                  <div>
                    <p className="font-semibold text-[#0a0a0a]">{item.label}</p>
                    <p className="text-sm text-[#4a5565]">{item.description}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleField(item.key)}
                    className={`inline-flex h-7 w-12 items-center rounded-full p-1 transition-colors ${
                      settings[item.key] ? "bg-[#ff8566]" : "bg-[#e5e7eb]"
                    }`}
                    aria-pressed={settings[item.key]}
                    aria-label={`Alternar ${item.label}`}
                  >
                    <span className={`h-5 w-5 rounded-full bg-white transition-transform ${settings[item.key] ? "translate-x-5" : "translate-x-0"}`} />
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button type="button" onClick={handleSave} className="btn">
                <Save className="size-4" />
                Salvar Configurações
              </button>
              {saved && <span className="text-sm text-green-600">Configurações salvas com sucesso.</span>}
            </div>
          </section>
        </main>
      </div>
    </Layout>
  );
}
