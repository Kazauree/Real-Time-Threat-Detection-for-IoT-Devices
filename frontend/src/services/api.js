import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('iot_auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
};

export const devicesAPI = {
  getDevices: (params) => api.get('/devices', { params }),
  getDevice: (id) => api.get(`/devices/${id}`),
  createDevice: (data) => api.post('/devices', data),
  updateDevice: (id, data) => api.put(`/devices/${id}`, data),
  deleteDevice: (id) => api.delete(`/devices/${id}`),
};

export const trafficAPI = {
  getTraffic: (params) => api.get('/traffic', { params }),
  getLiveTraffic: () => api.get('/traffic/live'),
};

export const predictAPI = {
  sendPrediction: (payload) => api.post('/predict', payload),
  getPredictions: (limit = 50) => api.get(`/predictions?limit=${limit}`),
};

export const threatsAPI = {
  getThreats: (params) => api.get('/threats', { params }),
  getThreatDetail: (id) => api.get(`/threats/${id}`),
  updateThreatStatus: (id, status) => api.put(`/threats/${id}/status`, { status }),
  getAlerts: (params) => api.get('/alerts', { params }),
  markAlertRead: (id) => api.put(`/alerts/${id}/read`),
};

export const dashboardAPI = {
  getStatistics: () => api.get('/dashboard/statistics'),
  getAttackDistribution: () => api.get('/dashboard/attack-distribution'),
  getThreatTrends: () => api.get('/dashboard/threat-trends'),
  getDeviceRisk: () => api.get('/dashboard/device-risk'),
};

export const mlAPI = {
  getMetrics: () => api.get('/ml/metrics'),
  getFeatures: () => api.get('/ml/features'),
  retrainModel: () => api.post('/ml/retrain'),
};

export const reportsAPI = {
  getThreatsReportUrl: (format = 'csv') => `${API_BASE_URL}/reports/threats?format=${format}`,
  getTrafficReportUrl: () => `${API_BASE_URL}/reports/traffic`,
};

export const logsAPI = {
  getLogs: (params) => api.get('/logs', { params }),
};

export default api;
