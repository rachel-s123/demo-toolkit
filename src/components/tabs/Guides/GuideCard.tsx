import React from "react";
import { Guide } from "../../../types";
import Card from "../../ui/Card";

interface GuideCardProps {
  guide: Guide;
  onSelect: (guide: Guide) => void;
  isSelected: boolean;
}

const GuideCard: React.FC<GuideCardProps> = ({ guide, onSelect, isSelected }) => {

  return (
    <>
      <button
        className={`w-full text-left cursor-pointer transition-colors ${
          isSelected ? "ring-2 ring-primary-500" : "hover:bg-secondary-50"
        }`}
        onClick={() => onSelect(guide)}
      >
        <Card>
          <div className="flex items-center gap-4">
            <div className="flex-grow">
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-secondary-900">
                  {guide.title}
                </h3>
              </div>
              <div className="mt-1 flex items-center gap-2 text-xs text-secondary-500">
                <span>{guide.type}</span>
              </div>
            </div>

            <div className="flex items-center gap-1"></div>
          </div>
        </Card>
      </button>
    </>
  );
};

export default GuideCard;
