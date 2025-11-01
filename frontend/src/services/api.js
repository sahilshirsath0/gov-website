import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  // Remove the default Content-Type header
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Only set Content-Type to application/json for non-FormData requests
    if (!(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }
    // For FormData, let the browser set the correct Content-Type with boundary
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token');
      window.location.href = '/admin-login';
    }
    return Promise.reject(error);
  }
);

export const adminAPI = {
  // Auth
  checkSetupStatus: () => api.get('/admin/setup-status'),
  setupAdmin: (data) => api.post('/admin/setup', data),
  login: (data) => api.post('/admin/login', data),
  getProfile: () => api.get('/admin/profile'),
  updateProfile: (data) => api.put('/admin/profile', data),
  logout: () => api.post('/admin/logout'),

  // Announcements
  getAnnouncements: () => api.get('/announcements'),
  getAnnouncement: (id) => api.get(`/announcements/${id}`),
  createAnnouncement: (data) => api.post('/announcements', data), // FormData will be handled automatically
  updateAnnouncement: (id, data) => api.put(`/announcements/${id}`, data),
  deleteAnnouncement: (id) => api.delete(`/announcements/${id}`),

  // Gallery
  getGallery: () => api.get('/gallery'),
  createGalleryItem: (data) => api.post('/gallery', data), // FormData will be handled automatically
  updateGalleryItem: (id, data) => api.put(`/gallery/${id}`, data),
  deleteGalleryItem: (id) => api.delete(`/gallery/${id}`),

  // Awards
  getAwards: () => api.get('/awards'),
  getAward: (id) => api.get(`/awards/${id}`),
  createAward: (data) => api.post('/awards', data), // FormData will be handled automatically
  updateAward: (id, data) => api.put(`/awards/${id}`, data),
  deleteAward: (id) => api.delete(`/awards/${id}`),

  // Members
  getMembers: (params) => api.get('/members', { params }),
  getMember: (id) => api.get(`/members/${id}`),
  createMember: (data) => api.post('/members', data), // FormData will be handled automatically
  updateMember: (id, data) => api.put(`/members/${id}`, data),
  deleteMember: (id) => api.delete(`/members/${id}`),

  // Feedback
  getFeedback: (params) => api.get('/feedback', { params }),
  getFeedbackById: (id) => api.get(`/feedback/${id}`),
  updateFeedbackStatus: (id, data) => api.put(`/feedback/${id}/status`, data),
  deleteFeedback: (id) => api.delete(`/feedback/${id}`),
};

export default api;
