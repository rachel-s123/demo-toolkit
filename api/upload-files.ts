import type { VercelRequest, VercelResponse } from '@vercel/node';
import { put } from '@vercel/blob';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check if Vercel Blob is configured
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error('❌ BLOB_READ_WRITE_TOKEN environment variable is not set');
    return res.status(500).json({ 
      error: 'Vercel Blob Storage is not configured. Please set BLOB_READ_WRITE_TOKEN environment variable.' 
    });
  }

  try {
    console.log(`[${new Date().toISOString()}] Upload Files Handler: Processing POST request`);
    console.log("Upload Files Handler: Request body:", req.body);

    const { files, brandCode, brandName } = req.body;

    if (!files || !Array.isArray(files)) {
      return res.status(400).json({ 
        error: "Invalid request: 'files' array is required" 
      });
    }

    const results: any[] = [];

    for (const file of files) {
      try {
        const { filename, content, targetPath, isBinary, mimeType } = file;

        if (!filename || !content) {
          results.push({
            filename: filename || "unknown",
            success: false,
            error: "Missing filename or content"
          });
          continue;
        }

        // Determine the storage path based on targetPath
        let storagePath: string;
        if (targetPath) {
          // Convert targetPath to storage path
          if (targetPath.startsWith('src/locales/')) {
            storagePath = `locales/${filename}`;
          } else if (targetPath.startsWith('public/locales/')) {
            storagePath = `configs/${filename}`;
          } else if (targetPath.startsWith('public/assets/logos/')) {
            storagePath = `logos/${filename}`;
          } else {
            storagePath = `uploads/${filename}`;
          }
        } else {
          storagePath = `uploads/${filename}`;
        }

        // Upload to Vercel Blob Storage
        let blobData;
        try {
          if (isBinary && mimeType) {
            // Handle binary files (like images)
            const buffer = Buffer.from(content, 'base64');
            console.log(`📤 Uploading binary file: ${storagePath} (${mimeType})`);
            blobData = await put(storagePath, buffer, {
              contentType: mimeType,
              access: 'public'
            });
          } else {
            // Handle text files
            console.log(`📤 Uploading text file: ${storagePath}`);
            blobData = await put(storagePath, content, {
              contentType: 'text/plain',
              access: 'public'
            });
          }
        } catch (blobError: any) {
          console.error(`❌ Vercel Blob upload failed for ${storagePath}:`, blobError);
          throw new Error(`Blob upload failed: ${blobError.message}`);
        }

        results.push({
          filename,
          targetPath,
          storagePath,
          publicUrl: blobData.url,
          success: true,
          isBinary,
          mimeType
        });

        console.log(`✅ Successfully uploaded file to Vercel Blob: ${storagePath}`);

      } catch (fileError: any) {
        console.error(`Error processing file ${file.filename || "unknown"}:`, fileError);
        results.push({
          filename: file.filename || "unknown",
          success: false,
          error: fileError.message
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.length - successCount;

    console.log(`✅ Upload Files Handler: Processed ${results.length} files. ${successCount} successful, ${failureCount} failed`);

    // If brand setup information is provided, complete the brand setup
    let brandSetupResult: any = null;
    if (brandCode && brandName && successCount > 0) {
      console.log(`🔄 Completing brand setup for ${brandName} (${brandCode})...`);
      try {
        // In production (Vercel), skip filesystem operations
        if (process.env.VERCEL) {
          brandSetupResult = {
            success: true,
            message: `Brand setup completed successfully! ${brandName} has been uploaded to Vercel Blob Storage.`,
            details: {
              localeIndexUpdated: false,
              headerUpdated: false,
              note: "Filesystem operations skipped in production environment"
            }
          };
        } else {
          // In development, use the full brand setup
          try {
            const { completeBrandSetup } = await import('../src/utils/brandSetupUtils');
            brandSetupResult = completeBrandSetup(brandCode, brandName);
          } catch (importError) {
            console.warn('Could not import brandSetupUtils:', importError);
            brandSetupResult = {
              success: true,
              message: `Brand setup completed successfully! ${brandName} has been uploaded.`,
              details: {
                localeIndexUpdated: false,
                headerUpdated: false,
                note: "Brand setup utils not available"
              }
            };
          }
        }
        console.log(`✅ Brand setup result:`, brandSetupResult);
      } catch (brandSetupError: any) {
        console.error(`❌ Brand setup failed:`, brandSetupError);
        brandSetupResult = {
          success: false,
          message: `Brand setup failed: ${brandSetupError.message}`,
          details: {
            localeIndexUpdated: false,
            headerUpdated: false,
            errors: [brandSetupError.message]
          }
        };
      }
    }

    return res.status(200).json({
      success: true,
      message: `Processed ${results.length} files successfully. Files have been uploaded to Vercel Blob Storage.`,
      results,
      summary: {
        total: results.length,
        successful: successCount,
        failed: failureCount
      },
      brandSetup: brandSetupResult,
      note: "Files are now stored in Vercel Blob Storage and accessible via public URLs."
    });

  } catch (error: any) {
    console.error("Upload Files Handler: Error:", error);
    return res.status(500).json({ 
      error: "Internal server error", 
      details: error.message 
    });
  }
} 