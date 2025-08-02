// === memory.js === // Local memory module for storing and analyzing conversation

const sparkMemory = { history: [], enabled: true,

add(role, content) { if (!this.enabled) return; const entry = { role, content, time: new Date().toISOString() }; this.history.push(entry); if (this.history.length > 100) this.history.shift(); // keep last 100 },

clear() { this.history = []; console.log("🧠 Memory cleared"); },

analyze() { const keywords = {}; this.history.forEach(entry => { const words = entry.content.toLowerCase().split(/\W+/); words.forEach(word => { if (word.length > 3) keywords[word] = (keywords[word] || 0) + 1; }); }); return Object.entries(keywords).sort((a, b) => b[1] - a[1]); },

latest(n = 5) { return this.history.slice(-n); },

print() { console.table(this.history); } };

// Optional global access window.sparkMemory = sparkMemory;

