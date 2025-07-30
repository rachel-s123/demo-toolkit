import type { VercelRequest, VercelResponse } from '@vercel/node';
import { put } from '@vercel/blob';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🧪 Testing Vercel Blob Storage configuration...');

    // Check environment variables
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return res.status(500).json({
        error: 'BLOB_READ_WRITE_TOKEN is not configured',
        status: 'failed'
      });
    }

    // Test upload a simple text file
    const testContent = `Test file created at ${new Date().toISOString()}`;
    const testPath = `test/test-${Date.now()}.txt`;

    console.log(`📤 Testing upload to: ${testPath}`);

    const blobData = await put(testPath, testContent, {
      contentType: 'text/plain',
      access: 'public'
    });

    console.log('✅ Test upload successful:', blobData.url);

    return res.status(200).json({
      status: 'success',
      message: 'Vercel Blob Storage is working correctly',
      testFile: {
        path: testPath,
        url: blobData.url,
        size: testContent.length
      },
      environment: {
        hasBlobToken: !!process.env.BLOB_READ_WRITE_TOKEN,
        isVercel: !!process.env.VERCEL,
        nodeEnv: process.env.NODE_ENV
      }
    });

  } catch (error: any) {
    console.error('❌ Vercel Blob test failed:', error);
    return res.status(500).json({
      status: 'failed',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      environment: {
        hasBlobToken: !!process.env.BLOB_READ_WRITE_TOKEN,
        isVercel: !!process.env.VERCEL,
        nodeEnv: process.env.NODE_ENV
      }
    });
  }
} 