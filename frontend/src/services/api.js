import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://159.223.18.102:5002';



const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API endpoints
export const apiEndpoints = {
  // Health check
  healthCheck: () => api.get('/'),
  
  // Auth endpoints
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  
  // Eligibility endpoints
  checkEligibility: (patientData) => api.post('/eligibility/check', patientData),
  getEligibilityHistory: (patientId) => api.get(`/eligibility/history/${patientId}`),
  getPatients: (params = {}) => api.get('/eligibility/patients', { params }),
  getInsuranceProviders: () => api.get('/eligibility/providers'),
  
  // Prior Authorization endpoints
  submitPriorAuth: (authData) => api.post('/prior-auth/submit', authData),
  getPriorAuthStatus: (authId) => api.get(`/prior-auth/status/${authId}`),
  getPriorAuthList: () => api.get('/prior-auth/list'),
  
  // Claims endpoints
  submitClaim: (claimData) => api.post('/claims/submit', claimData),
  getClaimsList: (params = {}) => api.get('/claims/list', { params }),
  getClaimStatus: (claimId) => api.get(`/claims/status/${claimId}`),
  getClaimsAnalytics: () => api.get('/claims/analytics'),
  batchSubmitClaims: (claimsData) => api.post('/claims/batch-submit', claimsData),
  
  // Clinical Documentation endpoints
  getClinicalTemplates: () => api.get('/clinical-docs/templates'),
  getAiAssistance: (data) => api.post('/clinical-docs/ai-assistance', data),
  saveClinicalDocument: (data) => api.post('/clinical-docs/save', data),
  updateClinicalDocument: (id, data) => api.put(`/clinical-docs/update/${id}`, data),
  getClinicalDocuments: () => api.get('/clinical-docs/list'),
  validateClinicalDocument: (data) => api.post('/clinical-docs/validate', data),

  // Medical Coding endpoints
  searchCodes: (query, codeType) => api.get(`/medical-coding/search?query=${query}&type=${codeType}`),
  getAiCodeSuggestions: (data) => api.post('/medical-coding/ai-suggestions', data),
  validateCodes: (data) => api.post('/medical-coding/validate', data),
  saveCodingSession: (data) => api.post('/medical-coding/sessions', data),
  getCodingSessions: () => api.get('/medical-coding/sessions'),
  getCodingSession: (id) => api.get(`/medical-coding/sessions/${id}`),
  updateCodingSession: (id, data) => api.put(`/medical-coding/sessions/${id}`, data),
  getCodingAnalytics: () => api.get('/medical-coding/analytics'),

  // Remittance & Reconciliation endpoints
  getPayments: (params = {}) => api.get('/remittance/payments', { params }),
  postPayment: (data) => api.post('/remittance/payments/post', data),
  batchPostPayments: (data) => api.post('/remittance/payments/batch-post', data),
  runAutoReconciliation: (data) => api.post('/remittance/reconciliation/auto', data),
  getReconciliationSessions: () => api.get('/remittance/reconciliation/sessions'),
  predictDenials: (data) => api.post('/remittance/denial-prediction', data),
  getRemittanceAnalytics: () => api.get('/remittance/analytics'),
  processERA: (data) => api.post('/remittance/era-processing', data),
  getAgingReport: () => api.get('/remittance/aging-report'),
  
  // Dashboard endpoints
  getDashboardStats: () => api.get('/dashboard/stats'),
  getRecentActivity: () => api.get('/dashboard/recent-activity'),
  getAiInsights: () => api.get('/dashboard/ai-insights'),
};

export default api;
