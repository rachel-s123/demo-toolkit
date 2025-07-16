const fs = require("fs");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

class PathUpdater {
  constructor() {
    this.config = null;
    this.configPath = "../public/config.json";
  }

  loadConfig() {
    try {
      this.config = JSON.parse(fs.readFileSync(this.configPath, "utf8"));
      console.log("✅ Config loaded successfully");
    } catch (error) {
      console.error("❌ Error loading config:", error.message);
      process.exit(1);
    }
  }

  saveConfig() {
    try {
      // Update metadata
      this.config.metadata = {
        lastModified: new Date().toISOString(),
        modifiedBy: "interactive-path-updater",
        version: (this.config.metadata?.version || 0) + 1,
        source: "path-update-script",
      };

      this.config.lastModified = new Date().toISOString();

      fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
      console.log("✅ Config saved successfully");
    } catch (error) {
      console.error("❌ Error saving config:", error.message);
    }
  }

  getAssetTypes() {
    const types = new Set();

    // Get types from assets
    this.config.assets?.forEach((asset) => {
      if (asset.type) types.add(asset.type);
    });

    // Add common folder types
    types.add("IMAGES");
    types.add("VIDEOS");
    types.add("ALL");

    return Array.from(types).sort();
  }

  // Helper function to detect URL type and build appropriate path
  buildAssetUrl(newPath, filename) {
    // If it's a Google Drive folder URL
    if (newPath.includes("drive.google.com/drive/folders/")) {
      // For Google Drive folders, we'll use the folder URL as base
      // Note: This might need adjustment based on how you want to access files
      return `${newPath}/${filename}`;
    }

    // If it's a Google Drive file URL (individual file)
    if (newPath.includes("drive.google.com/file/d/")) {
      // For individual file URLs, return the URL as-is (ignoring filename)
      return newPath;
    }

    // If it's any other absolute URL (starts with http/https)
    if (newPath.startsWith("http://") || newPath.startsWith("https://")) {
      return `${newPath}/${filename}`;
    }

    // Default: relative path
    return `${newPath}/${filename}`;
  }

  updateAssetPaths(assetType, newPath) {
    let updatedCount = 0;

    if (!this.config.assets) {
      console.log("❌ No assets found in config");
      return 0;
    }

    console.log(`\n🔍 Path type detected: ${this.detectPathType(newPath)}`);

    this.config.assets.forEach((asset) => {
      let shouldUpdate = false;

      // Determine if this asset should be updated
      if (assetType === "ALL") {
        shouldUpdate = true;
      } else if (assetType === "IMAGES") {
        shouldUpdate =
          asset.type === "STATIC" ||
          asset.url?.match(/\.(jpg|jpeg|png|gif|bmp|tif|tiff|webp|svg)$/i);
      } else if (assetType === "VIDEOS") {
        shouldUpdate =
          asset.type === "VIDEO" ||
          asset.url?.match(/\.(mp4|mov|avi|mkv|webm)$/i);
      } else {
        shouldUpdate = asset.type === assetType;
      }

      if (shouldUpdate) {
        // Update main URL
        if (asset.url) {
          const filename = asset.url.split("/").pop();
          const oldUrl = asset.url;
          asset.url = this.buildAssetUrl(newPath, filename);
          console.log(`  📝 ${oldUrl} → ${asset.url}`);
          updatedCount++;
        }

        // Update thumbnail URL - handle both image and video thumbnails
        if (asset.thumbnail) {
          const thumbnailFilename = asset.thumbnail.split("/").pop();
          const oldThumbnail = asset.thumbnail;

          // Check if thumbnail should be updated based on asset type being updated
          let shouldUpdateThumbnail = false;

          if (assetType === "ALL") {
            shouldUpdateThumbnail = true;
          } else if (assetType === "IMAGES") {
            // Update if thumbnail is an image file
            shouldUpdateThumbnail = asset.thumbnail.match(
              /\.(jpg|jpeg|png|gif|bmp|tif|tiff|webp|svg)$/i
            );
          } else if (assetType === "VIDEOS") {
            // Update if thumbnail is a video file OR if this is a video asset (video thumbnails can be videos)
            shouldUpdateThumbnail =
              asset.thumbnail.match(/\.(mp4|mov|avi|mkv|webm)$/i) ||
              asset.type === "VIDEO" ||
              asset.url?.match(/\.(mp4|mov|avi|mkv|webm)$/i);
          } else if (assetType === "STATIC" || assetType === "VIDEO") {
            // For specific types, update thumbnails that match the same type
            if (assetType === "VIDEO") {
              shouldUpdateThumbnail = asset.thumbnail.match(
                /\.(mp4|mov|avi|mkv|webm)$/i
              );
            } else {
              shouldUpdateThumbnail = asset.thumbnail.match(
                /\.(jpg|jpeg|png|gif|bmp|tif|tiff|webp|svg)$/i
              );
            }
          }

          if (shouldUpdateThumbnail) {
            asset.thumbnail = this.buildAssetUrl(newPath, thumbnailFilename);
            console.log(`  🖼️  ${oldThumbnail} → ${asset.thumbnail}`);
          }
        }
      }
    });

    // Also update guide thumbnails if updating images or all
    if (assetType === "IMAGES" || assetType === "ALL") {
      this.config.guides?.forEach((guide) => {
        if (
          guide.thumbnail &&
          guide.thumbnail.match(/\.(jpg|jpeg|png|gif|bmp|tif|tiff|webp|svg)$/i)
        ) {
          const thumbnailFilename = guide.thumbnail.split("/").pop();
          const oldThumbnail = guide.thumbnail;
          guide.thumbnail = this.buildAssetUrl(newPath, thumbnailFilename);
          console.log(
            `  📚 Guide thumbnail: ${oldThumbnail} → ${guide.thumbnail}`
          );
          updatedCount++;
        }
      });
    }

    return updatedCount;
  }

  detectPathType(path) {
    if (path.includes("drive.google.com/drive/folders/")) {
      return "Google Drive Folder";
    }
    if (path.includes("drive.google.com/file/d/")) {
      return "Google Drive Individual File";
    }
    if (path.startsWith("http://") || path.startsWith("https://")) {
      return "Absolute URL";
    }
    return "Relative Path";
  }

  async askQuestion(question) {
    return new Promise((resolve) => {
      rl.question(question, (answer) => {
        resolve(answer.trim());
      });
    });
  }

  async showCurrentPaths() {
    console.log("\n📋 Current Asset Paths:");

    const pathSamples = {
      IMAGES: [],
      VIDEOS: [],
      OTHER: [],
    };

    // Sample a few paths from each type
    this.config.assets?.forEach((asset) => {
      if (asset.url) {
        const path = asset.url.substring(0, asset.url.lastIndexOf("/"));

        if (
          asset.type === "STATIC" ||
          asset.url.match(/\.(jpg|jpeg|png|gif|bmp|tif|tiff|webp|svg)$/i)
        ) {
          if (
            pathSamples.IMAGES.length < 3 &&
            !pathSamples.IMAGES.includes(path)
          ) {
            pathSamples.IMAGES.push(path);
          }
        } else if (
          asset.type === "VIDEO" ||
          asset.url.match(/\.(mp4|mov|avi|mkv|webm)$/i)
        ) {
          if (
            pathSamples.VIDEOS.length < 3 &&
            !pathSamples.VIDEOS.includes(path)
          ) {
            pathSamples.VIDEOS.push(path);
          }
        } else {
          if (
            pathSamples.OTHER.length < 3 &&
            !pathSamples.OTHER.includes(path)
          ) {
            pathSamples.OTHER.push(path);
          }
        }
      }
    });

    console.log(`Images: ${pathSamples.IMAGES.join(", ") || "None found"}`);
    console.log(`Videos: ${pathSamples.VIDEOS.join(", ") || "None found"}`);
    if (pathSamples.OTHER.length > 0) {
      console.log(`Other: ${pathSamples.OTHER.join(", ")}`);
    }
  }

  async run() {
    console.log("🎬 BMW Dealer Toolkit - Interactive Path Updater\n");

    this.loadConfig();
    await this.showCurrentPaths();

    const assetTypes = this.getAssetTypes();

    console.log("\n🎯 Available Asset Types:");
    assetTypes.forEach((type, index) => {
      console.log(`${index + 1}. ${type}`);
    });

    // Ask for asset type
    const typeChoice = await this.askQuestion(
      "\nWhich asset type do you want to update? (number or name): "
    );

    let selectedType;
    if (!isNaN(typeChoice)) {
      const index = parseInt(typeChoice) - 1;
      selectedType = assetTypes[index];
    } else {
      selectedType = typeChoice.toUpperCase();
    }

    if (!assetTypes.includes(selectedType)) {
      console.log("❌ Invalid asset type selected");
      rl.close();
      return;
    }

    // Ask for new path
    console.log(`\n📁 Current path examples for ${selectedType}:`);
    if (selectedType === "IMAGES") {
      console.log("   /assets/images");
    } else if (selectedType === "VIDEOS") {
      console.log("   /assets/videos");
    }

    console.log("\n💡 Path examples:");
    console.log("   /assets/videos (relative path)");
    console.log("   https://cdn.example.com/videos (CDN)");
    console.log(
      "   https://drive.google.com/drive/folders/YOUR_FOLDER_ID (Google Drive folder)"
    );
    console.log(
      "   https://drive.google.com/file/d/FILE_ID/view?usp=sharing (individual Google Drive file)"
    );
    console.log("   /downloads/videos (download folder)");

    const newPath = await this.askQuestion(
      "\nEnter the new path (without trailing slash): "
    );

    if (!newPath) {
      console.log("❌ No path provided");
      rl.close();
      return;
    }

    // Show path type detection
    console.log(`\n🔍 Detected path type: ${this.detectPathType(newPath)}`);

    // Confirm the change
    console.log(
      `\n⚠️  About to update all ${selectedType} assets to use path: ${newPath}`
    );
    const confirm = await this.askQuestion("Continue? (y/N): ");

    if (confirm.toLowerCase() !== "y" && confirm.toLowerCase() !== "yes") {
      console.log("❌ Operation cancelled");
      rl.close();
      return;
    }

    // Perform the update
    console.log(`\n🔄 Updating ${selectedType} paths...`);
    const updatedCount = this.updateAssetPaths(selectedType, newPath);

    if (updatedCount > 0) {
      this.saveConfig();
      console.log(`\n✅ Successfully updated ${updatedCount} asset paths!`);

      // Show a sample of what the URLs look like now
      console.log("\n📋 Sample updated URLs:");
      const sampleAsset = this.config.assets.find((asset) => {
        if (selectedType === "VIDEOS") {
          return (
            asset.type === "VIDEO" ||
            asset.url?.match(/\.(mp4|mov|avi|mkv|webm)$/i)
          );
        } else if (selectedType === "IMAGES") {
          return (
            asset.type === "STATIC" ||
            asset.url?.match(/\.(jpg|jpeg|png|gif|bmp|tif|tiff|webp|svg)$/i)
          );
        }
        return true;
      });

      if (sampleAsset) {
        console.log(`   ${sampleAsset.url}`);
      }
    } else {
      console.log(
        "\n⚠️  No assets were updated. Check your asset type selection."
      );
    }

    rl.close();
  }
}

// Run the script
const updater = new PathUpdater();
updater.run().catch((error) => {
  console.error("❌ Script error:", error);
  process.exit(1);
});
