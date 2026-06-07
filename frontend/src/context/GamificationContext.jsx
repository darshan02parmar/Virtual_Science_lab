/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useState, useMemo, useRef } from "react";
import API_URL from "../config";
import { useOnlineStatus } from "./OnlineStatusContext";
import { offlineDb } from "../utils/offlineDb";

// Partitioned contexts to completely isolate high-frequency and low-frequency updates
const GamificationMetaContext = createContext();
const GamificationTelemetryContext = createContext();

const USER_ID = "default-student";
const STORAGE_KEY = "vsl-quiz-performance";
const DEBOUNCE_DELAY_MS = 1000;

const BASE_URL = 
  typeof window !== "undefined" && 
  (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
    ? "http://127.0.0.1:8000"
    : API_URL;

const cacheStats = (stats) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
};

const readCachedStats = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
};

const EXPERIMENTS_BY_SUBJECT = {
  biology: ["human-body", "mitochondria", "eye", "kidney"],
  chemistry: ["chemistry-equipment", "volcano-experiment", "condenser", "acid-base-neutralization"],
  physics: ["velocity-acceleration", "magnetic-field-wires", "thumb-rule", "magnetic-field-direction"],
};

const ALL_EXPERIMENTS = [...EXPERIMENTS_BY_SUBJECT.biology, ...EXPERIMENTS_BY_SUBJECT.chemistry, ...EXPERIMENTS_BY_SUBJECT.physics];

const BADGE_DEFINITIONS = [
  { id: "Junior Biologist",  subject: "biology",   threshold: 1,  type: "any_perfect" },
  { id: "Biology Pro",       subject: "biology",   threshold: 4,  type: "all_perfect" },
  { id: "Junior Chemist",    subject: "chemistry", threshold: 1,  type: "any_perfect" },
  { id: "Chemistry Pro",     subject: "chemistry", threshold: 4,  type: "all_perfect" },
  { id: "Junior Physicist",  subject: "physics",   threshold: 1,  type: "any_perfect" },
  { id: "Physics Pro",       subject: "physics",   threshold: 4,  type: "all_perfect" },
  { id: "Science Champion",  subject: "all",       threshold: 12, type: "grand_perfect" },
];

export const GamificationProvider = ({ children }) => {
  // Telemetry States (High-Frequency updates)
  const [xp, setXp] = useState(0);
  const [achievement, setAchievement] = useState(null);

  // Metadata States (Low-Frequency updates)
  const [completedQuizzes, setCompletedQuizzes] = useState({});
  const [quizAttempts, setQuizAttempts] = useState([]);
  const [unlockedBadges, setUnlockedBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  const { isOnline } = useOnlineStatus();
  const debounceTimerRef = useRef(null);

  // ⚡ Debounced Persistence Bridge to optimize disk space overhead
  const scheduleDebouncedPersistence = useCallback((updatedXp, updatedQuizzes, updatedBadges) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      const statsPayload = {
        user_id: USER_ID,
        xp: updatedXp,
        completed_quizzes: updatedQuizzes,
        unlocked_badges: updatedBadges
      };
      
      try {
        cacheStats(statsPayload);
        await offlineDb.saveGamificationStatus(statsPayload);
      } catch (error) {
        console.error("Debounced persistence pipeline failure:", error);
      }
    }, DEBOUNCE_DELAY_MS);
  }, []);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, []);

  const fetchStatus = useCallback(async () => {
    try {
      setLoading(true);
      if (!isOnline) {
        throw new Error("Offline mode: skipping gamification fetch");
      }

      const res = await fetch(`${BASE_URL}/api/gamification/status?user_id=${USER_ID}`);
      if (res.ok) {
        const data = await res.json();
        setXp(data.xp);
        setCompletedQuizzes(data.completed_quizzes);
        setQuizAttempts(data.quiz_attempts || []);
        setUnlockedBadges(data.unlocked_badges);
        
        cacheStats(data);
        offlineDb.saveGamificationStatus({
          user_id: USER_ID,
          xp: data.xp,
          completed_quizzes: data.completed_quizzes,
          unlocked_badges: data.unlocked_badges
        });
        offlineDb.saveAllQuizAttempts(data.quiz_attempts || []);
      }
    } catch (err) {
      console.log("Loading offline gamification status:", err.message);
      
      const dbStats = await offlineDb.getGamificationStatus(USER_ID);
      const dbAttempts = await offlineDb.getQuizAttempts();
      
      if (dbStats) {
        setXp(dbStats.xp || 0);
        setCompletedQuizzes(dbStats.completed_quizzes || {});
        setUnlockedBadges(dbStats.unlocked_badges || []);
      } else {
        const cached = readCachedStats();
        setXp(cached.xp || 0);
        setCompletedQuizzes(cached.completed_quizzes || {});
        setUnlockedBadges(cached.unlocked_badges || []);
      }
      
      setQuizAttempts(dbAttempts || []);
    } finally {
      setLoading(false);
    }
  }, [isOnline]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const submitQuiz = useCallback(async (experimentId, score, subject, selectedAnswers = [], totalQuestions = 5) => {
    const attemptedAt = new Date().toISOString();
    const mockAttemptId = `attempt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const attempt = {
      id: mockAttemptId,
      user_id: USER_ID,
      experiment_id: experimentId,
      subject: subject.toLowerCase(),
      selected_answers: selectedAnswers,
      score,
      total_questions: totalQuestions,
      percentage: Math.round((score / totalQuestions) * 100),
      attempted_at: attemptedAt
    };

    const syncPayload = {
      user_id: USER_ID,
      experiment_id: experimentId,
      score,
      total_questions: totalQuestions,
      subject: subject.toLowerCase(),
      selected_answers: selectedAnswers,
      attempted_at: attemptedAt
    };

    const handleLocalFallback = async () => {
      await offlineDb.saveQuizAttempt(attempt);
      
      const currentStats = (await offlineDb.getGamificationStatus(USER_ID)) || {
        xp: xp,
        completed_quizzes: { ...completedQuizzes },
        unlocked_badges: [...unlockedBadges]
      };

      const localCompleted = { ...currentStats.completed_quizzes };
      const localBadges = [...currentStats.unlocked_badges];
      const previousScore = localCompleted[experimentId] ?? -1;
      let xpEarned = 0;

      if (previousScore === -1) {
        xpEarned += experimentId === "weekly-challenge" ? 150 : 50;
        xpEarned += score * 10;
        localCompleted[experimentId] = score;
      } else if (score > previousScore) {
        xpEarned += (score - previousScore) * 10;
        localCompleted[experimentId] = score;
      }

      const updatedXp = currentStats.xp + xpEarned;
      const newBadges = [];

      for (const badge of BADGE_DEFINITIONS) {
        if (localBadges.includes(badge.id)) continue;
        let unlocked = false;

        if (badge.type === "any_perfect") {
          const subjectExps = EXPERIMENTS_BY_SUBJECT[badge.subject];
          unlocked = subjectExps.some(e => localCompleted[e] === 5);
        } else if (badge.type === "all_perfect") {
          const subjectExps = EXPERIMENTS_BY_SUBJECT[badge.subject];
          unlocked = subjectExps.every(e => localCompleted[e] === 5);
        } else if (badge.type === "grand_perfect") {
          unlocked = ALL_EXPERIMENTS.every(e => localCompleted[e] === 5);
        }

        if (unlocked) {
          localBadges.push(badge.id);
          newBadges.push(badge.id);
        }
      }

      if (xpEarned > 0 || newBadges.length > 0) {
        setAchievement({ xpEarned, newBadges, experimentId });
      }

      setXp(updatedXp);
      setCompletedQuizzes(localCompleted);
      setUnlockedBadges(localBadges);
      setQuizAttempts(prev => [attempt, ...prev]);

      scheduleDebouncedPersistence(updatedXp, localCompleted, localBadges);

      return { xpEarned, newBadges, totalXp: updatedXp, attempt };
    };

    const actionId = await offlineDb.queueAction("quiz", syncPayload);

    try {
      if (!isOnline) {
        throw new Error("Offline");
      }
      const res = await fetch(`${BASE_URL}/api/gamification/complete-quiz`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(syncPayload)
      });

      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }

      const data = await res.json();
      
      if (actionId) {
        await offlineDb.dequeueAction(actionId);
      }

      if (data.xp_earned > 0 || data.new_badges.length > 0) {
        setAchievement({
          xpEarned: data.xp_earned,
          newBadges: data.new_badges,
          experimentId
        });
      }

      setXp(data.total_xp);
      setCompletedQuizzes(data.completed_quizzes);
      setQuizAttempts(data.quiz_attempts || []);
      setUnlockedBadges(data.unlocked_badges);
      
      scheduleDebouncedPersistence(data.total_xp, data.completed_quizzes, data.unlocked_badges);
      await offlineDb.saveAllQuizAttempts(data.quiz_attempts || []);

      return {
        xpEarned: data.xp_earned,
        newBadges: data.new_badges,
        totalXp: data.total_xp,
        attempt: data.attempt
      };
    } catch (err) {
      console.log("Fallback execution triggered:", err.message);
      return await handleLocalFallback();
    }
  }, [isOnline, xp, completedQuizzes, unlockedBadges, scheduleDebouncedPersistence]);

  const clearAchievement = useCallback(() => {
  setAchievement(null);
}, []);  

  // Memoized dependency context objects to prevent reference thrashing
  const telemetryContextValue = useMemo(() => ({
    xp,
    achievement,
    clearAchievement
  }), [xp, achievement, clearAchievement]);

  const metaContextValue = useMemo(() => ({
    completedQuizzes,
    quizAttempts,
    unlockedBadges,
    loading,
    submitQuiz,
    refreshStats: fetchStatus
  }), [completedQuizzes, quizAttempts, unlockedBadges, loading, submitQuiz, fetchStatus]);

  return (
    <GamificationMetaContext.Provider value={metaContextValue}>
      <GamificationTelemetryContext.Provider value={telemetryContextValue}>
        {children}
      </GamificationTelemetryContext.Provider>
    </GamificationMetaContext.Provider>
  );
};

// High-frequency tracker consumer hook
export const useGamificationTelemetry = () => {
  const context = useContext(GamificationTelemetryContext);
  if (!context) throw new Error("Context missing: useGamificationTelemetry must be used inside a GamificationProvider.");
  return context;
};

// Structural configuration metadata consumer hook
export const useGamificationMeta = () => {
  const context = useContext(GamificationMetaContext);
  if (!context) throw new Error("Context missing: useGamificationMeta must be used inside a GamificationProvider.");
  return context;
};

// Backward-compatible hook combining both contexts
export const useGamification = () => {
  const meta = useContext(GamificationMetaContext);
  const telemetry = useContext(GamificationTelemetryContext);
  
  if (!meta || !telemetry) {
    console.warn("Returning default metrics fallback.");
    return {
      xp: 0, completedQuizzes: {}, quizAttempts: [], unlockedBadges: [],
      loading: false, achievement: null, submitQuiz: async () => null,
      clearAchievement: () => {}, refreshStats: async () => {}
    };
  }
  
  return { ...meta, ...telemetry };
};
