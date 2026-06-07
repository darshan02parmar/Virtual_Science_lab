const DB_NAME = "virtual-science-lab-db";
const DB_VERSION = 3;

let dbInstance = null;

export const initDb = () => {
  if (dbInstance) return Promise.resolve(dbInstance);

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // 1. Progress store
      if (!db.objectStoreNames.contains("progress")) {
        db.createObjectStore("progress", { keyPath: "experiment_id" });
      }

      // 2. Notes store
      if (!db.objectStoreNames.contains("notes")) {
        db.createObjectStore("notes", { keyPath: "experiment_id" });
      }

      // 3. Quiz Attempts store
      if (!db.objectStoreNames.contains("quiz_attempts")) {
        db.createObjectStore("quiz_attempts", { keyPath: "id" });
      }

      // 4. Gamification Status store
      if (!db.objectStoreNames.contains("gamification_status")) {
        db.createObjectStore("gamification_status", { keyPath: "user_id" });
      }

      // 5. Recommendations store
      if (!db.objectStoreNames.contains("recommendations")) {
        db.createObjectStore("recommendations", { keyPath: "user_id" });
      }

      // 6. Outbox Sync Queue store
      if (!db.objectStoreNames.contains("sync_queue")) {
        db.createObjectStore("sync_queue", { keyPath: "id" });
      }

      // 7. Experiment History store (New)
      if (!db.objectStoreNames.contains("experiment_history")) {
        db.createObjectStore("experiment_history", { keyPath: "id", autoIncrement: true });
      }

      // 8. Notebook store
      if (!db.objectStoreNames.contains("notebook")) {
        db.createObjectStore("notebook", { keyPath: "experiment_id" });
      }
    };

    request.onsuccess = (event) => {
      dbInstance = event.target.result;
      resolve(dbInstance);
    };

    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
};

// Helper to get transaction and object store asynchronously
const getStore = async (storeName, mode = "readonly") => {
  const db = await initDb();
  return db.transaction(storeName, mode).objectStore(storeName);
};

export const offlineDb = {
  // --- PROGRESS ---
  async getProgress() {
    const store = await getStore("progress", "readonly");
    return new Promise((resolve) => {
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });
  },

  async saveProgressRecord(record) {
    const store = await getStore("progress", "readwrite");
    return new Promise((resolve) => {
      const req = store.put(record);
      req.onsuccess = () => resolve(true);
      req.onerror = () => resolve(false);
    });
  },

  async saveAllProgress(records) {
    const db = await initDb();
    const tx = db.transaction("progress", "readwrite");
    const store = tx.objectStore("progress");
    store.clear();
    for (const record of records) {
      store.put(record);
    }
    return new Promise((resolve) => {
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    });
  },

  // --- NOTES ---
  async getNotes() {
    const store = await getStore("notes", "readonly");
    return new Promise((resolve) => {
      const req = store.getAll();
      req.onsuccess = () => {
        const notesMap = {};
        for (const note of req.result) {
          notesMap[note.experiment_id] = note;
        }
        resolve(notesMap);
      };
      req.onerror = () => resolve({});
    });
  },

  async getNote(experimentId) {
    const store = await getStore("notes", "readonly");
    return new Promise((resolve) => {
      const req = store.get(experimentId);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  },

  async saveNote(note) {
    const store = await getStore("notes", "readwrite");
    return new Promise((resolve) => {
      const req = store.put(note);
      req.onsuccess = () => resolve(true);
      req.onerror = () => resolve(false);
    });
  },

  async saveAllNotes(notesMap) {
    const db = await initDb();
    const tx = db.transaction("notes", "readwrite");
    const store = tx.objectStore("notes");
    store.clear();
    for (const id in notesMap) {
      store.put(notesMap[id]);
    }
    return new Promise((resolve) => {
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    });
  },

  // --- QUIZ ATTEMPTS ---
  async getQuizAttempts() {
    const store = await getStore("quiz_attempts", "readonly");
    return new Promise((resolve) => {
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });
  },

  async saveQuizAttempt(attempt) {
    const store = await getStore("quiz_attempts", "readwrite");
    return new Promise((resolve) => {
      const req = store.put(attempt);
      req.onsuccess = () => resolve(true);
      req.onerror = () => resolve(false);
    });
  },

  async saveAllQuizAttempts(attempts) {
    const db = await initDb();
    const tx = db.transaction("quiz_attempts", "readwrite");
    const store = tx.objectStore("quiz_attempts");
    store.clear();
    for (const att of attempts) {
      store.put(att);
    }
    return new Promise((resolve) => {
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    });
  },

  // --- GAMIFICATION STATUS ---
  async getGamificationStatus(userId = "default-student") {
    const store = await getStore("gamification_status", "readonly");
    return new Promise((resolve) => {
      const req = store.get(userId);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  },

  async saveGamificationStatus(status) {
    const store = await getStore("gamification_status", "readwrite");
    return new Promise((resolve) => {
      const req = store.put(status);
      req.onsuccess = () => resolve(true);
      req.onerror = () => resolve(false);
    });
  },

  // --- RECOMMENDATIONS ---
  async getRecommendations(userId = "default-student") {
    const store = await getStore("recommendations", "readonly");
    return new Promise((resolve) => {
      const req = store.get(userId);
      req.onsuccess = () => resolve(req.result?.recommendations || []);
      req.onerror = () => resolve([]);
    });
  },

  async saveRecommendations(userId = "default-student", recommendations) {
    const store = await getStore("recommendations", "readwrite");
    return new Promise((resolve) => {
      const req = store.put({ user_id: userId, recommendations });
      req.onsuccess = () => resolve(true);
      req.onerror = () => resolve(false);
    });
  },

  // --- NOTEBOOK ---
  async getNotebooks() {
    const store = await getStore("notebook", "readonly");
    return new Promise((resolve) => {
      const req = store.getAll();
      req.onsuccess = () => {
        const notebooksMap = {};
        for (const nb of req.result) {
          notebooksMap[nb.experiment_id] = nb;
        }
        resolve(notebooksMap);
      };
      req.onerror = () => resolve({});
    });
  },

  async getNotebook(experimentId) {
    const store = await getStore("notebook", "readonly");
    return new Promise((resolve) => {
      const req = store.get(experimentId);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  },

  async saveNotebook(notebook) {
    const store = await getStore("notebook", "readwrite");
    return new Promise((resolve) => {
      const req = store.put(notebook);
      req.onsuccess = () => resolve(true);
      req.onerror = () => resolve(false);
    });
  },

  async saveAllNotebooks(notebooksMap) {
    const db = await initDb();
    const tx = db.transaction("notebook", "readwrite");
    const store = tx.objectStore("notebook");
    store.clear();
    for (const id in notebooksMap) {
      store.put(notebooksMap[id]);
    }
    return new Promise((resolve) => {
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    });
  },

  // --- SYNC OUTBOX QUEUE (Refactored for Issue #122) ---
  async getSyncQueue() {
    const store = await getStore("sync_queue", "readonly");
    return new Promise((resolve) => {
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });
  },

  async queueAction(type, payload) {
    const store = await getStore("sync_queue", "readwrite");
    
    // 📌 Deterministic Idempotency Key: Cryptographically secure UUID
    const actionId = crypto.randomUUID();
    
    // 📌 OCC State Tracker: Extract version identifier from payload or default to structural 1
    const currentVersion = payload.__v || payload.version || 1;

    const action = {
      id: actionId,
      type,
      version: currentVersion,
      payload,
      timestamp: new Date().toISOString()
    };
    
    // Notes updates de-duplication to prevent syncing multiple versions of the same unsynced note
    if (type === "notes") {
      const all = await this.getSyncQueue();
      const existingNoteAction = all.find(
        (a) => a.type === "notes" && a.payload.experiment_id === payload.experiment_id
      );
      if (existingNoteAction) {
        existingNoteAction.payload = {
          ...existingNoteAction.payload,
          ...payload
        };
        // Ensure atomic version tracking cascades across local merges
        existingNoteAction.version = payload.__v || payload.version || existingNoteAction.version || 1;
        existingNoteAction.timestamp = action.timestamp;
        return new Promise((resolve) => {
          const req = store.put(existingNoteAction);
          req.onsuccess = () => resolve(existingNoteAction.id);
          req.onerror = () => resolve(null);
        });
      }
    }
    
    // Notebook updates de-duplication
    if (type === "notebook") {
      const all = await this.getSyncQueue();
      const existingAction = all.find(
        (a) => a.type === "notebook" && a.payload.experiment_id === payload.experiment_id
      );
      if (existingAction) {
        existingAction.payload = {
          ...existingAction.payload,
          ...payload
        };
        existingAction.version = payload.__v || payload.version || existingAction.version || 1;
        existingAction.timestamp = action.timestamp;
        return new Promise((resolve) => {
          const req = store.put(existingAction);
          req.onsuccess = () => resolve(existingAction.id);
          req.onerror = () => resolve(null);
        });
      }
    }

    return new Promise((resolve) => {
      const req = store.put(action);
      req.onsuccess = () => resolve(action.id);
      req.onerror = () => resolve(null);
    });
  },

  async dequeueAction(id) {
    const store = await getStore("sync_queue", "readwrite");
    return new Promise((resolve) => {
      const req = store.delete(id);
      req.onsuccess = () => resolve(true);
      req.onerror = () => resolve(false);
    });
  },

  async clearSyncQueue() {
    const store = await getStore("sync_queue", "readwrite");
    return new Promise((resolve) => {
      const req = store.clear();
      req.onsuccess = () => resolve(true);
      req.onerror = () => resolve(false);
    });
  },

  async getExperimentHistory() {
    const store = await getStore("experiment_history", "readonly");
    return new Promise((resolve) => {
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });
  },

  async saveExperimentHistory(record) {
    const store = await getStore("experiment_history", "readwrite");
    // Ensure timestamp is added if not present
    const entry = { 
      ...record, 
      timestamp: record.timestamp || new Date().toISOString() 
    };
    return new Promise((resolve) => {
      const req = store.add(entry);
      req.onsuccess = () => resolve(true);
      req.onerror = () => resolve(false);
    });
  }
};