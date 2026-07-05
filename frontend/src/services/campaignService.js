import api from './api';

export const campaignService = {
  // Get all campaigns
  getCampaigns: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const response = await api.get(`/campaigns?${queryParams}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get single campaign
  getCampaign: async (id) => {
    try {
      const response = await api.get(`/campaigns/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create campaign
  createCampaign: async (campaignData) => {
    try {
      const response = await api.post('/campaigns', campaignData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update campaign
  updateCampaign: async (id, campaignData) => {
    try {
      const response = await api.put(`/campaigns/${id}`, campaignData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete campaign
  deleteCampaign: async (id) => {
    try {
      const response = await api.delete(`/campaigns/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Send campaign
  sendCampaign: async (id) => {
    try {
      const response = await api.post(`/campaigns/${id}/send`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Send test email
  // sendTestEmail: async (id, email) => {
  //   try {
  //     const response = await api.post(`/campaigns/${id}/test`, { email });
  //     return response.data;
  //   } catch (error) {
  //     throw error;
  //   }
  // },
  
  sendPreviewTestEmail: async (email, subject, content) => {
  try {
  console.log("here")


    const response = await api.post('/campaigns/preview/test', {
      email,
      subject,
      content,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
},

  // Get dashboard stats
  getDashboardStats: async () => {
    try {
      const response = await api.get('/campaigns/stats');
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};
