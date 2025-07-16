import { useState } from "react";
import Button from "../../ui/Button";
import Card from "../../ui/Card";
import LocaleGenerator, { BrandAdaptationOptions } from "./LocaleGenerator";
import { useLanguage } from "../../../context/LanguageContext";
import { useConfig } from "../../../hooks/useConfig";
import { languages } from "../../../locales";

export interface BrandFormData {
  brandName: string;
  brandCode: string;
  industry: string;
  tone: "professional" | "friendly" | "technical" | "casual";
  adaptationPrompt: string;
  icon?: File;
  logoPath?: string;
}

interface GeneratedContent {
  siteCopyFile: string;
  configContentFile: string;
  installationInstructions: string;
}

export default function BrandSetup() {
  const { language } = useLanguage();
  const { config } = useConfig();
  const [formData, setFormData] = useState<BrandFormData>({
    brandName: "",
    brandCode: "",
    industry: "",
    tone: "professional",
    adaptationPrompt: "",
    icon: undefined,
    logoPath: "",
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] =
    useState<GeneratedContent | null>(null);
  const [previewType, setPreviewType] = useState<
    "siteCopy" | "configContent" | "instructions"
  >("siteCopy");

  const handleInputChange = (
    field: keyof BrandFormData,
    value: string | File
  ) => {
    if (field === "brandName" && typeof value === "string") {
      // Auto-generate brand code from brand name
      const brandCode = value
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .replace(/\s+/g, "")
        .substring(0, 8);

      setFormData((prev) => ({
        ...prev,
        brandName: value,
        brandCode,
      }));
    } else if (field === "icon" && value instanceof File) {
      // Handle logo file upload
      const logoPath = `/assets/logos/${
        formData.brandCode || "brand"
      }.${value.name.split(".").pop()}`;
      setFormData((prev) => ({
        ...prev,
        icon: value,
        logoPath,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const generateBrandLocale = async () => {
    if (
      !formData.brandName ||
      !formData.brandCode ||
      !formData.adaptationPrompt
    ) {
      alert("Please fill in all required fields");
      return;
    }

    setIsGenerating(true);

    try {
      // Always use template files as base
      const baseSiteCopy = languages.en_template;
      const baseConfigResponse = await fetch(
        "/locales/config_en_template.json"
      );

      if (!baseConfigResponse.ok) {
        throw new Error("Failed to load template config");
      }

      const baseConfigContent = await baseConfigResponse.json();

      // Process logo if provided
      let logoPath = formData.logoPath;
      if (formData.icon) {
        // In a real implementation, you would upload this to your asset server
        // For now, we'll use the planned path
        logoPath = `/assets/logos/${formData.brandCode}.${formData.icon.name
          .split(".")
          .pop()}`;
      }

      // Generate brand files
      const adaptationOptions: BrandAdaptationOptions = {
        brandName: formData.brandName,
        brandCode: formData.brandCode,
        adaptationPrompt: formData.adaptationPrompt,
        industry: formData.industry,
        tone: formData.tone,
        logoPath,
      };

      const generatedFiles = await LocaleGenerator.generateBrandFiles(
        baseSiteCopy,
        baseConfigContent,
        adaptationOptions
      );

      const installationInstructions =
        LocaleGenerator.generateInstallationInstructions(
          formData.brandName,
          formData.brandCode
        );

      setGeneratedContent({
        siteCopyFile: generatedFiles.siteCopy,
        configContentFile: generatedFiles.configContent,
        installationInstructions,
      });

      // Automatically add new brand to dropdown
      await addBrandToDropdown(formData.brandName, formData.brandCode);
    } catch (error) {
      console.error("Error generating brand locale:", error);
      alert("Error generating brand locale. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadFile = (
    content: string,
    filename: string,
    type: string = "text/plain"
  ) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadSiteCopyFile = () => {
    if (generatedContent) {
      downloadFile(
        generatedContent.siteCopyFile,
        `${formData.brandCode}.ts`,
        "text/typescript"
      );
    }
  };

  const downloadConfigFile = () => {
    if (generatedContent) {
      downloadFile(
        generatedContent.configContentFile,
        `config_${formData.brandCode}.json`,
        "application/json"
      );
    }
  };

  const downloadInstructions = () => {
    if (generatedContent) {
      downloadFile(
        generatedContent.installationInstructions,
        `${formData.brandCode}-setup-instructions.md`,
        "text/markdown"
      );
    }
  };

  const downloadAll = () => {
    if (generatedContent) {
      // Create a combined ZIP would be ideal, but for now download separately
      downloadSiteCopyFile();
      setTimeout(() => downloadConfigFile(), 500);
      setTimeout(() => downloadInstructions(), 1000);

      // If there's a logo, create a download instruction for it
      if (formData.icon) {
        setTimeout(() => downloadLogoInstructions(), 1500);
      }
    }
  };

  const downloadLogoInstructions = () => {
    if (formData.icon) {
      const instructions = `# Logo Installation Instructions

Your brand logo should be saved as: ${formData.logoPath}

1. Save your logo file as: \`${formData.brandCode}.${formData.icon.name
        .split(".")
        .pop()}\`
2. Place it in the \`public/assets/logos/\` directory
3. The logo will automatically appear when using the ${
        formData.brandCode
      } locale

Recommended logo specifications:
- Format: PNG with transparent background
- Size: 256x256px or similar square aspect ratio
- File size: Under 100KB for best performance

 Your logo file name: ${formData.icon.name}
 Target path: public/assets/logos/${formData.brandCode}.${formData.icon.name
        .split(".")
        .pop()}
`;

      downloadFile(
        instructions,
        `${formData.brandCode}-logo-instructions.md`,
        "text/markdown"
      );
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Brand Setup</h2>
          <p className="text-gray-600 mb-6">
            Create a new brand locale with customized content. This will
            generate both UI text and content data files that adapt the entire
            application for your brand.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Brand Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Brand Information
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brand Name *
                </label>
                <input
                  type="text"
                  value={formData.brandName}
                  onChange={(e) =>
                    handleInputChange("brandName", e.target.value)
                  }
                  placeholder="e.g., EcoTech Solutions"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brand Code *
                </label>
                <input
                  type="text"
                  value={formData.brandCode}
                  onChange={(e) =>
                    handleInputChange("brandCode", e.target.value)
                  }
                  placeholder="Auto-generated"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Short code for file naming (auto-generated from brand name)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Industry/Focus
                </label>
                <input
                  type="text"
                  value={formData.industry}
                  onChange={(e) =>
                    handleInputChange("industry", e.target.value)
                  }
                  placeholder="e.g., sustainability, technology, healthcare"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Communication Tone
                </label>
                <select
                  value={formData.tone}
                  onChange={(e) => handleInputChange("tone", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="professional">Professional</option>
                  <option value="friendly">Friendly</option>
                  <option value="technical">Technical</option>
                  <option value="casual">Casual</option>
                </select>
              </div>
            </div>

            {/* Adaptation Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Content Adaptation
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brand Icon/Logo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    handleInputChange("icon", e.target.files?.[0] || "")
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Upload your brand icon (recommended: PNG, 256x256px)
                </p>
                {formData.icon && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Logo Preview:
                    </p>
                    <div className="flex items-center space-x-3">
                      <img
                        src={URL.createObjectURL(formData.icon)}
                        alt="Logo preview"
                        className="h-12 w-12 object-contain border border-gray-200 rounded bg-white"
                      />
                      <div className="text-xs text-gray-600">
                        <p>File: {formData.icon.name}</p>
                        <p>Size: {(formData.icon.size / 1024).toFixed(1)} KB</p>
                        <p>Target path: {formData.logoPath}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adaptation Instructions *
                </label>
                <textarea
                  value={formData.adaptationPrompt}
                  onChange={(e) =>
                    handleInputChange("adaptationPrompt", e.target.value)
                  }
                  placeholder="Describe how to adapt content for your brand. E.g., 'Focus on sustainability and renewable energy. Replace motorcycle terminology with eco-friendly solutions. Target environmentally conscious consumers.'"
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Detailed instructions for adapting content, messaging, and
                  terminology
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-center">
            <Button
              onClick={generateBrandLocale}
              disabled={
                isGenerating ||
                !formData.brandName ||
                !formData.brandCode ||
                !formData.adaptationPrompt
              }
              className="px-8 py-3"
            >
              {isGenerating
                ? "Generating Brand Files..."
                : "Generate Brand Locale"}
            </Button>
          </div>
        </div>
      </Card>

      {generatedContent && (
        <Card>
          <div className="p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Generated Brand Files
            </h3>

            <div className="mb-4 flex flex-wrap gap-2">
              <Button
                onClick={() => setPreviewType("siteCopy")}
                variant={previewType === "siteCopy" ? "primary" : "secondary"}
                size="sm"
              >
                Site Copy ({formData.brandCode}.ts)
              </Button>
              <Button
                onClick={() => setPreviewType("configContent")}
                variant={
                  previewType === "configContent" ? "primary" : "secondary"
                }
                size="sm"
              >
                Config Content (config_{formData.brandCode}.json)
              </Button>
              <Button
                onClick={() => setPreviewType("instructions")}
                variant={
                  previewType === "instructions" ? "primary" : "secondary"
                }
                size="sm"
              >
                Installation Instructions
              </Button>
            </div>

            <div
              className="bg-gray-50 rounded-lg p-4 mb-4"
              style={{ maxHeight: "400px", overflow: "auto" }}
            >
              <pre className="text-sm text-gray-800 whitespace-pre-wrap">
                {previewType === "siteCopy" && generatedContent.siteCopyFile}
                {previewType === "configContent" &&
                  generatedContent.configContentFile}
                {previewType === "instructions" &&
                  generatedContent.installationInstructions}
              </pre>
            </div>

            <div className="flex flex-wrap gap-3 justify-center">
              <Button onClick={downloadSiteCopyFile} variant="secondary">
                Download Site Copy (.ts)
              </Button>
              <Button onClick={downloadConfigFile} variant="secondary">
                Download Config Content (.json)
              </Button>
              <Button onClick={downloadInstructions} variant="secondary">
                Download Instructions (.md)
              </Button>
              <Button onClick={downloadAll} variant="primary">
                Download All Files
              </Button>
            </div>

            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Next Steps:</strong> Follow the installation
                instructions to integrate these files into your project. Both
                the site copy and config content files work together to provide
                complete brand localization.
              </p>
            </div>

            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                <strong>✅ Ready to Install:</strong> Your brand files are
                ready! The system will guide you through adding the brand to the
                dropdown. Check the browser console for the exact code snippets
                to copy.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Current Brand Display */}
      <Card>
        <div className="p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Current Brand Configuration
          </h3>

          {config?.brand ? (
            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <img
                src={config.brand.logo}
                alt={config.brand.logoAlt}
                className="h-16 w-auto object-contain border border-gray-200 rounded bg-white p-2"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                }}
              />
              <div>
                <h4 className="text-lg font-medium text-gray-900">
                  {config.brand.name}
                </h4>
                <p className="text-sm text-gray-600">
                  Logo: {config.brand.logo}
                </p>
                <p className="text-sm text-gray-600">
                  Language: {language.toUpperCase()}
                </p>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-yellow-50 rounded-lg">
              <p className="text-yellow-800">
                No brand configuration found for the current locale. Use the
                form above to create a new brand configuration.
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

// Helper function to automatically add brand to dropdown
async function addBrandToDropdown(
  brandName: string,
  brandCode: string
): Promise<void> {
  try {
    // Note: In a real implementation, this would require a backend service
    // to modify files. For now, we'll just log the required changes.
    console.log(`✅ Brand Generated Successfully!
    
To complete setup, add to Header.tsx brandDisplayNames:
${brandCode}: "${brandName}",

And add dropdown options:
<option value="${brandCode}">${brandName}</option>

The brand files have been generated and can be downloaded above.`);
  } catch (error) {
    console.warn("Note: Manual dropdown setup required:", error);
  }
}
