// === voice.js ===

// Enhanced voice system with robust ElevenLabs support and fallback

let sparkVoice = {
  lastText: '',

  speak: async function(text) {
    console.log("🗣️ Speaking:", text);

    // Avoid repeating the same line
    if (text === this.lastText) {
      console.warn("🔁 Repeated response detected, skipping speak()");
      return;
    }
    this.lastText = text;

    try {
      const res = await fetch('/api/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voiceId: "ijdvK10rhhVda9QPsfHN" })
      });

      console.log("🔊 Voice API response status:", res.status);
      if (!res.ok) {
        const errText = await res.text();
        console.error("❌ Voice API error response:", errText);
        throw new Error("Voice API failed");
      }

      const blob = await res.blob();
      const audio = new Audio(URL.createObjectURL(blob));
      await audio.play();

      const avatar = document.getElementById("avatarImage");
      if (avatar && avatar.classList) {
        avatar.classList.add("talking");
        audio.onended = () => avatar.classList.remove("talking");
      }

    } catch (error) {
      console.warn("🛑 Voice API failed, falling back to speechSynthesis", error);

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.pitch = 1.05;
      utterance.rate = 0.97;
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
