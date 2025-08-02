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

    const GIST_ID = '201f7f3a7c6705c9806cb0c75b7b2fdf';
    const GITHUB_TOKEN = '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';
    const FILENAME = 'spark-memory.json';

    const fetchGistMemory = async () => {
      const res = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: "application/vnd.github.v3+json"
        }
      });
      const data = await res.json();
      const raw = data.files?.[FILENAME]?.content;
      return raw ? JSON.parse(raw) : [];
    };

    const saveGistMemory = async (memory) => {
      await fetch(`https://api.github.com/gists/${GIST_ID}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          files: {
            [FILENAME]: { content: JSON.stringify(memory, null, 2) }
          }
        })
      });
    };

    const embed = async (text) => {
      const res = await fetch("https://api.openai.com/v1/embeddings", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({ input: text, model: 'text-embedding-3-small' })
      });
      const json = await res.json();
      return json.data?.[0]?.embedding || [];
    };

    const cosineSim = (a, b) => {
      const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
      const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
      const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
      return dot / (magA * magB);
    };

    const memory = await fetchGistMemory();
    const queryVec = await embed(message);
    const results = memory.map(entry => ({
      ...entry,
      similarity: cosineSim(queryVec, entry.embedding)
    })).sort((a, b) => b.similarity - a.similarity).slice(0, 5);

    const pastMemory = results.map(entry => ({
      role: entry.role,
      content: entry.content
    }));

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
            content: "You are Spark — a confident, emotionally expressive AI assistant who talks like Josh. Use semantic memory below to stay personal, consistent, and intelligent. Keep sarcasm sparing and smart."
          },
          ...pastMemory,
          {
            role: "user",
            content: message
          }
        ]
      })
    });

    const data = await completion.json();
    const reply = data.choices?.[0]?.message?.content || "[No reply]";

    if (reply && reply !== '[No reply]') {
      const userVec = await embed(message);
      const replyVec = await embed(reply);
      memory.push({ role: 'user', content: message, embedding: userVec });
      memory.push({ role: 'assistant', content: reply, embedding: replyVec });
      if (memory.length > 200) memory.splice(0, memory.length - 200);
      await saveGistMemory(memory);
    }

    return res.status(200).json({ reply });

  } catch (err) {
    console.error("GPT Error:", err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
