import type { VercelRequest, VercelResponse } from '@vercel/node';
import { list } from '@vercel/blob';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check if Vercel Blob is configured
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return res.status(500).json({ 
        error: 'Vercel Blob Storage is not configured' 
      });
    }

    console.log('🔍 Debug: Scanning Vercel Blob Storage...');
    
    // List all files in brand-assets
    const allBlobs = await list({ prefix: 'brand-assets/' });
    console.log(`📁 Found ${allBlobs.blobs.length} total files in brand-assets/`);

    // List config files
    const configBlobs = await list({ prefix: 'brand-assets/configs/' });
    console.log(`📁 Found ${configBlobs.blobs.length} config files`);

    // List locale files
    const localeBlobs = await list({ prefix: 'brand-assets/locales/' });
    console.log(`📁 Found ${localeBlobs.blobs.length} locale files`);

    // List logo files
    const logoBlobs = await list({ prefix: 'brand-assets/logos/' });
    console.log(`📁 Found ${logoBlobs.blobs.length} logo files`);

    // Get details for each config file
    const configDetails = [];
    for (const blob of configBlobs.blobs) {
      try {
        const response = await fetch(blob.url);
        const configContent = await response.json();
        configDetails.push({
          filename: blob.pathname.split('/').pop(),
          url: blob.url,
          uploadedAt: blob.uploadedAt,
          size: blob.size,
          brandName: configContent.brand?.name || 'Unknown',
          brandCode: blob.pathname.match(/config_(.+)\.json$/)?.[1] || 'Unknown'
        });
      } catch (error) {
        configDetails.push({
          filename: blob.pathname.split('/').pop(),
          url: blob.url,
          uploadedAt: blob.uploadedAt,
          size: blob.size,
          error: 'Failed to parse config'
        });
      }
    }

    return res.status(200).json({
      success: true,
      summary: {
        totalFiles: allBlobs.blobs.length,
        configFiles: configBlobs.blobs.length,
        localeFiles: localeBlobs.blobs.length,
        logoFiles: logoBlobs.blobs.length
      },
      configDetails,
      allFiles: allBlobs.blobs.map(blob => ({
        pathname: blob.pathname,
        url: blob.url,
        uploadedAt: blob.uploadedAt,
        size: blob.size
      }))
    });

  } catch (error: any) {
    console.error('❌ Debug blob storage error:', error);
    return res.status(500).json({
      error: 'Failed to debug blob storage',
      details: error.message
    });
  }
} 