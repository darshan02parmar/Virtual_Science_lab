import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import API_URL from "../config";
import { offlineDb } from "../utils/offlineDb";
import { EXPERIMENT_CATALOG } from "../data/experiments";

const NotebookContext = createContext();
const USER_ID = "default-student";

const BASE_URL =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
    ? "http://127.0.0.1:8000"
    : API_URL;

export const NotebookProvider = ({ children }) => {
  const [notebooks, setNotebooks] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchNotebooks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/notebook/${USER_ID}`);
      if (!res.ok) throw new Error("Failed to fetch notebooks");
      const data = await res.json();
      const notebooksMap = {};
      data.forEach(nb => { notebooksMap[nb.experiment_id] = nb; });
      setNotebooks(notebooksMap);
      offlineDb.saveAllNotebooks(notebooksMap);
    } catch (err) {
      const cached = await offlineDb.getNotebooks();
      if (cached) setNotebooks(cached);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotebooks();
  }, [fetchNotebooks]);

  const upsertNotebook = useCallback(async (experimentId, payload) => {
    const experiment = EXPERIMENT_CATALOG.find(e => e.id === experimentId);
    if (!experiment) return;

    const body = {
      user_id: USER_ID,
      experiment_id: experimentId,
      subject: experiment.subject,
      title: experiment.title,
      ...payload
    };

    // Optimistic UI update
    setNotebooks(prev => {
      const existing = prev[experimentId] || {};
      const updated = { ...existing, ...body, updated_at: new Date().toISOString() };
      offlineDb.saveNotebook(updated);
      return { ...prev, [experimentId]: updated };
    });

    const actionId = await offlineDb.queueAction("notebook", body);

    try {
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        throw new Error("Offline mode");
      }
      const res = await fetch(`${BASE_URL}/api/notebook/upsert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("API error");
      const savedData = await res.json();
      
      if (actionId) await offlineDb.dequeueAction(actionId);

      setNotebooks(prev => {
        const next = { ...prev, [experimentId]: savedData };
        offlineDb.saveNotebook(savedData);
        return next;
      });
      return savedData;
    } catch (error) {
      console.error("Offline save for notebook:", error);
    }
  }, []);

  const getNotebookVersions = useCallback(async (experimentId) => {
    try {
      const res = await fetch(`${BASE_URL}/api/notebook/${USER_ID}/${experimentId}/versions`);
      if (res.ok) return await res.json();
    } catch (err) {
      console.error("Failed to fetch versions", err);
    }
    return [];
  }, []);

  const api = useMemo(() => ({
    notebooks,
    loading,
    upsertNotebook,
    fetchNotebooks,
    getNotebookVersions
  }), [notebooks, loading, upsertNotebook, fetchNotebooks, getNotebookVersions]);

  return <NotebookContext.Provider value={api}>{children}</NotebookContext.Provider>;
};

export const useNotebook = () => {
  const context = useContext(NotebookContext);
  if (!context) {
    return {
      notebooks: {},
      loading: false,
      upsertNotebook: async () => {},
      fetchNotebooks: async () => {},
      getNotebookVersions: async () => []
    };
  }
  return context;
};
