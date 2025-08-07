export type TabType = 'HOME' | 'ASSETS' | 'MESSAGES' | 'GUIDES' | 'HELP' | 'BRAND_SETUP';

export type ActionButtonType = 'LAUNCH' | 'GENERATE TEST RIDES' | 'IN-STORE' | 'FOLLOW-UP' | 'WELCOME' | 'FOUNDATION' | 'EXPLORATION' | 'IMPLEMENTATION' | 'OPTIMIZATION' | 'MASTERY';

export type AssetPhase = 'ALL' | 'PHASE 1' | 'PHASE 2';
export type AssetType = 'ALL' | 'STATIC' | 'VIDEO';
// TODO: Consider renaming this type to ProductCategory or AssetCategory for better generalization
export type MotorcycleModel = 'ALL' | 'R1300 R' | 'R1300 RS' | 'R1300 RT';
export type TextOverlay = 'text' | 'no-text';
export type Orientation = 'landscape' | 'portrait' | 'square';

export type MessageChannel = 'Instagram' | 'Facebook' | 'Email' | 'SMS' | 'WhatsApp' | 'Social' | 'Multi' | 'Print' | 'Digital' | 'Phone' | 'In-Store';

export interface Asset {
  id: string;
  title: string;
  phase: Exclude<AssetPhase, 'ALL'>;
  type: Exclude<AssetType, 'ALL'>;
  model: Exclude<MotorcycleModel, 'ALL'>;
  description: string;
  textOverlay: TextOverlay;
  orientation: Orientation;
  dimensions: string;
  fileExtension: string;
  originalFileName: string;
  newAssetName: string;
  thumbnail: string;
  url: string;
  downloadUrl?: string;
  isDemo?: boolean;
  category?: string;
}

export interface Message {
  id: string;
  title: string;
  content: string;
  channel: MessageChannel;
  type: Exclude<ActionButtonType, 'ALL'>;
  model: Exclude<MotorcycleModel, 'ALL'>;
  date: string;
  isDemo?: boolean;
  category?: string;
}

export interface Guide {
  id: string;
  title: string;
  type: Exclude<ActionButtonType, 'ALL'>;
  model: Exclude<MotorcycleModel, 'ALL'>;
  thumbnail: string;
  url: string;
  isDemo?: boolean;
  category?: string;
  description?: string;
  content?: string; // For markdown content or demo content
  contentLastModified?: string; // Timestamp for last content update
  iconName?: string; // To specify a Lucide icon name
}

export interface FilterProps {
  filterOptions: string[];
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  label?: string;
}

export interface JourneyStep {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface FilterOptions {
  phases: string[];
  types: string[];
  models: string[];
  channels: string[];
  actionTypes: string[];
}

export interface Brand {
  name: string;
  logo: string;
  logoAlt: string;
}

export interface ConfigMetadata {
  lastModified: string; // ISO timestamp
  modifiedBy: string; // 'local' | 'redis' | user identifier
  version: number;
  source: 'file' | 'redis';
}

export interface Config {
  metadata?: ConfigMetadata;
  isDemo: boolean;
  demoNotice: string;
  brand?: Brand;
  assets: Asset[];
  messages: Message[];
  guides: Guide[];
  journeySteps: JourneyStep[];
  filterOptions: FilterOptions;
}
export interface BrandAdaptationOptions {
  // Required fields (existing)
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