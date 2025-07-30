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

export class BrandLoader {
  private static cachedBrands: Map<string, SiteCopy> = new Map();
  private static brandsConfig: BrandConfig[] = [];

  /**
   * Load all available brands from the backend
   */
  static async loadBrandsConfig(): Promise<BrandConfig[]> {
    try {
      // Try the blob-based endpoint first
      const response = await fetch('/api/get-brands-from-blob');
      const data = await response.json();
      
      if (data.success && data.brands) {
        this.brandsConfig = data.brands;
        console.log(`📦 Loaded ${data.brands.length} brands from blob storage`);
        return data.brands;
      }
      
      // Fallback to KV-based endpoint if blob endpoint fails
      console.log('🔄 Falling back to KV-based endpoint...');
      const kvResponse = await fetch('/api/get-brands');
      const kvData = await kvResponse.json();
      
      if (kvData.success && kvData.brands) {
        this.brandsConfig = kvData.brands;
        return kvData.brands;
      }
      
      return [];
    } catch (error) {
      console.error('Failed to load brands config:', error);
      return [];
    }
  }

  /**
   * Load a specific brand's locale file from Vercel Blob Storage
   */
  static async loadBrandLocale(brandCode: string): Promise<SiteCopy | null> {
    // Check cache first
    if (this.cachedBrands.has(brandCode)) {
      return this.cachedBrands.get(brandCode)!;
    }

    try {
      // Find the brand config
      const brandConfig = this.brandsConfig.find(brand => brand.brandCode === brandCode);
      if (!brandConfig) {
        console.warn(`Brand config not found for: ${brandCode}`);
        return null;
      }

      // Find the locale file
      const localeFile = brandConfig.files.find(file => file.type === 'locale');
      if (!localeFile) {
        console.warn(`Locale file not found for brand: ${brandCode}`);
        return null;
      }

      // Fetch the locale file from Vercel Blob Storage
      const response = await fetch(localeFile.url);
      if (!response.ok) {
        throw new Error(`Failed to fetch locale file: ${response.statusText}`);
      }

      const fileContent = await response.text();
      
      // Extract the brandStrings export from the TypeScript file
      const brandStringsMatch = fileContent.match(/const brandStrings: SiteCopy = ({[\s\S]*?});/);
      if (!brandStringsMatch) {
        throw new Error('Could not parse brandStrings from locale file');
      }

      // Convert the TypeScript object to JavaScript
      const brandStringsCode = brandStringsMatch[1];
      
      // Create a function to evaluate the brandStrings object
      const brandStrings = eval(`(${brandStringsCode})`);
      
      // Cache the result
      this.cachedBrands.set(brandCode, brandStrings);
      
      console.log(`✅ Successfully loaded brand locale for: ${brandCode}`);
      return brandStrings;

    } catch (error) {
      console.error(`Failed to load brand locale for ${brandCode}:`, error);
      return null;
    }
  }

  /**
   * Get all available brand codes
   */
  static getAvailableBrandCodes(): string[] {
    return this.brandsConfig.map(brand => brand.brandCode);
  }

  /**
   * Get brand config by code
   */
  static getBrandConfig(brandCode: string): BrandConfig | undefined {
    return this.brandsConfig.find(brand => brand.brandCode === brandCode);
  }

  /**
   * Clear cache for a specific brand or all brands
   */
  static clearCache(brandCode?: string) {
    if (brandCode) {
      this.cachedBrands.delete(brandCode);
    } else {
      this.cachedBrands.clear();
    }
  }

  /**
   * Refresh brands config and clear cache
   */
  static async refresh(): Promise<BrandConfig[]> {
    this.clearCache();
    return await this.loadBrandsConfig();
  }
} 