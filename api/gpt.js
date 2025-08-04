// /api/gpt.js — Vercel Serverless Function

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message, history = [] } = req.body;
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

  if (!OPENAI_API_KEY) {
    return res.status(500).json({ error: 'Missing OpenAI API key' });
  }

  try {
    const gptRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          ...history.slice(-10),
          { role: 'user', content: message }
        ],
        temperature: 0.8
      })
    });

    const data = await gptRes.json();
    const reply = data.choices?.[0]?.message?.content || 'GPT returned no content.';

    res.status(200).json({ reply });
  } catch (err) {
    console.error('GPT API error:', err);
    res.status(500).json({ error: 'Failed to fetch GPT response' });
  }
}
