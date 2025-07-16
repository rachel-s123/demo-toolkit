# BMW R-Series Assets

This directory contains all visual and video assets for the BMW R-Series marketing platform.

## File Naming Convention

Assets follow the standardized naming convention:
`Phase[X]_[AssetType]_[BikeModel]_[description]_[text-overlay]_[orientation]_[dimensions].[extension]`

### Examples:

- `Phase1_Video_R1300RS_sunset-riding_no-text_landscape_3840x2160.mp4`
- `Phase1_Static_R1300RT_riding-action_no-text_landscape_4096x2840.tif`
- `Phase1_Video_R1300R_full-video_text_portrait_1080x1920.mp4`

## Asset Types:

- **Video**: `.mp4` files for motion content
- **Static**: `.tif`, `.jpg` files for still images

## Bike Models:

- R1300R
- R1300RS
- R1300RT

## Orientations:

- `landscape`: Wide format (e.g., 3840x2160, 4096x2840)
- `portrait`: Tall format (e.g., 1080x1920)
- `square`: Equal dimensions (e.g., 1080x1350, 4096x4096)

## Text Overlay:

- `text`: Version with text overlay
- `no-text`: Clean version without text

## Usage

Assets are referenced in the config.json file and served directly from this directory:

```
/assets/[filename]
```

Place all asset files directly in this directory - no subdirectories needed since filenames contain all metadata.
