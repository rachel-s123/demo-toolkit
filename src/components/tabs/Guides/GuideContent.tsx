import React, { useState, useEffect } from "react";
import { Download, FileText, Eye } from "lucide-react";
import { Guide } from "../../../types";
import Card from "../../ui/Card";
import Button from "../../ui/Button";
import { marked } from "marked";
import { useTranslations } from "../../../context/LanguageContext";
import { useHighlight } from "../../../context/HighlightContext";
import { useConfig } from "../../../hooks/useConfig";
// @ts-ignore - html2pdf.js doesn't have TypeScript definitions
import html2pdf from "html2pdf.js";

interface GuideContentProps {
  guide: Guide | null;
}

const GuideContent: React.FC<GuideContentProps> = ({ guide }) => {
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"preview" | "full">("preview");
  const t = useTranslations();
  const copy = t.guides;
  const { isHighlightEnabled } = useHighlight();
  const { config } = useConfig();

  useEffect(() => {
    if (guide) {
      loadMarkdownContent(guide);
    } else {
      setContent("");
      setError(null);
    }
  }, [guide]);

  useEffect(() => {
    console.log('Translations for Guides:', copy);
  }, [copy]);

  const loadMarkdownContent = async (guide: Guide) => {
    setLoading(true);
    setError(null);
    setContent("<p>Loading guide content...</p>");

    try {
      if (guide.content) {
        const htmlContent = await marked(guide.content);
        setContent(htmlContent);
      } else {
        setError("Guide content not found");
        setContent("");
      }
    } catch (err) {
      console.error("Error loading guide content:", err);
      setError("Failed to load guide content");
      setContent("");
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = async () => {
    if (!guide || !content) return;

    const element = document.createElement("div");
    element.innerHTML = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; color: #333;">
        <style>
          /* PDF-specific styles for rich formatting */
          h1, h2, h3, h4, h5, h6 {
            color: #1f2937;
            margin-top: 24px;
            margin-bottom: 16px;
            font-weight: 600;
            line-height: 1.25;
          }
          h1 { font-size: 28px; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px; }
          h2 { font-size: 24px; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px; }
          h3 { font-size: 20px; }
          h4 { font-size: 18px; }
          h5 { font-size: 16px; }
          h6 { font-size: 14px; color: #6b7280; }
          
          p { margin-bottom: 16px; }
          
          strong, b { font-weight: 600; color: #1f2937; }
          em, i { font-style: italic; }
          
          ul, ol {
            margin: 16px 0;
            padding-left: 24px;
          }
          li {
            margin-bottom: 8px;
            line-height: 1.5;
          }
          ul li {
            list-style-type: disc;
          }
          ol li {
            list-style-type: decimal;
          }
          
          /* Nested list styling */
          ul ul, ol ol, ul ol, ol ul {
            margin: 8px 0;
            padding-left: 20px;
          }
          ul ul li {
            list-style-type: circle;
          }
          ul ul ul li {
            list-style-type: square;
          }
          
          blockquote {
            border-left: 4px solid #3b82f6;
            margin: 16px 0;
            padding: 8px 16px;
            background-color: #f8fafc;
            font-style: italic;
            color: #4b5563;
          }
          
          code {
            background-color: #f1f5f9;
            padding: 2px 6px;
            border-radius: 4px;
            font-family: 'Courier New', monospace;
            font-size: 14px;
            color: #dc2626;
          }
          
          pre {
            background-color: #1f2937;
            color: #f9fafb;
            padding: 16px;
            border-radius: 8px;
            overflow-x: auto;
            margin: 16px 0;
            font-family: 'Courier New', monospace;
            font-size: 14px;
            line-height: 1.4;
          }
          
          pre code {
            background-color: transparent;
            padding: 0;
            color: inherit;
          }
          
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 16px 0;
            font-size: 14px;
          }
          th, td {
            border: 1px solid #d1d5db;
            padding: 8px 12px;
            text-align: left;
          }
          th {
            background-color: #f3f4f6;
            font-weight: 600;
            color: #1f2937;
          }
          tr:nth-child(even) {
            background-color: #f9fafb;
          }
          
          a {
            color: #3b82f6;
            text-decoration: underline;
          }
          
          hr {
            border: none;
            border-top: 2px solid #e5e7eb;
            margin: 24px 0;
          }
          
          /* BMW brand colors */
          .bmw-blue { color: #0066cc; }
          .bmw-dark { color: #1f2937; }
          
          /* Responsive adjustments for PDF */
          @media print {
            * { -webkit-print-color-adjust: exact !important; }
          }
        </style>
        
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #1f2937; padding-bottom: 20px;">
          <img src="${config?.brand?.logo || '/assets/logos/brilliant-noise.jpg'}" alt="${config?.brand?.logoAlt || 'Brand Logo'}" style="height: 40px; margin-bottom: 10px;" onerror="this.style.display='none'">
          <h1 style="color: #1f2937; margin: 0; font-size: 24px;">${config?.brand?.name || 'Brand'} Marketing Guide</h1>
          <h2 style="color: #6b7280; margin: 8px 0 0 0; font-size: 18px; font-weight: 400;">${
            guide.title
          }</h2>
        </div>
        
        <div class="content">
          ${content}
        </div>
        
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 12px;">
          <p>Generated on ${new Date().toLocaleDateString()} | ${config?.brand?.name || 'Brand'} Marketing Platform</p>
          <p style="margin-top: 8px; font-style: italic;">Category: ${
            guide.model
          } | Type: ${guide.type}</p>
        </div>
      </div>
    `;

    const opt = {
      margin: 1,
      filename: `${guide.title.replace(/\s+/g, "-").toLowerCase()}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
      },
      jsPDF: {
        unit: "in",
        format: "letter",
        orientation: "portrait",
        compress: true,
      },
    };

    try {
      await html2pdf().set(opt).from(element).save();
    } catch (err) {
      console.error("Error generating PDF:", err);
      alert("Error generating PDF. Please try again.");
    }
  };

  if (!guide) {
    return (
      <Card className="flex items-center justify-center h-full min-h-[300px]">
        <div className="text-center">
          <FileText className="mx-auto h-12 w-12 text-secondary-300" />
          <p
            className="mt-2 text-sm text-secondary-500"
            style={{ color: isHighlightEnabled ? "green" : "inherit" }}
          >
            {copy.selectGuideMessage}
          </p>
        </div>
      </Card>
    );
  }

  if (loading && !content.includes("Loading guide content...")) {
    return (
      <Card className="flex items-center justify-center h-full min-h-[300px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <p className="ml-2 text-sm text-secondary-500">Loading...</p>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-secondary-200">
        <h2 className="text-xl font-semibold text-secondary-900 truncate pr-4">
          {guide.title}
        </h2>
        <div className="flex items-center gap-2">
          {content && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setViewMode(viewMode === "preview" ? "full" : "preview")
                }
              >
                <Eye className="h-4 w-4 mr-1" />
                {viewMode === "preview" ? "Full View" : "Preview"}
              </Button>
              <Button variant="outline" size="sm" onClick={generatePDF}>
                <Download className="h-4 w-4 mr-1" />
                Generate PDF
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="border-t border-secondary-200 pt-4 flex-grow flex flex-col">
        {error ? (
          <div className="prose prose-sm max-w-none flex-grow p-1 text-red-500">
            <p>{error}</p>
            {error === "Guide content not found" && guide.url && (
              <p className="mt-2">
                You can try to view the original document:{" "}
                <a
                  href={guide.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:underline"
                >
                  {guide.url}
                </a>
              </p>
            )}
          </div>
        ) : content && !content.includes("Loading guide content...") ? (
          <div
            className={`prose prose-sm max-w-none flex-grow overflow-auto p-1 guide-content-scroll ${
              viewMode === "preview" ? "max-h-[calc(100vh-300px)]" : ""
            }`}
            dangerouslySetInnerHTML={{ __html: content }}
          />
        ) : !content.includes("Loading guide content...") ? (
          <div className="text-center text-secondary-500 py-8 flex-grow flex items-center justify-center">
            <p>No content available for this guide.</p>
          </div>
        ) : null}
      </div>
    </Card>
  );
};

export default GuideContent;
