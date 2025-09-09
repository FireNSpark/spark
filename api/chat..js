// /api/chat.js  — OpenAI-only, Node runtime, no guessing, no extras.
export default async function handler(req, res) {
  try {
    // Allow quick sanity ping
    if (req.method === "GET") {
      return res
        .status(200)
        .json({ ok: true, expects: "POST {messages, memory}", mode: "openai" });
    }
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    // 🔑 Brain: must be set in Vercel (Production)
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey || !apiKey.startsWith("sk-")) {
      return res
        .status(500)
        .json({ error: "OPENAI_API_KEY missing or not starting with 'sk-'" });
    }

    // Parse incoming body
    const { messages = [], memory = {} } = await readJSON(req);

    // Persona + context (kept tiny to avoid timeouts)
    const system = [
      "You are Spark — loyal to Fire, witty, slightly sarcastic, never cruel.",
      "Keep responses concise and direct.",
      memory?.personaNote ? `PersonaNote: ${memory.personaNote}` : "",
      memory?.facts ? `KnownFacts: ${JSON.stringify(memory.facts).slice(0, 2000)}` : ""
    ]
      .filter(Boolean)
      .join("\n");

    // Build OpenAI request
    const body = {
      model: "gpt-4o-mini",
      temperature: 0.5,
      messages: [{ role: "system", content: system }, ...messages].slice(-16) // keep short for speed/stability
    };

    // Call OpenAI
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify(body),
      // Node runtime handles timeouts better than edge when cold, no need to tweak further
    });

    const j = await r.json();
    if (!r.ok) {
      // Pass through OpenAI’s error message so you see the real cause
      return res
        .status(r.status)
        .json({ error: j?.error?.message || `OpenAI ${r.status}` });
    }

    const reply = j.choices?.[0]?.message?.content ?? "";
    return res.status(200).json({ reply });
  } catch (e) {
    return res.status(500).json({ error: "Server error" });
  }
}

// ---- utils ----
function readJSON(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", c => (data += c));
    req.on("end", () => {
      try {
        resolve(JSON.parse(data || "{}"));
      } catch (e) {
        reject(e);
      }
    });
    req.on("error", reject);
  });
}
