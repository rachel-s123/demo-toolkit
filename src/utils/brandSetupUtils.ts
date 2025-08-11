

import fs from 'fs';
import path from 'path';

export interface BrandSetupResult {
  success: boolean;
  message: string;
  details?: {
    localeIndexUpdated?: boolean;
    headerUpdated?: boolean;
    errors?: string[];
  };
}

/**
 * Updates the locale index file to include the new brand
 */
export function updateLocaleIndex(brandCode: string, brandName: string): { success: boolean; error?: string } {
  try {
    const indexPath = path.join(process.cwd(), 'src', 'locales', 'index.ts');
    
    if (!fs.existsSync(indexPath)) {
      return { success: false, error: 'Locale index file not found' };
    }

    let content = fs.readFileSync(indexPath, 'utf8');

    // Add import statement
    const importStatement = `import ${brandCode}Strings from './${brandCode}';`;
    
    // Check if import already exists
    if (!content.includes(importStatement)) {
      // Find the last import statement and add after it
      const importRegex = /import.*from.*['"];?\s*$/gm;
      const imports = content.match(importRegex);
      
      if (imports) {
        const lastImport = imports[imports.length - 1];
        const insertIndex = content.lastIndexOf(lastImport) + lastImport.length;
        content = content.slice(0, insertIndex) + '\n' + importStatement + content.slice(insertIndex);
      } else {
        // If no imports found, add after the first import
        const firstImportIndex = content.indexOf('import');
        const firstImportEnd = content.indexOf(';', firstImportIndex) + 1;
        content = content.slice(0, firstImportEnd) + '\n' + importStatement + content.slice(firstImportEnd);
      }
    }

    // Update LanguageCode type
    const languageCodeRegex = /export type LanguageCode = '([^']+)'(?:\s*\|\s*'([^']+)')*;?/;
    const languageCodeMatch = content.match(languageCodeRegex);
    
    if (languageCodeMatch) {
      const existingCodes = languageCodeMatch[0].match(/'([^']+)'/g)?.map(code => code.replace(/'/g, '')) || [];
      
      if (!existingCodes.includes(brandCode)) {
        const newLanguageCode = `export type LanguageCode = '${existingCodes.join("' | '")}' | '${brandCode}';`;
        content = content.replace(languageCodeRegex, newLanguageCode);
      }
    }

    // Update languages object
    const languagesRegex = /export const languages: Record<LanguageCode, SiteCopy> = \{([^}]+)\};/;
    const languagesMatch = content.match(languagesRegex);
    
    if (languagesMatch) {
      const languagesContent = languagesMatch[1];
      
      // Check if brand already exists in languages object
      if (!languagesContent.includes(`${brandCode}:`)) {
        // Add the new brand to the languages object
        const newLanguagesContent = languagesContent.trim() + `\n  ${brandCode}: ${brandCode}Strings,`;
        content = content.replace(languagesRegex, `export const languages: Record<LanguageCode, SiteCopy> = {${newLanguagesContent}\n};`);
      }
    }

    fs.writeFileSync(indexPath, content, 'utf8');
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Trigger frontend reload by touching a file to cause HMR
 */
function triggerFrontendReload(): void {
  try {
    // Touch the main App.tsx file to trigger a hot reload
    const appPath = path.join(process.cwd(), 'src', 'App.tsx');
    if (fs.existsSync(appPath)) {
      const stats = fs.statSync(appPath);
      fs.utimesSync(appPath, stats.atime, new Date());
      console.log('✅ Triggered frontend reload');
    }
    
    // Also touch the locales index to ensure it's reloaded
    const localesPath = path.join(process.cwd(), 'src', 'locales', 'index.ts');
    if (fs.existsSync(localesPath)) {
      const stats = fs.statSync(localesPath);
      fs.utimesSync(localesPath, stats.atime, new Date());
      console.log('✅ Triggered locales reload');
    }
  } catch (error) {
    console.warn('Could not trigger frontend reload:', error);
  }
}







/**
 * Complete brand setup by updating all necessary files
 */
export function completeBrandSetup(brandCode: string, brandName: string): BrandSetupResult {
  const errors: string[] = [];
  let localeIndexUpdated = false;
  let headerUpdated = false;

  // Update locale index (this is still needed for frontend imports)
  const localeResult = updateLocaleIndex(brandCode, brandName);
  if (localeResult.success) {
    localeIndexUpdated = true;
  } else {
    errors.push(`Locale index update failed: ${localeResult.error}`);
  }

  // Note: Header component now loads brands dynamically from Redis
  // No need to manually edit the Header.tsx file
  headerUpdated = true; // Always true since we're not editing files anymore

  const success = localeIndexUpdated && headerUpdated;
  
  // Trigger frontend reload since we updated the locales index
  if (success) {
    triggerFrontendReload();
  }
  
  return {
    success,
    message: success 
      ? `Brand setup completed successfully! ${brandName} has been added to the frontend. The page should automatically reload to show the new brand.`
      : `Brand setup partially completed. ${errors.length} error(s) occurred.`,
    details: {
      localeIndexUpdated,
      headerUpdated,
      errors: errors.length > 0 ? errors : undefined
    }
  };
} 