import React, { useState } from "react";
import JourneyDiagram from "./JourneyDiagram";
import { ActionButtonType } from "../../../types";
import { useNavigate } from "react-router-dom";
import Card from "../../ui/Card";
import { useTranslations } from "../../../context/LanguageContext";
import { useHighlight } from "../../../context/HighlightContext";

const Home: React.FC = () => {
  const [selectedAction, setSelectedAction] = useState<ActionButtonType | null>(
    null
  );
  const navigate = useNavigate();
  const t = useTranslations();
  const copy = t.home;
  const { isHighlightEnabled } = useHighlight();

  const handleActionSelect = (action: ActionButtonType) => {
    console.log("[Home.tsx] handleActionSelect BEGIN. Action:", action);
    const targetUrl = "/messages?type=" + encodeURIComponent(action);
    console.log("[Home.tsx] Attempting to navigate to:", targetUrl);
    try {
      navigate(targetUrl);
      console.log("[Home.tsx] navigate() call COMPLETED.");
    } catch (e) {
      console.error("[Home.tsx] Error during navigate() call:", e);
    }
    setSelectedAction((prevAction) => (prevAction === action ? null : action));
    console.log("[Home.tsx] handleActionSelect END.");
  };

  return (
    <div>
      <h1
        style={{ color: isHighlightEnabled ? "green" : "inherit" }}
        className="mb-8 text-3xl font-bold text-secondary-900 tracking-tight"
      >
        {copy.mainTitle}
      </h1>

      <Card className="mb-8">
        <div className="prose max-w-none prose-indigo">
          <p
            style={{ color: isHighlightEnabled ? "green" : "inherit" }}
            className="lead text-lg text-secondary-700"
          >
            {copy.welcomeLead}
          </p>
          <p style={{ color: isHighlightEnabled ? "green" : "inherit" }}>
            {copy.helpYouIntro}
          </p>
          <ul>
            {copy.helpYouList.map((item, index) => (
              <li
                style={{ color: isHighlightEnabled ? "green" : "inherit" }}
                key={index}
              >
                {item}
              </li>
            ))}
          </ul>
          <p style={{ color: isHighlightEnabled ? "green" : "inherit" }}>
            {copy.quickReferenceIntro}
          </p>
          <ul>
            {copy.quickReferenceList.map((item, index) => (
              <li
                style={{ color: isHighlightEnabled ? "green" : "inherit" }}
                key={index}
              >
                {item}
              </li>
            ))}
          </ul>
          <p style={{ color: isHighlightEnabled ? "green" : "inherit" }}>
            {copy.guidesDescription}
          </p>
        </div>
      </Card>

      <JourneyDiagram
        onActionSelect={handleActionSelect}
        selectedAction={selectedAction}
      />
    </div>
  );
};

export default Home;
