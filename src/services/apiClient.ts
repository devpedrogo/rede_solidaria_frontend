import axios, { AxiosError } from 'axios';
import type { AuthUser } from '@/types';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 60000,
});

// Interceptor: anexa o token JWT automaticamente
api.interceptors.request.use((config) => {
  const stored = localStorage.getItem('rede-solidaria-user');
  if (stored) {
    try {
      const user: AuthUser = JSON.parse(stored);
      if (user.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
      }
    } catch {
      /* ignore */
    }
  }
  return config;
});

// Interceptor: em 401, limpa sessão e redireciona para login
api.interceptors.response.use(
  (res) => res,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('rede-solidaria-user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Detecta se o backend está indisponível (rede/timeout) — usado para fallback de mock
export function isBackendDown(error: unknown): boolean {
  if (error instanceof AxiosError) {
    return (
      !error.response ||                          // sem resposta (CORS/offline/DNS)
      error.code === 'ECONNABORTED' ||            // timeout
      error.code === 'ERR_NETWORK'
    );
  }
  return true;
}
