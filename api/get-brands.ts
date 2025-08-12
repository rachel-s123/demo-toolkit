import type { VercelRequest, VercelResponse } from '@vercel/node';
import { kv } from '@vercel/kv';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { brandCode } = req.query;

    if (!process.env.REDIS_URL) {
      console.warn('⚠️ Redis not configured, returning empty response');
      return res.status(200).json({ success: true, brands: [], message: 'No backend storage configured' });
    }

    if (brandCode) {
      try {
        const brandKey = `brand:${brandCode}`;
        const brand = await kv.get(brandKey);
        if (!brand) {
          return res.status(404).json({ success: false, error: `Brand ${brandCode} not found` });
        }
        return res.status(200).json({ success: true, brand, message: `Brand ${brandCode} retrieved successfully` });
      } catch (e: any) {
        console.error('❌ KV get brand error:', e);
        return res.status(200).json({ success: true, brand: null, message: 'KV error; returning null brand' });
      }
    } else {
      try {
        const mainConfig: any = await kv.get('bmw:config');
        if (!mainConfig || !mainConfig.brands) {
          return res.status(200).json({ success: true, brands: [], message: 'No brands found' });
        }
        const detailedBrands = await Promise.all(
          mainConfig.brands.map(async (brandSummary: any) => {
            try {
              const brandKey = `brand:${brandSummary.brandCode}`;
              const detailedBrand = await kv.get(brandKey);
              return detailedBrand || brandSummary;
            } catch (e) {
              return brandSummary;
            }
          })
        );
        return res.status(200).json({ success: true, brands: detailedBrands, message: `Retrieved ${detailedBrands.length} brands successfully` });
      } catch (e: any) {
        console.error('❌ KV list brands error:', e);
        return res.status(200).json({ success: true, brands: [], message: 'KV error; returning empty brand list' });
      }
    }
  } catch (error: any) {
    console.error('Error retrieving brands:', error);
    return res.status(200).json({ success: true, brands: [], message: 'Unhandled error; returning empty' });
  }
} 