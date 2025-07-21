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
  
  // Enhanced Fields
  targetAudienceDescription: string;
  keyBenefits: string[];
  uniqueSellingPoints: string[];
  campaignGoals: string[];
  competitorDifferentiators: string[];
  brandValues: string[];
  productCategories: string[];
}

export interface GeneratedFiles {
  siteCopy: string;
  configContent: string;
}

export class LLMGenerator {
  private static openai: OpenAI | null = null;

  private static initializeOpenAI(): OpenAI {
    if (!this.openai) {
      const apiKey = process.env.OPENAI_API_KEY || import.meta.env.VITE_OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error('OpenAI API key not found. Please set OPENAI_API_KEY or VITE_OPENAI_API_KEY');
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
            content: `You are an expert at generating brand configuration files for a demo toolkit system. You must generate exactly two files: a TypeScript site copy file and a JSON config file. Follow the exact structure and format provided in the examples.`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
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
      // Fetch example files from the public directory
      const [siteCopyResponse, configResponse] = await Promise.all([
        fetch('/locales/en.ts'),
        fetch('/locales/config_en.json')
      ]);

      const siteCopy = await siteCopyResponse.text();
      const configContent = await configResponse.text();

      return { siteCopy, configContent };
    } catch (error) {
      console.error('Error fetching example files:', error);
      // Fallback to hardcoded examples
      return {
        siteCopy: this.getFallbackSiteCopy(),
        configContent: this.getFallbackConfigContent()
      };
    }
  }

  private static buildPrompt(formData: BrandFormData, exampleFiles: { siteCopy: string; configContent: string }): string {
    return `Generate brand configuration files for a demo toolkit system based on the following information:

BRAND INFORMATION:
- Brand Name: ${formData.brandName}
- Brand Code: ${formData.brandCode}
- Industry: ${formData.industry}
- Tone: ${formData.tone}
- Adaptation Instructions: ${formData.adaptationPrompt}

CAMPAIGN CONTEXT:
- Campaign Type: ${formData.campaignType}${formData.customCampaignType ? ` (Custom: ${formData.customCampaignType})` : ''}
- Target Audience: ${formData.targetAudience}${formData.customTargetAudience ? ` (Custom: ${formData.customTargetAudience})` : ''}
- Primary Goal: ${formData.primaryGoal}
- Key Deliverables: ${formData.keyDeliverables.join(', ')}
- Target Audience Description: ${formData.targetAudienceDescription}
- Key Benefits: ${formData.keyBenefits.join(', ')}
- Unique Selling Points: ${formData.uniqueSellingPoints.join(', ')}
- Campaign Goals: ${formData.campaignGoals.join(', ')}
- Competitor Differentiators: ${formData.competitorDifferentiators.join(', ')}
- Brand Values: ${formData.brandValues.join(', ')}
- Product Categories: ${formData.productCategories.join(', ')}

EXAMPLE FILES STRUCTURE:

SITE COPY FILE (TypeScript):
\`\`\`typescript
${exampleFiles.siteCopy}
\`\`\`

CONFIG FILE (JSON):
\`\`\`json
${exampleFiles.configContent}
\`\`\`

INSTRUCTIONS:
1. Generate a TypeScript site copy file that follows the exact structure of the example
2. Generate a JSON config file that follows the exact structure of the example
3. Adapt all content to match the brand information and campaign context provided
4. Ensure all content is relevant to the specific campaign type and target audience
5. Use the brand name, industry, and tone throughout the content
6. Make sure the content reflects the primary goal and key deliverables
7. Generate appropriate journey steps, messages, assets, and guides based on the campaign type
8. Return ONLY the two files in the exact format shown above

Please generate both files now:`;
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