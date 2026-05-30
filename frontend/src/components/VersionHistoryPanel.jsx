const VersionHistoryPanel = ({ versions, onClose, onRestore }) => {
  return (
    <div className="fixed inset-0 z-[9999] flex justify-end bg-black/40 backdrop-blur-sm transition-all">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Version History</h2>
            <p className="text-xs text-slate-500">Restore previous states of your notebook.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full text-slate-500">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {versions.length === 0 ? (
            <p className="text-slate-500 text-center py-8">No previous versions found.</p>
          ) : (
            versions.map((v) => (
              <div key={v.version} className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 relative group">
                <div className="flex justify-between items-start mb-3">
                  <span className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-400 px-2 py-1 rounded text-xs font-bold">
                    v{v.version}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    {new Date(v.updated_at).toLocaleString()}
                  </span>
                </div>
                
                <div className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3 mb-4 italic">
                  "{v.observations || v.conclusions || v.objective || "Empty entry"}"
                </div>

                <button 
                  onClick={() => onRestore(v)}
                  className="w-full py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-bold rounded-xl text-sm hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-500 transition-colors border border-indigo-200 dark:border-indigo-800"
                >
                  Restore this version
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default VersionHistoryPanel;
