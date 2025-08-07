import type { VercelRequest, VercelResponse } from '@vercel/node';
import { kv } from '@vercel/kv';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { brandCode } = req.query;

    // Check if Redis is configured
    if (!process.env.REDIS_URL) {
      console.warn('⚠️ Redis not configured, returning empty response');
      return res.status(200).json({
        success: true,
        brands: [],
        message: 'No backend storage configured'
      });
    }

    if (brandCode) {
      // Get specific brand
      const brandKey = `brand:${brandCode}`;
      const brand = await kv.get(brandKey);
      
      if (!brand) {
        return res.status(404).json({
          success: false,
          error: `Brand ${brandCode} not found`
        });
      }

      return res.status(200).json({
        success: true,
        brand,
        message: `Brand ${brandCode} retrieved successfully`
      });
    } else {
      // Get all brands
      const mainConfig = await kv.get('bmw:config');
      
      if (!mainConfig || !mainConfig.brands) {
        return res.status(200).json({
          success: true,
          brands: [],
          message: 'No brands found'
        });
      }

      // Get detailed information for each brand
      const detailedBrands = await Promise.all(
        mainConfig.brands.map(async (brandSummary: any) => {
          const brandKey = `brand:${brandSummary.brandCode}`;
          const detailedBrand = await kv.get(brandKey);
          return detailedBrand || brandSummary;
        })
      );

      return res.status(200).json({
        success: true,
        brands: detailedBrands,
        message: `Retrieved ${detailedBrands.length} brands successfully`
      });
    }
  } catch (error: any) {
    console.error('Error retrieving brands:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve brands',
      details: error.message
    });
  }
} 