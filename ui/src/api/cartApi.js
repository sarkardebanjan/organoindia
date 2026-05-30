import api from './axiosInstance';

export const cartApi = {
  get: () => api.get('/cart').then((res) => res.data),
  add: (payload) => api.post('/cart/items', payload).then((res) => res.data),
  updateItem: (itemId, payload) =>
    api.put(`/cart/items/${itemId}`, payload).then((res) => res.data),
  removeItem: (itemId) => api.delete(`/cart/items/${itemId}`).then((res) => res.data),
  clear: () => api.delete('/cart').then((res) => res.data),
};
