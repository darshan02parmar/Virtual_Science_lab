/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import API_URL from "../config";

const ReportsContext = createContext();
const USER_ID = "default-student";
const STORAGE_KEY = "vsl-lab-reports";

const BASE_URL =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
    ? "http://127.0.0.1:8000"
    : API_URL;

const readLocalReports = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
};

const writeLocalReports = (reports) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
};

const downloadFile = (filename, content, type) => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

const reportToMarkdown = (report) =>
  [
    `# ${report.title}`,
    "",
    `**Subject:** ${report.subject}`,
    `**Experiment ID:** ${report.experiment_id}`,
    `**Generated At:** ${report.generated_at}`,
    `**Status:** ${report.status}`,
    "",
    "## Objective",
    report.objective,
    "",
    "## Procedure",
    report.procedure,
    "",
    "## Observations",
    report.observations,
    "",
    "## Results",
    report.results,
    "",
    "## Conclusions",
    report.conclusions,
    "",
    "## Quiz Performance",
    report.quiz_performance,
    "",
  ].join("\n");

export const ReportsProvider = ({ children }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usingLocalFallback, setUsingLocalFallback] = useState(false);

  const refreshReports = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/reports/${USER_ID}`);
      if (!res.ok) throw new Error("Reports API unavailable");
      const data = await res.json();
      setReports(data);
      writeLocalReports(data);
      setUsingLocalFallback(false);
      return data;
    } catch {
      const local = readLocalReports();
      setReports(local);
      setUsingLocalFallback(true);
      return local;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshReports();
  }, [refreshReports]);

  const generateReport = useCallback(async (experimentId) => {
    const draftId = Date.now();
    try {
      const res = await fetch(`${BASE_URL}/api/reports/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: USER_ID, experiment_id: experimentId }),
      });
      if (!res.ok) throw new Error("Report generation unavailable");
      const report = await res.json();
      setReports((prev) => {
        const next = [report, ...prev.filter((item) => item.id !== report.id)];
        writeLocalReports(next);
        return next;
      });
      setUsingLocalFallback(false);
      return report;
    } catch {
      const report = {
        id: draftId,
        user_id: USER_ID,
        experiment_id: experimentId,
        title: experimentId.replaceAll("-", " ").replace(/\b\w/g, (char) => char.toUpperCase()),
        subject: "science",
        objective: "Complete the experiment and document the objective.",
        procedure: "Describe the procedure followed during the virtual experiment.",
        observations: "Add your observations.",
        results: "Summarize the experiment result and quiz performance.",
        conclusions: "Write your conclusion.",
        quiz_performance: "Quiz performance unavailable while offline.",
        status: "draft",
        generated_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setReports((prev) => {
        const next = [report, ...prev];
        writeLocalReports(next);
        return next;
      });
      setUsingLocalFallback(true);
      return report;
    }
  }, []);

  const updateReport = useCallback(async (reportId, payload) => {
    const optimistic = { ...payload, id: reportId, updated_at: new Date().toISOString() };
    setReports((prev) => {
      const next = prev.map((report) => (report.id === reportId ? { ...report, ...optimistic } : report));
      writeLocalReports(next);
      return next;
    });

    try {
      const res = await fetch(`${BASE_URL}/api/reports/${reportId}/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Report update unavailable");
      const updated = await res.json();
      setReports((prev) => {
        const next = prev.map((report) => (report.id === reportId ? updated : report));
        writeLocalReports(next);
        return next;
      });
      setUsingLocalFallback(false);
      return updated;
    } catch {
      setUsingLocalFallback(true);
      return null;
    }
  }, []);

  const exportMarkdown = useCallback(async (report) => {
    try {
      const res = await fetch(`${BASE_URL}/api/reports/${USER_ID}/${report.id}/export/md`);
      if (!res.ok) throw new Error("Markdown export unavailable");
      const markdown = await res.text();
      downloadFile(`${report.experiment_id}-lab-report.md`, markdown, "text/markdown");
      setUsingLocalFallback(false);
    } catch {
      downloadFile(`${report.experiment_id}-lab-report.md`, reportToMarkdown(report), "text/markdown");
      setUsingLocalFallback(true);
    }
  }, []);

  const api = useMemo(
    () => ({
      reports,
      loading,
      usingLocalFallback,
      refreshReports,
      generateReport,
      updateReport,
      exportMarkdown,
      reportToMarkdown,
    }),
    [exportMarkdown, generateReport, loading, refreshReports, reports, updateReport, usingLocalFallback]
  );

  return <ReportsContext.Provider value={api}>{children}</ReportsContext.Provider>;
};

export const useReports = () => useContext(ReportsContext);
