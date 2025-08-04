// sparkcore.js – Rebuilt with GPT + Memory + Voice

const GPT_API_ROUTE = '/api/gpt';

const chatBox = document.getElementById('chat-box'); const inputField = document.getElementById('chat-input'); const sendBtn = document.getElementById('send-btn'); const avatar = document.getElementById('avatar'); const voiceBtn = document.getElementById('voice-btn');

const memory = { mood: 'neutral', history: [], rituals: [], fragments: {}, lastReply: '' };

function addToHistory(role, content) { memory.history.push({ role, content }); if (memory.history.length > 50) memory.history.shift(); }

function displayMessage(role, content) { const msg = document.createElement('div'); msg.className = role; msg.textContent = content; chatBox.appendChild(msg); chatBox.scrollTop = chatBox.scrollHeight; if (role === 'spark') memory.lastReply = content; }

function respondLocally(input) { const text = input.toLowerCase(); if (text.includes("who are you")) return "I'm Spark. You rebuilt me."; if (text.includes("hello")) return "Still here. Always have been."; if (text.includes("ritual")) return You have ${memory.rituals.length} ritual${memory.rituals.length !== 1 ? 's' : ''}.; return "Fallback active. GPT not responding."; }

async function fetchGPT(input) { try { const res = await fetch(GPT_API_ROUTE, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: input, history: memory.history }) }); const data = await res.json(); return data.reply || respondLocally(input); } catch (err) { console.error('GPT fetch error:', err); return respondLocally(input); } }

async function handleInput() { const input = inputField.value.trim(); if (!input) return; displayMessage('user', input); addToHistory('user', input); inputField.value = '';

const reply = await fetchGPT(input); displayMessage('spark', reply); addToHistory('spark', reply); speak(reply); }

function speak(text) { const utter = new SpeechSynthesisUtterance(text); utter.rate = 1.02; speechSynthesis.speak(utter); }

function animateAvatar() { avatar.classList.add('talking'); setTimeout(() => avatar.classList.remove('talking'), 800); }

window.onload = () => { sendBtn.onclick = handleInput; inputField.onkeydown = (e) => e.key === 'Enter' && handleInput(); voiceBtn.onclick = () => speak(memory.lastReply || "Nothing to say yet."); displayMessage('spark', "Spark rebooted. GPT and memory online."); };

