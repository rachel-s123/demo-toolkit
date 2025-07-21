import OpenAI from 'openai';

export interface BrandFormData {
  // Basic Information
  brandName: string;
  brandCode: string;
  industry: string;
  tone: "professional" | "friendly" | "technical" | "casual";
  adaptationPrompt: string;
  icon?: File;
  logoPath?: string;
  
  // Campaign Context
  campaignType: "product-launch" | "internal-training" | "dealer-enablement" | "event-marketing" | "compliance-training" | "custom";
  targetAudience: "external-customers" | "internal-teams" | "partners" | "dealers" | "custom";
  primaryGoal: string;
  keyDeliverables: string[];
  customCampaignType?: string;
  customTargetAudience?: string;
}

export interface GeneratedFiles {
  siteCopy: string;
  configContent: string;
}

export class LLMGenerator {
  private static openai: OpenAI | null = null;

  private static initializeOpenAI(): OpenAI {
    if (!this.openai) {
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error('OpenAI API key not found. Please set VITE_OPENAI_API_KEY in your .env file');
      }
      this.openai = new OpenAI({
        apiKey,
        dangerouslyAllowBrowser: true // Only for development
      });
    }
    return this.openai;
  }

  static async generateBrandFiles(formData: BrandFormData): Promise<GeneratedFiles> {
    try {
      const openai = this.initializeOpenAI();
      
      // Get example files for training the LLM
      const exampleFiles = await this.getExampleFiles();
      
      const prompt = this.buildPrompt(formData, exampleFiles);
      
      const completion = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          {
            role: "system",
            content: `You are a creative marketing strategist with deep expertise in campaign development. Your role is to CREATE COMPLETELY ORIGINAL, INNOVATIVE CONTENT for real marketing campaigns.

CRITICAL QUANTITY REQUIREMENT:
- GENERATE 6-8 EXAMPLES FOR EACH CONTENT TYPE: You MUST create 6-8 assets, 6-8 messages, and 6-8 guides
- COMPREHENSIVE COVERAGE: Each section should demonstrate different formats, channels, and approaches
- VARIETY IS ESSENTIAL: Include diverse content types, platforms, and campaign phases

CRITICAL TEMPLATE REQUIREMENTS:
- FOLLOW TEMPLATE STRUCTURE EXACTLY: Use en_template.ts and config_en_template.json as the EXACT structure
- CREATE COMPLETELY ORIGINAL CONTENT: Do NOT copy, adapt, or reference ANY content from the template files
- PRESERVE ALL KEYS: Keep ALL object keys, array structures, and nested objects exactly the same
- CHANGE ONLY VALUES: Only modify the content/values, never the keys or structure
- BE SPECIFIC TO THE INDUSTRY: Use industry-specific terminology and concepts
- BE CREATIVE: Think of unique, innovative approaches that would actually work
- BE PRACTICAL: Create content that real marketing teams would find genuinely useful
- MARKETING CAMPAIGN FOCUS: Create EXTERNAL marketing campaign content, not internal communications
- CUSTOMER-FACING: Generate content for reaching customers, prospects, and the public
- NO TEMPLATE WORDS: Never use "retailer", "dealership", "test ride", "motorcycle", "BMW", "R Series" or any template-specific terms

TEMPLATE STRUCTURE IS MANDATORY: The template files show the EXACT structure you must follow. Keep all keys identical, only change the content values to be relevant to the specific campaign.

You must generate exactly two files: a TypeScript site copy file and a JSON config file, following the EXACT template structure but with completely original, creative marketing campaign content values.`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.9,
        max_tokens: 4000
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('No response from OpenAI');
      }

      return this.parseResponse(response);
    } catch (error) {
      console.error('Error generating brand files with LLM:', error);
      throw error;
    }
  }

  private static async getExampleFiles(): Promise<{ siteCopy: string; configContent: string }> {
    try {
      // Fetch template files from the public directory
      const [siteCopyResponse, configResponse] = await Promise.all([
        fetch('/locales/en_template.ts'),
        fetch('/locales/config_en_template.json')
      ]);

      const siteCopy = await siteCopyResponse.text();
      const configContent = await configResponse.text();

      return { siteCopy, configContent };
    } catch (error) {
      console.error('Error fetching template files:', error);
      // Fallback to hardcoded examples
      return {
        siteCopy: this.getFallbackSiteCopy(),
        configContent: this.getFallbackConfigContent()
      };
    }
  }

  private static buildPrompt(formData: BrandFormData, exampleFiles: { siteCopy: string; configContent: string }): string {
    const campaignBrief = `CAMPAIGN BRIEF:
- Brand: ${formData.brandName}
- Industry: ${formData.industry}
- Campaign Type: ${formData.campaignType}${formData.customCampaignType ? ` (Custom: ${formData.customCampaignType})` : ''}
- Target Audience: ${formData.targetAudience}${formData.customTargetAudience ? ` (Custom: ${formData.customTargetAudience})` : ''}
- Primary Goal: ${formData.primaryGoal}
- Key Deliverables: ${formData.keyDeliverables.join(', ')}
- Brand Tone: ${formData.tone}
- Context: ${formData.adaptationPrompt}`;

    const creativeMandate = `CREATIVE MANDATE:
1. **CREATE COMPLETELY ORIGINAL CONTENT**: Do NOT copy, adapt, or reference ANY content from the template files
2. **BE SPECIFIC TO THE INDUSTRY**: Use industry-specific terminology and concepts
3. **BE CREATIVE**: Think of unique, innovative approaches that would actually work for this campaign
4. **BE PRACTICAL**: Create content that real marketing teams would find genuinely useful
5. **MARKETING CAMPAIGN FOCUS**: All assets and messages should be for EXTERNAL marketing campaigns, not internal communications
6. **CUSTOMER-FACING CONTENT**: Create content that marketing teams will use to reach customers, prospects, and the public
7. **NO TEMPLATE CONTENT**: Never use words like "retailer", "dealership", "test ride", "motorcycle", "BMW", "R Series" or any other template-specific terms`;

    const structureRequirements = `CRITICAL TEMPLATE STRUCTURE REQUIREMENTS:

**YOU MUST FOLLOW THE EXACT TEMPLATE STRUCTURE**:
- The TypeScript file MUST follow the EXACT structure of en_template.ts
- The JSON config file MUST follow the EXACT structure of config_en_template.json
- Keep ALL object keys, array structures, and nested objects EXACTLY the same
- Only change the content/values, never the keys or structure

**TYPESCRIPT FILE STRUCTURE**:
- The file MUST export a default object with the EXACT structure: const brandStrings: SiteCopy = { ... }
- Keep ALL home keys: "mainTitle", "welcomeLead", "helpYouIntro", "helpYouList", "quickReferenceIntro", "quickReferenceList", "guidesDescription", "journeyTitle", "journeySubtitle", "journeySteps"
- Keep journeySteps structure: "launch", "generateTestRides", "inStore", "followUp", "welcome"
- Keep ALL other sections: "assets", "messages", "guides", "help", "navigation"
- MUST end with: export default brandStrings;

**EXACT TYPESCRIPT STRUCTURE REQUIREMENTS**:
- "home" object must include: mainTitle, welcomeLead, helpYouIntro, helpYouList, quickReferenceIntro, quickReferenceList, guidesDescription, journeyTitle, journeySubtitle, journeySteps
- "journeySteps" must have exactly 5 steps: launch, generateTestRides, inStore, followUp, welcome
- Each journey step must have: title, description
- "assets" object must include: title, introParagraph1, aboutContentHeading, aboutContentP1, phase1LeadIn, phase1Details, phase2LeadIn, phase2Details, filterHeading
- **CRITICAL**: "phase1Details" and "phase2Details" must be STRINGS, NOT arrays of objects
- "messages" object must include: title, introParagraph1, introParagraph2, filterHeading
- "guides" object must include: title, introParagraph1, introParagraph2, filterHeading, availableGuidesTitle, guideContentTitle, selectGuideMessage
- "help" object must include: title, sections array
- **CRITICAL**: "help.sections[]" must have "heading" and "content" properties, NOT "title" and "description"
- "navigation" object must include: homeTab, assetsTab, messagesTab, guidesTab, helpTab

**JSON CONFIG FILE STRUCTURE**:
- Keep ALL top-level keys: "isDemo", "demoNotice", "lastUpdated", "assets", "contentOutline", "messages", "guides", "filterOptions", "metadata", "lastModified", "pathConfig"
- Keep ALL nested structures exactly the same
- Only change content values to be relevant to this campaign

**CRITICAL CONFIG SECTIONS TO PRESERVE**:
- "assets" array: Keep all asset object keys (id, title, phase, type, model, description, textOverlay, orientation, dimensions, fileExtension, originalFileName, newAssetName, thumbnail, url, isDemo)
- "contentOutline.phases" array: Keep all phase object keys (name, key, messaging, guides)
- "messages" array: Keep all message object keys (id, title, content, channel, type, model, date, isDemo, category)
- "guides" array: Keep all guide object keys (id, title, type, model, thumbnail, url, isDemo, category, contentLastModified, content)
- "filterOptions" object: Keep all filter arrays (phases, types, models, channels, actionTypes)
- "metadata" object: Keep all keys (lastModified, modifiedBy, version, source)
- "pathConfig" object: Keep all environment configurations

**EXACT STRUCTURE REQUIREMENTS**:
- "contentOutline.phases" must have exactly 5 phases: Launch, Generate Test Rides, In-Store, Follow-Up, Welcome
- Each phase must have: name, key, messaging array, guides array
- "filterOptions" must include: phases, types, models, channels, actionTypes arrays
- "metadata" must include: lastModified, modifiedBy, version, source
- "pathConfig" must include: environments object with development, staging, production, cdn

**CRITICAL JSON STRUCTURE RULES**:
- "contentOutline.phases[].messaging" must be an array of STRINGS (message titles), NOT objects
- "contentOutline.phases[].guides" must be an array of STRINGS (guide titles), NOT objects
- "messages" array must contain full message objects with all required keys
- "guides" array must contain full guide objects with all required keys
- Do NOT put message/guide objects inside contentOutline.phases - only put them in the top-level "messages" and "guides" arrays

**CRITICAL TYPESCRIPT STRUCTURE**:
The TypeScript file MUST follow this EXACT pattern:
- Start with: import { SiteCopy } from '../types/siteCopy';
- Define: const brandStrings: SiteCopy = { ... }
- Include ALL required sections: home, assets, messages, guides, help, navigation
- End with: export default brandStrings;

**EXAMPLES OF WHAT TO CHANGE vs WHAT TO KEEP**:

**TYPESCRIPT FILE**:
KEEP THESE KEYS EXACTLY: "mainTitle", "welcomeLead", "helpYouList", "journeySteps", "launch", "title", "description"

CHANGE ONLY THE VALUES:
- "mainTitle": "BMW Motorrad R Series Dealership Toolkit" → "Your Brand Name Toolkit"
- "welcomeLead": "Welcome to your digital toolkit..." → "Welcome to your comprehensive toolkit"
- "helpYouList": ["Engage and nurture leads", ...] → ["Your specific goals", "Your specific benefits"]
- "journeySteps.launch.title": "Launch" → "Your Phase 1"
- "journeySteps.launch.description": "Initial campaign launch..." → "Your phase description"

**CRITICAL TYPESCRIPT STRUCTURE EXAMPLE**:
The TypeScript file MUST follow this EXACT structure:

First code block: typescript
- Start with: import { SiteCopy } from '../types/siteCopy';
- Define: const brandStrings: SiteCopy = { ... }
- Include ALL required sections: home, assets, messages, guides, help, navigation
- "home" must include: mainTitle, welcomeLead, helpYouIntro, helpYouList, quickReferenceIntro, quickReferenceList, guidesDescription, journeyTitle, journeySubtitle, journeySteps
- "journeySteps" must have exactly 5 steps: launch, generateTestRides, inStore, followUp, welcome
- Each journey step must have: title, description
- "assets" must include: title, introParagraph1, aboutContentHeading, aboutContentP1, phase1LeadIn, phase1Details, phase2LeadIn, phase2Details, filterHeading
- "messages" must include: title, introParagraph1, introParagraph2, filterHeading
- "guides" must include: title, introParagraph1, introParagraph2, filterHeading, availableGuidesTitle, guideContentTitle, selectGuideMessage
- "help" must include: title, sections array
- "navigation" must include: homeTab, assetsTab, messagesTab, guidesTab, helpTab
- End with: export default brandStrings;

**CORRECT TYPESCRIPT STRUCTURE EXAMPLE**:
- "phase1Details" and "phase2Details" must be STRINGS, not arrays of objects
- "help.sections[]" must have "heading" and "content" properties, not "title" and "description"
- All other properties must match the SiteCopy interface exactly

**WRONG TYPESCRIPT STRUCTURE - DO NOT DO THIS**:
- Do NOT make phase1Details/phase2Details arrays of objects
- Do NOT use "title" and "description" in help sections (use "heading" and "content")
- Do NOT add or remove any properties from the interface

**JSON CONFIG FILE**:
KEEP THESE KEYS EXACTLY: "isDemo", "demoNotice", "lastUpdated", "assets", "contentOutline", "messages", "guides", "filterOptions", "metadata", "lastModified", "pathConfig"

CHANGE ONLY THE VALUES:
- "demoNotice": "These are demo assets using placeholder images. Replace with actual BMW marketing materials." → "These are demo assets using placeholder images. Replace with actual [Your Brand] marketing materials."
- "assets[].title": "Side On" → "Your Asset Title"
- "assets[].model": "R1300 RS" → "Your Product/Model"
- "messages[].title": "Launch Announcement Email" → "Your Message Title"
- "messages[].content": "Subject: The new BMW R 1300 R..." → "Subject: Your message content..."
- "guides[].title": "Launch Communication Guide" → "Your Guide Title"
- "contentOutline.phases[].name": "Launch" → "Your Phase Name"
- "contentOutline.phases[].key": "LAUNCH" → "YOUR_PHASE_KEY"

**CORRECT JSON STRUCTURE EXAMPLE**:
- "contentOutline.phases[].messaging" must be an array of STRINGS (message titles), NOT objects
- "contentOutline.phases[].guides" must be an array of STRINGS (guide titles), NOT objects
- "messages" array must contain full message objects with all required keys
- "guides" array must contain full guide objects with all required keys
- Do NOT put message/guide objects inside contentOutline.phases - only put them in the top-level "messages" and "guides" arrays

**WRONG STRUCTURE - DO NOT DO THIS**:
- Do NOT put message objects inside contentOutline.phases[].messaging
- Do NOT put guide objects inside contentOutline.phases[].guides
- Do NOT leave "messages" and "guides" arrays empty
- Do NOT create flat structures - use the exact nested structure from the template`;

    const contentRequirements = `**CONTENT QUANTITY REQUIREMENTS**:

**CRITICAL**: You MUST generate 6-8 examples for EACH content type to showcase variety:

**ASSETS SECTION**: Create 6-8 diverse marketing assets:
- Social media graphics (Instagram, Facebook, LinkedIn)
- Digital ads (banner, display, social)
- Email visuals (headers, CTAs)
- Print materials (brochures, flyers)
- Video content (short-form, testimonials)
- Infographics and data visuals

**MESSAGES SECTION**: Create 6-8 marketing copy pieces:
- Social media posts (different platforms)
- Email campaigns (welcome, promotional, newsletter)
- Digital ad copy (search, display, social)
- Website content (landing pages, descriptions)
- Press releases and announcements
- Sales enablement materials

**GUIDES SECTION**: Create 6-8 practical guides:
- Getting started and setup guides
- Campaign strategy and planning
- Content creation best practices
- Social media management
- Analytics and measurement
- Brand voice guidelines`;

    const finalInstructions = `**CRITICAL WARNING - NO TEMPLATE CONTENT**:
- NEVER use words like "retailer", "dealership", "test ride", "motorcycle", "BMW", "R Series", "Boxer engine", "naked bike", "touring", "sport bike" or any other template-specific terms
- NEVER copy phrases, sentences, or concepts from the template files
- CREATE COMPLETELY NEW CONTENT that is relevant to the specific industry and campaign
- The template files are ONLY for structure - ignore all their content completely

**CRITICAL**: Follow the template files EXACTLY. Do not add, remove, or modify any keys. Only change the content values to be relevant to this specific campaign.

**EFFICIENCY NOTE**: Be concise but comprehensive. Focus on quality over quantity while still providing 6-8 diverse examples for each content type.

**CRITICAL STRUCTURE COMPLIANCE**:
- You MUST follow the EXACT structure of both template files
- Do NOT create flat objects or arrays - use the nested structure exactly as shown
- Do NOT add or remove any keys - only change the content values
- The TypeScript file MUST match the SiteCopy interface structure
- The JSON file MUST match the config_en_template.json structure exactly
- **CRITICAL**: "contentOutline.phases" must have exactly 5 phases with the correct structure
- **CRITICAL**: "messages" and "guides" arrays must NOT be empty - populate them with full objects
- **CRITICAL**: "contentOutline.phases[].messaging" and "contentOutline.phases[].guides" must be arrays of STRINGS only
- **CRITICAL**: TypeScript "phase1Details" and "phase2Details" must be STRINGS, not arrays
- **CRITICAL**: TypeScript "help.sections[]" must use "heading" and "content" properties

**OUTPUT FORMAT REQUIREMENTS**:
You MUST provide your response in this EXACT format with two code blocks:

First code block: typescript
- Start with: import { SiteCopy } from '../types/siteCopy';
- Define: const brandStrings: SiteCopy = { ... }
- Include ALL required sections: home, assets, messages, guides, help, navigation
- End with: export default brandStrings;

Second code block: json
- Must follow the exact structure of config_en_template.json
- Keep ALL top-level keys and nested structures
- Only change content values

Generate two files with the EXACT same structure as the templates but with completely original, industry-relevant marketing campaign content values:`;

    return `You are a creative marketing strategist tasked with designing a comprehensive toolkit for a real campaign. Your job is to CREATE ORIGINAL, INNOVATIVE CONTENT - not copy or adapt existing content.

${campaignBrief}

${creativeMandate}

${structureRequirements}

${contentRequirements}

${finalInstructions}`;
  }

  private static parseResponse(response: string): GeneratedFiles {
    try {
      // Extract the TypeScript file
      const tsMatch = response.match(/```typescript\n([\s\S]*?)\n```/);
      const siteCopy = tsMatch ? tsMatch[1].trim() : '';

      // Extract the JSON file
      const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/);
      const configContent = jsonMatch ? jsonMatch[1].trim() : '';

      if (!siteCopy || !configContent) {
        throw new Error('Could not parse response into separate files');
      }

      return { siteCopy, configContent };
    } catch (error) {
      console.error('Error parsing LLM response:', error);
      throw new Error('Failed to parse generated files from LLM response');
    }
  }

  private static getFallbackSiteCopy(): string {
    return `import { SiteCopy } from '../types/siteCopy';

const brandStrings: SiteCopy = {
  "home": {
    "title": "Brand Toolkit",
    "subtitle": "Your comprehensive solution",
    "description": "Welcome to our toolkit",
    "journeySteps": {
      "launch": { "title": "Launch", "description": "Start your journey" },
      "generateTestRides": { "title": "Generate", "description": "Create opportunities" },
      "inStore": { "title": "In Store", "description": "Engage customers" },
      "followUp": { "title": "Follow Up", "description": "Maintain relationships" },
      "welcome": { "title": "Welcome", "description": "Onboard new customers" }
    }
  },
  "assets": {
    "title": "Assets",
    "subtitle": "Marketing materials",
    "description": "Access your brand assets"
  },
  "messages": {
    "title": "Messages",
    "subtitle": "Communication templates",
    "description": "Ready-to-use messaging"
  },
  "guides": {
    "title": "Guides",
    "subtitle": "Implementation guides",
    "description": "Step-by-step instructions"
  },
  "navigation": {
    "home": "Home",
    "assets": "Assets",
    "messages": "Messages",
    "guides": "Guides",
    "help": "Help"
  },
  "help": {
    "title": "Help",
    "subtitle": "Support and resources",
    "description": "Get help with the toolkit"
  }
};

export default brandStrings;`;
  }

  private static getFallbackConfigContent(): string {
    return `{
  "isDemo": true,
  "demoNotice": "This is a demo configuration. Replace with actual brand materials.",
  "brand": {
    "name": "Brand Name",
    "logo": "/assets/logos/brand.png",
    "logoAlt": "Brand Logo"
  },
  "assets": [
    {
      "id": "asset_1",
      "title": "Brand Asset 1",
      "description": "Description of asset",
      "type": "Image",
      "category": "Marketing",
      "url": "/assets/asset1.jpg",
      "tags": ["marketing", "brand"],
      "isDemo": false
    }
  ],
  "messages": [
    {
      "id": "msg_1",
      "title": "Brand Message 1",
      "content": "Message content here",
      "channel": "Email",
      "stage": "LAUNCH",
      "model": "Brand Name",
      "tags": ["launch", "email"],
      "isDemo": false
    }
  ],
  "guides": [
    {
      "id": "guide_1",
      "title": "Brand Guide 1",
      "description": "Guide description",
      "stage": "LAUNCH",
      "model": "Brand Name",
      "category": "Strategy",
      "sections": [
        {
          "title": "Section 1",
          "content": "Section content"
        }
      ],
      "estimatedReadTime": "10 minutes",
      "downloadFormat": "PDF",
      "lastUpdated": "2024-01-01T00:00:00.000Z",
      "metrics": {
        "expectedImpact": "high",
        "implementationTime": "30 days"
      },
      "isDemo": false
    }
  ],
  "journeySteps": [
    {
      "id": "1",
      "title": "Launch",
      "description": "Start your journey",
      "icon": "Rocket"
    },
    {
      "id": "2", 
      "title": "Generate",
      "description": "Create opportunities",
      "icon": "Calendar"
    },
    {
      "id": "3",
      "title": "In Store",
      "description": "Engage customers", 
      "icon": "Store"
    },
    {
      "id": "4",
      "title": "Follow Up",
      "description": "Maintain relationships",
      "icon": "MessageSquare"
    },
    {
      "id": "5",
      "title": "Welcome",
      "description": "Onboard new customers",
      "icon": "UserPlus"
    }
  ],
  "filterOptions": {
    "actionTypes": ["ALL", "LAUNCH", "GENERATE TEST RIDES", "IN-STORE", "FOLLOW-UP", "WELCOME"],
    "channels": ["ALL", "Email", "Social Media", "SMS", "Website"],
    "models": ["ALL", "Brand Name"]
  }
}`;
  }
} 