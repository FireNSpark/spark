// === api/voice.js ===

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'Missing text' });

  try {
    const response = await fetch("https://api.elevenlabs.io/v1/text-to-speech/ijdvK10rhhVda9QPsfHN/stream", {
      method: "POST",
      headers: {
        "xi-api-key": process.env.ELEVENLABS_API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_monolingual_v1",
        voice_settings: { stability: 0.4, similarity_boost: 0.8 }
      })
    });

    if (!response.ok) throw new Error("Voice API error");
    const buffer = await response.arrayBuffer();

    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Content-Disposition", "inline; filename=voice.mp3");
    res.status(200).send(Buffer.from(buffer));
  } catch (err) {
    console.error("🎤 Voice generation failed:", err);
    res.status(500).json({ error: 'Voice generation failed' });
  }
}
