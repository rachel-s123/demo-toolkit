import type { VercelRequest, VercelResponse } from '@vercel/node';
import { kv } from '@vercel/kv';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { brandCode } = req.query;

    if (brandCode) {
      // Get specific brand
      const brandKey = `brand:${brandCode}`;
      const brand = await kv.get(brandKey);
      
      if (!brand) {
        return res.status(404).json({ 
          error: `Brand with code '${brandCode}' not found` 
        });
      }

      return res.status(200).json({
        success: true,
        brand
      });
    } else {
      // Get all brands
      const mainConfig = await kv.get('bmw:config');
      const brands = mainConfig?.brands || [];

      // Also get individual brand configs for more details
      const allBrandKeys = await kv.keys('brand:*');
      const brandDetails = await Promise.all(
        allBrandKeys.map(async (key) => {
          const brand = await kv.get(key);
          return brand;
        })
      );

      return res.status(200).json({
        success: true,
        brands: brandDetails.filter(Boolean),
        total: brandDetails.length,
        mainConfig: mainConfig ? {
          lastModified: mainConfig.metadata?.lastModified,
          version: mainConfig.metadata?.version,
          totalBrands: mainConfig.brands?.length || 0
        } : null
      });
    }

  } catch (error: any) {
    console.error('❌ Error retrieving brands:', error);
    return res.status(500).json({
      error: 'Failed to retrieve brands',
      details: error.message
    });
  }
} 