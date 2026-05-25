/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import API_URL from "../config";
import { offlineDb } from "../utils/offlineDb";

const ProgressContext = createContext();
const USER_ID = "default-student";
const STORAGE_KEY = "vsl-experiment-progress";

const BASE_URL =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
    ? "http://127.0.0.1:8000"
    : API_URL;

const readLocalProgress = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
};

const writeLocalProgress = (records) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
};

export const ProgressProvider = ({ children }) => {
  const [records, setRecords] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usingLocalFallback, setUsingLocalFallback] = useState(false);

  const refreshProgress = async () => {
    setLoading(true);
    try {
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        throw new Error("Offline mode: skipping API fetch for progress");
      }
      const res = await fetch(`${BASE_URL}/api/progress/${USER_ID}`);
      if (!res.ok) throw new Error("Progress API unavailable");
      const data = await res.json();
      setRecords(data);
      writeLocalProgress(data);
      offlineDb.saveAllProgress(data);
      setUsingLocalFallback(false);
      
      try {
        const recRes = await fetch(`${BASE_URL}/api/recommendations/${USER_ID}`);
        if (recRes.ok) {
          const recData = await recRes.json();
          setRecommendations(recData);
          offlineDb.saveRecommendations(USER_ID, recData);
        }
      } catch {
        // Fallback for recommendation fetch if it fails independently
        const cachedRecs = await offlineDb.getRecommendations(USER_ID);
        setRecommendations(cachedRecs || []);
      }
    } catch (err) {
      console.log("Loading offline progress & recommendations:", err.message);
      setUsingLocalFallback(true);
      const cachedProgress = await offlineDb.getProgress();
      if (cachedProgress && cachedProgress.length > 0) {
        setRecords(cachedProgress);
      } else {
        setRecords(readLocalProgress());
      }
      const cachedRecs = await offlineDb.getRecommendations(USER_ID);
      setRecommendations(cachedRecs || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshProgress();
  }, []);

  const markExperimentComplete = async (experiment, completed = true) => {
    const record = {
      user_id: USER_ID,
      experiment_id: experiment.id,
      subject: experiment.subject,
      title: experiment.title,
      completed,
      completion_date: completed ? new Date().toISOString() : null,
      score: experiment.score ?? null,
    };

    // Instantly update local state and IndexedDB progress cache
    const nextRecords = [
      record,
      ...records.filter((item) => item.experiment_id !== experiment.id),
    ];
    setRecords(nextRecords);
    writeLocalProgress(nextRecords);
    await offlineDb.saveProgressRecord(record);

    // Queue action for background sync
    const actionId = await offlineDb.queueAction("progress", record);

    try {
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        throw new Error("Offline mode: queued progress for synchronization");
      }

      const res = await fetch(`${BASE_URL}/api/progress/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(record),
      });
      if (!res.ok) throw new Error("Progress API unavailable");
      const data = await res.json();
      
      // Dequeue if successfully sent directly
      if (actionId) {
        await offlineDb.dequeueAction(actionId);
      }

      setRecords(data);
      writeLocalProgress(data);
      offlineDb.saveAllProgress(data);
      setUsingLocalFallback(false);
    } catch (err) {
      console.log("Offline or progress server error. Progress saved to IndexedDB queue:", err.message);
      setUsingLocalFallback(true);
    }
  };

  const completedIds = useMemo(
    () =>
      new Set(
        records
          .filter((record) => record.completed)
          .map((record) => record.experiment_id)
      ),
    [records]
  );

  return (
    <ProgressContext.Provider
      value={{
        records,
        recommendations,
        completedIds,
        loading,
        usingLocalFallback,
        markExperimentComplete,
        refreshProgress,
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
};

export const useProgress = () => {
  const context = useContext(ProgressContext);
  if (context === undefined) {
    console.warn("useProgress was called outside a ProgressProvider. Returning safe offline fallback.");
    return {
      records: [],
      recommendations: [],
      completedIds: new Set(),
      loading: false,
      usingLocalFallback: true,
      markExperimentComplete: async () => {},
      refreshProgress: async () => {}
    };
  }
  return context;
};
