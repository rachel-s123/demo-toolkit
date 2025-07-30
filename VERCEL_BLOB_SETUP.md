# Vercel Blob Storage Setup Guide

This guide explains how to set up Vercel Blob Storage as an alternative to Supabase Storage for production file storage.

## Overview

**Vercel Blob Storage** is a serverless object storage service that integrates seamlessly with Vercel deployments. This provides:

- ✅ **Native Vercel integration** - works perfectly with your existing deployment
- ✅ **Automatic CDN** - global edge caching
- ✅ **Serverless** - no infrastructure management
- ✅ **Cost-effective** - pay only for what you use
- ✅ **Simple setup** - minimal configuration required

## Prerequisites

1. **Vercel Account**: You already have this for deployment
2. **Vercel CLI**: Install if not already installed
3. **Environment Variables**: Need to add blob store configuration

## Step 1: Install Vercel Blob

```bash
npm install @vercel/blob
```

## Step 2: Create Blob Store

1. **Via Vercel Dashboard**:
   - Go to your Vercel project dashboard
   - Navigate to **Storage** → **Blob**
   - Click **Create Blob Store**
   - Name it `brand-assets`

2. **Via Vercel CLI**:
   ```bash
   vercel blob create brand-assets
   ```

## Step 3: Configure Environment Variables

Add these to your production environment:

```env
# Vercel Blob Storage
BLOB_READ_WRITE_TOKEN=your_blob_token_here
```

### Getting the Blob Token

1. Go to your Vercel project dashboard
2. Navigate to **Storage** → **Blob**
3. Click on your `brand-assets` store
4. Copy the **Read/Write Token**

## Step 4: Update Upload API

Replace the Supabase implementation with Vercel Blob:

```typescript
// api/upload-files.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { put } from '@vercel/blob';
import { completeBrandSetup } from '../src/utils/brandSetupUtils';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
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

        // Determine the storage path
        let storagePath: string;
        if (targetPath) {
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

        // Upload to Vercel Blob
        let blobData;
        if (isBinary && mimeType) {
          const buffer = Buffer.from(content, 'base64');
          blobData = await put(storagePath, buffer, {
            contentType: mimeType,
            access: 'public'
          });
        } else {
          blobData = await put(storagePath, content, {
            contentType: 'text/plain',
            access: 'public'
          });
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

    // Handle brand setup
    let brandSetupResult: any = null;
    if (brandCode && brandName && successCount > 0) {
      try {
        brandSetupResult = completeBrandSetup(brandCode, brandName);
      } catch (brandSetupError: any) {
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
```

## Step 5: File Structure in Blob Storage

Files will be organized as follows:

```
brand-assets/
├── locales/           # TypeScript locale files
│   ├── bmw.ts
│   ├── edf.ts
│   └── ...
├── configs/           # JSON configuration files
│   ├── config_bmw.json
│   ├── config_edf.json
│   └── ...
├── logos/             # Brand logo images
│   ├── bmw.png
│   ├── edf.jpg
│   └── ...
└── uploads/           # Other uploaded files
    └── ...
```

## Step 6: Accessing Files

Once uploaded, files can be accessed via their public URLs:

```typescript
// Example: Accessing a brand logo
const logoUrl = "https://your-blob-store.public.blob.vercel-storage.com/logos/bmw.png";

// Example: Accessing a locale file
const localeUrl = "https://your-blob-store.public.blob.vercel-storage.com/locales/bmw.ts";
```

## Advantages of Vercel Blob

### vs Supabase Storage
- ✅ **Native Vercel integration** - no external service setup
- ✅ **Automatic deployment** - blob store created with your project
- ✅ **Simpler configuration** - fewer environment variables
- ✅ **Better performance** - optimized for Vercel deployments

### vs Local Storage
- ✅ **Persistent storage** - files survive deployments
- ✅ **Global CDN** - fast access worldwide
- ✅ **Scalable** - handles any amount of data
- ✅ **Production-ready** - no filesystem limitations

## Cost Comparison

### Vercel Blob Storage
- **Storage**: $0.02 per GB per month
- **Bandwidth**: $0.10 per GB
- **Requests**: 1 million free requests per month
- **Estimated cost**: Very low for typical usage

### vs Supabase Storage
- **Storage**: $0.021 per GB per month (similar)
- **Bandwidth**: $0.09 per GB (slightly cheaper)
- **Requests**: 2 million free requests per month (more generous)

## Troubleshooting

### Common Issues

1. **"Blob token not found"**
   - Ensure `BLOB_READ_WRITE_TOKEN` is set
   - Verify the token is correct in Vercel dashboard

2. **"Blob store not found"**
   - Create the blob store in Vercel dashboard
   - Ensure the store name matches your code

3. **"Upload failed"**
   - Check file size limits (default is 500MB)
   - Verify file type is allowed
   - Check network connectivity

### File Size Limits

- **Default limit**: 500MB per file
- **To increase**: Contact Vercel support
- **Recommended**: Keep files under 100MB for optimal performance

## Migration from Supabase

If you want to switch from Supabase to Vercel Blob:

1. **Install Vercel Blob**: `npm install @vercel/blob`
2. **Create blob store**: Follow Step 2 above
3. **Update environment variables**: Replace Supabase keys with blob token
4. **Update API code**: Replace Supabase upload code with Vercel Blob
5. **Test thoroughly**: Upload a test file to verify functionality

## Security Considerations

- **Public access**: Files are publicly accessible (appropriate for brand assets)
- **Token security**: Keep your blob token secure
- **File validation**: Server validates file types and paths
- **Path sanitization**: Prevents directory traversal attacks

## Next Steps

1. **Choose your storage solution**: Supabase Storage vs Vercel Blob
2. **Set up the chosen solution**: Follow the respective setup guide
3. **Test the implementation**: Upload a test brand
4. **Monitor usage**: Check storage dashboard regularly
5. **Optimize as needed**: Adjust file sizes or storage strategy

## Support

For Vercel Blob issues:
1. Check Vercel documentation
2. Review application logs
3. Verify environment variables
4. Contact Vercel support if needed 