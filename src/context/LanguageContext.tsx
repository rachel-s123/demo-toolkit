import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from "react";
import { LanguageCode, defaultLang } from "../locales";
import { SiteCopy } from "../types/siteCopy";

// Dynamic import to allow reloading languages
let languages: Record<LanguageCode, SiteCopy> = {};
let languagesLoaded = false;

async function loadLanguages() {
  if (!languagesLoaded) {
    try {
      const localesModule = await import("../locales");
      languages = localesModule.languages;
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

  // Poll for language updates (for development)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const interval = setInterval(async () => {
        const currentLanguages = await loadLanguages();
        // Check if current language still exists
        if (language && !currentLanguages[language]) {
          console.log('Current language no longer exists, reloading...');
          await reloadLanguages();
        }
      }, 2000); // Check every 2 seconds

      return () => clearInterval(interval);
    }
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
