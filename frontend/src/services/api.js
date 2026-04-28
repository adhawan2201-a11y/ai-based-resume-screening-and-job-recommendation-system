import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ─── Auth ────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// ─── Resumes ─────────────────────────────────────────────
export const resumeAPI = {
  upload: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/resumes/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getMyResume: () => api.get('/resumes/my-resume'),
  getResume: (id) => api.get(`/resumes/${id}`),
};

// ─── Jobs ────────────────────────────────────────────────
export const jobAPI = {
  list: (params = {}) => api.get('/jobs/', { params }),
  get: (id) => api.get(`/jobs/${id}`),
  create: (data) => api.post('/jobs/', data),
  delete: (id) => api.delete(`/jobs/${id}`),
  getMyPostings: () => api.get('/jobs/my/postings'),
  getCandidates: (jobId, minScore = 0) =>
    api.get(`/jobs/${jobId}/candidates`, { params: { min_score: minScore } }),
};

// ─── Matching ────────────────────────────────────────────
export const matchingAPI = {
  scoreJob: (jobId) => api.post(`/matching/score/${jobId}`),
  getRecommendations: (limit = 10) =>
    api.get('/matching/recommendations', { params: { limit } }),
  getSkillGap: (targetRole = '') =>
    api.get('/matching/skill-gap', { params: { target_role: targetRole } }),
  getMyScores: () => api.get('/matching/my-scores'),
};

// ─── Chat ────────────────────────────────────────────────
export const chatAPI = {
  send: (message, history = []) => api.post('/chat/', { message, history }),
};

// ─── Seed ────────────────────────────────────────────────
export const seedAPI = {
  seed: () => api.post('/seed/'),
};

// ─── Admin ───────────────────────────────────────────────
export const adminAPI = {
  getUsers: (role) => api.get('/admin/users', { params: { role } }),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  toggleBlock: (id, is_blocked) => api.patch(`/admin/users/${id}/block`, { is_blocked }),
  getJobs: () => api.get('/admin/jobs'),
  deleteJob: (id) => api.delete(`/admin/jobs/${id}`),
  getResumes: () => api.get('/admin/resumes'),
  deleteResume: (id) => api.delete(`/admin/resumes/${id}`),
  getAnalytics: () => api.get('/admin/analytics'),
};

// ─── Candidate ───────────────────────────────────────────
export const candidateAPI = {
  getDashboard: () => api.get('/candidate/dashboard'),
};

// ─── Recruiter ───────────────────────────────────────────
export const recruiterAPI = {
  getMyJobs: () => api.get('/recruiter/my-jobs'),
  getApplicants: (jobId) => api.get(`/recruiter/job-applicants/${jobId}`),
  getAnalytics: () => api.get('/recruiter/analytics'),
  updateStatus: (matchId, status) => api.patch(`/recruiter/match/${matchId}/status`, null, { params: { status } }),
};

export default api;
