// यह Vercel Serverless Function का कोड है जो AI से बात करेगा।

// अपनी Gemini API Key को यहाँ डालें
const GEMINI_API_KEY = 'AIzaSyBz0px2V7HfS0TYVdsvXrlIPDTcpOrK2MM';

export default async function handler(req, res) {
  // सिर्फ POST रिक्वेस्ट स्वीकार करें
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required in the request body.' });
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    const data = await response.json();

    // AI से मिले जवाब को वापस भेजें
    res.status(200).json(data);
  } catch (error) {
    console.error('Error with Gemini API:', error);
    res.status(500).json({ error: 'Failed to get response from AI.' });
  }
}
