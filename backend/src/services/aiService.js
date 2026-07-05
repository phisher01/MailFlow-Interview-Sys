const axios = require("axios");
require("dotenv").config();

const HF_API_KEY = process.env.HF_API_KEY;
const MODEL = "google/gemma-3-4b-it";

async function queryModel(messages, maxTokens = 100) {
  const API_URL = "https://router.huggingface.co/v1/chat/completions";

  if (!HF_API_KEY || HF_API_KEY === "your-huggingface-token-here") {
    throw new Error("HF_API_KEY is not set in backend/.env — add your Hugging Face token");
  }

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

    const content = response.data?.choices?.[0]?.message?.content?.trim();
    if (!content) {
      throw new Error(`Model ${MODEL} returned an empty response`);
    }
    return content;
  } catch (err) {
    const apiError = err.response?.data?.error;
    const message = apiError?.message || apiError || err.message;
    console.error(`⚠ Error with model ${MODEL}:`, err.response?.data || err.message);
    throw new Error(`AI generation failed: ${message}`);
  }
}
// Strip chatty preamble ("Okay, here are a few..."), list markers, and quotes —
// keep only one clean subject line
const cleanSubject = (text) => {
  if (!text) return text;
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  // prefer the first list item if the model returned a list,
  // otherwise the first line that isn't a preamble ending in ":"
  let line = lines.find(l => /^(\*|-|\d+[.)])\s+/.test(l))
    || lines.find(l => !l.endsWith(':'))
    || lines[0];
  line = line.replace(/^(\*|-|\d+[.)])\s*/, '');
  line = line.replace(/^subject\s*:\s*/i, '');
  line = line.replace(/^["'“”]+|["'“”]+$/g, '');
  return line.trim();
};

// Strip a chatty intro line and any leading "Subject:" line from email bodies
const cleanContent = (text) => {
  if (!text) return text;
  let cleaned = text.trim();
  cleaned = cleaned.replace(/^(okay|sure|here|certainly|of course)[^\n]*:\s*\n+/i, '');
  cleaned = cleaned.replace(/^subject\s*:[^\n]*\n+/i, '');
  // drop lines that are nothing but a bracketed placeholder, e.g. "[Link to Sale]"
  cleaned = cleaned
    .split('\n')
    .filter(line => !/^\s*\[[^\]]+\]\s*$/.test(line))
    .join('\n');
  // strip inline placeholders like "shop now: [Link to Sale Page]" (keep {{mergeTags}})
  cleaned = cleaned
    .replace(/[ \t]*:?[ \t]*\[[A-Z][^\]\n]*\]/g, '')
    .replace(/[ \t]+([.!?,])/g, '$1')
    .replace(/\n{3,}/g, '\n\n');
  return cleaned.trim();
};

const generateSubject = async (topic) => {
  const messages = [
    { role: "system", content: "You write email subject lines. Reply with exactly ONE subject line and nothing else — no introduction, no list, no quotes, no explanation." },
    { role: "user", content: `Write a short, catchy email subject about: ${topic}` }
  ];
  const result = await queryModel(messages, 40);
  return cleanSubject(result);
}

// Convert plain text into simple HTML paragraphs for the email editor
const textToHtml = (text) =>
  text
    .split(/\n{2,}/)
    .map(p => `<p>${p.trim().replace(/\n/g, '<br/>')}</p>`)
    .join('\n');

const generateContent = async (topic) => {
  const messages = [
    {
      role: "system",
      content: [
        "You write complete, ready-to-send marketing email bodies.",
        "Rules:",
        "- Reply with ONLY the email body text — no subject line, no notes or explanations.",
        "- Output plain text, no HTML or markdown.",
        "- NEVER use square-bracket placeholders like [Name], [Date], [Discount], [Link] — the email must be complete as written.",
        "- Greet the reader with exactly: Hi {{firstName}},",
        "- Only mention specific numbers, dates or links if they appear in the topic; otherwise write naturally without them.",
        "- Sign off as: The MailFlow Team",
      ].join('\n')
    },
    { role: "user", content: `Write a professional marketing email about: ${topic}` }
  ];
  const result = await queryModel(messages, 300);
  const text = cleanContent(result);
  return { text, html: textToHtml(text) };
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