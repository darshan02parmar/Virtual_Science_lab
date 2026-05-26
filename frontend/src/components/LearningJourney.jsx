import { useProgress } from "../context/ProgressContext";
import { useGamification } from "../context/GamificationContext";
import ActivityHeatmap from "./ActivityHeatmap";
import AchievementTimeline from "./AchievementTimeline";

const LearningJourney = () => {
  const { records } = useProgress();
  const { quizAttempts } = useGamification();

  return (
    <div className="max-w-5xl mx-auto py-6 animate-fade-in">
      <div className="mb-10">
        <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-2">Scientific Learning Journey</h2>
        <p className="text-slate-500 dark:text-slate-400">Track your momentum, milestones, and consistency.</p>
      </div>
      
      <ActivityHeatmap records={records} quizAttempts={quizAttempts} />
      
      <div className="mb-6">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white">Achievement Timeline</h3>
      </div>
      <AchievementTimeline records={records} quizAttempts={quizAttempts} />
    </div>
  );
};

export default LearningJourney;
