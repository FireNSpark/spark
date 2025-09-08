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

    const useAzure = String(process.env.USE_AZURE || "").trim() === "1";

    const reply = useAzure
      ? await chatAzure(system, messages)
      : await chatOpenAI(system, messages);

    return res.status(200).json({ reply });
  } catch (e) {
    console.error("CHAT_ERROR", e);
    return res.status(500).json({ error: "Server error" });
  }
}

/* ---------- OpenAI (standard, sk- keys) ---------- */
async function chatOpenAI(system, messages) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("Missing OPENAI_API_KEY");
  // Expect a key that looks like: sk-********
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
    throw new Error(j?.error?.message || `OpenAI ${r.status}`);
  }
  return j.choices?.[0]?.message?.content ?? "";
}

/* ---------- Azure OpenAI (non-sk keys) ---------- */
async function chatAzure(system, messages) {
  const endpoint   = process.env.AZURE_OPENAI_ENDPOINT;      // https://<resource>.openai.azure.com
  const deployment = process.env.AZURE_OPENAI_DEPLOYMENT;     // your model deployment name
  const apiVersion = process.env.AZURE_OPENAI_API_VERSION || "2024-06-01";
  const apiKey     = process.env.OPENAI_API_KEY;              // Azure key

  if (!endpoint || !deployment || !apiKey) {
    throw new Error("Azure envs missing (AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_DEPLOYMENT, OPENAI_API_KEY)");
  }

  const body = { messages: [{ role: "system", content: system }, ...messages], temperature: 0.6 };
  const url  = `${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`;

  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type":"application/json", "api-key": apiKey },
    body: JSON.stringify(body)
  });
  const j = await r.json();
  if (!r.ok) {
    console.error("AZURE_OPENAI_ERROR", j);
    throw new Error(j?.error?.message || `Azure ${r.status}`);
  }
  return j.choices?.[0]?.message?.content ?? "";
}

function readJSON(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", c => (data += c));
    req.on("end", () => { try { resolve(JSON.parse(data || "{}")); } catch (e) { reject(e); } });
    req.on("error", reject);
  });
}
