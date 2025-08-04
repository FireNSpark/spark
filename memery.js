// memery.js — Rituals, fragments, mood, fallback state

export const memory = {
  mood: 'neutral',
  rituals: [],
  fragments: {},
  history: [],
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
