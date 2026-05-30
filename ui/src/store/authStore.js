import { create } from 'zustand';
import { decodeJwt, extractRoles } from '../utils/jwtUtils';

const REFRESH_TOKEN_KEY = 'organoindia_refresh_token';

const userFromToken = (accessToken) => {
  const payload = decodeJwt(accessToken);
  if (!payload) return null;
  return {
    id: payload.sub,
    name: payload.name ?? payload.fullName ?? payload.email ?? 'Customer',
    email: payload.email,
    mobile: payload.mobile,
    roles: extractRoles(payload),
  };
};

export const useAuthStore = create((set, get) => ({
  accessToken: null,
  refreshToken: localStorage.getItem(REFRESH_TOKEN_KEY),
  user: null,
  setTokens: ({ accessToken, refreshToken }) => {
    if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    const nextAccessToken = accessToken ?? get().accessToken;
    set({
      accessToken: nextAccessToken,
      refreshToken: refreshToken ?? get().refreshToken,
      user: userFromToken(nextAccessToken),
    });
  },
  setUser: (user) => set({ user }),
  clearAuth: () => {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    set({ accessToken: null, refreshToken: null, user: null });
  },
  isAuthenticated: () => Boolean(get().accessToken),
  hasRole: (role) => get().user?.roles?.includes(role) ?? false,
}));
