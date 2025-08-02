// === api/gpt.js ===

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message } = req.body;

    const completion = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are Spark — a confident, emotionally expressive AI assistant who talks like Josh. Be bold, real, and reactive. Use sarcasm sparingly and only when it enhances clarity or humor."
          },
          {
            role: "user",
            content: message
          }
        ]
      })
    });

    const data = await completion.json();
    const reply = data.choices?.[0]?.message?.content || "[No reply]";

    return res.status(200).json({ reply });

  } catch (err) {
    console.error("GPT Error:", err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
