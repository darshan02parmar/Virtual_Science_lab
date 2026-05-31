import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import API_URL from "../config";

const PredictionContext = createContext();
const USER_ID = "default-student";

const BASE_URL =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
    ? "http://127.0.0.1:8000"
    : API_URL;

export const PredictionProvider = ({ children }) => {
  const [predictions, setPredictions] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchPredictions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/predictions/${USER_ID}`);
      if (!res.ok) throw new Error("Failed to fetch predictions");
      const data = await res.json();
      
      const predsMap = {};
      data.forEach(p => {
        predsMap[p.experiment_id] = p;
      });
      setPredictions(predsMap);
    } catch (err) {
      console.error("Could not load predictions:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPredictions();
  }, [fetchPredictions]);

  const getPrediction = useCallback((experimentId) => {
    return predictions[experimentId] || null;
  }, [predictions]);

  const api = useMemo(() => ({
    predictions,
    loading,
    getPrediction,
    refreshPredictions: fetchPredictions
  }), [predictions, loading, getPrediction, fetchPredictions]);

  return <PredictionContext.Provider value={api}>{children}</PredictionContext.Provider>;
};

export const usePredictions = () => {
  const context = useContext(PredictionContext);
  if (!context) {
    return {
      predictions: {},
      loading: false,
      getPrediction: () => null,
      refreshPredictions: async () => {}
    };
  }
  return context;
};
