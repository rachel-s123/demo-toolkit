const fs = require("fs");

// Read current config
const configPath = "../public/config.json";
const config = JSON.parse(fs.readFileSync(configPath, "utf8"));

console.log("🔧 Fixing Video Thumbnail Paths...\n");

let fixedCount = 0;

// Fix video thumbnails that are pointing to wrong paths
config.assets?.forEach((asset) => {
  if (asset.thumbnail && asset.url) {
    // Check if this is a video asset with a video thumbnail
    const isVideoAsset =
      asset.type === "VIDEO" || asset.url.match(/\.(mp4|mov|avi|mkv|webm)$/i);
    const hasVideoThumbnail = asset.thumbnail.match(
      /\.(mp4|mov|avi|mkv|webm)$/i
    );

    if (isVideoAsset && hasVideoThumbnail) {
      // Check if thumbnail path doesn't match the URL path structure
      const urlPath = asset.url.substring(0, asset.url.lastIndexOf("/"));
      const thumbnailPath = asset.thumbnail.substring(
        0,
        asset.thumbnail.lastIndexOf("/")
      );

      if (urlPath !== thumbnailPath) {
        const thumbnailFilename = asset.thumbnail.split("/").pop();
        const oldThumbnail = asset.thumbnail;
        asset.thumbnail = `${urlPath}/${thumbnailFilename}`;

        console.log(`📝 Fixed: ${oldThumbnail}`);
        console.log(`    → ${asset.thumbnail}\n`);
        fixedCount++;
      }
    }
  }
});

if (fixedCount > 0) {
  // Update metadata
  config.metadata = {
    lastModified: new Date().toISOString(),
    modifiedBy: "thumbnail-fix-script",
    version: (config.metadata?.version || 0) + 1,
    source: "thumbnail-path-fix",
  };

  config.lastModified = new Date().toISOString();

  // Save the config
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

  console.log(`✅ Fixed ${fixedCount} video thumbnail paths!`);
} else {
  console.log("ℹ️  No video thumbnail paths needed fixing.");
}

console.log(
  "\n🎯 Summary: Video thumbnails now match their corresponding video URL paths."
);
