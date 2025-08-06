// === /api/gpt.js ===

import { Octokit } from "@octokit/core";

const GIST_ID = process.env.GIST_ID; // moved to env for security
const MEMORY_FILENAME = "spark-memory.json";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).end();

  let message = "";
  let memory = "";
  try {
    const body = req.body || {};
    message = body.message || "";
    memory = body.memory || "";
  } catch (parseError) {
    console.error("📛 Failed to parse body:", parseError);
    return res.status(400).json({ error: "Invalid JSON input" });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  const githubToken = process.env.GITHUB_TOKEN;

  if (!apiKey || !message.trim()) {
    return res.status(400).json({ error: "Missing API key or prompt." });
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
      console.error("❌ OpenAI API Error:", response.status, errorText);
      return res.status(500).json({ error: "GPT fetch failed", details: errorText });
    }

    const data = await response.json();

    if (!data.choices || !data.choices.length) {
      console.error("📛 No choices returned from OpenAI:", data);
      return res.status(500).json({ error: "No response from OpenAI" });
    }

    const reply = data.choices[0].message.content;

    // Save reply to memory gist
    if (githubToken && GIST_ID) {
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
