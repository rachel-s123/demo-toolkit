import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { kv } from "@vercel/kv";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// File paths
const csvPath = path.join(
  path.dirname(__dirname),
  "data",
  "All_R-Series_Assets_Naming_Convention.csv"
);
const configPath = path.join(path.dirname(__dirname), "public", "config.json");

// Function to parse CSV
function parseCSV(csvContent) {
  const lines = csvContent.trim().split("\n");
  const headers = lines[0].split(",");

  return lines.slice(1).map((line, index) => {
    const values = line.split(",");
    const asset = {};

    headers.forEach((header, i) => {
      asset[header.trim()] = values[i]?.trim() || "";
    });

    return asset;
  });
}

// Function to convert CSV row to Asset object
function csvRowToAsset(csvRow, index) {
  // Generate unique ID
  const id = `phase1_${index + 1}`;

  // Generate title from description
  const title = csvRow.Description.split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  // Map CSV values to Asset interface
  return {
    id,
    title,
    phase: csvRow.Phase, // Will be formatted later
    type: csvRow["Asset Type"].toUpperCase(), // "Video" -> "VIDEO", "Static" -> "STATIC"
    model: csvRow["Bike Model"], // "R1300RS" -> "R1300 RS" (need to add space)
    description: csvRow.Description,
    textOverlay: csvRow["Text Overlay"],
    orientation: csvRow.Orientation,
    dimensions: csvRow.Dimensions,
    fileExtension: csvRow["File Extension"],
    originalFileName: csvRow["Original File Name"],
    newAssetName: csvRow["New Asset Name"],
    thumbnail: `/assets/${csvRow["New Asset Name"]}`, // Use the asset itself as thumbnail for now
    url: `/assets/${csvRow["New Asset Name"]}`,
    isDemo: false, // These are real assets from CSV
  };
}

// Function to format phase name
function formatPhase(phase) {
  return phase.replace(/Phase(\d+)/, "PHASE $1");
}

// Function to format model name (add space)
function formatModel(model) {
  return model.replace(/R1300([A-Z]+)/, "R1300 $1");
}

// Main function
async function importCSVToConfig() {
  try {
    // Read CSV file
    console.log("📖 Reading CSV file...");
    const csvContent = fs.readFileSync(csvPath, "utf8");

    // Parse CSV
    console.log("🔄 Parsing CSV data...");
    const csvData = parseCSV(csvContent);
    console.log(`📊 Found ${csvData.length} assets in CSV`);

    // Convert to Asset objects
    console.log("🔄 Converting to Asset objects...");
    const newAssets = csvData.map((row, index) => {
      const asset = csvRowToAsset(row, index);

      // Format phase and model
      asset.phase = formatPhase(asset.phase);
      asset.model = formatModel(asset.model);

      return asset;
    });

    // Read current config
    console.log("📖 Reading current config...");
    const config = JSON.parse(fs.readFileSync(configPath, "utf8"));

    // Filter out existing demo assets and prevent duplicates
    console.log("🔄 Updating config with new assets...");
    const existingRealAssets = config.assets.filter((asset) => !asset.isDemo);

    // Create a set of existing asset keys to prevent duplicates
    const existingKeys = new Set(
      existingRealAssets.map(
        (asset) =>
          asset.newAssetName ||
          `${asset.title}_${asset.model}_${asset.type}_${asset.phase}_${
            asset.description || ""
          }_${asset.textOverlay || ""}_${asset.orientation || ""}_${
            asset.dimensions || ""
          }`
      )
    );

    // Filter out new assets that already exist
    const uniqueNewAssets = newAssets.filter((asset) => {
      const key =
        asset.newAssetName ||
        `${asset.title}_${asset.model}_${asset.type}_${asset.phase}_${
          asset.description || ""
        }_${asset.textOverlay || ""}_${asset.orientation || ""}_${
          asset.dimensions || ""
        }`;
      if (existingKeys.has(key)) {
        console.log(`⚠️  Skipping duplicate asset: ${asset.title} (${key})`);
        return false;
      }
      return true;
    });

    config.assets = [...existingRealAssets, ...uniqueNewAssets];

    // Update metadata with current timestamp
    const now = new Date().toISOString();
    config.metadata = {
      lastModified: now,
      modifiedBy: "csv-import-script",
      version: (config.metadata?.version || 0) + 1,
      source: "csv-import",
    };

    // Write updated config to local file
    console.log("💾 Writing updated config to local file...");
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

    // Update Redis with the new config
    console.log("☁️ Updating Redis with new config...");
    try {
      await kv.set("bmw:config", config);
      console.log("✅ Redis updated successfully!");
    } catch (redisError) {
      console.warn(
        "⚠️ Redis update failed, but local file updated:",
        redisError.message
      );
    }

    console.log("✅ Successfully imported CSV assets to config!");
    console.log(`📊 Total assets in config: ${config.assets.length}`);
    console.log(`📊 New assets added: ${uniqueNewAssets.length}`);
    console.log(`📊 Existing real assets kept: ${existingRealAssets.length}`);
    console.log(
      `📊 Duplicates skipped: ${newAssets.length - uniqueNewAssets.length}`
    );
    console.log(`🕒 Timestamp: ${now}`);

    // Show sample of imported assets
    console.log("\n📋 Sample of imported assets:");
    newAssets.slice(0, 3).forEach((asset) => {
      console.log(`  - ${asset.title} (${asset.model}, ${asset.type})`);
    });
  } catch (error) {
    console.error("❌ Error importing CSV:", error.message);
    process.exit(1);
  }
}

// Run the import
importCSVToConfig().catch(console.error);
