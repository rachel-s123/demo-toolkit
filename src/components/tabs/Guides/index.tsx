import React, { useState, useMemo } from "react";
import { useConfig } from "../../../hooks/useConfig";
import { MotorcycleModel, ActionButtonType, Guide } from "../../../types";
import FilterGroup from "../../ui/FilterGroup";
import GuideCard from "./GuideCard";
import GuideContent from "./GuideContent";
import { useTranslations } from "../../../context/LanguageContext";
import { useHighlight } from "../../../context/HighlightContext";

const Guides: React.FC = () => {
  const { config, loading, error, refetch } = useConfig();
  const t = useTranslations();
  const copy = t.guides;
  const { isHighlightEnabled } = useHighlight();

  const [typeFilter, setTypeFilter] = useState<ActionButtonType | "ALL">("ALL");
  const [modelFilter, setModelFilter] = useState<MotorcycleModel | "ALL">(
    "ALL"
  );
  const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null);

  const typeOptions = useMemo(
    () =>
      (config?.filterOptions.actionTypes as ActionButtonType[] | undefined) || [
        "ALL",
      ],
    [config]
  );
  const modelOptions = useMemo(
    () =>
      (config?.filterOptions.models as MotorcycleModel[] | undefined) || [
        "ALL",
      ],
    [config]
  );

  const filteredGuides = useMemo(() => {
    if (!config?.guides) return [];
    return config.guides.filter((guide) => {
      const matchesType = typeFilter === "ALL" || guide.type === typeFilter;
      const matchesModel = modelFilter === "ALL" || guide.model === modelFilter;
      return matchesType && matchesModel;
    });
  }, [config?.guides, typeFilter, modelFilter]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-secondary-600">Loading guides...</p>
        </div>
      </div>
    );
  }

  if (error || !config) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">
            Error loading guides: {error || "Configuration not available"}
          </p>
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

      {copy.introParagraph1 && (
        <p
          style={{ color: isHighlightEnabled ? "green" : "inherit" }}
          className="mb-2 text-secondary-700"
        >
          {copy.introParagraph1}
        </p>
      )}
      {copy.introParagraph2 && (
        <p
          style={{ color: isHighlightEnabled ? "green" : "inherit" }}
          className="mb-8 text-secondary-700"
        >
          {copy.introParagraph2}
        </p>
      )}

      <div className="mb-8 bg-gray-50 p-4 rounded-lg shadow">
        <h3
          style={{ color: isHighlightEnabled ? "green" : "inherit" }}
          className="text-sm font-bold text-secondary-700 mb-3"
        >
          {copy.filterHeading}
        </h3>
        <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-4">
          <FilterGroup
            filterOptions={typeOptions as string[]}
            activeFilter={typeFilter}
            onFilterChange={(filter) =>
              setTypeFilter(filter as ActionButtonType | "ALL")
            }
            label="Type"
          />
          <FilterGroup
            filterOptions={modelOptions as string[]}
            activeFilter={modelFilter}
            onFilterChange={(filter) =>
              setModelFilter(filter as MotorcycleModel | "ALL")
            }
            label="Category"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <h2
            style={{ color: isHighlightEnabled ? "green" : "inherit" }}
            className="mb-4 text-lg font-medium text-secondary-900"
          >
            {copy.availableGuidesTitle}
          </h2>

          {filteredGuides.length === 0 ? (
            <div className="mt-6 text-center">
              <p className="text-secondary-500">
                No guides match your current filters.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredGuides.map((guide) => (
                <GuideCard
                  key={guide.id}
                  guide={guide}
                  onSelect={setSelectedGuide}
                  isSelected={selectedGuide?.id === guide.id}
                  onUpdate={refetch}
                />
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          <h2
            style={{ color: isHighlightEnabled ? "green" : "inherit" }}
            className="mb-4 text-lg font-medium text-secondary-900"
          >
            {copy.guideContentTitle}
          </h2>
          <GuideContent guide={selectedGuide} />
        </div>
      </div>
    </div>
  );
};

export default Guides;
