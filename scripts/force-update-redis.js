import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { kv } from "@vercel/kv";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONFIG_PATH = path.join(path.dirname(__dirname), "public", "config.json");
const REDIS_CONFIG_KEY = "bmw:config"; // Define the key once

async function forceUpdateRedis() {
  try {
    console.log("🔄 Force updating Redis with local config.json...");

    // 1. Fetch current config from Redis
    console.log("🔍 Fetching current configuration from Redis...");
    let redisConfig = null;
    let redisVersion = 0;
    let redisLastModified = "1970-01-01T00:00:00.000Z"; // Default for comparison if Redis is empty

    try {
      redisConfig = await kv.get(REDIS_CONFIG_KEY);
      if (redisConfig && redisConfig.metadata) {
        redisVersion = parseInt(redisConfig.metadata.version, 10) || 0;
        redisLastModified =
          redisConfig.metadata.lastModified || redisLastModified;
        console.log(
          "ℹ️  Found config in Redis: Version " +
            redisVersion +
            ", Last Modified: " +
            redisLastModified
        );
      } else if (redisConfig) {
        console.log(
          "ℹ️  Found config in Redis, but it lacks full metadata. Comparing top-level lastModified."
        );
        redisLastModified = redisConfig.lastModified || redisLastModified; // Use top-level if metadata one is missing
      } else {
        console.log(
          "ℹ️  No configuration found in Redis (or it's null). Will proceed with local config."
        );
      }
    } catch (kvError) {
      console.warn(
        "⚠️  Could not fetch from Redis (error: " +
          kvError.message +
          "). Will attempt to proceed cautiously."
      );
      // Allow to proceed, connection test later will be more definitive for write failure
    }

    // 2. Load local config
    if (!fs.existsSync(CONFIG_PATH)) {
      throw new Error("Config file not found at: " + CONFIG_PATH);
    }
    const localConfigString = fs.readFileSync(CONFIG_PATH, "utf8");
    const localConfig = JSON.parse(localConfigString);

    const localMetadata = localConfig.metadata || {};
    const localVersion = parseInt(localMetadata.version, 10) || 0;
    const localLastModified =
      localMetadata.lastModified || "1970-01-01T00:00:00.000Z";

    console.log(
      "📁 Loaded local config: Version " +
        localVersion +
        ", Last Modified: " +
        localLastModified +
        ", " +
        localConfig.assets.length +
        " assets"
    );

    // 3. Compare versions/timestamps
    if (redisConfig) {
      const redisIsNewerByTimestamp = redisLastModified > localLastModified;
      const timestampsAreSame = redisLastModified === localLastModified;
      const redisIsNewerByVersion = redisVersion > localVersion;

      if (
        redisIsNewerByTimestamp ||
        (timestampsAreSame && redisIsNewerByVersion)
      ) {
        const redisBackupPath = path.join(
          path.dirname(__dirname),
          "public",
          "config.FROM_REDIS.json"
        );
        fs.writeFileSync(redisBackupPath, JSON.stringify(redisConfig, null, 2));

        console.error(
          "❌ ERROR: Data in Redis appears to be NEWER or CONFLICTING with your local config.json!"
        );
        if (redisIsNewerByTimestamp) {
          console.error(
            "   Reason: Redis Last Modified (" +
              redisLastModified +
              ") is newer than Local Last Modified (" +
              localLastModified +
              ")."
          );
        } else {
          console.error(
            "   Reason: Timestamps are identical (" +
              redisLastModified +
              "), but Redis Version (" +
              redisVersion +
              ") is higher than Local Version (" +
              localVersion +
              ")."
          );
        }
        console.error(
          "   This may indicate live edits (e.g., messages, guides) have occurred on Vercel."
        );
        console.error("   To prevent data loss, the script has been aborted.");
        console.error(
          "   The current data from Redis has been saved to: " + redisBackupPath
        );
        console.error(
          "   Please compare this file with your local public/config.json, merge any necessary changes into public/config.json,"
        );
        console.error(
          "   update its 'lastModified' and 'version' in the metadata accordingly, and then re-run this script."
        );
        process.exit(1);
      } else {
        console.log(
          "✅ Your local config.json appears to be the same or newer than the one in Redis. Proceeding with update."
        );
      }
    }

    const now = new Date().toISOString();
    if (!localConfig.metadata) {
      localConfig.metadata = {};
    }
    localConfig.metadata.lastModified = now;
    localConfig.metadata.modifiedBy = "force-update-script";
    localConfig.metadata.version =
      (parseInt(localMetadata.version, 10) || 0) + 1;
    localConfig.metadata.source = "file";

    localConfig.lastModified = now;

    console.log(
      "🕒 Setting timestamp to: " +
        now +
        ", New Version: " +
        localConfig.metadata.version
    );

    const videoAssets = localConfig.assets.filter(
      (asset) => asset.type === "VIDEO"
    );
    const movVideos = videoAssets.filter(
      (asset) => asset.fileExtension === ".mov"
    );
    const mp4Videos = videoAssets.filter(
      (asset) => asset.fileExtension === ".mp4"
    );
    const staticAssets = localConfig.assets.filter(
      (asset) => asset.type === "STATIC"
    );

    console.log("📊 Asset breakdown:");
    console.log("   - Total assets: " + localConfig.assets.length);
    console.log("   - Static assets: " + staticAssets.length);
    console.log("   - Video assets: " + videoAssets.length);
    console.log("   - .mov videos: " + movVideos.length);
    console.log("   - .mp4 videos: " + mp4Videos.length);

    console.log("🔗 Testing Redis connection (before writing)...");
    try {
      await kv.get("test_before_write");
      console.log("✅ Redis connection successful for writing");
    } catch (redisError) {
      throw new Error(
        "Redis connection test failed before writing: " + redisError.message
      );
    }

    console.log("☁️ Updating Redis with processed local config...");
    await kv.set(REDIS_CONFIG_KEY, localConfig);

    fs.writeFileSync(CONFIG_PATH, JSON.stringify(localConfig, null, 2));

    console.log("✅ Successfully force updated Redis!");
    console.log("📝 New version pushed: " + localConfig.metadata.version);
    console.log("🕒 Timestamp pushed: " + now);

    if (movVideos.length > 0) {
      console.log("\n🎬 Sample .mov videos:");
      movVideos.slice(0, 5).forEach((video) => {
        console.log(
          "  - " +
            video.title +
            " (" +
            video.model +
            ") - " +
            video.newAssetName
        );
      });
    }

    if (mp4Videos.length > 0) {
      console.log(
        "\n⚠️  Warning: " +
          mp4Videos.length +
          " videos still have .mp4 extension"
      );
      console.log(
        "   These may not play in the UI. Consider running video update scripts first."
      );
    }

    console.log(
      "\n🚀 Redis update complete! Your Vercel deployment should now use the updated config."
    );
  } catch (error) {
    console.error("❌ Error force updating Redis:", error.message);
    console.error("\n💡 Troubleshooting:");
    console.error(
      "   - Check your .env file has KV_REST_API_URL and KV_REST_API_TOKEN"
    );
    console.error("   - Ensure public/config.json exists and is valid JSON");
    console.error("   - Verify your Redis credentials are correct");
    if (error.message.includes("Config file not found")) {
      // Specific hint if config file isn't there
    } else if (error.message.includes("Redis connection")) {
      // Specific hint for Redis connection issues
    }
    process.exit(1);
  }
}

if (process.argv.includes("--help") || process.argv.includes("-h")) {
  console.log(`
🔧 Force Update Redis Script (Safer Version)

This script forces Redis to use your local config.json file.
It includes safety checks to prevent overwriting newer data in Redis.

How it works:
1. Fetches the current config from Redis.
2. Compares its 'lastModified' timestamp and 'version' with your local public/config.json.
3. If Redis data is newer or conflicting:
   - Saves the Redis data to public/config.FROM_REDIS.json.
   - Prints an error and instructions.
   - Aborts the script to prevent data loss.
   You must then manually merge changes from config.FROM_REDIS.json into
   public/config.json and re-run the script.
4. If local data is the same or newer (or Redis is empty):
   - Updates your local config.json with a new timestamp and incremented version.
   - Pushes this updated local config to Redis.
   - Saves the metadata changes back to your local public/config.json.

Usage:
  node scripts/force-update-redis.js

Environment Variables Required:
  KV_REST_API_URL     - Your Upstash Redis URL
  KV_REST_API_TOKEN   - Your Upstash Redis token

⚠️  Warning: If local config is deemed newer, this overwrites Redis data with your local file!
`);
  process.exit(0);
}

forceUpdateRedis();
