/**
 * Path Utilities for BMW Dealer Toolkit
 * Handles dynamic path construction based on config variables
 */

class PathUtils {
  constructor(config) {
    this.config = config;
    this.pathConfig = config.pathConfig;
  }

  /**
   * Get the current environment configuration
   */
  getCurrentEnvironment() {
    const activeEnv = this.pathConfig.activeEnvironment;
    return this.pathConfig.environments[activeEnv];
  }

  /**
   * Get the current video source configuration
   */
  getCurrentVideoSource() {
    const activeSource = this.pathConfig.activeVideoSource;
    return this.pathConfig.videoSources[activeSource];
  }

  /**
   * Build a full URL for an asset
   */
  buildAssetUrl(relativePath, assetType = "general") {
    const env = this.getCurrentEnvironment();

    switch (assetType) {
      case "image":
        return `${env.baseUrl}${env.imagesPath}${relativePath}`;
      case "video":
        const videoSource = this.getCurrentVideoSource();
        return `${env.baseUrl}${videoSource.path}${relativePath}`;
      case "general":
      default:
        return `${env.baseUrl}${env.assetsPath}${relativePath}`;
    }
  }

  /**
   * Process all assets and return them with dynamic URLs
   */
  processAssets(assets) {
    return assets.map((asset) => {
      const processedAsset = { ...asset };

      // Determine asset type
      const isVideo =
        asset.type === "VIDEO" ||
        asset.url?.match(/\.(mp4|mov|avi|mkv|webm)$/i);
      const isImage =
        asset.type === "STATIC" ||
        asset.url?.match(/\.(jpg|jpeg|png|gif|bmp|tif|tiff|webp|svg)$/i);

      // Build dynamic URLs
      if (asset.url) {
        const filename = asset.url.split("/").pop();
        if (isVideo) {
          processedAsset.dynamicUrl = this.buildAssetUrl(
            `/${filename}`,
            "video"
          );
        } else if (isImage) {
          processedAsset.dynamicUrl = this.buildAssetUrl(
            `/${filename}`,
            "image"
          );
        }
      }

      // Build dynamic thumbnail URLs
      if (asset.thumbnail) {
        const thumbnailFilename = asset.thumbnail.split("/").pop();
        processedAsset.dynamicThumbnail = this.buildAssetUrl(
          `/${thumbnailFilename}`,
          "image"
        );
      }

      return processedAsset;
    });
  }

  /**
   * Switch environment and rebuild URLs
   */
  switchEnvironment(newEnvironment) {
    if (!this.pathConfig.environments[newEnvironment]) {
      throw new Error(`Environment "${newEnvironment}" not found`);
    }

    this.pathConfig.activeEnvironment = newEnvironment;
    console.log(`Switched to environment: ${newEnvironment}`);
    return this.getCurrentEnvironment();
  }

  /**
   * Switch video source and rebuild URLs
   */
  switchVideoSource(newVideoSource) {
    if (!this.pathConfig.videoSources[newVideoSource]) {
      throw new Error(`Video source "${newVideoSource}" not found`);
    }

    this.pathConfig.activeVideoSource = newVideoSource;
    console.log(`Switched to video source: ${newVideoSource}`);
    return this.getCurrentVideoSource();
  }

  /**
   * Get available environments
   */
  getAvailableEnvironments() {
    return Object.keys(this.pathConfig.environments);
  }

  /**
   * Get available video sources
   */
  getAvailableVideoSources() {
    return Object.keys(this.pathConfig.videoSources);
  }

  /**
   * Generate example URLs for testing
   */
  generateExamples() {
    const env = this.getCurrentEnvironment();
    const videoSource = this.getCurrentVideoSource();

    return {
      environment: this.pathConfig.activeEnvironment,
      videoSource: this.pathConfig.activeVideoSource,
      examples: {
        imageUrl: this.buildAssetUrl(
          "/Phase1_Static_R1300R_riding-curve.jpg",
          "image"
        ),
        videoUrl: this.buildAssetUrl(
          "/Phase1_Video_R1300R_full-video.mp4",
          "video"
        ),
        generalAsset: this.buildAssetUrl("/guides/launch-guide.pdf", "general"),
      },
      currentPaths: {
        baseUrl: env.baseUrl,
        imagesPath: env.imagesPath,
        videosPath: videoSource.path,
        videoQuality: videoSource.quality,
      },
    };
  }
}

// Usage examples:
if (typeof module !== "undefined" && module.exports) {
  module.exports = PathUtils;
}

// Browser usage example:
if (typeof window !== "undefined") {
  window.PathUtils = PathUtils;
}

/* 
USAGE EXAMPLES:

// 1. Basic usage
const pathUtils = new PathUtils(config);
const imageUrl = pathUtils.buildAssetUrl('/my-image.jpg', 'image');
const videoUrl = pathUtils.buildAssetUrl('/my-video.mp4', 'video');

// 2. Switch environments
pathUtils.switchEnvironment('production'); // Switch to CDN
pathUtils.switchEnvironment('development'); // Switch back to local

// 3. Switch video quality
pathUtils.switchVideoSource('compressed'); // Use compressed videos
pathUtils.switchVideoSource('primary'); // Use high quality videos

// 4. Process all assets with dynamic URLs
const processedAssets = pathUtils.processAssets(config.assets);

// 5. Get examples
const examples = pathUtils.generateExamples();
console.log(examples);

*/
