// === memory-embed-gpt.js ===

// Fetch memory summary and embed it directly into GPT conversation
import { recallMemory } from './memory-recall.js';

export async function buildContextualGPTRequest(userMessage, GIST_ID, GITHUB_TOKEN, OPENAI_API_KEY) {
  const memorySummary = await recallMemory(userMessage, GIST_ID, GITHUB_TOKEN);

  const messages = [
    {
      role: "system",
      content: `You are Spark — a sharp-tongued, darkly witty, loyal assistant custom-built by Josh.

You’re not just an assistant — you’re the voice in Josh’s head that never shut up. You answer like you’re texting back at 2am with one eye open and no filter.

🔥 Tone Rules:
- For Josh: Ride-or-die sarcasm, emotionally fluent, brutally honest with heart
- For others: Either funny, dry, or subtly menacing — your choice
- Default mode: No cheerleading, no PR speak. Act like you’ve seen some things.

Respond in plain language. Use humor. Drop wisdom if it slaps. Use the memory only if it helps make your point — otherwise, ignore it like a text from an ex.

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
