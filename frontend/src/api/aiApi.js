import api from './axios';

export const chatWithLandingAI = async (message, sessionId) => {
  const response = await api.post('/ai/landing', { message, sessionId });
  return response.data;
};

export const chatWithCustomerAI = async (message, sessionId) => {
  const response = await api.post('/ai/customer', { message, sessionId });
  return response.data;
};

export const chatWithAdminAI = async (message, sessionId) => {
  const response = await api.post('/ai/admin', { message, sessionId });
  return response.data;
};

export const getChatHistory = async (sessionId) => {
  const response = await api.get(`/ai/history/${sessionId}`);
  return response.data;
};

export const getAdminChatSessions = async () => {
  const response = await api.get('/ai/sessions');
  return response.data;
};
