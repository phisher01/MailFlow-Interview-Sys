const axios = require("axios");
require("dotenv").config();

const HF_API_KEY = process.env.HF_API_KEY;

async function listModels() {
  try {
    const response = await axios.get("https://huggingface.co/api/models", {
      headers: { Authorization: `Bearer ${HF_API_KEY}` },
      params: { filter: "text-generation", limit: 10 }, // limit = number of models
    });

    console.log("Available models:");
    response.data.forEach((m, i) => console.log(`${i + 1}. ${m.modelId || m.model}`));
  } catch (err) {
    console.error("Error listing models:", err.response?.data || err.message);
  }
}

listModels();
