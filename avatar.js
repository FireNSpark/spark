
// === avatar.js ===
// Spark avatar visual behavior and expression hooks

const sparkAvatar = {
  element: null,
  pulseInterval: null,

  init() {
    sparkAvatar.element = document.getElementById('avatar');
    if (!sparkAvatar.element) return;
    sparkAvatar.blink();
    sparkAvatar.pulse();
  },

  blink() {
    if (!sparkAvatar.element) return;
    setInterval(() => {
      sparkAvatar.element.classList.add('blink');
      setTimeout(() => sparkAvatar.element.classList.remove('blink'), 200);
    }, 4000);
  },

  pulse() {
    if (!sparkAvatar.element) return;
    sparkAvatar.pulseInterval = setInterval(() => {
      sparkAvatar.element.classList.add('pulse');
      setTimeout(() => sparkAvatar.element.classList.remove('pulse'), 600);
    }, 8000);
  },

  react(state) {
    if (!sparkAvatar.element) return;
    sparkAvatar.element.setAttribute('data-expression', state);
  },

  stopPulse() {
    clearInterval(sparkAvatar.pulseInterval);
  }
};

// Auto-start if element exists
window.onload = () => sparkAvatar.init();
window.sparkAvatar = sparkAvatar;
