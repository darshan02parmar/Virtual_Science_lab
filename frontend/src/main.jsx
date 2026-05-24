import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import AppRouter from "./router";

import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { GamificationProvider } from "./context/GamificationContext";
import { ProgressProvider } from "./context/ProgressContext";
import { NotesProvider } from "./context/NotesContext";

import "./styles/globals.css";
import "./index.css";

import enableSparkleCursor from "./components/SparkleCursor";

 
// eslint-disable-next-line react-refresh/only-export-components
function Root() {
  const { sparkleEnabled } = useTheme();

  useEffect(() => {
    if (sparkleEnabled) {
      enableSparkleCursor();
    }
  }, [sparkleEnabled]);

  return <AppRouter />;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <GamificationProvider>
          <ProgressProvider>
            <NotesProvider>
              <Root />
            </NotesProvider>
          </ProgressProvider>
        </GamificationProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);