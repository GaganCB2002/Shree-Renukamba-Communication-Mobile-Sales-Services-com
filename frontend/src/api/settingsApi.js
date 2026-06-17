import api from './axios';

export const getSettings = async () => {
  const response = await api.get('/settings');
  return response.data;
};

export const updateSetting = async (key, value) => {
  const response = await api.put('/settings', { key, value });
  return response.data;
};