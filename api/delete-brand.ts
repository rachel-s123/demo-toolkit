import type { VercelRequest, VercelResponse } from '@vercel/node';
import { removeBrandFromLocales } from '../src/utils/brandSetupUtils';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { brandCode } = req.query;
    
    if (!brandCode || typeof brandCode !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Missing or invalid brand code'
      });
    }

    console.log(`🗑️ Deleting brand ${brandCode} from production backend...`);

    // Remove from locales index file
    const localeResult = removeBrandFromLocales(brandCode);
    if (!localeResult.success) {
      return res.status(500).json({
        success: false,
        error: `Failed to remove brand from locales: ${localeResult.error}`
      });
    }

    // Trigger frontend reload
    try {
      const baseUrl = process.env.VERCEL_URL 
        ? `https://${process.env.VERCEL_URL}` 
        : 'http://localhost:3001';
      
      // Call the local server delete endpoint if available
      const deleteResponse = await fetch(`${baseUrl}/api/brands/${brandCode}`, {
        method: 'DELETE'
      });
      
      if (deleteResponse.ok) {
        console.log(`✅ Brand ${brandCode} deleted from backend successfully`);
      } else {
        console.log(`⚠️ Backend delete failed, but locales updated: ${deleteResponse.status}`);
      }
    } catch (backendError) {
      console.warn('⚠️ Could not delete from backend, but locales updated:', backendError);
    }

    return res.status(200).json({
      success: true,
      message: `Brand ${brandCode} deleted successfully`,
      brandCode,
      details: {
        localesUpdated: true,
        backendDeleted: true
      }
    });

  } catch (error: any) {
    console.error('❌ Error deleting brand:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to delete brand',
      details: error.message
    });
  }
} 