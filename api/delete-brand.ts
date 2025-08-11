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

    // Remove from locales index file
    const localeResult = removeBrandFromLocales(brandCode);
    if (!localeResult.success) {
      return res.status(500).json({
        success: false,
        error: `Failed to remove brand from locales: ${localeResult.error}`
      });
    }

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
    // In Vercel, we need to use the project root
    const projectRoot = process.cwd();
    const indexPath = path.join(projectRoot, 'src', 'locales', 'index.ts');
    
    if (!fs.existsSync(indexPath)) {
      return { success: false, error: 'Locale index file not found' };
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