import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Replicate __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CSV_PATH = path.join(
  __dirname,
  "..",
  "data",
  "All_R-Series_Assets_Naming_Convention.csv"
);
const VIDEOS_DIR = path.join(__dirname, "..", "public", "assets", "videos");
const REPORT = {
  renamed: [],
  alreadyCorrect: [],
  skippedTargetExists: [],
  skippedNotInCsv: [],
  errors: [],
};

function parseCSV(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  let rows = content.trim().split("\r\n"); // Adjusted for \r\n line endings
  if (rows.length <= 1 && content.includes("\n")) {
    // Fallback for \n if \r\n not found or only one line
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
        map[path.parse(originalNameWithExt).name] =
          path.parse(newNameWithExt).name;
      }
    }
  }
  return map;
}

function main() {
  console.log("Starting video rename process...");
  console.log(`Reading CSV from: ${CSV_PATH}`);
  console.log(`Scanning videos in: ${VIDEOS_DIR}\n`);

  let nameMap;
  try {
    nameMap = parseCSV(CSV_PATH);
  } catch (error) {
    console.error(`Error parsing CSV: ${error.message}`);
    REPORT.errors.push(`CSV Parsing: ${error.message}`);
    printReport();
    return;
  }

  let filesInDir;
  try {
    filesInDir = fs.readdirSync(VIDEOS_DIR);
  } catch (error) {
    console.error(`Error reading videos directory: ${error.message}`);
    REPORT.errors.push(`Directory Read: ${error.message}`);
    printReport();
    return;
  }

  const movFiles = filesInDir.filter(
    (file) => path.extname(file).toLowerCase() === ".mov"
  );
  const existingTargetNames = new Set(movFiles); // Keep track of all names currently in the folder

  for (const currentFileName of movFiles) {
    const currentBaseName = path.parse(currentFileName).name;
    const newBaseName = nameMap[currentBaseName];

    if (newBaseName) {
      const targetFileName = `${newBaseName}.mov`;
      const currentFilePath = path.join(VIDEOS_DIR, currentFileName);
      const targetFilePath = path.join(VIDEOS_DIR, targetFileName);

      if (currentFileName === targetFileName) {
        REPORT.alreadyCorrect.push(
          `${currentFileName} (already named correctly)`
        );
      } else if (
        existingTargetNames.has(targetFileName) &&
        currentFileName !== targetFileName
      ) {
        REPORT.skippedTargetExists.push(
          `${currentFileName} -> ${targetFileName} (target already exists)`
        );
      } else {
        try {
          fs.renameSync(currentFilePath, targetFilePath);
          REPORT.renamed.push(`${currentFileName} -> ${targetFileName}`);
          existingTargetNames.delete(currentFileName);
          existingTargetNames.add(targetFileName);
        } catch (renameError) {
          console.error(
            `Error renaming ${currentFileName}: ${renameError.message}`
          );
          REPORT.errors.push(
            `Rename ${currentFileName}: ${renameError.message}`
          );
        }
      }
    } else {
      if (currentFileName !== ".DS_Store") {
        REPORT.skippedNotInCsv.push(
          `${currentFileName} (original name base not found in CSV)`
        );
      }
    }
  }

  printReport();
}

function printReport() {
  console.log("\n--- Video Rename Report ---");
  REPORT.renamed.length > 0
    ? console.log("\nSuccessfully Renamed:", REPORT.renamed.join("\n"))
    : console.log("\nSuccessfully Renamed: None");
  REPORT.alreadyCorrect.length > 0
    ? console.log(
        "\nAlready Correctly Named:",
        REPORT.alreadyCorrect.join("\n")
      )
    : console.log("\nAlready Correctly Named: None");
  REPORT.skippedTargetExists.length > 0
    ? console.log(
        "\nSkipped (Target Name Existed - Potential Duplicates):",
        REPORT.skippedTargetExists.join("\n")
      )
    : console.log(
        "\nSkipped (Target Name Existed - Potential Duplicates): None"
      );
  REPORT.skippedNotInCsv.length > 0
    ? console.log(
        "\nSkipped (Original Name Not in CSV):",
        REPORT.skippedNotInCsv.join("\n")
      )
    : console.log("\nSkipped (Original Name Not in CSV): None");
  REPORT.errors.length > 0
    ? console.log("\nErrors Encountered:", REPORT.errors.join("\n"))
    : console.log("\nErrors Encountered: None");
  console.log("--- End of Report ---");
}

main();
