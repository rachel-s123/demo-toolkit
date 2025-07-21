import { SiteCopy } from '../../../types/siteCopy';

export interface BrandAdaptationOptions {
  brandName: string;
  brandCode: string;
  industry: string;
  tone: 'professional' | 'friendly' | 'technical' | 'casual';
  adaptationPrompt: string;
  logoPath?: string;
  
  // Campaign Context
  campaignType: "product-launch" | "internal-training" | "dealer-enablement" | "event-marketing" | "compliance-training" | "custom";
  targetAudience: "external-customers" | "internal-teams" | "partners" | "dealers" | "custom";
  primaryGoal: string;
  keyDeliverables: string[];
  customCampaignType?: string;
  customTargetAudience?: string;
}

export default class LocaleGenerator {
  /**
   * Simplified brand file generation - now primarily a fallback
   * The main generation is handled by LLMGenerator
   */
  static async generateBrandFiles(
    baseSiteCopy: SiteCopy,
    baseConfigContent: any,
    options: BrandAdaptationOptions
  ): Promise<{ siteCopy: string; configContent: string }> {
    // Generate basic adapted site copy
    const adaptedSiteCopy = this.generateBasicSiteCopy(baseSiteCopy, options);
    
    // Generate basic config content
    const adaptedConfig = this.generateBasicConfigContent(baseConfigContent, options);
    
    // Convert to file strings
    const siteCopyFile = this.generateSiteCopyFile(adaptedSiteCopy, options);
    const configContentFile = JSON.stringify(adaptedConfig, null, 2);
    
    return { siteCopy: siteCopyFile, configContent: configContentFile };
  }

  /**
   * Generate basic site copy with minimal adaptations
   */
  private static generateBasicSiteCopy(
    baseSiteCopy: SiteCopy,
    options: BrandAdaptationOptions
  ): SiteCopy {
    const adapted = JSON.parse(JSON.stringify(baseSiteCopy));
    const { brandName, brandCode } = options;
    
    // Basic adaptations
    adapted.home = {
      ...adapted.home,
      mainTitle: `${brandName} Toolkit`,
      mainDescription: `Welcome to ${brandName}'s comprehensive toolkit for ${options.primaryGoal.toLowerCase()}.`,
      welcomeLead: `Welcome to ${brandName}'s toolkit.`,
      helpYouList: [
        `Achieve ${options.primaryGoal.toLowerCase()}`,
        `Streamline your processes`,
        `Improve team performance`,
        `Drive measurable results`
      ],
      journeySteps: {
        launch: { title: "Discovery", description: `Explore ${brandName}'s capabilities` },
        generateTestRides: { title: "Assessment", description: "Evaluate your needs" },
        inStore: { title: "Implementation", description: "Deploy solutions" },
        followUp: { title: "Optimization", description: "Improve performance" },
        welcome: { title: "Mastery", description: "Achieve success" }
      }
    };
    
    // Update navigation
    adapted.navigation = {
      home: "Home",
      assets: "Assets",
      messages: "Messages", 
      guides: "Guides",
      help: "Help"
    };
    
    // Update content sections
    adapted.assets = {
      ...adapted.assets,
      title: `${brandName} Assets`,
      subtitle: "Marketing materials and resources",
      description: "Access your brand assets and marketing materials"
    };
    
    adapted.messages = {
      ...adapted.messages,
      title: `${brandName} Messages`,
      subtitle: "Communication templates",
      description: "Ready-to-use messaging templates"
    };
    
    adapted.guides = {
      ...adapted.guides,
      title: `${brandName} Guides`,
      subtitle: "Implementation guides",
      description: "Step-by-step implementation instructions"
    };
    
    adapted.help = {
      ...adapted.help,
      title: "Help & Support",
      subtitle: "Resources and assistance",
      description: "Get help with the toolkit"
    };
    
    return adapted;
  }

  /**
   * Generate basic config content with minimal adaptations
   */
  private static generateBasicConfigContent(
    baseConfig: any,
    options: BrandAdaptationOptions
  ): any {
    const adapted = { ...baseConfig };
    
    // Update brand information
    adapted.brand = {
      name: options.brandName,
      logo: options.logoPath || `/assets/logos/${options.brandCode}.png`,
      logoAlt: `${options.brandName} Logo`
    };
    
    // Generate basic content
    adapted.messages = this.generateBasicMessages(options);
    adapted.assets = this.generateBasicAssets(options);
    adapted.guides = this.generateBasicGuides(options);
    adapted.journeySteps = this.generateBasicJourneySteps(options);
    
    // Update filter options
    adapted.filterOptions = {
      actionTypes: ["ALL", "LAUNCH", "GENERATE TEST RIDES", "IN-STORE", "FOLLOW-UP", "WELCOME"],
      channels: ["ALL", "Email", "Social Media", "SMS", "Website"],
      models: ["ALL", options.brandName]
    };
    
    return adapted;
  }

  /**
   * Generate basic messages
   */
  private static generateBasicMessages(options: BrandAdaptationOptions): any[] {
    const { brandName, brandCode, primaryGoal } = options;
    
    return [
      {
        id: `${brandCode}_launch_email`,
        title: `${brandName} Launch - Email Campaign`,
        content: `Subject: Welcome to ${brandName}\n\nDear Valued Partner,\n\nWelcome to ${brandName}! We're excited to help you achieve ${primaryGoal.toLowerCase()}.\n\n[Learn More] [Get Started]\n\nBest regards,\nThe ${brandName} Team`,
        channel: "Email",
        stage: "LAUNCH",
        model: brandName,
        tags: ["launch", "email", "welcome"],
        isDemo: false
      },
      {
        id: `${brandCode}_social_post`,
        title: `${brandName} Social Media Post`,
        content: `🚀 Exciting news! ${brandName} is here to help you achieve ${primaryGoal.toLowerCase()}.\n\nDiscover how we can transform your business:\n\n✅ Streamlined processes\n✅ Improved performance\n✅ Measurable results\n\n[Learn More] #${brandName.replace(/\s+/g, '')} #Innovation`,
        channel: "Social Media",
        stage: "LAUNCH",
        model: brandName,
        tags: ["launch", "social", "announcement"],
        isDemo: false
      },
      {
        id: `${brandCode}_newsletter`,
        title: `${brandName} Newsletter`,
        content: `📧 ${brandName} Monthly Newsletter\n\nStay updated with the latest insights and strategies to achieve ${primaryGoal.toLowerCase()}.\n\nThis month's highlights:\n• Industry trends and insights\n• Success stories and case studies\n• Tips and best practices\n• Upcoming events and webinars\n\n[Read More] [Subscribe]`,
        channel: "Email",
        stage: "FOLLOW-UP",
        model: brandName,
        tags: ["newsletter", "email", "engagement"],
        isDemo: false
      },
      {
        id: `${brandCode}_web_content`,
        title: `${brandName} Website Content`,
        content: `Transform Your Business with ${brandName}\n\nDiscover how ${brandName} can help you achieve ${primaryGoal.toLowerCase()} through innovative solutions and proven strategies.\n\nOur comprehensive approach includes:\n• Strategic planning and implementation\n• Performance optimization\n• Continuous improvement\n• Measurable results\n\n[Get Started Today] [Learn More]`,
        channel: "Website",
        stage: "LAUNCH",
        model: brandName,
        tags: ["website", "content", "conversion"],
        isDemo: false
      },
      {
        id: `${brandCode}_press_release`,
        title: `${brandName} Press Release`,
        content: `FOR IMMEDIATE RELEASE\n\n${brandName} Launches Revolutionary Solution to Help Businesses Achieve ${primaryGoal}\n\n[City, Date] - ${brandName} today announced the launch of its comprehensive toolkit designed to help organizations achieve ${primaryGoal.toLowerCase()}.\n\n"Our solution addresses the critical needs of modern businesses," said a company spokesperson. "We're excited to help our clients transform their operations and achieve measurable success."\n\n[Contact Information]`,
        channel: "Press",
        stage: "LAUNCH",
        model: brandName,
        tags: ["press", "announcement", "launch"],
        isDemo: false
      },
      {
        id: `${brandCode}_sales_enablement`,
        title: `${brandName} Sales Enablement`,
        content: `Empower Your Sales Team with ${brandName}\n\nKey talking points for your sales conversations:\n\n🎯 Problem: Organizations struggle to achieve ${primaryGoal.toLowerCase()}\n💡 Solution: ${brandName} provides comprehensive tools and strategies\n✅ Benefits: Streamlined processes, improved efficiency, measurable results\n📊 Proof: Industry-leading success rates and customer satisfaction\n\n[Download Sales Kit] [Schedule Demo]`,
        channel: "Sales",
        stage: "IN-STORE",
        model: brandName,
        tags: ["sales", "enablement", "conversion"],
        isDemo: false
      }
    ];
  }

  /**
   * Generate basic assets
   */
  private static generateBasicAssets(options: BrandAdaptationOptions): any[] {
    const { brandName, brandCode } = options;
    
    return [
      {
        id: `${brandCode}_logo`,
        title: `${brandName} Logo`,
        description: "Official brand logo",
        model: brandName,
        category: "Brand Assets",
        type: "IMAGE",
        tags: ["logo", "brand"],
        channel: "All",
        dateCreated: new Date().toISOString(),
        phase: "LAUNCH",
        orientation: "landscape",
        dimensions: "1920x1080",
        fileExtension: "png",
        thumbnail: `/assets/logos/${brandCode}_thumb.jpg`,
        url: `/assets/logos/${brandCode}.png`,
        isDemo: false
      },
      {
        id: `${brandCode}_social_banner`,
        title: `${brandName} Social Media Banner`,
        description: "Social media header banner",
        model: brandName,
        category: "Social Media",
        type: "IMAGE",
        tags: ["banner", "social", "header"],
        channel: "Social Media",
        dateCreated: new Date().toISOString(),
        phase: "LAUNCH",
        orientation: "landscape",
        dimensions: "1200x630",
        fileExtension: "png",
        thumbnail: `/assets/social/${brandCode}_banner_thumb.jpg`,
        url: `/assets/social/${brandCode}_banner.png`,
        isDemo: false
      },
      {
        id: `${brandCode}_email_header`,
        title: `${brandName} Email Header`,
        description: "Email marketing header image",
        model: brandName,
        category: "Email Marketing",
        type: "IMAGE",
        tags: ["email", "header", "marketing"],
        channel: "Email",
        dateCreated: new Date().toISOString(),
        phase: "LAUNCH",
        orientation: "landscape",
        dimensions: "600x200",
        fileExtension: "png",
        thumbnail: `/assets/email/${brandCode}_header_thumb.jpg`,
        url: `/assets/email/${brandCode}_header.png`,
        isDemo: false
      },
      {
        id: `${brandCode}_infographic`,
        title: `${brandName} Infographic`,
        description: "Educational infographic",
        model: brandName,
        category: "Educational",
        type: "IMAGE",
        tags: ["infographic", "educational", "visual"],
        channel: "All",
        dateCreated: new Date().toISOString(),
        phase: "FOLLOW-UP",
        orientation: "portrait",
        dimensions: "1080x1920",
        fileExtension: "png",
        thumbnail: `/assets/infographics/${brandCode}_infographic_thumb.jpg`,
        url: `/assets/infographics/${brandCode}_infographic.png`,
        isDemo: false
      },
      {
        id: `${brandCode}_brochure`,
        title: `${brandName} Brochure`,
        description: "Print-ready brochure",
        model: brandName,
        category: "Print Materials",
        type: "PDF",
        tags: ["brochure", "print", "marketing"],
        channel: "Print",
        dateCreated: new Date().toISOString(),
        phase: "LAUNCH",
        orientation: "landscape",
        dimensions: "8.5x11",
        fileExtension: "pdf",
        thumbnail: `/assets/print/${brandCode}_brochure_thumb.jpg`,
        url: `/assets/print/${brandCode}_brochure.pdf`,
        isDemo: false
      },
      {
        id: `${brandCode}_video_intro`,
        title: `${brandName} Introduction Video`,
        description: "Brand introduction video",
        model: brandName,
        category: "Video Content",
        type: "VIDEO",
        tags: ["video", "introduction", "brand"],
        channel: "All",
        dateCreated: new Date().toISOString(),
        phase: "LAUNCH",
        orientation: "landscape",
        dimensions: "1920x1080",
        fileExtension: "mp4",
        thumbnail: `/assets/videos/${brandCode}_intro_thumb.jpg`,
        url: `/assets/videos/${brandCode}_intro.mp4`,
        isDemo: false
      }
    ];
  }

  /**
   * Generate basic guides
   */
  private static generateBasicGuides(options: BrandAdaptationOptions): any[] {
    const { brandName, brandCode, primaryGoal } = options;
    
    return [
      {
        id: `${brandCode}_getting_started`,
        title: `${brandName} Getting Started Guide`,
        description: `Complete guide to getting started with ${brandName}`,
        stage: "LAUNCH",
        model: brandName,
        category: "Getting Started",
        sections: [
          {
            title: "Introduction",
            content: `Welcome to ${brandName}! This guide will help you get started.`
          },
          {
            title: "Setup Process",
            content: "Step-by-step setup instructions"
          },
          {
            title: "First Steps",
            content: "Essential first steps to achieve success"
          }
        ],
        estimatedReadTime: "10-15 minutes",
        downloadFormat: "PDF",
        lastUpdated: new Date().toISOString(),
        isDemo: false
      },
      {
        id: `${brandCode}_best_practices`,
        title: `${brandName} Best Practices Guide`,
        description: "Industry best practices and optimization strategies",
        stage: "FOLLOW-UP",
        model: brandName,
        category: "Best Practices",
        sections: [
          {
            title: "Optimization Strategies",
            content: "Learn how to optimize your performance and achieve better results."
          },
          {
            title: "Common Pitfalls",
            content: "Avoid common mistakes and challenges."
          },
          {
            title: "Success Metrics",
            content: "Key metrics to track and measure success."
          }
        ],
        estimatedReadTime: "20-25 minutes",
        downloadFormat: "PDF",
        lastUpdated: new Date().toISOString(),
        isDemo: false
      },
      {
        id: `${brandCode}_campaign_strategy`,
        title: `${brandName} Campaign Strategy Guide`,
        description: "Comprehensive campaign planning and execution",
        stage: "LAUNCH",
        model: brandName,
        category: "Strategy",
        sections: [
          {
            title: "Campaign Planning",
            content: "Strategic approach to campaign development and execution."
          },
          {
            title: "Target Audience",
            content: "How to identify and reach your target audience effectively."
          },
          {
            title: "Measurement & Analytics",
            content: "Track and measure campaign performance and ROI."
          }
        ],
        estimatedReadTime: "30-35 minutes",
        downloadFormat: "PDF",
        lastUpdated: new Date().toISOString(),
        isDemo: false
      },
      {
        id: `${brandCode}_content_creation`,
        title: `${brandName} Content Creation Guide`,
        description: "Guidelines for creating effective marketing content",
        stage: "IN-STORE",
        model: brandName,
        category: "Content Creation",
        sections: [
          {
            title: "Content Strategy",
            content: "Develop a comprehensive content strategy that resonates with your audience."
          },
          {
            title: "Content Types",
            content: "Different types of content and when to use each."
          },
          {
            title: "Brand Voice",
            content: "Maintain consistent brand voice across all content."
          }
        ],
        estimatedReadTime: "25-30 minutes",
        downloadFormat: "PDF",
        lastUpdated: new Date().toISOString(),
        isDemo: false
      },
      {
        id: `${brandCode}_social_media`,
        title: `${brandName} Social Media Guide`,
        description: "Social media marketing strategies and best practices",
        stage: "FOLLOW-UP",
        model: brandName,
        category: "Social Media",
        sections: [
          {
            title: "Platform Strategy",
            content: "Choose the right platforms for your target audience."
          },
          {
            title: "Content Calendar",
            content: "Plan and schedule your social media content effectively."
          },
          {
            title: "Engagement Tactics",
            content: "Build meaningful relationships with your audience."
          }
        ],
        estimatedReadTime: "20-25 minutes",
        downloadFormat: "PDF",
        lastUpdated: new Date().toISOString(),
        isDemo: false
      },
      {
        id: `${brandCode}_analytics_guide`,
        title: `${brandName} Analytics & Reporting Guide`,
        description: "How to measure and report on campaign performance",
        stage: "FOLLOW-UP",
        model: brandName,
        category: "Analytics",
        sections: [
          {
            title: "Key Metrics",
            content: "Identify and track the most important performance indicators."
          },
          {
            title: "Reporting Tools",
            content: "Tools and platforms for effective reporting and analysis."
          },
          {
            title: "Data Interpretation",
            content: "How to interpret data and make informed decisions."
          }
        ],
        estimatedReadTime: "15-20 minutes",
        downloadFormat: "PDF",
        lastUpdated: new Date().toISOString(),
        isDemo: false
      }
    ];
  }

  /**
   * Generate basic journey steps
   */
  private static generateBasicJourneySteps(options: BrandAdaptationOptions): any[] {
    const { brandName } = options;
    
    return [
      {
        id: "1",
        title: "Discovery",
        description: `Explore ${brandName}'s capabilities and solutions`,
        icon: "Rocket"
      },
      {
        id: "2",
        title: "Assessment",
        description: "Evaluate your needs and requirements",
        icon: "Calendar"
      },
      {
        id: "3",
        title: "Implementation",
        description: "Deploy and implement solutions",
        icon: "Store"
      },
      {
        id: "4",
        title: "Optimization",
        description: "Optimize and improve performance",
        icon: "MessageSquare"
      },
      {
        id: "5",
        title: "Mastery",
        description: "Achieve success and mastery",
        icon: "UserPlus"
      }
    ];
  }

  /**
   * Generate installation instructions
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

### 4. Add to Brand Dropdown
Update \`src/components/layout/Header.tsx\`:

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

### 5. Complete Setup
- Restart your development server
- The new brand should appear in the brand selector dropdown
- Test all sections to ensure proper adaptation

## Notes
- All content has been tailored specifically for ${brandName}
- Review and customize the generated content as needed
- Consider adding brand-specific styling if required
`;
  }

  /**
   * Generate the TypeScript file content
   */
  private static generateSiteCopyFile(siteCopy: SiteCopy, options: BrandAdaptationOptions): string {
    return `import { SiteCopy } from '../types/siteCopy';

// ${options.brandName} brand locale - Generated with basic content
const ${options.brandCode}Strings: SiteCopy = ${JSON.stringify(siteCopy, null, 2)};

export default ${options.brandCode}Strings;`;
  }
}