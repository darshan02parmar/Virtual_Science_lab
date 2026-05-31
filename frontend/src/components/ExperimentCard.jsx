import { Link } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { useState } from "react";
import { useProgress } from "../context/ProgressContext";
import { usePredictions } from "../context/PredictionContext";
import SuccessProbabilityBadge from "./SuccessProbabilityBadge";
import DifficultyPredictionModal from "./DifficultyPredictionModal";

const getSubjectIcon = (subject) => {
  const normalizedSubject = subject?.trim().toLowerCase();

  if (normalizedSubject === "biology") return "🧬";
  if (normalizedSubject === "chemistry") return "🧪";
  if (normalizedSubject === "physics") return "⚡";

  return "🔬";
};

const ExperimentCard = ({ 
  id, title, description, link, subject, difficulty, 
  isRecommendation = false, recommendationReason, colorTheme 
}) => {
  const { completedIds, markExperimentComplete } = useProgress();
  const { getPrediction } = usePredictions();
  const [showPrediction, setShowPrediction] = useState(false);

  const isCompleted = completedIds.has(id);
  const prediction = getPrediction(id);

  const handleComplete = (event) => {
    event.preventDefault();
    event.stopPropagation();
    markExperimentComplete({ id, title, subject });
  };

  const handlePredictionClick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setShowPrediction(true);
  };

  // Fallback themes if colorTheme isn't provided
  const theme = colorTheme || {
    bg: "bg-indigo-500",
    text: "text-indigo-500",
    border: "border-indigo-500/20",
    hoverBorder: "hover:border-indigo-500/50"
  };

  return (
    <Link to={link} className="block group relative outline-none">
      <motion.div 
        whileHover={{ y: -8, scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className={`relative h-full flex flex-col bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-md transition-all duration-300 overflow-hidden ${theme.hoverBorder} hover:shadow-2xl z-10`}
      >
        {/* Subtle Background Glow */}
        <div className={`absolute -top-20 -right-20 w-40 h-40 ${theme.bg} rounded-full blur-3xl opacity-5 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none`} />

        <div className="flex justify-between items-start mb-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-50 dark:bg-slate-950 border ${theme.border} text-xl shadow-inner`}>
              {getSubjectIcon(subject)}
            </div>
            <div>
              {difficulty && (
                <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider mb-1 ${
                  difficulty === 'Beginner' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' :
                  difficulty === 'Intermediate' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400' :
                  'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400'
                }`}>
                  {difficulty}
                </span>
              )}
              {isRecommendation && recommendationReason && (
                <span className={`inline-block ml-2 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider mb-1 bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-400`}>
                  {recommendationReason}
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            {isCompleted && (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-black shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Done
              </div>
            )}
            {prediction && !isCompleted && (
              <SuccessProbabilityBadge 
                probability={prediction.success_probability} 
                onClick={handlePredictionClick} 
              />
            )}
          </div>
        </div>

        <h3 className="text-xl font-black text-slate-800 dark:text-white mb-2 line-clamp-1 relative z-10">
          {title}
        </h3>
        
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-6 flex-grow line-clamp-2 leading-relaxed relative z-10">
          {description}
        </p>

        <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100 dark:border-slate-800/60 relative z-10">
          <button
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              isCompleted 
                ? "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                : `${theme.bg} text-white hover:opacity-90 active:scale-95 shadow-md`
            }`}
            disabled={isCompleted}
            onClick={handleComplete}
            type="button"
          >
            {isCompleted ? "Completed" : "Mark Done"}
          </button>
          
          <span className={`text-xs font-black uppercase tracking-wider flex items-center gap-1 transition-transform group-hover:translate-x-1 ${theme.text}`}>
            Launch Lab <span className="text-lg leading-none">&rarr;</span>
          </span>
        </div>
      </motion.div>

      {showPrediction && (
        <DifficultyPredictionModal 
          prediction={prediction} 
          experimentTitle={title}
          onClose={(e) => {
            if(e) { e.preventDefault(); e.stopPropagation(); }
            setShowPrediction(false);
          }} 
        />
      )}
    </Link>
  );
};

export default ExperimentCard;
