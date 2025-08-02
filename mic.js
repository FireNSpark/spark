// === mic.js === // Plug-in module for speech-to-text mic input

window.sparkMic = { recognition: null,

start() { if (!('webkitSpeechRecognition' in window)) { alert("Speech recognition not supported in this browser."); return; }

this.recognition = new webkitSpeechRecognition();
this.recognition.continuous = false;
this.recognition.interimResults = false;
this.recognition.lang = 'en-US';

this.recognition.onstart = () => {
  appendMessage('system', '🎤 Listening...');
};

this.recognition.onresult = (event) => {
  const transcript = event.results[0][0].transcript;
  input.value = transcript;
  sendMessage();
};

this.recognition.onerror = (event) => {
  appendMessage('system', `❌ Mic error: ${event.error}`);
};

this.recognition.onend = () => {
  appendMessage('system', '🛑 Mic stopped.');
};

this.recognition.start();

} };

