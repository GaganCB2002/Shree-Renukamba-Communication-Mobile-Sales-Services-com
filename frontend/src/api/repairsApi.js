import api from './axios';

export const bookRepair = async (data) => {
  const response = await api.post('/repairs', data);
  return response.data;
};

export const getMyRepairs = async () => {
  const response = await api.get('/repairs/myrepairs');
  return response.data;
};

export const getRepairById = async (id) => {
  const response = await api.get(`/repairs/${id}`);
  return response.data;
};

export const updateRepairStatus = async (id, data) => {
  const response = await api.put(`/repairs/${id}/status`, data);
  return response.data;
};

export const updateRepairDetails = async (id, data) => {
  const response = await api.put(`/repairs/${id}/details`, data);
  return response.data;
};

export const getAllRepairs = async () => {
  const response = await api.get('/repairs');
  return response.data;
};

export const imeiLookup = async (data) => {
  const response = await api.post('/repairs/imei-lookup', data);
  return response.data;
};
