import axios from 'axios';
import { showToast } from './toast';

const primaryBaseURL = process.env.NEXT_PUBLIC_API_URL || '';
const fallbackBaseURL = process.env.NEXT_PUBLIC_API_FALLBACK_URL || '';
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
    const isNetworkError = !error?.response;
    const currentBaseURL = error?.config?.baseURL || api.defaults.baseURL;
    const canRetryWithFallback =
      typeof window !== 'undefined' &&
      isNetworkError &&
      Boolean(fallbackBaseURL) &&
      currentBaseURL === primaryBaseURL &&
      !error?.config?._retryWithFallback;

    if (canRetryWithFallback) {
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
