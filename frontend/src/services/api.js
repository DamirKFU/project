import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000',
  withCredentials: true,
});

// Interceptor to handle CSRF token
api.interceptors.request.use(async (config) => {
  // Get CSRF token from cookie if it exists
  const csrfToken = document.cookie
    .split('; ')
    .find(row => row.startsWith('csrftoken='))
    ?.split('=')[1];

  if (csrfToken) {
    config.headers['X-CSRFToken'] = csrfToken;
  }

  return config;
});

export const fetchPeople = async (startDate, endDate, noPagination = false) => {
  const params = {};
  if (startDate) params.start_date = startDate;
  if (endDate) params.end_date = endDate;
  if (noPagination) params.no_pagination = true;

  const response = await api.get('/api/people/humans/', { params });
  return response.data;
};

export const login = async (username, password) => {
  const response = await api.post('/admin/login/', { username, password });
  return response.data;
};

export default api;
