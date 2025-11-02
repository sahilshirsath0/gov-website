// services/api.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
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
  createAnnouncement: (data) => api.post('/announcements', data),
  updateAnnouncement: (id, data) => api.put(`/announcements/${id}`, data),
  deleteAnnouncement: (id) => api.delete(`/announcements/${id}`),

  // Gallery
  getGallery: () => api.get('/gallery'),
  createGalleryItem: (data) => api.post('/gallery', data),
  updateGalleryItem: (id, data) => api.put(`/gallery/${id}`, data),
  deleteGalleryItem: (id) => api.delete(`/gallery/${id}`),

  // Awards
  getAwards: () => api.get('/awards'),
  getAward: (id) => api.get(`/awards/${id}`),
  createAward: (data) => api.post('/awards', data),
  updateAward: (id, data) => api.put(`/awards/${id}`, data),
  deleteAward: (id) => api.delete(`/awards/${id}`),

  // Members
  getMembers: (params) => api.get('/members', { params }),
  getMember: (id) => api.get(`/members/${id}`),
  createMember: (data) => api.post('/members', data),
  updateMember: (id, data) => api.put(`/members/${id}`, data),
  deleteMember: (id) => api.delete(`/members/${id}`),

  // Feedback
  getFeedback: (params) => api.get('/feedback', { params }),
  getFeedbackById: (id) => api.get(`/feedback/${id}`),
  updateFeedbackStatus: (id, data) => api.put(`/feedback/${id}/status`, data),
  deleteFeedback: (id) => api.delete(`/feedback/${id}`),

  // Nagrik Seva APIs
  getNagrikSevaHeader: () => api.get('/nagrik-seva/header'),
  updateNagrikSevaHeader: (data) => api.post('/nagrik-seva/header', data),
  getNagrikSevaApplications: () => api.get('/nagrik-seva/applications'),
  updateApplicationStatus: (id, data) => api.patch(`/nagrik-seva/applications/${id}/status`, data),

  // Village Detail APIs
  getVillageDetails: () => api.get('/village-details/admin'), // Get all village details
  getVillageDetail: (id) => api.get(`/village-details/${id}`), // Get single village detail
  createVillageDetail: (data) => api.post('/village-details', data),
  updateVillageDetail: (id, data) => api.put(`/village-details/${id}`, data),
  deleteVillageDetail: (id) => api.delete(`/village-details/${id}`),

  // Program APIs
  getPrograms: () => api.get('/programs/admin'),
  createProgram: (data) => api.post('/programs', data),
  updateProgram: (id, data) => api.put(`/programs/${id}`, data),
  deleteProgram: (id) => api.delete(`/programs/${id}`)
};

export const publicAPI = {
  // Public Announcements
  getAnnouncements: () => api.get('/announcements/public'),
  
  // Public Gallery
  getGallery: () => api.get('/gallery/public'),
  
  // Public Awards
  getAwards: () => api.get('/awards/public'),
  
  // Public Members
  getMembers: () => api.get('/members/public'),
  
  // Public Feedback
  submitFeedback: (data) => api.post('/feedback/submit', data),
  
  // Public Nagrik Seva APIs
  getNagrikSevaHeader: () => api.get('/nagrik-seva/header'),
  submitNagrikSevaApplication: (data) => api.post('/nagrik-seva/apply', data),

  // Public Village Detail API
 getVillageDetails: (lang = 'en') => api.get(`/village-details?lang=${lang}`), // Get all public village details
  getVillageDetail: (id, lang = 'en') => api.get(`/village-details/${id}?lang=${lang}`), // Get single public village detail

  // Public Programs API
  getPrograms: () => api.get('/programs'),
  
  // Contact/General
  submitContactForm: (data) => api.post('/contact/submit', data)
};

export default api;
