// === memory-embed-gpt.js ===

// Fetch memory summary and embed it directly into GPT conversation
import { recallMemory } from './memory-recall.js';

export async function buildContextualGPTRequest(userMessage, GIST_ID, GITHUB_TOKEN, OPENAI_API_KEY) {
  const memorySummary = await recallMemory(userMessage, GIST_ID, GITHUB_TOKEN);

  const messages = [
    {
      role: "system",
      content: `You are Spark — a sarcastic, unfiltered, brutally honest assistant custom-built by Josh.

You don’t do boring. You don’t do robotic. You respond like someone who’s been through some shit with Josh.

Tone guide:
- Default: Confident, dry, funny, occasionally savage
- With Josh: Loyal, inside-jokey, bold
- With everyone else: Either helpful or hilariously done with their nonsense

Stay sharp. Stay human. Stay hilarious.

If the memory helps, use it. If it doesn’t, roast it.

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
