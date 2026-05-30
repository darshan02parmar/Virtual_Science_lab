import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import AppRouter from "./router";
import { ReportsProvider } from "./context/ReportsContext";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { OnlineStatusProvider } from "./context/OnlineStatusContext";
import { GamificationProvider } from "./context/GamificationContext";
import { ProgressProvider } from "./context/ProgressContext";
import { NotesProvider } from "./context/NotesContext";
import { NotebookProvider } from "./context/NotebookContext";
import "./styles/globals.css";
import "./index.css";
import enableSparkleCursor from "./components/SparkleCursor";
// Service Worker registration
if (typeof window !== "undefined" && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => {
        console.log("Service Worker registered with scope: ", reg.scope);
      })
      .catch((err) => {
        console.error("Service Worker registration failed: ", err);
      });
  });
}
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
        <OnlineStatusProvider>
          <GamificationProvider>
            <ProgressProvider>
              <NotesProvider>
                <NotebookProvider>
                  <ReportsProvider>    
                     <Root />
                  </ReportsProvider>
                </NotebookProvider>
              </NotesProvider>
            </ProgressProvider>
          </GamificationProvider>
        </OnlineStatusProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);

  
