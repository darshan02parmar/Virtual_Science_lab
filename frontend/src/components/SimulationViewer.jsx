import { useOnlineStatus } from "../context/OnlineStatusContext";

const SimulationViewer = ({ title, src }) => {
  const { isOnline } = useOnlineStatus();

  if (!isOnline) {
    return (
      <>
        <style>
          {`
            @keyframes pulse-plug {
              0% { transform: scale(1); opacity: 0.9; box-shadow: 0 0 0 0 rgba(124, 58, 237, 0.4); }
              50% { transform: scale(1.05); opacity: 1; box-shadow: 0 0 0 12px rgba(124, 58, 237, 0); }
              100% { transform: scale(1); opacity: 0.9; box-shadow: 0 0 0 0 rgba(124, 58, 237, 0); }
            }
            .offline-plug-btn {
              animation: pulse-plug 2.5s infinite ease-in-out;
            }
          `}
        </style>
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "500px",
            background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)",
            borderRadius: "16px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
            boxSizing: "border-box",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
            textAlign: "center",
            color: "#f8fafc",
            fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
            overflow: "hidden"
          }}
        >
          {/* Decorative Glowing Orbs in Background */}
          <div
            style={{
              position: "absolute",
              top: "-50px",
              left: "-50px",
              width: "200px",
              height: "200px",
              borderRadius: "50%",
              background: "rgba(99, 102, 241, 0.15)",
              filter: "blur(60px)",
              pointerEvents: "none"
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "-50px",
              right: "-50px",
              width: "200px",
              height: "200px",
              borderRadius: "50%",
              background: "rgba(124, 58, 237, 0.15)",
              filter: "blur(60px)",
              pointerEvents: "none"
            }}
          />

          {/* Glowing Offline Icon Container */}
          <div
            className="offline-plug-btn"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              background: "rgba(124, 58, 237, 0.2)",
              border: "2px solid rgba(124, 58, 237, 0.4)",
              fontSize: "36px",
              marginBottom: "24px",
              color: "#a78bfa"
            }}
          >
            🔌
          </div>

          <h3
            style={{
              fontSize: "22px",
              fontWeight: "800",
              margin: "0 0 10px 0",
              letterSpacing: "-0.5px",
              background: "linear-gradient(to right, #c084fc, #818cf8)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}
          >
            3D Simulation Offline
          </h3>

          <p
            style={{
              fontSize: "14px",
              color: "#94a3b8",
              maxWidth: "460px",
              lineHeight: "1.6",
              margin: "0 0 28px 0",
              fontWeight: "500"
            }}
          >
            You are currently working offline. The interactive 3D model for <strong>{title}</strong> requires an active internet connection to stream from Sketchfab.
          </p>

          {/* Feature Badge List */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: "10px",
              maxWidth: "500px",
              marginBottom: "16px"
            }}
          >
            <div
              style={{
                background: "rgba(16, 185, 129, 0.1)",
                border: "1px solid rgba(16, 185, 129, 0.2)",
                borderRadius: "30px",
                padding: "8px 16px",
                fontSize: "12px",
                fontWeight: "600",
                color: "#34d399",
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}
            >
              ✓ Static Lessons Cached
            </div>
            <div
              style={{
                background: "rgba(16, 185, 129, 0.1)",
                border: "1px solid rgba(16, 185, 129, 0.2)",
                borderRadius: "30px",
                padding: "8px 16px",
                fontSize: "12px",
                fontWeight: "600",
                color: "#34d399",
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}
            >
              ✓ Quizzes Ready Offline
            </div>
            <div
              style={{
                background: "rgba(16, 185, 129, 0.1)",
                border: "1px solid rgba(16, 185, 129, 0.2)",
                borderRadius: "30px",
                padding: "8px 16px",
                fontSize: "12px",
                fontWeight: "600",
                color: "#34d399",
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}
            >
              ✓ Notes Saved Locally
            </div>
          </div>

          <span
            style={{
              fontSize: "11px",
              color: "#64748b",
              fontWeight: "600",
              textTransform: "uppercase",
              letterSpacing: "1px"
            }}
          >
            All offline work will automatically sync when you reconnect
          </span>
        </div>
      </>
    );
  }

  return (
    <div style={{ position: "relative", marginTop: "16px" }}>
      <iframe
        title={title}
        src={src}
        width="100%"
        height="500"
        frameBorder="0"
        allow="autoplay; fullscreen; xr-spatial-tracking"
        allowFullScreen
        style={{ borderRadius: "12px" }}
      />

      {/* TOP MASK – hides Sketchfab title bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "48px",
          background:
            document.body.getAttribute("data-theme") === "dark" || 
            (typeof window !== "undefined" && window.localStorage.getItem("theme") === "dark")
              ? "#0f172a"
              : "#ffffff",
          zIndex: 2,
          borderTopLeftRadius: "12px",
          borderTopRightRadius: "12px",
        }}
      />
    </div>
  );
};

export default SimulationViewer;
