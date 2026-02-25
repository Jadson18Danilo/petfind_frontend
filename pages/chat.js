import Layout from '../src/components/Layout';

export async function getServerSideProps() {
  return {
    redirect: {
      destination: '/chat-on',
      permanent: false,
    },
  };
}

export default function Chat() {
  return (
    <Layout>
      <div className="container-page py-10 max-w-2xl">
        <div className="card p-6 text-center">
          <h2 className="text-lg font-semibold text-slate-900">Redirecionando...</h2>
          <p className="mt-2 text-slate-600">Abrindo o chat completo.</p>
        </div>
      </div>
    </Layout>
  );
}