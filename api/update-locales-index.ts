import { VercelRequest, VercelResponse } from '@vercel/node';
import { put } from '@vercel/blob';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { brandCode, brandName, action } = req.body;

    if (!brandCode || !brandName || !action) {
      return res.status(400).json({ 
        error: 'Missing required fields: brandCode, brandName, action' 
      });
    }

    if (action !== 'add' && action !== 'remove') {
      return res.status(400).json({ 
        error: 'Invalid action. Must be "add" or "remove"' 
      });
    }

    console.log(`🔄 Updating locales index: ${action} brand ${brandName} (${brandCode})`);

    // Get the current locales index content from the repository
    const currentIndexContent = await getCurrentLocalesIndex();
    
    if (!currentIndexContent) {
      return res.status(500).json({ 
        error: 'Could not fetch current locales index content' 
      });
    }

    // Update the content based on the action
    let updatedContent: string;
    if (action === 'add') {
      updatedContent = addBrandToLocalesIndex(currentIndexContent, brandCode, brandName);
    } else {
      updatedContent = removeBrandFromLocalesIndex(currentIndexContent, brandCode);
    }

    // Upload the updated locales index to Vercel Blob Storage
    const storagePath = `brand-assets/locales/index_${Date.now()}.ts`;
    const blob = await put(storagePath, updatedContent, {
      contentType: 'text/typescript',
      access: 'public',
    });

    // Also update the main locales index in the repository
    // This will be used by the frontend to load the updated index
    const mainIndexPath = `brand-assets/locales/index.ts`;
    await put(mainIndexPath, updatedContent, {
      contentType: 'text/typescript',
      access: 'public',
      allowOverwrite: true,
    });

    console.log(`✅ Locales index updated successfully for ${brandCode}`);

    return res.status(200).json({
      success: true,
      message: `Brand ${brandName} ${action === 'add' ? 'added to' : 'removed from'} locales index successfully`,
      brandCode,
      brandName,
      action,
      updatedIndexUrl: blob.url,
      mainIndexUrl: `https://chfu3qqwfe2lgq2b.public.blob.vercel-storage.com/${mainIndexPath}`,
      note: "The frontend will automatically reload to show the updated brand list"
    });

  } catch (error: any) {
    console.error('❌ Error updating locales index:', error);
    return res.status(500).json({
      error: 'Failed to update locales index',
      details: error.message
    });
  }
}

/**
 * Get the current locales index content from the repository
 */
async function getCurrentLocalesIndex(): Promise<string | null> {
  try {
    // Try to fetch from the current repository
    const response = await fetch('https://raw.githubusercontent.com/rachel-s123/demo-toolkit/main/src/locales/index.ts');
    if (response.ok) {
      return await response.text();
    }
    
    // Fallback to a template if we can't fetch from GitHub
    return getDefaultLocalesIndexTemplate();
  } catch (error) {
    console.warn('Could not fetch from GitHub, using template:', error);
    return getDefaultLocalesIndexTemplate();
  }
}

/**
 * Get a default locales index template
 */
function getDefaultLocalesIndexTemplate(): string {
  return `import { SiteCopy } from '../types/siteCopy';
import enStrings from './en';
import edfStrings from './edf';
import edfFrStrings from './edf_fr';
import bmwStrings from './bmw';
import enTemplateStrings from './en_template';
import hedosophStrings from './hedosoph';

export type LanguageCode = 'en' | 'edf' | 'edf_fr' | 'bmw' | 'en_template' | 'hedosoph';

export const languages: Record<LanguageCode, SiteCopy> = {
  en: enStrings,
  edf: edfStrings,
  edf_fr: edfFrStrings,
  bmw: bmwStrings,
  en_template: enTemplateStrings,
  hedosoph: hedosophStrings,
};

export const defaultLang: LanguageCode = 'en';
`;
}

/**
 * Add a brand to the locales index
 */
function addBrandToLocalesIndex(content: string, brandCode: string, brandName: string): string {
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

  return content;
}

/**
 * Remove a brand from the locales index
 */
function removeBrandFromLocalesIndex(content: string, brandCode: string): string {
  // Remove import statement
  const importStatement = `import ${brandCode}Strings from './${brandCode}';`;
  if (content.includes(importStatement)) {
    content = content.replace(importStatement, '');
  }

  // Update LanguageCode type
  const languageCodeRegex = /export type LanguageCode = '([^']+)'(?:\s*\|\s*'([^']+)')*;?/;
  const languageCodeMatch = content.match(languageCodeRegex);
  
  if (languageCodeMatch) {
    const existingCodes = languageCodeMatch[0].match(/'([^']+)'/g)?.map(code => code.replace(/'/g, '')) || [];
    const updatedCodes = existingCodes.filter(code => code !== brandCode);
    
    if (updatedCodes.length !== existingCodes.length) {
      const newLanguageCode = `export type LanguageCode = '${updatedCodes.join("' | '")}';`;
      content = content.replace(languageCodeRegex, newLanguageCode);
    }
  }

  // Update languages object
  const languagesRegex = /export const languages: Record<LanguageCode, SiteCopy> = \{([^}]+)\};/;
  const languagesMatch = content.match(languagesRegex);
  
  if (languagesMatch) {
    const languagesContent = languagesMatch[1];
    
    // Remove the brand from languages object
    if (languagesContent.includes(`${brandCode}:`)) {
      const lines = languagesContent.split('\n');
      const filteredLines = lines.filter(line => !line.trim().startsWith(`${brandCode}:`));
      const newLanguagesContent = filteredLines.join('\n').trim();
      
      content = content.replace(languagesRegex, `export const languages: Record<LanguageCode, SiteCopy> = {${newLanguagesContent}\n};`);
    }
  }

  // Clean up any extra commas or formatting issues
  content = content.replace(/,\s*,/g, ','); // Remove double commas
  content = content.replace(/,\s*};/g, '};'); // Remove trailing comma before closing brace

  return content;
} 