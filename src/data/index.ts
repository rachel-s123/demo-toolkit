import { Asset, Guide, Message } from '../types';

// Legacy exports - these are now loaded dynamically from config.json
// These are kept for backward compatibility but will be empty arrays
export const ASSETS: Asset[] = [];
export const MESSAGES: Message[] = [];
export const GUIDES: Guide[] = [];
export const JOURNEY_STEPS: Array<{
  id: string;
  title: string;
  description: string;
  icon: string;
}> = [];

// For components that still need the old data structure, 
// they should use the useConfig hook instead