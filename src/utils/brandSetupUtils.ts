import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';

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
    // First, find the desktop select element
    const desktopSelectStart = content.indexOf('id="language-select"');
    console.log(`Desktop select start position: ${desktopSelectStart}`);
    
    if (desktopSelectStart !== -1) {
      // Find the opening select tag
      const selectTagStart = content.lastIndexOf('<select', desktopSelectStart);
      console.log(`Select tag start position: ${selectTagStart}`);
      
      if (selectTagStart !== -1) {
        // Find the closing select tag
        const selectTagEnd = content.indexOf('</select>', desktopSelectStart);
        console.log(`Select tag end position: ${selectTagEnd}`);
        
        if (selectTagEnd !== -1) {
          // Extract the content between select tags
          const selectContent = content.substring(selectTagStart, selectTagEnd);
          console.log(`Select content length: ${selectContent.length}`);
          console.log(`Select content preview: ${selectContent.substring(0, 200)}...`);
          
          // Check if brand option already exists in desktop dropdown
          const desktopOptionExists = selectContent.includes(`value="${brandCode}"`);
          console.log(`Brand option exists: ${desktopOptionExists}`);
          
          if (!desktopOptionExists) {
            // Find the last option in desktop dropdown and add after it
            const lastOptionIndex = selectContent.lastIndexOf('</option>');
            console.log(`Last option index: ${lastOptionIndex}`);
            
            if (lastOptionIndex !== -1) {
              const insertIndex = selectTagStart + lastOptionIndex + 9; // length of '</option>'
              console.log(`Insert index: ${insertIndex}`);
              const newOption = `\n                <option value="${brandCode}">${brandName}</option>`;
              console.log(`New option: ${newOption}`);
              content = content.slice(0, insertIndex) + newOption + content.slice(insertIndex);
              console.log('✅ Desktop dropdown updated successfully');
            } else {
              console.log('❌ Could not find last option tag in desktop dropdown');
            }
          } else {
            console.log('✅ Brand already exists in desktop dropdown');
          }
        } else {
          console.log('❌ Could not find closing select tag');
        }
      } else {
        console.log('❌ Could not find opening select tag');
      }
    } else {
      console.log('❌ Could not find desktop select element');
    }

    // Update mobile dropdown options
    // First, find the mobile select element
    const mobileSelectStart = content.indexOf('id="mobile-language-select"');
    if (mobileSelectStart !== -1) {
      // Find the opening select tag
      const mobileSelectTagStart = content.lastIndexOf('<select', mobileSelectStart);
      if (mobileSelectTagStart !== -1) {
        // Find the closing select tag
        const mobileSelectTagEnd = content.indexOf('</select>', mobileSelectStart);
        if (mobileSelectTagEnd !== -1) {
          // Extract the content between select tags
          const mobileSelectContent = content.substring(mobileSelectTagStart, mobileSelectTagEnd);
          
          // Check if brand option already exists in mobile dropdown
          const mobileOptionExists = mobileSelectContent.includes(`value="${brandCode}"`);
          
          if (!mobileOptionExists) {
            // Find the last option in mobile dropdown and add after it
            const lastMobileOptionIndex = mobileSelectContent.lastIndexOf('</option>');
            
            if (lastMobileOptionIndex !== -1) {
              const insertIndex = mobileSelectTagStart + lastMobileOptionIndex + 9; // length of '</option>'
              const newOption = `\n                  <option value="${brandCode}">${brandName}</option>`;
              content = content.slice(0, insertIndex) + newOption + content.slice(insertIndex);
            }
          }
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
  
  // Trigger frontend reload if setup was successful
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