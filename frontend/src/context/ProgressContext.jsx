/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import API_URL from "../config";

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
  const [loading, setLoading] = useState(true);
  const [usingLocalFallback, setUsingLocalFallback] = useState(false);

  const refreshProgress = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/progress/${USER_ID}`);
      if (!res.ok) throw new Error("Progress API unavailable");
      const data = await res.json();
      setRecords(data);
      writeLocalProgress(data);
      setUsingLocalFallback(false);
    } catch {
      setRecords(readLocalProgress());
      setUsingLocalFallback(true);
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

    const nextRecords = [
      record,
      ...records.filter((item) => item.experiment_id !== experiment.id),
    ];
    setRecords(nextRecords);
    writeLocalProgress(nextRecords);

    try {
      const res = await fetch(`${BASE_URL}/api/progress/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(record),
      });
      if (!res.ok) throw new Error("Progress API unavailable");
      const data = await res.json();
      setRecords(data);
      writeLocalProgress(data);
      setUsingLocalFallback(false);
    } catch {
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

export const useProgress = () => useContext(ProgressContext);
