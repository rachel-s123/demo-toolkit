import type { VercelRequest, VercelResponse } from '@vercel/node';
import { kv } from '@vercel/kv';

interface BrandFile {
  filename: string;
  publicUrl: string;
  storagePath: string;
  type: 'locale' | 'config' | 'logo';
}

interface SyncRequest {
  brandCode: string;
  brandName: string;
  files: BrandFile[];
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { brandCode, brandName, files }: SyncRequest = req.body;

    if (!brandCode || !brandName || !files) {
      return res.status(400).json({ 
        error: 'Missing required fields: brandCode, brandName, files' 
      });
    }

    console.log(`🔄 Syncing brand ${brandName} (${brandCode}) to backend...`);

    // Get current config from Redis
    let currentConfig;
    try {
      currentConfig = await kv.get('bmw:config');
    } catch (error) {
      console.warn('Could not fetch current config from Redis:', error);
      currentConfig = null;
    }

    // Create brand configuration
    const brandConfig = {
      brandCode,
      brandName,
      files: files.map(file => ({
        filename: file.filename,
        url: file.publicUrl,
        type: file.type,
        storagePath: file.storagePath
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Store brand config in Redis
    const brandKey = `brand:${brandCode}`;
    await kv.set(brandKey, brandConfig);

    // Update main config if it exists
    if (currentConfig) {
      if (!currentConfig.brands) {
        currentConfig.brands = [];
      }
      
      // Remove existing brand config if it exists
      currentConfig.brands = currentConfig.brands.filter(
        (brand: any) => brand.brandCode !== brandCode
      );
      
      // Add new brand config
      currentConfig.brands.push(brandConfig);
      currentConfig.metadata = {
        ...currentConfig.metadata,
        lastModified: new Date().toISOString(),
        modifiedBy: 'brand-sync-api',
        version: (currentConfig.metadata?.version || 0) + 1
      };

      await kv.set('bmw:config', currentConfig);
    }

    // Create brand-specific config for the frontend
    const frontendConfig = {
      brandCode,
      brandName,
      logoUrl: files.find(f => f.type === 'logo')?.publicUrl,
      localeUrl: files.find(f => f.type === 'locale')?.publicUrl,
      configUrl: files.find(f => f.type === 'config')?.publicUrl,
      isActive: true,
      createdAt: new Date().toISOString()
    };

    // Store frontend config
    const frontendKey = `frontend:brand:${brandCode}`;
    await kv.set(frontendKey, frontendConfig);

    console.log(`✅ Successfully synced brand ${brandName} to backend`);

    return res.status(200).json({
      success: true,
      message: `Brand ${brandName} successfully synced to backend`,
      brandConfig,
      frontendConfig,
      files: files.length
    });

  } catch (error: any) {
    console.error('❌ Error syncing brand to backend:', error);
    return res.status(500).json({
      error: 'Failed to sync brand to backend',
      details: error.message
    });
  }
} 