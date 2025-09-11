const axios = require("axios");
require("dotenv").config();

const HF_API_KEY = process.env.HF_API_KEY;

// ✅ Using only bart for both subject & content
const MODEL = "facebook/bart-large-cnn";

async function queryModel(prompt, maxTokens = 100) {
  const API_URL = `https://api-inference.huggingface.co/models/${MODEL}`;
  try {
    const response = await axios.post(
      API_URL,
      { inputs: prompt, parameters: { max_new_tokens: maxTokens } },
      {
        headers: {
          Authorization: `Bearer ${HF_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    // bart returns summary_text
    const output =
      response.data[0]?.generated_text || response.data[0]?.summary_text;

    return output?.trim() || null;
  } catch (err) {
    console.error(`⚠ Error with model ${MODEL}:`, err.response?.data || err.message);
    return null;
  }
}

module.exports = {
  generateSubject: async (topic) => {
    const prompt = ` ${topic}`;
    const result = await queryModel(prompt, 30); // shorter output
    console.log(result);
    return result || "Error generating subject";
  },

  generateContent: async (topic) => {
    const prompt = ` ${topic}`;
    const result = await queryModel(prompt, 300); // longer output
    return result || "Error generating content";
  },
};
