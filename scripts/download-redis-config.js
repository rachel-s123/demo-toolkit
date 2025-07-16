#!/usr/bin/env node

/**
 * Download Redis Configuration Script
 *
 * This script downloads the current configuration from Redis and saves it to a local file.
 * Previously this functionality was available via a UI button in the header.
 *
 * Usage: node scripts/download-redis-config.js [output-filename]
 *
 * Example:
 *   node scripts/download-redis-config.js
 *   node scripts/download-redis-config.js my-config.json
 */

const fs = require("fs");
const path = require("path");

// Configuration
const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:3000";
const DEFAULT_FILENAME = "redis_config.json";

async function downloadRedisConfig(outputFilename = DEFAULT_FILENAME) {
  try {
    console.log("🔄 Downloading Redis configuration...");

    const response = await fetch(`${API_BASE_URL}/api/get-redis-config`);

    if (!response.ok) {
      let errorMessage;
      try {
        const errorData = await response.json();
        errorMessage =
          errorData.error || `HTTP ${response.status}: ${response.statusText}`;
      } catch {
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    const configData = await response.text();

    // Ensure the output directory exists
    const outputPath = path.resolve(outputFilename);
    const outputDir = path.dirname(outputPath);

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Write the configuration to file
    fs.writeFileSync(outputPath, configData, "utf8");

    console.log(`✅ Redis configuration downloaded successfully!`);
    console.log(`📁 Saved to: ${outputPath}`);
    console.log(`📊 File size: ${(configData.length / 1024).toFixed(2)} KB`);

    // Parse and show basic stats
    try {
      const config = JSON.parse(configData);
      console.log("\n📋 Configuration Summary:");
      console.log(`   Assets: ${config.assets?.length || 0}`);
      console.log(`   Messages: ${config.messages?.length || 0}`);
      console.log(`   Guides: ${config.guides?.length || 0}`);
      console.log(`   Journey Steps: ${config.journeySteps?.length || 0}`);
      console.log(
        `   Last Modified: ${config.metadata?.lastModified || "Unknown"}`
      );
      console.log(`   Version: ${config.metadata?.version || "Unknown"}`);
    } catch (parseError) {
      console.log(
        "⚠️  Could not parse configuration for summary (but file saved successfully)"
      );
    }
  } catch (error) {
    console.error("❌ Error downloading Redis configuration:", error.message);

    if (error.message.includes("ECONNREFUSED")) {
      console.error("💡 Make sure the API server is running on", API_BASE_URL);
    }

    process.exit(1);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const outputFilename = args[0] || DEFAULT_FILENAME;

// Validate filename
if (outputFilename && !outputFilename.endsWith(".json")) {
  console.warn("⚠️  Warning: Output filename should end with .json");
}

// Run the download
downloadRedisConfig(outputFilename);
