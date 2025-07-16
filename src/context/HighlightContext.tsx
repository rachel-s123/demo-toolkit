import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from "react";

interface HighlightContextType {
  isHighlightEnabled: boolean;
  toggleHighlight: () => void;
}

const HighlightContext = createContext<HighlightContextType | undefined>(
  undefined
);

export const HighlightProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isHighlightEnabled, setIsHighlightEnabled] = useState<boolean>(() => {
    const storedValue = localStorage.getItem("highlightEnabled");
    return storedValue !== null ? JSON.parse(storedValue) : false; // Default to false
  });

  useEffect(() => {
    localStorage.setItem(
      "highlightEnabled",
      JSON.stringify(isHighlightEnabled)
    );
  }, [isHighlightEnabled]);

  const toggleHighlight = () => {
    setIsHighlightEnabled((prev) => !prev);
  };

  return (
    <HighlightContext.Provider value={{ isHighlightEnabled, toggleHighlight }}>
      {children}
    </HighlightContext.Provider>
  );
};

export const useHighlight = (): HighlightContextType => {
  const context = useContext(HighlightContext);
  if (context === undefined) {
    throw new Error("useHighlight must be used within a HighlightProvider");
  }
  return context;
};
