import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Replicate __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONFIG_PATH = path.join(__dirname, "..", "public", "config.json");
const VIDEOS_DIR = path.join(__dirname, "..", "public", "assets", "videos");
const CSV_PATH = path.join(
  __dirname,
  "..",
  "data",
  "All_R-Series_Assets_Naming_Convention.csv"
);

function parseCSV(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  let rows = content.trim().split("\r\n");
  if (rows.length <= 1 && content.includes("\n")) {
    rows = content.trim().split("\n");
  }
  const header = rows[0].split(",");
  const originalNameIndex = header.indexOf("Original File Name");
  const newNameIndex = header.indexOf("New Asset Name");

  if (originalNameIndex === -1 || newNameIndex === -1) {
    throw new Error(
      'CSV must contain "Original File Name" and "New Asset Name" columns.'
    );
  }

  const map = {};
  for (let i = 1; i < rows.length; i++) {
    const columns = rows[i].split(",");
    if (columns.length > Math.max(originalNameIndex, newNameIndex)) {
      const originalNameWithExt = columns[originalNameIndex].trim();
      const newNameWithExt = columns[newNameIndex].trim();
      if (originalNameWithExt && newNameWithExt) {
        // Map original filename (with .mp4) to new name (base without extension)
        map[originalNameWithExt] = path.parse(newNameWithExt).name;
      }
    }
  }
  return map;
}

function getAvailableMovFiles() {
  try {
    const files = fs.readdirSync(VIDEOS_DIR);
    return new Set(
      files.filter((file) => path.extname(file).toLowerCase() === ".mov")
    );
  } catch (error) {
    console.error(`Error reading videos directory: ${error.message}`);
    return new Set();
  }
}

function main() {
  console.log("Starting config.json video update process...");

  // Parse CSV for filename mappings
  let nameMap;
  try {
    nameMap = parseCSV(CSV_PATH);
    console.log(
      `Loaded ${Object.keys(nameMap).length} filename mappings from CSV`
    );
  } catch (error) {
    console.error(`Error parsing CSV: ${error.message}`);
    return;
  }

  // Get available .mov files
  const availableMovFiles = getAvailableMovFiles();
  console.log(`Found ${availableMovFiles.size} .mov files in videos directory`);

  // Read config.json
  let config;
  try {
    const configContent = fs.readFileSync(CONFIG_PATH, "utf8");
    config = JSON.parse(configContent);
  } catch (error) {
    console.error(`Error reading config.json: ${error.message}`);
    return;
  }

  let updatedCount = 0;
  let skippedCount = 0;

  // Process each asset
  config.assets.forEach((asset, index) => {
    if (asset.type === "VIDEO") {
      const originalFileName = asset.originalFileName;

      // Get the new asset name from CSV mapping
      const newBaseName = nameMap[originalFileName];

      if (newBaseName) {
        const expectedMovFile = `${newBaseName}.mov`;

        // Check if the .mov file exists
        if (availableMovFiles.has(expectedMovFile)) {
          // Update the asset to use .mov
          asset.fileExtension = ".mov";
          asset.newAssetName = expectedMovFile;
          asset.thumbnail = `/assets/videos/${expectedMovFile}`;
          asset.url = `/assets/videos/${expectedMovFile}`;

          console.log(
            `Updated ${asset.id}: ${originalFileName} -> ${expectedMovFile}`
          );
          updatedCount++;
        } else {
          console.log(
            `Skipped ${asset.id}: .mov file not found (${expectedMovFile})`
          );
          skippedCount++;
        }
      } else {
        console.log(
          `Skipped ${asset.id}: No CSV mapping found for ${originalFileName}`
        );
        skippedCount++;
      }
    }
  });

  // Write updated config back to file
  try {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
    console.log(`\nSuccessfully updated config.json:`);
    console.log(`- Updated: ${updatedCount} video entries`);
    console.log(`- Skipped: ${skippedCount} video entries`);
  } catch (error) {
    console.error(`Error writing config.json: ${error.message}`);
  }
}

main();
