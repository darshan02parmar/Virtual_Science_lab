const DifficultyPredictionModal = ({ prediction, experimentTitle, onClose }) => {
  if (!prediction) return null;

  const { expected_difficulty, estimated_time_minutes, success_probability, readiness_level, reasons, recommendations } = prediction;

  const renderStars = (count) => {
    return Array(5).fill(0).map((_, i) => (
      <span key={i} className={`text-xl ${i < count ? 'text-amber-400' : 'text-slate-300 dark:text-slate-700'}`}>
        ★
      </span>
    ));
  };

  let readinessColor = "text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20";
  if (readiness_level === "Medium") readinessColor = "text-amber-500 bg-amber-50 dark:bg-amber-900/20";
  if (readiness_level === "Low") readinessColor = "text-rose-500 bg-rose-50 dark:bg-rose-900/20";

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div 
        className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700 transform transition-all animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 md:p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">
                Experiment Readiness
              </h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium">{experimentTitle}</p>
            </div>
            <button onClick={onClose} className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full text-slate-500 transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 text-center">
              <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Expected Difficulty</span>
              <div className="flex justify-center">{renderStars(expected_difficulty)}</div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 text-center">
              <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Estimated Time</span>
              <span className="text-xl font-black text-slate-800 dark:text-slate-200">{estimated_time_minutes} min</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 mb-6 rounded-2xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
            <div>
              <span className="block text-sm font-bold text-slate-500">Success Probability</span>
              <span className="text-3xl font-black text-slate-900 dark:text-white">{success_probability}%</span>
            </div>
            <div className={`px-4 py-2 rounded-xl font-black text-sm uppercase tracking-wider ${readinessColor}`}>
              {readiness_level} Readiness
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
                <span className="text-emerald-500">✓</span> Analysis
              </h3>
              <ul className="space-y-2">
                {reasons.map((r, idx) => (
                  <li key={idx} className="text-sm text-slate-600 dark:text-slate-400 flex items-start gap-2">
                    <span className="text-slate-300 dark:text-slate-600 mt-0.5">•</span> {r}
                  </li>
                ))}
              </ul>
            </div>

            {recommendations.length > 0 && (
              <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-2xl">
                <h3 className="text-sm font-bold text-indigo-900 dark:text-indigo-300 mb-2 flex items-center gap-2">
                  <span className="text-indigo-500">💡</span> Recommended Preparation
                </h3>
                <ul className="space-y-1.5">
                  {recommendations.map((rec, idx) => (
                    <li key={idx} className="text-sm text-indigo-700/80 dark:text-indigo-400/80 flex items-start gap-2">
                      <span className="mt-0.5 text-indigo-400/50">→</span> {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          <button 
            onClick={onClose}
            className="w-full mt-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-indigo-200 dark:shadow-none"
          >
            Got it, thanks!
          </button>
        </div>
      </div>
    </div>
  );
};

export default DifficultyPredictionModal;
