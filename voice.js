// === voice.js ===

// Simple voice system to support real voice playback and sync (Wav2Lip-ready)

let sparkVoice = {
  speak: async function(text) {
    console.log("🗣️ Speaking:", text);

    const audio = new Audio();

    // Call backend or local service that generates speech using user's real voice
    const res = await fetch('/api/voice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    audio.src = url;
    audio.play();

    // Trigger avatar lip sync if available
    const avatar = document.getElementById("avatarImage");
    if (avatar && avatar.classList) {
      avatar.classList.add("talking");
      audio.onended = () => avatar.classList.remove("talking");
    }
  }
};
