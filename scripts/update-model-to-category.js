#!/usr/bin/env node

/**
 * Script to update existing config files to use "Category" instead of "Model"
 * This makes the toolkit more generalized for different brands and industries
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

// Function to update filter options
function updateFilterOptions(config) {
  if (config.filterOptions && config.filterOptions.models) {
    // Rename the models array to categories
    config.filterOptions.categories = config.filterOptions.models;
    delete config.filterOptions.models;
  }
  return config;
}

// Function to update asset model references
function updateAssetModelReferences(config) {
  if (config.assets && Array.isArray(config.assets)) {
    config.assets.forEach(asset => {
      if (asset.model) {
        asset.category = asset.model;
        delete asset.model;
      }
    });
  }
  return config;
}

// Function to update message model references
function updateMessageModelReferences(config) {
  if (config.messages && Array.isArray(config.messages)) {
    config.messages.forEach(message => {
      if (message.model) {
        message.category = message.model;
        delete message.model;
      }
    });
  }
  return config;
}

// Function to update guide model references
function updateGuideModelReferences(config) {
  if (config.guides && Array.isArray(config.guides)) {
    config.guides.forEach(guide => {
      if (guide.model) {
        guide.category = guide.model;
        delete guide.model;
      }
    });
  }
  return config;
}

// Function to update a single config file
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
    
    // Update metadata to track this change
    if (config.metadata) {
      config.metadata.lastModified = new Date().toISOString();
      config.metadata.modifiedBy = 'update-model-to-category-script';
      config.metadata.version = (config.metadata.version || 0) + 1;
    } else {
      config.metadata = {
        lastModified: new Date().toISOString(),
        modifiedBy: 'update-model-to-category-script',
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

// Main execution
function main() {
  console.log('🔄 Starting config update: Model → Category');
  console.log('==========================================\n');
  
  let totalFiles = 0;
  let updatedFiles = 0;
  
  configFiles.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      totalFiles++;
      const wasUpdated = updateConfigFile(filePath);
      if (wasUpdated) {
        updatedFiles++;
      }
    } else {
      console.log(`⚠️  File not found: ${filePath}`);
    }
  });
  
  console.log('\n==========================================');
  console.log(`📊 Summary:`);
  console.log(`   Total files processed: ${totalFiles}`);
  console.log(`   Files updated: ${updatedFiles}`);
  console.log(`   Files unchanged: ${totalFiles - updatedFiles}`);
  
  if (updatedFiles > 0) {
    console.log('\n✅ Config files have been updated successfully!');
    console.log('💡 Remember to update your TypeScript types if needed.');
  } else {
    console.log('\nℹ️  No files needed updates.');
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  updateConfigFile,
  updateFilterOptions,
  updateAssetModelReferences,
  updateMessageModelReferences,
  updateGuideModelReferences
}; 