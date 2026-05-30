import api from './axiosInstance';

export const authApi = {
  login: (payload) => api.post('/auth/login', payload).then((res) => res.data),
  register: (payload) => api.post('/auth/register', payload).then((res) => res.data),
  logout: (refreshToken) =>
    api.post('/auth/logout', { refreshToken }).then((res) => res.data),
};
