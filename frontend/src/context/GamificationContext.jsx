/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";
import API_URL from "../config";

const GamificationContext = createContext();

// Dynamic URL resolver: automatically defaults to localhost in dev environment, otherwise uses config
const BASE_URL = 
  typeof window !== "undefined" && 
  (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
    ? "http://127.0.0.1:8000"
    : API_URL;

export const GamificationProvider = ({ children }) => {
  const [xp, setXp] = useState(0);
  const [completedQuizzes, setCompletedQuizzes] = useState({});
  const [unlockedBadges, setUnlockedBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [achievement, setAchievement] = useState(null);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/api/gamification/status?user_id=default-student`);
      if (res.ok) {
        const data = await res.json();
        setXp(data.xp);
        setCompletedQuizzes(data.completed_quizzes);
        setUnlockedBadges(data.unlocked_badges);
      }
    } catch (err) {
      console.error("Failed to load gamification status:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const submitQuiz = async (experimentId, score, subject) => {
    try {
      const res = await fetch(`${BASE_URL}/api/gamification/complete-quiz`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: "default-student",
          experiment_id: experimentId,
          score,
          total_questions: 3,
          subject: subject.toLowerCase()
        })
      });

      if (res.ok) {
        const data = await res.json();
        
        // If the user earned XP or unlocked a badge, trigger a celebration popup
        if (data.xp_earned > 0 || data.new_badges.length > 0) {
          setAchievement({
            xpEarned: data.xp_earned,
            newBadges: data.new_badges,
            experimentId
          });
        }

        // Sync local React state
        setXp(data.total_xp);
        setCompletedQuizzes(data.completed_quizzes);
        setUnlockedBadges(data.unlocked_badges);

        return {
          xpEarned: data.xp_earned,
          newBadges: data.new_badges,
          totalXp: data.total_xp
        };
      }
      return null;
    } catch (err) {
      console.error("Failed to submit quiz score:", err);
      return null;
    }
  };

  const clearAchievement = () => {
    setAchievement(null);
  };

  return (
    <GamificationContext.Provider
      value={{
        xp,
        completedQuizzes,
        unlockedBadges,
        loading,
        achievement,
        submitQuiz,
        clearAchievement,
        refreshStats: fetchStatus
      }}
    >
      {children}
    </GamificationContext.Provider>
  );
};

export const useGamification = () => useContext(GamificationContext);
