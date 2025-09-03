import { useState } from "react";
import Button from "../../ui/Button";
import Card from "../../ui/Card";
import { LLMGenerator, BrandFormData as LLMBrandFormData } from '../../../services/llmGenerator';
import { useLanguage } from "../../../context/LanguageContext";
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
  
  // Campaign Context
  campaignType: "product-launch" | "internal-training" | "dealer-enablement" | "event-marketing" | "compliance-training" | "custom";
  targetAudience: "external-customers" | "internal-teams" | "partners" | "dealers" | "custom";
  primaryGoal: string;
  keyDeliverables: string[];
  customCampaignType?: string;
  customTargetAudience?: string;
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
  // Access language context if needed in future; not required for this section
  try {
    useLanguage();
  } catch (error) {
    console.warn('Language context not available in BrandSetup');
  }
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
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [hasGeneratedOnce, setHasGeneratedOnce] = useState(false);
  const [lastGeneratedFormData, setLastGeneratedFormData] = useState<string>("");
  const [previewType, setPreviewType] = useState<"siteCopy" | "configContent" | "instructions">("siteCopy");
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedContent, setEditedContent] = useState<GeneratedContent | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    basic: true,
    "campaign-context": true
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
    if (!formData.brandName || !formData.brandCode || !formData.adaptationPrompt || !formData.primaryGoal) {
      alert("Please fill in all required fields (Brand Name, Brand Code, Adaptation Instructions, and Primary Goal)");
      return;
    }

    setIsGenerating(true);

    try {
      const baseConfigResponse = await fetch("/locales/config_en_template.json");

      if (!baseConfigResponse.ok) {
        console.error("Failed to load template config:", baseConfigResponse.status, baseConfigResponse.statusText);
        throw new Error("Failed to load template config");
      }

      let logoPath = formData.logoPath;
      if (formData.icon) {
        logoPath = `/assets/logos/${formData.brandCode}.${formData.icon.name.split(".").pop()}`;
      }

      // Clean up empty array items
      const cleanArrayField = (arr: string[]) => arr.filter(item => item.trim() !== "");

      const llmFormData: LLMBrandFormData = {
        brandName: formData.brandName,
        brandCode: formData.brandCode,
        adaptationPrompt: formData.adaptationPrompt,
        industry: formData.industry,
        tone: formData.tone,
        logoPath,
        
        // Campaign Context
        campaignType: formData.campaignType,
        targetAudience: formData.targetAudience,
        primaryGoal: formData.primaryGoal,
        keyDeliverables: cleanArrayField(formData.keyDeliverables),
        customCampaignType: formData.customCampaignType,
        customTargetAudience: formData.customTargetAudience,
      };

      let generatedFiles;
      try {
        console.log('🤖 Attempting LLM generation...');
        generatedFiles = await LLMGenerator.generateBrandFiles(llmFormData);
        console.log('✅ LLM generation successful');
      } catch (llmError) {
        console.warn('⚠️ LLM generation failed, using fallback generator:', llmError);
        // Fallback to basic generator
        const LocaleGenerator = (await import('./LocaleGenerator')).default;
        const baseSiteCopy = (await import('../../../locales')).languages.en_template;
        const baseConfigResponse = await fetch('/locales/config_en_template.json');
        
        if (!baseConfigResponse.ok) {
          throw new Error(`Failed to fetch template config: ${baseConfigResponse.status}`);
        }
        
        const baseConfigContent = await baseConfigResponse.json();
        console.log('📋 Using fallback generator with template config');
        
        generatedFiles = await LocaleGenerator.generateBrandFiles(
          baseSiteCopy,
          baseConfigContent,
          {
            brandName: formData.brandName,
            brandCode: formData.brandCode,
            industry: formData.industry,
            tone: formData.tone,
            adaptationPrompt: formData.adaptationPrompt,
            logoPath,
            campaignType: formData.campaignType,
            targetAudience: formData.targetAudience,
            primaryGoal: formData.primaryGoal,
            keyDeliverables: cleanArrayField(formData.keyDeliverables),
            customCampaignType: formData.customCampaignType,
            customTargetAudience: formData.customTargetAudience,
          }
        );
        console.log('✅ Fallback generation successful');
      }

      const installationInstructions = `# ${formData.brandName} Setup Instructions

## Files Generated
1. \`${formData.brandCode}.ts\` - Brand locale file
2. \`config_${formData.brandCode}.json\` - Brand configuration file

## Installation Steps
1. Copy \`${formData.brandCode}.ts\` to \`src/locales/\`
2. Copy \`config_${formData.brandCode}.json\` to \`public/locales/\`
3. Update \`src/locales/index.ts\` to include the new brand
4. Update \`src/components/layout/Header.tsx\` to add the brand to the dropdown
5. Add your logo to \`public/assets/logos/\`

## Next Steps
- Customize the generated content as needed
- Test the brand configuration
- Deploy your changes`;

      // Debug: Log the generated content
      console.log('📄 Generated siteCopy length:', generatedFiles.siteCopy.length);
      console.log('📄 Generated configContent length:', generatedFiles.configContent.length);
      console.log('📄 SiteCopy preview:', generatedFiles.siteCopy.substring(0, 200));
      console.log('📄 ConfigContent preview:', generatedFiles.configContent.substring(0, 200));
      
      setGeneratedContent({
        siteCopyFile: generatedFiles.siteCopy,
        configContentFile: generatedFiles.configContent,
        installationInstructions,
      });
      setHasGeneratedOnce(true);
      setLastGeneratedFormData(JSON.stringify(formData));
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
    const content = getCurrentContent();
    if (content) {
      downloadFile(content.siteCopyFile, `${formData.brandCode}.ts`, "text/typescript");
      setTimeout(() => downloadFile(content.configContentFile, `config_${formData.brandCode}.json`, "application/json"), 500);
      setTimeout(() => downloadFile(content.installationInstructions, `${formData.brandCode}-setup-instructions.md`, "text/markdown"), 1000);
    }
  };





  const hasFormChanged = () => {
    if (!hasGeneratedOnce || !lastGeneratedFormData) return false;
    const currentFormData = JSON.stringify(formData);
    return currentFormData !== lastGeneratedFormData;
  };

  const getButtonText = () => {
    if (isGenerating) return "Generating Rich Brand Content...";
    if (!hasGeneratedOnce) return "Generate Enhanced Brand Locale";
    if (hasFormChanged()) return "Regenerate with Changes";
    return "Regenerate";
  };

  const handleEditMode = () => {
    if (!isEditMode) {
      // Entering edit mode - initialize edited content
      setEditedContent({
        siteCopyFile: generatedContent!.siteCopyFile,
        configContentFile: generatedContent!.configContentFile,
        installationInstructions: generatedContent!.installationInstructions,
      });
    }
    setIsEditMode(!isEditMode);
  };

  const handleContentChange = (field: keyof GeneratedContent, value: string) => {
    if (editedContent) {
      setEditedContent({
        ...editedContent,
        [field]: value,
      });
    }
  };

  const handleSaveChanges = () => {
    if (editedContent) {
      setGeneratedContent(editedContent);
      setIsEditMode(false);
      setEditedContent(null);
    }
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setEditedContent(null);
  };

  const getCurrentContent = () => {
    if (isEditMode && editedContent) {
      return editedContent;
    }
    return generatedContent;
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
                
                {/* Logo Preview */}
                {formData.icon && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-700 mb-2">Logo Preview:</p>
                    <div className="flex items-center space-x-3">
                      <img
                        src={URL.createObjectURL(formData.icon)}
                        alt="Logo preview"
                        className="h-12 w-12 object-contain border border-gray-300 rounded"
                      />
                      <div className="text-sm text-gray-600">
                        <p><strong>File:</strong> {formData.icon.name}</p>
                        <p><strong>Size:</strong> {(formData.icon.size / 1024).toFixed(1)} KB</p>
                        <p><strong>Type:</strong> {formData.icon.type}</p>
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
          </div>

          <div className="mt-8 flex justify-center gap-3">
            <Button
              onClick={(e) => {
                e.preventDefault();
                generateBrandLocale();
              }}
              disabled={isGenerating || !formData.brandName || !formData.brandCode || !formData.adaptationPrompt}
              className="px-8 py-3"
            >
              {getButtonText()}
            </Button>
            {hasGeneratedOnce && (
              <Button
                onClick={() => {
                  setGeneratedContent(null);
                  setHasGeneratedOnce(false);
                }}
                variant="outline"
                className="px-6 py-3"
              >
                Reset
              </Button>
            )}
          </div>
        </div>
      </Card>



      {generatedContent && (
        <Card>
          <div className="p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Generated Brand Files
            </h3>
            


            <div className="mb-4 flex flex-wrap gap-2 items-center">
              <div className="flex gap-2">
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
              
              <div className="flex gap-2 ml-auto">
                {!isEditMode ? (
                  <Button
                    onClick={handleEditMode}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={handleSaveChanges}
                      variant="primary"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Save
                    </Button>
                    <Button
                      onClick={handleCancelEdit}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Cancel
                    </Button>
                  </>
                )}
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg mb-4 max-h-96 overflow-y-auto">
              {isEditMode ? (
                <textarea
                  value={
                    previewType === "siteCopy" && getCurrentContent()?.siteCopyFile ||
                    previewType === "configContent" && getCurrentContent()?.configContentFile ||
                    previewType === "instructions" && getCurrentContent()?.installationInstructions ||
                    ""
                  }
                  onChange={(e) => {
                    const field = previewType === "siteCopy" ? "siteCopyFile" : 
                                 previewType === "configContent" ? "configContentFile" : 
                                 "installationInstructions";
                    handleContentChange(field as keyof GeneratedContent, e.target.value);
                  }}
                  className="w-full h-80 p-3 text-xs font-mono text-gray-700 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  placeholder="Edit content here..."
                />
              ) : (
                <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                  {previewType === "siteCopy" && getCurrentContent()?.siteCopyFile}
                  {previewType === "configContent" && getCurrentContent()?.configContentFile}
                  {previewType === "instructions" && getCurrentContent()?.installationInstructions}
                </pre>
              )}
            </div>

            <div className="flex justify-center gap-3">
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