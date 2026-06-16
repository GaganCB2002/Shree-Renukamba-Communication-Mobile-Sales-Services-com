import api from './axios';

export const createInvoice = async (data) => {
  const response = await api.post('/invoices', data);
  return response.data;
};

export const getInvoices = async () => {
  const response = await api.get('/invoices');
  return response.data;
};

export const getMyInvoices = async () => {
  const response = await api.get('/invoices/myinvoices');
  return response.data;
};

export const getInvoiceById = async (id) => {
  const response = await api.get(`/invoices/${id}`);
  return response.data;
};

export const updateInvoiceStatus = async (id, data) => {
  const response = await api.put(`/invoices/${id}`, data);
  return response.data;
};

export const getInvoiceByOrder = async (orderId) => {
  const response = await api.get(`/invoices/byorder/${orderId}`);
  return response.data;
};
