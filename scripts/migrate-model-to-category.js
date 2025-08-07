#!/usr/bin/env node

/**
 * Comprehensive migration script: Model → Category
 * This script handles the complete migration with backup and rollback capabilities
 */

const fs = require('fs');
const path = require('path');

// Configuration files to update
const configFiles = [
  'public/locales/config_bmw.json',
  'public/locales/config_edf.json',
  'public/locales/config_edf_fr.json',
  'public/locales/config_en.json',
  'public/locales/config_en_template.json',
  'public/locales/config_hedosoph.json',
  'public/config.json'
];

const typeFiles = [
  'src/types/index.ts'
];

// Backup directory
const backupDir = 'backups/model-to-category-migration';

// Function to create backup
function createBackup() {
  console.log('📦 Creating backup...');
  
  // Create backup directory
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(backupDir, `backup-${timestamp}`);
  fs.mkdirSync(backupPath, { recursive: true });
  
  // Backup config files
  configFiles.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      const backupFilePath = path.join(backupPath, filePath.replace(/\//g, '_'));
      fs.copyFileSync(filePath, backupFilePath);
    }
  });
  
  // Backup type files
  typeFiles.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      const backupFilePath = path.join(backupPath, filePath.replace(/\//g, '_'));
      fs.copyFileSync(filePath, backupFilePath);
    }
  });
  
  console.log(`✅ Backup created: ${backupPath}`);
  return backupPath;
}

// Function to update config file
function updateConfigFile(filePath) {
  try {
    console.log(`Processing: ${filePath}`);
    
    // Read the config file
    const configContent = fs.readFileSync(filePath, 'utf8');
    const config = JSON.parse(configContent);
    
    // Track changes
    let changes = [];
    
    // Update filter options
    if (config.filterOptions && config.filterOptions.models) {
      config.filterOptions.categories = config.filterOptions.models;
      delete config.filterOptions.models;
      changes.push('filterOptions.models → filterOptions.categories');
    }
    
    // Update assets
    if (config.assets && Array.isArray(config.assets)) {
      let assetChanges = 0;
      config.assets.forEach(asset => {
        if (asset.model) {
          asset.category = asset.model;
          delete asset.model;
          assetChanges++;
        }
      });
      if (assetChanges > 0) {
        changes.push(`${assetChanges} assets: model → category`);
      }
    }
    
    // Update messages
    if (config.messages && Array.isArray(config.messages)) {
      let messageChanges = 0;
      config.messages.forEach(message => {
        if (message.model) {
          message.category = message.model;
          delete message.model;
          messageChanges++;
        }
      });
      if (messageChanges > 0) {
        changes.push(`${messageChanges} messages: model → category`);
      }
    }
    
    // Update guides
    if (config.guides && Array.isArray(config.guides)) {
      let guideChanges = 0;
      config.guides.forEach(guide => {
        if (guide.model) {
          guide.category = guide.model;
          delete guide.model;
          guideChanges++;
        }
      });
      if (guideChanges > 0) {
        changes.push(`${guideChanges} guides: model → category`);
      }
    }
    
    // Update metadata
    if (config.metadata) {
      config.metadata.lastModified = new Date().toISOString();
      config.metadata.modifiedBy = 'model-to-category-migration';
      config.metadata.version = (config.metadata.version || 0) + 1;
    } else {
      config.metadata = {
        lastModified: new Date().toISOString(),
        modifiedBy: 'model-to-category-migration',
        version: 1,
        source: 'file'
      };
    }
    
    // Write the updated config back to file
    const updatedContent = JSON.stringify(config, null, 2);
    fs.writeFileSync(filePath, updatedContent, 'utf8');
    
    if (changes.length > 0) {
      console.log(`✅ Updated: ${changes.join(', ')}`);
    } else {
      console.log(`ℹ️  No changes needed`);
    }
    
    return changes.length > 0;
    
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

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
    
    // Update interfaces to support both model and category
    const interfaces = ['Asset', 'Message', 'Guide'];
    interfaces.forEach(interfaceName => {
      const modelPattern = new RegExp(`model: Exclude<MotorcycleModel, 'ALL'>;`);
      const categoryPattern = new RegExp(`category\\?: string;`);
      
      if (modelPattern.test(updatedContent) && !categoryPattern.test(updatedContent)) {
        updatedContent = updatedContent.replace(
          modelPattern,
          `model: Exclude<MotorcycleModel, 'ALL'>;
  category?: string; // New category field for generalization`
        );
        changes.push(`Added category field to ${interfaceName} interface`);
      }
    });
    
    // Update FilterOptions interface
    if (updatedContent.includes('models: string[];') && !updatedContent.includes('categories?: string[];')) {
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

// Function to rollback changes
function rollback(backupPath) {
  console.log('🔄 Rolling back changes...');
  
  if (!fs.existsSync(backupPath)) {
    console.error('❌ Backup not found for rollback');
    return false;
  }
  
  try {
    // Restore config files
    configFiles.forEach(filePath => {
      const backupFilePath = path.join(backupPath, filePath.replace(/\//g, '_'));
      if (fs.existsSync(backupFilePath)) {
        fs.copyFileSync(backupFilePath, filePath);
        console.log(`✅ Restored: ${filePath}`);
      }
    });
    
    // Restore type files
    typeFiles.forEach(filePath => {
      const backupFilePath = path.join(backupPath, filePath.replace(/\//g, '_'));
      if (fs.existsSync(backupFilePath)) {
        fs.copyFileSync(backupFilePath, filePath);
        console.log(`✅ Restored: ${filePath}`);
      }
    });
    
    console.log('✅ Rollback completed successfully');
    return true;
  } catch (error) {
    console.error('❌ Error during rollback:', error.message);
    return false;
  }
}

// Function to create migration report
function createMigrationReport(backupPath, configChanges, typeChanges) {
  const report = `# Migration Report: Model → Category

## Migration Details
- **Date**: ${new Date().toISOString()}
- **Backup Location**: ${backupPath}
- **Config Files Updated**: ${configChanges}
- **Type Files Updated**: ${typeChanges}

## Changes Summary

### Configuration Files
${configFiles.map(file => `- ${file}`).join('\n')}

### TypeScript Files
${typeFiles.map(file => `- ${file}`).join('\n')}

## Rollback Instructions
To rollback this migration, run:
\`\`\`bash
node scripts/migrate-model-to-category.js --rollback
\`\`\`

## Next Steps
1. Test the application to ensure everything works correctly
2. Update any custom configurations to use the new category field
3. Consider gradually migrating from \`model\` to \`category\` in your codebase
4. Update documentation to reflect the new terminology

## Verification
- Check that all filter labels now show "Category" instead of "Model"
- Verify that existing functionality still works
- Test with different brand configurations
`;

  fs.writeFileSync('MIGRATION_REPORT.md', report, 'utf8');
  console.log('📝 Created MIGRATION_REPORT.md');
}

// Main execution
function main() {
  const args = process.argv.slice(2);
  const isRollback = args.includes('--rollback');
  const isDryRun = args.includes('--dry-run');
  
  if (isRollback) {
    // Find the most recent backup
    if (!fs.existsSync(backupDir)) {
      console.error('❌ No backup directory found');
      process.exit(1);
    }
    
    const backups = fs.readdirSync(backupDir)
      .filter(dir => dir.startsWith('backup-'))
      .sort()
      .reverse();
    
    if (backups.length === 0) {
      console.error('❌ No backups found');
      process.exit(1);
    }
    
    const latestBackup = path.join(backupDir, backups[0]);
    console.log(`🔄 Rolling back to: ${latestBackup}`);
    rollback(latestBackup);
    return;
  }
  
  console.log('🔄 Starting comprehensive migration: Model → Category');
  console.log('=====================================================\n');
  
  if (isDryRun) {
    console.log('🔍 DRY RUN MODE - No changes will be made\n');
  }
  
  // Create backup
  const backupPath = createBackup();
  
  let configChanges = 0;
  let typeChanges = 0;
  
  // Update config files
  console.log('\n📁 Updating configuration files...');
  configFiles.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      if (!isDryRun) {
        const wasUpdated = updateConfigFile(filePath);
        if (wasUpdated) configChanges++;
      } else {
        console.log(`🔍 Would process: ${filePath}`);
      }
    } else {
      console.log(`⚠️  File not found: ${filePath}`);
    }
  });
  
  // Update type files
  console.log('\n📝 Updating TypeScript types...');
  typeFiles.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      if (!isDryRun) {
        const wasUpdated = updateTypesFile(filePath);
        if (wasUpdated) typeChanges++;
      } else {
        console.log(`🔍 Would process: ${filePath}`);
      }
    } else {
      console.log(`⚠️  File not found: ${filePath}`);
    }
  });
  
  // Create migration report
  if (!isDryRun) {
    createMigrationReport(backupPath, configChanges, typeChanges);
  }
  
  console.log('\n=====================================================');
  console.log(`📊 Summary:`);
  console.log(`   Config files updated: ${configChanges}`);
  console.log(`   Type files updated: ${typeChanges}`);
  console.log(`   Backup location: ${backupPath}`);
  
  if (isDryRun) {
    console.log('\n🔍 This was a dry run. No changes were made.');
    console.log('💡 Run without --dry-run to apply the changes.');
  } else {
    console.log('\n✅ Migration completed successfully!');
    console.log('📝 Migration report created: MIGRATION_REPORT.md');
    console.log('💡 Test your application to ensure everything works correctly.');
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  createBackup,
  updateConfigFile,
  updateTypesFile,
  rollback,
  createMigrationReport
}; 