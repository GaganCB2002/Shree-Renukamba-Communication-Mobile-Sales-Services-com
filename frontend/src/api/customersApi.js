import api from './axios';

export const getAllCustomers = async () => {
  const response = await api.get('/auth/customers');
  return response.data;
};

export const getUsers = async () => {
  const response = await api.get('/auth/users');
  return response.data;
};
