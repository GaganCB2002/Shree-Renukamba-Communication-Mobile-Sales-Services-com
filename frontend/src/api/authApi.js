import api from './axios';

export const loginUser = async (data) => {
  const response = await api.post('/auth/login', data);
  return response.data;
};

export const googleLoginApi = async (credential) => {
  const response = await api.post('/auth/google', { credential });
  return response.data;
};

export const registerUser = async (data) => {
  const response = await api.post('/auth/register', data);
  return response.data;
};

export const getUserProfile = async () => {
  const response = await api.get('/auth/profile');
  return response.data;
};

export const getSecurityQuestions = async (email) => {
  const response = await api.post('/auth/get-security-questions', { email });
  return response.data;
};

export const forgotPassword = async (data) => {
  const response = await api.post('/auth/forgot-password', data);
  return response.data;
};

export const getUsers = async () => {
  const response = await api.get('/auth/users');
  return response.data;
};

export const updateUserProfileApi = async (data) => {
  const response = await api.put('/auth/profile', data);
  return response.data;
};

export const changePasswordApi = async (data) => {
  const response = await api.put('/auth/change-password', data);
  return response.data;
};

export const getUserById = async (id) => {
  const response = await api.get(`/auth/users/${id}`);
  return response.data;
};

export const createUser = async (data) => {
  const response = await api.post('/auth/users', data);
  return response.data;
};

export const updateUser = async (id, data) => {
  const response = await api.put(`/auth/users/${id}`, data);
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await api.delete(`/auth/users/${id}`);
  return response.data;
};

