import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { TabType } from "../../types";
import { LanguageCode } from "../../locales";
import { useLanguage } from "../../context/LanguageContext";
import { useHighlight } from "../../context/HighlightContext";
import { useConfig } from "../../hooks/useConfig";
import { Menu, X, LogOut } from "lucide-react";

interface HeaderProps {
  activeTab: TabType;
  onLogout?: () => void;
}

// Clean brand display names for dropdown
const brandDisplayNames: Record<string, string> = {
  en: "Brilliant Noise",
  edf: "EDF Energy",
  edf_fr: "EDF Énergie",
  bmw: "BMW Motorrad",
  hedosoph: "Hedosophia",
  humankib: "Human Kibble",
  knightfr: "Knight Frank",
  en_template: "English Template",
};

const Header: React.FC<HeaderProps> = ({ activeTab, onLogout }) => {
  // Add safety checks for context availability
  let language: LanguageCode = 'en';
  let setLanguage = (_lang: LanguageCode) => {};
  let translations: any = {};
  
  try {
    const languageContext = useLanguage();
    language = languageContext.language;
    setLanguage = languageContext.setLanguage;
    translations = languageContext.translations;
  } catch (error) {
    console.warn('Language context not available in Header');
  }
  
  const { isHighlightEnabled } = useHighlight();
  const { config } = useConfig();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);




  // Listen for custom refresh event from BrandSetup
  useEffect(() => {
    const handleRefreshConfig = () => {
      console.log('🔄 Received refreshConfig event, refreshing config...');
      // Force config refresh by triggering a language change
      try {
        const currentLang = language;
        setLanguage('en'); // Temporarily change
        setTimeout(() => {
          setLanguage(currentLang as LanguageCode); // Change back
        }, 100);
      } catch (error) {
        console.warn('Could not refresh config:', error);
      }
    };

    window.addEventListener('refreshConfig', handleRefreshConfig);
    
    return () => {
      window.removeEventListener('refreshConfig', handleRefreshConfig);
    };
  }, [language, setLanguage]);



  // Brand deletion moved to Brand Setup page

  const tabPaths: Record<TabType, string> = {
    HOME: "/",
    ASSETS: "/assets",
    MESSAGES: "/messages",
    GUIDES: "/guides",
    HELP: "/help",
    BRAND_SETUP: "/brand-setup",
  };

  const tabs: TabType[] = [
    "HOME",
    "ASSETS",
    "MESSAGES",
    "GUIDES",
    "HELP",
    "BRAND_SETUP",
  ];

  const getTabLabel = (tab: TabType): string => {
    const navCopy = translations.navigation;
    if (!navCopy) {
      const parts = tab.toLowerCase().split("_");
      return parts
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
    }
    switch (tab) {
      case "HOME":
        return navCopy.homeTab;
      case "ASSETS":
        return navCopy.assetsTab;
      case "MESSAGES":
        return navCopy.messagesTab;
      case "GUIDES":
        return navCopy.guidesTab;
      case "HELP":
        return navCopy.helpTab;
      case "BRAND_SETUP":
        return "Brand Setup"; // Static label for now, could be localized later
      default:
        return "";
    }
  };

  const handleLanguageChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const value = event.target.value;
    console.log(`🔄 Brand change requested: ${language} → ${value}`);
    setLanguage(value as LanguageCode);
    
    // Force a refresh of the config when brand changes
    setTimeout(() => {
      console.log(`🔄 Forcing config refresh for new brand: ${value}`);
      // This will trigger the useConfig hook to refetch
    }, 100);
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo - Left */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center space-x-2">
              <img
                src={config?.brand?.logo || "/assets/logos/brilliant-noise.jpg"}
                alt={
                  config?.brand?.logoAlt ||
                  translations.navigation?.homeTab ||
                  "Brand Logo"
                }
                className="h-16 w-auto max-h-16"
                onError={(e) => {
                  // Fallback to default logo if brand logo fails to load
                  const target = e.target as HTMLImageElement;
                  console.warn(`❌ Logo failed to load: ${target.src}, falling back to default`);
                  if (target.src !== "/assets/logos/brilliant-noise.jpg") {
                    target.src = "/assets/logos/brilliant-noise.jpg";
                  }
                }}
                onLoad={(e) => {
                  const target = e.target as HTMLImageElement;
                  console.log(`✅ Logo loaded successfully: ${target.src}`);
                }}
              />
            </Link>
            {/* Debug info - only show in development */}
            {/* {process.env.NODE_ENV === 'development' && config?.brand?.logo && (
              <div className="text-xs text-gray-500 mt-1">
                Logo: {config.brand.logo}
              </div>
            )} */}
          </div>

          {/* Desktop Controls - Center (hidden on mobile) */}
          <div className="hidden md:flex flex-grow justify-center items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label
                htmlFor="language-select"
                className="text-sm font-medium text-secondary-700"
              >
                Brand:
              </label>
              <select
                id="language-select"
                value={language}
                onChange={handleLanguageChange}
                className="rounded-md border-secondary-300 bg-white px-4 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 h-[38px] min-w-[160px]"
              >
                {/* Static brands */}
                <option value="en">{brandDisplayNames.en}</option>
                <option value="edf">{brandDisplayNames.edf}</option>
                <option value="edf_fr">{brandDisplayNames.edf_fr}</option>
                <option value="bmw">{brandDisplayNames.bmw}</option>
                <option value="hedosoph">{brandDisplayNames.hedosoph}</option>
                <option value="humankib">{brandDisplayNames.humankib}</option>
                <option value="knightfr">{brandDisplayNames.knightfr}</option>
                      
                      
              </select>
              

            </div>
          </div>

          {/* Desktop Navigation - Right (hidden on mobile) */}
          <div className="hidden md:flex flex-shrink-0">
            <nav className="flex space-x-1 items-center">
              {tabs.map((tab) => (
                <Link
                  key={tab}
                  to={tabPaths[tab]}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors
                    ${
                      activeTab === tab
                        ? "bg-primary-100 text-primary-700"
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                >
                  <span
                    style={{ color: isHighlightEnabled ? "green" : "inherit" }}
                  >
                    {getTabLabel(tab)}
                  </span>
                </Link>
              ))}

              {/* Logout Button */}
              {onLogout && (
                <button
                  onClick={handleLogout}
                  className="ml-4 px-3 py-2 rounded-md text-sm font-medium text-secondary-700 hover:bg-red-100 hover:text-red-700 transition-colors flex items-center space-x-1"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              )}
            </nav>
          </div>

          {/* Mobile Menu Buttons - Right (visible on mobile only) */}
          <div className="md:hidden flex items-center space-x-2">
            {/* Logout Button - Mobile */}
            {onLogout && (
              <button
                onClick={handleLogout}
                className="p-2 rounded-md hover:bg-red-100 transition-colors"
                aria-label="Logout"
                title="Logout"
              >
                <LogOut className="h-5 w-5 text-secondary-700" />
              </button>
            )}

            {/* Burger Menu Button - Left of gear */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md hover:bg-secondary-100 transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6 text-secondary-700" />
              ) : (
                <Menu className="h-6 w-6 text-secondary-700" />
              )}
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-secondary-200 py-4 space-y-4">
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <Link
                  key={tab}
                  to={tabPaths[tab]}
                  onClick={closeMobileMenu}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors
                    ${
                      activeTab === tab
                        ? "bg-primary-100 text-primary-700"
                        : "text-secondary-700 hover:bg-secondary-100 hover:text-secondary-900"
                    }`}
                >
                  <span
                    style={{ color: isHighlightEnabled ? "green" : "inherit" }}
                  >
                    {getTabLabel(tab)}
                  </span>
                </Link>
              ))}
            </nav>

            <div className="border-t border-secondary-200 pt-4 space-y-4">
              <div className="flex items-center space-x-3">
                <label
                  htmlFor="mobile-language-select"
                  className="text-sm font-medium text-secondary-700"
                >
                  Brand:
                </label>
                <select
                  id="mobile-language-select"
                  value={language}
                  onChange={handleLanguageChange}
                  className="flex-1 rounded-md border-secondary-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  {/* Static brands */}
                  <option value="en">{brandDisplayNames.en}</option>
                  <option value="edf">{brandDisplayNames.edf}</option>
                  <option value="edf_fr">{brandDisplayNames.edf_fr}</option>
                  <option value="bmw">{brandDisplayNames.bmw}</option>
                  <option value="hedosoph">{brandDisplayNames.hedosoph}</option>
                  <option value="humankib">{brandDisplayNames.humankib}</option>
                  <option value="knightfr">{brandDisplayNames.knightfr}</option>
                  
                  
                </select>
                

              </div>

              {/* Mobile Logout Button */}
              {onLogout && (
                <div className="border-t border-secondary-200 pt-4">
                  <button
                    onClick={() => {
                      handleLogout();
                      closeMobileMenu();
                    }}
                    className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-red-700 hover:bg-red-100 transition-colors"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
