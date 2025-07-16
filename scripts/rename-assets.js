import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// File paths
const csvPath = path.join(
  path.dirname(__dirname),
  "data",
  "All_R-Series_Assets_Naming_Convention.csv"
);
const sourceDir = path.join(path.dirname(__dirname), "source-assets"); // Where original files are located
const targetDir = path.join(path.dirname(__dirname), "public", "assets"); // Where renamed files go

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

// Function to ensure directory exists
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`📁 Created directory: ${dirPath}`);
  }
}

// Function to copy and rename file
function copyAndRenameFile(sourcePath, targetPath) {
  try {
    fs.copyFileSync(sourcePath, targetPath);
    return true;
  } catch (error) {
    console.error(
      `❌ Error copying ${sourcePath} to ${targetPath}:`,
      error.message
    );
    return false;
  }
}

// Main function
function renameAssets(fileType = null) {
  try {
    console.log("🚀 Starting asset renaming process...\n");

    // Check if source directory exists
    if (!fs.existsSync(sourceDir)) {
      console.error(`❌ Source directory not found: ${sourceDir}`);
      console.log(
        "📝 Please create the source-assets directory and place your original asset files there."
      );
      console.log("📝 The directory structure should be:");
      console.log("   source-assets/");
      console.log("   ├── DF25_000257027_1.mp4");
      console.log("   ├── DF25_000257027_2.mp4");
      console.log("   └── ... (other original files)");
      process.exit(1);
    }

    // Read CSV file
    console.log("📖 Reading CSV file...");
    const csvContent = fs.readFileSync(csvPath, "utf8");

    // Parse CSV
    console.log("🔄 Parsing CSV data...");
    const csvData = parseCSV(csvContent);
    console.log(`📊 Found ${csvData.length} assets to rename\n`);

    // Ensure target directory exists
    ensureDirectoryExists(targetDir);

    // Get list of files in source directory
    const sourceFiles = fs.readdirSync(sourceDir);
    console.log(`📁 Found ${sourceFiles.length} files in source directory\n`);

    // Track results
    let successCount = 0;
    let notFoundCount = 0;
    let errorCount = 0;
    let skippedCount = 0;
    const notFoundFiles = [];
    const skippedFiles = [];

    // Process each CSV row
    csvData.forEach((row, index) => {
      const originalFileName = row["Original File Name"];
      const newAssetName = row["New Asset Name"];

      if (!originalFileName || !newAssetName) {
        console.log(`⚠️  Skipping row ${index + 1}: Missing filename data`);
        errorCount++;
        return;
      }

      // Extract base name and extension from CSV
      const originalBaseName = path.parse(originalFileName).name;
      const csvExtension = path.parse(originalFileName).ext;
      const newBaseName = path.parse(newAssetName).name;
      const newExtension = path.parse(newAssetName).ext;

      // Look for files with the same base name but potentially different extensions
      const matchingFiles = sourceFiles.filter((file) => {
        const fileBaseName = path.parse(file).name;
        const fileExtension = path.parse(file).ext;

        // If a specific file type is requested, only match that extension
        if (fileType) {
          return (
            fileBaseName === originalBaseName && fileExtension === fileType
          );
        }

        // Otherwise, match any extension with the same base name
        return fileBaseName === originalBaseName;
      });

      if (matchingFiles.length === 0) {
        console.log(`❌ File not found: ${originalFileName} (or variants)`);
        notFoundFiles.push(originalFileName);
        notFoundCount++;
        return;
      }

      // Use the first matching file (in case there are multiple with different extensions)
      const actualSourceFile = matchingFiles[0];
      const actualExtension = path.parse(actualSourceFile).ext;

      // Create paths
      const sourcePath = path.join(sourceDir, actualSourceFile);

      // Use the actual file extension in the target name
      const actualNewAssetName = newBaseName + actualExtension;
      const targetPath = path.join(targetDir, actualNewAssetName);

      // Check if target file already exists (overwrite protection)
      if (fs.existsSync(targetPath)) {
        console.log(
          `⚠️  Skipping ${actualSourceFile} → ${actualNewAssetName} (target file already exists)`
        );
        skippedFiles.push({
          original: actualSourceFile,
          target: actualNewAssetName,
        });
        skippedCount++;
        return;
      }

      // Copy and rename file
      if (copyAndRenameFile(sourcePath, targetPath)) {
        console.log(`✅ ${actualSourceFile} → ${actualNewAssetName}`);
        successCount++;
      } else {
        errorCount++;
      }
    });

    // Summary
    console.log("\n📊 RENAMING SUMMARY:");
    console.log(`✅ Successfully renamed: ${successCount} files`);
    console.log(`❌ Files not found: ${notFoundCount} files`);
    console.log(`⚠️  Skipped (target exists): ${skippedCount} files`);
    console.log(`⚠️  Errors: ${errorCount} files`);
    console.log(`📁 Files saved to: ${targetDir}`);

    if (notFoundFiles.length > 0) {
      console.log("\n📋 Files not found in source directory:");
      notFoundFiles.forEach((file) => console.log(`  - ${file}`));
      console.log(
        "\n💡 Make sure all original files are placed in the source-assets directory"
      );
    }

    if (skippedFiles.length > 0) {
      console.log("\n📋 Files skipped to prevent overwriting:");
      skippedFiles.forEach(({ original, target }) =>
        console.log(`  - ${original} → ${target}`)
      );
      console.log(
        "\n💡 These files already exist in the target directory and were not overwritten"
      );
    }

    if (successCount > 0) {
      console.log("\n🎉 Asset renaming completed successfully!");
      console.log(
        "💡 You can now run the CSV import script to update the config.json"
      );
    }
  } catch (error) {
    console.error("❌ Error during asset renaming:", error.message);
    process.exit(1);
  }
}

// Show usage information
function showUsage() {
  console.log("📝 ASSET RENAMING SCRIPT");
  console.log("========================\n");
  console.log(
    "This script renames asset files from their original names to the standardized naming convention.\n"
  );
  console.log("SETUP:");
  console.log('1. Create a "source-assets" directory in the project root');
  console.log(
    "2. Place all original asset files (from CSV column A) in that directory"
  );
  console.log("3. Run this script to rename and copy them to public/assets/\n");
  console.log("USAGE:");
  console.log("  npm run rename-assets");
  console.log("  npm run rename-assets -- --filetype jpg");
  console.log("  npm run rename-assets -- -f .tif\n");
  console.log("OPTIONS:");
  console.log(
    "  --filetype, -f <ext>  Only process files with specific extension (e.g., jpg, tif, png)"
  );
  console.log(
    "                        If not specified, will match any extension with the same base name\n"
  );
  console.log("The script will:");
  console.log("- Read the CSV file for original → new filename mappings");
  console.log("- Copy files from source-assets/ to public/assets/");
  console.log("- Rename them using the standardized naming convention");
  console.log(
    "- Use the actual file extension found (preserves jpg, tif, etc.)"
  );
  console.log("- Provide a detailed summary of the operation\n");
}

// Check if this is a help request
const args = process.argv.slice(2);
if (args.includes("--help") || args.includes("-h")) {
  showUsage();
  process.exit(0);
}

// Parse command line arguments
let targetFileType = null;
const fileTypeIndex = args.findIndex(
  (arg) => arg === "--filetype" || arg === "-f"
);
if (fileTypeIndex !== -1 && args[fileTypeIndex + 1]) {
  targetFileType = args[fileTypeIndex + 1];
  if (!targetFileType.startsWith(".")) {
    targetFileType = "." + targetFileType;
  }
  console.log(`🎯 Looking for files with extension: ${targetFileType}\n`);
}

// Run the renaming process
renameAssets(targetFileType);
