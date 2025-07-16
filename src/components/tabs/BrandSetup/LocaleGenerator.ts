import { SiteCopy } from '../../../types/siteCopy';

export interface BrandAdaptationOptions {
  brandName: string;
  brandCode: string;
  adaptationPrompt: string;
  industry?: string;
  tone?: 'professional' | 'friendly' | 'technical' | 'casual';
  targetAudience?: string;
  logoPath?: string;
}

export interface BrandConfigContent {
  isDemo: boolean;
  demoNotice: string;
  lastUpdated: string;
  brand?: {
    name: string;
    logo: string;
    logoAlt: string;
  };
  assets: any[];
  messages: any[];
  guides: any[];
  journeySteps?: any[];
  filterOptions?: any;
  contentOutline?: any;
}

export interface GeneratedBrandFiles {
  siteCopy: string; // TypeScript file content
  configContent: string; // JSON file content
}

/**
 * Advanced locale content adaptation engine
 * This handles BOTH site copy (.ts) and config content (.json) files
 */
export class LocaleGenerator {
  
  /**
   * Generates both site copy and config content for a brand
   */
  static async generateBrandFiles(
    baseSiteCopy: SiteCopy, 
    baseConfigContent: BrandConfigContent,
    options: BrandAdaptationOptions
  ): Promise<GeneratedBrandFiles> {
    
    // Adapt the site copy (UI text)
    const adaptedSiteCopy = this.adaptLocale(baseSiteCopy, options);
    
    // Adapt the config content (assets, messages, guides)
    const adaptedConfigContent = this.adaptConfigContent(baseConfigContent, options);
    
    return {
      siteCopy: this.generateLocaleFile(options.brandCode, adaptedSiteCopy),
      configContent: JSON.stringify(adaptedConfigContent, null, 2)
    };
  }
  
  /**
   * Adapts config content (messages, assets, guides) for the brand
   */
  static adaptConfigContent(baseConfig: BrandConfigContent, options: BrandAdaptationOptions): BrandConfigContent {
    const { brandName, adaptationPrompt, logoPath } = options;
    const adapted = JSON.parse(JSON.stringify(baseConfig)) as BrandConfigContent;
    
    // Update demo notice for the brand
    adapted.demoNotice = `These are demo assets and content for ${brandName}. Replace with actual brand materials.`;
    adapted.lastUpdated = new Date().toISOString();
    
    // Add/update brand information
    adapted.brand = {
      name: brandName,
      logo: logoPath || `/assets/logos/${options.brandCode}.png`,
      logoAlt: `${brandName} Logo`
    };
    
    // Generate comprehensive content instead of just adapting
    adapted.messages = this.generateComprehensiveMessages(options);
    adapted.assets = this.generateComprehensiveAssets(options);
    adapted.guides = this.generateComprehensiveGuides(options);
    adapted.journeySteps = this.generateRelevantJourneySteps(options);
    adapted.filterOptions = this.generateFilterOptions(options);
    adapted.contentOutline = this.generateContentOutline(options);
    
    return adapted;
  }
  
  /**
   * Adapts message content for the brand
   */
  private static adaptMessages(messages: any[], options: BrandAdaptationOptions): any[] {
    const { brandName, adaptationPrompt } = options;
    
    return messages.map(message => {
      const adaptedMessage = { ...message };
      
      // Adapt message content based on brand and industry
      if (adaptationPrompt.toLowerCase().includes('sustainability')) {
        adaptedMessage.content = this.adaptForSustainability(message.content, brandName);
        adaptedMessage.channel = this.adaptChannelForIndustry(message.channel, 'sustainability');
      } else if (adaptationPrompt.toLowerCase().includes('technology')) {
        adaptedMessage.content = this.adaptForTechnology(message.content, brandName);
        adaptedMessage.channel = this.adaptChannelForIndustry(message.channel, 'technology');
      } else if (adaptationPrompt.toLowerCase().includes('healthcare')) {
        adaptedMessage.content = this.adaptForHealthcare(message.content, brandName);
        adaptedMessage.channel = this.adaptChannelForIndustry(message.channel, 'healthcare');
      } else {
        // Generic brand adaptation
        adaptedMessage.content = this.adaptGenericContent(message.content, brandName);
      }
      
      // Update model references to brand-specific terminology
      adaptedMessage.model = this.getBrandEquivalent(message.model, options);
      adaptedMessage.title = adaptedMessage.title.replace(/BMW|R\d+/g, brandName);
      
      return adaptedMessage;
    });
  }
  
  /**
   * Adapts asset content for the brand
   */
  private static adaptAssets(assets: any[], options: BrandAdaptationOptions): any[] {
    const { brandName } = options;
    
    return assets.map(asset => {
      const adaptedAsset = { ...asset };
      
      // Update asset titles and descriptions
      adaptedAsset.title = asset.title.replace(/BMW|R\d+/gi, brandName);
      adaptedAsset.model = this.getBrandEquivalent(asset.model, options);
      
      // Update file naming to reflect brand
      if (adaptedAsset.newAssetName) {
        adaptedAsset.newAssetName = adaptedAsset.newAssetName.replace(/BMW|R\d+/gi, options.brandCode);
      }
      
      return adaptedAsset;
    });
  }
  
  /**
   * Adapts guide content for the brand
   */
  private static adaptGuides(guides: any[], options: BrandAdaptationOptions): any[] {
    const { brandName, adaptationPrompt } = options;
    
    return guides.map(guide => {
      const adaptedGuide = { ...guide };
      
      // Adapt guide titles and content
      adaptedGuide.title = guide.title.replace(/BMW|Motorrad|dealership/gi, brandName);
      
      if (adaptationPrompt.toLowerCase().includes('sustainability')) {
        adaptedGuide.title = this.adaptGuideForSustainability(guide.title);
      } else if (adaptationPrompt.toLowerCase().includes('technology')) {
        adaptedGuide.title = this.adaptGuideForTechnology(guide.title);
      }
      
      adaptedGuide.model = this.getBrandEquivalent(guide.model, options);
      
      return adaptedGuide;
    });
  }
  
  /**
   * Adapts content for sustainability focus
   */
  private static adaptForSustainability(content: string, brandName: string): string {
    return content
      .replace(/BMW R \d+ \w+/gi, `${brandName} Green Solution`)
      .replace(/motorcycle|bike/gi, 'sustainable solution')
      .replace(/test ride/gi, 'sustainability assessment')
      .replace(/dealership/gi, 'green facility')
      .replace(/145hp/gi, 'eco-efficient')
      .replace(/Boxer engine/gi, 'renewable technology')
      .replace(/Book your test ride/gi, 'Schedule your sustainability consultation')
      .replace(/Launch|launch/g, 'Green Initiative')
      .replace(/BMW Motorrad/gi, brandName);
  }
  
  /**
   * Adapts content for technology focus
   */
  private static adaptForTechnology(content: string, brandName: string): string {
    return content
      .replace(/BMW R \d+ \w+/gi, `${brandName} Tech Platform`)
      .replace(/motorcycle|bike/gi, 'technology solution')
      .replace(/test ride/gi, 'demo session')
      .replace(/dealership/gi, 'technology center')
      .replace(/145hp/gi, 'high-performance')
      .replace(/Boxer engine/gi, 'advanced processor')
      .replace(/Book your test ride/gi, 'Schedule your demo')
      .replace(/Launch|launch/g, 'Product Release')
      .replace(/BMW Motorrad/gi, brandName);
  }
  
  /**
   * Adapts content for healthcare focus
   */
  private static adaptForHealthcare(content: string, brandName: string): string {
    return content
      .replace(/BMW R \d+ \w+/gi, `${brandName} Care System`)
      .replace(/motorcycle|bike/gi, 'healthcare solution')
      .replace(/test ride/gi, 'consultation')
      .replace(/dealership/gi, 'healthcare facility')
      .replace(/145hp/gi, 'advanced capability')
      .replace(/Boxer engine/gi, 'care technology')
      .replace(/Book your test ride/gi, 'Schedule your consultation')
      .replace(/Launch|launch/g, 'Care Program')
      .replace(/BMW Motorrad/gi, brandName);
  }
  
  /**
   * Generic content adaptation
   */
  private static adaptGenericContent(content: string, brandName: string): string {
    return content
      .replace(/BMW R \d+ \w+/gi, `${brandName} Product`)
      .replace(/BMW Motorrad/gi, brandName)
      .replace(/dealership/gi, 'location')
      .replace(/test ride/gi, 'trial experience');
  }
  
  /**
   * Gets brand equivalent for BMW model names
   */
  private static getBrandEquivalent(model: string, options: BrandAdaptationOptions): string {
    const { brandName, adaptationPrompt } = options;
    
    if (adaptationPrompt.toLowerCase().includes('sustainability')) {
      return model.replace(/R\d+ \w+/gi, 'Green Solution');
    } else if (adaptationPrompt.toLowerCase().includes('technology')) {
      return model.replace(/R\d+ \w+/gi, 'Tech Platform');
    } else if (adaptationPrompt.toLowerCase().includes('healthcare')) {
      return model.replace(/R\d+ \w+/gi, 'Care System');
    }
    
    return `${brandName} Product`;
  }
  
  /**
   * Adapts communication channels for different industries
   */
  private static adaptChannelForIndustry(channel: string, industry: string): string {
    if (industry === 'healthcare' && channel === 'WhatsApp') {
      return 'Secure Messaging';
    } else if (industry === 'sustainability' && channel === 'Instagram') {
      return 'Social';
    }
    return channel;
  }
  
  /**
   * Adapts guide titles for sustainability
   */
  private static adaptGuideForSustainability(title: string): string {
    return title
      .replace(/Test Ride/gi, 'Sustainability Assessment')
      .replace(/In-Store/gi, 'On-Site')
      .replace(/Launch/gi, 'Green Initiative')
      .replace(/Customer/gi, 'Stakeholder');
  }
  
  /**
   * Adapts guide titles for technology
   */
  private static adaptGuideForTechnology(title: string): string {
    return title
      .replace(/Test Ride/gi, 'Demo Session')
      .replace(/In-Store/gi, 'On-Platform')
      .replace(/Launch/gi, 'Product Release')
      .replace(/Customer/gi, 'User');
  }
  
  /**
   * Adapts a base locale for a specific brand (UI/site copy)
   */
  static adaptLocale(baseLocale: SiteCopy, options: BrandAdaptationOptions): SiteCopy {
    // Deep clone the base locale
    const adapted = JSON.parse(JSON.stringify(baseLocale)) as SiteCopy;
    
    // Apply brand-specific adaptations
    this.adaptMainTitle(adapted, options);
    this.adaptWelcomeContent(adapted, options);
    this.adaptJourneySteps(adapted, options);
    this.adaptContentSections(adapted, options);
    this.adaptPromptSpecificContent(adapted, options);
    
    return adapted;
  }
  
  /**
   * Adapts the main title and brand references
   */
  private static adaptMainTitle(locale: SiteCopy, options: BrandAdaptationOptions): void {
    const { brandName } = options;
    
    // Replace BMW Motorrad references
    locale.home.mainTitle = locale.home.mainTitle
      .replace(/BMW Motorrad R Series/gi, brandName)
      .replace(/BMW R Series/gi, brandName)
      .replace(/BMW Motorrad/gi, brandName);
    
    locale.home.welcomeLead = locale.home.welcomeLead
      .replace(/BMW R Series/gi, brandName)
      .replace(/BMW Motorrad/gi, brandName);
  }
  
  /**
   * Adapts welcome content and value propositions
   */
  private static adaptWelcomeContent(locale: SiteCopy, options: BrandAdaptationOptions): void {
    const { adaptationPrompt } = options;
    
    // Adapt help you list based on industry context
    if (adaptationPrompt.toLowerCase().includes('sustainability') || 
        adaptationPrompt.toLowerCase().includes('energy')) {
      locale.home.helpYouList = [
        "Understand sustainable business practices",
        "Implement energy-efficient solutions",
        "Communicate your green initiatives effectively"
      ];
    } else if (adaptationPrompt.toLowerCase().includes('technology')) {
      locale.home.helpYouList = [
        "Leverage cutting-edge technology solutions",
        "Maximize digital transformation initiatives",
        "Deliver consistent innovation across all platforms"
      ];
    } else if (adaptationPrompt.toLowerCase().includes('healthcare')) {
      locale.home.helpYouList = [
        "Improve patient engagement and care",
        "Implement healthcare best practices",
        "Ensure consistent quality across all touchpoints"
      ];
    }
  }
  
  /**
   * Adapts customer journey steps for different industries
   */
  private static adaptJourneySteps(locale: SiteCopy, options: BrandAdaptationOptions): void {
    const { brandName, adaptationPrompt } = options;
    
    if (adaptationPrompt.toLowerCase().includes('sustainability') || adaptationPrompt.toLowerCase().includes('energy')) {
      locale.home.journeySteps = {
        launch: {
          title: "Discovery",
          description: `Understanding ${brandName}'s sustainability needs and goals`
        },
        generateTestRides: {
          title: "Assessment", 
          description: "Evaluating current practices and identifying opportunities"
        },
        inStore: {
          title: "Implementation",
          description: "Deploying sustainable solutions and practices"
        },
        followUp: {
          title: "Optimization",
          description: "Measuring impact and refining approaches"
        },
        welcome: {
          title: "Advocacy",
          description: "Sharing success stories and inspiring others"
        }
      };
    } else if (adaptationPrompt.toLowerCase().includes('technology')) {
      locale.home.journeySteps = {
        launch: {
          title: "Exploration",
          description: `Discovering ${brandName}'s technology opportunities and needs`
        },
        generateTestRides: {
          title: "Demonstration",
          description: "Testing and validating technology solutions"
        },
        inStore: {
          title: "Integration",
          description: "Implementing technology into workflows"
        },
        followUp: {
          title: "Optimization",
          description: "Fine-tuning and maximizing technology value"
        },
        welcome: {
          title: "Innovation",
          description: "Becoming a technology leader and innovator"
        }
      };
    } else if (adaptationPrompt.toLowerCase().includes('healthcare')) {
      locale.home.journeySteps = {
        launch: {
          title: "Consultation",
          description: `Initial ${brandName} assessment and goal setting`
        },
        generateTestRides: {
          title: "Planning",
          description: "Developing personalized strategies and solutions"
        },
        inStore: {
          title: "Treatment",
          description: "Implementing care plans and interventions"
        },
        followUp: {
          title: "Monitoring",
          description: "Tracking progress and adjusting approaches"
        },
        welcome: {
          title: "Wellness",
          description: "Maintaining long-term health and wellbeing"
        }
      };
    } else {
      locale.home.journeySteps = {
        launch: {
          title: "Awareness",
          description: `Introducing customers to ${brandName}`
        },
        generateTestRides: {
          title: "Interest",
          description: "Building engagement and generating leads"
        },
        inStore: {
          title: "Consideration",
          description: "Evaluating solutions and building trust"
        },
        followUp: {
          title: "Decision",
          description: "Converting prospects into customers"
        },
        welcome: {
          title: "Loyalty",
          description: "Building lasting relationships and advocacy"
        }
      };
    }
  }
  
  /**
   * Adapts content sections like assets, messages, guides
   */
  private static adaptContentSections(locale: SiteCopy, options: BrandAdaptationOptions): void {
    const { brandName, adaptationPrompt } = options;
    
    // Adapt assets section
    if (adaptationPrompt.toLowerCase().includes('sustainability')) {
      locale.assets.title = "Resource Library";
      locale.assets.introParagraph1 = `Welcome to the central hub for all sustainability resources and materials for ${brandName}.`;
      locale.assets.phase1Details = "Includes sustainability reports, infographics, and case studies to support your green communications.";
    }
    
    // Adapt messages section
    if (adaptationPrompt.toLowerCase().includes('energy')) {
      locale.messages.introParagraph1 = "All messaging here is designed to help you communicate your energy initiatives and environmental impact effectively.";
      locale.messages.introParagraph2 = "These templates focus on sustainability, energy efficiency, and environmental responsibility.";
    }
    
    // Adapt guides section
    locale.guides.introParagraph1 = `Explore comprehensive guides tailored for ${brandName}'s specific needs and industry requirements.`;
  }
  
  /**
   * Applies specific adaptations based on the user's prompt
   */
  private static adaptPromptSpecificContent(locale: SiteCopy, options: BrandAdaptationOptions): void {
    const { adaptationPrompt } = options;
    const prompt = adaptationPrompt.toLowerCase();
    
    // Apply keyword-based transformations
    const transformations = [
      { from: /motorcycle|bike|motorbike/gi, to: this.getReplacementTerm(prompt, 'vehicle') },
      { from: /dealership|dealer/gi, to: this.getReplacementTerm(prompt, 'business') },
      { from: /test ride/gi, to: this.getReplacementTerm(prompt, 'trial') },
      { from: /marketing/gi, to: this.getReplacementTerm(prompt, 'outreach') },
      { from: /campaign/gi, to: this.getReplacementTerm(prompt, 'initiative') }
    ];
    
    // Apply transformations to all text content
    this.applyTransformations(locale, transformations);
  }
  
  /**
   * Gets appropriate replacement terms based on context
   */
  private static getReplacementTerm(prompt: string, category: string): string {
    const replacements: Record<string, Record<string, string>> = {
      vehicle: {
        sustainability: 'solution',
        energy: 'system',
        technology: 'platform',
        healthcare: 'service'
      },
      business: {
        sustainability: 'organization',
        energy: 'facility',
        technology: 'company',
        healthcare: 'practice'
      },
      trial: {
        sustainability: 'assessment',
        energy: 'evaluation',
        technology: 'demo',
        healthcare: 'consultation'
      },
      outreach: {
        sustainability: 'communication',
        energy: 'engagement',
        technology: 'promotion',
        healthcare: 'patient engagement'
      },
      initiative: {
        sustainability: 'program',
        energy: 'project',
        technology: 'deployment',
        healthcare: 'care program'
      }
    };
    
    for (const [keyword, replacement] of Object.entries(replacements[category] || {})) {
      if (prompt.includes(keyword)) {
        return replacement;
      }
    }
    
    return replacements[category]?.sustainability || category;
  }
  
  /**
   * Applies text transformations recursively to locale object
   */
  private static applyTransformations(obj: any, transformations: Array<{from: RegExp, to: string}>): void {
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        transformations.forEach(({ from, to }) => {
          obj[key] = obj[key].replace(from, to);
        });
      } else if (Array.isArray(obj[key])) {
        obj[key].forEach((item: any, index: number) => {
          if (typeof item === 'string') {
            transformations.forEach(({ from, to }) => {
              obj[key][index] = item.replace(from, to);
            });
          } else if (typeof item === 'object') {
            this.applyTransformations(item, transformations);
          }
        });
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        this.applyTransformations(obj[key], transformations);
      }
    }
  }
  
  /**
   * Generates the TypeScript file content for a brand locale
   */
  static generateLocaleFile(brandCode: string, adaptedLocale: SiteCopy): string {
    const capitalizedBrandCode = brandCode.charAt(0).toUpperCase() + brandCode.slice(1);
    
    return `import { SiteCopy } from '../types/siteCopy';

// ${capitalizedBrandCode} brand locale - UI/Site copy
// Auto-generated by Brand Setup tool
const ${brandCode}Strings: SiteCopy = ${JSON.stringify(adaptedLocale, null, 2)};

export default ${brandCode}Strings;`;
  }
  
  /**
   * Generates installation instructions for the new brand locale
   */
  static generateInstallationInstructions(brandName: string, brandCode: string): string {
    return `# ${brandName} Brand Setup Instructions

## Installation Steps

### 1. Site Copy Installation
Save the generated \`${brandCode}.ts\` file to: \`src/locales/${brandCode}.ts\`

### 2. Config Content Installation  
Save the generated \`config_${brandCode}.json\` file to: \`public/locales/config_${brandCode}.json\`

### 3. Update Locale Index
Edit \`src/locales/index.ts\`:

\`\`\`typescript
// Add import
import ${brandCode}Strings from './${brandCode}';

// Update LanguageCode type
export type LanguageCode = 'en' | 'fr' | 'de' | ... | '${brandCode}';

// Update languages object
export const languages: Record<LanguageCode, LanguagePack> = {
  // ... existing languages
  ${brandCode}: ${brandCode}Strings,
};
\`\`\`

### 4. 📝 Add to Brand Dropdown (Semi-Automatic)
The system will provide you with the exact code to add to \`src/components/layout/Header.tsx\`:

**A) Add to brandDisplayNames object:**
\`\`\`typescript
const brandDisplayNames: Record<string, string> = {
  // ... existing brands
  ${brandCode}: "${brandName}",
};
\`\`\`

**B) Add dropdown options in both desktop and mobile sections:**
\`\`\`typescript
<option value="${brandCode}">${brandName}</option>
\`\`\`

### 5. Brand Icon Setup
- Save your brand icon as: \`public/assets/logos/${brandCode}-logo.png\` or \`.jpg\`
- The system will automatically load this logo when the brand locale is selected

### 6. Content Configuration
The system has generated both:
- **Site Copy**: UI text, navigation, page titles (\`${brandCode}.ts\`)
- **Content Data**: Assets, messages, guides (\`config_${brandCode}.json\`)

Both files work together to provide complete brand localization.

### 7. Testing
- Restart your development server
- The new brand should appear in the brand selector dropdown
- Test all sections to ensure proper adaptation
- Both UI text and content should reflect your brand

## File Structure
\`\`\`
src/locales/${brandCode}.ts          # UI/Site copy
public/locales/config_${brandCode}.json  # Content data
src/locales/index.ts                 # Updated with new locale
src/components/layout/Header.tsx     # Updated with dropdown option
\`\`\`

## Notes
- All translations and adaptations can be further customized by editing the generated files
- The config content includes adapted messages, assets, and guides specific to your brand
- Consider adding brand-specific color themes or styling if needed
- For production deployment, ensure all files are properly committed to version control

⚠️  **Important**: The brand will NOT appear in the brand dropdown until you complete step 4 above!

Your ${brandName} brand locale is ready to use!`;
  }

  /**
   * Generates comprehensive messages across all channels and journey stages
   */
  private static generateComprehensiveMessages(options: BrandAdaptationOptions): any[] {
    const { brandName, adaptationPrompt, tone = 'professional' } = options;
    const messages: any[] = [];
    
    // Define journey stages and channels
    const journeyStages = ['LAUNCH', 'GENERATE TEST RIDES', 'IN-STORE', 'FOLLOW-UP', 'WELCOME'];
    const channels = ['Email', 'SMS', 'WhatsApp', 'Facebook', 'Instagram', 'LinkedIn', 'Phone', 'In-Store', 'Print'];
    
    // Generate messages for each stage and channel combination
    journeyStages.forEach((stage, stageIndex) => {
      channels.forEach((channel, channelIndex) => {
        const messageId = `${options.brandCode.toUpperCase()}_${stage.replace(/\s+/g, '_')}_${channel.toUpperCase()}_${String(stageIndex * channels.length + channelIndex + 1).padStart(3, '0')}`;
        
        const message = {
          id: messageId,
          title: this.generateMessageTitle(stage, channel, brandName, adaptationPrompt),
          content: this.generateMessageContent(stage, channel, brandName, adaptationPrompt, tone),
          channel: channel,
          type: stage,
          model: this.getBrandProductName(adaptationPrompt, brandName),
          date: new Date().toISOString().split('T')[0],
          isDemo: false,
          category: this.getMessageCategory(stage, channel)
        };
        
        messages.push(message);
      });
    });
    
    return messages;
  }

  /**
   * Generates comprehensive assets across different types and formats
   */
  private static generateComprehensiveAssets(options: BrandAdaptationOptions): any[] {
    const { brandName, adaptationPrompt } = options;
    const assets: any[] = [];
    
    const assetTypes = ['STATIC', 'VIDEO'];
    const orientations = ['landscape', 'portrait', 'square'];
    const descriptions = ['hero-shot', 'in-action', 'detail-view', 'lifestyle', 'team-photo', 'office-environment'];
    
    let assetId = 1;
    
    assetTypes.forEach(type => {
      orientations.forEach(orientation => {
        descriptions.forEach(description => {
          const asset = {
            id: `${type.toLowerCase()}_${assetId}`,
            title: this.generateAssetTitle(description, brandName, adaptationPrompt),
            phase: "PHASE 1",
            type: type,
            model: this.getBrandProductName(adaptationPrompt, brandName),
            description: description,
            textOverlay: "no-text",
            orientation: orientation,
            dimensions: orientation === 'square' ? "1080x1080" : orientation === 'portrait' ? "1080x1920" : "1920x1080",
            fileExtension: type === 'VIDEO' ? ".mp4" : ".jpg",
            originalFileName: `${options.brandCode}_${assetId}.${type === 'VIDEO' ? 'mp4' : 'jpg'}`,
            newAssetName: `Phase1_${type}_${this.getBrandProductName(adaptationPrompt, brandName).replace(/\s+/g, '')}_${description}_no-text_${orientation}_${orientation === 'square' ? "1080x1080" : orientation === 'portrait' ? "1080x1920" : "1920x1080"}.${type === 'VIDEO' ? 'mp4' : 'jpg'}`,
            thumbnail: `/assets/${type === 'VIDEO' ? 'videos' : 'images'}/${options.brandCode}_${assetId}.${type === 'VIDEO' ? 'mp4' : 'jpg'}`,
            url: `/assets/${type === 'VIDEO' ? 'videos' : 'images'}/${options.brandCode}_${assetId}.${type === 'VIDEO' ? 'mp4' : 'jpg'}`,
            isDemo: true
          };
          
          assets.push(asset);
          assetId++;
        });
      });
    });
    
    return assets;
  }

  /**
   * Generates comprehensive guides for all aspects of the brand journey
   */
  private static generateComprehensiveGuides(options: BrandAdaptationOptions): any[] {
    const { brandName, adaptationPrompt } = options;
    const guides: any[] = [];
    
    const guideTypes = [
      { key: 'launch-strategy', title: 'Launch Communication Strategy', stage: 'LAUNCH' },
      { key: 'engagement-tactics', title: 'Customer Engagement Tactics', stage: 'GENERATE TEST RIDES' },
      { key: 'experience-optimization', title: 'Customer Experience Optimization', stage: 'IN-STORE' },
      { key: 'follow-up-strategies', title: 'Effective Follow-Up Strategies', stage: 'FOLLOW-UP' },
      { key: 'onboarding-process', title: 'Customer Onboarding Process', stage: 'WELCOME' },
      { key: 'content-creation', title: 'Brand Content Creation Guide', stage: 'LAUNCH' },
      { key: 'social-media', title: 'Social Media Marketing Guide', stage: 'GENERATE TEST RIDES' },
      { key: 'customer-service', title: 'Customer Service Excellence Guide', stage: 'IN-STORE' }
    ];
    
    guideTypes.forEach((guideType, index) => {
      const guide = {
        id: `${options.brandCode.toLowerCase()}_${guideType.key}_guide`,
        title: this.adaptGuideTitle(guideType.title, brandName, adaptationPrompt),
        description: this.generateGuideDescription(guideType.title, brandName, adaptationPrompt),
        stage: guideType.stage,
        model: this.getBrandProductName(adaptationPrompt, brandName),
        category: this.getGuideCategory(adaptationPrompt),
        lastUpdated: new Date().toISOString(),
        isDemo: false
      };
      
      guides.push(guide);
    });
    
    return guides;
  }

  /**
   * Generates relevant journey steps for the brand
   */
  private static generateRelevantJourneySteps(options: BrandAdaptationOptions): any[] {
    const { brandName, adaptationPrompt } = options;
    
    if (adaptationPrompt.toLowerCase().includes('sustainability') || adaptationPrompt.toLowerCase().includes('energy')) {
      return [
        { id: "1", title: "Discovery", description: "Understanding sustainability needs and goals", icon: "Search" },
        { id: "2", title: "Assessment", description: "Evaluating current practices and identifying opportunities", icon: "ClipboardList" },
        { id: "3", title: "Implementation", description: "Deploying sustainable solutions and practices", icon: "Wrench" },
        { id: "4", title: "Optimization", description: "Measuring impact and refining approaches", icon: "TrendingUp" },
        { id: "5", title: "Advocacy", description: "Sharing success stories and inspiring others", icon: "Megaphone" }
      ];
    } else if (adaptationPrompt.toLowerCase().includes('technology')) {
      return [
        { id: "1", title: "Exploration", description: "Discovering technology opportunities and needs", icon: "Compass" },
        { id: "2", title: "Demonstration", description: "Testing and validating technology solutions", icon: "Play" },
        { id: "3", title: "Integration", description: "Implementing technology into workflows", icon: "Cpu" },
        { id: "4", title: "Optimization", description: "Fine-tuning and maximizing technology value", icon: "Settings" },
        { id: "5", title: "Innovation", description: "Becoming a technology leader and innovator", icon: "Lightbulb" }
      ];
    } else if (adaptationPrompt.toLowerCase().includes('healthcare')) {
      return [
        { id: "1", title: "Consultation", description: "Initial health assessment and goal setting", icon: "Heart" },
        { id: "2", title: "Planning", description: "Developing personalized health strategies", icon: "Calendar" },
        { id: "3", title: "Treatment", description: "Implementing care plans and interventions", icon: "Activity" },
        { id: "4", title: "Monitoring", description: "Tracking progress and adjusting treatments", icon: "Monitor" },
        { id: "5", title: "Wellness", description: "Maintaining long-term health and wellbeing", icon: "Shield" }
      ];
    } else {
      return [
        { id: "1", title: "Awareness", description: `Introducing customers to ${brandName}`, icon: "Eye" },
        { id: "2", title: "Interest", description: "Building engagement and generating leads", icon: "Heart" },
        { id: "3", title: "Consideration", description: "Evaluating solutions and building trust", icon: "Search" },
        { id: "4", title: "Decision", description: "Converting prospects into customers", icon: "CheckCircle" },
        { id: "5", title: "Loyalty", description: "Building lasting relationships and advocacy", icon: "Users" }
      ];
    }
  }

  /**
   * Generates filter options based on the brand context
   */
  private static generateFilterOptions(options: BrandAdaptationOptions): any {
    const { brandName, adaptationPrompt } = options;
    
    return {
      phases: ["ALL", "PHASE 1", "PHASE 2"],
      types: ["ALL", "STATIC", "VIDEO"],
      models: ["ALL", this.getBrandProductName(adaptationPrompt, brandName)],
      channels: ["ALL", "Digital", "Email", "Facebook", "Instagram", "LinkedIn", "Phone", "Print", "SMS", "Social", "WhatsApp"],
      actionTypes: ["ALL", "LAUNCH", "GENERATE TEST RIDES", "IN-STORE", "FOLLOW-UP", "WELCOME"]
    };
  }

  /**
   * Generates content outline for the brand
   */
  private static generateContentOutline(options: BrandAdaptationOptions): any {
    const { brandName } = options;
    
    const phases = [
      {
        name: "Launch",
        key: "LAUNCH",
        messaging: ["Brand Introduction Email", "Social Media Launch Post", "Press Release"],
        guides: ["Launch Communication Strategy"]
      },
      {
        name: "Engagement",
        key: "GENERATE TEST RIDES",
        messaging: ["Invitation Email", "Follow-up SMS", "Social Media Campaign"],
        guides: ["Customer Engagement Tactics", "Social Media Marketing Guide"]
      },
      {
        name: "Experience",
        key: "IN-STORE",
        messaging: ["Welcome Message", "Feature Highlights", "Service Information"],
        guides: ["Customer Experience Optimization", "Customer Service Excellence Guide"]
      },
      {
        name: "Retention",
        key: "FOLLOW-UP",
        messaging: ["Thank You Email", "Feedback Request", "Special Offers"],
        guides: ["Effective Follow-Up Strategies"]
      },
      {
        name: "Advocacy",
        key: "WELCOME",
        messaging: ["Welcome Package", "Community Invitation", "Referral Program"],
        guides: ["Customer Onboarding Process"]
      }
    ];
    
    return { phases };
  }

  // Helper methods for content generation
  private static generateMessageTitle(stage: string, channel: string, brandName: string, adaptationPrompt: string): string {
    const stageActions: Record<string, string[]> = {
      'LAUNCH': ['Introduction', 'Announcement', 'Welcome'],
      'GENERATE TEST RIDES': ['Invitation', 'Demo', 'Trial'],
      'IN-STORE': ['Welcome', 'Feature', 'Service'],
      'FOLLOW-UP': ['Thank You', 'Feedback', 'Follow-up'],
      'WELCOME': ['Welcome', 'Onboarding', 'Getting Started']
    };
    
    const actions = stageActions[stage] || ['Communication'];
    const action = actions[Math.floor(Math.random() * actions.length)];
    return `${brandName} ${action} ${channel}`;
  }

  private static generateMessageContent(stage: string, channel: string, brandName: string, adaptationPrompt: string, tone: string): string {
    const toneStyles = {
      'professional': 'formal and authoritative',
      'friendly': 'warm and approachable',
      'technical': 'detailed and precise',
      'casual': 'relaxed and conversational'
    };
    
    const baseContent = `Subject: ${brandName} - ${stage.toLowerCase().replace(/_/g, ' ')}\n\nDear Valued Customer,\n\nWe're excited to share news about ${brandName}. `;
    
    if (adaptationPrompt.toLowerCase().includes('sustainability')) {
      return baseContent + `Our commitment to environmental responsibility drives everything we do. Join us in creating a more sustainable future.\n\nBest regards,\nThe ${brandName} Team`;
    } else if (adaptationPrompt.toLowerCase().includes('technology')) {
      return baseContent + `Innovation and cutting-edge technology are at the heart of our solutions. Discover what's possible with ${brandName}.\n\nBest regards,\nThe ${brandName} Team`;
    } else {
      return baseContent + `We're dedicated to providing exceptional value and service. Experience the difference with ${brandName}.\n\nBest regards,\nThe ${brandName} Team`;
    }
  }

  private static generateAssetTitle(description: string, brandName: string, adaptationPrompt: string): string {
    const contextual = adaptationPrompt.toLowerCase().includes('sustainability') ? 'Sustainable' :
                     adaptationPrompt.toLowerCase().includes('technology') ? 'Innovative' : 'Professional';
    
    return `${contextual} ${brandName} ${description.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`;
  }

  private static adaptGuideTitle(originalTitle: string, brandName: string, adaptationPrompt: string): string {
    return originalTitle.replace(/Brand/g, brandName);
  }

  private static generateGuideDescription(title: string, brandName: string, adaptationPrompt: string): string {
    return `Comprehensive guide for ${title.toLowerCase()} specifically designed for ${brandName}.`;
  }

  private static getBrandProductName(adaptationPrompt: string, brandName: string): string {
    if (adaptationPrompt.toLowerCase().includes('sustainability')) {
      return `${brandName} Eco Solutions`;
    } else if (adaptationPrompt.toLowerCase().includes('technology')) {
      return `${brandName} Tech Platform`;
    } else if (adaptationPrompt.toLowerCase().includes('healthcare')) {
      return `${brandName} Health Services`;
    } else {
      return `${brandName} Products`;
    }
  }

  private static getMessageCategory(stage: string, channel: string): string {
    const categories: Record<string, string> = {
      'LAUNCH': 'Brand announcement',
      'GENERATE TEST RIDES': 'Engagement invitation',
      'IN-STORE': 'Experience enhancement',
      'FOLLOW-UP': 'Relationship building',
      'WELCOME': 'Customer onboarding'
    };
    
    return categories[stage] || 'General communication';
  }

  private static getGuideCategory(adaptationPrompt: string): string {
    if (adaptationPrompt.toLowerCase().includes('sustainability')) {
      return 'Sustainability';
    } else if (adaptationPrompt.toLowerCase().includes('technology')) {
      return 'Technology';
    } else if (adaptationPrompt.toLowerCase().includes('healthcare')) {
      return 'Healthcare';
    } else {
      return 'General Business';
    }
  }
}

export default LocaleGenerator; 