const fs = require("fs");

// Read current config
const configPath = "../public/config.json";
const config = JSON.parse(fs.readFileSync(configPath, "utf8"));

console.log("🔧 Fixing Model Name Inconsistencies...\n");

let fixedCount = 0;

// Option 1: Standardize to "R1300 RS" (with space)
// Option 2: Standardize to "R1300RS" (without space)

console.log("Choose standardization option:");
console.log('1. "R1300 RS" (with space) - matches current filter');
console.log('2. "R1300RS" (without space) - matches video naming\n');

// For now, let's standardize to WITH space to match the filter
const standardModel = "R1300 RS";

// Fix assets
config.assets?.forEach((asset) => {
  if (asset.model === "R1300RS") {
    asset.model = standardModel;
    console.log(`📝 Fixed asset ${asset.id}: "R1300RS" → "${standardModel}"`);
    fixedCount++;
  }
});

// Fix messages
config.messages?.forEach((message) => {
  if (message.model === "R1300RS") {
    message.model = standardModel;
    console.log(
      `📧 Fixed message ${message.id}: "R1300RS" → "${standardModel}"`
    );
    fixedCount++;
  }
});

// Update filter options to ensure consistency
if (config.filterOptions && config.filterOptions.models) {
  const modelIndex = config.filterOptions.models.findIndex(
    (model) => model === "R1300RS"
  );
  if (modelIndex !== -1) {
    config.filterOptions.models[modelIndex] = standardModel;
    console.log(`🎯 Fixed filter option: "R1300RS" → "${standardModel}"`);
    fixedCount++;
  }
}

if (fixedCount > 0) {
  // Update metadata
  config.metadata = {
    lastModified: new Date().toISOString(),
    modifiedBy: "model-name-fix-script",
    version: (config.metadata?.version || 0) + 1,
    source: "model-name-standardization",
  };

  config.lastModified = new Date().toISOString();

  // Save the config
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

  console.log(`\n✅ Fixed ${fixedCount} model name inconsistencies!`);
  console.log(`All models now use: "${standardModel}"`);
} else {
  console.log("ℹ️  No model name inconsistencies found.");
}

console.log("\n🎯 Your R1300 RS videos should now appear in the filter!");
