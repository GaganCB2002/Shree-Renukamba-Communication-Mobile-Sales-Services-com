import api from './axios';

export const getCoupons = async () => {
  const response = await api.get('/coupons/public');
  return response.data;
};

export const getAllCoupons = async () => {
  const response = await api.get('/coupons');
  return response.data;
};

export const createCoupon = async (data) => {
  const response = await api.post('/coupons', data);
  return response.data;
};

export const updateCoupon = async (id, data) => {
  const response = await api.put(`/coupons/${id}`, data);
  return response.data;
};

export const deleteCoupon = async (id) => {
  const response = await api.delete(`/coupons/${id}`);
  return response.data;
};

export const validateCoupon = async (code, orderTotal) => {
  const response = await api.post('/coupons/validate', { code, orderTotal });
  return response.data;
};
