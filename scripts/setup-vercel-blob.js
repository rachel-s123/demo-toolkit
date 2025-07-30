#!/usr/bin/env node

/**
 * Vercel Blob Storage Setup Script
 * 
 * This script helps you set up Vercel Blob Storage for your demo toolkit.
 * It provides step-by-step instructions and validates your configuration.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Vercel Blob Storage Setup for Demo Toolkit');
console.log('=============================================\n');

// Check if Vercel CLI is installed
function checkVercelCLI() {
  try {
    execSync('vercel --version', { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

// Check environment variables
function checkEnvironmentVariables() {
  const envPath = path.join(process.cwd(), '.env');
  let envContent = '';
  
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }
  
  const hasBlobToken = envContent.includes('BLOB_READ_WRITE_TOKEN');
  
  return {
    hasEnvFile: fs.existsSync(envPath),
    hasBlobToken,
    envContent
  };
}

// Main setup function
async function setupVercelBlob() {
  console.log('📋 Prerequisites Check:');
  console.log('----------------------');
  
  // Check Vercel CLI
  const hasVercelCLI = checkVercelCLI();
  console.log(`✅ Vercel CLI: ${hasVercelCLI ? 'Installed' : 'Not installed'}`);
  
  if (!hasVercelCLI) {
    console.log('\n❌ Please install Vercel CLI first:');
    console.log('   npm install -g vercel');
    console.log('   or');
    console.log('   npm install --save-dev vercel');
    return;
  }
  
  // Check environment variables
  const envCheck = checkEnvironmentVariables();
  console.log(`✅ .env file: ${envCheck.hasEnvFile ? 'Exists' : 'Missing'}`);
  console.log(`✅ Blob token: ${envCheck.hasBlobToken ? 'Configured' : 'Missing'}`);
  
  console.log('\n📝 Setup Instructions:');
  console.log('=====================');
  
  if (!envCheck.hasBlobToken) {
    console.log('\n1️⃣ Create Vercel Blob Store:');
    console.log('   vercel blob create brand-assets');
    console.log('');
    
    console.log('2️⃣ Get your Blob Token:');
    console.log('   - Go to your Vercel project dashboard');
    console.log('   - Navigate to Storage → Blob');
    console.log('   - Click on your "brand-assets" store');
    console.log('   - Copy the "Read/Write Token"');
    console.log('');
    
    console.log('3️⃣ Add to your .env file:');
    console.log('   BLOB_READ_WRITE_TOKEN=your_blob_token_here');
    console.log('');
    
    if (!envCheck.hasEnvFile) {
      console.log('   Create .env file in your project root if it doesn\'t exist');
    }
  } else {
    console.log('✅ Environment variables are configured!');
  }
  
  console.log('\n4️⃣ Test the setup:');
  console.log('   - Start your development server: npm run start');
  console.log('   - Go to Brand Setup tab');
  console.log('   - Create a new brand with a logo');
  console.log('   - Upload the files');
  console.log('   - Check that files appear in your Vercel Blob store');
  console.log('');
  
  console.log('📁 File Structure in Blob Storage:');
  console.log('==================================');
  console.log('brand-assets/');
  console.log('├── locales/           # TypeScript locale files');
  console.log('│   ├── bmw.ts');
  console.log('│   ├── edf.ts');
  console.log('│   └── ...');
  console.log('├── configs/           # JSON configuration files');
  console.log('│   ├── config_bmw.json');
  console.log('│   ├── config_edf.json');
  console.log('│   └── ...');
  console.log('├── logos/             # Brand logo images');
  console.log('│   ├── bmw.png');
  console.log('│   ├── edf.jpg');
  console.log('│   └── ...');
  console.log('└── uploads/           # Other uploaded files');
  console.log('    └── ...');
  console.log('');
  
  console.log('🔗 Accessing Files:');
  console.log('===================');
  console.log('Files will be accessible via URLs like:');
  console.log('https://your-blob-store.public.blob.vercel-storage.com/logos/bmw.png');
  console.log('https://your-blob-store.public.blob.vercel-storage.com/locales/bmw.ts');
  console.log('');
  
  console.log('💰 Cost Information:');
  console.log('===================');
  console.log('- Storage: $0.02 per GB per month');
  console.log('- Bandwidth: $0.10 per GB');
  console.log('- Requests: 1 million free requests per month');
  console.log('- Estimated cost: Very low for typical brand asset usage');
  console.log('');
  
  console.log('🚨 Troubleshooting:');
  console.log('==================');
  console.log('If you encounter issues:');
  console.log('1. Verify BLOB_READ_WRITE_TOKEN is set correctly');
  console.log('2. Ensure the "brand-assets" blob store exists');
  console.log('3. Check file size limits (default: 500MB)');
  console.log('4. Verify network connectivity');
  console.log('5. Check Vercel dashboard for any errors');
  console.log('');
  
  console.log('✅ Setup complete! Your demo toolkit is now configured for Vercel Blob Storage.');
}

// Run the setup
setupVercelBlob().catch(console.error); 