// mic.js

const sparkMic = {
  start: () => {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      document.getElementById('userInput').value = transcript;
      sendMessage();
    };

    recognition.onerror = (event) => {
      console.error("Mic error:", event);
    };

    recognition.start();
  }
};
