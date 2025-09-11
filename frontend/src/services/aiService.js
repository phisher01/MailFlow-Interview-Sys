import api from "./api";

export const aiService = {
  getSubjectSuggestions: async (topic) => {
    try {
      const res = await api.post("/ai/subject", { topic });
      // ✅ Always return a single string
      return res.data.subject || '';
    } catch (err) {
      console.error("AI subject suggestion failed:", err);
      return '';
    }
  },

  getEmailContent: async (topic) => {
    try {
      const res = await api.post("/ai/content", { topic });
      // ✅ Always return a single string
      return res.data.content || '';
    } catch (err) {
      console.error("AI content generation failed:", err);
      return '';
    }
  }
};

