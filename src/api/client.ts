import axios from 'axios';

export const api = axios.create({ baseURL: 'https://app.tablecrm.com' });

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('tcrm_token');
  if (token) {
    cfg.params = { ...(cfg.params || {}), token };
  }
  return cfg;
});