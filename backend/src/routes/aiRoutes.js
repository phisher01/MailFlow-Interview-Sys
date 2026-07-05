const express=require('express');
const ai=require('../services/aiService');


const router = express.Router();

router.post('/subject', async (req, res) => {
  try {
    const { topic } = req.body;
    if (!topic) {
      return res.status(400).json({ success: false, message: 'topic is required' });
    }
    const subject = await ai.generateSubject(topic);
    console.log("Generated Subject in route:", subject);
    res.json({ success: true, subject });
  } catch (err) {
    console.error('AI subject error:', err.message);
    res.status(502).json({ success: false, message: err.message });
  }
});

router.post('/content', async (req, res) => {
  try {
    const { topic } = req.body;
    if (!topic) {
      return res.status(400).json({ success: false, message: 'topic is required' });
    }
    const content = await ai.generateContent(topic);
    res.json({ success: true, content });
  } catch (err) {
    console.error('AI content error:', err.message);
    res.status(502).json({ success: false, message: err.message });
  }
});

module.exports= router;
