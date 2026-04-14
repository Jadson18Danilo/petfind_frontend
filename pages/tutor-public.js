import { Mail, MapPin, Phone, User } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Layout from '../src/components/Layout';

const TUTOR_PREVIEW_STORAGE_KEY = 'matchTutorProfilePreview';

export default function TutorPublicProfile() {
  const router = useRouter();
  const [data, setData] = useState(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const raw = window.localStorage.getItem(TUTOR_PREVIEW_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        setData(parsed);
      }
    } catch {
      setData(null);
    }
  }, []);

  const tutorName = data?.tutorName || 'Tutor';
  const tutorAvatar = data?.tutorAvatar || '';
  const tutorEmail = data?.tutorEmail || 'Não informado';
  const tutorPhone = data?.tutorPhone || 'Não informado';
  const location = data?.location || 'Localização não informada';

  const pet = data?.pet || {};
  const petImage = pet?.image || '';

  return (
    <Layout>
      <div className="min-h-screen page-bg py-6 sm:py-8 px-4 sm:px-6">
        <div className="mx-auto w-full max-w-4xl">
          <button
            type="button"
            onClick={() => router.back()}
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#e5e7eb] bg-white px-4 py-2 text-sm font-medium text-[#364153] hover:bg-[#f8fafc]"
          >
            Voltar
          </button>

          <div className="rounded-2xl bg-white shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5 pb-5 border-b border-[#eef1f4]">
              <div className="size-20 rounded-full bg-[#f2f4f7] overflow-hidden shrink-0 flex items-center justify-center">
                {tutorAvatar ? (
                  <Image
                    src={tutorAvatar}
                    alt={tutorName}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="size-10 text-[#98a2b3]" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl font-bold text-[#0a0a0a] truncate">{tutorName}</h1>
                <div className="mt-2 space-y-1 text-sm text-[#4a5565]">
                  <p className="flex items-center gap-2"><MapPin className="size-4 text-[#ff9b7f]" />{location}</p>
                  <p className="flex items-center gap-2"><Mail className="size-4 text-[#ff9b7f]" />{tutorEmail}</p>
                  <p className="flex items-center gap-2"><Phone className="size-4 text-[#ff9b7f]" />{tutorPhone}</p>
                </div>
              </div>
            </div>

            <div className="pt-5">
              <h2 className="text-lg font-bold text-[#0a0a0a] mb-3">Pet em destaque</h2>
              <div className="rounded-xl border border-[#eef1f4] p-3 sm:p-4 flex flex-col sm:flex-row gap-4">
                <div className="w-full sm:w-48 h-40 rounded-lg bg-[#f2f4f7] overflow-hidden flex items-center justify-center shrink-0">
                  {petImage ? (
                    <Image
                      src={petImage}
                      alt={pet?.name || 'Pet'}
                      width={192}
                      height={160}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-sm text-[#98a2b3]">Sem foto</span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-semibold text-[#0a0a0a] truncate">{pet?.name || 'Pet'}</h3>
                  <p className="text-sm text-[#6a7282] mt-0.5">{pet?.breed || 'Raça não informada'}</p>
                  <p className="text-sm text-[#6a7282] mt-0.5">{pet?.species || 'Espécie não informada'}</p>
                  <p className="text-sm text-[#364153] mt-3 leading-relaxed">{pet?.description || 'Sem descrição.'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
