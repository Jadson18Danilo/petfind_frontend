import axios from 'axios';
import { showToast } from './toast';

const DEFAULT_API_URL = 'https://petfind-back-gzhxbaececedfbc9.brazilsouth-01.azurewebsites.net';
const KNOWN_INVALID_HOSTS = new Set([
  'petfind-gtgne8bjeth7d2au.canadacentral-01.azurewebsites.net',
]);

function sanitizeBaseUrl(rawUrl) {
  if (!rawUrl) return '';

  try {
    const parsed = new URL(rawUrl);
    if (KNOWN_INVALID_HOSTS.has(parsed.hostname)) {
      return '';
    }
    return parsed.origin;
  } catch {
    return '';
  }
}

const primaryBaseURL = sanitizeBaseUrl(process.env.NEXT_PUBLIC_API_URL);
const fallbackBaseURL = sanitizeBaseUrl(process.env.NEXT_PUBLIC_API_FALLBACK_URL) || DEFAULT_API_URL;
const resolvedBaseURL = primaryBaseURL || fallbackBaseURL;

const api = axios.create({
  baseURL: resolvedBaseURL,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;
    const skipAuthRedirect = Boolean(error?.config?.skipAuthRedirect);

    if (canRetry404WithFallback) {
      api.defaults.baseURL = fallbackBaseURL;
      return api.request({
        ...error.config,
        baseURL: fallbackBaseURL,
        _retryWithFallback: true,
      });
    }

    if (typeof window !== 'undefined' && status === 401) {
      const currentPath = window.location.pathname || '';
      const isAuthPage = currentPath.startsWith('/login') || currentPath.startsWith('/register');

      if (!isAuthPage && !skipAuthRedirect) {
        showToast('Sua sessão expirou. Faça login novamente.', 'error');
        window.location.href = '/login';
      }
    }

    if (typeof window !== 'undefined' && status >= 500) {
      showToast('Erro interno no servidor. Tente novamente em instantes.', 'error');
    }

    return Promise.reject(error);
  }
);

export default api;
