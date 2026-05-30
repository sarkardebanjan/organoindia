import api from './axiosInstance';

export const productsApi = {
  list: (params) => api.get('/products', { params }).then((res) => res.data),
  detail: (id) => api.get(`/products/${id}`).then((res) => res.data),
  related: (id) => api.get(`/products/${id}/related`).then((res) => res.data),
  create: (payload) => api.post('/admin/products', payload).then((res) => res.data),
  update: (id, payload) =>
    api.put(`/admin/products/${id}`, payload).then((res) => res.data),
  remove: (id) => api.delete(`/admin/products/${id}`).then((res) => res.data),
};
