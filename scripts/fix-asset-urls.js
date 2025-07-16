import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// File paths
const configPath = path.join(path.dirname(__dirname), "public", "config.json");
const assetsDir = path.join(path.dirname(__dirname), "public", "assets");

// Main function
function fixAssetUrls() {
  try {
    console.log("🔧 Starting asset URL fix process...\n");

    // Read current config
    console.log("📖 Reading current config...");
    const config = JSON.parse(fs.readFileSync(configPath, "utf8"));

    // Get list of actual files in assets directory
    console.log("📁 Scanning assets directory...");
    const actualFiles = fs.readdirSync(assetsDir);
    const actualFileMap = new Map();

    // Create a map of base names to actual files
    actualFiles.forEach((file) => {
      const baseName = path.parse(file).name;
      actualFileMap.set(baseName, file);
    });

    let updatedCount = 0;
    let notFoundCount = 0;
    let duplicateCount = 0;
    const notFoundFiles = [];
    const seenUrls = new Set();
    const seenDescriptions = new Set();
    const duplicateEntries = [];

    console.log("🔍 Checking for duplicates and fixing URLs...\n");

    // Process each asset
    config.assets = config.assets.filter((asset, index) => {
      const currentUrl = asset.url;
      const currentDescription = asset.description;

      // Check for duplicate URLs
      if (seenUrls.has(currentUrl)) {
        console.log(`🚫 Duplicate URL found: ${currentUrl} (removing)`);
        duplicateEntries.push(asset);
        duplicateCount++;
        return false; // Remove this asset
      }

      // Check for duplicate descriptions (potential issue)
      if (seenDescriptions.has(currentDescription)) {
        console.log(
          `⚠️  Duplicate description found: "${currentDescription}" - URL: ${currentUrl}`
        );
        // Don't remove, but flag it
      }

      seenUrls.add(currentUrl);
      seenDescriptions.add(currentDescription);

      // Extract filename from current URL
      const currentFilename = path.basename(currentUrl);
      const baseName = path.parse(currentFilename).name;

      // Check if we have the actual file
      if (actualFileMap.has(baseName)) {
        const actualFile = actualFileMap.get(baseName);
        const newUrl = `/assets/${actualFile}`;

        if (currentUrl !== newUrl) {
          console.log(`✅ Updating: ${currentUrl} → ${newUrl}`);
          asset.url = newUrl;
          updatedCount++;
        }
      } else {
        console.log(`❌ File not found for: ${currentUrl}`);
        notFoundFiles.push(currentUrl);
        notFoundCount++;
      }

      return true; // Keep this asset
    });

    // Update metadata
    const now = new Date().toISOString();
    config.metadata = {
      ...config.metadata,
      lastModified: now,
      modifiedBy: "fix-asset-urls-script",
      version: (config.metadata?.version || 0) + 1,
    };

    // Summary
    console.log("\n📊 SUMMARY:");
    console.log(`✅ URLs updated: ${updatedCount}`);
    console.log(`🚫 Duplicates removed: ${duplicateCount}`);
    console.log(`❌ Files not found: ${notFoundCount}`);
    console.log(`📁 Total assets: ${config.assets.length}`);

    if (notFoundFiles.length > 0) {
      console.log("\n❌ Files not found:");
      notFoundFiles.forEach((file) => console.log(`   - ${file}`));
    }

    if (duplicateEntries.length > 0) {
      console.log("\n🚫 Removed duplicates:");
      duplicateEntries.forEach((entry) =>
        console.log(`   - ${entry.url} (${entry.description})`)
      );
    }

    if (updatedCount > 0 || duplicateCount > 0) {
      // Write updated config
      console.log("\n💾 Writing updated config...");
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
      console.log("✅ Config updated successfully!");

      // Sync to Redis
      console.log("☁️ Syncing to Redis...");
      config.lastModified = new Date().toISOString();
      // Note: You'll need to restart the server or call the sync endpoint to update Redis
      console.log(
        "⚠️  Remember to restart the server or call /api/config/sync to update Redis"
      );
    } else {
      console.log("\n✅ No changes needed!");
    }
  } catch (error) {
    console.error("❌ Error fixing asset URLs:", error.message);
    process.exit(1);
  }
}

// Run the fix
fixAssetUrls();
