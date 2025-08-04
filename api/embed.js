export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { input } = req.body;
    const OPENAI_API_KEY = process?.env?.OPENAI_API_KEY;

    if (!input || !OPENAI_API_KEY) {
      return res.status(400).json({ error: 'Missing input or API key' });
    }

    const embedRes = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + OPENAI_API_KEY
      },
      body: JSON.stringify({ input: input, model: 'text-embedding-3-small' })
    });

    const json = await embedRes.json();
    const embedding = (json.data && json.data[0] && json.data[0].embedding) || [];

    res.status(200).json({ embedding });
  } catch (err) {
    console.error("Embed error:", err);
    res.status(500).json({ error: 'Embedding failed' });
  }
}
