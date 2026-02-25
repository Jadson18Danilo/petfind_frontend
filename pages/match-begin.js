import Layout from '../src/components/Layout';

export async function getServerSideProps() {
  return {
    redirect: {
      destination: '/match-display',
      permanent: false,
    },
  };
}

export default function MatchBegin() {
  return (
    <Layout>
      <div className="container-page py-10 max-w-2xl">
        <div className="card p-6 text-center">
          <h2 className="text-lg font-semibold text-slate-900">Redirecionando...</h2>
          <p className="mt-2 text-slate-600">Abrindo a tela de match.</p>
        </div>
      </div>
    </Layout>
  );
}
