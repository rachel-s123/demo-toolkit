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
        error: 'Vercel Blob Storage is not configured. Please set BLOB_READ_WRITE_TOKEN environment variable.',
        status: 'not-configured'
      });
    }

    console.log('🔍 Testing Vercel Blob Storage scan...');

    // Test scanning different directories
    const results = {
      configs: [],
      locales: [],
      logos: [],
      all: []
    };

    try {
      // Scan configs
      const configBlobs = await list({ prefix: 'brand-assets/configs/' });
      results.configs = configBlobs.blobs.map(blob => ({
        pathname: blob.pathname,
        url: blob.url,
        size: blob.size,
        uploadedAt: blob.uploadedAt
      }));

      // Scan locales
      const localeBlobs = await list({ prefix: 'brand-assets/locales/' });
      results.locales = localeBlobs.blobs.map(blob => ({
        pathname: blob.pathname,
        url: blob.url,
        size: blob.size,
        uploadedAt: blob.uploadedAt
      }));

      // Scan logos
      const logoBlobs = await list({ prefix: 'brand-assets/logos/' });
      results.logos = logoBlobs.blobs.map(blob => ({
        pathname: blob.pathname,
        url: blob.url,
        size: blob.size,
        uploadedAt: blob.uploadedAt
      }));

      // Scan all files
      const allBlobs = await list({ prefix: 'brand-assets/' });
      results.all = allBlobs.blobs.map(blob => ({
        pathname: blob.pathname,
        url: blob.url,
        size: blob.size,
        uploadedAt: blob.uploadedAt
      }));

      console.log(`✅ Blob scan successful:`);
      console.log(`   - Configs: ${results.configs.length}`);
      console.log(`   - Locales: ${results.locales.length}`);
      console.log(`   - Logos: ${results.logos.length}`);
      console.log(`   - Total: ${results.all.length}`);

      return res.status(200).json({
        success: true,
        message: 'Vercel Blob Storage scan successful',
        results,
        summary: {
          configs: results.configs.length,
          locales: results.locales.length,
          logos: results.logos.length,
          total: results.all.length
        },
        status: 'working'
      });

    } catch (scanError: any) {
      console.error('❌ Blob scan failed:', scanError);
      return res.status(500).json({
        error: 'Failed to scan Vercel Blob Storage',
        details: scanError.message,
        status: 'scan-failed'
      });
    }

  } catch (error: any) {
    console.error('❌ Test failed:', error);
    return res.status(500).json({
      error: 'Test failed',
      details: error.message,
      status: 'error'
    });
  }
} 