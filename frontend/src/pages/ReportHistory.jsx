import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import BackButton from "../components/BackButton";
import VirtualLabReportPreview from "../components/VirtualLabReportPreview";
import { useReports } from "../context/ReportsContext";
import { EXPERIMENT_CATALOG, SUBJECTS } from "../data/experiments";

const formatDate = (value) => {
  if (!value) return "Draft";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
};

const formatSubject = (subject) => subject.charAt(0).toUpperCase() + subject.slice(1);

const ReportHistory = () => {
  const { reports, loading, usingLocalFallback, generateReport, exportMarkdown } = useReports();
  const [selectedReport, setSelectedReport] = useState(null);
  const [generatingId, setGeneratingId] = useState(null);
  const [subjectFilter, setSubjectFilter] = useState("all");

  const filteredReports = useMemo(
    () =>
      subjectFilter === "all"
        ? reports
        : reports.filter((report) => report.subject === subjectFilter),
    [reports, subjectFilter]
  );

  const reportsByExperiment = useMemo(() => {
    const grouped = new Map();
    reports.forEach((report) => {
      const existing = grouped.get(report.experiment_id) || [];
      grouped.set(report.experiment_id, [...existing, report]);
    });
    return grouped;
  }, [reports]);

  const handleGenerate = async (experimentId) => {
    setGeneratingId(experimentId);
    const report = await generateReport(experimentId);
    setGeneratingId(null);
    setSelectedReport(report);
  };

  if (loading) {
    return (
      <main className="progress-dashboard">
        <div className="tracker-loading">Loading lab reports...</div>
      </main>
    );
  }

  return (
    <main className="progress-dashboard fade-in">
      <BackButton label="Back to Lab" />

      <section className="tracker-hero">
        <div>
          <p className="tracker-kicker">Academic lab documentation</p>
          <h1>Virtual Lab Reports</h1>
          <p>
            Generate structured reports from saved observations, conclusions, completion state,
            and quiz performance.
          </p>
        </div>
        <div className="tracker-score">
          <span>{reports.length}</span>
          <small>reports saved</small>
        </div>
      </section>

      {usingLocalFallback && (
        <div className="tracker-notice">
          Report drafts are being saved in this browser until the backend is available.
        </div>
      )}

      <section className="tracker-panel mt-6">
        <div className="tracker-panel-heading">
          <h2>Generate Experiment Report</h2>
          <span>{EXPERIMENT_CATALOG.length} experiments</span>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {EXPERIMENT_CATALOG.map((experiment) => {
            const history = reportsByExperiment.get(experiment.id) || [];
            return (
              <div
                key={experiment.id}
                className="flex flex-col gap-3 rounded-lg border border-slate-200 p-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <strong className="block text-slate-900 dark:text-slate-100">{experiment.title}</strong>
                  <span className="text-sm font-semibold text-slate-500">
                    {formatSubject(experiment.subject)} | {history.length} previous reports
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleGenerate(experiment.id)}
                  disabled={generatingId === experiment.id}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-500 disabled:cursor-wait disabled:opacity-70"
                >
                  {generatingId === experiment.id ? "Generating..." : "Generate"}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      <section className="tracker-panel mt-6">
        <div className="tracker-panel-heading">
          <h2>Report History</h2>
          <div className="flex gap-2">
            {["all", ...SUBJECTS].map((subject) => (
              <button
                key={subject}
                type="button"
                onClick={() => setSubjectFilter(subject)}
                className={`rounded-lg px-3 py-1.5 text-xs font-black uppercase ${
                  subjectFilter === subject
                    ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                    : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                }`}
              >
                {subject}
              </button>
            ))}
          </div>
        </div>

        <div className="tracker-history">
          {filteredReports.length === 0 ? (
            <p className="tracker-empty">No reports yet. Generate one from a completed experiment.</p>
          ) : (
            filteredReports.map((report) => {
              const experiment = EXPERIMENT_CATALOG.find((item) => item.id === report.experiment_id);
              return (
                <div className="tracker-history-item" key={report.id}>
                  <div>
                    <strong>{report.title}</strong>
                    <span>
                      {formatSubject(report.subject)} - {formatDate(report.updated_at)} - {report.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {experiment && (
                      <Link to={experiment.link} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-bold text-slate-700 no-underline hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
                        Experiment
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={() => setSelectedReport(report)}
                      className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-bold text-white hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900"
                    >
                      Preview
                    </button>
                    <button
                      type="button"
                      onClick={() => exportMarkdown(report)}
                      className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-bold text-white hover:bg-blue-500"
                    >
                      MD
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {selectedReport && (
        <VirtualLabReportPreview
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
        />
      )}
    </main>
  );
};

export default ReportHistory;
