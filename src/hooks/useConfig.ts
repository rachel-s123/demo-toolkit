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
      
      // Check if this is a dynamic brand (not a static locale)
      const { BrandLoader } = await import('../services/brandLoader');
      const brandConfig = BrandLoader.getBrandConfig(language);
      
      if (brandConfig) {
        // This is a dynamic brand - load from blob storage
        const configFile = brandConfig.files.find(file => file.type === 'config');
        if (configFile) {
          const response = await fetch(configFile.url);
          if (!response.ok) {
            throw new Error(`Failed to load brand config: ${response.statusText}`);
          }
          const data = await response.json();
          setConfig(data);
          return;
        }
      }
      
      // Fallback to static config for built-in locales
      const response = await fetch(`/locales/config_${language}.json`);
      if (!response.ok) {
        throw new Error(`Failed to load config: ${response.statusText}`);
      }
      const data = await response.json();
      setConfig(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load configuration');
      console.error('Error loading config:', err);
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