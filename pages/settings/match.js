import { ArrowLeft, Save, SlidersHorizontal } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Layout from "../../src/components/Layout";

const STORAGE_KEY = "matchPreferences";

const DEFAULT_PREFERENCES = {
  species: "qualquer",
  sex: "oposto",
  ageRange: "todos",
  maxDistanceKm: 20,
};

export default function MatchSettingsPage() {
  const router = useRouter();
  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const rawSettings = window.localStorage.getItem(STORAGE_KEY);
      if (!rawSettings) return;
      const parsed = JSON.parse(rawSettings);
      setPreferences({ ...DEFAULT_PREFERENCES, ...parsed });
    } catch {
      setPreferences(DEFAULT_PREFERENCES);
    }
  }, []);

  const setField = (field, value) => {
    setSaved(false);
    setPreferences((previous) => ({ ...previous, [field]: value }));
  };

  const handleSave = () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
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
                <SlidersHorizontal className="size-4" />
                Match
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-[#0a0a0a]">Preferências de Match</h1>
            <p className="text-[#4a5565] mt-2 mb-8">Defina os critérios que ajudam o PetFind a mostrar melhores conexões para seus pets.</p>

            <div className="space-y-6">
              <div>
                <label className="label mb-2">Espécie preferida</label>
                <select value={preferences.species} onChange={(event) => setField("species", event.target.value)} className="input">
                  <option value="qualquer">Qualquer espécie</option>
                  <option value="cachorro">Somente cachorro</option>
                  <option value="gato">Somente gato</option>
                </select>
              </div>

              <div>
                <label className="label mb-2">Compatibilidade de sexo</label>
                <select value={preferences.sex} onChange={(event) => setField("sex", event.target.value)} className="input">
                  <option value="oposto">Preferir sexo oposto</option>
                  <option value="mesmo">Permitir mesmo sexo</option>
                  <option value="qualquer">Qualquer sexo</option>
                </select>
              </div>

              <div>
                <label className="label mb-2">Faixa etária</label>
                <select value={preferences.ageRange} onChange={(event) => setField("ageRange", event.target.value)} className="input">
                  <option value="todos">Todas</option>
                  <option value="filhote">Filhotes</option>
                  <option value="adulto">Adultos</option>
                  <option value="idoso">Idosos</option>
                </select>
              </div>

              <div>
                <label className="label mb-2">Distância máxima (km)</label>
                <input
                  type="number"
                  min={1}
                  max={200}
                  value={preferences.maxDistanceKm}
                  onChange={(event) => setField("maxDistanceKm", Number(event.target.value) || 1)}
                  className="input"
                />
              </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button type="button" onClick={handleSave} className="btn">
                <Save className="size-4" />
                Salvar Preferências
              </button>
              {saved && <span className="text-sm text-green-600">Preferências salvas com sucesso.</span>}
            </div>
          </section>
        </main>
      </div>
    </Layout>
  );
}
