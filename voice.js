// === voice.js ===

const sparkVoice = {
  speak(text) {
    if (!window.speechSynthesis) {
      console.warn("Speech synthesis not supported.");
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.pitch = 1;
    utterance.rate = 1;
    utterance.volume = 1;

    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.name.includes("Google") || v.name.includes("Microsoft"));
    if (preferredVoice) utterance.voice = preferredVoice;

    window.speechSynthesis.speak(utterance);
    console.log("🗣️ Speaking:", text);
  }
};

window.sparkVoice = sparkVoice;
