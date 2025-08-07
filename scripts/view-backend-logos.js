#!/usr/bin/env node

/**
 * Script to view logo information stored in the backend
 * Usage: node scripts/view-backend-logos.js [brandCode]
 */

import fetch from 'node-fetch';

async function viewBackendLogos(brandCode = null) {
  try {
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'http://localhost:3000';
    
    const url = brandCode 
      ? `${baseUrl}/api/get-brands?brandCode=${brandCode}`
      : `${baseUrl}/api/get-brands`;
    
    console.log(`🔍 Fetching brand information from: ${url}`);
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (!data.success) {
      console.error('❌ Failed to fetch brands:', data.error);
      return;
    }
    
    if (brandCode) {
      // Single brand
      console.log('\n📋 Brand Information:');
      console.log('=====================');
      console.log(`Brand Code: ${data.brand.brandCode}`);
      console.log(`Brand Name: ${data.brand.brandName}`);
      console.log(`Created: ${data.brand.createdAt}`);
      console.log(`Updated: ${data.brand.updatedAt}`);
      
      if (data.brand.files && data.brand.files.length > 0) {
        console.log('\n📁 Files:');
        data.brand.files.forEach(file => {
          console.log(`  ${file.type.toUpperCase()}: ${file.filename}`);
          console.log(`    URL: ${file.url}`);
          console.log(`    Storage Path: ${file.storagePath}`);
          console.log('');
        });
        
        // Show logo details specifically
        const logoFile = data.brand.files.find(f => f.type === 'logo');
        if (logoFile) {
          console.log('🎨 Logo Details:');
          console.log('===============');
          console.log(`Filename: ${logoFile.filename}`);
          console.log(`URL: ${logoFile.url}`);
          console.log(`Storage Path: ${logoFile.storagePath}`);
          console.log(`Type: ${logoFile.type}`);
        }
      }
    } else {
      // All brands
      console.log(`\n📋 Found ${data.brands.length} brands in backend:`);
      console.log('=====================================');
      
      data.brands.forEach((brand, index) => {
        console.log(`\n${index + 1}. ${brand.brandName} (${brand.brandCode})`);
        console.log(`   Created: ${brand.createdAt}`);
        console.log(`   Updated: ${brand.updatedAt}`);
        
        if (brand.files && brand.files.length > 0) {
          const logoFile = brand.files.find(f => f.type === 'logo');
          if (logoFile) {
            console.log(`   🎨 Logo: ${logoFile.filename}`);
            console.log(`      URL: ${logoFile.url}`);
          }
          
          const configFile = brand.files.find(f => f.type === 'config');
          if (configFile) {
            console.log(`   ⚙️  Config: ${configFile.filename}`);
          }
          
          const localeFile = brand.files.find(f => f.type === 'locale');
          if (localeFile) {
            console.log(`   🌐 Locale: ${localeFile.filename}`);
          }
        }
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n💡 Make sure your development server is running: npm run dev');
  }
}

// Get brand code from command line argument
const brandCode = process.argv[2] || null;

// Run the script
viewBackendLogos(brandCode); 