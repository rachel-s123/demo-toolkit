import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import { createClient } from 'redis';
import * as fs from 'fs';
import * as path from 'path';
import { Config } from '../src/types';
import { verifyToken } from './auth';
import { checkEnv } from './envCheck';
import { completeBrandSetup } from '../src/utils/brandSetupUtils';

dotenv.config();
// Check environment variables
checkEnv();

const app = express();
const PORT = process.env.API_PORT || 3001;
const BMW_CONFIG_KEY = 'bmw:config';

// Redis client setup
let redisClient: any = null;

async function initRedis() {
  try {
    if (process.env.REDIS_URL) {
      redisClient = createClient({
        url: process.env.REDIS_URL
      });
      
      redisClient.on('error', (err: any) => console.error('Redis Client Error', err));
      redisClient.on('connect', () => console.log('✅ Connected to Redis'));
      
      await redisClient.connect();
      console.log('🚀 Redis client initialized');
    } else {
      console.warn('⚠️ REDIS_URL not set, Redis operations will be skipped');
    }
  } catch (error) {
    console.error('❌ Failed to initialize Redis:', error);
  }
}

// Initialize Redis on startup
initRedis();

// Middleware
app.use(cors());
app.use(express.json({ limit: '1mb' }));



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
    if (redisClient) {
      const redisData = await redisClient.get(BMW_CONFIG_KEY);
      redisConfig = redisData ? JSON.parse(redisData) : null;
    }
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
    if (redisClient) {
      await redisClient.set(BMW_CONFIG_KEY, JSON.stringify(configWithMetadata));
    }
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
    if (redisClient) {
      await redisClient.set(BMW_CONFIG_KEY, JSON.stringify(configWithMetadata));
    }
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

// Sync brand data to Redis endpoint
app.post('/api/sync-brand-to-backend', async (req, res) => {
  try {
    console.log('🔄 Sync API called with data:', req.body);
    
    const { brandCode, brandName, configContent, localeContent } = req.body;
    
    if (!brandCode || !configContent) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required brand data' 
      });
    }

    // Create a new brand config object
    const newBrandConfig = {
      brandCode,
      brandName: brandName || brandCode,
      config: configContent,
      locale: localeContent,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Store in Redis with a unique key
    const brandKey = `brand:${brandCode}`;
    if (redisClient) {
      await redisClient.set(brandKey, JSON.stringify(newBrandConfig));
      console.log(`✅ Brand ${brandCode} synced to Redis with key: ${brandKey}`);
    }

    // Also update the main brands list
    const brandsListKey = 'brands:list';
    let brandsList = [];
    
    if (redisClient) {
      const existingList = await redisClient.get(brandsListKey);
      if (existingList) {
        brandsList = JSON.parse(existingList);
      }
      
      // Add new brand if not already in list
      if (!brandsList.find((b: any) => b.brandCode === brandCode)) {
        brandsList.push({
          brandCode,
          brandName: brandName || brandCode,
          createdAt: new Date().toISOString()
        });
        
        await redisClient.set(brandsListKey, JSON.stringify(brandsList));
        console.log(`✅ Brands list updated in Redis`);
      }
    }

    res.json({ 
      success: true, 
      message: `Brand ${brandCode} synced successfully`,
      brandKey,
      brandsListKey
    });

  } catch (error: any) {
    console.error('❌ Sync API error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

  // Get brands list from Redis
  app.get('/api/brands', async (req, res) => {
    try {
      if (!redisClient) {
        return res.status(500).json({ 
          success: false, 
          error: 'Redis not connected' 
        });
      }

      const brandsListKey = 'brands:list';
      const brandsList = await redisClient.get(brandsListKey);
      
      if (brandsList) {
        const brands = JSON.parse(brandsList);
        console.log(`📦 Retrieved ${brands.length} brands from Redis`);
        res.json({ 
          success: true, 
          brands: brands 
        });
      } else {
        console.log('📦 No brands found in Redis');
        res.json({ 
          success: true, 
          brands: [] 
        });
      }

    } catch (error: any) {
      console.error('❌ Get brands API error:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
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

// GET /api/get-brands-from-blob - Mock endpoint for local development
app.get('/api/get-brands-from-blob', (req, res) => {
  try {
    console.log('🔍 Local development: Mocking get-brands-from-blob endpoint');
    
    // Return empty brands array for local development
    res.status(200).json({
      success: true,
      brands: [],
      total: 0,
      note: "Local development mode - no blob storage available"
    });
  } catch (error) {
    console.error('Error in get-brands-from-blob:', error);
    res.status(500).json({
      error: 'Failed to retrieve brands',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/get-brands - Get brands from Redis
app.get('/api/brands', async (req, res) => {
  try {
    console.log('🔍 Getting brands from Redis...');
    
    if (!redisClient) {
      return res.status(500).json({
        success: false,
        error: 'Redis client not initialized'
      });
    }

    const brandsList = await redisClient.get('brands:list');
    if (brandsList) {
      const brands = JSON.parse(brandsList);
      console.log(`✅ Retrieved ${brands.length} brands from Redis`);
      return res.status(200).json({
        success: true,
        brands
      });
    } else {
      console.log('📦 No brands found in Redis');
      return res.status(200).json({
        success: true,
        brands: []
      });
    }
  } catch (error) {
    console.error('Error retrieving brands:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve brands',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/sync-brand-to-backend - Sync brand data to Redis
app.post('/api/sync-brand-to-backend', async (req, res) => {
  try {
    const { brandCode, brandName, files } = req.body;
    
    if (!brandCode || !brandName) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: brandCode and brandName'
      });
    }

    if (!redisClient) {
      return res.status(500).json({
        success: false,
        error: 'Redis client not initialized'
      });
    }

    console.log(`🔄 Syncing brand ${brandName} (${brandCode}) to Redis...`);
    console.log(`📁 Files received:`, files ? files.length : 0);

    // Extract config and locale content from files
    let configContent = null;
    let localeContent = null;

    if (files && Array.isArray(files)) {
      const configFile = files.find((f: any) => f.filename && f.filename.includes('config_'));
      const localeFile = files.find((f: any) => f.filename && f.filename.includes('.ts'));

      if (configFile && configFile.content) {
        try {
          configContent = JSON.parse(configFile.content);
          console.log(`✅ Config content extracted from ${configFile.filename}`);
        } catch (parseError) {
          console.warn(`⚠️ Could not parse config content from ${configFile.filename}`);
        }
      }

      if (localeFile && localeFile.content) {
        localeContent = localeFile.content;
        console.log(`✅ Locale content extracted from ${localeFile.filename}`);
      }
    }

    // Store the full brand configuration
    const brandKey = `brand:${brandCode}`;
    const brandData = {
      brandCode,
      brandName,
      configContent,
      localeContent,
      syncedAt: new Date().toISOString()
    };

    await redisClient.set(brandKey, JSON.stringify(brandData));
    console.log(`✅ Brand ${brandCode} synced to Redis`);

    // Update the central brands list
    const brandsListKey = 'brands:list';
    let brandsList = [];
    
    try {
      const existingList = await redisClient.get(brandsListKey);
      if (existingList) {
        brandsList = JSON.parse(existingList);
      }
    } catch (parseError) {
      console.warn('Could not parse existing brands list, starting fresh');
    }

    // Add or update the brand in the list
    const existingBrandIndex = brandsList.findIndex((b: any) => b.brandCode === brandCode);
    if (existingBrandIndex >= 0) {
      brandsList[existingBrandIndex] = {
        brandCode,
        brandName,
        syncedAt: brandData.syncedAt
      };
    } else {
      brandsList.push({
        brandCode,
        brandName,
        syncedAt: brandData.syncedAt
      });
    }

    await redisClient.set(brandsListKey, JSON.stringify(brandsList));
    console.log(`✅ Brands list updated in Redis`);

    return res.status(200).json({
      success: true,
      message: `Brand ${brandName} synced to Redis successfully`,
      brandCode,
      brandName
    });

  } catch (error: any) {
    console.error('❌ Error syncing brand to backend:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to sync brand to backend',
      details: error.message
    });
  }
});

// DELETE /api/brands/:brandCode - Delete a brand from backend
app.delete('/api/brands/:brandCode', async (req, res) => {
  try {
    const { brandCode } = req.params;
    
    if (!brandCode) {
      return res.status(400).json({
        success: false,
        error: 'Missing brand code'
      });
    }

    if (!redisClient) {
      return res.status(500).json({
        success: false,
        error: 'Redis client not initialized'
      });
    }

    console.log(`🗑️ Deleting brand ${brandCode} from backend...`);

    // Remove the brand from Redis
    const brandKey = `brand:${brandCode}`;
    await redisClient.del(brandKey);
    console.log(`✅ Brand ${brandCode} removed from Redis`);

    // Update the central brands list
    const brandsListKey = 'brands:list';
    let brandsList = [];
    
    try {
      const existingList = await redisClient.get(brandsListKey);
      if (existingList) {
        brandsList = JSON.parse(existingList);
        // Remove the brand from the list
        brandsList = brandsList.filter((b: any) => b.brandCode !== brandCode);
        await redisClient.set(brandsListKey, JSON.stringify(brandsList));
        console.log(`✅ Brands list updated in Redis`);
      }
    } catch (parseError) {
      console.warn('Could not parse existing brands list');
    }

    return res.status(200).json({
      success: true,
      message: `Brand ${brandCode} deleted from backend successfully`,
      brandCode
    });

  } catch (error: any) {
    console.error('❌ Error deleting brand from backend:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to delete brand from backend',
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