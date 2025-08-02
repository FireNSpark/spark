// === plugins.js ===
// Load and initialize Spark plug-and-play modules

import './mic.js';
import './expression-mapper.js';
import './avatar-react.js';
import './calendar.js';
import './dimensions.js';
import './history.js';
import './memory-panel.js';
import './personality.js';
import './search.js';
import './files.js';

console.log('🔌 Spark plugins loaded');

// Optional plugin lifecycle hooks

document.addEventListener("DOMContentLoaded", () => {
  if (window.sparkMic?.init) window.sparkMic.init();
  if (window.sparkExpression?.init) window.sparkExpression.init();
  if (window.sparkAvatar?.init) window.sparkAvatar.init();
  if (window.sparkCalendar?.init) window.sparkCalendar.init();
  if (window.sparkMemoryPanel?.load) window.sparkMemoryPanel.load();
  if (window.sparkPersonality?.boot) window.sparkPersonality.boot();
  if (window.sparkSearch?.attach) window.sparkSearch.attach();
  if (window.sparkFiles?.connect) window.sparkFiles.connect();
  if (window.sparkHistory?.render) window.sparkHistory.render();
  if (window.sparkDimensions?.map) window.sparkDimensions.map();
});
