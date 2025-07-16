import React, { useState, useMemo } from "react";
import { useConfig } from "../../../hooks/useConfig";
import { AssetPhase, AssetType, MotorcycleModel, Asset } from "../../../types";
import FilterGroup from "../../ui/FilterGroup";
import Modal from "../../ui/Modal";
import AssetCard from "./AssetCard";
import { useTranslations } from "../../../context/LanguageContext";
import { useHighlight } from "../../../context/HighlightContext";

const Assets: React.FC = () => {
  const { config, loading, error } = useConfig();
  const [phaseFilter, setPhaseFilter] = useState<AssetPhase>("ALL");
  const [typeFilter, setTypeFilter] = useState<AssetType>("ALL");
  const [modelFilter, setModelFilter] = useState<MotorcycleModel>("ALL");
  const [assets, setAssets] = useState<Asset[]>([]);
  const t = useTranslations();
  const copy = t.assets;
  const { isHighlightEnabled } = useHighlight();

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<{
    type: "video" | "image";
    url: string;
    downloadUrl?: string;
    title: string;
    filename?: string;
  } | null>(null);

  // Update assets when config loads
  React.useEffect(() => {
    if (config?.assets) {
      setAssets(config.assets);
    }
  }, [config]);

  // Get filter options from config or use defaults
  const phaseOptions = (config?.filterOptions.phases as AssetPhase[]) || [
    "ALL",
    "PHASE 1",
    "PHASE 2",
  ];
  const typeOptions = (config?.filterOptions.types as AssetType[]) || [
    "ALL",
    "STATIC",
    "VIDEO",
  ];
  const modelOptions = (config?.filterOptions.models as MotorcycleModel[]) || [
    "ALL",
    "R1300 R",
    "R1300 RS",
    "R1300 RT",
  ];

  const handleOpenModal = (asset: Asset) => {
    setModalContent({
      type: asset.type === "VIDEO" ? "video" : "image",
      url: asset.url,
      downloadUrl: (asset as any).downloadUrl || asset.url,
      title: asset.title,
      filename: asset.newAssetName || asset.title,
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalContent(null);
  };

  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      const matchesPhase = phaseFilter === "ALL" || asset.phase === phaseFilter;
      const matchesType = typeFilter === "ALL" || asset.type === typeFilter;
      const matchesModel = modelFilter === "ALL" || asset.model === modelFilter;

      return matchesPhase && matchesType && matchesModel;
    });
  }, [assets, phaseFilter, typeFilter, modelFilter]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-secondary-600">Loading assets...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading assets: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1
        style={{ color: isHighlightEnabled ? "green" : "inherit" }}
        className="mb-6 text-2xl font-bold text-secondary-900"
      >
        {copy.title}
      </h1>

      <div className="mb-8 text-secondary-700 space-y-2">
        <p style={{ color: isHighlightEnabled ? "green" : "inherit" }}>
          {copy.introParagraph1}
        </p>

        {/* Restored structure for "About the Content" section */}
        <h2
          style={{ color: isHighlightEnabled ? "green" : "inherit" }}
          className="text-xl font-semibold text-secondary-800 pt-2"
        >
          {copy.aboutContentHeading}
        </h2>
        <p style={{ color: isHighlightEnabled ? "green" : "inherit" }}>
          {copy.aboutContentP1}
        </p>
        <p style={{ color: isHighlightEnabled ? "green" : "inherit" }}>
          <span dangerouslySetInnerHTML={{ __html: copy.phase1LeadIn }} />{" "}
          {copy.phase1Details}
        </p>
        <p style={{ color: isHighlightEnabled ? "green" : "inherit" }}>
          <span dangerouslySetInnerHTML={{ __html: copy.phase2LeadIn }} />{" "}
          {copy.phase2Details}
        </p>
      </div>

      <div className="mb-8 bg-gray-50 p-4 rounded-lg shadow">
        <h3
          style={{ color: isHighlightEnabled ? "green" : "inherit" }}
          className="text-sm font-bold text-secondary-700 mb-3"
        >
          {copy.filterHeading}
        </h3>
        <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-4">
          <FilterGroup
            filterOptions={phaseOptions}
            activeFilter={phaseFilter}
            onFilterChange={(filter) => setPhaseFilter(filter as AssetPhase)}
            label="Phase"
          />

          <FilterGroup
            filterOptions={typeOptions}
            activeFilter={typeFilter}
            onFilterChange={(filter) => setTypeFilter(filter as AssetType)}
            label="Type"
          />

          <FilterGroup
            filterOptions={modelOptions}
            activeFilter={modelFilter}
            onFilterChange={(filter) =>
              setModelFilter(filter as MotorcycleModel)
            }
            label="Model"
          />
        </div>
      </div>

      {filteredAssets.length === 0 ? (
        <div className="mt-12 text-center">
          <p className="text-lg text-secondary-500">
            No assets match your current filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredAssets.map((asset) => (
            <AssetCard
              key={asset.id}
              asset={asset}
              onOpenModal={handleOpenModal}
            />
          ))}
        </div>
      )}

      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          content={modalContent}
        />
      )}
    </div>
  );
};

export default Assets;
