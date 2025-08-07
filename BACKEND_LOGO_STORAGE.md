# Backend Logo Storage - Complete Guide

## 🎯 Overview

The logo upload functionality now saves logo information in **both** Vercel Blob Storage AND the backend database (Redis/KV). This provides:

1. ✅ **Logo files** stored in Vercel Blob Storage (for serving)
2. ✅ **Logo metadata** stored in backend database (for tracking)
3. ✅ **Complete brand information** in one place
4. ✅ **Easy logo management** and retrieval

## 🔄 How It Works

### **1. Upload Process**
```
User Uploads Logo → Vercel Blob Storage → Backend Sync → Database Storage
```

### **2. Storage Locations**
- **Vercel Blob Storage**: Actual logo files (PNG, JPG, etc.)
- **Backend Database**: Logo metadata, URLs, and brand information

### **3. Data Flow**
1. Logo file uploaded to Vercel Blob Storage
2. Config file updated with logo URL
3. Brand information synced to backend database
4. Logo metadata stored with brand configuration

## 📊 Backend Data Structure

### **Brand Configuration in Redis/KV**
```json
{
  "brandCode": "mybrand",
  "brandName": "My Brand",
  "files": [
    {
      "filename": "mybrand.png",
      "url": "https://.../brand-assets/logos/mybrand.png",
      "type": "logo",
      "storagePath": "brand-assets/logos/mybrand.png"
    },
    {
      "filename": "config_mybrand.json",
      "url": "https://.../brand-assets/configs/config_mybrand.json",
      "type": "config",
      "storagePath": "brand-assets/configs/config_mybrand.json"
    },
    {
      "filename": "mybrand.ts",
      "url": "https://.../brand-assets/locales/mybrand.ts",
      "type": "locale",
      "storagePath": "brand-assets/locales/mybrand.ts"
    }
  ],
  "createdAt": "2025-01-30T16:58:51.16Z",
  "updatedAt": "2025-01-30T16:58:51.16Z"
}
```

### **Main Configuration in Redis/KV**
```json
{
  "brands": [
    {
      "brandCode": "mybrand",
      "brandName": "My Brand",
      "files": [...],
      "createdAt": "2025-01-30T16:58:51.16Z",
      "updatedAt": "2025-01-30T16:58:51.16Z"
    }
  ],
  "metadata": {
    "lastModified": "2025-01-30T16:58:51.16Z",
    "modifiedBy": "brand-sync-api",
    "version": 1
  }
}
```

## 🔧 API Endpoints

### **1. Upload Files** (`/api/upload-files`)
- Uploads logo files to Vercel Blob Storage
- Updates config files with logo URLs
- **Automatically syncs to backend database**

### **2. Sync Brand to Backend** (`/api/sync-brand-to-backend`)
- Stores brand configuration in Redis/KV
- Includes logo metadata and URLs
- Updates main configuration

### **3. Get Brands** (`/api/get-brands`)
- Retrieves all brands from backend
- Includes logo information and URLs
- Supports filtering by brand code

## 🛠 Usage Examples

### **View All Logos in Backend**
```bash
# View all brands and their logos
npm run view-logos

# View specific brand
npm run view-logos mybrand
```

### **API Calls**
```bash
# Get all brands with logo info
curl http://localhost:3000/api/get-brands

# Get specific brand
curl http://localhost:3000/api/get-brands?brandCode=mybrand
```

### **Frontend Integration**
```typescript
// Get brands with logo information
const response = await fetch('/api/get-brands');
const data = await response.json();

// Access logo information
data.brands.forEach(brand => {
  const logoFile = brand.files.find(f => f.type === 'logo');
  if (logoFile) {
    console.log(`Logo URL: ${logoFile.url}`);
    console.log(`Logo filename: ${logoFile.filename}`);
  }
});
```

## 📁 File Organization

### **Vercel Blob Storage**
```
brand-assets/
├── logos/           # Logo files
│   ├── brand1.png
│   ├── brand2.jpg
│   └── ...
├── configs/         # Config files (with logo URLs)
│   ├── config_brand1.json
│   ├── config_brand2.json
│   └── ...
└── locales/         # Locale files
    ├── brand1.ts
    ├── brand2.ts
    └── ...
```

### **Backend Database (Redis/KV)**
```
Keys:
├── brand:brand1     # Brand 1 configuration
├── brand:brand2     # Brand 2 configuration
├── bmw:config       # Main configuration
└── frontend:brand:* # Frontend-specific configs
```

## 🎨 Logo Management Features

### **1. Logo Tracking**
- ✅ Logo filename and type
- ✅ Logo URL in Vercel Blob Storage
- ✅ Logo storage path
- ✅ Upload timestamp
- ✅ Brand association

### **2. Logo Retrieval**
- ✅ Get all logos for a brand
- ✅ Get specific logo by filename
- ✅ Get logo URLs for frontend use
- ✅ Get logo metadata

### **3. Logo Updates**
- ✅ Replace existing logos
- ✅ Update logo URLs in config files
- ✅ Sync changes to backend
- ✅ Maintain version history

## 🔍 Monitoring and Debugging

### **View Logo Information**
```bash
# View all logos in backend
npm run view-logos

# View specific brand's logo
npm run view-logos mybrand
```

### **Check Backend Status**
```bash
# Check if Redis is configured
curl http://localhost:3000/api/get-brands

# Response will show if backend is available
```

### **Debug Upload Process**
1. Check browser console for upload logs
2. Check Vercel function logs for API errors
3. Use the view-logos script to verify storage

## 🚀 Production Deployment

### **Environment Variables Required**
```env
# Vercel Blob Storage
BLOB_READ_WRITE_TOKEN=your_blob_token

# Backend Database (Redis)
REDIS_URL=your_redis_url

# Vercel Project
VERCEL_URL=your_project_url
```

### **Deployment Steps**
1. Set environment variables in Vercel dashboard
2. Deploy the application
3. Test logo upload functionality
4. Verify backend storage with view-logos script

## ✅ Benefits

### **1. Complete Logo Management**
- Logos stored in both blob storage and database
- Full metadata tracking
- Easy logo retrieval and management

### **2. Brand Consistency**
- All brand files tracked together
- Logo URLs automatically updated in configs
- Consistent brand information across the system

### **3. Scalability**
- Vercel Blob Storage for file serving
- Redis/KV for fast metadata access
- Efficient logo management at scale

### **4. Developer Experience**
- Easy logo viewing and management
- Clear upload confirmation
- Comprehensive error handling

## 🎉 Result

Your logo upload system now provides:
- ✅ **Complete logo storage** in both blob storage and backend
- ✅ **Full logo metadata** tracking
- ✅ **Easy logo management** and retrieval
- ✅ **Brand consistency** across the system
- ✅ **Production-ready** deployment

The logo upload functionality is now fully integrated with your backend storage system! 