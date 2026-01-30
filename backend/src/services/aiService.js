const axios = require("axios");
require("dotenv").config();

const HF_API_KEY = process.env.HF_API_KEY;
const MODEL = "zai-org/GLM-4.7:novita";

async function queryModel(messages, maxTokens = 100) {
  const API_URL = "https://router.huggingface.co/v1/chat/completions";

  try {
    const response = await axios.post(
      API_URL,
      {
        model: MODEL,
        messages, // ✅ array of messages
        temperature: 0.7,
        max_tokens: maxTokens,
      },
      {
        headers: {
          Authorization: `Bearer ${HF_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log(`✅ Response from model ${MODEL}:`, response.data.choices[0].message);

    return response.data?.choices?.[0]?.message?.content?.trim() || null;
  } catch (err) {
    console.error(`⚠ Error with model ${MODEL}:`, err.response?.data || err.message);
    return null;
  }
}
const generateSubject = async (topic) => {
  const messages = [
    { role: "system", content: "You are a helpful assistant that writes short, catchy email subjects." },
    { role: "user", content: `Write a short, catchy email subject about: ${topic}` }
  ];
  return await queryModel(messages, 40);
}

const generateContent = async (topic) => {
  const messages = [
    { role: "system", content: "You are a helpful assistant that writes professional email content." },
    { role: "user", content: `Write a professional email about: ${topic}` }
  ];
  return await queryModel(messages, 300);
}


// (async () => {
//   const topic = "Shackett collection";
  
//   const subject = await generateSubject(topic);
//   const body = await generateContent(topic);

//   console.log("Generated Subject:", subject);
//   console.log("Generated Body:", body);
// })();


module.exports = {
  generateSubject,
  generateContent
};