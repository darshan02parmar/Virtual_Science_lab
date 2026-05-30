import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useNotebook } from "../context/NotebookContext";
import { EXPERIMENT_CATALOG } from "../data/experiments";
import BackButton from "../components/BackButton";
import VersionHistoryPanel from "../components/VersionHistoryPanel";

const NotebookEditor = () => {
  const { experimentId } = useParams();
  const { notebooks, loading, upsertNotebook, getNotebookVersions } = useNotebook();
  
  const [formData, setFormData] = useState({
    objective: "",
    procedure_summary: "",
    observations: "",
    results: "",
    conclusions: "",
    reflection: "",
    tags: ""
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [versions, setVersions] = useState([]);
  const [experimentName, setExperimentName] = useState("Research Entry");
  
  const typingTimeoutRef = useRef(null);
  const initialLoadDone = useRef(false);

  useEffect(() => {
    const exp = EXPERIMENT_CATALOG.find(e => e.id === experimentId);
    if (exp) setExperimentName(exp.title);
    
    if (!loading && !initialLoadDone.current) {
      const entry = notebooks[experimentId];
      if (entry) {
        setFormData({
          objective: entry.objective || "",
          procedure_summary: entry.procedure_summary || "",
          observations: entry.observations || "",
          results: entry.results || "",
          conclusions: entry.conclusions || "",
          reflection: entry.reflection || "",
          tags: entry.tags ? entry.tags.join(", ") : ""
        });
        if (entry.updated_at) {
          setLastSaved(new Date(entry.updated_at));
        }
      }
      initialLoadDone.current = true;
    }
  }, [experimentId, notebooks, loading]);

  const loadVersions = useCallback(async () => {
    const v = await getNotebookVersions(experimentId);
    setVersions(v);
  }, [experimentId, getNotebookVersions]);

  useEffect(() => {
    if (showHistory) loadVersions();
  }, [showHistory, loadVersions]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    
    setIsSaving(true);
    typingTimeoutRef.current = setTimeout(async () => {
      const currentForm = { ...formData, [field]: value };
      const tagsArray = currentForm.tags.split(",").map(t => t.trim()).filter(Boolean);
      await upsertNotebook(experimentId, {
        ...currentForm,
        tags: tagsArray
      });
      setIsSaving(false);
      setLastSaved(new Date());
    }, 1500); // Auto-save after 1.5s of no typing
  };

  const restoreVersion = async (versionData) => {
    setFormData({
      objective: versionData.objective || "",
      procedure_summary: versionData.procedure_summary || "",
      observations: versionData.observations || "",
      results: versionData.results || "",
      conclusions: versionData.conclusions || "",
      reflection: versionData.reflection || "",
      tags: versionData.tags ? versionData.tags.join(", ") : ""
    });
    
    setIsSaving(true);
    await upsertNotebook(experimentId, {
      ...versionData,
      tags: versionData.tags || []
    });
    setIsSaving(false);
    setLastSaved(new Date());
    setShowHistory(false);
  };

  if (loading && !initialLoadDone.current) {
    return <div className="min-h-screen flex items-center justify-center dark:bg-slate-900 text-slate-500">Loading editor...</div>;
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6 md:p-12 fade-in relative">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <BackButton label="Back to Notebooks" to="/notebook" />
          
          <div className="flex items-center gap-4">
            <div className="text-xs font-medium text-slate-500 bg-slate-200 dark:bg-slate-800 px-3 py-1.5 rounded-full flex items-center gap-2 shadow-sm">
              {isSaving ? (
                <>
                  <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                  Saving...
                </>
              ) : (
                <>
                  <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                  {lastSaved ? `Saved ${lastSaved.toLocaleTimeString()}` : "Ready"}
                </>
              )}
            </div>
            <button 
              onClick={() => setShowHistory(true)}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-sm flex items-center gap-2"
            >
              <span>🕒</span> History
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl border border-slate-200 dark:border-slate-700">
          <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-6 pb-6 border-b border-slate-100 dark:border-slate-700">
            {experimentName}
          </h1>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Objective</label>
                <textarea 
                  value={formData.objective}
                  onChange={(e) => handleChange("objective", e.target.value)}
                  placeholder="What are you trying to achieve?"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 min-h-[120px] focus:ring-2 focus:ring-teal-500 outline-none text-slate-800 dark:text-slate-200 custom-scrollbar"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Procedure Summary</label>
                <textarea 
                  value={formData.procedure_summary}
                  onChange={(e) => handleChange("procedure_summary", e.target.value)}
                  placeholder="Briefly describe what you did."
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 min-h-[120px] focus:ring-2 focus:ring-teal-500 outline-none text-slate-800 dark:text-slate-200 custom-scrollbar"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1 flex items-center gap-2">
                <span className="text-teal-500">👁️</span> Observations
              </label>
              <textarea 
                value={formData.observations}
                onChange={(e) => handleChange("observations", e.target.value)}
                placeholder="What did you see, hear, or measure?"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 min-h-[150px] focus:ring-2 focus:ring-teal-500 outline-none text-slate-800 dark:text-slate-200 custom-scrollbar"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1 flex items-center gap-2">
                <span className="text-blue-500">📊</span> Results
              </label>
              <textarea 
                value={formData.results}
                onChange={(e) => handleChange("results", e.target.value)}
                placeholder="Data, calculations, or final outcomes."
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 min-h-[150px] focus:ring-2 focus:ring-teal-500 outline-none text-slate-800 dark:text-slate-200 custom-scrollbar"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1 flex items-center gap-2">
                <span className="text-purple-500">💡</span> Conclusions
              </label>
              <textarea 
                value={formData.conclusions}
                onChange={(e) => handleChange("conclusions", e.target.value)}
                placeholder="What does this mean? Was your hypothesis correct?"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 min-h-[150px] focus:ring-2 focus:ring-teal-500 outline-none text-slate-800 dark:text-slate-200 custom-scrollbar"
              />
            </div>

            <div className="space-y-2 p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800/50">
              <label className="text-sm font-bold text-indigo-900 dark:text-indigo-300 ml-1 flex items-center gap-2">
                <span className="text-indigo-500">🧠</span> Scientific Reflection
              </label>
              <p className="text-xs text-indigo-700/70 dark:text-indigo-400/70 ml-1 mb-2">What surprised you? What would you do differently next time? What new questions do you have?</p>
              <textarea 
                value={formData.reflection}
                onChange={(e) => handleChange("reflection", e.target.value)}
                placeholder="Reflect on your learning experience..."
                className="w-full bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800/50 rounded-xl p-4 min-h-[120px] focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 dark:text-slate-200 custom-scrollbar"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Tags (comma separated)</label>
              <input 
                type="text"
                value={formData.tags}
                onChange={(e) => handleChange("tags", e.target.value)}
                placeholder="e.g. physics, electricity, failed-attempt"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 focus:ring-2 focus:ring-teal-500 outline-none text-slate-800 dark:text-slate-200"
              />
            </div>

          </div>
        </div>
      </div>

      {showHistory && (
        <VersionHistoryPanel 
          versions={versions} 
          onClose={() => setShowHistory(false)} 
          onRestore={restoreVersion}
        />
      )}
    </main>
  );
};

export default NotebookEditor;
