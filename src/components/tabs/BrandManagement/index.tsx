import React from "react";
import Button from "../../ui/Button";
import Card from "../../ui/Card";

export default function BrandManagement() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Brand Management</h1>
        <p className="text-gray-600">Manage your brand configurations and assets</p>
      </div>

      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Dynamic Brand Management Disabled</h3>
        <p className="text-gray-500 mb-4">
          Dynamic brand saving to backend storage has been removed. 
          Brands are now managed through static configuration files.
        </p>
        <div className="space-y-2 text-sm text-gray-600 mb-6">
          <p>• Use the <strong>Brand Setup</strong> tab to generate brand files</p>
          <p>• Download generated files and add them manually to the codebase</p>
          <p>• Update the locales index and header dropdown as needed</p>
        </div>
        <div className="space-y-3">
          <Button onClick={() => window.location.href = '/brand-setup'}>
            Go to Brand Setup
          </Button>
          <div className="text-xs text-gray-400">
            Current static brands: BMW, EDF, Knight Frank, Hedosophia, Human Kibble
          </div>
        </div>
      </div>
    </div>
  );
}