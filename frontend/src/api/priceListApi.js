import api from './axios';

export const getPriceList = async () => {
  const response = await api.get('/price-list');
  return response.data;
};

export const updatePriceListItem = async (id, data) => {
  const response = await api.put(`/price-list/${id}`, data);
  return response.data;
};

export const bulkUpdatePrices = async (updates) => {
  const response = await api.put('/price-list/bulk', { updates });
  return response.data;
};
