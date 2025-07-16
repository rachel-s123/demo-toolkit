import React from "react";
import { AlertTriangle } from "lucide-react";

interface DemoNoticeProps {
  message?: string;
  className?: string;
}

const DemoNotice: React.FC<DemoNoticeProps> = ({
  message = "Demo content is being used. Replace with actual BMW marketing materials.",
  className = "",
}) => {
  return (
    <div
      className={`bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 ${className}`}
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
        <div>
          <h3 className="text-sm font-medium text-amber-800">
            Demo Content Notice
          </h3>
          <p className="text-sm text-amber-700 mt-1">{message}</p>
        </div>
      </div>
    </div>
  );
};

export default DemoNotice;
