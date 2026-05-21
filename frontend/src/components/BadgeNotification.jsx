import { useEffect } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { useGamification } from "../context/GamificationContext";

const BADGE_ICONS = {
  "Junior Biologist": { emoji: "🔬", color: "from-green-400 to-emerald-600 shadow-emerald-500/20" },
  "Biology Pro": { emoji: "🧬", color: "from-emerald-500 to-teal-700 shadow-teal-500/20" },
  "Junior Chemist": { emoji: "🧪", color: "from-blue-400 to-indigo-600 shadow-blue-500/20" },
  "Chemistry Pro": { emoji: "⚗️", color: "from-purple-500 to-violet-700 shadow-violet-500/20" },
  "Junior Physicist": { emoji: "🧲", color: "from-amber-400 to-orange-600 shadow-orange-500/20" },
  "Physics Pro": { emoji: "⚛️", color: "from-red-500 to-pink-700 shadow-red-500/20" },
  "Science Champion": { emoji: "🏆", color: "from-yellow-400 via-amber-500 to-yellow-600 shadow-yellow-500/30 animate-pulse" }
};

const BadgeNotification = () => {
  const { achievement, clearAchievement } = useGamification();

  // Automatically dismiss after 6 seconds
  useEffect(() => {
    if (achievement) {
      const timer = setTimeout(() => {
        clearAchievement();
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [achievement, clearAchievement]);

  if (!achievement) return null;

  const { xpEarned, newBadges } = achievement;

  return (
    <AnimatePresence>
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {/* XP Gain Notification */}
        {xpEarned > 0 && (
          <Motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="pointer-events-auto bg-slate-900/95 text-white dark:bg-white/95 dark:text-slate-950 p-4 rounded-2xl shadow-2xl flex items-center justify-between border border-slate-800 dark:border-slate-200"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-lg font-bold text-amber-500">
                ⭐
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 dark:text-slate-500">
                  XP Gained!
                </p>
                <p className="text-sm font-bold text-slate-100 dark:text-slate-900">
                  You completed the science quiz
                </p>
              </div>
            </div>
            <div className="text-xl font-black bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent px-2">
              +{xpEarned} XP
            </div>
          </Motion.div>
        )}

        {/* Badge Unlocked Notification(s) */}
        {newBadges.map((badgeName, idx) => {
          const config = BADGE_ICONS[badgeName] || { emoji: "🎉", color: "from-blue-500 to-purple-600" };
          return (
            <Motion.div
              key={badgeName}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300, damping: 20, delay: idx * 0.15 }}
              className="pointer-events-auto overflow-hidden bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-2xl shadow-2xl border border-violet-500/30 p-5 relative"
            >
              {/* Decorative radial background particle glow */}
              <div className="absolute -top-12 -right-12 w-24 h-24 rounded-full bg-violet-600/20 blur-xl pointer-events-none" />

              <div className="flex items-start gap-4">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${config.color} flex items-center justify-center text-3xl shadow-lg shrink-0`}>
                  {config.emoji}
                </div>
                
                <div className="flex-1">
                  <span className="text-[9px] font-black uppercase tracking-widest bg-violet-500/20 text-violet-300 py-0.5 px-2 rounded-full inline-block mb-1 border border-violet-500/20">
                    🏆 New Achievement
                  </span>
                  <h4 className="text-base font-black tracking-tight text-white leading-tight">
                    Badge Unlocked!
                  </h4>
                  <p className="text-xs text-violet-200/90 font-bold mt-1">
                    "{badgeName}"
                  </p>
                  <p className="text-[10px] text-slate-400 mt-2 font-medium">
                    View in your Profile dashboard
                  </p>
                </div>

                <button
                  onClick={clearAchievement}
                  className="text-slate-400 hover:text-white transition-colors text-xs font-semibold self-start"
                >
                  ✕
                </button>
              </div>
            </Motion.div>
          );
        })}
      </div>
    </AnimatePresence>
  );
};

export default BadgeNotification;
