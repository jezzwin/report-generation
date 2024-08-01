import axios from 'axios';

const API_URL = 'http://localhost:5000';

export const generateReport = async () => {
  const response = await axios.get(`${API_URL}/generate`);
  return response.data;
};

export const downloadReport = async (reportId: string) => {
  const response = await axios.post(`${API_URL}/download`, { reportId });
  return response.data;
};
