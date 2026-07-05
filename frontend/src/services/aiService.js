import api from "./api";

export const aiService = {
  getSubjectSuggestions: async (topic) => {
    try {
      const res = await api.post("/ai/subject", { topic });
      console.log("AI Subject Response:", res.data);
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
      const content = res.data.content;
      // ✅ Backend returns { html, text }; tolerate a plain string too
      if (typeof content === 'string') return { html: content, text: content };
      return content || { html: '', text: '' };
    } catch (err) {
      console.error("AI content generation failed:", err);
      return { html: '', text: '' };
    }
  }
};

