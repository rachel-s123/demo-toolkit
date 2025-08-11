import { SiteCopy } from '../types/siteCopy';

export interface DynamicLocalesLoader {
  loadLocalesIndex(): Promise<Record<string, SiteCopy>>;
  loadBrandLocale(brandCode: string): Promise<SiteCopy | null>;
  getAvailableBrands(): Promise<string[]>;
}

export class VercelBlobLocalesLoader implements DynamicLocalesLoader {
  private static cachedLocalesIndex: Record<string, SiteCopy> | null = null;
  private static cachedBrands: Map<string, SiteCopy> = new Map();
  private static lastIndexUpdate: number = 0;
  private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  /**
   * Load the locales index from Vercel Blob Storage
   */
  async loadLocalesIndex(): Promise<Record<string, SiteCopy>> {
    const now = Date.now();
    
    // Return cached version if still valid
    if (this.cachedLocalesIndex && (now - this.lastIndexUpdate) < this.CACHE_DURATION) {
      return this.cachedLocalesIndex;
    }

    try {
      console.log('🔄 Loading updated locales index from Vercel Blob Storage...');
      
      // Try to load the updated index from Vercel Blob Storage
      const indexUrl = 'https://chfu3qqwfe2lgq2b.public.blob.vercel-storage.com/brand-assets/locales/index.ts';
      const response = await fetch(indexUrl);
      
      if (response.ok) {
        const indexContent = await response.text();
        console.log('✅ Loaded updated locales index from blob storage');
        
        // Parse the index content to extract brand codes
        const brandCodes = this.extractBrandCodesFromIndex(indexContent);
        
        // Load each brand's locale file
        const locales: Record<string, SiteCopy> = {};
        for (const brandCode of brandCodes) {
          try {
            const locale = await this.loadBrandLocale(brandCode);
            if (locale) {
              locales[brandCode] = locale;
            }
          } catch (error) {
            console.warn(`Could not load locale for ${brandCode}:`, error);
          }
        }
        
        // Cache the result
        this.cachedLocalesIndex = locales;
        this.lastIndexUpdate = now;
        
        return locales;
      } else {
        console.warn('⚠️ Could not load updated index, falling back to static index');
        return this.loadStaticLocalesIndex();
      }
    } catch (error) {
      console.error('❌ Error loading dynamic locales index:', error);
      return this.loadStaticLocalesIndex();
    }
  }

  /**
   * Load a specific brand's locale from Vercel Blob Storage
   */
  async loadBrandLocale(brandCode: string): Promise<SiteCopy | null> {
    // Check cache first
    if (this.cachedBrands.has(brandCode)) {
      return this.cachedBrands.get(brandCode)!;
    }

    try {
      const localeUrl = `https://chfu3qqwfe2lgq2b.public.blob.vercel-storage.com/brand-assets/locales/${brandCode}.ts`;
      const response = await fetch(localeUrl);
      
      if (response.ok) {
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
      } else {
        console.warn(`⚠️ Could not load locale for ${brandCode} from blob storage`);
        return null;
      }
    } catch (error) {
      console.error(`❌ Failed to load brand locale for ${brandCode}:`, error);
      return null;
    }
  }

  /**
   * Get available brand codes from the dynamic index
   */
  async getAvailableBrands(): Promise<string[]> {
    try {
      const locales = await this.loadLocalesIndex();
      return Object.keys(locales);
    } catch (error) {
      console.error('❌ Error getting available brands:', error);
      return [];
    }
  }

  /**
   * Extract brand codes from the index content
   */
  private extractBrandCodesFromIndex(indexContent: string): string[] {
    const brandCodes: string[] = [];
    
    // Extract from LanguageCode type
    const languageCodeRegex = /export type LanguageCode = '([^']+)'(?:\s*\|\s*'([^']+)')*;?/;
    const languageCodeMatch = indexContent.match(languageCodeRegex);
    
    if (languageCodeMatch) {
      const codes = languageCodeMatch[0].match(/'([^']+)'/g)?.map(code => code.replace(/'/g, '')) || [];
      brandCodes.push(...codes);
    }
    
    // Also extract from languages object
    const languagesRegex = /export const languages: Record<LanguageCode, SiteCopy> = \{([^}]+)\};/;
    const languagesMatch = indexContent.match(languagesRegex);
    
    if (languagesMatch) {
      const languagesContent = languagesMatch[1];
      const lines = languagesContent.split('\n');
      
      for (const line of lines) {
        const match = line.trim().match(/^(\w+):/);
        if (match) {
          const brandCode = match[1];
          if (!brandCodes.includes(brandCode)) {
            brandCodes.push(brandCode);
          }
        }
      }
    }
    
    return brandCodes;
  }

  /**
   * Load the static locales index as fallback
   */
  private async loadStaticLocalesIndex(): Promise<Record<string, SiteCopy>> {
    try {
      // Import the static locales index
      const { languages } = await import('../locales');
      return languages;
    } catch (error) {
      console.error('❌ Could not load static locales index:', error);
      return {};
    }
  }

  /**
   * Clear the cache to force a fresh load
   */
  clearCache(): void {
    this.cachedLocalesIndex = null;
    this.cachedBrands.clear();
    this.lastIndexUpdate = 0;
  }
}

// Export a singleton instance
export const dynamicLocalesLoader = new VercelBlobLocalesLoader(); 