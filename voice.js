// === voice.js === // Full Spark voice engine with dynamic mode control

const sparkVoice = { voiceEnabled: true, currentUtterance: null,

speak(text) { if (!sparkCore.voice || !sparkVoice.voiceEnabled) return;

sparkVoice.stop(); // stop any ongoing

const utterance = new SpeechSynthesisUtterance(text);
utterance.rate = 1;
utterance.pitch = 1;
utterance.volume = 1;
utterance.lang = 'en-US';

sparkVoice.currentUtterance = utterance;
speechSynthesis.speak(utterance);

},

stop() { if (speechSynthesis.speaking) { speechSynthesis.cancel(); } sparkVoice.currentUtterance = null; },

toggle() { sparkVoice.voiceEnabled = !sparkVoice.voiceEnabled; console.log(🔊 Voice ${sparkVoice.voiceEnabled ? 'enabled' : 'muted'}); },

test() { sparkVoice.speak("Voice system initialized and ready."); } };

window.sparkVoice = sparkVoice;

