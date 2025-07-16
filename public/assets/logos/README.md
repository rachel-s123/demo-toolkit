# Brand Logos Directory

This directory contains all brand logos used by the multi-brand toolkit system.

## Current Logos

- `bmw-motorrad.png` - BMW Motorrad logo (used by main config and German locale)
- `brilliant-noise.jpg` - Brilliant Noise AI logo (used by English locale for demo)
- `edf-energy.svg` - EDF Energy logo (used by EDF demo locale)
- `volkswagen.svg` - Volkswagen logo (example for automotive brands)

## Logo Requirements

### File Naming Convention

- Use lowercase with hyphens: `brand-name.ext`
- Keep consistent with brand codes used in locale files

### Technical Specifications

- **Format**: PNG (preferred), JPG, or SVG
- **Size**: Minimum 256x256px for raster images
- **Background**: Transparent (PNG) or white background
- **File Size**: Under 100KB for optimal performance

### Supported Formats

- `.png` - Best for logos with transparency
- `.jpg` - Good for photographic logos
- `.svg` - Best for vector logos (scalable, small file size)

## Usage in Config Files

Each locale config file should specify its brand logo in the `brand` object:

```json
{
  "brand": {
    "name": "Your Brand Name",
    "logo": "/assets/logos/your-brand.png",
    "logoAlt": "Your Brand Logo"
  }
}
```

## Adding New Brand Logos

1. Save your logo file in this directory with the naming convention
2. Update the corresponding locale config file's `brand.logo` property
3. Test the logo appears correctly in the header when that locale is active

## Logo Display

Logos are displayed in:

- Header navigation (all pages)
- Automatically scaled to fit header height (48px)
- Maintains aspect ratio

The system automatically falls back to a default logo if the specified logo file is not found.
