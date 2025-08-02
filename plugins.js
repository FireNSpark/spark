// === plugins.js ===
// Master switchboard to load plug-and-play Spark modules

(async () => {
  const pluginModules = [
    'avatar-react.js',
    'expression-mapper.js',
    'files.js',
    'calendar.js',
    'dimensions.js',
    'search.js',
    'personality.js',
    'history.js',
    'memory-panel.js',
    'mic.js'
  ];

  for (const mod of pluginModules) {
    try {
      await import(`./${mod}`);
      console.log(`✅ Loaded ${mod}`);
    } catch (err) {
      console.warn(`⚠️ Failed to load ${mod}:`, err);
    }
  }
})();
