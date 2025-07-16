import React, { useState } from "react";
import { Settings, X } from "lucide-react";
import { useSearchParams } from "react-router-dom";

const EditorLogin: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleCancel = () => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.delete("editor");
    setSearchParams(newSearchParams);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative">
        <button
          onClick={handleCancel}
          className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Cancel"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
            <Settings className="w-8 h-8 text-orange-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Editor Disabled</h1>
          <p className="text-gray-600">Editing is not available in this build.</p>
        </div>
      </div>
    </div>
  );
};

export default EditorLogin;
