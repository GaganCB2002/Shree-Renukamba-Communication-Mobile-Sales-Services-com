import api from './axios';

export const trackVisitorApi = async (data) => {
  const response = await api.post('/visitors/track', data);
  return response.data;
};

export const getVisitors = async () => {
  const response = await api.get('/visitors');
  return response.data;
};

export const getVisitorStats = async () => {
  const response = await api.get('/visitors/stats');
  return response.data;
};

export const getVisitorById = async (id) => {
  const response = await api.get(`/visitors/${id}`);
  return response.data;
};
