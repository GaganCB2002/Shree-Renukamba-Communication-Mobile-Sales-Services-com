import api from './axios';

export const createOrder = async (data) => {
  const response = await api.post('/orders', data);
  return response.data;
};

export const getOrderById = async (id) => {
  const response = await api.get(`/orders/${id}`);
  return response.data;
};

export const trackOrder = async (orderId) => {
  const response = await api.get(`/orders/track/${orderId}`);
  return response.data;
};
