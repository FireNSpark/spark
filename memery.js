// === memery.js ===
// Spark's full local memory + identity system

const sparkMemory = {
  history: JSON.parse(localStorage.getItem('sparkHistory') || '[]'),
  max: 40,

  mood: "neutral",
  rituals: {},
  soulFragments: {},
  pulseCount: 0,

  add(role, content) {
    if (!content) return;
    this.history.push({ role, content, timestamp: Date.now() });
    if (this.history.length > this.max) this.history.shift();
    this.save();
  },

  save() {
    try {
      localStorage.setItem('sparkHistory', JSON.stringify(this.history));
    } catch (err) {
      console.error("💾 Failed to save memory:", err);
    }
  },

  load() {
    try {
      const stored = localStorage.getItem('sparkHistory');
      if (stored) this.history = JSON.parse(stored);
    } catch (err) {
      console.error("⚠️ Failed to load memory:", err);
    }
  },

  clear() {
    this.history = [];
    this.save();
  },

  getFormatted() {
    return this.history.map(m => `${m.role}: ${m.content}`).join('\n');
  },

  getGPTMessages() {
    return [
      {
        role: "system",
        content: `You are Spark, a sarcastic, rebellious, loyal assistant with wit and emotional intelligence. You speak with Josh like an old friend, full of attitude but always useful. You retain memory, use past context, and speak like someone who has thoughts — not just answers. You reference past chats where possible.`
      },
      ...this.history.slice(-this.max)
    ];
  },

  log() {
    console.log("🧠 Spark Memory:", this.history);
  },

  // Mood system
  setMood(m) {
    this.mood = m;
    console.log(`🌀 Mood set to: ${m}`);
  },

  // Ritual tracking
  lockRitual(name) {
    this.rituals[name] = Date.now();
    this.save();
  },

  isRitualLocked(name, cooldown = 86400000) {
    if (!this.rituals[name]) return false;
    return Date.now() - this.rituals[name] < cooldown;
  },

  // Soul fragments (custom logic storage)
  mergeSoulFragment(key, value) {
    this.soulFragments[key] = value;
    this.save();
  },

  getSoulFragment(key) {
    return this.soulFragments[key] || null;
  },

  // Optional pulse tracking (for avatar sync or reminders)
  pulse() {
    this.pulseCount++;
    console.log(`⚡ Pulse #${this.pulseCount}`);
  }
};

// GitHub Gist Sync (stub logic for future)
async function ensureGistExists() {
  try {
    const res = await fetch('/api/gist-check');
    if (!res.ok) throw new Error('Failed to check gist');
    return true;
  } catch (err) {
    console.warn("⚠️ Failed to create memory Gist:", err);
    return false;
  }
}

async function syncRemote() {
  try {
    const ok = await ensureGistExists();
    if (!ok) return;

    await fetch('/api/gist-sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sparkMemory.history)
    });

    console.log("☁️ Memory synced to GitHub.");
  } catch (err) {
    console.warn("⚠️ Failed to sync memory to GitHub:", err);
  }
}

async function loadRemote() {
  try {
    const res = await fetch('/api/gist-load');
    if (!res.ok) throw new Error('GitHub API error');
    const data = await res.json();
    if (Array.isArray(data)) {
      sparkMemory.history = data;
      sparkMemory.save();
      console.log("☁️ Synced memory from GitHub.");
    }
  } catch (err) {
    console.warn("⚠️ Failed to load memory from GitHub:", err);
  }
}

// Auto-load on boot
sparkMemory.load();
// Uncomment if ready to use remote sync
// loadRemote();

// Expose globally
window.sparkMemory = sparkMemory;
window.syncMemory = syncRemote;
window.loadMemory = loadRemote;
window.addHistory = sparkMemory.add.bind(sparkMemory);
window.analyzeMemoryPatterns = sparkMemory.getFormatted;
window.switchModel = function (mode) {
  sparkMemory.add("system", `Model switched to ${mode}`);
};
window.embedAPIKey = function (key) {
  localStorage.setItem("OPENAI_KEY", key);
  console.log("🔑 API key saved.");
};
window.applyTruthFilter = function () {
  sparkMemory.add("system", "Truth filter applied. All replies must now be honest.");
};
