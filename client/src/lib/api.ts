import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_admin');
      if (window.location.pathname.startsWith('/admin') && !window.location.pathname.includes('/login')) {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

export const authAPI = {
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  register: (data: { name: string; email: string; password: string; role?: string }) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  getAdmins: () => api.get('/auth/admins'),
};

export const productsAPI = {
  getAll: (params?: Record<string, string | number | boolean>) => api.get('/products', { params }),
  getBySlug: (slug: string) => api.get(`/products/${slug}`),
  create: (data: Record<string, unknown>) => api.post('/products', data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/products/${id}`, data),
  delete: (id: string) => api.delete(`/products/${id}`),
};

export const categoriesAPI = {
  getAll: (params?: Record<string, string | boolean>) => api.get('/categories', { params }),
  getBySlug: (slug: string) => api.get(`/categories/${slug}`),
  create: (data: Record<string, unknown>) => api.post('/categories', data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/categories/${id}`, data),
  delete: (id: string) => api.delete(`/categories/${id}`),
};

export const bannersAPI = {
  getAll: () => api.get('/banners'),
  create: (data: Record<string, unknown>) => api.post('/banners', data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/banners/${id}`, data),
  delete: (id: string) => api.delete(`/banners/${id}`),
};

export const offersAPI = {
  getAll: () => api.get('/offers'),
  create: (data: Record<string, unknown>) => api.post('/offers', data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/offers/${id}`, data),
  delete: (id: string) => api.delete(`/offers/${id}`),
};

export const testimonialsAPI = {
  getAll: () => api.get('/testimonials'),
  getAllAdmin: () => api.get('/testimonials/all'),
  create: (data: Record<string, unknown>) => api.post('/testimonials', data),
  createPublic: (data: Record<string, unknown>) => api.post('/testimonials/public', data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/testimonials/${id}`, data),
  delete: (id: string) => api.delete(`/testimonials/${id}`),
};

export const ordersAPI = {
  getAll: (params?: Record<string, string | number>) => api.get('/orders', { params }),
  getById: (id: string) => api.get(`/orders/${id}`),
  create: (data: Record<string, unknown>) => api.post('/orders', data),
  updateStatus: (id: string, status: string) => api.put(`/orders/${id}/status`, { status }),
  delete: (id: string) => api.delete(`/orders/${id}`),
  exportExcel: async (status?: string) => {
    const params: Record<string, string> = {};
    if (status) params.status = status;
    return api.get('/orders/export', { params, responseType: 'blob' });
  },
};

export const enquiriesAPI = {
  getAll: (params?: Record<string, string | number>) => api.get('/enquiries', { params }),
  create: (data: Record<string, unknown>) => api.post('/enquiries', data),
  updateStatus: (id: string, status: string) => api.put(`/enquiries/${id}/status`, { status }),
  delete: (id: string) => api.delete(`/enquiries/${id}`),
};

export const settingsAPI = {
  get: () => api.get('/settings'),
  update: (data: Record<string, unknown>) => api.put('/settings', data),
};

export const uploadAPI = {
  uploadMultiple: (files: File[]) => {
    const formData = new FormData();
    files.forEach((f) => formData.append('images', f));
    return api.post('/upload', formData);
  },
  uploadSingle: (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post('/upload/single', formData);
  },
};

export const analyticsAPI = {
  getStockOverview: () => api.get('/analytics/stock-overview'),
  getTopSellers: (params?: Record<string, string | number>) => api.get('/analytics/top-sellers', { params }),
  getUnsoldProducts: () => api.get('/analytics/unsold-products'),
  runAnalysis: () => api.get('/analytics/run-analysis'),
};

export const whatsappBotAPI = {
  getStatus: () => api.get('/whatsapp/status'),
  start: () => api.post('/whatsapp/start'),
  disconnect: () => api.post('/whatsapp/disconnect'),
  clearAuth: () => api.post('/whatsapp/clear-auth'),
  sendMessage: (phone: string, message: string) => api.post('/whatsapp/send', { phone, message }),
};
