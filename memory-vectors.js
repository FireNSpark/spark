// === memory-vectors.js ===

const VECTOR_MEMORY_KEY = 'sparkVectorMemory';
const EMBEDDING_MODEL = 'text-embedding-3-small';
const EMBEDDING_ENDPOINT = 'https://api.openai.com/v1/embeddings';

const vectorMemory = {
  memory: [],

  async embed(text) {
    try {
      const res = await fetch(EMBEDDING_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          input: text,
          model: EMBEDDING_MODEL
        })
      });

      const json = await res.json();
      return json.data?.[0]?.embedding || [];
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
    localStorage.setItem(VECTOR_MEMORY_KEY, JSON.stringify(this.memory));
  },

  load() {
    try {
      const data = localStorage.getItem(VECTOR_MEMORY_KEY);
      if (data) this.memory = JSON.parse(data);
    } catch (e) {
      console.warn('⚠️ Failed to load vector memory:', e);
    }
  }
};

// Load on boot
vectorMemory.load();

// Optional global export
window.vectorMemory = vectorMemory;

export default vectorMemory;
