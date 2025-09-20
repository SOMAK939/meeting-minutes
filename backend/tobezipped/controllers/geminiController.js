require('dotenv').config();
const fetch = require('node-fetch'); // ensure this is installed: npm install node-fetch

const summarizeTranscript = async (req, res) => {
  const { url } = req.body;

  if (!url) return res.status(400).json({ message: 'Transcript URL required' });

  try {
    // Step 1: Fetch transcript JSON from pre-signed URL
    const response = await fetch(url);
    const data = await response.json();

    const transcriptText = data?.results?.transcripts?.[0]?.transcript;

    if (!transcriptText) {
      return res.status(400).json({ message: 'Transcript is empty' });
    }

    // Step 2: Compose prompt
    const geminiPrompt = `Here is the meeting transcript:\n\n${transcriptText}\n\nPlease provide:
1. A concise summary
2. A list of action items
3. Key decisions made`;

    // Step 3: Call Gemini REST API (v1) with gemini-pro
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: geminiPrompt }]
            }
          ]
        })
      }
    );

    const result = await geminiResponse.json();

    if (!geminiResponse.ok) {
      console.error('❌ Gemini Error:', result);
      return res.status(500).json({ message: result.error?.message || 'Gemini API error' });
    }

    const summary = result.candidates?.[0]?.content?.parts?.[0]?.text || 'No response from Gemini.';
    res.status(200).json({ summary });

  } catch (err) {
    console.error('Gemini Error:', err);
    res.status(500).json({ message: 'Error processing transcript' });
  }
};

module.exports = { summarizeTranscript };
