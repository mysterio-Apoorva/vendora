import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the Clerk token
api.interceptors.request.use(async (config) => {
  // We will handle token injection in the hooks where we have access to useAuth from Clerk
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;
