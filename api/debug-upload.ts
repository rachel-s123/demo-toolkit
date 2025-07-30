import type { VercelRequest, VercelResponse } from '@vercel/node';
import { list } from '@vercel/blob';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🔍 Debug: Starting upload process test...');

    // Check environment variables
    const envCheck = {
      BLOB_READ_WRITE_TOKEN: !!process.env.BLOB_READ_WRITE_TOKEN,
      VERCEL_URL: process.env.VERCEL_URL,
      NODE_ENV: process.env.NODE_ENV
    };

    console.log('🔍 Debug: Environment check:', envCheck);

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return res.status(500).json({
        error: 'BLOB_READ_WRITE_TOKEN not configured',
        envCheck
      });
    }

    // Test blob storage access
    console.log('🔍 Debug: Testing blob storage access...');
    
    try {
      const allBlobs = await list({ prefix: 'brand-assets/' });
      console.log(`🔍 Debug: Found ${allBlobs.blobs.length} files in blob storage`);
      
      const configBlobs = await list({ prefix: 'brand-assets/configs/' });
      const localeBlobs = await list({ prefix: 'brand-assets/locales/' });
      const logoBlobs = await list({ prefix: 'brand-assets/logos/' });

      const blobSummary = {
        total: allBlobs.blobs.length,
        configs: configBlobs.blobs.length,
        locales: localeBlobs.blobs.length,
        logos: logoBlobs.blobs.length,
        files: allBlobs.blobs.map(blob => ({
          pathname: blob.pathname,
          size: blob.size,
          uploadedAt: blob.uploadedAt
        }))
      };

      console.log('🔍 Debug: Blob summary:', blobSummary);

      // Test sync endpoint
      console.log('🔍 Debug: Testing sync endpoint...');
      const baseUrl = process.env.VERCEL_URL 
        ? `https://${process.env.VERCEL_URL}` 
        : 'https://demo-toolkit.vercel.app';
      
      console.log('🔍 Debug: Using base URL:', baseUrl);

      const syncResponse = await fetch(`${baseUrl}/api/sync-brand-to-backend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          brandCode: 'test',
          brandName: 'Test Brand',
          files: [
            {
              filename: 'test.ts',
              url: 'https://example.com/test.ts',
              type: 'locale',
              storagePath: 'brand-assets/locales/test.ts'
            }
          ]
        })
      });

      const syncResult = await syncResponse.json();
      console.log('🔍 Debug: Sync test result:', syncResult);

      return res.status(200).json({
        success: true,
        message: 'Debug test completed',
        envCheck,
        blobSummary,
        syncTest: {
          status: syncResponse.status,
          result: syncResult
        }
      });

    } catch (blobError: any) {
      console.error('🔍 Debug: Blob storage error:', blobError);
      return res.status(500).json({
        error: 'Blob storage test failed',
        details: blobError.message,
        envCheck
      });
    }

  } catch (error: any) {
    console.error('🔍 Debug: General error:', error);
    return res.status(500).json({
      error: 'Debug test failed',
      details: error.message
    });
  }
} 