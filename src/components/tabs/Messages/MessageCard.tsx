import React, { useState, useEffect } from "react";
import { Copy, Check } from "lucide-react";
import { Message } from "../../../types";
import Card from "../../ui/Card";
import { marked } from "marked";

interface MessageCardProps {
  message: Message;
}

const MessageCard: React.FC<MessageCardProps> = ({ message }) => {
  const [copied, setCopied] = useState(false);
  const [htmlContent, setHtmlContent] = useState<string>("");

  useEffect(() => {
    const parseMarkdown = async () => {
      try {
        // Configure marked with proper options
        marked.setOptions({
          breaks: true, // Convert \n to <br>
          gfm: true, // GitHub Flavored Markdown
        });

        const html = await marked(message.content);
        setHtmlContent(html);
      } catch (error) {
        console.error("Error parsing markdown:", error);
        // Fallback to plain text if markdown parsing fails
        setHtmlContent(`<p>${message.content.replace(/\n/g, "<br>")}</p>`);
      }
    };

    parseMarkdown();
  }, [message.content]);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };


  const getChannelColor = (channel: string) => {
    switch (channel) {
      case "Instagram":
        return "bg-purple-100 text-purple-800";
      case "Facebook":
        return "bg-blue-100 text-blue-800";
      case "Email":
        return "bg-green-100 text-green-800";
      case "SMS":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-secondary-100 text-secondary-800";
    }
  };

  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getChannelColor(
                message.channel
              )}`}
            >
              <span>{message.channel}</span>
            </span>
          </div>
          <h3 className="mt-2 font-medium text-secondary-900">
            {message.title}
          </h3>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleCopy}
            className="rounded-full p-2 text-secondary-500 transition-colors hover:bg-secondary-100"
            aria-label="Copy message"
          >
            {copied ? (
              <Check className="h-4 w-4 text-success-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      <div className="mt-3">
        <div
          className="text-sm text-secondary-600 prose prose-sm max-w-none prose-p:my-2 prose-strong:text-primary-600 prose-strong:font-semibold"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
          style={{
            lineHeight: "1.5",
          }}
        />
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-secondary-500">
        <span>{message.model}</span>
        <span>{message.type}</span>
      </div>

    </Card>
  );
};

export default MessageCard;
