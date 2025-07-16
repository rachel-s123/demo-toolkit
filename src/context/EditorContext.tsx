import React, { createContext, useContext, ReactNode } from "react";

interface EditorContextType {
  isEditorMode: boolean;
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export const EditorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Editor mode is disabled in the demo build
  const isEditorMode = false;

  return (
    <EditorContext.Provider value={{ isEditorMode }}>
      {children}
    </EditorContext.Provider>
  );
};

export const useEditor = (): EditorContextType => {
  const context = useContext(EditorContext);
  if (context === undefined) {
    throw new Error("useEditor must be used within an EditorProvider");
  }
  return context;
};
