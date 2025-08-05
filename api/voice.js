// === /api/voice.js ===

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { text } = req.body;
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const voiceId = "EXAVITQu4vr4xnSDxMaL"; // fallback public voice ID for debug

  console.log("🔑 ELEVENLABS_API_KEY present:", !!apiKey);
  console.log("📝 Incoming text:", text);

  if (!apiKey || !text) {
    return res.status(400).json({ error: 'Missing API key or input text.' });
  }

  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
        "Accept": "audio/mpeg"
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.45,
          similarity_boost: 0.8,
          style: 0.6,
          use_speaker_boost: true
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ ElevenLabs API Error:", errorText);
      return res.status(500).json({ error: "Voice generation failed", details: errorText });
    }

    const audio = await response.arrayBuffer();
    res.setHeader("Content-Type", "audio/mpeg");
    res.send(Buffer.from(audio));

  } catch (err) {
    console.error("💥 API voice handler crash:", err);
    res.status(500).json({ error: "Unexpected error", message: err.message });
  }
}
