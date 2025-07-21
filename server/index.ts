import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import { kv } from '@vercel/kv';
import * as fs from 'fs';
import * as path from 'path';
import { Config } from '../src/types';
import { verifyToken } from './auth';
import { checkEnv } from './envCheck';
import { completeBrandSetup } from '../src/utils/brandSetupUtils';

dotenv.config();
// Only check environment variables for non-upload endpoints
// checkEnv();

const app = express();
const PORT = process.env.API_PORT || 3001;
const BMW_CONFIG_KEY = 'bmw:config';

// Middleware
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// No custom auth endpoints when using Supabase Auth

// Helper function to add metadata to config
function addMetadata(config: Config, source: 'file' | 'redis', modifiedBy: string = 'system'): Config {
  return {
    ...config,
    metadata: {
      lastModified: new Date().toISOString(),
      modifiedBy,
      version: (config.metadata?.version || 0) + 1,
      source
    }
  };
}

// Helper function to sync configs based on timestamps
async function syncConfigs(): Promise<Config> {
  let redisConfig: Config | null = null;
  let fileConfig: Config | null = null;
  
  // Get Redis config
  try {
    redisConfig = await kv.get<Config>(BMW_CONFIG_KEY);
  } catch (error) {
    console.warn('Could not read from Redis:', error);
  }
  
  // Get file config
  try {
    const configPath = path.join(process.cwd(), 'public', 'config.json');
    fileConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  } catch (error) {
    console.warn('Could not read config file:', error);
  }
  
  // If neither exists, throw error
  if (!redisConfig && !fileConfig) {
    throw new Error('No configuration found in Redis or file');
  }
  
  // If only one exists, use it and sync to the other
  if (!redisConfig && fileConfig) {
    console.log('📁 Only file config exists, syncing to Redis');
    const configWithMetadata = addMetadata(fileConfig, 'file');
    await kv.set(BMW_CONFIG_KEY, configWithMetadata);
    return configWithMetadata;
  }
  
  if (redisConfig && !fileConfig) {
    console.log('☁️ Only Redis config exists, syncing to file');
    const configPath = path.join(process.cwd(), 'public', 'config.json');
    fs.writeFileSync(configPath, JSON.stringify(redisConfig, null, 2));
    return redisConfig;
  }
  
  // Both exist - compare timestamps
  const redisTime = redisConfig!.metadata?.lastModified || '1970-01-01T00:00:00.000Z';
  const fileTime = fileConfig!.metadata?.lastModified || '1970-01-01T00:00:00.000Z';
  
  if (redisTime > fileTime) {
    console.log('☁️ Redis config is newer, syncing to file');
    const configPath = path.join(process.cwd(), 'public', 'config.json');
    fs.writeFileSync(configPath, JSON.stringify(redisConfig, null, 2));
    return redisConfig!;
  } else if (fileTime > redisTime) {
    console.log('📁 File config is newer, syncing to Redis');
    const configWithMetadata = addMetadata(fileConfig!, 'file');
    await kv.set(BMW_CONFIG_KEY, configWithMetadata);
    return configWithMetadata;
  } else {
    console.log('🔄 Configs have same timestamp, using Redis as source of truth');
    return redisConfig!;
  }
}

// GET /api/config - Get configuration with sync
app.get('/api/config', verifyToken, async (req, res) => {
  try {
    // Check environment variables for this endpoint
    checkEnv();
    const config = await syncConfigs();
    res.json(config);
  } catch (error) {
    console.error('Config API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/config - Update entire configuration
app.put('/api/config', verifyToken, (req, res) => {
  res.status(403).json({ error: 'Editing disabled' });
});

// PUT /api/messages/:id - Update specific message
app.put('/api/messages/:id', verifyToken, (req, res) => {
  res.status(403).json({ error: 'Editing disabled' });
});

// PUT /api/guides/:id - Update specific guide
app.put('/api/guides/:id', verifyToken, (req, res) => {
  res.status(403).json({ error: 'Editing disabled' });
});

// POST /api/upload-files - Upload generated files to backend
app.post('/api/upload-files', verifyToken, (req, res) => {
  try {
    console.log(`[${new Date().toISOString()}] Upload Files Handler: Processing POST request`);
    console.log("Upload Files Handler: Request body:", req.body);

    const { files, brandCode, brandName } = req.body;

    if (!files || !Array.isArray(files)) {
      return res.status(400).json({ 
        error: "Invalid request: 'files' array is required" 
      });
    }

    const results: any[] = [];
    const allowedDirectories = [
      "public/locales",
      "public/assets",
      "public/assets/logos",
      "src/locales"
    ];

    for (const file of files) {
      try {
        const { filename, content, targetPath, isBinary, mimeType } = file;

        if (!filename || !content) {
          results.push({
            filename: filename || "unknown",
            success: false,
            error: "Missing filename or content"
          });
          continue;
        }

        // Determine the target directory
        let finalPath: string;
        if (targetPath) {
          // Validate targetPath to prevent directory traversal attacks
          const normalizedPath = path.normalize(targetPath);
          const isAllowed = allowedDirectories.some(allowedDir => 
            normalizedPath.startsWith(allowedDir)
          );
          
          if (!isAllowed) {
            results.push({
              filename,
              success: false,
              error: `Path not allowed: ${targetPath}`
            });
            continue;
          }
          
          finalPath = path.join(process.cwd(), normalizedPath);
        } else {
          // Default to public/locales if no targetPath specified
          finalPath = path.join(process.cwd(), "public", "locales", filename);
        }

        // Ensure the directory exists
        const dir = path.dirname(finalPath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
          console.log(`Created directory: ${dir}`);
        }

        // Write the file
        if (isBinary && mimeType) {
          // Handle binary files (like images)
          try {
            const buffer = Buffer.from(content, 'base64');
            fs.writeFileSync(finalPath, buffer);
            console.log(`✅ Successfully wrote binary file: ${finalPath} (${mimeType})`);
          } catch (binaryError: any) {
            console.error(`Error writing binary file ${filename}:`, binaryError);
            results.push({
              filename,
              success: false,
              error: `Binary file write failed: ${binaryError.message}`
            });
            continue;
          }
        } else {
          // Handle text files
          fs.writeFileSync(finalPath, content, "utf8");
          console.log(`✅ Successfully wrote text file: ${finalPath}`);
        }
        
        results.push({
          filename,
          path: finalPath,
          success: true
        });

      } catch (fileError: any) {
        console.error(`Error processing file ${file.filename || "unknown"}:`, fileError);
        results.push({
          filename: file.filename || "unknown",
          success: false,
          error: fileError.message
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.length - successCount;

    console.log(`✅ Upload Files Handler: Processed ${results.length} files. ${successCount} successful, ${failureCount} failed`);

    // If brand setup information is provided, complete the brand setup
    let brandSetupResult = null;
    if (brandCode && brandName && successCount > 0) {
      console.log(`🔄 Completing brand setup for ${brandName} (${brandCode})...`);
      try {
        brandSetupResult = completeBrandSetup(brandCode, brandName);
        console.log(`✅ Brand setup result:`, brandSetupResult);
      } catch (brandSetupError: any) {
        console.error(`❌ Brand setup failed:`, brandSetupError);
        brandSetupResult = {
          success: false,
          message: `Brand setup failed: ${brandSetupError.message}`,
          details: {
            localeIndexUpdated: false,
            headerUpdated: false,
            errors: [brandSetupError.message]
          }
        };
      }
    }

    return res.status(200).json({
      success: true,
      message: `Processed ${results.length} files`,
      results,
      summary: {
        total: results.length,
        successful: successCount,
        failed: failureCount
      },
      brandSetup: brandSetupResult
    });

  } catch (error: any) {
    console.error("Upload Files Handler: Error:", error);
    return res.status(500).json({ 
      error: "Internal server error", 
      details: error.message 
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 API Server running on http://localhost:${PORT}`);
  console.log(`📡 Redis key: ${BMW_CONFIG_KEY}`);
}); 