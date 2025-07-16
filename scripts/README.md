# Asset Management Scripts

## Complete Asset Workflow: From Upload to Download

This section describes the full process for adding new assets to the platform, ensuring they are correctly named, analyzed, and downloadable in all formats.

### 1. **Upload New Assets**
- Place all new image and video files in the `source-assets/` directory with original filename.

### 2. **Analyze and Add to Naming CSV**
- Run the script:
  ```bash
  node scripts/add_new_assets_to_naming_convention.cjs
  ```
- This will:
  - Scan `source-assets/` for new files not in `data/All_R-Series_Assets_Naming_Convention.csv`.
  - Use OpenAI Vision to generate a short, unique description and fill out all required columns.
  - Add a new row for each asset in the CSV.

### 3. **(Optional) Fix/Update CSV Fields**
- If needed, use helper scripts (e.g., `fix_bike_model_phase2.cjs`, `fix_recent_video_dimensions.cjs`) to update fields like Bike Model or Dimensions in the CSV.

### 4. **Rename and Copy Assets**
- Run:
  ```bash
  npm run rename-assets
  ```
- This copies and renames files from `source-assets/` to `public/assets/` using the naming convention in the CSV.

### 5. **Import CSV to Config**
- Run:
  ```bash
  npm run csv-to-config
  ```
- This updates `public/config.json` with all asset metadata from the CSV.

### 6. **Add/Update Download URLs and Sizes**
- Run:
  ```bash
  node scripts/update_asset_download_urls.cjs
  ```
- This script:
  - Reads `data/drive_files.csv` (exported from Google Drive API for your public folder)
  - Updates each asset's `downloadUrls` array in `public/config.json` with all available formats and file sizes, ensuring only correct files are matched.

### 7. **Sync to Redis (Production Only)**
- If deploying to production, run:
  ```bash
  node scripts/force-update-redis.js
  ```
- This ensures the latest config is used by the live site.

### 8. **Verify in the UI**
- Check the grid and modal views:
  - Download buttons should appear for all available formats (largest file per type).
  - Thumbnails load from `/assets/` (low-res for speed).
  - Download links point to Google Drive with correct file size labels.

---

This directory contains scripts for managing BMW R-Series marketing assets.

## Scripts Overview

### 1. `csv-to-config.js` - Import CSV Data to Config

Imports asset data from the CSV file into the config.json structure.

**Usage:**

```bash
npm run csv-to-config
```

**What it does:**

- Reads `data/All_R-Series_Assets_Naming_Convention.csv`
- Converts CSV rows to Asset objects matching the TypeScript interface
- Adds new assets to `public/config.json`
- Preserves existing real assets, replaces demo assets
- Maps CSV columns to Asset properties:
  - `Original File Name` → `originalFileName`
  - `Phase` → `phase` (formatted as "PHASE 1")
  - `Asset Type` → `type` ("Video" → "VIDEO", "Static" → "STATIC")
  - `Bike Model` → `model` ("R1300RS" → "R1300 RS")
  - `Description` → `description` + `title` (formatted)
  - `Text Overlay` → `textOverlay`
  - `Orientation` → `orientation`
  - `Dimensions` → `dimensions`
  - `File Extension` → `fileExtension`
  - `New Asset Name` → `newAssetName` + `url`

### 2. `rename-assets.js` - Rename Asset Files

Renames asset files from original names to standardized naming convention.

**Usage:**

```bash
npm run rename-assets
```

**Setup Required:**

1. Create `source-assets/` directory in project root
2. Place all original asset files there (names from CSV Column A)
3. Run the script

**What it does:**

- Reads the CSV for filename mappings
- Copies files from `source-assets/` to `public/assets/`
- Renames them using the standardized convention (CSV Column J)
- Provides detailed progress and summary

### 3. `force-update-redis.js` - Force Redis Sync ⚡

**CRITICAL SCRIPT** - Forces Redis to use your local config.json file, overriding any cached data.

**Usage:**

```bash
node scripts/force-update-redis.js
```

**When to use:**

- 🚨 **Videos not showing on Vercel** (Redis has old config)
- 📝 Local changes aren't reflected in production
- 🔄 Need to sync local file changes to Redis
- 🎬 After updating video configurations (.mov files)

**What it does:**

- Reads your local `public/config.json`
- Updates metadata with current timestamp (ensures it wins)
- Forces Redis to accept the local version
- Provides detailed asset breakdown
- Shows video format analysis (.mov vs .mp4)
- Updates both Redis and local file with new metadata

**Environment Variables Required:**

```env
KV_REST_API_URL=your_upstash_redis_url
KV_REST_API_TOKEN=your_upstash_redis_token
```

**Example Output:**

```
🔄 Force updating Redis with local config.json...
📁 Loaded local config with 71 assets
📊 Asset breakdown:
   - Total assets: 71
   - Static assets: 46
   - Video assets: 25
   - .mov videos: 25
   - .mp4 videos: 0
✅ Successfully force updated Redis!
🚀 Redis update complete! Your Vercel deployment should now use the updated config.
```

## Workflow

### Complete Asset Setup Process:

1. **Prepare Assets:**

   ```bash
   mkdir source-assets
   # Copy all original asset files to source-assets/
   ```

2. **Rename Assets:**

   ```bash
   npm run rename-assets
   ```

3. **Update Config:**

   ```bash
   npm run csv-to-config
   ```

4. **Verify:**
   - Check `public/assets/` for renamed files
   - Check `public/config.json` for new asset entries
   - Test the UI to ensure assets load correctly

## File Structure

```
project-root/
├── data/
│   └── All_R-Series_Assets_Naming_Convention.csv
├── source-assets/                    # You create this
│   ├── DF25_000257027_1.mp4         # Original files
│   ├── DF25_000257027_2.mp4
│   └── ...
├── public/
│   ├── assets/                       # Renamed files go here
│   │   ├── Phase1_Video_R1300RS_sunset-riding_no-text_landscape_3840x2160.mp4
│   │   └── ...
│   └── config.json                   # Updated with asset data
└── scripts/
    ├── csv-to-config.js
    ├── rename-assets.js
    ├── force-update-redis.js
    └── README.md
```

## Asset Interface

The scripts generate assets matching this TypeScript interface:

```typescript
interface Asset {
  id: string; // Generated: "phase1_1", "phase1_2", etc.
  title: string; // From description: "Sunset Riding"
  phase: "PHASE 1" | "PHASE 2"; // From CSV: "Phase1" → "PHASE 1"
  type: "STATIC" | "VIDEO"; // From CSV: "Video" → "VIDEO"
  model: "R1300 R" | "R1300 RS" | "R1300 RT"; // From CSV: "R1300RS" → "R1300 RS"
  description: string; // From CSV: "sunset-riding"
  textOverlay: "text" | "no-text"; // From CSV
  orientation: "landscape" | "portrait" | "square"; // From CSV
  dimensions: string; // From CSV: "3840x2160"
  fileExtension: string; // From CSV: ".mp4"
  originalFileName: string; // From CSV: "DF25_000257027_1.mp4"
  newAssetName: string; // From CSV: standardized name
  thumbnail: string; // Generated: "/assets/[newAssetName]"
  url: string; // Generated: "/assets/[newAssetName]"
  isDemo: boolean; // Default: false (real assets)
}
```

## Error Handling

Both scripts include comprehensive error handling:

- File not found errors
- CSV parsing errors
- Permission errors
- Detailed logging and progress reporting

## Notes

- Scripts use ES modules (import/export)
- All assets from CSV are marked as `isDemo: false` (real content)
- Existing demo assets are preserved unless replaced
- Files are copied (not moved) from source-assets to public/assets
- Both scripts can be run multiple times safely
