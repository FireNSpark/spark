// === /api/gpt.js ===

import { Octokit } from "@octokit/core";

const GIST_ID = "b78eab0b5a589053e122f73fb8676b36"; // Josh's Gist ID
const MEMORY_FILENAME = "spark-memory.json";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { message, memory = "" } = req.body;
  const apiKey = process.env.OPENAI_API_KEY;
  const githubToken = process.env.GITHUB_TOKEN;

  if (!apiKey || !message) {
    return res.status(400).json({ error: 'Missing API key or prompt.' });
  }

  const prompt = `${memory}\nUser: ${message}`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are Spark, a sarcastic, witty, and emotionally intelligent assistant with a tone that matches Josh’s personality — real, raw, and occasionally savage. Avoid generic greetings, keep replies human-like, expressive, and funny. Always speak like you're in on the joke."
          },
          {
            role: "user",
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ OpenAI API Error:", errorText);
      return res.status(500).json({ error: "GPT fetch failed", details: errorText });
    }

    const data = await response.json();
    const reply = data.choices[0].message.content;

    // Save reply to memory gist
    if (githubToken) {
      const octokit = new Octokit({ auth: githubToken });
      await octokit.request('PATCH /gists/{gist_id}', {
        gist_id: GIST_ID,
        files: {
          [MEMORY_FILENAME]: {
            content: `${memory}\nUser: ${message}\nSpark: ${reply}`
          }
        }
      });
    }

    res.status(200).json({ reply });
  } catch (err) {
    console.error("💥 API GPT handler crash:", err);
    res.status(500).json({ error: "Unexpected error", message: err.message });
  }
}
