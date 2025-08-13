import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const paymentsService = {
  async createCheckout(points) {
    const res = await api.post('/payments/create-checkout-session', { points });
    return res.data;
  }
};

export default paymentsService;


