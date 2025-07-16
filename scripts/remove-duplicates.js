import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { kv } from "@vercel/kv";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const configPath = path.join(path.dirname(__dirname), "public", "config.json");

async function removeDuplicates() {
  try {
    console.log("📖 Reading current config...");
    const config = JSON.parse(fs.readFileSync(configPath, "utf8"));

    console.log(
      `📊 Total assets before deduplication: ${config.assets.length}`
    );

    // Remove duplicates based on newAssetName (or multiple fields for exact match)
    const seen = new Set();
    const uniqueAssets = [];

    config.assets.forEach((asset, index) => {
      // Create a unique key based on critical fields
      const key =
        asset.newAssetName ||
        `${asset.title}_${asset.model}_${asset.type}_${asset.phase}_${
          asset.description || ""
        }_${asset.textOverlay || ""}_${asset.orientation || ""}_${
          asset.dimensions || ""
        }`;

      if (!seen.has(key)) {
        seen.add(key);
        uniqueAssets.push(asset);
      } else {
        console.log(`🗑️  Removing duplicate: ${asset.title} (${key})`);
      }
    });

    const removedCount = config.assets.length - uniqueAssets.length;
    config.assets = uniqueAssets;

    // Update metadata
    const now = new Date().toISOString();
    config.metadata = {
      lastModified: now,
      modifiedBy: "remove-duplicates-script",
      version: (config.metadata?.version || 0) + 1,
      source: "deduplication",
    };

    console.log(`✅ Removed ${removedCount} duplicate assets`);
    console.log(`📊 Total assets after deduplication: ${config.assets.length}`);

    // Write updated config to local file
    console.log("💾 Writing deduplicated config to local file...");
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

    // Update Redis
    console.log("☁️ Updating Redis with deduplicated config...");
    try {
      await kv.set("bmw:config", config);
      console.log("✅ Redis updated successfully!");
    } catch (redisError) {
      console.warn(
        "⚠️ Redis update failed, but local file updated:",
        redisError.message
      );
    }

    console.log(`🕒 Timestamp: ${now}`);
    console.log("✅ Deduplication complete!");
  } catch (error) {
    console.error("❌ Error removing duplicates:", error.message);
    process.exit(1);
  }
}

removeDuplicates().catch(console.error);
