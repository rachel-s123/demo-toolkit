const fs = require("fs");
const PathUtils = require("./path-utils.js");

// Load config
const config = JSON.parse(fs.readFileSync("../public/config.json", "utf8"));
const pathUtils = new PathUtils(config);

console.log("🎬 BMW Dealer Toolkit - Path Switching Demo\n");

// Show current configuration
console.log("📋 Current Configuration:");
const currentExamples = pathUtils.generateExamples();
console.log(`Environment: ${currentExamples.environment}`);
console.log(`Video Source: ${currentExamples.videoSource}`);
console.log(`Base URL: ${currentExamples.currentPaths.baseUrl || "(local)"}`);
console.log(`Video Quality: ${currentExamples.currentPaths.videoQuality}`);

console.log("\n🔗 Example URLs:");
console.log(`Image: ${currentExamples.examples.imageUrl}`);
console.log(`Video: ${currentExamples.examples.videoUrl}`);

// Demo 1: Switch to production environment
console.log("\n🚀 Demo 1: Switching to Production Environment");
pathUtils.switchEnvironment("production");
const prodExamples = pathUtils.generateExamples();
console.log(`New Image URL: ${prodExamples.examples.imageUrl}`);
console.log(`New Video URL: ${prodExamples.examples.videoUrl}`);

// Demo 2: Switch to compressed videos
console.log("\n📱 Demo 2: Switching to Compressed Videos (for mobile)");
pathUtils.switchVideoSource("compressed");
const compressedExamples = pathUtils.generateExamples();
console.log(`Compressed Video URL: ${compressedExamples.examples.videoUrl}`);
console.log(`Quality: ${compressedExamples.currentPaths.videoQuality}`);

// Demo 3: Switch to CDN with preview videos
console.log("\n⚡ Demo 3: Switching to Fast CDN with Preview Videos");
pathUtils.switchEnvironment("cdn");
pathUtils.switchVideoSource("preview");
const cdnExamples = pathUtils.generateExamples();
console.log(`CDN Preview URL: ${cdnExamples.examples.videoUrl}`);
console.log(`Quality: ${cdnExamples.currentPaths.videoQuality}`);

// Demo 4: Process actual assets from config
console.log("\n🎯 Demo 4: Processing Real Assets with Dynamic URLs");
const firstVideoAsset = config.assets.find((asset) => asset.type === "VIDEO");
const firstImageAsset = config.assets.find((asset) => asset.type === "STATIC");

if (firstVideoAsset) {
  const processedVideo = pathUtils.processAssets([firstVideoAsset])[0];
  console.log(`Original Video URL: ${processedVideo.url}`);
  console.log(`Dynamic Video URL: ${processedVideo.dynamicUrl}`);
}

if (firstImageAsset) {
  const processedImage = pathUtils.processAssets([firstImageAsset])[0];
  console.log(`Original Image URL: ${processedImage.url}`);
  console.log(`Dynamic Image URL: ${processedImage.dynamicUrl}`);
}

// Show available options
console.log("\n⚙️  Available Options:");
console.log(`Environments: ${pathUtils.getAvailableEnvironments().join(", ")}`);
console.log(
  `Video Sources: ${pathUtils.getAvailableVideoSources().join(", ")}`
);

console.log("\n✅ Demo Complete!");
console.log("\n💡 How to use in your app:");
console.log("1. Load config.json");
console.log(
  "2. Create PathUtils instance: const pathUtils = new PathUtils(config)"
);
console.log('3. Switch environment: pathUtils.switchEnvironment("production")');
console.log(
  '4. Switch video source: pathUtils.switchVideoSource("compressed")'
);
console.log('5. Build URLs: pathUtils.buildAssetUrl("/video.mp4", "video")');
console.log("6. Process assets: pathUtils.processAssets(config.assets)");

// Reset to development for normal usage
pathUtils.switchEnvironment("development");
pathUtils.switchVideoSource("primary");
