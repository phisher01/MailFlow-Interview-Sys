const express=require('express');
const ai=require('../services/aiService');


const router = express.Router();

router.post('/subject', async (req, res) => {
  const { topic } = req.body;
  const subject = await ai.generateSubject(topic);
  console.log("Generated Subject in route:", subject);
  res.json({ success: true, subject });
});

router.post('/content', async (req, res) => {
  const { topic } = req.body;
  const content = await ai.generateContent(topic);
  res.json({ success: true, content });
});

module.exports= router;
