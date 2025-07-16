import React, { useState } from "react";
import {
  Download,
  Maximize2,
  FileImage,
  Smartphone,
  Monitor,
} from "lucide-react";
import { Asset } from "../../../types";
import { motion } from "framer-motion";
import Card from "../../ui/Card";

interface AssetCardProps {
  asset: Asset;
  onOpenModal: (asset: Asset) => void;
}

const AssetCard: React.FC<AssetCardProps> = ({ asset, onOpenModal }) => {
  const [isHovered, setIsHovered] = useState(false);

  if (asset.type === "VIDEO") {
    console.log(
      "Video Asset Data (Vercel):",
      JSON.parse(JSON.stringify(asset))
    );
  }

  const handleViewFullscreen = () => {
    onOpenModal(asset);
  };

  const handleDownload = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const link = document.createElement("a");
    link.href =
      asset.downloadUrl && asset.downloadUrl.trim() !== ""
        ? asset.downloadUrl
        : asset.url;
    link.download = asset.newAssetName || asset.title;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadJPG = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const link = document.createElement("a");
    const jpgUrl = asset.url.replace(/\.(tif|tiff)$/i, ".jpg");
    link.href = jpgUrl;
    link.download = (asset.newAssetName || asset.title).replace(
      /\.(tif|tiff)$/i,
      ".jpg"
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadTIF = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const link = document.createElement("a");
    const tifUrl = asset.url.replace(/\.jpg$/i, ".tif");
    link.href = tifUrl;
    link.download = (asset.newAssetName || asset.title).replace(
      /\.jpg$/i,
      ".tif"
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card className="overflow-hidden">
      <div
        className="relative aspect-video cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleViewFullscreen}
      >
        {asset.type === "VIDEO" ? (
          <video
            src={asset.url}
            className="h-full w-full object-cover transition-transform duration-300 ease-in-out"
            style={{
              transform: isHovered ? "scale(1.05)" : "scale(1)",
            }}
            muted
            preload="metadata"
          />
        ) : (
          <img
            src={asset.thumbnail}
            alt={asset.title}
            className="h-full w-full object-cover transition-transform duration-300 ease-in-out"
            style={{
              transform: isHovered ? "scale(1.05)" : "scale(1)",
            }}
          />
        )}

        {asset.type === "VIDEO" && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <button
              onClick={handleViewFullscreen}
              className="rounded-full bg-black bg-opacity-60 p-3 pointer-events-auto hover:bg-opacity-80 transition-all duration-200"
              aria-label="Play video"
            >
              <svg
                className="h-8 w-8 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            </button>
          </div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          className="absolute inset-0 bg-black bg-opacity-40 transition-opacity duration-300 pointer-events-none"
        >
          <div className="flex h-full items-center justify-end pr-4 pointer-events-none">
            <div className="flex flex-col gap-2 pointer-events-auto">
              <button
                onClick={(e) => handleViewFullscreen()}
                className="rounded-full bg-white p-3 text-primary-600 transition-colors hover:bg-primary-50 group relative"
                aria-label="View fullscreen"
              >
                <Maximize2 className="h-6 w-6" />
                <div className="absolute bottom-full mb-2 right-0 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  View Full Screen
                </div>
              </button>

              {asset.type === "VIDEO" ? (
                <button
                  onClick={(e) => handleDownload(e)}
                  className="rounded-full bg-white p-3 text-primary-600 transition-colors hover:bg-primary-50 group relative"
                  aria-label="Download video"
                >
                  <Download className="h-6 w-6" />
                  <div className="absolute bottom-full mb-2 right-0 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Download
                  </div>
                </button>
              ) : (
                <>
                  <button
                    onClick={(e) => handleDownloadJPG(e)}
                    className="rounded-full bg-white p-2 text-primary-600 transition-colors hover:bg-primary-50 group relative"
                    aria-label="Download as JPG"
                  >
                    <Download className="h-5 w-5" />
                    <div className="absolute bottom-full mb-2 right-0 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      Download JPG
                    </div>
                  </button>
                  <button
                    onClick={(e) => handleDownloadTIF(e)}
                    className="rounded-full bg-white p-2 text-primary-600 transition-colors hover:bg-primary-50 group relative"
                    aria-label="Download as TIF"
                  >
                    <FileImage className="h-5 w-5" />
                    <div className="absolute bottom-full mb-2 right-0 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      Download TIF
                    </div>
                  </button>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      <div className="mt-3">
        <h3 className="font-medium text-secondary-900">{asset.title}</h3>
        <p className="text-sm text-secondary-500">{asset.model}</p>
        {asset.dimensions && (
          <p className="text-xs text-secondary-500 flex items-center">
            {asset.type === "VIDEO" && (
              <>
                {asset.orientation === "portrait" ? (
                  <Smartphone className="h-3 w-3 mr-1" />
                ) : (
                  <Monitor className="h-3 w-3 mr-1" />
                )}
              </>
            )}
            {asset.dimensions}
          </p>
        )}
      </div>
    </Card>
  );
};

export default AssetCard;
