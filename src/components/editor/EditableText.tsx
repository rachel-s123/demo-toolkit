import React, { useState } from "react";
import { Edit3, Check, X } from "lucide-react";
import { useEditor } from "../../context/EditorContext";

interface EditableTextProps {
  children: React.ReactNode;
  onSave?: (newValue: string) => void;
  className?: string;
  multiline?: boolean;
  placeholder?: string;
}

const EditableText: React.FC<EditableTextProps> = ({
  children,
  onSave,
  className = "",
  multiline = false,
  placeholder = "Enter text...",
}) => {
  const { isEditorMode } = useEditor();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(
    typeof children === "string" ? children : ""
  );

  if (!isEditorMode) {
    return <>{children}</>;
  }

  const handleEdit = () => {
    setEditValue(typeof children === "string" ? children : "");
    setIsEditing(true);
  };

  const handleSave = () => {
    if (onSave) {
      onSave(editValue);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(typeof children === "string" ? children : "");
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !multiline) {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className="relative group">
        {multiline ? (
          <textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className={`${className} border-2 border-orange-300 rounded px-2 py-1 focus:outline-none focus:border-orange-500 resize-none`}
            placeholder={placeholder}
            autoFocus
            rows={3}
          />
        ) : (
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className={`${className} border-2 border-orange-300 rounded px-2 py-1 focus:outline-none focus:border-orange-500`}
            placeholder={placeholder}
            autoFocus
          />
        )}
        <div className="absolute -right-16 top-0 flex space-x-1">
          <button
            onClick={handleSave}
            className="p-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
            title="Save"
          >
            <Check className="h-3 w-3" />
          </button>
          <button
            onClick={handleCancel}
            className="p-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            title="Cancel"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative group inline-block">
      <span className={className}>{children}</span>
      <button
        onClick={handleEdit}
        className="absolute -right-6 top-0 opacity-0 group-hover:opacity-100 p-1 bg-orange-500 text-white rounded hover:bg-orange-600 transition-all"
        title="Edit text"
      >
        <Edit3 className="h-3 w-3" />
      </button>
    </div>
  );
};

export default EditableText;
