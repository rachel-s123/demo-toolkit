import React, { useState, useEffect } from "react";
import { X, Save, AlertCircle } from "lucide-react";
import { Message } from "../../../types";

interface MessageEditModalProps {
  message: Message;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedMessage: Message) => void;
}

const MessageEditModal: React.FC<MessageEditModalProps> = ({
  message,
  isOpen,
  onClose,
  onSave,
}) => {
  const [editedMessage, setEditedMessage] = useState<Message>(message);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setEditedMessage(message);
    setError(null);
  }, [message]);

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    try {
      // Validate required fields
      if (!editedMessage.title.trim()) {
        throw new Error("Title is required");
      }
      if (!editedMessage.content.trim()) {
        throw new Error("Content is required");
      }

      onSave(editedMessage);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save message");
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: keyof Message, value: string) => {
    setEditedMessage((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-black bg-opacity-50"
          onClick={onClose}
        />

        <div className="relative w-full max-w-2xl bg-white rounded-lg shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Edit Message
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <span className="text-red-700">{error}</span>
              </div>
            )}

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                value={editedMessage.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter message title"
              />
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Content
              </label>
              <textarea
                value={editedMessage.content}
                onChange={(e) => handleInputChange("content", e.target.value)}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter message content"
              />
            </div>

            {/* Channel */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Channel
              </label>
              <select
                value={editedMessage.channel}
                onChange={(e) => handleInputChange("channel", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="Instagram">Instagram</option>
                <option value="Facebook">Facebook</option>
                <option value="Email">Email</option>
                <option value="SMS">SMS</option>
                <option value="WhatsApp">WhatsApp</option>
                <option value="Social">Social</option>
                <option value="Multi">Multi</option>
                <option value="Print">Print</option>
                <option value="Digital">Digital</option>
                <option value="Phone">Phone</option>
                <option value="In-Store">In-Store</option>
              </select>
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                value={editedMessage.type}
                onChange={(e) => handleInputChange("type", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="LAUNCH">Launch</option>
                <option value="GENERATE TEST RIDES">Generate Test Rides</option>
                <option value="IN-STORE">In-Store</option>
                <option value="FOLLOW-UP">Follow-Up</option>
                <option value="WELCOME">Welcome</option>
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={editedMessage.model}
                onChange={(e) => handleInputChange("model", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="R1300 R">R1300 R</option>
                <option value="R1300 RS">R1300 RS</option>
                <option value="R1300 RT">R1300 RT</option>
              </select>
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                value={editedMessage.date}
                onChange={(e) => handleInputChange("date", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Category (for real content) */}
            {editedMessage.category && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <input
                  type="text"
                  value={editedMessage.category}
                  onChange={(e) =>
                    handleInputChange("category", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter category"
                />
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="w-4 h-4" />
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageEditModal;
