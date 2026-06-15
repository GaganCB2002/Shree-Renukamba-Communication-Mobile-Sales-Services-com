import api from './api/axios';

export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const uploadMultipleFiles = async (files) => {
  const formData = new FormData();
  files.forEach(f => formData.append('files', f));
  const response = await api.post('/upload/multiple', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const uploadToGitHub = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/upload/github', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const uploadMultipleToGitHub = async (files) => {
  const formData = new FormData();
  files.forEach(f => formData.append('files', f));
  const response = await api.post('/upload/github/multiple', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const getActivityLogs = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const response = await api.get(`/activity-logs?${query}`);
  return response.data;
};
