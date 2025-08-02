// === memory.js ===
// Persistent memory module for storing and analyzing conversation across sessions
// Now supports GitHub Gist sync (load + save + auto-create + GIST_ID storage)

const MEMORY_KEY = 'sparkPersistentMemory';
const GIST_KEY = 'sparkGistId';
let GIST_ID = localStorage.getItem(GIST_KEY) || '7cfa4a14d0c2e3d0de63ae1f9a56d1c4';
const GITHUB_TOKEN = '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';
const GIST_FILENAME = 'spark-memory.json';

const sparkMemory = {
  history: [],
  enabled: true,
  remote: true,

  add(role, content) {
    if (!this.enabled) return;
    const entry = { role, content, time: new Date().toISOString() };
    this.history.push(entry);
    if (this.history.length > 100) this.history.shift();
    this.save();
    if (this.remote) this.syncRemote();
  },

  clear() {
    this.history = [];
    this.save();
    console.log("🧠 Memory cleared");
    if (this.remote) this.syncRemote();
  },

  analyze() {
    const keywords = {};
    this.history.forEach(entry => {
      const words = entry.content.toLowerCase().split(/\W+/);
      words.forEach(word => {
        if (word.length > 3) keywords[word] = (keywords[word] || 0) + 1;
      });
    });
    return Object.entries(keywords).sort((a, b) => b[1] - a[1]);
  },

  latest(n = 5) {
    return this.history.slice(-n);
  },

  print() {
    console.table(this.history);
  },

  save() {
    try {
      localStorage.setItem(MEMORY_KEY, JSON.stringify(this.history));
    } catch (e) {
      console.warn("⚠️ Failed to save memory:", e);
    }
  },

  load() {
    try {
      const stored = localStorage.getItem(MEMORY_KEY);
      if (stored) this.history = JSON.parse(stored);
    } catch (e) {
      console.warn("⚠️ Failed to load memory:", e);
    }
  },

  async ensureGistExists() {
    if (GIST_ID !== 'PASTE_YOUR_GIST_ID_HERE') return;
    try {
      const res = await fetch(`https://api.github.com/gists`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${GITHUB_TOKEN}`
        },
        body: JSON.stringify({
          description: "Spark Assistant Memory",
          public: false,
          files: {
            [GIST_FILENAME]: {
              content: JSON.stringify(this.history, null, 2)
            }
          }
        })
      });
      const data = await res.json();
      if (data.id) {
        GIST_ID = data.id;
        localStorage.setItem(GIST_KEY, GIST_ID);
        console.log("✅ Created new Gist and saved ID:", GIST_ID);
      } else {
        throw new Error("Failed to create Gist");
      }
    } catch (err) {
      console.warn("⚠️ Failed to create memory Gist:", err);
    }
  },

  async syncRemote() {
    try {
      await this.ensureGistExists();
      const res = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${GITHUB_TOKEN}`
        },
        body: JSON.stringify({
          files: {
            [GIST_FILENAME]: {
              content: JSON.stringify(this.history, null, 2)
            }
          }
        })
      });

      if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
      console.log("📡 Synced memory to GitHub Gist");
    } catch (err) {
      console.warn("⚠️ Failed to sync memory to GitHub:", err);
    }
  },

  async loadRemote() {
    try {
      await this.ensureGistExists();
      const res = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
        headers: {
          "Authorization": `Bearer ${GITHUB_TOKEN}`
        }
      });

      if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);

      const data = await res.json();
      const file = data.files[GIST_FILENAME];
      if (file && file.content) {
        this.history = JSON.parse(file.content);
        this.save();
        console.log("🧠 Loaded memory from GitHub Gist");
      }
    } catch (err) {
      console.warn("⚠️ Failed to load memory from GitHub:", err);
    }
  }
};

// Load local + remote memory
sparkMemory.load();
if (sparkMemory.remote) sparkMemory.loadRemote();

// Optional global access
window.sparkMemory = sparkMemory;
