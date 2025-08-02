// === avatar-react.js === // Simple avatar expression system

window.sparkAvatar = { react(state) { const avatar = document.getElementById('avatarImage'); if (!avatar) return;

avatar.classList.remove('talking', 'thinking', 'happy', 'angry', 'neutral', 'sad');
avatar.classList.add(state);

} };

