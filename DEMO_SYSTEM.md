# Demo Content System

The BMW Marketing Platform now includes a comprehensive demo content system that allows you to distinguish between placeholder/demo content and real BMW marketing materials.

## Features

### 🏷️ **Demo Flags**

- **Global Demo Mode**: `"isDemo": true` in config.json
- **Individual Asset Flags**: `"isDemo": true` on specific assets
- **Custom Demo Notice**: Configurable warning message

### 🎨 **Visual Indicators**

- **Demo Notice Banner**: Appears at top of pages when demo mode is active
- **Demo Badges**: Yellow "DEMO" badges on individual demo assets
- **Demo Filter Toggle**: Checkbox to show/hide demo assets

### ⚙️ **Configuration**

```json
{
  "isDemo": true,
  "demoNotice": "These are demo assets using placeholder images. Replace with actual BMW marketing materials.",
  "assets": [
    {
      "id": "1",
      "title": "Demo Asset",
      "isDemo": true,
      "thumbnail": "https://placeholder-image.com/..."
      // ... other properties
    },
    {
      "id": "2",
      "title": "Real BMW Asset",
      "isDemo": false,
      "thumbnail": "/assets/real-bmw-image.jpg"
      // ... other properties
    }
  ]
}
```

## Usage Scenarios

### 🚀 **Initial Setup (Demo Mode)**

```json
{
  "isDemo": true,
  "demoNotice": "Demo content is being used. Replace with actual BMW materials.",
  "assets": [
    { "id": "1", "isDemo": true, "thumbnail": "https://pexels.com/..." }
  ]
}
```

### 🔄 **Mixed Content (Transition Phase)**

```json
{
  "isDemo": true,
  "demoNotice": "Some demo content is still being used.",
  "assets": [
    { "id": "1", "isDemo": true, "thumbnail": "https://pexels.com/..." },
    { "id": "2", "isDemo": false, "thumbnail": "/assets/bmw-real.jpg" }
  ]
}
```

### ✅ **Production Mode**

```json
{
  "isDemo": false,
  "assets": [
    { "id": "1", "isDemo": false, "thumbnail": "/assets/bmw-asset1.jpg" },
    { "id": "2", "isDemo": false, "thumbnail": "/assets/bmw-asset2.jpg" }
  ]
}
```

## Migration Path

### Step 1: Start with Demo Content

- Set `"isDemo": true` globally
- All assets marked as `"isDemo": true`
- Uses placeholder images from Pexels/Unsplash

### Step 2: Gradually Replace with Real Content

- Keep `"isDemo": true` globally
- Replace individual assets with real BMW materials
- Set `"isDemo": false` on real assets
- Use demo filter to see progress

### Step 3: Full Production

- Set `"isDemo": false` globally
- All assets should have `"isDemo": false`
- Remove or update demo notice message

## Benefits

### 👥 **For Content Managers**

- Clear visual distinction between demo and real content
- Easy to track migration progress
- No accidental use of placeholder content in production

### 👨‍💻 **For Developers**

- Clean separation of demo and production data
- Easy to test with different content types
- Flexible configuration system

### 🏢 **For BMW Dealers**

- Professional presentation with clear demo indicators
- Confidence in content authenticity
- Smooth transition from demo to production

## Best Practices

1. **Always mark demo content**: Set `"isDemo": true` on placeholder assets
2. **Use descriptive demo notices**: Help users understand what needs to be replaced
3. **Gradual migration**: Replace demo content incrementally
4. **Test both modes**: Verify functionality with demo filter on/off
5. **Document real asset requirements**: Specify image sizes, formats, etc.

## File Structure for Real Assets

```
public/
├── config.json
└── assets/
    ├── images/
    │   ├── r1300r-front.jpg
    │   ├── r1300rs-side.jpg
    │   └── r1300rt-touring.jpg
    └── videos/
        ├── r1300r-launch.mp4
        └── r1300rs-performance.mp4
```

## Example Real Asset Entry

```json
{
  "id": "real-001",
  "title": "R1300 R Official Product Shot",
  "phase": "PHASE 1",
  "type": "STATIC",
  "model": "R1300 R",
  "thumbnail": "/assets/images/r1300r-front-thumb.jpg",
  "url": "/assets/images/r1300r-front-full.jpg",
  "isDemo": false
}
```
