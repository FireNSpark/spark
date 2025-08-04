// === voice.js ===

let sparkVoice = {
  speak: async function(text) {
    console.log("🗣️ Speaking:", text);

    const audio = new Audio();
    try {
      const res = await fetch('/api/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });

      if (!res.ok) {
        const err = await res.json();
        console.error("❌ Voice API Error:", err);
        alert("🔇 Voice failed: " + (err.details || err.error || 'Unknown error'));
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      audio.src = url;
      audio.play();

      const avatar = document.getElementById("avatarImage");
      if (avatar?.classList) {
        avatar.classList.add("talking");
        audio.onended = () => avatar.classList.remove("talking");
      }
    } catch (err) {
      console.error("💥 Voice client crash:", err);
      alert("💥 Voice error: " + err.message);
    }
  }
};

// === Auto speak on GPT reply ===
window.addEventListener("GPTReply", (e) => {
  const msg = e.detail;
  if (msg && typeof msg === "string") sparkVoice.speak(msg);
});
