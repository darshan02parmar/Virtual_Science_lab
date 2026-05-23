import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import AppRouter from "./router";
import { ThemeProvider } from "./context/ThemeContext";
import { GamificationProvider } from "./context/GamificationContext";
import { ProgressProvider } from "./context/ProgressContext";
import { NotesProvider } from "./context/NotesContext";
import { ReportsProvider } from "./context/ReportsContext";
import "./styles/globals.css";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <GamificationProvider>
          <ProgressProvider>
            <NotesProvider>
              <ReportsProvider>
                <AppRouter />
              </ReportsProvider>
            </NotesProvider>
          </ProgressProvider>
        </GamificationProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);

