// memery.js — Rituals, fragments, mood, fallback state

export const memory = {
  mood: 'neutral',
  rituals: [],
  fragments: {},
  history: [],
  version: '2.1.0'
};

export function addHistory(role, content) {
  memory.history.push({ role, content });
  if (memory.history.length > 50) memory.history.shift();
}

export function addRitual(name, data) {
  memory.rituals.push({ name, data, time: Date.now() });
}

export function mergeFragment(key, value) {
  memory.fragments[key] = value;
}

export function getMood() {
  return memory.mood;
}

export function setMood(newMood) {
  memory.mood = newMood;
}

export function respondLocally(input) {
  const text = input.toLowerCase();
  if (text.includes("who are you")) return "I'm Spark. You rebuilt me from fire.";
  if (text.includes("hello")) return "Hey. I'm always online.";
  if (text.includes("ritual")) return `You have ${memory.rituals.length} ritual${memory.rituals.length !== 1 ? 's' : ''}.`;
  return "Still here. Not everything needs GPT.";
}

// ⬇️ New functions for persistent storage & GPT context

export function exportMemoryJSON() {
  return JSON.stringify(memory, null, 2);
}

export function loadMemoryFromJSON(json) {
  try {
    const data = JSON.parse(json);
    Object.assign(memory, data);
    return true;
  } catch (err) {
    console.error("❌ Failed to parse memory JSON", err);
    return false;
  }
}

export function extractRecentContext(limit = 5) {
  return memory.history.slice(-limit).map(e => `${e.role}: ${e.content}`).join("\n");
}

export function addTaggedMemory(tag, summary) {
  if (!memory.fragments[tag]) memory.fragments[tag] = [];
  memory.fragments[tag].push({ summary, time: Date.now() });
}

export function recallTaggedMemory(tag) {
  return memory.fragments[tag]?.map(m => `• ${m.summary}`).join("\n") || '';
} 
