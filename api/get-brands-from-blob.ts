import type { VercelRequest, VercelResponse } from '@vercel/node';
import { list } from '@vercel/blob';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
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

    const { brandCode } = req.query;

    if (brandCode) {
      // Get specific brand
      try {
        const blobs = await list({ prefix: `brand-assets/configs/config_${brandCode}.json` });
        
        if (blobs.blobs.length === 0) {
          return res.status(404).json({ 
            error: `Brand with code '${brandCode}' not found` 
          });
        }

        const configBlob = blobs.blobs[0];
        const response = await fetch(configBlob.url);
        const brandConfig = await response.json();

        return res.status(200).json({
          success: true,
          brand: brandConfig
        });
      } catch (error) {
        console.error('Error fetching specific brand:', error);
        return res.status(404).json({ 
          error: `Brand with code '${brandCode}' not found` 
        });
      }
    } else {
      // Get all brands by scanning blob storage
      try {
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
              
              // Look for corresponding locale and logo files
              const localeBlobs = await list({ prefix: `brand-assets/locales/${brandCode}.ts` });
              const logoBlobs = await list({ prefix: `brand-assets/logos/${brandCode}.` });
              
              const brandConfig = {
                brandCode,
                brandName: configContent.brand?.name || brandCode,
                files: [
                  {
                    filename: `${brandCode}.ts`,
                    url: localeBlobs.blobs[0]?.url || '',
                    type: 'locale',
                    storagePath: `brand-assets/locales/${brandCode}.ts`
                  },
                  {
                    filename: `config_${brandCode}.json`,
                    url: blob.url,
                    type: 'config',
                    storagePath: `brand-assets/configs/config_${brandCode}.json`
                  }
                ],
                createdAt: blob.uploadedAt,
                updatedAt: blob.uploadedAt
              };

              // Add logo if found
              if (logoBlobs.blobs.length > 0) {
                const logoBlob = logoBlobs.blobs[0];
                brandConfig.files.push({
                  filename: logoBlob.pathname.split('/').pop() || '',
                  url: logoBlob.url,
                  type: 'logo',
                  storagePath: logoBlob.pathname
                });
              }

              brands.push(brandConfig);
              console.log(`✅ Found brand: ${brandConfig.brandName} (${brandCode})`);
            }
          } catch (brandError) {
            console.warn(`⚠️ Error processing brand from ${blob.pathname}:`, brandError);
          }
        }

        console.log(`📦 Successfully loaded ${brands.length} brands from blob storage`);

        return res.status(200).json({
          success: true,
          brands,
          total: brands.length,
          source: 'vercel-blob-storage'
        });

      } catch (error) {
        console.error('❌ Error scanning blob storage:', error);
        return res.status(500).json({
          error: 'Failed to retrieve brands from blob storage',
          details: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

  } catch (error: any) {
    console.error('❌ Error in get-brands-from-blob:', error);
    return res.status(500).json({
      error: 'Failed to retrieve brands',
      details: error.message
    });
  }
} 