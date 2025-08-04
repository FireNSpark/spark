// === api/gpt.js ===

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_API_KEY) return res.status(400).json({ error: 'Missing OPENAI_API_KEY' });

  try {
    const completion = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + OPENAI_API_KEY
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: "Say something fun and test-worthy." }
        ]
      })
    });

    const data = await completion.json();
    console.log("🧠 RAW GPT RESPONSE:", data);

    const reply = (data.choices?.[0]?.message?.content) || '[No reply]';
    return res.status(200).json({ reply });
  } catch (err) {
    console.error("GPT Test Error:", err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
