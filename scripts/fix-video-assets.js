#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONFIG_PATH = path.join(__dirname, "..", "public", "config.json");
const ASSETS_DIR = path.join(__dirname, "..", "public", "assets");

// Read the current config
const config = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));

// Get all actual MP4 files
const mp4Files = fs
  .readdirSync(ASSETS_DIR)
  .filter((file) => file.endsWith(".mp4"))
  .sort();

console.log("Found MP4 files:", mp4Files);

// Remove existing video assets that don't match actual files
config.assets = config.assets.filter((asset) => {
  if (asset.type === "VIDEO") {
    const filename = asset.url.split("/").pop();
    const exists = mp4Files.includes(filename);
    if (!exists) {
      console.log(`Removing non-existent video asset: ${filename}`);
    }
    return exists;
  }
  return true;
});

// Add any missing video assets
const existingVideoUrls = config.assets
  .filter((asset) => asset.type === "VIDEO")
  .map((asset) => asset.url.split("/").pop());

mp4Files.forEach((filename, index) => {
  if (!existingVideoUrls.includes(filename)) {
    console.log(`Adding missing video asset: ${filename}`);

    // Parse filename to extract metadata
    const parts = filename.replace(".mp4", "").split("_");
    const phase = parts[0]; // Phase1
    const type = parts[1]; // Video
    const model = parts[2]; // R1300R
    const description = parts[3]; // full-video, no-riding, riding
    const textOverlay = parts[4]; // no-text, text
    const orientation = parts[5]; // landscape, portrait
    const dimensions = parts[6]; // 3840x2160, 1080x1920, etc.

    // Create a more readable title
    let title = description
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    if (description === "full-video") title = "Full Video";
    if (description === "no-riding") title = "Static Scene";
    if (description === "riding") title = "Riding Scene";

    const newAsset = {
      id: `video_${index + 1}`,
      title: title,
      phase: phase.toUpperCase().replace("PHASE", "PHASE "),
      type: "VIDEO",
      model: model,
      description: description,
      textOverlay: textOverlay,
      orientation: orientation,
      dimensions: dimensions,
      fileExtension: ".mp4",
      originalFileName: filename,
      newAssetName: filename,
      thumbnail: `/assets/${filename}`,
      url: `/assets/${filename}`,
      isDemo: false,
    };

    config.assets.push(newAsset);
  }
});

// Update the timestamp
config.lastModified = new Date().toISOString();

// Write the updated config
fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));

console.log(`✅ Updated config.json with ${mp4Files.length} video assets`);
console.log(`Total assets: ${config.assets.length}`);
