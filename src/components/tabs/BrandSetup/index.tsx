import { useState } from "react";
import Button from "../../ui/Button";
import Card from "../../ui/Card";
import LocaleGenerator, { BrandAdaptationOptions } from "./LocaleGenerator";
import { useLanguage } from "../../../context/LanguageContext";
import { useConfig } from "../../../hooks/useConfig";
import { languages } from "../../../locales";
import { Plus, X, ChevronDown, ChevronUp } from "lucide-react";

export interface BrandFormData {
  // Basic Information
  brandName: string;
  brandCode: string;
  industry: string;
  tone: "professional" | "friendly" | "technical" | "casual";
  adaptationPrompt: string;
  icon?: File;
  logoPath?: string;
  
  // Campaign Context (NEW)
  campaignType: "product-launch" | "internal-training" | "dealer-enablement" | "event-marketing" | "compliance-training" | "custom";
  targetAudience: "external-customers" | "internal-teams" | "partners" | "dealers" | "custom";
  primaryGoal: string;
  keyDeliverables: string[];
  customCampaignType?: string;
  customTargetAudience?: string;
  
  // Enhanced Fields
  targetAudienceDescription: string;
  keyBenefits: string[];
  uniqueSellingPoints: string[];
  campaignGoals: string[];
  competitorDifferentiators: string[];
  brandValues: string[];
  productCategories: string[];
}

interface GeneratedContent {
  siteCopyFile: string;
  configContentFile: string;
  installationInstructions: string;
}

// ArrayInput component moved outside to prevent recreation on every render
const ArrayInput = ({ 
  label, 
  field, 
  placeholder, 
  helpText,
  values,
  onArrayInputChange,
  onAddItem,
  onRemoveItem
}: { 
  label: string; 
  field: keyof BrandFormData; 
  placeholder: string;
  helpText?: string;
  values: string[];
  onArrayInputChange: (field: keyof BrandFormData, index: number, value: string) => void;
  onAddItem: (field: keyof BrandFormData) => void;
  onRemoveItem: (field: keyof BrandFormData, index: number) => void;
}) => {
  // Add null check for values
  const safeValues = values || [""];
  
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      {helpText && <p className="text-xs text-gray-500">{helpText}</p>}
      {safeValues.map((value, index) => (
        <div key={`${field}-${index}`} className="flex gap-2">
          <input
            type="text"
            value={value}
            onChange={(e) => onArrayInputChange(field, index, e.target.value)}
            placeholder={placeholder}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {safeValues.length > 1 && (
            <button
              onClick={() => onRemoveItem(field, index)}
              className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      ))}
      <button
        onClick={() => onAddItem(field)}
        className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg"
      >
        <Plus className="w-4 h-4" />
        Add {label.slice(0, -1)}
      </button>
    </div>
  );
};

// CollapsibleSection component moved outside to prevent recreation on every render
const CollapsibleSection = ({ 
  title, 
  section, 
  children,
  expandedSections,
  onToggleSection
}: { 
  title: string; 
  section: string; 
  children: React.ReactNode;
  expandedSections: Record<string, boolean>;
  onToggleSection: (section: string) => void;
}) => (
  <div className="border border-gray-200 rounded-lg overflow-hidden">
    <button
      onClick={() => onToggleSection(section)}
      className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 flex items-center justify-between text-left"
    >
      <span className="font-medium text-gray-900">{title}</span>
      {expandedSections[section] ? (
        <ChevronUp className="w-5 h-5 text-gray-500" />
      ) : (
        <ChevronDown className="w-5 h-5 text-gray-500" />
      )}
    </button>
    {expandedSections[section] && (
      <div className="p-4 space-y-4">
        {children}
      </div>
    )}
  </div>
);

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
    campaignType: "custom",
    targetAudience: "custom",
    primaryGoal: "",
    keyDeliverables: [""],
    customCampaignType: "",
    customTargetAudience: "",
    targetAudienceDescription: "",
    keyBenefits: [""],
    uniqueSellingPoints: [""],
    campaignGoals: [""],
    competitorDifferentiators: [""],
    brandValues: [""],
    productCategories: [""]
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [previewType, setPreviewType] = useState<"siteCopy" | "configContent" | "instructions">("siteCopy");
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    basic: true,
    "campaign-context": true,
    audience: false,
    benefits: false,
    campaign: false,
    brand: false
  });

  const handleInputChange = (field: keyof BrandFormData, value: string | File) => {
    if (field === "brandName" && typeof value === "string") {
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
      const logoPath = `/assets/logos/${formData.brandCode || "brand"}.${value.name.split(".").pop()}`;
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

  const handleArrayInputChange = (field: keyof BrandFormData, index: number, value: string) => {
    const array = (formData[field] as string[]) || [""];
    const newArray = [...array];
    newArray[index] = value;
    setFormData((prev) => ({
      ...prev,
      [field]: newArray,
    }));
  };

  const addArrayItem = (field: keyof BrandFormData) => {
    const array = (formData[field] as string[]) || [""];
    setFormData((prev) => ({
      ...prev,
      [field]: [...array, ""],
    }));
  };

  const removeArrayItem = (field: keyof BrandFormData, index: number) => {
    const array = (formData[field] as string[]) || [""];
    const newArray = array.filter((_, i) => i !== index);
    setFormData((prev) => ({
      ...prev,
      [field]: newArray.length > 0 ? newArray : [""],
    }));
  };

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const generateBrandLocale = async () => {
    console.log("Generate button clicked");
    console.log("Form data:", formData);
    
    if (!formData.brandName || !formData.brandCode || !formData.adaptationPrompt || !formData.primaryGoal) {
      alert("Please fill in all required fields (Brand Name, Brand Code, Adaptation Instructions, and Primary Goal)");
      return;
    }

    console.log("Validation passed, starting generation...");
    setIsGenerating(true);

    try {
      console.log("Getting base site copy...");
      const baseSiteCopy = languages.en_template;
      console.log("Base site copy loaded:", baseSiteCopy);
      
      console.log("Fetching config template...");
      const baseConfigResponse = await fetch("/locales/config_en_template.json");

      if (!baseConfigResponse.ok) {
        console.error("Failed to load template config:", baseConfigResponse.status, baseConfigResponse.statusText);
        throw new Error("Failed to load template config");
      }

      console.log("Config template fetched successfully");
      const baseConfigContent = await baseConfigResponse.json();
      console.log("Base config content:", baseConfigContent);

      let logoPath = formData.logoPath;
      if (formData.icon) {
        logoPath = `/assets/logos/${formData.brandCode}.${formData.icon.name.split(".").pop()}`;
      }

      // Clean up empty array items
      const cleanArrayField = (arr: string[]) => arr.filter(item => item.trim() !== "");

      console.log("Creating adaptation options...");
      const adaptationOptions: BrandAdaptationOptions = {
        brandName: formData.brandName,
        brandCode: formData.brandCode,
        adaptationPrompt: formData.adaptationPrompt,
        industry: formData.industry,
        tone: formData.tone,
        logoPath,
        
        // Campaign Context (NEW)
        campaignType: formData.campaignType,
        targetAudience: formData.targetAudience,
        primaryGoal: formData.primaryGoal,
        keyDeliverables: cleanArrayField(formData.keyDeliverables),
        customCampaignType: formData.customCampaignType,
        customTargetAudience: formData.customTargetAudience,
        
        // Enhanced options
        targetAudienceDescription: formData.targetAudienceDescription,
        keyBenefits: cleanArrayField(formData.keyBenefits),
        uniqueSellingPoints: cleanArrayField(formData.uniqueSellingPoints),
        campaignGoals: cleanArrayField(formData.campaignGoals),
        competitorDifferentiators: cleanArrayField(formData.competitorDifferentiators),
        brandValues: cleanArrayField(formData.brandValues),
        productCategories: cleanArrayField(formData.productCategories)
      };

      console.log("Calling LocaleGenerator.generateBrandFiles...");
      const generatedFiles = await LocaleGenerator.generateBrandFiles(
        baseSiteCopy,
        baseConfigContent,
        adaptationOptions
      );
      console.log("Generated files:", generatedFiles);

      console.log("Generating installation instructions...");
      const installationInstructions = LocaleGenerator.generateInstallationInstructions(
        formData.brandName,
        formData.brandCode
      );

      console.log("Setting generated content...");
      setGeneratedContent({
        siteCopyFile: generatedFiles.siteCopy,
        configContentFile: generatedFiles.configContent,
        installationInstructions,
      });
      console.log("Generation completed successfully!");
    } catch (error) {
      console.error("Error generating brand locale:", error);
      alert("Error generating brand locale. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadFile = (content: string, filename: string, type: string = "text/plain") => {
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

  const downloadAll = () => {
    if (generatedContent) {
      downloadFile(generatedContent.siteCopyFile, `${formData.brandCode}.ts`, "text/typescript");
      setTimeout(() => downloadFile(generatedContent.configContentFile, `config_${formData.brandCode}.json`, "application/json"), 500);
      setTimeout(() => downloadFile(generatedContent.installationInstructions, `${formData.brandCode}-setup-instructions.md`, "text/markdown"), 1000);
    }
  };





  return (
    <div className="space-y-6">
      <Card>
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Enhanced Brand Setup</h2>
          <p className="text-gray-600 mb-6">
            Create a rich, contextual brand experience with tailored content that resonates with your target audience.
            The more details you provide, the more personalized and relevant the generated content will be.
          </p>

          <div className="space-y-4">
            {/* Basic Information */}
            <CollapsibleSection 
              title="Basic Information *" 
              section="basic"
              expandedSections={expandedSections}
              onToggleSection={toggleSection}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Brand Name *
                  </label>
                  <input
                    type="text"
                    value={formData.brandName}
                    onChange={(e) => handleInputChange("brandName", e.target.value)}
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
                    onChange={(e) => handleInputChange("brandCode", e.target.value)}
                    placeholder="Auto-generated"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                    onChange={(e) => handleInputChange("industry", e.target.value)}
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brand Icon/Logo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleInputChange("icon", e.target.files?.[0] || "")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Upload your brand icon (recommended: PNG, 256x256px)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adaptation Instructions *
                </label>
                <textarea
                  value={formData.adaptationPrompt}
                  onChange={(e) => handleInputChange("adaptationPrompt", e.target.value)}
                  placeholder="Describe your brand's focus, values, and how content should be adapted. Include specific terminology replacements, key themes, and any industry-specific requirements."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </CollapsibleSection>

            {/* Campaign Context */}
            <CollapsibleSection 
              title="Campaign Context" 
              section="campaign-context"
              expandedSections={expandedSections}
              onToggleSection={toggleSection}
            >
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Campaign Type *
                  </label>
                  <select
                    value={formData.campaignType}
                    onChange={(e) => handleInputChange("campaignType", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="product-launch">Product Launch</option>
                    <option value="internal-training">Internal Training</option>
                    <option value="dealer-enablement">Dealer/Partner Enablement</option>
                    <option value="event-marketing">Event Marketing</option>
                    <option value="compliance-training">Compliance Training</option>
                    <option value="custom">Custom</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    What type of campaign or initiative is this toolkit for?
                  </p>
                </div>

                {formData.campaignType === "custom" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Custom Campaign Type
                    </label>
                    <input
                      type="text"
                      value={formData.customCampaignType || ""}
                      onChange={(e) => handleInputChange("customCampaignType", e.target.value)}
                      placeholder="e.g., customer onboarding, product training, market expansion"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Audience *
                  </label>
                  <select
                    value={formData.targetAudience}
                    onChange={(e) => handleInputChange("targetAudience", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="external-customers">External Customers</option>
                    <option value="internal-teams">Internal Teams</option>
                    <option value="partners">Partners/Dealers</option>
                    <option value="dealers">Dealers</option>
                    <option value="custom">Custom</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Who will be using this toolkit?
                  </p>
                </div>

                {formData.targetAudience === "custom" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Custom Target Audience
                    </label>
                    <input
                      type="text"
                      value={formData.customTargetAudience || ""}
                      onChange={(e) => handleInputChange("customTargetAudience", e.target.value)}
                      placeholder="e.g., franchise owners, consultants, students"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Primary Goal *
                  </label>
                  <textarea
                    value={formData.primaryGoal}
                    onChange={(e) => handleInputChange("primaryGoal", e.target.value)}
                    placeholder="e.g., Launch plant-based product to European market, Improve team AI literacy, Enable dealers to sell new models"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    What is the main objective of this campaign/initiative?
                  </p>
                </div>

                <ArrayInput
                  label="Key Deliverables"
                  field="keyDeliverables"
                  placeholder="e.g., Social media posts, Email campaigns, Training materials"
                  helpText="What specific assets and content will this toolkit contain?"
                  values={formData.keyDeliverables}
                  onArrayInputChange={handleArrayInputChange}
                  onAddItem={addArrayItem}
                  onRemoveItem={removeArrayItem}
                />
              </div>
            </CollapsibleSection>

            {/* Target Audience */}
            <CollapsibleSection 
              title="Target Audience" 
              section="audience"
              expandedSections={expandedSections}
              onToggleSection={toggleSection}
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Audience Description
                </label>
                <textarea
                  value={formData.targetAudienceDescription}
                  onChange={(e) => handleInputChange("targetAudienceDescription", e.target.value)}
                  placeholder="Describe your ideal customers, their roles, challenges, and what motivates them..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </CollapsibleSection>

            {/* Key Benefits & USPs */}
            <CollapsibleSection 
              title="Benefits & Unique Selling Points" 
              section="benefits"
              expandedSections={expandedSections}
              onToggleSection={toggleSection}
            >
              <ArrayInput
                label="Key Benefits"
                field="keyBenefits"
                placeholder="e.g., Reduce costs by 30%"
                helpText="What are the main benefits customers get from your solution?"
                values={formData.keyBenefits}
                onArrayInputChange={handleArrayInputChange}
                onAddItem={addArrayItem}
                onRemoveItem={removeArrayItem}
              />
              
              <ArrayInput
                label="Unique Selling Points"
                field="uniqueSellingPoints"
                placeholder="e.g., Only solution with real-time analytics"
                helpText="What makes your brand different from competitors?"
                values={formData.uniqueSellingPoints}
                onArrayInputChange={handleArrayInputChange}
                onAddItem={addArrayItem}
                onRemoveItem={removeArrayItem}
              />
              
              <ArrayInput
                label="Competitor Differentiators"
                field="competitorDifferentiators"
                placeholder="e.g., 50% faster implementation than alternatives"
                helpText="How do you specifically outperform competitors?"
                values={formData.competitorDifferentiators}
                onArrayInputChange={handleArrayInputChange}
                onAddItem={addArrayItem}
                onRemoveItem={removeArrayItem}
              />
            </CollapsibleSection>

            {/* Campaign Goals */}
            <CollapsibleSection 
              title="Campaign Goals & Objectives" 
              section="campaign"
              expandedSections={expandedSections}
              onToggleSection={toggleSection}
            >
              <ArrayInput
                label="Campaign Goals"
                field="campaignGoals"
                placeholder="e.g., Generate 500 qualified leads"
                helpText="What are you trying to achieve with this campaign?"
                values={formData.campaignGoals}
                onArrayInputChange={handleArrayInputChange}
                onAddItem={addArrayItem}
                onRemoveItem={removeArrayItem}
              />
            </CollapsibleSection>

            {/* Brand Values & Categories */}
            <CollapsibleSection 
              title="Brand Values & Products" 
              section="brand"
              expandedSections={expandedSections}
              onToggleSection={toggleSection}
            >
              <ArrayInput
                label="Brand Values"
                field="brandValues"
                placeholder="e.g., Innovation, Sustainability, Customer-First"
                helpText="Core values that guide your brand"
                values={formData.brandValues}
                onArrayInputChange={handleArrayInputChange}
                onAddItem={addArrayItem}
                onRemoveItem={removeArrayItem}
              />
              
              <ArrayInput
                label="Product Categories"
                field="productCategories"
                placeholder="e.g., Cloud Solutions, Analytics Platform"
                helpText="Main product or service categories you offer"
                values={formData.productCategories}
                onArrayInputChange={handleArrayInputChange}
                onAddItem={addArrayItem}
                onRemoveItem={removeArrayItem}
              />
            </CollapsibleSection>
          </div>

          <div className="mt-8 flex justify-center">
            <Button
              onClick={(e) => {
                e.preventDefault();
                console.log("Button clicked directly");
                console.log("Button disabled state:", isGenerating || !formData.brandName || !formData.brandCode || !formData.adaptationPrompt);
                console.log("isGenerating:", isGenerating);
                console.log("brandName:", formData.brandName);
                console.log("brandCode:", formData.brandCode);
                console.log("adaptationPrompt:", formData.adaptationPrompt);
                generateBrandLocale();
              }}
              disabled={isGenerating || !formData.brandName || !formData.brandCode || !formData.adaptationPrompt}
              className="px-8 py-3"
            >
              {isGenerating ? "Generating Rich Brand Content..." : "Generate Enhanced Brand Locale"}
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
                variant={previewType === "configContent" ? "primary" : "secondary"}
                size="sm"
              >
                Config Content (config_{formData.brandCode}.json)
              </Button>
              <Button
                onClick={() => setPreviewType("instructions")}
                variant={previewType === "instructions" ? "primary" : "secondary"}
                size="sm"
              >
                Installation Instructions
              </Button>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg mb-4 max-h-96 overflow-y-auto">
              <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                {previewType === "siteCopy" && generatedContent.siteCopyFile}
                {previewType === "configContent" && generatedContent.configContentFile}
                {previewType === "instructions" && generatedContent.installationInstructions}
              </pre>
            </div>

            <div className="flex justify-center">
              <Button onClick={downloadAll} variant="primary">
                Download All Files
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}