import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from "react";
import { languages, LanguageCode, defaultLang } from "../locales";
import { SiteCopy } from "../types/siteCopy";

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (language: LanguageCode) => void;
  translations: SiteCopy;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    const storedLang = localStorage.getItem("appLanguage") as LanguageCode;
    return storedLang && languages[storedLang] ? storedLang : defaultLang;
  });

  const [translations, setTranslations] = useState<SiteCopy>(languages[language]);

  useEffect(() => {
    // Load site copy from src/locales
    setTranslations(languages[language]);

    localStorage.setItem("appLanguage", language);
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

  return (
    <LanguageContext.Provider value={{ language, setLanguage, translations }}>
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
