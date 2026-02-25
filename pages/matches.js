import React, { useEffect, useState } from 'react';
import Layout from '../src/components/Layout';
import { listMatches } from '../src/services/matches';
import { useRouter } from 'next/router';

export default function MatchList() {
  const router = useRouter();
  const [matches, setMatches] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadMatches() {
      try {
        const data = await listMatches();
        setMatches(data);
      } catch (err) {
        setError(err?.response?.data?.error || 'Falha ao carregar matches');
      }
    }

    loadMatches();
  }, []);

  return (
    <Layout>
      <div className="container-page py-10 max-w-2xl">

        {error && <p className="mt-3 text-red-600">{error}</p>}

        {matches.length === 0 ? (
          <div className="mt-6 card p-6 text-center">
            <p className="text-slate-600">Ainda não há matches. Comece a curtir perfis!</p>
            <button
              onClick={() => router.push('/match-display')}
              className="mt-4 btn"
            >
              Ir para Match
            </button>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {matches.map((match) => (
              <div key={match.id} className="card card-hover p-4">
                <div className="flex items-center justify-between">
                  <div className="font-semibold">Match #{match.id}</div>
                  <span className="badge">{match.status}</span>
                </div>
                <div className="text-sm text-slate-600 mt-1">
                  Pets {match.petAId} & {match.petBId}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}