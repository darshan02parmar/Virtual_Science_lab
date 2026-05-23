import { useEffect, useMemo, useState } from "react";
import { useReports } from "../context/ReportsContext";

const editableFields = [
  ["objective", "Objective"],
  ["procedure", "Procedure"],
  ["observations", "Observations"],
  ["results", "Results"],
  ["conclusions", "Conclusions"],
  ["quiz_performance", "Quiz Performance"],
];

const escapeHtml = (value) =>
  String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

const downloadFile = (filename, content, type) => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

const VirtualLabReportPreview = ({ report, onClose }) => {
  const { updateReport, exportMarkdown, reportToMarkdown, usingLocalFallback } = useReports();
  const [draft, setDraft] = useState(report);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDraft(report);
  }, [report]);

  const generatedAt = useMemo(() => {
    if (!draft?.generated_at) return "Not saved yet";
    return new Date(draft.generated_at).toLocaleString();
  }, [draft?.generated_at]);

  if (!draft) return null;

  const handleChange = (field, value) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (status = "draft") => {
    setSaving(true);
    const updated = await updateReport(draft.id, { ...draft, status });
    if (updated) {
      setDraft(updated);
    } else {
      setDraft((prev) => ({ ...prev, status, updated_at: new Date().toISOString() }));
    }
    setSaving(false);
  };

  const handlePrintPdf = () => {
    const html = `
      <html>
        <head>
          <title>${escapeHtml(draft.title)} report</title>
          <style>
            body { font-family: Arial, sans-serif; color: #111827; line-height: 1.55; padding: 32px; }
            h1 { margin-bottom: 4px; }
            h2 { border-bottom: 1px solid #d1d5db; padding-bottom: 6px; margin-top: 28px; }
            .meta { color: #4b5563; font-size: 13px; margin-bottom: 24px; }
            pre { white-space: pre-wrap; font-family: inherit; }
          </style>
        </head>
        <body>
          <h1>${escapeHtml(draft.title)}</h1>
          <div class="meta">
            Subject: ${escapeHtml(draft.subject)} | Experiment ID: ${escapeHtml(draft.experiment_id)} | Generated: ${escapeHtml(generatedAt)}
          </div>
          ${editableFields
            .map(
              ([field, label]) =>
                `<h2>${escapeHtml(label)}</h2><pre>${escapeHtml(draft[field])}</pre>`
            )
            .join("")}
        </body>
      </html>
    `;

    const printWindow = window.open("", "_blank", "width=900,height=900");
    if (!printWindow) return;
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const handleDocExport = () => {
    const html = `
      <html><body>
        <h1>${escapeHtml(draft.title)}</h1>
        <p><strong>Subject:</strong> ${escapeHtml(draft.subject)}</p>
        <p><strong>Generated:</strong> ${escapeHtml(generatedAt)}</p>
        ${editableFields
          .map(
            ([field, label]) =>
              `<h2>${escapeHtml(label)}</h2><p>${escapeHtml(draft[field]).replace(/\n/g, "<br/>")}</p>`
          )
          .join("")}
      </body></html>
    `;
    downloadFile(`${draft.experiment_id}-lab-report.doc`, html, "application/msword");
  };

  return (
    <div className="fixed inset-0 z-[1200] overflow-y-auto bg-slate-950/60 px-4 py-6">
      <div className="mx-auto max-w-5xl rounded-lg bg-white shadow-2xl dark:bg-slate-900">
        <div className="flex flex-col gap-4 border-b border-slate-200 p-5 dark:border-slate-800 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-wide text-blue-600 dark:text-blue-400">
              Virtual lab report preview
            </p>
            <input
              className="mt-2 w-full border-0 bg-transparent p-0 text-2xl font-black text-slate-900 outline-none dark:text-slate-100"
              value={draft.title}
              onChange={(event) => handleChange("title", event.target.value)}
            />
            <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400">
              {draft.subject} | {draft.experiment_id} | {generatedAt}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Close
          </button>
        </div>

        {usingLocalFallback && (
          <div className="mx-5 mt-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
            Reports are being saved locally until the backend is available.
          </div>
        )}

        <div className="grid gap-5 p-5 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-4">
            {editableFields.map(([field, label]) => (
              <label key={field} className="block">
                <span className="mb-2 block text-sm font-black text-slate-800 dark:text-slate-100">
                  {label}
                </span>
                <textarea
                  className="min-h-[110px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm leading-relaxed text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  value={draft[field] || ""}
                  onChange={(event) => handleChange(field, event.target.value)}
                />
              </label>
            ))}
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950/50">
            <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">Submission Preview</h3>
            <div className="mt-4 space-y-5 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
              {editableFields.map(([field, label]) => (
                <section key={field}>
                  <h4 className="mb-1 font-black text-slate-900 dark:text-slate-100">{label}</h4>
                  <p className="whitespace-pre-wrap">{draft[field]}</p>
                </section>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-200 p-5 dark:border-slate-800 sm:flex-row sm:flex-wrap sm:justify-end">
          <button
            type="button"
            onClick={() => handleSave("draft")}
            disabled={saving}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-bold text-slate-800 hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            {saving ? "Saving..." : "Save Draft"}
          </button>
          <button
            type="button"
            onClick={() => handleSave("final")}
            disabled={saving}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-500 disabled:opacity-60"
          >
            Mark Final
          </button>
          <button
            type="button"
            onClick={() => exportMarkdown(draft)}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-500"
          >
            Download MD
          </button>
          <button
            type="button"
            onClick={handleDocExport}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-500"
          >
            Download DOC
          </button>
          <button
            type="button"
            onClick={handlePrintPdf}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900"
          >
            Print / Save PDF
          </button>
          <button
            type="button"
            onClick={() => downloadFile(`${draft.experiment_id}-lab-report.md`, reportToMarkdown(draft), "text/markdown")}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-bold text-slate-800 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Local MD
          </button>
        </div>
      </div>
    </div>
  );
};

export default VirtualLabReportPreview;
