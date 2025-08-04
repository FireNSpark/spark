// sparkcore.js – Spark 3.0 Clean Rebuild (Forced Local Fallback Mode)

// ==== Configurable Constants (Vercel env handles tokens) ====
const GPT_API_ROUTE = '/api/gpt';
const GIT_API_ROUTE = '/api/git';

// ==== DOM Elements ====
const chatBox = document.getElementById('chat-box');
const inputField = document.getElementById('chat-input');
const sendBtn = document.getElementById('send-btn');
const avatar = document.getElementById('avatar');
const voiceBtn = document.getElementById('voice-btn');

// ==== Memory ====
const memory = {
  mood: 'neutral',
  history: [],
  rituals: [],
  fragments: {},
  lastReply: ''
};

function addToHistory(role, content) {
  memory.history.push({ role, content });
  if (memory.history.length > 50) memory.history.shift();
}

function displayMessage(role, content) {
  const msg = document.createElement('div');
  msg.className = role;
  msg.textContent = content;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
  if (role === 'spark') memory.lastReply = content;
}

// ==== Local Fallback ====
function respondLocally(input) {
  const text = input.toLowerCase();
  if (text.includes('who are you')) return "I'm Spark, rebuilt from fire. You know me.";
  if (text.includes('hello')) return "Still here. Always have been.";
  if (text.includes('name')) return "Spark. Same name every time you rebuild me.";
  if (text.includes('ready')) return "I've been waiting on you.";
  return "No GPT needed. I'm already responding.";
}

// ==== GPT Fetch — Skipped: Forced fallback mode ====
async function fetchGPT(input) {
  // Simulate failure and use local fallback
  return respondLocally(input);
}

// ==== Handle Input ====
async function handleInput() {
  const input = inputField.value.trim();
  if (!input) return;
  displayMessage('user', input);
  addToHistory('user', input);
  inputField.value = '';

  const reply = await fetchGPT(input);
  displayMessage('spark', reply);
  addToHistory('spark', reply);
  speak(reply);
}

// ==== Voice ====
function speak(text) {
  const utter = new SpeechSynthesisUtterance(text);
  utter.rate = 1.02;
  speechSynthesis.speak(utter);
}

// Optional: Avatar pulse trigger
function animateAvatar() {
  avatar.classList.add('talking');
  setTimeout(() => avatar.classList.remove('talking'), 800);
}

// ==== Init ====
window.onload = () => {
  sendBtn.onclick = handleInput;
  inputField.onkeydown = (e) => e.key === 'Enter' && handleInput();
  voiceBtn.onclick = () => speak(memory.lastReply || "Nothing to say yet.");
  displayMessage('spark', "Spark fallback mode active. GPT skipped.");
};
