// === expression-mapper.js === // Maps GPT text sentiment to avatar expression

window.sparkExpression = { mapToneToExpression(text) { const lowered = text.toLowerCase();

if (lowered.includes('sorry') || lowered.includes('unfortunately') || lowered.includes('regret')) {
  return 'sad';
} else if (lowered.includes('great') || lowered.includes('awesome') || lowered.includes('happy')) {
  return 'happy';
} else if (lowered.includes('wait') || lowered.includes('thinking') || lowered.includes('calculating')) {
  return 'thinking';
} else if (lowered.includes('no') || lowered.includes("can't") || lowered.includes('error')) {
  return 'angry';
}
return 'neutral';

},

applyExpression(text) { if (!window.sparkAvatar || !sparkAvatar.react) return; const expression = this.mapToneToExpression(text); sparkAvatar.react(expression); } };

