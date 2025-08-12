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
    console.log('🔍 Upload request details:', { brandCode, brandName, filesCount: files?.length });

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
            storagePath = `brand-assets/locales/${filename}`;
          } else if (targetPath.startsWith('public/locales/')) {
            storagePath = `brand-assets/configs/${filename}`;
          } else if (targetPath.startsWith('public/assets/logos/')) {
            storagePath = `brand-assets/logos/${filename}`;
          } else {
            storagePath = `brand-assets/uploads/${filename}`;
          }
        } else {
          storagePath = `brand-assets/uploads/${filename}`;
        }
        
        console.log(`🗂️ Path mapping: targetPath="${targetPath}" → storagePath="${storagePath}"`);

        // Upload to Vercel Blob Storage
        let blobData;
        try {
          if (isBinary && mimeType) {
            // Handle binary files (like images)
            const buffer = Buffer.from(content, 'base64');
            console.log(`📤 Uploading binary file: ${storagePath} (${mimeType})`);
            blobData = await put(storagePath, buffer, {
              contentType: mimeType,
              access: 'public',
              allowOverwrite: true
            });
          } else {
            // Handle text files
            console.log(`📤 Uploading text file: ${storagePath}`);
            blobData = await put(storagePath, content, {
              contentType: 'text/plain',
              access: 'public',
              allowOverwrite: true
            });
          }
        } catch (blobError: any) {
          console.error(`❌ Vercel Blob upload failed for ${storagePath}:`, blobError);
          throw new Error(`Blob upload failed: ${blobError.message}`);
        }

        // Log the full blobData response to understand what Vercel is returning
        console.log(`🔍 Full blobData response:`, JSON.stringify(blobData, null, 2));
        
        // Check if we have the expected properties
        if (!blobData.url) {
          console.error(`❌ No URL in blobData response for ${storagePath}`);
          console.error(`❌ blobData keys:`, Object.keys(blobData));
        }
        
        const result = {
          filename,
          targetPath,
          storagePath,
          publicUrl: blobData.url,
          success: true,
          isBinary,
          mimeType
        };
        
        results.push(result);

        console.log(`✅ Successfully uploaded file to Vercel Blob: ${storagePath}`);
        console.log(`🔗 Public URL: ${blobData.url}`);
        console.log(`📁 Storage path: ${storagePath}`);
        
        // Test the URL format and accessibility immediately
        if (blobData.url) {
          console.log(`🧪 Testing immediate URL accessibility: ${blobData.url}`);
          try {
            const immediateTest = await fetch(blobData.url);
            console.log(`🧪 Immediate test result: ${immediateTest.status} ${immediateTest.statusText}`);
          } catch (immediateError) {
            console.log(`🧪 Immediate test failed:`, immediateError);
          }
          
          // Also test with the standard Vercel Blob Storage URL format
          const standardUrl = `https://chfu3qqwfe2lgq2b.public.blob.vercel-storage.com/${storagePath}`;
          if (standardUrl !== blobData.url) {
            console.log(`🔍 Testing alternative URL format: ${standardUrl}`);
            try {
              const alternativeTest = await fetch(standardUrl);
              console.log(`🔍 Alternative URL test result: ${alternativeTest.status} ${alternativeTest.statusText}`);
            } catch (alternativeError) {
              console.log(`🔍 Alternative URL test failed:`, alternativeError);
            }
          }
        }
        
        // Test if the file is immediately accessible (with delay and retry)
        if (isBinary && mimeType?.startsWith('image/')) {
          // Add delay for Vercel Blob Storage processing
          setTimeout(async () => {
            try {
              console.log(`🖼️ Testing logo accessibility after delay: ${blobData.url}`);
              const testResponse = await fetch(blobData.url);
              console.log(`🖼️ Logo accessibility test: ${testResponse.status} ${testResponse.statusText}`);
            } catch (testError) {
              console.warn(`⚠️ Logo accessibility test failed:`, testError);
            }
          }, 3000); // 3 second delay
        }

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
    console.log('📊 Results summary:', results.map(r => ({
      filename: r.filename,
      success: r.success,
      storagePath: r.storagePath,
      publicUrl: r.publicUrl,
      error: r.error
    })));

    // Update config file with correct logo URL if logo was uploaded
    let updatedConfigResult: any = null;
    if (successCount > 0) {
      const logoFile = results.find(r => r.success && r.targetPath?.includes('public/assets/logos/'));
      const configFile = results.find(r => r.success && r.targetPath?.includes('public/locales/config_'));
      
      if (logoFile && configFile && logoFile.publicUrl) {
        try {
          console.log('🔄 Updating config file with logo URL...');
          console.log('📁 Config file URL:', configFile.publicUrl);
          console.log('📁 Config file storage path:', configFile.storagePath);
          
          // Add a small delay to ensure Vercel Blob Storage has processed the upload
          console.log('⏳ Waiting for Vercel Blob Storage to process upload...');
          await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
          
          // Fetch the uploaded config file with retry logic
          let configResponse;
          let retryCount = 0;
          const maxRetries = 3;
          
          while (retryCount < maxRetries) {
            try {
              console.log(`📡 Attempting to fetch config file (attempt ${retryCount + 1}/${maxRetries})...`);
              configResponse = await fetch(configFile.publicUrl);
              console.log('📡 Config response status:', configResponse.status);
              
              if (configResponse.ok) {
                break; // Success, exit retry loop
              } else {
                console.log(`⚠️ Config fetch failed with status ${configResponse.status}, retrying...`);
                retryCount++;
                if (retryCount < maxRetries) {
                  await new Promise(resolve => setTimeout(resolve, 1000 * retryCount)); // Exponential backoff
                }
              }
            } catch (fetchError) {
              console.log(`⚠️ Config fetch error (attempt ${retryCount + 1}/${maxRetries}):`, fetchError);
              retryCount++;
              if (retryCount < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
              }
            }
          }
          
          if (!configResponse || !configResponse.ok) {
            throw new Error(`Failed to fetch config file after ${maxRetries} attempts: ${configResponse?.status} ${configResponse?.statusText}`);
          }
          
          if (!configResponse.ok) {
            throw new Error(`Failed to fetch config file: ${configResponse.status} ${configResponse.statusText}`);
          }
          
          const configText = await configResponse.text();
          console.log('📄 Config file content (first 200 chars):', configText.substring(0, 200));
          
          // Defer parsing and updating until after attempting to read config from the original request payload.
          // A unified parsing/update flow exists below that prefers the request payload and falls back to blob.
          
          // Update the logo URL
          // Prefer using the original config content from the request to avoid eventual-consistency 404s
          let configContent: any | null = null;

          try {
            // Find the original config file in the incoming payload
            const originalConfigPayload = (req.body?.files || []).find((f: any) => f.targetPath?.startsWith('public/locales/') && f.filename?.startsWith('config_'));
            if (originalConfigPayload && typeof originalConfigPayload.content === 'string') {
              try {
                // Attempt to parse as JSON first
                configContent = JSON.parse(originalConfigPayload.content);
                console.log('📄 Parsed config JSON directly from request payload');
              } catch (parseError) {
                // If parsing fails, try to clean common issues (comments, trailing commas)
                console.warn('⚠️ Failed to parse config JSON from payload, attempting cleanup...');
                const cleaned = originalConfigPayload.content
                  .replace(/\/\/.*$/gm, '')
                  .replace(/\/\*[\s\S]*?\*\//g, '')
                  .replace(/,\s*}/g, '}')
                  .replace(/,\s*]/g, ']');
                try {
                  configContent = JSON.parse(cleaned);
                  console.log('✅ Parsed cleaned config JSON from payload');
                } catch (cleanupError) {
                  console.warn('⚠️ Cleanup parse failed, will fall back to fetching from blob');
                }
              }
            }
          } catch (payloadError) {
            console.warn('⚠️ Could not read config from request payload:', payloadError);
          }

          if (!configContent) {
            // Fallback: fetch the config that we just uploaded to blob (may 404 briefly)
            console.log('↩️ Falling back to fetching config from blob URL');
            let retryCount = 0;
            const maxRetries = 3;
            while (retryCount < maxRetries) {
              try {
                configResponse = await fetch(configFile.publicUrl);
                console.log('📡 Config response status:', configResponse.status);
                if (configResponse.ok) {
                  break;
                }
                retryCount++;
                if (retryCount < maxRetries) {
                  await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
                }
              } catch (fetchError) {
                console.log(`⚠️ Config fetch error (attempt ${retryCount + 1}/${maxRetries}):`, fetchError);
                retryCount++;
                if (retryCount < maxRetries) {
                  await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
                }
              }
            }
            if (!configResponse || !configResponse.ok) {
              throw new Error(`Failed to fetch config file after ${maxRetries} attempts: ${configResponse?.status} ${configResponse?.statusText}`);
            }
            const configTextFallback = await configResponse.text();
            console.log('📄 Config file content (first 200 chars):', configTextFallback.substring(0, 200));
            try {
              configContent = JSON.parse(configTextFallback);
            } catch (parseError) {
              console.error('❌ Failed to parse config JSON:', parseError);
              console.error('📄 Raw config content:', configTextFallback);
              const errorMessage = parseError instanceof Error ? parseError.message : 'Unknown parse error';
              throw new Error(`Invalid JSON in config file: ${errorMessage}`);
            }
          }

          // Ensure brand object exists
          if (!configContent.brand) {
            configContent.brand = {};
          }

          // Update the logo URL
          configContent.brand.logo = logoFile.publicUrl;
          console.log('🖼️ Updated logo URL in config:', logoFile.publicUrl);

          // Re-upload the updated config file
          const updatedConfigBlob = await put(configFile.storagePath, JSON.stringify(configContent, null, 2), {
            contentType: 'application/json',
            access: 'public',
            allowOverwrite: true
          });

          updatedConfigResult = {
            success: true,
            originalConfigUrl: configFile.publicUrl,
            updatedConfigUrl: updatedConfigBlob.url,
            logoUrl: logoFile.publicUrl,
            message: 'Config file updated with correct logo URL'
          };

          console.log('✅ Config file updated with logo URL:', logoFile.publicUrl);
        } catch (configUpdateError) {
          console.error('❌ Failed to update config with logo URL:', configUpdateError);
          updatedConfigResult = {
            success: false,
            error: configUpdateError instanceof Error ? configUpdateError.message : 'Unknown error'
          };
        }
      }
    }

    // Sync brand information to backend (including logo)
    let backendSyncResult: any = null;
    if (brandCode && brandName && successCount > 0) {
      try {
        console.log('🔄 Syncing brand information to backend...');
        
        // Prepare files for backend sync
        const syncFiles = results
          .filter(r => r.success)
          .map(r => ({
            filename: r.filename,
            publicUrl: r.publicUrl,
            storagePath: r.storagePath,
            type: r.targetPath?.includes('public/assets/logos/') ? 'logo' :
                  r.targetPath?.includes('public/locales/') ? 'config' :
                  r.targetPath?.includes('src/locales/') ? 'locale' : 'other'
          }))
          .filter(f => f.type !== 'other'); // Only sync relevant files
        
        // In production, skip backend sync (not needed)
        // In local development, attempt backend sync to local server
        if (process.env.VERCEL) {
          console.log('⚠️ Production environment detected, skipping backend sync');
          backendSyncResult = {
            success: true,
            message: `Brand ${brandName} uploaded to Vercel Blob Storage successfully. Backend sync skipped in production.`,
            note: "In production, brands are loaded directly from the updated locales index file."
          };
        } else {
          console.log('🔄 Redis configured, attempting backend sync...');
          // Call the sync API with timeout
          // In local development, call the local server
          // In production, call the Vercel API
          const baseUrl = process.env.VERCEL_URL 
            ? `https://${process.env.VERCEL_URL}` 
            : 'http://localhost:3001';
          
          const syncUrl = `${baseUrl}/api/sync-brand-to-backend`;
          console.log('🔍 Calling sync API at:', syncUrl);
          
                    // Add timeout to the fetch request
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
          
          try {
            const syncResponse = await fetch(syncUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                brandCode,
                brandName,
                files: syncFiles
              }),
              signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            let syncResult;
            try {
              const responseText = await syncResponse.text();
              console.log('🔍 Sync response status:', syncResponse.status);
              console.log('🔍 Sync response text:', responseText.substring(0, 500));
              
              if (responseText.trim().startsWith('<')) {
                // Response is HTML (likely an error page)
                throw new Error(`API returned HTML instead of JSON. Status: ${syncResponse.status}. Response: ${responseText.substring(0, 200)}`);
              }
              
              syncResult = JSON.parse(responseText);
            } catch (parseError) {
              console.error('❌ Failed to parse sync response:', parseError);
              backendSyncResult = {
                success: false,
                message: 'Backend sync failed - invalid response format',
                error: parseError instanceof Error ? parseError.message : 'Unknown parsing error',
                status: syncResponse.status
              };
              return;
            }
            
            if (syncResponse.ok && syncResult.success) {
              backendSyncResult = {
                success: true,
                message: syncResult.message,
                brandConfig: syncResult.brandConfig,
                frontendConfig: syncResult.frontendConfig
              };
              console.log('✅ Backend sync successful:', syncResult);
            } else {
              backendSyncResult = {
                success: false,
                message: syncResult.error || 'Backend sync failed',
                details: syncResult,
                status: syncResponse.status
              };
              console.error('❌ Backend sync failed:', syncResult);
            }
          } catch (fetchError) {
            clearTimeout(timeoutId);
            console.error('❌ Sync API fetch failed:', fetchError);
            backendSyncResult = {
              success: false,
              message: 'Backend sync failed - network error',
              error: fetchError instanceof Error ? fetchError.message : 'Unknown fetch error'
            };
          }
        }
      } catch (syncError) {
        console.error('❌ Error during backend sync:', syncError);
        backendSyncResult = {
          success: false,
          message: 'Backend sync error',
          error: syncError instanceof Error ? syncError.message : 'Unknown error'
        };
      }
    }

    // Note: Auto-sync to KV backend is disabled since we're using blob storage as the backend
    // Files are automatically available through the blob scanner
    if (brandCode && brandName && successCount > 0) {
      console.log(`✅ Brand ${brandName} uploaded to Vercel Blob Storage - automatically available in frontend`);
      
      // Trigger frontend refresh by calling the blob-based endpoint (with timeout)
      try {
        console.log('🔄 Triggering frontend refresh...');
        const baseUrl = process.env.VERCEL_URL 
          ? `https://${process.env.VERCEL_URL}` 
          : 'https://demo-toolkit.vercel.app';
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
        
        await fetch(`${baseUrl}/api/get-brands-from-blob`, {
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        console.log('✅ Frontend refresh triggered');
      } catch (refreshError) {
        console.warn('⚠️ Frontend refresh failed:', refreshError);
        // Don't fail the entire upload if refresh fails
      }
    }

    // If brand setup information is provided, complete the brand setup
    let brandSetupResult: any = null;
    console.log(`🔍 Brand setup check: brandCode=${brandCode}, brandName=${brandName}, successCount=${successCount}`);
    
    if (brandCode && brandName && successCount > 0) {
      console.log(`🔄 Completing brand setup for ${brandName} (${brandCode})...`);
      try {
        // Call the new API endpoint to update the locales index
        const baseUrl = process.env.VERCEL_URL 
          ? `https://${process.env.VERCEL_URL}` 
          : 'https://demo-toolkit.vercel.app';
        
        console.log('🌐 Calling locales index update API at:', `${baseUrl}/api/update-locales-index`);
        console.log('📤 Request payload:', { brandCode, brandName, action: 'add' });
        
        const updateResponse = await fetch(`${baseUrl}/api/update-locales-index`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            brandCode,
            brandName,
            action: 'add'
          })
        });

        console.log('📡 Update response status:', updateResponse.status);
        
        if (updateResponse.ok) {
          const updateResult = await updateResponse.json();
          brandSetupResult = {
            success: true,
            message: `Brand setup completed successfully! ${brandName} has been added to the frontend.`,
            details: {
              localeIndexUpdated: true,
              headerUpdated: true,
              updateResult
            }
          };
          console.log(`✅ Brand setup completed:`, updateResult);
        } else {
          const errorText = await updateResponse.text();
          console.error(`❌ Failed to update locales index:`, errorText);
          console.error(`📡 Response headers:`, Object.fromEntries(updateResponse.headers.entries()));
          brandSetupResult = {
            success: false,
            message: `Brand setup partially completed. ${brandName} has been uploaded but not added to the frontend.`,
            details: {
              localeIndexUpdated: false,
              headerUpdated: false,
              error: `Failed to update locales index: ${errorText}`
            }
          };
        }
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
      message: `Processed ${results.length} files successfully. Files have been uploaded to Vercel Blob Storage and synced to backend.`,
      results,
      summary: {
        total: results.length,
        successful: successCount,
        failed: failureCount
      },
      configUpdate: updatedConfigResult,
      brandSetup: brandSetupResult,
      backendSync: backendSyncResult,
      note: "Files are now stored in Vercel Blob Storage and automatically synced to backend configuration."
    });

  } catch (error: any) {
    console.error("Upload Files Handler: Error:", error);
    return res.status(500).json({ 
      error: "Internal server error", 
      details: error.message 
    });
  }
} 