import api from './axios';

export const createOrder = async (data) => {
  const response = await api.post('/orders', data);
  return response.data;
};

export const getOrderById = async (id) => {
  const response = await api.get(`/orders/${id}`);
  return response.data;
};

export const getMyOrders = async () => {
  const response = await api.get('/orders/myorders');
  return response.data;
};

export const getAllOrders = async () => {
  const response = await api.get('/orders/all');
  return response.data;
};

export const trackOrder = async (orderId) => {
  const response = await api.get(`/orders/track/${orderId}`);
  return response.data;
};

export const updateOrderStatus = async (id, status) => {
  const response = await api.put(`/orders/${id}/status`, { status });
  return response.data;
};

export const updatePaymentStatus = async (id, paymentStatus) => {
  const response = await api.put(`/orders/${id}/payment`, { paymentStatus });
  return response.data;
};

export const getOrdersByStatus = async (status) => {
  const response = await api.get(`/orders/status/${status}`);
  return response.data;
};
