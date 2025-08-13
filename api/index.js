// यह Vercel Serverless Function का कोड है जो Hugging Face AI से बात करेगा।

const HF_TOKEN = process.env.HF_TOKEN;

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
      'https://router.huggingface.co/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${HF_TOKEN}`,
        },
        body: JSON.stringify({
          model: 'openai/gpt-oss-20b:fireworks-ai',
          messages: [{ role: 'user', content: prompt }],
        }),
      }
    );

    const data = await response.json();

    // Hugging Face से मिले जवाब को वापस भेजें
    if (data && data.choices && data.choices.length > 0) {
      res.status(200).json({
        candidates: [{
          content: {
            parts: [{ text: data.choices[0].message.content }]
          }
        }]
      });
    } else {
      console.error('Error with Hugging Face API:', data);
      res.status(500).json({ error: 'Failed to get a valid response from AI.' });
    }
  } catch (error) {
    console.error('Error with Hugging Face API:', error);
    res.status(500).json({ error: 'Failed to get response from AI.' });
  }
}
