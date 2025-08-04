// === sparkcore.js ===

// This version is safe for client-side use — no export/import syntax.
// It creates a global `sparkMemory` object that can be called from the DOM.

const OPENAI_API_KEY = localStorage.getItem("OPENAI_API_KEY") || "";

window.sparkMemory = {
  memory: [],

  async embed(text) {
    try {
      if (!OPENAI_API_KEY) throw new Error("Missing API Key");
      const res = await fetch("https://api.openai.com/v1/embeddings", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + OPENAI_API_KEY
        },
        body: JSON.stringify({ input: text, model: 'text-embedding-3-small' })
      });
      const json = await res.json();
      return (json.data && json.data[0] && json.data[0].embedding) || [];
    } catch (e) {
      console.warn('⚠️ Embedding failed:', e);
      return [];
    }
  },

  cosineSim(a, b) {
    const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dot / (magA * magB);
  },

  async add(role, content) {
    const embedding = await this.embed(content);
    this.memory.push({ role, content, embedding, time: Date.now() });
    if (this.memory.length > 200) this.memory.shift();
    this.save();
  },

  async searchRelevant(query, topN = 5) {
    const queryVector = await this.embed(query);
    const results = this.memory.map(entry => ({
      ...entry,
      similarity: this.cosineSim(queryVector, entry.embedding)
    }));
    return results.sort((a, b) => b.similarity - a.similarity).slice(0, topN);
  },

  save() {
    localStorage.setItem('sparkVectorMemory', JSON.stringify(this.memory));
  },

  load() {
    try {
      const data = localStorage.getItem('sparkVectorMemory');
      if (data) this.memory = JSON.parse(data);
    } catch (e) {
      console.warn('⚠️ Failed to load vector memory:', e);
    }
  }
};

// Boot memory on page load
window.sparkMemory.load();
