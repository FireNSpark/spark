const sparkCore = {
  name: "Spark",
  version: "v0.1",
  status: "booting",
  mode: "default",
  voice: true,
  memoryEnabled: true,
  avatarVisible: true,
  pulseActive: false,
  ritualsEnabled: false,
  systemLog: [],

  log(event) {
    const timestamp = new Date().toISOString();
    const entry = `[${timestamp}] ${event}`;
    sparkCore.systemLog.push(entry);
    console.log(entry);
  },

  toggle(key) {
    if (key in sparkCore) {
      sparkCore[key] = !sparkCore[key];
      sparkCore.log(`Toggled ${key} to ${sparkCore[key]}`);
    }
  },

  updateStatus(newStatus) {
    sparkCore.status = newStatus;
    sparkCore.log(`Status changed to ${newStatus}`);
  },

  identify() {
    return `${sparkCore.name} [${sparkCore.version}] - Mode: ${sparkCore.mode}`;
  }
};

// Auto-log startup
sparkCore.log("🟢 Spark core initialized");

// Optional: expose globally
window.sparkCore = sparkCore;
