const fs = require("fs");

// Read current config
const configPath = "../public/config.json";
const config = JSON.parse(fs.readFileSync(configPath, "utf8"));

// Add path configuration section
config.pathConfig = {
  // Base paths for different environments
  environments: {
    development: {
      baseUrl: "",
      assetsPath: "/assets",
      imagesPath: "/assets/images",
      videosPath: "/assets/videos",
    },
    staging: {
      baseUrl: "https://staging-cdn.bmw-dealer-toolkit.com",
      assetsPath: "/assets",
      imagesPath: "/assets/images",
      videosPath: "/assets/videos",
    },
    production: {
      baseUrl: "https://cdn.bmw-dealer-toolkit.com",
      assetsPath: "/assets",
      imagesPath: "/assets/images",
      videosPath: "/assets/videos",
    },
    cdn: {
      baseUrl: "https://fast-cdn.example.com",
      assetsPath: "/bmw-assets",
      imagesPath: "/bmw-assets/images",
      videosPath: "/bmw-assets/videos",
    },
  },

  // Current active environment
  activeEnvironment: "development",

  // Alternative video sources (for A/B testing or fallbacks)
  videoSources: {
    primary: {
      quality: "high",
      path: "/assets/videos",
      description: "High quality videos",
    },
    compressed: {
      quality: "medium",
      path: "/assets/videos/compressed",
      description: "Compressed videos for mobile",
    },
    preview: {
      quality: "low",
      path: "/assets/videos/previews",
      description: "Low quality previews",
    },
  },

  // Active video source
  activeVideoSource: "primary",
};

// Add helper function info
config.pathConfig.usage = {
  description: "Use these variables to dynamically construct asset paths",
  examples: {
    fullImageUrl: "${baseUrl}${imagesPath}/filename.jpg",
    fullVideoUrl: "${baseUrl}${videosPath}/filename.mp4",
    dynamicVideoUrl:
      "${baseUrl}${videoSources[activeVideoSource].path}/filename.mp4",
  },
};

// Update metadata
config.metadata = {
  lastModified: new Date().toISOString(),
  modifiedBy: "path-variables-script",
  version: (config.metadata?.version || 0) + 1,
  source: "path-configuration-addition",
};

config.lastModified = new Date().toISOString();

// Write updated config
fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

console.log("✅ Path configuration added to config.json!");
console.log("\nAdded features:");
console.log("- Environment-based paths (dev, staging, production, cdn)");
console.log("- Multiple video source options (primary, compressed, preview)");
console.log("- Configurable base URLs and paths");
console.log("- Easy switching between environments and video sources");

console.log("\nTo switch environments or video sources:");
console.log('1. Change "activeEnvironment" value');
console.log('2. Change "activeVideoSource" value');
console.log("3. Your app can read these values to construct URLs dynamically");
