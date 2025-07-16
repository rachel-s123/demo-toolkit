import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import { kv } from '@vercel/kv';
import * as fs from 'fs';
import * as path from 'path';
import { Config } from '../src/types';
import { verifyToken } from './auth';
import { checkEnv } from './envCheck';

dotenv.config();
checkEnv();

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


// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 API Server running on http://localhost:${PORT}`);
  console.log(`📡 Redis key: ${BMW_CONFIG_KEY}`);
}); 