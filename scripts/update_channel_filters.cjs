const fs = require("fs");

// Read current config
const configPath = "../public/config.json";
const config = JSON.parse(fs.readFileSync(configPath, "utf8"));

console.log("🔧 Updating Channel Filter Options...\n");

// Extract unique channels from messages
const uniqueChannels = new Set();

// Add "ALL" as the first option
uniqueChannels.add("ALL");

// Extract channels from messages
if (config.messages && Array.isArray(config.messages)) {
  config.messages.forEach((message) => {
    if (message.channel) {
      uniqueChannels.add(message.channel);
    }
  });
}

// Convert to sorted array
const channelArray = Array.from(uniqueChannels).sort((a, b) => {
  // Keep "ALL" first
  if (a === "ALL") return -1;
  if (b === "ALL") return 1;
  return a.localeCompare(b);
});

console.log("📋 Found channels in messages:");
channelArray.forEach((channel, index) => {
  console.log(`${index + 1}. ${channel}`);
});

// Update filterOptions
if (!config.filterOptions) {
  config.filterOptions = {};
}

config.filterOptions.channels = channelArray;

// Update metadata
config.metadata = {
  lastModified: new Date().toISOString(),
  modifiedBy: "channel-filter-update-script",
  version: (config.metadata?.version || 0) + 1,
  source: "message-channel-extraction",
};

config.lastModified = new Date().toISOString();

// Save the config
fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

console.log(
  `\n✅ Updated channel filter options with ${channelArray.length} channels!`
);
console.log("📝 Channel filter list updated in config.json");
console.log("\n🎯 Your Messages tab should now have accurate channel filters!");
