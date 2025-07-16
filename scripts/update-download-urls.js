import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Google Drive files from the Apps Script output
const googleDriveFiles = [
  {
    name: "Phase1_Video_R1300R_full-video_no-text_landscape_3840x2160.mp4",
    id: "1c6EvzJGyh0wc41MX4DRPZXV-VYWPOVQy",
    downloadUrl:
      "https://drive.google.com/uc?export=download&id=1c6EvzJGyh0wc41MX4DRPZXV-VYWPOVQy",
  },
  {
    name: "Phase1_Video_R1300R_full-video_no-text_portrait_1080x1350.mp4",
    id: "1RWjj_EAahpUUGj7ylYLJbc_vDuQsw6J9",
    downloadUrl:
      "https://drive.google.com/uc?export=download&id=1RWjj_EAahpUUGj7ylYLJbc_vDuQsw6J9",
  },
  {
    name: "Phase1_Video_R1300R_full-video_no-text_portrait_1080x1920.mp4",
    id: "1irGW-oxJMouPsOdi5_l2Klfi1xVnHkgd",
    downloadUrl:
      "https://drive.google.com/uc?export=download&id=1irGW-oxJMouPsOdi5_l2Klfi1xVnHkgd",
  },
  {
    name: "Phase1_Video_R1300R_full-video_text_landscape_3840x2160.mp4",
    id: "1oaPjK97VHpF9KnuLdQQYwzR6BmawB_3L",
    downloadUrl:
      "https://drive.google.com/uc?export=download&id=1oaPjK97VHpF9KnuLdQQYwzR6BmawB_3L",
  },
  {
    name: "Phase1_Video_R1300R_no-riding_no-text_portrait_1080x1350.mp4",
    id: "1mYGRYTbdK1gzuxdvKMCSyFMtfb-_3Idt",
    downloadUrl:
      "https://drive.google.com/uc?export=download&id=1mYGRYTbdK1gzuxdvKMCSyFMtfb-_3Idt",
  },
  {
    name: "Phase1_Video_R1300R_no-riding_no-text_portrait_1080x1920.mp4",
    id: "1zBdV3gHAoicUJLZv95vrx_dN45Xoz_EP",
    downloadUrl:
      "https://drive.google.com/uc?export=download&id=1zBdV3gHAoicUJLZv95vrx_dN45Xoz_EP",
  },
  {
    name: "Phase1_Video_R1300R_riding_no-text_portrait_1080x1350.mp4",
    id: "16adNtOLE29hdlvPzNyKquKB9saWu4NbL",
    downloadUrl:
      "https://drive.google.com/uc?export=download&id=16adNtOLE29hdlvPzNyKquKB9saWu4NbL",
  },
  {
    name: "Phase1_Video_R1300R_riding_no-text_portrait_1080x1920.mp4",
    id: "1tqwvYFr5sOeWIQ88-KaHsmpxcPaRiqKq",
    downloadUrl:
      "https://drive.google.com/uc?export=download&id=1tqwvYFr5sOeWIQ88-KaHsmpxcPaRiqKq",
  },
  {
    name: "Phase1_Video_R1300RS_close-up_no-text_portrait_1080x1920.mp4",
    id: "1fqH_lclyqplQAsjJZu67GfkKhjSjSt53",
    downloadUrl:
      "https://drive.google.com/uc?export=download&id=1fqH_lclyqplQAsjJZu67GfkKhjSjSt53",
  },
  {
    name: "Phase1_Video_R1300RS_close-up_no-text_square_1080x1350.mp4",
    id: "1uf9f_c-wTPWjQe6AHLz6Au4zYOyZ0DHv",
    downloadUrl:
      "https://drive.google.com/uc?export=download&id=1uf9f_c-wTPWjQe6AHLz6Au4zYOyZ0DHv",
  },
  {
    name: "Phase1_Video_R1300RS_sunset-riding_no-text_landscape_3840x2160.mp4",
    id: "1sQVhkjW1JvnsSfUXwvzm7_VCCUu-2tLw",
    downloadUrl:
      "https://drive.google.com/uc?export=download&id=1sQVhkjW1JvnsSfUXwvzm7_VCCUu-2tLw",
  },
  {
    name: "Phase1_Video_R1300RS_sunset-riding_no-text_portrait_1080x1920.mp4",
    id: "1Wg2sFcA_UYLZtuhmQr8tAIRX3TUmTtEb",
    downloadUrl:
      "https://drive.google.com/uc?export=download&id=1Wg2sFcA_UYLZtuhmQr8tAIRX3TUmTtEb",
  },
  {
    name: "Phase1_Video_R1300RS_sunset-riding_no-text_square_1080x1350.mp4",
    id: "1dkcJ0TjvlXunfCmDsc2_0uXhNk-7biKc",
    downloadUrl:
      "https://drive.google.com/uc?export=download&id=1dkcJ0TjvlXunfCmDsc2_0uXhNk-7biKc",
  },
  {
    name: "Phase1_Video_R1300RS_sunset-riding_text_landscape_3840x2160.mp4",
    id: "1MWHiKvzbEeoqtgrbYhRgQL9UH5_Q7n-F",
    downloadUrl:
      "https://drive.google.com/uc?export=download&id=1MWHiKvzbEeoqtgrbYhRgQL9UH5_Q7n-F",
  },
  {
    name: "Phase1_Video_R1300RS_sunset-riding_text_portrait_1080x1920.mp4",
    id: "1rXIrOxQR1ffHJ5YUGYWcadfHCiB_7_BM",
    downloadUrl:
      "https://drive.google.com/uc?export=download&id=1rXIrOxQR1ffHJ5YUGYWcadfHCiB_7_BM",
  },
  {
    name: "Phase1_Video_R1300RT_action_no-text_portrait_1080x1350.mp4",
    id: "19sVtpzE69i-XoZZBgYUvDM0LXNkbCH7F",
    downloadUrl:
      "https://drive.google.com/uc?export=download&id=19sVtpzE69i-XoZZBgYUvDM0LXNkbCH7F",
  },
  {
    name: "Phase1_Video_R1300RT_action_no-text_portrait_1080x1920.mp4",
    id: "1MvV_kELbG7-LpUXifS-6pSQfeE1969eW",
    downloadUrl:
      "https://drive.google.com/uc?export=download&id=1MvV_kELbG7-LpUXifS-6pSQfeE1969eW",
  },
  {
    name: "Phase1_Video_R1300RT_full-video_no-text_landscape_3840x2160.mp4",
    id: "1k4uq1AcpWfW-Z006SgPo3DfKEdI7pP63",
    downloadUrl:
      "https://drive.google.com/uc?export=download&id=1k4uq1AcpWfW-Z006SgPo3DfKEdI7pP63",
  },
  {
    name: "Phase1_Video_R1300RT_full-video_no-text_portrait_1080x1920.mp4",
    id: "1-GrmZ6EimRhxdKkBjHMXRVFK7ZNXZSAI",
    downloadUrl:
      "https://drive.google.com/uc?export=download&id=1-GrmZ6EimRhxdKkBjHMXRVFK7ZNXZSAI",
  },
  {
    name: "Phase1_Video_R1300RT_full-video_no-text_square_1080x1350.mp4",
    id: "12cJEVcG2B_INJX8VWNEW38LP9ygi-vb7",
    downloadUrl:
      "https://drive.google.com/uc?export=download&id=12cJEVcG2B_INJX8VWNEW38LP9ygi-vb7",
  },
  {
    name: "Phase1_Video_R1300RT_full-video_text_landscape_3840x2160.mp4",
    id: "1qJk_UNymaWaoBB96H58zjXg97O8s3d4P",
    downloadUrl:
      "https://drive.google.com/uc?export=download&id=1qJk_UNymaWaoBB96H58zjXg97O8s3d4P",
  },
  {
    name: "Phase1_Video_R1300RT_full-video_text_portrait_1080x1920.mp4",
    id: "1UlMP0hr3sdoQkGGyorlmmn6eeTil3Anl",
    downloadUrl:
      "https://drive.google.com/uc?export=download&id=1UlMP0hr3sdoQkGGyorlmmn6eeTil3Anl",
  },
  {
    name: "Phase1_Video_R1300RT_full-video_text_square_1080x1350.mp4",
    id: "1qlN17MuHAfsBrydU9BKAjywSMCNWehuQ",
    downloadUrl:
      "https://drive.google.com/uc?export=download&id=1qlN17MuHAfsBrydU9BKAjywSMCNWehuQ",
  },
  {
    name: "Phase1_Video_R1300RT_no-riding_no-text_portrait_1080x1350.mp4",
    id: "1fuX-J7_d5tlOltZyMAHVLWAh4UOTyZ3X",
    downloadUrl:
      "https://drive.google.com/uc?export=download&id=1fuX-J7_d5tlOltZyMAHVLWAh4UOTyZ3X",
  },
  {
    name: "Phase1_Video_R1300RT_no-riding_no-text_portrait_1080x1920.mp4",
    id: "1WzBKYrxEp_qbS-mUIXEvUUNLC5Kf5KhN",
    downloadUrl:
      "https://drive.google.com/uc?export=download&id=1WzBKYrxEp_qbS-mUIXEvUUNLC5Kf5KhN",
  },
];

function updateConfigWithDownloadUrls() {
  const configPath = path.join(__dirname, "..", "public", "config.json");

  // Read the current config
  const config = JSON.parse(fs.readFileSync(configPath, "utf8"));

  let matchedCount = 0;
  let unmatchedAssets = [];
  let unmatchedGoogleFiles = [...googleDriveFiles];

  // Process each asset
  config.assets.forEach((asset) => {
    if (asset.type === "VIDEO") {
      // Convert the asset name from .mov to .mp4 for matching
      const assetNameForMatching = asset.newAssetName.replace(/\.mov$/, ".mp4");

      // Find matching Google Drive file
      const matchingFile = googleDriveFiles.find(
        (file) => file.name === assetNameForMatching
      );

      if (matchingFile) {
        asset.downloadUrl = matchingFile.downloadUrl;
        matchedCount++;

        // Remove from unmatched list
        const index = unmatchedGoogleFiles.findIndex(
          (f) => f.name === matchingFile.name
        );
        if (index > -1) {
          unmatchedGoogleFiles.splice(index, 1);
        }

        console.log(
          `✅ Matched: ${asset.newAssetName} -> ${matchingFile.downloadUrl}`
        );
      } else {
        unmatchedAssets.push(asset.newAssetName);
        console.log(`❌ No match found for: ${asset.newAssetName}`);
      }
    }
  });

  // Update the lastUpdated timestamp
  config.lastUpdated = new Date().toISOString();

  // Write the updated config back to file
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

  console.log("\n📊 Summary:");
  console.log(`✅ Successfully matched: ${matchedCount} video assets`);
  console.log(`❌ Unmatched config assets: ${unmatchedAssets.length}`);
  console.log(
    `❌ Unmatched Google Drive files: ${unmatchedGoogleFiles.length}`
  );

  if (unmatchedAssets.length > 0) {
    console.log("\n🔍 Unmatched config assets:");
    unmatchedAssets.forEach((name) => console.log(`  - ${name}`));
  }

  if (unmatchedGoogleFiles.length > 0) {
    console.log("\n🔍 Unmatched Google Drive files:");
    unmatchedGoogleFiles.forEach((file) => console.log(`  - ${file.name}`));
  }

  console.log(
    `\n✅ Config updated successfully! Updated ${matchedCount} video assets with download URLs.`
  );
}

// Run the update
updateConfigWithDownloadUrls();
