import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { TabType } from "../../types";
import { LanguageCode } from "../../locales";
import { useLanguage } from "../../context/LanguageContext";
import { useHighlight } from "../../context/HighlightContext";
import { useConfig } from "../../hooks/useConfig";
import { BrandLoader, BrandConfig } from "../../services/brandLoader";
import { dynamicLocalesLoader } from "../../services/dynamicLocalesLoader";
import { Menu, X, LogOut, RefreshCw } from "lucide-react";

interface HeaderProps {
  activeTab: TabType;
  onLogout?: () => void;
}

// Fallback brand display names for static brands (when dynamic loading fails)
const fallbackBrandDisplayNames: Record<string, string> = {
  en: "Brilliant Noise",
  edf: "\uD83C\uDDEC\uD83C\uDDE7 EDF Energy",
  edf_fr: "\uD83C\uDDEB\uD83C\uDDF7 EDF \u00C9nergie",
  bmw: "BMW Motorrad",
  hedosoph: "Hedosophia",
  en_template: "English Template",
};

const Header: React.FC<HeaderProps> = ({ activeTab, onLogout }) => {
  // Add safety checks for context availability
  let language: LanguageCode = 'en';
  let setLanguage = (lang: LanguageCode) => {};
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
  const [dynamicBrands, setDynamicBrands] = useState<BrandConfig[]>([]);
  const [isLoadingBrands, setIsLoadingBrands] = useState(true);

  // Load dynamic brands from backend
  const loadDynamicBrands = async () => {
    try {
      setIsLoadingBrands(true);
      console.log('🔄 Loading dynamic brands...');
      
      // Try to load from dynamic locales loader first (for newly uploaded brands)
      try {
        const availableBrandsWithNames = await dynamicLocalesLoader.getAvailableBrandsWithNames();
        console.log('📦 Dynamic locales loader found brands:', availableBrandsWithNames);
        
        if (availableBrandsWithNames.length > 0) {
          // Convert to BrandConfig objects using the proper brand names
          const dynamicBrandConfigs: BrandConfig[] = availableBrandsWithNames.map(({ brandCode, brandName }) => ({
            brandCode,
            brandName: brandName, // Use the actual brand name from the locale
            files: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }));
          
          console.log(`📦 Setting ${dynamicBrandConfigs.length} dynamic brands from locales loader:`, dynamicBrandConfigs);
          setDynamicBrands(dynamicBrandConfigs);
          setIsLoadingBrands(false);
          return;
        }
      } catch (dynamicError) {
        console.warn('Dynamic locales loader failed, falling back to API:', dynamicError);
      }
      
      // Fallback to unified brands endpoint
      const timestamp = Date.now();
      const response = await fetch(`/api/brands?t=${timestamp}`);
      console.log('📡 Brands API response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('📡 Brands API response data:', data);
        
        if (data.success && data.brands) {
          console.log(`📦 Setting ${data.brands.length} dynamic brands from unified API:`, data.brands);
          setDynamicBrands(data.brands);
          console.log(`📦 Header loaded ${data.brands.length} dynamic brands from unified API`);
        } else {
          console.log('📦 No brands found in unified API');
          setDynamicBrands([]);
        }
      } else {
        console.log('📡 Unified brands API failed, falling back to BrandLoader');
        // Fallback to existing BrandLoader if unified API fails
        const brands = await BrandLoader.loadBrandsConfig();
        setDynamicBrands(brands);
        console.log(`📦 Header loaded ${brands.length} dynamic brands from BrandLoader fallback`);
      }
    } catch (error) {
      console.error('Failed to load dynamic brands in Header:', error);
      setDynamicBrands([]);
    } finally {
      setIsLoadingBrands(false);
    }
  };

  useEffect(() => {
    loadDynamicBrands();
  }, []);

  const handleRefreshBrands = async () => {
    console.log('🔄 Refreshing brands...');
    // Clear the dynamic locales cache to force a fresh load
    dynamicLocalesLoader.clearCache();
    await loadDynamicBrands();
  };

  const handleDeleteBrand = async (brandCode: string, brandName: string) => {
    if (!confirm(`Are you sure you want to delete "${brandName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      console.log(`🗑️ Deleting brand ${brandCode}...`);
      
      // Determine the correct API endpoint based on environment
      // Check if we're running on localhost or if we have a local server running
      const isDevelopment = window.location.hostname === 'localhost' || 
                           window.location.hostname === '127.0.0.1' ||
                           window.location.port === '5173'; // Vite dev server port
      
      const apiEndpoint = isDevelopment 
        ? `http://localhost:3001/api/brands/${brandCode}`
        : `/api/delete-brand?brandCode=${brandCode}`;
      
      console.log(`🌍 Environment: ${isDevelopment ? 'local' : 'production'}`);
      console.log(`🌍 Hostname: ${window.location.hostname}`);
      console.log(`🌍 Port: ${window.location.port}`);
      console.log(`🌍 Using API: ${apiEndpoint}`);
      
      // Call the delete API
      let response = await fetch(apiEndpoint, {
        method: 'DELETE'
      });
      
      // If production API fails and we're in development, try local server as fallback
      if (!response.ok && !isDevelopment && window.location.hostname === 'localhost') {
        console.log('🔄 Production API failed, trying local server as fallback...');
        const localEndpoint = `http://localhost:3001/api/brands/${brandCode}`;
        response = await fetch(localEndpoint, {
          method: 'DELETE'
        });
        console.log(`🔄 Local server response: ${response.status}`);
      }
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Brand deleted successfully:', result);
        
        // Force immediate state update by clearing the brands first
        setDynamicBrands([]);
        
        // Wait a moment then refresh the brands list
        setTimeout(async () => {
          console.log('🔄 Refreshing brands after deletion...');
          await loadDynamicBrands();
        }, 100);
        
        // Show success message
        alert(`Brand "${brandName}" has been deleted successfully!`);
      } else {
        let errorMessage = 'Unknown error';
        try {
          const error = await response.json();
          errorMessage = error.error || error.message || 'Unknown error';
        } catch (parseError) {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        console.error('❌ Failed to delete brand:', errorMessage);
        alert(`Failed to delete brand: ${errorMessage}`);
      }
    } catch (error) {
      console.error('❌ Error deleting brand:', error);
      alert('Failed to delete brand. Please try again.');
    }
  };

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
    
    // Check if this is a delete action
    if (value.startsWith('delete-')) {
      const brandCode = value.replace('delete-', '');
      const brand = dynamicBrands.find(b => b.brandCode === brandCode);
      if (brand) {
        handleDeleteBrand(brand.brandCode, brand.brandName);
        // Reset the select to the current language
        event.target.value = language;
        return;
      }
    }
    
    setLanguage(value as LanguageCode);
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
        <div className="flex items-center justify-between h-16">
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
                className="h-12 w-auto"
                onError={(e) => {
                  // Fallback to default logo if brand logo fails to load
                  const target = e.target as HTMLImageElement;
                  if (target.src !== "/assets/logos/brilliant-noise.jpg") {
                    target.src = "/assets/logos/brilliant-noise.jpg";
                  }
                }}
              />
            </Link>
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
                disabled={isLoadingBrands}
              >
                {/* Static brands */}
                <option value="en">{fallbackBrandDisplayNames.en}</option>
                <option value="edf">{fallbackBrandDisplayNames.edf}</option>
                <option value="edf_fr">{fallbackBrandDisplayNames.edf_fr}</option>
                <option value="bmw">{fallbackBrandDisplayNames.bmw}</option>
                <option value="hedosoph">Hedosophia</option>
                
                                      {/* Dynamic brands from backend */}
                      {dynamicBrands.length > 0 && (
                        <>
                          <option disabled>──────────</option>
                          {dynamicBrands.map((brand) => (
                            <option key={brand.brandCode} value={brand.brandCode}>
                              {brand.brandName}
                            </option>
                          ))}
                        </>
                      )}
                      
                      {/* Delete brand options */}
                      {dynamicBrands.length > 0 && (
                        <>
                          <option disabled>──────────</option>
                          {dynamicBrands.map((brand) => (
                            <option key={`delete-${brand.brandCode}`} value={`delete-${brand.brandCode}`} className="text-red-600">
                              🗑️ Delete {brand.brandName}
                            </option>
                          ))}
                        </>
                      )}
              </select>
              
              {/* Refresh brands button */}
              <button
                onClick={handleRefreshBrands}
                disabled={isLoadingBrands}
                className="p-2 rounded-md hover:bg-secondary-100 transition-colors disabled:opacity-50"
                title="Refresh brands"
              >
                <RefreshCw className={`h-4 w-4 text-secondary-700 ${isLoadingBrands ? 'animate-spin' : ''}`} />
              </button>
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
                  disabled={isLoadingBrands}
                >
                  {/* Static brands */}
                  <option value="en">{fallbackBrandDisplayNames.en}</option>
                  <option value="edf">{fallbackBrandDisplayNames.edf}</option>
                  <option value="edf_fr">{fallbackBrandDisplayNames.edf_fr}</option>
                  <option value="bmw">{fallbackBrandDisplayNames.bmw}</option>
                  <option value="hedosoph">Hedosophia</option>
                  
                  {/* Dynamic brands from backend */}
                  {dynamicBrands.length > 0 && (
                    <>
                      <option disabled>──────────</option>
                      {dynamicBrands.map((brand) => (
                        <option key={brand.brandCode} value={brand.brandCode}>
                          {brand.brandName}
                        </option>
                      ))}
                    </>
                  )}
                  
                  {/* Delete brand options */}
                  {dynamicBrands.length > 0 && (
                    <>
                      <option disabled>──────────</option>
                      {dynamicBrands.map((brand) => (
                        <option key={`delete-${brand.brandCode}`} value={`delete-${brand.brandCode}`} className="text-red-600">
                          🗑️ Delete {brand.brandName}
                        </option>
                      ))}
                    </>
                  )}
                </select>
                
                {/* Refresh brands button - Mobile */}
                <button
                  onClick={handleRefreshBrands}
                  disabled={isLoadingBrands}
                  className="p-2 rounded-md hover:bg-secondary-100 transition-colors disabled:opacity-50"
                  title="Refresh brands"
                >
                  <RefreshCw className={`h-5 w-5 text-secondary-700 ${isLoadingBrands ? 'animate-spin' : ''}`} />
                </button>
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
