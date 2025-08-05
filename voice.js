// === voice.js ===

// Enhanced voice system with fallback to browser speechSynthesis and ElevenLabs toggle

let sparkVoice = {
  lastText: '',

  speak: async function(text) {
    console.log("🗣️ Speaking:", text);

    // Prevent repeating the same response
    if (text === this.lastText) {
      console.warn("🔁 Repeated response detected, skipping speak()");
      return;
    }
    this.lastText = text;

    try {
      const res = await fetch('/api/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });

      if (!res.ok) throw new Error("Voice API failed");

      const blob = await res.blob();
      const audio = new Audio(URL.createObjectURL(blob));
      audio.play();

      const avatar = document.getElementById("avatarImage");
      if (avatar && avatar.classList) {
        avatar.classList.add("talking");
        audio.onended = () => avatar.classList.remove("talking");
      }

    } catch (error) {
      console.warn("🛑 Voice API failed, using speechSynthesis fallback", error);

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.pitch = 1;
      utterance.rate = 1;
      speechSynthesis.speak(utterance);

      const avatar = document.getElementById("avatarImage");
      if (avatar && avatar.classList) {
        avatar.classList.add("talking");
        utterance.onend = () => avatar.classList.remove("talking");
      }
    }
  }
};

window.sparkVoice = sparkVoice;
