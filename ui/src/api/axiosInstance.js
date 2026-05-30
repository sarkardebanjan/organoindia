import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const baseURL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

let refreshPromise = null;

const refreshAccessToken = async () => {
  const { refreshToken, setTokens, clearAuth } = useAuthStore.getState();
  if (!refreshToken) throw new Error('Missing refresh token');
  try {
    const response = await axios.post(`${baseURL}/auth/refresh`, { refreshToken });
    setTokens({
      accessToken: response.data.accessToken,
      refreshToken: response.data.refreshToken ?? refreshToken,
    });
    return response.data.accessToken;
  } catch (error) {
    clearAuth();
    throw error;
  }
};

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status !== 401 || originalRequest?._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;
    refreshPromise ??= refreshAccessToken().finally(() => {
      refreshPromise = null;
    });

    try {
      const token = await refreshPromise;
      originalRequest.headers.Authorization = `Bearer ${token}`;
      return api(originalRequest);
    } catch (refreshError) {
      const returnUrl = `${window.location.pathname}${window.location.search}`;
      window.location.assign(`/login?returnUrl=${encodeURIComponent(returnUrl)}`);
      return Promise.reject(refreshError);
    }
  },
);

export default api;
