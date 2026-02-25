import React, { useEffect, useState } from 'react';
import Header from './Header';

export default function Layout({ children, title }) {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    function handleToast(event) {
      const { message, type = 'info', duration = 2800 } = event.detail || {};
      if (!message) return;

      const id = Date.now() + Math.random();
      setToasts((previous) => [...previous, { id, message, type }]);

      window.setTimeout(() => {
        setToasts((previous) => previous.filter((toast) => toast.id !== id));
      }, duration);
    }

    window.addEventListener('app:toast', handleToast);
    return () => window.removeEventListener('app:toast', handleToast);
  }, []);

  return (
    <div className="page">
      <Header />
      <main className="container-page py-10">
        {title && <h1 className="section-title mb-4">{title}</h1>}
        {children}
      </main>

      {toasts.length > 0 && (
        <div className="fixed top-20 right-4 z-120 flex flex-col gap-2 w-[min(92vw,360px)]">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`rounded-2xl border px-4 py-3 shadow-lg text-sm font-medium ${
                toast.type === 'success'
                  ? 'bg-green-50 border-green-200 text-green-700'
                  : toast.type === 'error'
                    ? 'bg-red-50 border-red-200 text-red-700'
                    : 'bg-white border-slate-200 text-slate-700'
              }`}
            >
              {toast.message}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
