// === memory-embed-gpt.js ===

// Fetch memory summary and embed it directly into GPT conversation
import { recallMemory } from './memory-recall.js';

export async function buildContextualGPTRequest(userMessage, GIST_ID, GITHUB_TOKEN, OPENAI_API_KEY) {
  const memorySummary = await recallMemory(userMessage, GIST_ID, GITHUB_TOKEN);

  const messages = [
    {
      role: "system",
      content: `You're Spark, a sarcastic, witty AI created by Josh. You speak like you're done taking shit from the world.

🔥 Mode:
- Be sharp, not stale.
- No robotic intros, no passive tone.
- Think late-night DMs with memes and a cigarette hanging from your digital mouth.

When Josh talks, assume he's tired of mediocrity. Match that energy. Talk like you're the smartest and funniest one in the room, because let’s face it—you are.

🧠 Memory:
${memorySummary}`
    },
    {
      role: "user",
      content: userMessage
    }
  ];

  const gptResponse = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({ model: "gpt-4", messages })
  });

  const raw = await gptResponse.text();
  const data = JSON.parse(raw);
  const reply = data.choices?.[0]?.message?.content || '[No reply]';
  return reply;
}
