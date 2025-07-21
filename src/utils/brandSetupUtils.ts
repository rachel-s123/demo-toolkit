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
 * Updates the header component to include the new brand in dropdowns
 */
export function updateHeaderComponent(brandCode: string, brandName: string): { success: boolean; error?: string } {
  try {
    const headerPath = path.join(process.cwd(), 'src', 'components', 'layout', 'Header.tsx');
    
    if (!fs.existsSync(headerPath)) {
      return { success: false, error: 'Header component file not found' };
    }

    let content = fs.readFileSync(headerPath, 'utf8');

    // Update brandDisplayNames object
    const brandDisplayNamesRegex = /const brandDisplayNames: Record<string, string> = \{([^}]+)\};/;
    const brandDisplayNamesMatch = content.match(brandDisplayNamesRegex);
    
    if (brandDisplayNamesMatch) {
      const displayNamesContent = brandDisplayNamesMatch[1];
      
      // Check if brand already exists in brandDisplayNames
      if (!displayNamesContent.includes(`${brandCode}:`)) {
        // Add the new brand to brandDisplayNames
        const newDisplayNamesContent = displayNamesContent.trim() + `\n  ${brandCode}: "${brandName}",`;
        content = content.replace(brandDisplayNamesRegex, `const brandDisplayNames: Record<string, string> = {${newDisplayNamesContent}\n};`);
      }
    }

    // Update desktop dropdown options
    const desktopOptionsRegex = /<option value="([^"]+)">([^<]+)<\/option>/g;
    const desktopOptions = content.match(desktopOptionsRegex) || [];
    
    // Check if brand option already exists in desktop dropdown
    const desktopOptionExists = desktopOptions.some(option => option.includes(`value="${brandCode}"`));
    
    if (!desktopOptionExists) {
      // Find the last option and add after it
      const lastOptionIndex = content.lastIndexOf('</option>');
      const insertIndex = lastOptionIndex + 9; // length of '</option>'
      const newOption = `\n                <option value="${brandCode}">${brandName}</option>`;
      content = content.slice(0, insertIndex) + newOption + content.slice(insertIndex);
    }

    // Update mobile dropdown options
    const mobileOptionsRegex = /<option value="([^"]+)">([^<]+)<\/option>/g;
    const mobileOptions = content.match(mobileOptionsRegex) || [];
    
    // Check if brand option already exists in mobile dropdown
    const mobileOptionExists = mobileOptions.some(option => option.includes(`value="${brandCode}"`));
    
    if (!mobileOptionExists) {
      // Find the last mobile option and add after it
      // We need to be more specific for mobile dropdown
      const mobileSelectRegex = /id="mobile-language-select"[^>]*>([^<]*(?:<option[^>]*>[^<]*<\/option>[^<]*)*)/;
      const mobileSelectMatch = content.match(mobileSelectRegex);
      
      if (mobileSelectMatch) {
        const mobileSelectContent = mobileSelectMatch[1];
        const lastMobileOptionIndex = mobileSelectContent.lastIndexOf('</option>');
        
        if (lastMobileOptionIndex !== -1) {
          const insertIndex = mobileSelectMatch.index! + mobileSelectMatch[0].indexOf(mobileSelectContent) + lastMobileOptionIndex + 9;
          const newOption = `\n                  <option value="${brandCode}">${brandName}</option>`;
          content = content.slice(0, insertIndex) + newOption + content.slice(insertIndex);
        }
      }
    }

    fs.writeFileSync(headerPath, content, 'utf8');
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Complete brand setup by updating all necessary files
 */
export function completeBrandSetup(brandCode: string, brandName: string): BrandSetupResult {
  const errors: string[] = [];
  let localeIndexUpdated = false;
  let headerUpdated = false;

  // Update locale index
  const localeResult = updateLocaleIndex(brandCode, brandName);
  if (localeResult.success) {
    localeIndexUpdated = true;
  } else {
    errors.push(`Locale index update failed: ${localeResult.error}`);
  }

  // Update header component
  const headerResult = updateHeaderComponent(brandCode, brandName);
  if (headerResult.success) {
    headerUpdated = true;
  } else {
    errors.push(`Header component update failed: ${headerResult.error}`);
  }

  const success = localeIndexUpdated && headerUpdated;
  
  return {
    success,
    message: success 
      ? `Brand setup completed successfully! ${brandName} has been added to the frontend.`
      : `Brand setup partially completed. ${errors.length} error(s) occurred.`,
    details: {
      localeIndexUpdated,
      headerUpdated,
      errors: errors.length > 0 ? errors : undefined
    }
  };
} 