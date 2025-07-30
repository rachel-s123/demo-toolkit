import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from "react";
import { LanguageCode, defaultLang } from "../locales";
import { SiteCopy } from "../types/siteCopy";
import { BrandLoader } from "../services/brandLoader";

// Dynamic import to allow reloading languages
let languages: Record<LanguageCode, SiteCopy> = {};
let languagesLoaded = false;

async function loadLanguages() {
  if (!languagesLoaded) {
    try {
      // Load static locales from src/locales
      const localesModule = await import("../locales");
      languages = localesModule.languages;
      
      // Load dynamic brands from Vercel Blob Storage
      try {
        const brandsConfig = await BrandLoader.loadBrandsConfig();
        console.log(`📦 Loaded ${brandsConfig.length} brands from backend`);
        
        // Load each brand's locale file
        for (const brandConfig of brandsConfig) {
          const brandLocale = await BrandLoader.loadBrandLocale(brandConfig.brandCode);
          if (brandLocale) {
            languages[brandConfig.brandCode as LanguageCode] = brandLocale;
            console.log(`✅ Added brand: ${brandConfig.brandName} (${brandConfig.brandCode})`);
          }
        }
      } catch (brandError) {
        console.warn("Failed to load dynamic brands:", brandError);
        // Continue with static locales only
      }
      
      languagesLoaded = true;
    } catch (error) {
      console.error("Failed to load languages:", error);
      // Fallback to empty object
      languages = {};
    }
  }
  return languages;
}

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (language: LanguageCode) => void;
  translations: SiteCopy;
  reloadLanguages: () => Promise<void>;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [language, setLanguageState] = useState<LanguageCode>(defaultLang);
  const [translations, setTranslations] = useState<SiteCopy>({} as SiteCopy);
  const [isLoading, setIsLoading] = useState(true);

  // Load languages and set initial language
  useEffect(() => {
    const initializeLanguages = async () => {
      await loadLanguages();
      const storedLang = localStorage.getItem("appLanguage") as LanguageCode;
      const initialLang = storedLang && languages[storedLang] ? storedLang : defaultLang;
      setLanguageState(initialLang);
      setTranslations(languages[initialLang] || {});
      setIsLoading(false);
    };
    
    initializeLanguages();
  }, []);

  // Poll for language updates (for development and production)
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const currentLanguages = await loadLanguages();
        const currentBrandCount = Object.keys(currentLanguages).length;
        
        // Check if current language still exists
        if (language && !currentLanguages[language]) {
          console.log('Current language no longer exists, reloading...');
          await reloadLanguages();
        }
        
        // Check for new brands (if we have more brands than before)
        const previousBrandCount = Object.keys(languages).length;
        if (currentBrandCount > previousBrandCount) {
          console.log(`🆕 New brands detected! Reloading languages...`);
          await reloadLanguages();
        }
      } catch (error) {
        console.warn('Error during language polling:', error);
      }
    }, 3000); // Check every 3 seconds

    return () => clearInterval(interval);
  }, [language]);

  useEffect(() => {
    // Load site copy from src/locales
    if (languages[language]) {
      setTranslations(languages[language]);
      localStorage.setItem("appLanguage", language);
    }
  }, [language]);

  const setLanguage = (langCode: LanguageCode) => {
    if (languages[langCode]) {
      setLanguageState(langCode);
    } else {
      console.warn(
        `Language "${langCode}" not found. Defaulting to "${defaultLang}".`
      );
      setLanguageState(defaultLang);
    }
  };

  const reloadLanguages = async () => {
    setIsLoading(true);
    languagesLoaded = false; // Force reload
    
    // Refresh brand loader cache
    await BrandLoader.refresh();
    
    await loadLanguages();
    // Update current language if it still exists
    if (languages[language]) {
      setTranslations(languages[language]);
    }
    setIsLoading(false);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, translations, reloadLanguages }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

// It's often useful to have a dedicated hook for translations
export const useTranslations = (): SiteCopy => {
  const { translations } = useLanguage();
  return translations;
};
