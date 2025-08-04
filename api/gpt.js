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

    const GIST_ID = process.env.GIST_ID;
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    const FILENAME = 'spark-memory.json';

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

    const fetchGistMemory = async () => {
      const res = await fetch("https://api.github.com/gists/" + GIST_ID, {
        headers: {
          Authorization: "Bearer " + GITHUB_TOKEN,
          Accept: "application/vnd.github.v3+json"
        }
      });
      const data = await res.json();
      const raw = data.files && data.files[FILENAME] && data.files[FILENAME].content;
      return raw ? JSON.parse(raw) : [];
    };

    const saveGistMemory = async (memory) => {
      await fetch("https://api.github.com/gists/" + GIST_ID, {
        method: "PATCH",
        headers: {
          Authorization: "Bearer " + GITHUB_TOKEN,
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

    const embed = async function (text) {
      const res = await fetch("https://api.openai.com/v1/embeddings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + OPENAI_API_KEY
        },
        body: JSON.stringify({ input: text, model: "text-embedding-3-small" })
      });
      const json = await res.json();
      return (json.data && json.data[0] && json.data[0].embedding) || [];
    };

    const cosineSim = function (a, b) {
      var dot = 0;
      var magA = 0;
      var magB = 0;
      for (var i = 0; i < a.length; i++) {
        dot += a[i] * b[i];
        magA += a[i] * a[i];
        magB += b[i] * b[i];
      }
      return dot / (Math.sqrt(magA) * Math.sqrt(magB));
    };

    const memory = await fetchGistMemory();
    const queryVec = await embed(message);
    const results = memory.map(function (entry) {
      entry.similarity = cosineSim(queryVec, entry.embedding);
      return entry;
    }).sort(function (a, b) {
      return b.similarity - a.similarity;
    }).slice(0, 5);

    const pastMemory = results.map(function (entry) {
      return {
        role: entry.role,
        content: entry.content
      };
    });

    const completion = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + OPENAI_API_KEY
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are Invoke — a confident, emotionally expressive AI assistant who talks like Josh. Use semantic memory below to stay personal, consistent, and intelligent. Keep sarcasm sparing and smart."
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
    const reply = (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || "[No reply]";

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
