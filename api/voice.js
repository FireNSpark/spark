// === /api/voice.js ===

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { text } = req.body;
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const voiceId = "ijdvK10rhhVda9QPsfHN";

  console.log("🧪 ELEVENLABS TEST:", { hasText: !!text, hasKey: !!apiKey });

  if (!apiKey || !text) {
    return res.status(400).json({ error: 'Missing API key or input text.' });
  }

  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        voice_settings: { stability: 0.3, similarity_boost: 0.75 }
      }),
    });

    console.log("📡 Eleven Response Status:", response.status);
    const contentType = response.headers.get("content-type");
    console.log("📼 Content-Type:", contentType);

    if (!response.ok || !contentType.includes("audio")) {
      const errorText = await response.text();
      console.error("❌ Eleven API Error:", errorText);
      return res.status(500).json({ error: "Voice generation failed", details: errorText });
    }

    const audio = await response.arrayBuffer();
    res.setHeader("Content-Type", "audio/mpeg");
    res.send(Buffer.from(audio));
  } catch (err) {
    console.error("💥 Voice Handler Crash:", err);
    res.status(500).json({ error: "Unexpected error", message: err.message });
  }
}
