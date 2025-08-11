import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as fs from 'fs';
import * as path from 'path';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { brandCode } = req.query;
    
    if (!brandCode || typeof brandCode !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Missing or invalid brand code'
      });
    }

    console.log(`🗑️ Deleting brand ${brandCode} from production backend...`);
    console.log(`🌍 Current working directory: ${process.cwd()}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'unknown'}`);
    console.log(`🌍 Vercel URL: ${process.env.VERCEL_URL || 'not set'}`);

    // Remove from locales index file
    const localeResult = removeBrandFromLocales(brandCode);
    if (!localeResult.success) {
      console.error('❌ Failed to remove brand from locales:', localeResult.error);
    }

    // Remove from Vercel Blob Storage
    let blobDeleted = false;
    try {
      const { del } = await import('@vercel/blob');
      
      // Delete config file
      await del(`brand-assets/configs/config_${brandCode}.json`);
      console.log(`✅ Deleted config file for ${brandCode}`);
      
      // Delete locale file
      await del(`brand-assets/locales/${brandCode}.ts`);
      console.log(`✅ Deleted locale file for ${brandCode}`);
      
      // Delete logo file (if exists)
      try {
        await del(`brand-assets/logos/${brandCode}.png`);
        console.log(`✅ Deleted logo file for ${brandCode}`);
      } catch (logoError) {
        console.log(`ℹ️ No logo file found for ${brandCode}`);
      }
      
      blobDeleted = true;
    } catch (blobError) {
      console.error('❌ Failed to delete from blob storage:', blobError);
    }

    return res.status(200).json({
      success: true,
      message: `Brand ${brandCode} deleted successfully`,
      brandCode,
      details: {
        localesUpdated: localeResult.success,
        blobDeleted,
        warning: blobDeleted ? undefined : 'Brand deleted but blob files could not be removed'
      }
    });

    return res.status(200).json({
      success: true,
      message: `Brand ${brandCode} deleted successfully`,
      brandCode,
      details: {
        localesUpdated: true
      }
    });

  } catch (error: any) {
    console.error('❌ Error deleting brand:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to delete brand',
      details: error.message
    });
  }
}

/**
 * Removes a brand from the locales index file (server-side only)
 */
function removeBrandFromLocales(brandCode: string): { success: boolean; error?: string } {
  try {
    // In Vercel, we need to use the correct project root
    // Try multiple possible paths for Vercel deployment
    const possiblePaths = [
      path.join(process.cwd(), 'src', 'locales', 'index.ts'),
      path.join(process.cwd(), 'demo-toolkit', 'src', 'locales', 'index.ts'),
      path.join(process.cwd(), '..', 'src', 'locales', 'index.ts'),
      path.join(process.cwd(), '..', '..', 'src', 'locales', 'index.ts')
    ];
    
    let indexPath = '';
    for (const possiblePath of possiblePaths) {
      if (fs.existsSync(possiblePath)) {
        indexPath = possiblePath;
        console.log(`✅ Found locales index at: ${indexPath}`);
        break;
      }
    }
    
    if (!indexPath) {
      console.error('❌ Could not find locales index file. Tried paths:', possiblePaths);
      return { success: false, error: 'Locale index file not found. Tried multiple paths.' };
    }

    let content = fs.readFileSync(indexPath, 'utf8');

    // Remove import statement
    const importStatement = `import ${brandCode}Strings from './${brandCode}';`;
    if (content.includes(importStatement)) {
      content = content.replace(importStatement, '');
      console.log(`✅ Removed import for ${brandCode}`);
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
        console.log(`✅ Updated LanguageCode type for ${brandCode}`);
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
        console.log(`✅ Removed ${brandCode} from languages object`);
      }
    }

    // Clean up any extra commas or formatting issues
    content = content.replace(/,\s*,/g, ','); // Remove double commas
    content = content.replace(/,\s*};/g, '};'); // Remove trailing comma before closing brace

    fs.writeFileSync(indexPath, content, 'utf8');
    console.log(`✅ Successfully removed ${brandCode} from locales index`);
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
} 