import React from "react";
import { motion } from "framer-motion";
import { useConfig } from "../../../hooks/useConfig";
import {
  Rocket,
  Calendar,
  Store,
  MessageSquare,
  UserPlus,
  ExternalLink,
} from "lucide-react";
import Card from "../../ui/Card";
import { ActionButtonType, JourneyStep } from "../../../types";
import { useTranslations } from "../../../context/LanguageContext";
import { useHighlight } from "../../../context/HighlightContext";

const iconMap = {
  Rocket,
  Calendar,
  Store,
  MessageSquare,
  UserPlus,
};

interface JourneyDiagramProps {
  onActionSelect: (action: ActionButtonType) => void;
  selectedAction: ActionButtonType | null;
}

const JourneyDiagram: React.FC<JourneyDiagramProps> = ({
  onActionSelect,
  selectedAction,
}) => {
  const { config, loading, error } = useConfig();
  const t = useTranslations();
  const copy = t.home;
  const { isHighlightEnabled } = useHighlight();

  // Map journey step titles to action types for navigation based on position
  const getActionFromTitle = (title: string, stepIndex: number): ActionButtonType => {
    // Get available action types from current config (excluding "ALL")
    const availableActionTypes = config?.filterOptions?.actionTypes?.filter(type => type !== "ALL") || [];
    
    // Map step index to action type index (0-based)
    if (stepIndex >= 0 && stepIndex < availableActionTypes.length) {
      return availableActionTypes[stepIndex] as ActionButtonType;
    }
    
    // Fallback to first available action type
    return (availableActionTypes[0] as ActionButtonType) || "GETTING STARTED";
  };

  if (loading) {
    return (
      <Card className="mb-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </Card>
    );
  }

  if (error || !config?.journeySteps) {
    return (
      <Card className="mb-8">
        <div className="text-center py-12">
          <p className="text-red-600">Error loading journey steps</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2
          style={{ color: isHighlightEnabled ? "green" : "inherit" }}
          className="text-xl font-bold text-secondary-900"
        >
          {copy.journeyTitle}
        </h2>
        <p
          style={{ color: isHighlightEnabled ? "green" : "inherit" }}
          className="text-sm text-secondary-600 flex items-center gap-1"
        >
          <ExternalLink className="h-4 w-4" />
          {copy.journeySubtitle}
        </p>
      </div>

      {/* Horizontal Journey Layout */}
      <div className="relative">
        {/* Horizontal connecting line */}
        <div className="absolute top-[50px] left-[50px] right-[50px] h-0.5 bg-secondary-200 hidden sm:block" />

        {/* Journey Steps - Horizontal Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {config.journeySteps.map((step: JourneyStep, index: number) => {
            // Get icon from config
            const IconComponent =
              iconMap[step.icon as keyof typeof iconMap] || Rocket;

            const action = getActionFromTitle(step.title, index);
            const isSelected = selectedAction === action;

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative flex flex-col items-center text-center group cursor-pointer"
                onClick={() => {
                  console.log(
                    "Journey Step CLICKED:",
                    step.title,
                    "Action:",
                    action
                  );
                  onActionSelect(action);
                }}
                role="button"
                tabIndex={0}
                aria-label={`View ${step.title} messages`}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    console.log(
                      "Journey Step KEYDOWN:",
                      step.title,
                      "Action:",
                      action
                    );
                    e.preventDefault();
                    onActionSelect(action);
                  }
                }}
              >
                {/* Step Icon */}
                <div
                  className={`z-10 flex h-12 w-12 items-center justify-center rounded-full shadow-md transition-all duration-200 mb-3 group-hover:scale-110 group-hover:shadow-lg ${
                    isSelected
                      ? "bg-primary-500 text-white shadow-primary-200"
                      : "bg-primary-100 text-primary-600 group-hover:bg-primary-200 group-hover:text-primary-700"
                  }`}
                >
                  <IconComponent className="h-6 w-6" />
                </div>

                {/* Step Content */}
                <div className="flex-1">
                  <div
                    className={`text-center transition-all duration-200 w-full group-hover:transform group-hover:scale-105 ${
                      isSelected
                        ? "text-primary-600"
                        : "text-secondary-900 group-hover:text-primary-600"
                    }`}
                  >
                    <h3
                      className="text-base font-semibold mb-2 flex items-center justify-center gap-1"
                      style={{
                        color: isHighlightEnabled ? "green" : "inherit",
                      }}
                    >
                      {step.title}
                      <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    </h3>
                    <p
                      className="text-sm text-secondary-600 leading-relaxed group-hover:text-secondary-700"
                      style={{
                        color: isHighlightEnabled ? "green" : "inherit",
                      }}
                    >
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* Hover overlay for better click indication */}
                <div className="absolute inset-0 rounded-lg bg-primary-50 opacity-0 group-hover:opacity-30 transition-opacity duration-200 pointer-events-none" />
              </motion.div>
            );
          })}
        </div>
      </div>
    </Card>
  );
};

export default JourneyDiagram;
