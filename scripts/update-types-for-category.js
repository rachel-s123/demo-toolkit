#!/usr/bin/env node

/**
 * Script to update TypeScript types to support Category instead of Model
 * This maintains backward compatibility while adding new category support
 */

const fs = require('fs');
const path = require('path');

// Files to update
const typeFiles = [
  'src/types/index.ts'
];

// Function to update types file
function updateTypesFile(filePath) {
  try {
    console.log(`Processing types: ${filePath}`);
    
    // Read the types file
    const content = fs.readFileSync(filePath, 'utf8');
    
    let updatedContent = content;
    let changes = [];
    
    // Add new Category type
    if (!content.includes('export type ProductCategory')) {
      const categoryTypeDefinition = `
// New generalized category type for different industries
export type ProductCategory = 'ALL' | string;

// TODO: Consider renaming this type to ProductCategory or AssetCategory for better generalization
export type MotorcycleModel = 'ALL' | 'R1300 R' | 'R1300 RS' | 'R1300 RT';
`;
      
      // Replace the existing MotorcycleModel definition
      updatedContent = updatedContent.replace(
        /\/\/ TODO: Consider renaming this type to ProductCategory or AssetCategory for better generalization\nexport type MotorcycleModel = 'ALL' \| 'R1300 R' \| 'R1300 RS' \| 'R1300 RT';/,
        categoryTypeDefinition.trim()
      );
      
      changes.push('Added ProductCategory type');
    }
    
    // Update Asset interface to support both model and category
    if (content.includes('model: Exclude<MotorcycleModel, \'ALL\'>;')) {
      updatedContent = updatedContent.replace(
        /model: Exclude<MotorcycleModel, 'ALL'>;/,
        `model: Exclude<MotorcycleModel, 'ALL'>;
  category?: string; // New category field for generalization`
      );
      changes.push('Added category field to Asset interface');
    }
    
    // Update Message interface to support both model and category
    if (content.includes('model: Exclude<MotorcycleModel, \'ALL\'>;') && !content.includes('category?: string;')) {
      updatedContent = updatedContent.replace(
        /model: Exclude<MotorcycleModel, 'ALL'>;/,
        `model: Exclude<MotorcycleModel, 'ALL'>;
  category?: string; // New category field for generalization`
      );
      changes.push('Added category field to Message interface');
    }
    
    // Update Guide interface to support both model and category
    if (content.includes('model: Exclude<MotorcycleModel, \'ALL\'>;') && !content.includes('category?: string;')) {
      updatedContent = updatedContent.replace(
        /model: Exclude<MotorcycleModel, 'ALL'>;/,
        `model: Exclude<MotorcycleModel, 'ALL'>;
  category?: string; // New category field for generalization`
      );
      changes.push('Added category field to Guide interface');
    }
    
    // Update FilterOptions interface to support categories
    if (content.includes('models: string[];')) {
      updatedContent = updatedContent.replace(
        /models: string\[\];/,
        `models: string[];
  categories?: string[]; // New categories field for generalization`
      );
      changes.push('Added categories field to FilterOptions interface');
    }
    
    // Write the updated content back to file
    if (updatedContent !== content) {
      fs.writeFileSync(filePath, updatedContent, 'utf8');
      console.log(`✅ Updated: ${changes.join(', ')}`);
      return true;
    } else {
      console.log(`ℹ️  No changes needed`);
      return false;
    }
    
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Function to create a migration guide
function createMigrationGuide() {
  const migrationGuide = `# Migration Guide: Model → Category

## Overview
This migration updates the toolkit to use "Category" instead of "Model" for better generalization across different brands and industries.

## Changes Made

### 1. UI Labels
- Filter labels changed from "Model" to "Category" in all tabs
- Edit modal labels updated accordingly
- PDF generation footer updated

### 2. Configuration Files
- \`filterOptions.models\` → \`filterOptions.categories\`
- Asset \`model\` field → \`category\` field
- Message \`model\` field → \`category\` field  
- Guide \`model\` field → \`category\` field

### 3. TypeScript Types
- Added new \`ProductCategory\` type for generalization
- Maintained \`MotorcycleModel\` type for backward compatibility
- Added optional \`category\` fields to interfaces

## Backward Compatibility
- Existing \`MotorcycleModel\` type is preserved
- Components can handle both \`model\` and \`category\` fields
- URL parameters still use "model" for compatibility

## Usage Examples

### Before (BMW-specific)
\`\`\`json
{
  "filterOptions": {
    "models": ["ALL", "R1300 R", "R1300 RS", "R1300 RT"]
  },
  "assets": [
    {
      "model": "R1300 RS",
      "title": "Side On"
    }
  ]
}
\`\`\`

### After (Generalized)
\`\`\`json
{
  "filterOptions": {
    "categories": ["ALL", "R1300 R", "R1300 RS", "R1300 RT"]
  },
  "assets": [
    {
      "category": "R1300 RS",
      "title": "Side On"
    }
  ]
}
\`\`\`

### Different Industries
- **BMW**: Categories like "R1300 R", "R1300 RS", "R1300 RT"
- **EDF Energy**: Categories like "Small Business"
- **AI Company**: Categories like "Core Concepts", "Implementation", "Ethics & Governance"
- **VC Firm**: Categories like "Investment Analysis AI", "Operational AI"

## Next Steps
1. Run the update scripts to migrate existing configs
2. Update any custom configurations to use the new category field
3. Consider gradually migrating from \`model\` to \`category\` in your codebase
4. Update documentation to reflect the new terminology

## Scripts
- \`node scripts/update-model-to-category.js\` - Updates config files
- \`node scripts/update-types-for-category.js\` - Updates TypeScript types
`;

  fs.writeFileSync('MIGRATION_GUIDE.md', migrationGuide, 'utf8');
  console.log('📝 Created MIGRATION_GUIDE.md');
}

// Main execution
function main() {
  console.log('🔄 Starting TypeScript types update for Category support');
  console.log('=====================================================\n');
  
  let totalFiles = 0;
  let updatedFiles = 0;
  
  typeFiles.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      totalFiles++;
      const wasUpdated = updateTypesFile(filePath);
      if (wasUpdated) {
        updatedFiles++;
      }
    } else {
      console.log(`⚠️  File not found: ${filePath}`);
    }
  });
  
  // Create migration guide
  createMigrationGuide();
  
  console.log('\n=====================================================');
  console.log(`📊 Summary:`);
  console.log(`   Total files processed: ${totalFiles}`);
  console.log(`   Files updated: ${updatedFiles}`);
  console.log(`   Files unchanged: ${totalFiles - updatedFiles}`);
  
  if (updatedFiles > 0) {
    console.log('\n✅ TypeScript types have been updated successfully!');
    console.log('📝 Migration guide created: MIGRATION_GUIDE.md');
  } else {
    console.log('\nℹ️  No type files needed updates.');
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  updateTypesFile,
  createMigrationGuide
}; 