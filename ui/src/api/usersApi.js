import api from './axiosInstance';

export const usersApi = {
  profile: () => api.get('/users/me').then((res) => res.data),
  updateProfile: (payload) => api.put('/users/me', payload).then((res) => res.data),
  addresses: () => api.get('/users/me/addresses').then((res) => res.data),
  addAddress: (payload) =>
    api.post('/users/me/addresses', payload).then((res) => res.data),
  updateAddress: (id, payload) =>
    api.put(`/users/me/addresses/${id}`, payload).then((res) => res.data),
  deleteAddress: (id) =>
    api.delete(`/users/me/addresses/${id}`).then((res) => res.data),
  setDefaultAddress: (id) =>
    api.patch(`/users/me/addresses/${id}/default`).then((res) => res.data),
  adminList: (params) => api.get('/admin/users', { params }).then((res) => res.data),
  deactivate: (id) =>
    api.patch(`/admin/users/${id}/deactivate`).then((res) => res.data),
};
