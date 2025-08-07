# Demo Toolkit System

<!-- Deployment trigger: 2025-01-30-build-fix -->

> **Latest Update**: Fixed Vercel build errors by removing unused locales and missing video references - Last updated: 2025-01-30

A comprehensive demo toolkit system designed to create customized demo experiences for new business opportunities. The platform allows you to rapidly generate brand-specific demo toolkits with tailored site copy, messages, guides, and assets for pitching to potential clients across various industries.

## 🎯 What This System Does

This toolkit is designed to help you **create demo toolkits for new business opportunities**. Using the Brand Setup interface, you can:

- **Generate brand-specific demos** for potential clients
- **Create customized content** including messages, guides, and assets
- **Adapt existing templates** to different industries (sustainability, technology, healthcare, etc.)
- **Produce professional demo environments** that showcase your capabilities
- **Streamline the pitch process** with ready-to-use marketing materials

## 🚀 Key Features

### Core Demo Toolkit Functionality

- **AI-Powered Brand Setup**: Advanced LLM integration using OpenAI's GPT-4 for intelligent content generation
- **Automated File Generation**: Creates both TypeScript and JSON files with strict interface compliance
- **Dynamic Content Adaptation**: Automatically adapts messages, guides, and assets for different industries and tones
- **Template-Based System**: Starts with proven templates and customizes for specific brands
- **Professional Demo Environments**: Generates complete demo experiences with consistent branding
- **Multi-Industry Support**: Built-in adaptations for sustainability, technology, healthcare, finance, education, and more
- **Content Diversity**: Generates 6-8 diverse examples for each content type (assets, messages, guides)
- **Campaign Context Integration**: Supports various campaign types and target audiences

### Advanced Capabilities

- **Redis Integration**: Real-time data synchronization with Upstash Redis
- **Timestamp-Based Sync**: Automatic conflict resolution between Redis and local files
- **Localized Content**: Support for multiple languages and regional variations
- **Asset Management**: CSV-based asset importing with duplicate prevention
- **Download Management**: Export generated content in multiple formats

## 🛠 Technology Stack

- **Frontend**: React 18 with TypeScript, Vite, Tailwind CSS
- **Backend**: Express.js API server with TypeScript
- **AI Integration**: OpenAI GPT-4-turbo-preview for intelligent content generation
- **Database**: Upstash Redis for real-time data
- **File Management**: Local file system with automated sync
- **Build Tools**: Vite for development and production builds
- **Styling**: Tailwind CSS with Framer Motion animations
- **Icons**: Lucide React icon library
- **LLM Services**: OpenAI API for brand content generation

## 📋 Prerequisites

- Node.js 18+
- npm or yarn
- Upstash Redis account (for production)

## 🚀 Getting Started

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd demo-toolkit

# Install dependencies
npm install
```

### Environment Setup

Create a `.env` file in the root directory:

```env
# OpenAI API Configuration (Required for LLM-powered content generation)
VITE_OPENAI_API_KEY=your_openai_api_key_here

# Upstash Redis Configuration
KV_REST_API_URL=your_upstash_redis_url
KV_REST_API_TOKEN=your_upstash_redis_token

# API Configuration
API_PORT=3001
# Optional: URL of remote API for production deployments
VITE_API_URL=https://your-api-server.com

# Supabase Auth
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
```

**Note**: Get your OpenAI API key from [OpenAI Platform](https://platform.openai.com/api-keys)

### AI Requirements

The AI-powered brand setup feature requires:

- **OpenAI API Key**: Valid API key with GPT-4-turbo-preview access
- **Internet Connection**: Required for API calls to OpenAI
- **API Credits**: OpenAI charges per token generated (typically $0.01-0.05 per brand setup)
- **Fallback System**: If AI generation fails, the system uses a basic generator

### Development

```bash
# Start frontend only
npm run dev

# Start API server only
npm run api

# Start both frontend and API
npm start
```

The application will be available at:

- Frontend: `http://localhost:5173/` (or next available port)
- API Server: `http://localhost:3001/`

## 🏗 Creating New Brand Demos

### Using the AI-Powered Brand Setup Interface (Recommended)

The Brand Setup tab provides an advanced AI-powered interface for creating comprehensive brand demos using OpenAI's GPT-4. This system automatically generates all necessary files and content based on your specifications.

#### 🎯 How the AI Brand Setup Works

The system uses a sophisticated LLM (Large Language Model) integration that:

1. **Analyzes your brand requirements** using GPT-4-turbo-preview
2. **Generates structured content** following exact template formats
3. **Creates both TypeScript and JSON files** with proper interfaces
4. **Adapts content for your specific industry and tone**
5. **Provides 6-8 diverse examples** for each content type
6. **Ensures strict compliance** with the existing template structure

#### 📋 Step-by-Step Brand Setup Process

##### Step 1: Access Brand Setup
1. Navigate to the **Brand Setup** tab in the application
2. The interface will load with two collapsible sections: "Basic Information" and "Campaign Context"

##### Step 2: Fill in Basic Information
Complete the **Basic Information** section:

- **Brand Name**: Enter your brand name (e.g., "EcoTech Solutions")
- **Brand Code**: Auto-generated from brand name (e.g., "ecotech")
- **Industry**: Select or enter your industry focus
- **Tone**: Choose communication style:
  - `Professional`: Formal and authoritative
  - `Friendly`: Warm and approachable  
  - `Technical`: Detailed and precise
  - `Casual`: Relaxed and conversational
- **Adaptation Instructions**: Provide detailed guidance for content adaptation
  - **CRITICAL**: This field drives the content focus and themes. Be specific about:
    - Brand values and messaging approach
    - Key terminology and language preferences
    - Target audience characteristics
    - Industry-specific requirements
    - Content tone and style preferences
  - **Example**: "Focus on sustainability and renewable energy. Replace motorcycle terminology with eco-friendly solutions. Target environmentally conscious consumers who value innovation and environmental responsibility. Use technical but accessible language. Emphasize cost savings and environmental impact."

##### Step 3: Configure Campaign Context
Complete the **Campaign Context** section:

- **Campaign Type**: Select from predefined options or choose "Custom"
  - `Product Launch`: New product introduction
  - `Internal Training`: Employee education
  - `Dealer Enablement`: Partner training
  - `Event Marketing`: Event-specific campaigns
  - `Compliance Training`: Regulatory education
  - `Custom`: Specify your own campaign type
- **Target Audience**: Choose your primary audience
  - `External Customers`: End consumers
  - `Internal Teams`: Company employees
  - `Partners`: Business partners
  - `Dealers`: Distribution partners
  - `Custom`: Specify your own audience
- **Primary Goal**: Describe your main campaign objective
- **Key Deliverables**: List the main outputs you need
  - **CRITICAL**: This field determines the exact types of content created. Be specific about:
    - Asset types (e.g., "Social media graphics", "Print materials", "Video content")
    - Message formats (e.g., "Email templates", "Social media posts", "SMS messages")
    - Guide types (e.g., "Training materials", "Best practice guides", "Implementation guides")
  - **Examples**: 
    - "Social media graphics, Email templates, Training guides"
    - "Print brochures, Digital ads, Sales scripts, Product guides"
    - "Video content, Social posts, Email campaigns, Compliance materials"

##### Step 4: Upload Brand Assets (Optional)
- **Logo Upload**: Upload your brand logo/icon
  - Supported formats: PNG, JPG, SVG
  - Recommended size: 256x256px
  - System automatically generates correct file paths
  - Logo will be saved to `public/assets/logos/`

##### Step 5: Generate Brand Content
1. **Click "Generate Brand Locale"** to start the AI generation process
2. **Wait for Processing**: The system will:
   - Send your specifications to OpenAI's GPT-4
   - Generate structured TypeScript and JSON content
   - Create 6-8 diverse examples for each content type
   - Ensure strict compliance with template structures
3. **Review Generation Status**: Monitor the progress indicator
4. **Handle Fallback**: If AI generation fails, the system uses a basic generator

##### Step 6: Preview Generated Content
After generation, you can preview three types of content:

1. **Site Copy Preview**: View the generated TypeScript file with UI text
2. **Config Content Preview**: View the generated JSON file with messages, guides, and assets
3. **Installation Instructions**: View step-by-step setup guide

##### Step 7: Download and Install
1. **Download Files**: Click "Download All" to get:
   - `brandcode.ts` - TypeScript locale file
   - `config_brandcode.json` - JSON configuration file
   - `brandcode-setup-instructions.md` - Installation guide
   - Logo installation guide (if logo uploaded)

2. **Install Files**: Follow the generated instructions to:
   - Place files in correct directories
   - Update locale registry
   - Add brand to dropdown menu
   - Test the new brand

#### 🔧 Technical Details

##### AI Generation Process
The system uses a sophisticated prompt engineering approach:

1. **System Prompt**: Defines the AI's role and constraints
2. **User Prompt**: Contains your brand specifications and requirements
3. **Template Structure**: Ensures output follows exact interface requirements
4. **Content Requirements**: Specifies quantity and diversity of examples
5. **Structure Compliance**: Enforces strict adherence to existing templates

##### Prompt Improvements
Recent enhancements ensure the AI focuses on your specific requirements:

**Deliverable-Focused Generation**:
- **Key Deliverables Priority**: The AI now prioritizes creating the exact types of content specified in your Key Deliverables
- **No Generic Content**: Prevents defaulting to generic "landing pages" or "content strategy guides" unless specifically requested
- **Specific Content Types**: If you specify "Social media posts", the AI creates actual social media posts; if "Email templates", it creates email templates

**Adaptation Instructions Integration**:
- **Theme-Driven Content**: Uses your Adaptation Instructions to determine content themes, terminology, and focus areas
- **Brand-Specific Messaging**: Ensures all content aligns with your brand's values and messaging approach
- **Industry-Specific Language**: Applies the terminology and concepts you specify in your Adaptation Instructions

**Content Relevance**:
- **Campaign-Specific**: All content is tailored to your specific campaign objectives and target audience
- **Industry-Appropriate**: Uses language and concepts relevant to your specified industry
- **Tone Consistency**: Maintains your chosen brand tone throughout all generated content

##### Generated File Structure

**TypeScript File (`brandcode.ts`)**:
```typescript
import { SiteCopy } from '../types/siteCopy';

const brandcodeStrings: SiteCopy = {
  home: {
    mainTitle: "Your Brand Name",
    welcomeLead: "Customized welcome message...",
    helpYouList: ["Benefit 1", "Benefit 2", "Benefit 3"],
    // ... all required sections
  },
  assets: {
    title: "Marketing Assets",
    // ... asset-specific content
  },
  messages: {
    title: "Key Messages", 
    // ... message-specific content
  },
  guides: {
    title: "Guides & Strategies",
    // ... guide-specific content
  },
  help: {
    title: "Need Help?",
    sections: [
      {
        heading: "Getting Started",
        content: "Help content..."
      }
      // ... more help sections
    ]
  },
  navigation: {
    homeTab: "Home",
    assetsTab: "Assets",
    // ... navigation labels
  }
};

export default brandcodeStrings;
```

**JSON Config File (`config_brandcode.json`)**:
```json
{
  "isDemo": true,
  "demoNotice": "Custom demo notice...",
  "lastUpdated": "2024-01-01",
  "assets": [
    {
      "id": "1",
      "title": "Generated Asset Title",
      "phase": "Launch",
      "type": "Image",
      "model": "Brand Identity",
      "description": "Detailed asset description...",
      // ... all required asset properties
    }
    // ... 6-8 diverse assets
  ],
  "contentOutline": {
    "phases": [
      {
        "name": "Launch",
        "key": "LAUNCH",
        "messaging": ["Message Title 1", "Message Title 2"],
        "guides": ["Guide Title 1", "Guide Title 2"]
      }
      // ... 5 phases total
    ]
  },
  "messages": [
    {
      "id": "1", 
      "title": "Generated Message Title",
      "content": "Message content...",
      "channel": "Email",
      "type": "Promotional",
      // ... all required message properties
    }
    // ... 6-8 diverse messages
  ],
  "guides": [
    {
      "id": "1",
      "title": "Generated Guide Title", 
      "type": "Document",
      "model": "Strategy",
      // ... all required guide properties
    }
    // ... 6-8 diverse guides
  ],
  "filterOptions": {
    "phases": ["Launch", "Engagement", "Conversion"],
    "types": ["Image", "Video", "Document"],
    // ... filter options
  },
  "metadata": {
    "lastModified": "2024-01-01",
    "modifiedBy": "AI Generator",
    "version": "1.0",
    "source": "AI-Generated"
  },
  "pathConfig": {
    "environments": {
      "development": "/brandcode/deploy/dev",
      "staging": "/brandcode/deploy/staging", 
      "production": "/brandcode/deploy/prod",
      "cdn": "/brandcode/cdn"
    }
  }
}
```

#### 🎨 Content Adaptation Features

The AI system provides sophisticated content adaptation:

**Industry-Specific Adaptations**:
- **Sustainability**: Focuses on environmental impact, green solutions
- **Technology**: Emphasizes innovation, digital transformation
- **Healthcare**: Centers on patient care, wellness, medical solutions
- **Finance**: Highlights security, compliance, financial planning
- **Education**: Focuses on learning, development, knowledge sharing

**Tone Adaptations**:
- **Professional**: Formal language, industry terminology
- **Friendly**: Warm, approachable, conversational
- **Technical**: Precise, detailed, technical specifications
- **Casual**: Relaxed, informal, easy-going

**Content Diversity**:
- **6-8 Assets**: Various types (images, videos, documents)
- **6-8 Messages**: Different channels and purposes
- **6-8 Guides**: Various topics and formats
- **5 Campaign Phases**: Complete customer journey coverage

#### ⚡ Performance and Reliability

**AI Generation Features**:
- **Token Optimization**: Efficient prompt design for cost-effective generation
- **Fallback System**: Basic generator if AI fails
- **Error Handling**: Graceful degradation with user feedback
- **Content Validation**: Ensures generated content meets requirements

**Quality Assurance**:
- **Structure Compliance**: Strict adherence to TypeScript interfaces
- **Content Diversity**: Varied examples across all content types
- **Brand Consistency**: Unified messaging and tone throughout
- **Template Preservation**: Maintains existing system architecture

### Manual Brand Setup Process

If you prefer to set up brands manually or need to understand the backend process:

#### 1. Create Brand Locale File

Create a new TypeScript file in `src/locales/[brandcode].ts`:

```typescript
import { SiteCopy } from '../types/siteCopy';

// YourBrand brand locale - UI/Site copy
const yourbrandStrings: SiteCopy = {
  home: {
    mainTitle: "YourBrand Solutions",
    welcomeLead: "Welcome to YourBrand's comprehensive toolkit",
    helpYouList: [
      "Understand your industry-specific needs",
      "Implement effective solutions",
      "Communicate your value proposition effectively"
    ],
    // ... adapt other sections
  },
  // ... other sections
};

export default yourbrandStrings;
```

#### 2. Create Brand Config File

Create a new JSON file in `public/locales/config_[brandcode].json`:

```json
{
  "isDemo": true,
  "demoNotice": "These are demo assets and content for YourBrand. Replace with actual brand materials.",
  "lastUpdated": "2024-01-01T00:00:00.000Z",
  "brand": {
    "name": "YourBrand",
    "logo": "/assets/logos/yourbrand.png",
    "logoAlt": "YourBrand Logo"
  },
  "assets": [
    // Generated assets specific to your brand
  ],
  "messages": [
    // Generated messages adapted for your industry
  ],
  "guides": [
    // Generated guides tailored to your brand
  ],
  "journeySteps": [
    // Customer journey steps adapted for your industry
  ]
}
```

#### 3. Add Brand Logo

Save your brand logo to `public/assets/logos/[brandcode].png` (or appropriate file extension).

**Logo Specifications:**
- Format: PNG with transparent background preferred
- Size: 256x256px or similar square aspect ratio
- File size: Under 100KB for best performance

#### 4. Register the New Brand

Update `src/locales/index.ts` to include your new brand:

```typescript
import yourbrandStrings from './yourbrand';

export type LanguageCode = 'en' | 'edf' | 'bmw' | 'yourbrand';

export const languages: Record<LanguageCode, SiteCopy> = {
  en: enStrings,
  edf: edfStrings,
  bmw: bmwStrings,
  yourbrand: yourbrandStrings,
};
```

#### 5. Add to Brand Dropdown

Update `src/components/layout/Header.tsx` to include the new brand in the dropdown:

**A) Add to brandDisplayNames object:**
```typescript
const brandDisplayNames: Record<string, string> = {
  en: "Brilliant Noise",
  edf: "🇬🇧 EDF Energy",
  bmw: "BMW Motorrad",
  yourbrand: "YourBrand Solutions",
};
```

**B) Add dropdown options in both desktop and mobile sections:**
```typescript
<option value="yourbrand">YourBrand Solutions</option>
```

#### 6. Test Your Brand

1. Restart your development server
2. Navigate to the brand dropdown
3. Select your new brand
4. Verify all sections display correctly with adapted content

## 🎨 Content Adaptation System

The toolkit includes sophisticated content adaptation capabilities:

### Industry-Specific Adaptations

**Sustainability/Energy Focus:**
- Replaces "motorcycle" with "sustainable solution"
- Adapts "test ride" to "sustainability assessment"
- Changes "dealership" to "green facility"
- Focuses on environmental impact and responsibility

**Technology Focus:**
- Replaces "motorcycle" with "technology solution"
- Adapts "test ride" to "demo session"
- Changes "dealership" to "technology center"
- Emphasizes innovation and digital transformation

**Healthcare Focus:**
- Replaces "motorcycle" with "healthcare solution"
- Adapts "test ride" to "consultation"
- Changes "dealership" to "healthcare facility"
- Focuses on patient care and wellness

### Tone Adaptations

- **Professional**: Formal and authoritative language
- **Friendly**: Warm and approachable communication
- **Technical**: Detailed and precise terminology
- **Casual**: Relaxed and conversational style

### Generated Content Types

The system automatically generates:

1. **Site Copy** (`brandcode.ts`):
   - Navigation labels
   - Page titles and descriptions
   - Welcome messages
   - Help text and instructions
   - Journey step descriptions

2. **Config Content** (`config_brandcode.json`):
   - Brand-specific messages for all channels (Email, SMS, Social Media, etc.)
   - Adapted guides for each customer journey stage
   - Asset metadata tailored to the brand
   - Filter options and content organization

3. **Installation Instructions**:
   - Step-by-step setup guide
   - Code snippets for integration
   - File structure requirements
   - Testing procedures

## 📊 Demo System Features

### Demo Content Management

The system includes comprehensive demo content management:

- **Demo Flags**: Global and individual asset demo indicators
- **Visual Indicators**: Demo badges and notices
- **Demo Filtering**: Show/hide demo content
- **Migration Path**: Gradual replacement of demo with real content

### Demo to Production Workflow

1. **Start with Demo Mode**: `"isDemo": true` globally
2. **Replace Content Gradually**: Mark real assets as `"isDemo": false`
3. **Full Production**: Set `"isDemo": false` globally

## 🔧 Scripts and Utilities

### Available Scripts

```bash
# Development
npm run dev          # Start frontend development server
npm run api          # Start API server
npm start           # Start both frontend and API

# Asset Management
npm run csv-to-config    # Import CSV data to config
npm run rename-assets    # Rename assets to standard convention
npm run remove-duplicates # Remove duplicate assets

# Configuration Management
npm run download-redis-config # Download current Redis configuration

# Build
npm run build       # Build for production
npm run preview     # Preview production build
```

### Brand Setup Automation

The Brand Setup interface handles most of the complexity automatically:

- **File Generation**: Creates both `.ts` and `.json` files
- **Content Adaptation**: Applies industry-specific changes
- **Asset Management**: Handles logo uploads and paths
- **Installation Guides**: Provides step-by-step instructions

## 🎯 Use Cases

### Business Development

- **Client Pitches**: Create branded demo environments for prospective clients
- **Proof of Concepts**: Demonstrate capabilities with client-specific content
- **Industry Targeting**: Adapt messaging for different sectors
- **Rapid Prototyping**: Quickly generate demo experiences

### Marketing Agencies

- **Campaign Previews**: Show clients how campaigns will look
- **Brand Adaptations**: Demonstrate flexibility across different brands
- **Content Strategy**: Visualize messaging across customer journey stages
- **Presentation Tools**: Professional demo environments for client meetings

### Consultants

- **Industry Expertise**: Show understanding of sector-specific needs
- **Solution Demonstrations**: Illustrate how approaches adapt to different contexts
- **Client Onboarding**: Create familiar environments for new clients
- **Capability Showcases**: Demonstrate range of services and expertise

## 🏗 Architecture

### System Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend │    │  Express API    │    │  Upstash Redis  │
│   (Port 5173)    │◄──►│  (Port 3001)    │◄──►│   (Cloud)       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Static Assets  │    │ Locale Configs  │    │ Config Backup   │
│ /public/assets/ │    │/public/locales/ │    │public/config.json│
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Brand File Structure

```
src/locales/
├── index.ts                 # Brand registry
├── en_template.ts          # Base template
├── brandcode.ts            # Generated brand locale
└── ...

public/locales/
├── config_en_template.json # Base config template
├── config_brandcode.json   # Generated brand config
└── ...

public/assets/logos/
├── brandcode.png           # Brand logo
└── ...
```

## 🔒 Security & Privacy

### Multi-Layer Protection

The platform implements comprehensive protection against search engine indexing:

1. **HTML Meta Tags**: `noindex, nofollow, noarchive, nosnippet`
2. **Robots.txt**: Universal crawler blocking
3. **HTTP Headers**: Server-level indexing restrictions
4. **User Authentication**: Supabase-based access control

### Best Practices

- Keep demo environments private and password-protected
- Use non-obvious domain names for demo sites
- Regularly audit access logs
- Implement proper authentication for all demo environments

## 🚀 Deployment

### Environment Variables

```env
# Required for Redis integration
KV_REST_API_URL=your_upstash_redis_url
KV_REST_API_TOKEN=your_upstash_redis_token

# Optional API configuration
API_PORT=3001
VITE_API_URL=https://your-api-server.com

# Supabase Auth
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
```

### Production Setup

1. **Build the application**: `npm run build`
2. **Set environment variables**: Configure Redis credentials
3. **Start API server**: `npm run api`
4. **Serve static files**: Deploy `dist/` folder to web server
5. **Configure proxy**: Route API calls to Express server

### Recommended Deployment

- **Frontend**: Vercel, Netlify, or similar static hosting
- **API**: Railway, Render, or similar Node.js hosting
- **Database**: Upstash Redis (already configured)
- **Assets**: CDN for optimal performance

## 🤝 Contributing

### Development Workflow

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/new-brand-type`
3. **Add new industry adaptations**: Extend the LocaleGenerator
4. **Test thoroughly**: Verify all brand generation works
5. **Update documentation**: Keep README current
6. **Submit pull request**: Include detailed description

### Code Standards

- **TypeScript**: Strict typing for all components
- **ESLint**: Follow configured linting rules
- **Prettier**: Consistent code formatting
- **Component Structure**: Organized by feature/function

## 📝 License

© 2024 Demo Toolkit System. All rights reserved.

## 🆘 Support

For technical support or questions:

1. **Check the Brand Setup tab**: Most issues can be resolved through the UI
2. **Review generated instructions**: Each brand includes detailed setup guides
3. **Verify environment**: Ensure Redis credentials are correct
4. **Test endpoints**: Use health check and API endpoints

### Common Issues

**AI Generation Fails**:
- Verify OpenAI API key is valid and has sufficient credits
- Check internet connection for API calls
- Review browser console for error messages
- System will fall back to basic generator if AI fails

**Generated Content Structure Issues**:
- Ensure adaptation instructions are clear and specific
- Check that industry and tone selections are appropriate
- Review generated content in preview before downloading
- Verify all required fields are filled in the form

**Brand Not Appearing in Dropdown**:
- Verify brand is added to `Header.tsx` brandDisplayNames
- Check that dropdown options are added in both desktop and mobile sections
- Ensure locale is registered in `src/locales/index.ts`

**Content Not Adapting**:
- Check adaptation instructions for specific keywords
- Verify industry-specific adaptations are working
- Review generated content in Brand Setup preview

**Logo Not Loading**:
- Ensure logo is saved to correct path in `public/assets/logos/`
- Check file naming matches brand code
- Verify logo path in config file is correct

**Context Provider Errors**:
- The system includes safety checks for context availability
- If you see "useLanguage must be used within a LanguageProvider" errors, restart the development server
- Check that all provider components are properly wrapped in the component tree

---

_This demo toolkit system enables rapid creation of professional, branded demo environments for business development and client presentations across multiple industries._
