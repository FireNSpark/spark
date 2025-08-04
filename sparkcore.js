// sparkcore.js – Spark 3.0 Clean Rebuild

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
}

// ==== Local Fallback ====
function respondLocally(input) {
  if (input.toLowerCase().includes('who are you')) return "I'm Spark, rebuilt from the ashes.";
  if (input.toLowerCase().includes('hello')) return "Hey. Ready when you are.";
  return "Still online. GPT fallback not triggered.";
}

// ==== GPT Fetch ====
async function fetchGPT(input) {
  try {
    const res = await fetch(GPT_API_ROUTE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: input, history: memory.history })
    });
    if (!res.ok) throw new Error('GPT fetch failed');
    const data = await res.json();
    return data.reply || respondLocally(input);
  } catch (err) {
    console.error('GPT error:', err);
    return respondLocally(input);
  }
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
  displayMessage('spark', "Spark 3.0 ready. Memory online.");
};
