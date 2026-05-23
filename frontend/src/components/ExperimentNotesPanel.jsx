import { useEffect, useMemo, useRef, useState } from "react";
import { useNotes } from "../context/useNotes";
import { useReports } from "../context/ReportsContext";
import VirtualLabReportPreview from "./VirtualLabReportPreview";

const DEBOUNCE_MS = 900;

const formatTimestamp = (iso) => {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d.toLocaleString();
  } catch {
    return "";
  }
};

const buildExportContent = (experimentId, fields, format = "txt") => {
  const title = `Experiment Notes - ${experimentId}`;
  const sections = [
    ["Observations", fields.observations],
    ["Conclusions / Results", fields.conclusions],
    ["Important Learnings", fields.learnings],
    ["Additional Notes", fields.notes],
  ];

  if (format === "md") {
    return [
      `# ${title}`,
      "",
      ...sections.flatMap(([heading, value]) => [`## ${heading}`, value || "_No entry_", ""]),
    ].join("\n");
  }

  return [
    title,
    "=".repeat(title.length),
    "",
    ...sections.flatMap(([heading, value]) => [`${heading}:`, value || "No entry", ""]),
  ].join("\n");
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

const ExperimentNotesPanel = ({ experimentId }) => {
  const { getNotes, refreshNotesForExperiment, upsertNotes, usingLocalFallback } = useNotes();
  const { generateReport } = useReports();

  const [observations, setObservations] = useState("");
  const [conclusions, setConclusions] = useState("");
  const [learnings, setLearnings] = useState("");
  const [notes, setNotes] = useState("");
  const [readyToSave, setReadyToSave] = useState(false);
  const [status, setStatus] = useState({ saving: false, savedAt: null });
  const [reportPreview, setReportPreview] = useState(null);
  const [generatingReport, setGeneratingReport] = useState(false);

  const lastLoadedRef = useRef(null);
  const saveTimerRef = useRef(null);

  const loadedNotes = getNotes(experimentId);

  useEffect(() => {
    if (!experimentId) return;
    if (lastLoadedRef.current === experimentId) return;
    lastLoadedRef.current = experimentId;
    setReadyToSave(false);

    (async () => {
      const data = loadedNotes;
      if (data) {
        setObservations(data.observations || "");
        setConclusions(data.conclusions || "");
        setLearnings(data.learnings || "");
        setNotes(data.notes || "");
        setStatus({ saving: false, savedAt: data.updated_at || null });
        setReadyToSave(true);
        return;
      }

      const refreshed = await refreshNotesForExperiment(experimentId);
      setObservations(refreshed?.observations || "");
      setConclusions(refreshed?.conclusions || "");
      setLearnings(refreshed?.learnings || "");
      setNotes(refreshed?.notes || "");
      setStatus({ saving: false, savedAt: refreshed?.updated_at || null });
      setReadyToSave(true);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [experimentId]);

  const draftPayload = useMemo(
    () => ({ observations, conclusions, learnings, notes }),
    [observations, conclusions, learnings, notes]
  );

  useEffect(() => {
    if (!experimentId || !readyToSave) return;

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

    setStatus((s) => ({ ...s, saving: true }));

    saveTimerRef.current = setTimeout(async () => {
      const res = await upsertNotes(experimentId, draftPayload);
      if (res?.updated_at) {
        setStatus({ saving: false, savedAt: res.updated_at });
      } else {
        setStatus((s) => ({
          ...s,
          saving: false,
          savedAt: s.savedAt || new Date().toISOString(),
        }));
      }
    }, DEBOUNCE_MS);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [draftPayload, experimentId, readyToSave, upsertNotes]);

  const handleExportTxt = () => {
    downloadFile(
      `${experimentId}-notes.txt`,
      buildExportContent(experimentId, draftPayload, "txt"),
      "text/plain"
    );
  };

  const handleExportMarkdown = () => {
    downloadFile(
      `${experimentId}-notes.md`,
      buildExportContent(experimentId, draftPayload, "md"),
      "text/markdown"
    );
  };

  const handlePrintPdf = () => {
    const printWindow = window.open("", "_blank", "width=800,height=900");
    if (!printWindow) return;

    const printable = buildExportContent(experimentId, draftPayload, "md")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    printWindow.document.write(`
      <html>
        <head>
          <title>${experimentId} notes</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; padding: 32px; color: #111827; }
            pre { white-space: pre-wrap; font-family: inherit; }
          </style>
        </head>
        <body><pre>${printable}</pre></body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const handleGenerateReport = async () => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    setStatus((s) => ({ ...s, saving: true }));
    await upsertNotes(experimentId, draftPayload);
    setStatus((s) => ({ ...s, saving: false, savedAt: new Date().toISOString() }));
    setGeneratingReport(true);
    const report = await generateReport(experimentId);
    setGeneratingReport(false);
    setReportPreview(report);
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h2 className="text-2xl font-bold mb-1">Experiment Notes</h2>
          <p className="text-gray-600">
            Record observations, conclusions, and key learnings. Autosaves while typing.
          </p>
        </div>
        <div className="text-right">
          {status.saving ? (
            <div className="text-sm text-blue-700">Saving...</div>
          ) : (
            <div className="text-sm text-gray-500">
              {usingLocalFallback ? "Saved locally" : "Saved"} {formatTimestamp(status.savedAt)}
            </div>
          )}
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleExportTxt}
          className="rounded bg-gray-900 px-3 py-2 text-sm font-semibold text-white hover:bg-gray-700"
        >
          Export TXT
        </button>
        <button
          type="button"
          onClick={handleExportMarkdown}
          className="rounded bg-blue-700 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-600"
        >
          Export Markdown
        </button>
        <button
          type="button"
          onClick={handlePrintPdf}
          className="rounded border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-100"
        >
          Print / Save PDF
        </button>
        <button
          type="button"
          onClick={handleGenerateReport}
          disabled={generatingReport}
          className="rounded bg-emerald-700 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-600 disabled:cursor-wait disabled:opacity-70"
        >
          {generatingReport ? "Generating Report..." : "Generate Lab Report"}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">Observations</label>
          <textarea
            className="w-full min-h-[120px] border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
            placeholder="What did you observe during the experiment? (e.g., color change, temperature change, measurements)"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">Conclusions / Results</label>
          <textarea
            className="w-full min-h-[100px] border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={conclusions}
            onChange={(e) => setConclusions(e.target.value)}
            placeholder="Summarize the results and what they mean."
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">Important Learnings</label>
          <textarea
            className="w-full min-h-[90px] border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={learnings}
            onChange={(e) => setLearnings(e.target.value)}
            placeholder="Key takeaways, theory links, or unexpected outcomes."
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">Additional Notes</label>
          <textarea
            className="w-full min-h-[70px] border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any extra notes (optional)."
          />
        </div>
      </div>

      {reportPreview && (
        <VirtualLabReportPreview
          report={reportPreview}
          onClose={() => setReportPreview(null)}
        />
      )}
    </div>
  );
};

export default ExperimentNotesPanel;
