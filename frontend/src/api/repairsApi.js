import api from './axios';

export const bookRepair = async (data) => {
  const response = await api.post('/repairs', data);
  return response.data;
};

export const getMyRepairs = async () => {
  const response = await api.get('/repairs/myrepairs');
  return response.data;
};

export const updateRepairStatus = async (id, data) => {
  const response = await api.put(`/repairs/${id}/status`, data);
  return response.data;
};
