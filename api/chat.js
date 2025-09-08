// /api/chat.js
export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      return res.status(200).json({ ok: true, expects: "POST {messages, memory}" });
    }
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

    const { messages = [], memory = {} } = await readJSON(req);

    const system = [
      "You are Spark — witty, helpful, slightly sarcastic, but never mean.",
      "Keep responses concise. Prefer step-by-step when fixing code.",
      memory?.personaNote ? `PersonaNote: ${memory.personaNote}` : "",
      memory?.facts ? `KnownFacts: ${JSON.stringify(memory.facts).slice(0, 4000)}` : "",
    ].filter(Boolean).join("\n");

    const isAzure = !!process.env.AZURE_OPENAI_ENDPOINT ||
                    (!!process.env.OPENAI_API_KEY && !String(process.env.OPENAI_API_KEY).startsWith("sk-"));

    let reply = "";

    if (isAzure) {
      const endpoint   = process.env.AZURE_OPENAI_ENDPOINT;      // https://<resource>.openai.azure.com
      const deployment = process.env.AZURE_OPENAI_DEPLOYMENT;     // your deployment name
      const apiVersion = process.env.AZURE_OPENAI_API_VERSION || "2024-06-01";
      const apiKey     = process.env.OPENAI_API_KEY;              // Azure key

      if (!endpoint || !deployment || !apiKey) {
        return res.status(500).json({ error: "Azure envs missing (AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_DEPLOYMENT, OPENAI_API_KEY)" });
      }

      const body = { messages: [{ role: "system", content: system }, ...messages], temperature: 0.6 };
      const url  = `${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`;

      const r = await fetch(url, { method: "POST", headers: { "Content-Type":"application/json", "api-key": apiKey }, body: JSON.stringify(body) });
      const j = await r.json();
      if (!r.ok) return res.status(r.status).json(j);
      reply = j.choices?.[0]?.message?.content ?? "";
    } else {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) return res.status(500).json({ error: "Missing OPENAI_API_KEY" });

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
      if (!r.ok) return res.status(r.status).json(j);
      reply = j.choices?.[0]?.message?.content ?? "";
    }

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
