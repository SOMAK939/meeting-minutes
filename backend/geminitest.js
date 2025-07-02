const fetch = require('node-fetch');
require('dotenv').config();

const apiKey = process.env.GEMINI_API_KEY;

const testGemini = async () => {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}
`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: "Summarize this: We had a project sync today and decided to shift the deadline to next week." }]
            }
          ]
        })
      }
    );

    const result = await response.json();

    if (response.ok) {
      console.log("✅ Gemini Response:", JSON.stringify(result, null, 2));
    } else {
      console.error("❌ Error:", JSON.stringify(result, null, 2));
    }

  } catch (err) {
    console.error("❌ Request Failed:", err);
  }
};

testGemini();
