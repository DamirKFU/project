import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000',
  withCredentials: true,
});

api.interceptors.request.use(async (config) => {
  const csrfToken = document.cookie
    .split('; ')
    .find(row => row.startsWith('csrftoken='))
    ?.split('=')[1];

  if (csrfToken) {
    config.headers['X-CSRFToken'] = csrfToken;
  }

  return config;
});

export const fetchPeople = async (startDate, endDate, page = 1, noPagination = false) => {
  const params = {};
  if (startDate) params.start_date = startDate;
  if (endDate) params.end_date = endDate;
  if (!noPagination) {
    params.page = page;
  } else {
    params.no_pagination = true;
  }

  const response = await api.get('/api/people/humans/', { params });
  return response.data;
};

export const login = async (username, password) => {
  const response = await api.post('/admin/login/', { username, password });
  return response.data;
};

export default api;
