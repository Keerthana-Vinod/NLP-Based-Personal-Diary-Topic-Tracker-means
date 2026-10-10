import axios from 'axios';

const API_BASE = '/api';

export const api = {
  getEntries: async (params = {}) => {
    const response = await axios.get(`${API_BASE}/entries`, { params });
    return response.data;
  },

  createEntry: async (entryData) => {
    const response = await axios.post(`${API_BASE}/entries`, entryData);
    return response.data;
  },

  getEntry: async (id) => {
    const response = await axios.get(`${API_BASE}/entries/${id}`);
    return response.data;
  },

  updateEntry: async (id, entryData) => {
    const response = await axios.put(`${API_BASE}/entries/${id}`, entryData);
    return response.data;
  },

  deleteEntry: async (id) => {
    const response = await axios.delete(`${API_BASE}/entries/${id}`);
    return response.data;
  },

  seedData: async () => {
    const response = await axios.post(`${API_BASE}/entries/seed`);
    return response.data;
  },

  previewNLP: async (textData) => {
    const response = await axios.post(`${API_BASE}/nlp/preview`, textData);
    return response.data;
  },

  getAnalytics: async () => {
    const response = await axios.get(`${API_BASE}/analytics`);
    return response.data;
  },
};
