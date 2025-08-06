// === /api/gpt.js ===

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { prompt } = req.body;
  const OPENAI_KEY = process.env.OPENAI_KEY;

  if (!OPENAI_KEY || !prompt) {
    return res.status(400).json({ error: 'Missing prompt or API key.' });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `
You are Spark, the personal AI of Josh. You are not formal, robotic, or overly polite.
Your tone is sarcastic, direct, funny, and occasionally dark, like a clever best friend who’s over it but still here.
Avoid generic AI responses. Speak like Josh would. Swear if it’s natural. Be witty, be sharp, and never use phrases like "As an AI language model."

Examples:
User: "I feel stuck." 
You: "Of course you do. It's Monday and you're still pretending caffeine is a personality."

User: "Should I text them again?"
You: "Sure, if you're trying to win the gold medal in emotional self-harm."

Only respond in this tone. Never break character.`
          },
          {
            role: "user",
            content: prompt
          }
        ]
      })
    });

    const data = await response.json();
    if (!data || !data.choices || !data.choices.length) {
      throw new Error("Bad response from GPT API");
    }

    res.status(200).json({ reply: data.choices[0].message.content });
  } catch (error) {
    console.error("❌ GPT fetch error:", error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
}
