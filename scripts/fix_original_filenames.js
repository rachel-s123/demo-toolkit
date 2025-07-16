import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Replicate __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONFIG_PATH = path.join(__dirname, "..", "public", "config.json");
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

  // Create reverse mapping: new asset name (base) -> original filename
  const reverseMap = {};
  for (let i = 1; i < rows.length; i++) {
    const columns = rows[i].split(",");
    if (columns.length > Math.max(originalNameIndex, newNameIndex)) {
      const originalNameWithExt = columns[originalNameIndex].trim();
      const newNameWithExt = columns[newNameIndex].trim();
      if (originalNameWithExt && newNameWithExt) {
        // Map new asset name (base without extension) to original filename
        const newBaseName = path.parse(newNameWithExt).name;
        reverseMap[newBaseName] = originalNameWithExt;
      }
    }
  }
  return reverseMap;
}

function main() {
  console.log("Starting originalFileName correction process...");

  // Parse CSV for reverse filename mappings
  let reverseMap;
  try {
    reverseMap = parseCSV(CSV_PATH);
    console.log(
      `Loaded ${
        Object.keys(reverseMap).length
      } reverse filename mappings from CSV`
    );
  } catch (error) {
    console.error(`Error parsing CSV: ${error.message}`);
    return;
  }

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
      const currentOriginalFileName = asset.originalFileName;
      const newAssetName = asset.newAssetName;

      // Get the base name from the new asset name (remove .mov extension)
      const newBaseName = path.parse(newAssetName).name;

      // Look up the original filename from CSV
      const csvOriginalFileName = reverseMap[newBaseName];

      if (csvOriginalFileName) {
        // Update the originalFileName to the CSV original
        asset.originalFileName = csvOriginalFileName;
        console.log(
          `Updated ${asset.id}: ${currentOriginalFileName} -> ${csvOriginalFileName}`
        );
        updatedCount++;
      } else {
        console.log(
          `Skipped ${asset.id}: No CSV mapping found for new asset name ${newBaseName}`
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
