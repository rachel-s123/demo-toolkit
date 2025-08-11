import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('📡 Brands API called - getting brands from blob storage');
    
    // Import the blob list function
    const { list } = await import('@vercel/blob');
    
    // Check if Vercel Blob is configured
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.warn('⚠️ Vercel Blob not configured');
      return res.status(200).json({
        success: true,
        brands: [],
        total: 0,
        note: "Vercel Blob Storage is not configured."
      });
    }

    // Get all brands by scanning blob storage (same logic as get-brands-from-blob)
    console.log('🔍 Scanning Vercel Blob Storage for brands...');
    
    // List all config files
    const configBlobs = await list({ prefix: 'brand-assets/configs/' });
    console.log(`📁 Found ${configBlobs.blobs.length} config files`);

    const brands = [];

    for (const blob of configBlobs.blobs) {
      try {
        // Extract brand code from filename (config_brandcode.json)
        const filename = blob.pathname.split('/').pop() || '';
        const brandCodeMatch = filename.match(/config_(.+)\.json$/);
        
        if (brandCodeMatch) {
          const brandCode = brandCodeMatch[1];
          
          // Fetch the config file
          const response = await fetch(blob.url);
          const configContent = await response.json();
          
          const brandConfig = {
            brandCode,
            brandName: configContent.brand?.name || brandCode,
            createdAt: blob.uploadedAt,
            updatedAt: blob.uploadedAt
          };

          brands.push(brandConfig);
        }
      } catch (error) {
        console.warn(`⚠️ Could not process brand config: ${blob.pathname}`, error);
      }
    }

    console.log(`📦 Returning ${brands.length} brands from blob storage`);
    
    return res.status(200).json({
      success: true,
      brands: brands,
      total: brands.length
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