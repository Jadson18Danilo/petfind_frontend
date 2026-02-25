import axios from 'axios';
import { showToast } from './toast';

const primaryBaseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
const fallbackBaseURL = 'http://localhost:4001';

const api = axios.create({
  baseURL: primaryBaseURL,
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
      currentBaseURL === primaryBaseURL &&
      primaryBaseURL.includes('localhost:4000') &&
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
