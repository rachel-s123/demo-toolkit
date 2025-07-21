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

- **Brand Setup Interface**: Create new brand configurations through the UI
- **Dynamic Content Generation**: Automatically adapt messages, guides, and assets for different industries
- **Template-Based System**: Start with proven templates and customize for specific brands
- **Professional Demo Environments**: Generate complete demo experiences with consistent branding
- **Multi-Industry Support**: Built-in adaptations for sustainability, technology, healthcare, and general business

### Advanced Capabilities

- **Redis Integration**: Real-time data synchronization with Upstash Redis
- **Timestamp-Based Sync**: Automatic conflict resolution between Redis and local files
- **Localized Content**: Support for multiple languages and regional variations
- **Asset Management**: CSV-based asset importing with duplicate prevention
- **Download Management**: Export generated content in multiple formats

## 🛠 Technology Stack

- **Frontend**: React 18 with TypeScript, Vite, Tailwind CSS
- **Backend**: Express.js API server with TypeScript
- **Database**: Upstash Redis for real-time data
- **File Management**: Local file system with automated sync
- **Build Tools**: Vite for development and production builds
- **Styling**: Tailwind CSS with Framer Motion animations
- **Icons**: Lucide React icon library

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

### Using the Brand Setup Interface (Recommended)

The Brand Setup tab provides a user-friendly interface for creating new brand demos:

1. **Navigate to Brand Setup** tab in the application
2. **Fill in Brand Information**:
   - Brand Name (e.g., "EcoTech Solutions")
   - Brand Code (auto-generated, e.g., "ecotech")
   - Industry/Focus (e.g., "sustainability", "technology", "healthcare")
   - Communication Tone (professional, friendly, technical, casual)

3. **Upload Brand Assets**:
   - Upload brand logo/icon (PNG recommended, 256x256px)
   - System will automatically generate the correct file path

4. **Provide Adaptation Instructions**:
   - Detailed prompt describing how to adapt content for the brand
   - Example: "Focus on sustainability and renewable energy. Replace motorcycle terminology with eco-friendly solutions. Target environmentally conscious consumers."

5. **Generate Brand Files**:
   - Click "Generate Brand Locale" to create all necessary files
   - System generates both UI text and content data files
   - Preview generated content before downloading

6. **Download Generated Files**:
   - Site Copy file (`brandcode.ts`) - UI text and navigation
   - Config Content file (`config_brandcode.json`) - messages, guides, assets
   - Installation instructions (`brandcode-setup-instructions.md`)
   - Logo installation guide (if logo uploaded)

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

---

_This demo toolkit system enables rapid creation of professional, branded demo environments for business development and client presentations across multiple industries._
