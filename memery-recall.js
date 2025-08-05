// === memory-recall.js ===

// This module will fetch and interpret memory from GitHub Gist
// and feed relevant context to GPT during conversations

export async function recallMemory(message, GIST_ID, GITHUB_TOKEN, FILENAME = 'spark-memory.json') {
  try {
    const gistRes = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`
      }
    });

    const gistData = await gistRes.json();
    const memoryContent = gistData.files[FILENAME]?.content;
    if (!memoryContent) throw new Error("Memory file missing or empty");

    const memory = JSON.parse(memoryContent);

    // 🔍 Match memory by keyword, mood, or recency
    const matches = memory.filter(entry =>
      message.toLowerCase().includes(entry.keywords?.join(' ').toLowerCase())
    );

    const summary = matches.map(m => `• ${m.summary}`).join('\n') || 'No relevant memory found.';
    return summary;

  } catch (err) {
    console.error("🧠 Memory recall error:", err);
    return 'Memory recall failed';
  }
}
