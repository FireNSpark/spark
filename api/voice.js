// === voice.js (REVERTED to original robotic voice) ===

let sparkVoice = {
  speak: async function(text) {
    console.log("🗣️ Speaking:", text);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';

    const avatar = document.getElementById("avatarImage");
    if (avatar?.classList) {
      avatar.classList.add("talking");
      utterance.onend = () => avatar.classList.remove("talking");
    }

    speechSynthesis.speak(utterance);
  }
};

// === Auto speak on GPT reply ===
window.addEventListener("GPTReply", (e) => {
  const msg = e.detail;
  if (msg && typeof msg === "string") sparkVoice.speak(msg);
});
