import React from "react";
// import React, { useState } from "react"; // This line should be removed or commented if useState is not used
import Header from "./Header";
import { TabType } from "../../types";
import Home from "../tabs/Home";
import Assets from "../tabs/Assets";
import Messages from "../tabs/Messages";
import Guides from "../tabs/Guides";
import Help from "../tabs/Help";
import BrandSetup from "../tabs/BrandSetup";
import { AnimatePresence, motion } from "framer-motion";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useConfig } from '../../hooks/useConfig';

interface LayoutProps {
  onLogout?: () => void;
}

const Layout: React.FC<LayoutProps> = ({ onLogout }) => {
  const location = useLocation();
  useAuth();
  const { config } = useConfig();

  // Removed session validation useEffect. Rely on useAuth for session management.

  // Determine activeTab from location.pathname for Header
  // This logic might need refinement based on your exact paths and Header needs
  let currentTab: TabType = "HOME";
  if (location.pathname.startsWith("/assets")) {
    currentTab = "ASSETS";
  } else if (location.pathname.startsWith("/messages")) {
    currentTab = "MESSAGES";
  } else if (location.pathname.startsWith("/guides")) {
    currentTab = "GUIDES";
  } else if (location.pathname.startsWith("/help")) {
    currentTab = "HELP";
  } else if (location.pathname.startsWith("/brand-setup")) {
    currentTab = "BRAND_SETUP";
  } else if (location.pathname === "/") {
    currentTab = "HOME";
  }

  return (
    <div className="flex min-h-screen flex-col bg-secondary-50">
      <Header activeTab={currentTab} onLogout={onLogout} />
      <main className="container mx-auto flex-1 px-4 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/assets" element={<Assets />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/guides" element={<Guides />} />
              <Route path="/help" element={<Help />} />
              <Route path="/brand-setup" element={<BrandSetup />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>
      <footer className="bg-secondary-800 py-4 text-center text-white">
        <p className="text-sm">
          © {new Date().getFullYear()} {config?.brand?.name || 'BMW Motorrad'}. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default Layout;
