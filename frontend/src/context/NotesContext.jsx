import { useCallback, useEffect, useMemo, useState } from "react";
import API_URL from "../config";
import { NotesContext } from "./useNotes";
import { offlineDb } from "../utils/offlineDb";

const USER_ID = "default-student";
const STORAGE_KEY = "vsl-experiment-notes";

const BASE_URL =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
    ? "http://127.0.0.1:8000"
    : API_URL;

const readLocalNotes = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") || {};
  } catch {
    return {};
  }
};

const writeLocalNotes = (next) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
};

export const NotesProvider = ({ children }) => {
  const [notesByExperimentId, setNotesByExperimentId] = useState({});
  const [loading, setLoading] = useState(true);
  const [usingLocalFallback, setUsingLocalFallback] = useState(false);

  useEffect(() => {
    // Load local IndexedDB cache immediately for responsiveness, fallback to localStorage
    const loadCached = async () => {
      try {
        const indexed = await offlineDb.getNotes();
        if (indexed && Object.keys(indexed).length > 0) {
          setNotesByExperimentId(indexed);
        } else {
          setNotesByExperimentId(readLocalNotes());
        }
      } catch (err) {
        console.warn("Failed to load IndexedDB notes, falling back to localStorage:", err);
        setNotesByExperimentId(readLocalNotes());
      } finally {
        setLoading(false);
      }
    };
    loadCached();
  }, []);

  const refreshNotesForExperiment = useCallback(async (experimentId) => {
    setLoading(true);
    try {
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        throw new Error("Offline mode: skipping API fetch for notes");
      }
      const res = await fetch(`${BASE_URL}/api/notes/${USER_ID}/${experimentId}`);
      if (!res.ok) throw new Error("Notes API unavailable");
      const data = await res.json();
      const normalized = {
        user_id: data.user_id,
        experiment_id: data.experiment_id,
        observations: data.observations || "",
        conclusions: data.conclusions || "",
        learnings: data.learnings || "",
        notes: data.notes || "",
        created_at: data.created_at || null,
        updated_at: data.updated_at || null,
      };
      setNotesByExperimentId((prev) => {
        const next = { ...prev, [experimentId]: normalized };
        writeLocalNotes(next);
        offlineDb.saveNote(normalized);
        return next;
      });
      setUsingLocalFallback(false);
      return normalized;
    } catch (err) {
      console.log("Loading offline notes for experiment:", experimentId, err.message);
      setUsingLocalFallback(true);
      const indexed = await offlineDb.getNote(experimentId);
      if (indexed) {
        setLoading(false);
        return indexed;
      }
      const local = readLocalNotes();
      const existing = local[experimentId] || null;
      setLoading(false);
      return existing;
    } finally {
      setLoading(false);
    }
  }, []);

  const upsertNotes = useCallback(async (experimentId, payload) => {
    const body = {
      user_id: USER_ID,
      experiment_id: experimentId,
      observations: payload.observations ?? "",
      conclusions: payload.conclusions ?? "",
      learnings: payload.learnings ?? "",
      notes: payload.notes ?? "",
      updated_at: new Date().toISOString()
    };

    // Update local React and localStorage immediately
    setNotesByExperimentId((prev) => {
      const existing = prev[experimentId] || {};
      const nextRecord = {
        ...existing,
        ...body,
        user_id: USER_ID,
        experiment_id: experimentId,
      };
      const next = { ...prev, [experimentId]: nextRecord };
      writeLocalNotes(next);
      offlineDb.saveNote(nextRecord);
      return next;
    });

    // Queue action for syncing
    const actionId = await offlineDb.queueAction("notes", body);

    try {
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        throw new Error("Offline mode: queueing note for background synchronization");
      }

      const res = await fetch(`${BASE_URL}/api/notes/upsert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Notes API unavailable");
      const data = await res.json();

      // Dequeue if successfully synced directly
      if (actionId) {
        await offlineDb.dequeueAction(actionId);
      }

      const normalized = {
        user_id: data.user_id,
        experiment_id: data.experiment_id,
        observations: data.observations || "",
        conclusions: data.conclusions || "",
        learnings: data.learnings || "",
        notes: data.notes || "",
        created_at: data.created_at || null,
        updated_at: data.updated_at || null,
      };

      setNotesByExperimentId((prev) => {
        const next = { ...prev, [experimentId]: normalized };
        writeLocalNotes(next);
        offlineDb.saveNote(normalized);
        return next;
      });
      setUsingLocalFallback(false);
      return normalized;
    } catch (err) {
      console.log("Offline or notes server error. Note saved to IndexedDB queue:", err.message);
      setUsingLocalFallback(true);
      return {
        ...body,
        created_at: null,
      };
    }
  }, []);

  const getNotes = useCallback(
    (experimentId) => notesByExperimentId[experimentId] || null,
    [notesByExperimentId]
  );

  const api = useMemo(
    () => ({
      getNotes,
      refreshNotesForExperiment,
      upsertNotes,
      loading,
      usingLocalFallback,
    }),
    [getNotes, loading, refreshNotesForExperiment, upsertNotes, usingLocalFallback]
  );

  return <NotesContext.Provider value={api}>{children}</NotesContext.Provider>;
};


