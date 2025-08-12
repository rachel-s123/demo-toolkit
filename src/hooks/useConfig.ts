import React, { useState, useEffect, useCallback } from 'react';
import { Asset, Guide, Message, Brand } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface ConfigData {
  isDemo?: boolean;
  demoNotice?: string;
  brand?: Brand;
  assets: Asset[];
  messages: Message[];
  guides: Guide[];
  journeySteps: Array<{
    id: string;
    title: string;
    description: string;
    icon: string;
  }>;
  filterOptions: {
    phases: string[];
    types: string[];
    models: string[];
    channels: string[];
    actionTypes: string[];
  };
}

interface UseConfigReturn {
  config: ConfigData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useConfig = (): UseConfigReturn => {
  const [config, setConfig] = useState<ConfigData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Get language context with proper error handling
  let language: string = 'en'; // Default fallback
  let languageContext: any = null;
  
  try {
    languageContext = useLanguage();
    if (languageContext && languageContext.language) {
      language = languageContext.language;
    }
  } catch (error) {
    // If context is not available yet, use default language
    console.warn('Language context not available, using default language');
  }

  const fetchConfig = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`🔄 Fetching config for language: ${language}`);
      
      // Check if this is a dynamic brand (not a static locale)
      const { BrandLoader } = await import('../services/brandLoader');
      await BrandLoader.loadBrandsConfig();

      // If KV supplied richer brand objects with file URLs, prefer those
      const possibleBrand = (BrandLoader as any).getBrandConfig(language);

      if (possibleBrand && possibleBrand.files && possibleBrand.files.length > 0) {
        const configFile = possibleBrand.files.find((file: any) => file.type === 'config');
        if (configFile?.url) {
          const bustUrl = `${configFile.url}${configFile.url.includes('?') ? '&' : '?'}t=${Date.now()}`;
          console.log(`📁 Loading config from KV-provided URL: ${bustUrl}`);
          const response = await fetch(bustUrl, { cache: 'no-store' as RequestCache });
          if (!response.ok) throw new Error(`Failed to load brand config: ${response.statusText}`);
          const data = await response.json();
          setConfig(data);
          return;
        }
      }

      const brandConfig = BrandLoader.getBrandConfig(language);
      console.log(`🔍 Brand config for ${language}:`, brandConfig ? 'Found' : 'Not found');
      if (brandConfig) {
        const cfg = brandConfig.files?.find((f: any) => f.type === 'config');
        if (cfg?.url) {
          const bustUrl = `${cfg.url}${cfg.url.includes('?') ? '&' : '?'}t=${Date.now()}`;
          console.log(`📁 Loading config from: ${bustUrl}`);
          const response = await fetch(bustUrl, { cache: 'no-store' as RequestCache });
          if (!response.ok) throw new Error(`Failed to load brand config: ${response.statusText}`);
          const data = await response.json();
          setConfig(data);
          return;
        }
      }
      
      // Fallback to static config for built-in locales
      console.log(`📁 Loading static config for: ${language}`);
      const response = await fetch(`/locales/config_${language}.json`);
      if (!response.ok) {
        throw new Error(`Failed to load config: ${response.statusText}`);
      }
      const data = await response.json();
      console.log(`✅ Loaded static config for ${language}:`, data.brand?.name, 'Logo:', data.brand?.logo);
      setConfig(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load configuration');
      console.error('❌ Error loading config:', err);
    } finally {
      setLoading(false);
    }
  };

  // Memoize fetchConfig to avoid dependency issues
  const memoizedFetchConfig = useCallback(fetchConfig, [language]);

  useEffect(() => {
    // Only fetch config if language context is available and ready
    if (languageContext && languageContext.translations) {
      memoizedFetchConfig();
    } else {
      // If language context is not ready, set loading to false to prevent infinite loading
      setLoading(false);
    }
  }, [language, languageContext, memoizedFetchConfig]);

  return {
    config,
    loading,
    error,
    refetch: memoizedFetchConfig,
  };
}; 