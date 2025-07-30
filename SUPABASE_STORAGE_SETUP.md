# Supabase Storage Setup Guide

This guide explains how to set up Supabase Storage for production file storage in your demo toolkit.

## Overview

Your application now uses **Supabase Storage** for production file storage instead of just downloading files to the client. This provides:

- ✅ **Persistent file storage** in production
- ✅ **Public URLs** for accessing uploaded files
- ✅ **Automatic CDN** for fast file delivery
- ✅ **Scalable storage** that grows with your needs
- ✅ **Security** with proper access controls

## Prerequisites

1. **Supabase Project**: You already have this set up
2. **Supabase Storage**: Need to enable and configure
3. **Environment Variables**: Need to add service role key

## Step 1: Enable Supabase Storage

1. Go to your Supabase project dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **Create a new bucket**
4. Create a bucket named `brand-assets`
5. Set it to **Public** (since these are brand assets that need to be accessible)

## Step 2: Configure Storage Policies

Create the following RLS (Row Level Security) policies for the `brand-assets` bucket:

### Policy 1: Allow authenticated users to upload files
```sql
CREATE POLICY "Allow authenticated uploads" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'brand-assets' AND 
  auth.role() = 'authenticated'
);
```

### Policy 2: Allow public read access to all files
```sql
CREATE POLICY "Allow public read access" ON storage.objects
FOR SELECT USING (
  bucket_id = 'brand-assets'
);
```

### Policy 3: Allow authenticated users to update their files
```sql
CREATE POLICY "Allow authenticated updates" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'brand-assets' AND 
  auth.role() = 'authenticated'
);
```

### Policy 4: Allow authenticated users to delete their files
```sql
CREATE POLICY "Allow authenticated deletes" ON storage.objects
FOR DELETE USING (
  bucket_id = 'brand-assets' AND 
  auth.role() = 'authenticated'
);
```

## Step 3: Add Environment Variables

Add these environment variables to your production environment:

```env
# Existing Supabase variables
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key

# New: Service role key for server-side operations
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Getting the Service Role Key

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API**
3. Copy the **service_role** key (not the anon key)
4. Add it to your environment variables

## Step 4: File Structure in Storage

Files will be organized in Supabase Storage as follows:

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

## Step 5: Update Your Application

The application has been updated to:

1. **Upload files to Supabase Storage** instead of downloading them
2. **Return public URLs** for accessing the files
3. **Handle both text and binary files** (TypeScript, JSON, images)
4. **Organize files by type** in appropriate folders

## Step 6: Testing the Setup

1. **Local Development**: 
   - Files are still written to the local filesystem
   - Supabase Storage is used for production only

2. **Production Testing**:
   - Upload a new brand through the Brand Setup interface
   - Check that files appear in your Supabase Storage bucket
   - Verify that public URLs are generated and accessible

## Step 7: Accessing Files

Once uploaded, files can be accessed via their public URLs:

```typescript
// Example: Accessing a brand logo
const logoUrl = "https://your-project.supabase.co/storage/v1/object/public/brand-assets/logos/bmw.png";

// Example: Accessing a locale file
const localeUrl = "https://your-project.supabase.co/storage/v1/object/public/brand-assets/locales/bmw.ts";
```

## Troubleshooting

### Common Issues

1. **"Service role key not found"**
   - Ensure `SUPABASE_SERVICE_ROLE_KEY` is set in environment variables
   - Verify the key is correct in Supabase dashboard

2. **"Bucket not found"**
   - Create the `brand-assets` bucket in Supabase Storage
   - Ensure bucket is set to public

3. **"Permission denied"**
   - Check that RLS policies are correctly configured
   - Verify the service role key has proper permissions

4. **"File upload failed"**
   - Check file size limits (default is 50MB)
   - Verify file type is allowed
   - Check network connectivity

### File Size Limits

- **Default limit**: 50MB per file
- **To increase**: Go to Supabase dashboard → Storage → Settings
- **Recommended**: Keep files under 10MB for optimal performance

### Supported File Types

- **Text files**: `.ts`, `.json`, `.md`, `.txt`
- **Images**: `.png`, `.jpg`, `.jpeg`, `.gif`, `.webp`
- **Documents**: `.pdf`, `.doc`, `.docx`

## Migration from Local Storage

If you have existing files in local storage that you want to migrate to Supabase:

1. **Export files** from your local `public/assets/` and `src/locales/`
2. **Upload manually** through the Brand Setup interface
3. **Or create a migration script** to bulk upload existing files

## Security Considerations

- **Public bucket**: Files are publicly accessible (appropriate for brand assets)
- **Authentication**: Upload requires authenticated user
- **File validation**: Server validates file types and paths
- **Path sanitization**: Prevents directory traversal attacks

## Cost Considerations

- **Storage**: $0.021 per GB per month
- **Bandwidth**: $0.09 per GB
- **Requests**: 2 million free requests per month
- **Estimated cost**: Very low for typical brand asset usage

## Next Steps

1. **Test the setup** with a small brand upload
2. **Monitor usage** in Supabase dashboard
3. **Set up alerts** for storage limits if needed
4. **Consider CDN** for global performance if needed

## Support

If you encounter issues:

1. Check the Supabase documentation
2. Review the application logs
3. Verify environment variables
4. Test with a simple file upload first 