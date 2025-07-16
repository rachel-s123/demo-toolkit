import { BrowserRouter } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import Layout from "./components/layout/Layout";
import PasswordProtection from "./components/PasswordProtection";
import { LanguageProvider } from "./context/LanguageContext";
import { HighlightProvider } from "./context/HighlightContext";
import { EditorProvider } from "./context/EditorContext";

function App() {
  return (
    <BrowserRouter>
      <PasswordProtection>
        {(onLogout) => (
          <HighlightProvider>
            <LanguageProvider>
              <EditorProvider>
                <>
                  <Layout onLogout={onLogout} />
                  <Analytics />
                </>
              </EditorProvider>
            </LanguageProvider>
          </HighlightProvider>
        )}
      </PasswordProtection>
    </BrowserRouter>
  );
}

export default App;
