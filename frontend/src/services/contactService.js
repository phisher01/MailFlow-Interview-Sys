import api from './api';

export const contactService = {
  // Get all contacts
  getContacts: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const response = await api.get(`/contacts?${queryParams}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create contact
  createContact: async (contactData) => {
    try {
      const response = await api.post('/contacts', contactData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update contact
  updateContact: async (id, contactData) => {
    try {
      const response = await api.put(`/contacts/${id}`, contactData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete contact
  deleteContact: async (id) => {
    try {
      const response = await api.delete(`/contacts/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Import contacts
  importContacts: async (contacts) => {
    try {
      const response = await api.post('/contacts/import', { contacts });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};
