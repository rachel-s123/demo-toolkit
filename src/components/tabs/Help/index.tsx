import React from "react";
import Card from "../../ui/Card";
// import { siteCopy } from "../../../config/siteCopy"; // Old import
import { useTranslations } from "../../../context/LanguageContext"; // New import
import { useHighlight } from "../../../context/HighlightContext"; // Added import

const Help: React.FC = () => {
  // const copy = siteCopy.help; // Old way
  const t = useTranslations(); // New way
  const copy = t.help; // Accessing the help section
  const { isHighlightEnabled } = useHighlight(); // Added hook usage

  return (
    <div>
      <h1
        style={{ color: isHighlightEnabled ? "green" : "inherit" }} // Conditional style
        className="mb-8 text-3xl font-bold text-secondary-900 tracking-tight"
      >
        {copy.title}
      </h1>
      <Card>
        <div
          className="prose max-w-none prose-indigo"
          style={{ color: isHighlightEnabled ? "green" : "inherit" }} // Conditional style
        >
          {copy.sections.map((section, index) => (
            <React.Fragment key={index}>
              {section.heading && (
                // The h2 will inherit the color from the parent div.prose, no explicit style needed here
                <h2>{section.heading}</h2>
              )}
              {Array.isArray(section.content) ? (
                section.content[0].startsWith("<strong>Browse by topic:") ? (
                  // Specific handling for the "How to Use This Toolkit" bullet list
                  <ul>
                    {section.content.slice(0, 3).map((item, idx) => (
                      <li
                        key={idx}
                        dangerouslySetInnerHTML={{ __html: item }}
                      />
                    ))}
                  </ul>
                ) : (
                  // Generic handling for other arrays of content (e.g. paragraphs)
                  section.content.map((paragraph, idx) => (
                    <p
                      key={idx}
                      dangerouslySetInnerHTML={{ __html: paragraph }}
                    />
                  ))
                )
              ) : (
                // Handle single string content (though current config uses arrays)
                <p dangerouslySetInnerHTML={{ __html: section.content }} />
              )}
              {/* Render the concluding paragraph for "How to Use This Toolkit" section if it exists */}
              {section.heading === "How to Use This Toolkit" &&
                Array.isArray(section.content) &&
                section.content.length > 3 && (
                  <p dangerouslySetInnerHTML={{ __html: section.content[3] }} />
                )}
            </React.Fragment>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default Help;
