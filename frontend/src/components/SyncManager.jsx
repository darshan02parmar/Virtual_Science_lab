import { useEffect, useRef, useState } from "react";
import { useOnlineStatus } from "../context/OnlineStatusContext";
import { useProgress } from "../context/ProgressContext";
import { useGamification } from "../context/GamificationContext";
import { offlineDb } from "../utils/offlineDb";
import API_URL from "../config";

const BASE_URL =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
    ? "http://127.0.0.1:8000"
    : API_URL;

const SyncManager = () => {
  const { isOnline, pendingCount, setPendingCount, isSyncing, setIsSyncing } = useOnlineStatus();
  const { refreshProgress } = useProgress();
  const { refreshStats } = useGamification();

  const [toast, setToast] = useState(null); // { type: 'info'|'success'|'error', message: str }
  const toastTimeoutRef = useRef(null);
  const syncLockRef = useRef(false);

  // Periodically check queue length to update pending upload count reactively
  useEffect(() => {
    const checkQueue = async () => {
      try {
        const queue = await offlineDb.getSyncQueue();
        setPendingCount(queue.length);
      } catch (err) {
        console.error("Failed to check sync queue:", err);
      }
    };

    checkQueue();
    const interval = setInterval(checkQueue, 3000);
    return () => clearInterval(interval);
  }, [setPendingCount]);

  // Trigger sync automatically when going online or when pending count grows while online
  useEffect(() => {
    if (isOnline && pendingCount > 0 && !isSyncing && !syncLockRef.current) {
      performSync();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnline, pendingCount, isSyncing]);

  const showToast = (type, message, duration = 4000) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast({ type, message });

    if (duration > 0) {
      toastTimeoutRef.current = setTimeout(() => {
        setToast(null);
      }, duration);
    }
  };

  const performSync = async () => {
    syncLockRef.current = true;
    setIsSyncing(true);
    showToast("info", "Syncing offline progress...", 0); // Keep open during sync

    try {
      const queue = await offlineDb.getSyncQueue();
      if (queue.length === 0) {
        setIsSyncing(false);
        setToast(null);
        syncLockRef.current = false;
        return;
      }

      const response = await fetch(`${BASE_URL}/api/sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actions: queue })
      });

      if (!response.ok) {
        throw new Error(`Sync API returned status ${response.status}`);
      }

      const result = await response.json();
      
      // Dequeue all actions successfully synced
      for (const action of queue) {
        await offlineDb.dequeueAction(action.id);
      }

      // Update pending count instantly
      const updatedQueue = await offlineDb.getSyncQueue();
      setPendingCount(updatedQueue.length);

      // Trigger global contexts to fetch unified state from backend
      if (refreshProgress) await refreshProgress();
      if (refreshStats) await refreshStats();

      const totalSynced = result.notes_synced + result.progress_synced + result.quizzes_synced;
      
      if (result.failed_actions > 0) {
        showToast(
          "error",
          `Synced ${totalSynced} items. ${result.failed_actions} items failed.`,
          5000
        );
      } else {
        showToast("success", `Sync complete! Uploaded ${totalSynced} items.`, 4000);
      }
    } catch (err) {
      console.error("Background sync failed:", err);
      showToast("error", "Sync failed. Will retry when connection stabilizes.", 5000);
    } finally {
      setIsSyncing(false);
      syncLockRef.current = false;
    }
  };

  if (!toast) return null;

  const getToastStyles = () => {
    const base = {
      position: "fixed",
      bottom: "24px",
      right: "24px",
      zIndex: 99999,
      display: "flex",
      alignItems: "center",
      gap: "12px",
      padding: "16px 20px",
      borderRadius: "16px",
      boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
      backdropFilter: "blur(20px)",
      border: "1px solid rgba(255, 255, 255, 0.15)",
      fontFamily: "'Segoe UI', Roboto, sans-serif",
      fontSize: "14px",
      fontWeight: "600",
      color: "#ffffff",
      animation: "slideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards",
      maxWidth: "360px",
    };

    switch (toast.type) {
      case "success":
        return { ...base, background: "rgba(16, 185, 129, 0.85)", border: "1px solid rgba(16, 185, 129, 0.3)" };
      case "error":
        return { ...base, background: "rgba(239, 68, 68, 0.85)", border: "1px solid rgba(239, 68, 68, 0.3)" };
      default:
        return { ...base, background: "rgba(15, 23, 42, 0.85)", border: "1px solid rgba(255, 255, 255, 0.15)" };
    }
  };

  return (
    <>
      <style>
        {`
          @keyframes slideIn {
            from { transform: translateY(20px) scale(0.95); opacity: 0; }
            to { transform: translateY(0) scale(1); opacity: 1; }
          }
          @keyframes rotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .sync-spinner {
            animation: rotate 1.5s linear infinite;
          }
        `}
      </style>
      <div style={getToastStyles()}>
        {toast.type === "info" && (
          <svg className="sync-spinner" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
          </svg>
        )}
        {toast.type === "success" && (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
        {toast.type === "error" && (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        )}
        <span>{toast.message}</span>
      </div>
    </>
  );
};

export default SyncManager;
