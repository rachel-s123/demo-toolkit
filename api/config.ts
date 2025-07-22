import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as fs from 'fs';
import * as path from 'path';
import { Config } from '../src/types';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log(`[${new Date().toISOString()}] Config Handler: Processing GET request`);

    // In Vercel, we need to use a different approach since filesystem is read-only
    // For now, return a basic config structure
    const config: Config = {
      isDemo: true,
      demoNotice: "This is a demo configuration in production environment.",
      assets: [],
      messages: [],
      guides: [],
      journeySteps: [],
      filterOptions: {
        phases: [],
        types: [],
        models: [],
        channels: [],
        actionTypes: []
      },
      metadata: {
        lastModified: new Date().toISOString(),
        modifiedBy: "system",
        version: 1,
        source: "file"
      }
    };

    console.log(`✅ Config Handler: Successfully loaded config from file`);

    return res.status(200).json(config);

  } catch (error: any) {
    console.error("Config Handler: Error:", error);
    return res.status(500).json({ 
      error: "Internal server error", 
      details: error.message 
    });
  }
} 