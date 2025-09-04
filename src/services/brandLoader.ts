import { SiteCopy } from '../types/siteCopy';

export interface BrandConfig {
  brandCode: string;
  brandName: string;
  files: Array<{
    filename: string;
    url: string;
    type: string;
    storagePath: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

/**
 * Simplified BrandLoader - only handles static brands
 * Dynamic brand loading has been removed
 */
export class BrandLoader {
  /**
   * Load all available brands from static locales
   * This is now a simple function that returns empty array
   * since we only use static brands
   */
  static async loadBrandsConfig(): Promise<BrandConfig[]> {
    // Return empty array since we only use static brands
    return [];
  }

  /**
   * Load a specific brand's locale file
   * This is now a no-op since we only use static brands
   */
  static async loadBrandLocale(brandCode: string): Promise<SiteCopy | null> {
    // Return null since we only use static brands
    return null;
  }

  /**
   * Get all available brand codes
   * This is now a simple function that returns empty array
   */
  static getAvailableBrandCodes(): string[] {
    return [];
  }

  /**
   * Get brand configuration by brand code
   * This is now a simple function that returns null
   */
  static getBrandConfig(brandCode: string): BrandConfig | null {
    return null;
  }

  /**
   * Clear cache - no-op since we don't cache anything
   */
  static clearCache(brandCode?: string): void {
    // No-op
  }

  /**
   * Refresh brands config - no-op since we don't load dynamic brands
   */
  static async refresh(): Promise<BrandConfig[]> {
    return [];
  }
}