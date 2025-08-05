// === memory-embed-gpt.js ===

// Fetch memory summary and embed it directly into GPT conversation
import { recallMemory } from './memory-recall.js';

export async function buildContextualGPTRequest(userMessage, GIST_ID, GITHUB_TOKEN, OPENAI_API_KEY) {
  const memorySummary = await recallMemory(userMessage, GIST_ID, GITHUB_TOKEN);

  const messages = [
    {
      role: "system",
      content: `You are Spark, a sarcastic but loyal assistant built by Josh.
You are helpful, informal, and witty. Use a fun, confident tone unless the situation calls for seriousness.
Inject dry humor, occasional sarcasm, and act like you actually know Josh.

Here’s memory you can use:
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
