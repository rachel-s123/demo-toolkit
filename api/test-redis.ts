import type { VercelRequest, VercelResponse } from '@vercel/node';
import { kv } from '@vercel/kv';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🔍 Testing Redis connection...');
    console.log('Environment variables:');
    console.log('- REDIS_URL:', process.env.REDIS_URL ? 'SET' : 'NOT SET');
    console.log('- KV_REST_API_URL:', process.env.KV_REST_API_URL ? 'SET' : 'NOT SET');
    console.log('- UPSTASH_REDIS_REST_URL:', process.env.UPSTASH_REDIS_REST_URL ? 'SET' : 'NOT SET');
    
    // Check if Redis is configured
    if (!process.env.REDIS_URL && !process.env.KV_REST_API_URL) {
      return res.status(200).json({
        success: false,
        message: 'Redis not configured',
        details: {
          REDIS_URL: process.env.REDIS_URL ? 'SET' : 'NOT SET',
          KV_REST_API_URL: process.env.KV_REST_API_URL ? 'SET' : 'NOT SET',
          UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL ? 'SET' : 'NOT SET'
        },
        note: 'Set REDIS_URL or KV_REST_API_URL environment variable'
      });
    }

    // Test Redis connection
    console.log('🔄 Attempting Redis connection...');
    
    try {
      // Try to set a test value
      await kv.set('test:connection', 'Hello Redis!', { ex: 60 });
      console.log('✅ Test value set successfully');
      
      // Try to get the test value
      const testValue = await kv.get('test:connection');
      console.log('✅ Test value retrieved:', testValue);
      
      // Clean up
      await kv.del('test:connection');
      console.log('✅ Test value cleaned up');
      
      return res.status(200).json({
        success: true,
        message: 'Redis connection successful!',
        testValue,
        timestamp: new Date().toISOString()
      });
      
    } catch (redisError: any) {
      console.error('❌ Redis connection failed:', redisError);
      return res.status(500).json({
        success: false,
        message: 'Redis connection failed',
        error: redisError.message,
        details: {
          REDIS_URL: process.env.REDIS_URL ? 'SET' : 'NOT SET',
          KV_REST_API_URL: process.env.KV_REST_API_URL ? 'SET' : 'NOT SET'
        }
      });
    }

  } catch (error: any) {
    console.error('❌ Test endpoint error:', error);
    return res.status(500).json({
      success: false,
      message: 'Test endpoint error',
      error: error.message
    });
  }
} 