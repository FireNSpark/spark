// /api/chat.js
export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      return res.status(200).json({ ok: true, expects: "POST {messages, memory}", mode: "openai" });
    }
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "Missing OPENAI_API_KEY" });
    if (!apiKey.startsWith("sk-")) return res.status(500).json({ error: "OPENAI_API_KEY must start with 'sk-'" });

    const { messages = [], memory = {} } = await readJSON(req);

    const system = [
      "You are Spark — witty, helpful, slightly sarcastic, but never mean.",
      "Keep responses concise. Prefer step-by-step when fixing code.",
      memory?.personaNote ? `PersonaNote: ${memory.personaNote}` : "",
      memory?.facts ? `KnownFacts: ${JSON.stringify(memory.facts).slice(0, 4000)}` : "",
    ].filter(Boolean).join("\n");

    const body = {
      model: "gpt-4o-mini",
      temperature: 0.6,
      messages: [{ role: "system", content: system }, ...messages]
    };

    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
      body: JSON.stringify(body),
    });
    const j = await r.json();
    if (!r.ok) {
      console.error("OPENAI_ERROR", j);
      return res.status(r.status).json({ error: j?.error?.message || `OpenAI ${r.status}` });
    }

    const reply = j.choices?.[0]?.message?.content ?? "";
    return res.status(200).json({ reply });
  } catch (e) {
    console.error("CHAT_ERROR", e);
    return res.status(500).json({ error: "Server error" });
  }
}

function readJSON(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", c => (data += c));
    req.on("end", () => { try { resolve(JSON.parse(data || "{}")); } catch (e) { reject(e); } });
    req.on("error", reject);
  });
}
