import api from './axiosInstance';

export const ordersApi = {
  list: (params) => api.get('/orders', { params }).then((res) => res.data),
  detail: (id) => api.get(`/orders/${id}`).then((res) => res.data),
  create: (payload) => api.post('/orders', payload).then((res) => res.data),
  adminList: (params) => api.get('/admin/orders', { params }).then((res) => res.data),
  updateStatus: (id, status) =>
    api.patch(`/admin/orders/${id}/status`, { status }).then((res) => res.data),
  revenue: () => api.get('/admin/dashboard/revenue').then((res) => res.data),
};
