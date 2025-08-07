# Migration Scripts: Model → Category

This directory contains scripts to migrate the demo toolkit from BMW-specific "Model" terminology to more generalized "Category" terminology.

## Scripts Overview

### 1. `migrate-model-to-category.cjs` (Recommended)
**Comprehensive migration script with backup and rollback capabilities**

```bash
# Dry run (preview changes without applying them)
node scripts/migrate-model-to-category.cjs --dry-run

# Apply the migration
node scripts/migrate-model-to-category.cjs

# Rollback to previous backup
node scripts/migrate-model-to-category.cjs --rollback
```

**Features:**
- ✅ Automatic backup creation
- ✅ Rollback capability
- ✅ Dry run mode for testing
- ✅ Comprehensive reporting
- ✅ Safe error handling

### 2. `update-model-to-category.cjs`
**Simple config file updater**

```bash
node scripts/update-model-to-category.cjs
```

**What it does:**
- Updates all config files in `public/locales/`
- Changes `filterOptions.models` → `filterOptions.categories`
- Changes asset/message/guide `model` → `category`
- Updates metadata

### 3. `update-types-for-category.cjs`
**TypeScript type updater**

```bash
node scripts/update-types-for-category.cjs
```

**What it does:**
- Adds new `ProductCategory` type
- Maintains backward compatibility with `MotorcycleModel`
- Adds optional `category` fields to interfaces
- Creates migration guide

## Migration Process

### Step 1: Preview Changes
```bash
node scripts/migrate-model-to-category.cjs --dry-run
```

### Step 2: Apply Migration
```bash
node scripts/migrate-model-to-category.cjs
```

### Step 3: Test Application
- Start the development server
- Verify filter labels show "Category" instead of "Model"
- Test filtering functionality
- Check different brand configurations

### Step 4: Rollback if Needed
```bash
node scripts/migrate-model-to-category.cjs --rollback
```

## What Gets Changed

### Configuration Files
- `public/locales/config_bmw.json`
- `public/locales/config_edf.json`
- `public/locales/config_edf_fr.json`
- `public/locales/config_en.json`
- `public/locales/config_en_template.json`
- `public/locales/config_hedosoph.json`
- `public/config.json`

### TypeScript Files
- `src/types/index.ts`

### Changes Made
1. **Filter Options**: `models` → `categories`
2. **Asset Fields**: `model` → `category`
3. **Message Fields**: `model` → `category`
4. **Guide Fields**: `model` → `category`
5. **Type Definitions**: Added `ProductCategory` type
6. **UI Labels**: "Model" → "Category" (already done manually)

## Backward Compatibility

The migration maintains backward compatibility:
- Existing `MotorcycleModel` type is preserved
- Components can handle both `model` and `category` fields
- URL parameters still use "model" for compatibility
- Existing functionality continues to work

## Benefits

### Before (BMW-specific)
```json
{
  "filterOptions": {
    "models": ["ALL", "R1300 R", "R1300 RS", "R1300 RT"]
  }
}
```

### After (Generalized)
```json
{
  "filterOptions": {
    "categories": ["ALL", "R1300 R", "R1300 RS", "R1300 RT"]
  }
}
```

### Works Across Industries
- **BMW**: Categories like "R1300 R", "R1300 RS", "R1300 RT"
- **EDF Energy**: Categories like "Small Business"
- **AI Company**: Categories like "Core Concepts", "Implementation"
- **VC Firm**: Categories like "Investment Analysis AI", "Operational AI"

## Safety Features

- **Automatic Backups**: All files are backed up before changes
- **Dry Run Mode**: Preview changes without applying them
- **Rollback Capability**: Restore from backup if needed
- **Error Handling**: Graceful error handling with detailed logging
- **Progress Reporting**: Clear feedback on what's being changed

## Generated Files

After running the migration, you'll get:
- `MIGRATION_REPORT.md` - Detailed report of changes made
- `MIGRATION_GUIDE.md` - Guide for future reference
- `backups/model-to-category-migration/` - Backup directory with timestamped backups

## Troubleshooting

### Script Fails to Run
- Ensure you're using Node.js 16+ 
- Check file permissions: `chmod +x scripts/*.cjs`
- Verify you're in the project root directory

### Rollback Issues
- Check that backup directory exists: `ls backups/model-to-category-migration/`
- Verify backup files are present
- Run rollback with latest backup timestamp

### TypeScript Errors
- Run `npm run build` to check for type errors
- Update any custom code that references the old structure
- Consider gradually migrating from `model` to `category` in your codebase
