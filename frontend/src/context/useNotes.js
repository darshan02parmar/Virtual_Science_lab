import { createContext, useContext } from "react";

export const NotesContext = createContext();

export function useNotes() {
  const context = useContext(NotesContext);
  if (context === undefined) {
    console.warn("useNotes was called outside a NotesProvider. Returning safe offline fallback.");
    return {
      getNotes: () => null,
      refreshNotesForExperiment: async () => null,
      upsertNotes: async () => null,
      loading: false,
      usingLocalFallback: true
    };
  }
  return context;
}
