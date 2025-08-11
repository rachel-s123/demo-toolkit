import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('📡 Brands API called - attempting to get brands from backend');
    
    // In production, we need to call the local server or use a different approach
    // For now, return an empty list since we can't access Redis directly from Vercel
    // The frontend will fall back to BrandLoader which loads from blob storage
    
    console.log('📡 Production environment - returning empty brands list');
    
    return res.status(200).json({
      success: true,
      brands: [],
      message: 'Production environment - using BrandLoader fallback'
    });

  } catch (error: any) {
    console.error('❌ Error in brands API:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get brands',
      details: error.message
    });
  }
} 