import { createContext, useContext, useEffect, useState } from "react";

const OnlineStatusContext = createContext({
  isOnline: true,
  pendingCount: 0,
  setPendingCount: () => {},
  isSyncing: false,
  setIsSyncing: () => {}
});

export const OnlineStatusProvider = ({ children }) => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <OnlineStatusContext.Provider
      value={{
        isOnline,
        pendingCount,
        setPendingCount,
        isSyncing,
        setIsSyncing
      }}
    >
      {children}
    </OnlineStatusContext.Provider>
  );
};

export const useOnlineStatus = () => {
  const context = useContext(OnlineStatusContext);
  if (context === undefined) {
    console.warn("useOnlineStatus was called outside an OnlineStatusProvider. Returning safe offline fallback.");
    return {
      isOnline: true,
      pendingCount: 0,
      setPendingCount: () => {},
      isSyncing: false,
      setIsSyncing: () => {}
    };
  }
  return context;
};
