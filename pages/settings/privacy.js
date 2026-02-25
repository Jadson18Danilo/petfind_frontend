import { ArrowLeft, Save, Shield } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Layout from "../../src/components/Layout";

const STORAGE_KEY = "privacySettings";

const DEFAULT_SETTINGS = {
  showEmail: false,
  showPhone: false,
  showCity: true,
  profileVisibility: "publico",
};

export default function PrivacySettingsPage() {
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

  const updateField = (fieldName, value) => {
    setSaved(false);
    setSettings((previous) => ({ ...previous, [fieldName]: value }));
  };

  const handleSave = () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    }
    setSaved(true);
  };

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
                <Shield className="size-4" />
                Privacidade
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-[#0a0a0a]">Privacidade</h1>
            <p className="text-[#4a5565] mt-2 mb-8">Defina quais informações ficam visíveis para outros tutores no app.</p>

            <div className="space-y-4">
              <label className="flex items-center justify-between rounded-2xl border border-[#F2D4C8] bg-[#FFF9F5] p-4 cursor-pointer">
                <div>
                  <p className="font-semibold text-[#0a0a0a]">Mostrar e-mail</p>
                  <p className="text-sm text-[#4a5565]">Permite contato direto por e-mail.</p>
                </div>
                <input type="checkbox" checked={settings.showEmail} onChange={(event) => updateField("showEmail", event.target.checked)} className="size-4 accent-[#ff8566]" />
              </label>

              <label className="flex items-center justify-between rounded-2xl border border-[#F2D4C8] bg-[#FFF9F5] p-4 cursor-pointer">
                <div>
                  <p className="font-semibold text-[#0a0a0a]">Mostrar telefone</p>
                  <p className="text-sm text-[#4a5565]">Facilita combinar encontros mais rápido.</p>
                </div>
                <input type="checkbox" checked={settings.showPhone} onChange={(event) => updateField("showPhone", event.target.checked)} className="size-4 accent-[#ff8566]" />
              </label>

              <label className="flex items-center justify-between rounded-2xl border border-[#F2D4C8] bg-[#FFF9F5] p-4 cursor-pointer">
                <div>
                  <p className="font-semibold text-[#0a0a0a]">Mostrar cidade</p>
                  <p className="text-sm text-[#4a5565]">Exibe sua cidade para melhorar relevância de match.</p>
                </div>
                <input type="checkbox" checked={settings.showCity} onChange={(event) => updateField("showCity", event.target.checked)} className="size-4 accent-[#ff8566]" />
              </label>

              <div className="rounded-2xl border border-[#F2D4C8] bg-[#FFF9F5] p-4">
                <p className="font-semibold text-[#0a0a0a] mb-3">Visibilidade do perfil</p>
                <div className="space-y-2 text-sm text-[#364153]">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="profileVisibility" value="publico" checked={settings.profileVisibility === "publico"} onChange={(event) => updateField("profileVisibility", event.target.value)} className="accent-[#ff8566]" />
                    Público para todos os tutores
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="profileVisibility" value="limitado" checked={settings.profileVisibility === "limitado"} onChange={(event) => updateField("profileVisibility", event.target.value)} className="accent-[#ff8566]" />
                    Mostrar somente após interação de match
                  </label>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button type="button" onClick={handleSave} className="btn">
                <Save className="size-4" />
                Salvar Privacidade
              </button>
              {saved && <span className="text-sm text-green-600">Privacidade atualizada com sucesso.</span>}
            </div>
          </section>
        </main>
      </div>
    </Layout>
  );
}
