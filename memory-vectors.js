const vectorMemory = {
  memory: [],

  async embed(text) {
    try {
      const res = await fetch('/api/embed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: text })
      });

      const json = await res.json();
      return json.embedding || [];
    } catch (e) {
      console.warn('⚠️ Embedding failed:', e);
      return [];
    }
  },
  ...
};
