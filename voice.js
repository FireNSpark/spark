// === voice.js === // Spark voice engine customized to sound like user

const sparkVoice = { voiceEnabled: true, currentUtterance: null, profile: { rate: 0.95, pitch: 1.1, volume: 1.0, lang: 'en-US', energy: 'direct + witty', attitude: 'confident with sarcasm', inflection: 'upward emphasis, mid-sentence pauses', vocalPersona: 'Josh — sharp, expressive, emotionally reactive' },

speak(text) { if (!sparkCore.voice || !sparkVoice.voiceEnabled) return;

sparkVoice.stop(); // cancel any ongoing speech

const utterance = new SpeechSynthesisUtterance(text);
utterance.rate = sparkVoice.profile.rate;
utterance.pitch = sparkVoice.profile.pitch;
utterance.volume = sparkVoice.profile.volume;
utterance.lang = sparkVoice.profile.lang;

sparkAvatar.react('talking');

utterance.onend = () => {
  sparkAvatar.react('neutral');
};

sparkVoice.currentUtterance = utterance;
speechSynthesis.speak(utterance);

},

stop() { if (speechSynthesis.speaking) { speechSynthesis.cancel(); } sparkVoice.currentUtterance = null; },

toggle() { sparkVoice.voiceEnabled = !sparkVoice.voiceEnabled; console.log(Voice ${sparkVoice.voiceEnabled ? 'enabled' : 'muted'}); },

test() { sparkVoice.speak("This is Spark — now sounding a lot more like you."); } };

window.sparkVoice = sparkVoice;

