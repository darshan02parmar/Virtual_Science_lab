const SuccessProbabilityBadge = ({ probability, onClick }) => {
  if (probability === undefined || probability === null) return null;

  let colorClass = "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/50";
  if (probability < 70) {
    colorClass = "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/50";
  }
  if (probability < 50) {
    colorClass = "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800/50";
  }

  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-sm transition-transform hover:scale-105 z-20 ${colorClass}`}
      title="Click for difficulty prediction"
    >
      <span>🎯</span> {probability}% Success
    </button>
  );
};

export default SuccessProbabilityBadge;
