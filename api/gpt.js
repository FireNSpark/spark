// === api/gpt.js ===

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { message } = req.body;

    const GIST_ID = process.env.GIST_ID;
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    const FILENAME = 'spark-memory.json';

    console.log("🔧 ENV CHECK:", {
      GIST_ID: !!GIST_ID,
      GITHUB_TOKEN: !!GITHUB_TOKEN,
      OPENAI_API_KEY: !!OPENAI_API_KEY
    });

    if (!GIST_ID || !GITHUB_TOKEN || !OPENAI_API_KEY || !message) {
      return res.status(400).json({
        error: 'Missing required environment variables or input',
        env: {
          GIST_ID: !!GIST_ID,
          GITHUB_TOKEN: !!GITHUB_TOKEN,
          OPENAI_API_KEY: !!OPENAI_API_KEY
        },
        input: { messagePresent: !!message }
      });
    }

    const testPayload = {
      model: "gpt-3.5-turbo",
      messages: [
        { role: "user", content: "Hello, what's your name?" }
      ]
    };

    console.log("📤 SENDING TO GPT:", JSON.stringify(testPayload));

    const completion = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + OPENAI_API_KEY
      },
      body: JSON.stringify(testPayload)
    });

    console.log("📡 GPT Response Status:", completion.status);
    console.log("📬 GPT Headers:", [...completion.headers.entries()]);

    const raw = await completion.text();
    console.log("📥 RAW COMPLETION TEXT:", raw);

    let data;
    try {
      data = JSON.parse(raw);
    } catch (e) {
      console.error("❌ GPT JSON parse failed:", e);
      return res.status(500).json({ error: "Non-JSON GPT response", raw });
    }

    if (!completion.ok) {
      return res.status(500).json({ error: "GPT error", details: data });
    }

    const reply = (data.choices?.[0]?.message?.content) || '[No reply]';

    return res.status(200).json({ reply });
  } catch (err) {
    console.error("🔥 GPT Memory Fatal Error:", err);
    return res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
}
