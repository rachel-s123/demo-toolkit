# Debugging Vercel Blob Storage 500 Error

## 🔍 Quick Diagnosis Steps

### Step 1: Test Blob Configuration
Visit this URL to test if Vercel Blob is configured correctly:
```
https://demo-toolkit.vercel.app/api/test-blob
```

**Expected Response:**
```json
{
  "status": "success",
  "message": "Vercel Blob Storage is working correctly",
  "testFile": {
    "path": "test/test-1234567890.txt",
    "url": "https://...",
    "size": 45
  },
  "environment": {
    "hasBlobToken": true,
    "isVercel": true,
    "nodeEnv": "production"
  }
}
```

**If you get an error**, the issue is with your Vercel Blob configuration.

### Step 2: Check Environment Variables
Make sure you have set the `BLOB_READ_WRITE_TOKEN` in your Vercel project:

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add: `BLOB_READ_WRITE_TOKEN` with your blob token value
4. Redeploy your project

### Step 3: Verify Blob Store Exists
1. Go to your Vercel project dashboard
2. Navigate to **Storage** → **Blob**
3. Ensure you have a store named `brand-assets`

## 🚨 Common Issues & Solutions

### Issue 1: "BLOB_READ_WRITE_TOKEN is not configured"
**Solution:**
- Add the environment variable in Vercel dashboard
- Redeploy the project

### Issue 2: "Blob store not found"
**Solution:**
```bash
vercel blob create brand-assets
```

### Issue 3: "Permission denied"
**Solution:**
- Check that your blob token has read/write permissions
- Verify the store name matches exactly: `brand-assets`

### Issue 4: "Network error" or "Timeout"
**Solution:**
- Check your internet connection
- Verify Vercel services are operational
- Try again in a few minutes

## 🔧 Manual Testing

### Test 1: Simple Upload
```bash
curl -X GET https://demo-toolkit.vercel.app/api/test-blob
```

### Test 2: Check Environment
The test endpoint will show you:
- ✅ If blob token is configured
- ✅ If running on Vercel
- ✅ If blob upload works

## 📋 Environment Variables Checklist

Make sure these are set in your Vercel project:

```env
# Required for Vercel Blob Storage
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...

# Your existing variables
KV_REST_API_URL=...
KV_REST_API_TOKEN=...
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
```

## 🐛 Debugging Steps

### 1. Check Vercel Logs
1. Go to your Vercel project dashboard
2. Navigate to **Functions** → **api/upload-files**
3. Check the **Logs** tab for error details

### 2. Test Locally
```bash
# Set environment variable locally
export BLOB_READ_WRITE_TOKEN=your_token_here

# Test the API locally
curl -X POST http://localhost:3001/api/upload-files \
  -H "Content-Type: application/json" \
  -d '{"files":[{"filename":"test.txt","content":"test","targetPath":"test/test.txt"}]}'
```

### 3. Check File Size
- Vercel Blob has a 500MB file size limit
- Your logo files should be under this limit

## 🔄 Redeployment Steps

After fixing environment variables:

1. **Redeploy on Vercel:**
   ```bash
   vercel --prod
   ```

2. **Or trigger from dashboard:**
   - Go to Vercel dashboard
   - Click **Redeploy** on your project

## 📞 Getting Help

If the issue persists:

1. **Check Vercel Status**: https://vercel-status.com
2. **Vercel Blob Docs**: https://vercel.com/docs/storage/vercel-blob
3. **Vercel Support**: https://vercel.com/support

## 🎯 Expected Behavior

After fixing the configuration:

1. ✅ `/api/test-blob` returns success
2. ✅ Brand uploads work without 500 errors
3. ✅ Files appear in your Vercel Blob store
4. ✅ Public URLs are generated for uploaded files

## 🔍 Additional Debugging

If you're still getting errors, check:

1. **Vercel Function Logs** for detailed error messages
2. **Network Tab** in browser dev tools for request/response details
3. **Console Logs** for any JavaScript errors
4. **Environment Variables** are correctly set and deployed 