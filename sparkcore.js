const sparkCore = {
  name: "Spark",
  version: "v0.1",
  status: "booting",
  mode: "default",
  voice: true,
  memoryEnabled: true,
  avatarVisible: true,
  pulseActive: false,
  ritualsEnabled: false,
  systemLog: [],

  log(event) {
    const timestamp = new Date().toISOString();
    const entry = `[${timestamp}] ${event}`;
    sparkCore.systemLog.push(entry);
    console.log(entry);
  },

  toggle(key) {
    if (key in sparkCore) {
      sparkCore[key] = !sparkCore[key];
      sparkCore.log(`Toggled ${key} to ${sparkCore[key]}`);
    }
  },

  updateStatus(newStatus) {
    sparkCore.status = newStatus;
    sparkCore.log(`Status changed to ${newStatus}`);
  },

  identify() {
    return `${sparkCore.name} [${sparkCore.version}] - Mode: ${sparkCore.mode}`;
  },

  async respondWithSpark(message) {
    sparkCore.log(`💬 User: ${message}`);

    const embed = async (text) => {
      const res = await fetch("https://api.openai.com/v1/embeddings", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({ input: text, model: 'text-embedding-3-small' })
      });
      const json = await res.json();
      return json.data?.[0]?.embedding || [];
    };

    const cosineSim = (a, b) => {
      const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
      const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
      const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
      return dot / (magA * magB);
    };

    const memoryKey = 'sparkVectorMemory';
    const loadMemory = () => JSON.parse(localStorage.getItem(memoryKey) || '[]');
    const saveMemory = (m) => localStorage.setItem(memoryKey, JSON.stringify(m));
    const memory = loadMemory();

    const queryVec = await embed(message);
    const relevant = memory.map(entry => ({
      ...entry,
      similarity: cosineSim(queryVec, entry.embedding)
    })).sort((a, b) => b.similarity - a.similarity).slice(0, 5);

    const pastMemory = relevant.map(entry => ({ role: entry.role, content: entry.content }));

    const chat = await fetch("https://api.openai.com/v1/chat/completions", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: "You are Spark — emotionally expressive, confident, sarcastic but not overbearing. Speak like Josh. React to tone with avatar." },
          ...pastMemory,
          { role: 'user', content: message }
        ]
      })
    });

    const data = await chat.json();
    const reply = data.choices?.[0]?.message?.content || "[no reply]";

    // Store in memory
    const userVec = await embed(message);
    const replyVec = await embed(reply);
    memory.push({ role: 'user', content: message, embedding: userVec });
    memory.push({ role: 'assistant', content: reply, embedding: replyVec });
    if (memory.length > 200) memory.splice(0, memory.length - 200);
    saveMemory(memory);

    // Apply expression + voice
    if (window.sparkExpression) sparkExpression.applyExpression(reply);
    if (sparkCore.voice && typeof speakText === 'function') speakText(reply);

    sparkCore.log(`🗣️ Spark: ${reply}`);
    return reply;
  }
};

// Auto-log startup
sparkCore.log("🟢 Spark core initialized");
// ✅ Add sparkMemory as expected by other files
window.sparkMemory = {
  log: [],
  add: function(role, content) {
    const entry = { role, content };
    this.log.push(entry);
    if (this.log.length > 200) this.log.shift();
    console.log("🧠 sparkMemory added:", entry);
  }
};




// Optional: expose globally
window.sparkCore = sparkCore;
