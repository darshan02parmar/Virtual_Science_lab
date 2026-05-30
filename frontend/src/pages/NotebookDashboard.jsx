import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useNotebook } from "../context/NotebookContext";
import BackButton from "../components/BackButton";

const formatSubject = (subject) => subject.charAt(0).toUpperCase() + subject.slice(1);

const NotebookDashboard = () => {
  const { notebooks, loading } = useNotebook();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSubject, setFilterSubject] = useState("all");

  const notebookList = useMemo(() => Object.values(notebooks), [notebooks]);

  const filteredNotebooks = useMemo(() => {
    return notebookList
      .filter((nb) => filterSubject === "all" || nb.subject === filterSubject)
      .filter((nb) => {
        const query = searchTerm.toLowerCase();
        return (
          nb.title.toLowerCase().includes(query) ||
          nb.subject.toLowerCase().includes(query) ||
          (nb.tags && nb.tags.some((tag) => tag.toLowerCase().includes(query))) ||
          (nb.observations && nb.observations.toLowerCase().includes(query)) ||
          (nb.conclusions && nb.conclusions.toLowerCase().includes(query))
        );
      })
      .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
  }, [notebookList, searchTerm, filterSubject]);

  // Group by month
  const groupedByMonth = useMemo(() => {
    const groups = {};
    filteredNotebooks.forEach((nb) => {
      const date = new Date(nb.updated_at);
      const monthYear = date.toLocaleString("default", { month: "long", year: "numeric" });
      if (!groups[monthYear]) groups[monthYear] = [];
      groups[monthYear].push(nb);
    });
    return groups;
  }, [filteredNotebooks]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center dark:bg-slate-900 text-slate-500">Loading your scientific journal...</div>;
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6 md:p-12 fade-in">
      <div className="max-w-5xl mx-auto relative">
        <BackButton label="Back to Lab" />
        
        <div className="mb-10 mt-4 text-center">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
            Research <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500">Notebook</span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Your centralized scientific journal. Keep track of experiments, document observations, and reflect on your discoveries over time.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <span className="absolute left-4 top-3 text-slate-400">🔍</span>
            <input
              type="text"
              placeholder='Search journals (e.g. "magnetic field", "chemistry")'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-100 dark:bg-slate-900 border-none rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 transition-all outline-none"
            />
          </div>
          <select
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
            className="px-4 py-3 bg-slate-100 dark:bg-slate-900 border-none rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 transition-all outline-none"
          >
            <option value="all">All Subjects</option>
            <option value="physics">Physics</option>
            <option value="chemistry">Chemistry</option>
            <option value="biology">Biology</option>
          </select>
        </div>

        {/* Timeline */}
        {filteredNotebooks.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 mt-8">
            <span className="text-5xl mb-4 block">📓</span>
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">No entries found</h3>
            <p className="text-slate-500 dark:text-slate-400">Complete an experiment and write your first journal entry to see it here!</p>
          </div>
        ) : (
          <div className="space-y-10 mt-8">
            {Object.entries(groupedByMonth).map(([month, entries]) => (
              <div key={month} className="relative">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6 sticky top-20 bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur-md py-2 z-10 border-b border-slate-200 dark:border-slate-800">
                  {month}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-2 md:pl-4 border-l-2 border-teal-100 dark:border-teal-900/50 ml-4 md:ml-6">
                  {entries.map((entry) => (
                    <Link
                      to={`/notebook/${entry.experiment_id}`}
                      key={entry.experiment_id}
                      className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-transparent hover:border-teal-500 group relative -ml-8 md:-ml-10 hover:-translate-y-1"
                    >
                      {/* Timeline dot */}
                      <div className="absolute top-8 -left-4 w-4 h-4 rounded-full bg-teal-500 border-4 border-slate-50 dark:border-slate-900 group-hover:scale-125 transition-transform" />
                      
                      <div className="flex justify-between items-start mb-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                          ${entry.subject === 'physics' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 
                            entry.subject === 'chemistry' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 
                            'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'}`}
                        >
                          {entry.subject}
                        </span>
                        <span className="text-xs text-slate-400 font-medium bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded-lg">
                          v{entry.version || 1}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-teal-500 transition-colors">
                        {entry.title}
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-3 mb-4">
                        {entry.conclusions || entry.observations || entry.objective || "No content written yet."}
                      </p>
                      <div className="flex justify-between items-center mt-auto pt-4 border-t border-slate-100 dark:border-slate-700">
                        <span className="text-xs text-slate-500 font-medium">
                          {new Date(entry.updated_at).toLocaleDateString()}
                        </span>
                        <span className="text-sm font-bold text-teal-600 dark:text-teal-400 group-hover:translate-x-1 transition-transform">
                          Open Journal &rarr;
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default NotebookDashboard;
