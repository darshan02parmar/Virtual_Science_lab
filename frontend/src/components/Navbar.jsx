import { useState } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useGamification } from "../context/GamificationContext";
import { useOnlineStatus } from "../context/OnlineStatusContext";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const { xp } = useGamification();
  const { isOnline, pendingCount, isSyncing } = useOnlineStatus();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 1000,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "16px 20px",
        flexWrap: "wrap",
        gap: "12px",
        background:
          theme === "light"
            ? "linear-gradient(90deg, #2563eb, #7c3aed)"
            : "linear-gradient(90deg, #111827, #1f2937)",
        color: "white",
        boxShadow: "0 4px 15px rgba(0,0,0,0.15)",
      }}
    >
      {/* Logo */}
      <h2 style={{ margin: 0, fontSize: "1.6rem", fontWeight: "700" }}>
        <Link to="/" style={{ textDecoration: "none", color: "white" }}>
          🔬 Virtual Science Lab
        </Link>
      </h2>

      {/* Mobile Menu Button */}
      <button
        className="mobile-menu-btn"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-label="Toggle navigation menu"
      >
        {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
      </button>

      {/* Desktop Nav / Mobile Dropdown */}
      <div className={`nav-links-container ${isMobileMenuOpen ? "open" : ""}`}>
        <Link
          style={linkStyle}
          to="/biology"
          onMouseOver={(e) => (e.target.style.background = "rgba(255,255,255,0.15)")}
          onMouseOut={(e) => (e.target.style.background = "transparent")}
        >
          Biology
        </Link>

        <Link
          style={linkStyle}
          to="/chemistry"
          onMouseOver={(e) => (e.target.style.background = "rgba(255,255,255,0.15)")}
          onMouseOut={(e) => (e.target.style.background = "transparent")}
        >
          Chemistry
        </Link>

        <Link
          style={linkStyle}
          to="/physics"
          onMouseOver={(e) => (e.target.style.background = "rgba(255,255,255,0.15)")}
          onMouseOut={(e) => (e.target.style.background = "transparent")}
        >
          Physics
        </Link>

        <Link
          style={{ ...linkStyle, display: "flex", alignItems: "center", gap: "6px" }}
          to="/explore"
          onMouseOver={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.15)")}
          onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <span>🌐</span> Explore
        </Link>

        {/* Offline / Online / Syncing Indicator */}
        {(!isOnline || isSyncing || pendingCount > 0) && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 14px",
              borderRadius: "20px",
              fontSize: "12px",
              fontWeight: "700",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              backdropFilter: "blur(10px)",
              transition: "all 0.3s ease",
              animation: "pulseIndicator 2.5s infinite ease-in-out",
              background: !isOnline
                ? "rgba(239, 68, 68, 0.25)"
                : isSyncing
                ? "rgba(59, 130, 246, 0.25)"
                : "rgba(16, 185, 129, 0.25)",
              border: !isOnline
                ? "1px solid rgba(239, 68, 68, 0.45)"
                : isSyncing
                ? "1px solid rgba(59, 130, 246, 0.45)"
                : "1px solid rgba(16, 185, 129, 0.45)",
              color: !isOnline ? "#fca5a5" : isSyncing ? "#93c5fd" : "#6ee7b7",
            }}
          >
            <style>{`
              @keyframes pulseIndicator {
                0% { opacity: 0.85; }
                50% { opacity: 1; }
                100% { opacity: 0.85; }
              }
              @keyframes spinSync {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }
              .spin-sync-icon {
                animation: spinSync 1.5s linear infinite;
              }
            `}</style>
            {!isOnline ? (
              <>
                <span>🔌</span>
                <span>Offline {pendingCount > 0 ? `(${pendingCount} pending)` : ""}</span>
              </>
            ) : isSyncing ? (
              <>
                <svg className="spin-sync-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                </svg>
                <span>Syncing...</span>
              </>
            ) : (
              <>
                <span style={{ display: "inline-block", width: "8px", height: "8px", borderRadius: "50%", background: "#34d399" }} />
                <span>Synced</span>
              </>
            )}
          </div>
        )}

        <Link
          style={{ ...linkStyle, display: "flex", alignItems: "center", gap: "8px", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)" }}
          to="/profile"
          onMouseOver={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.22)")}
          onMouseOut={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.12)")}
        >
          <span>Profile</span>
          <span style={{ backgroundColor: "#eab308", color: "#1e293b", padding: "2px 8px", borderRadius: "20px", fontSize: "11px", fontWeight: "900", boxShadow: "0 2px 5px rgba(0,0,0,0.15)" }}>
            ⭐ {xp} XP
          </span>
        </Link>

        <Link
          style={{ ...linkStyle, background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)" }}
          to="/progress"
          onMouseOver={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.22)")}
          onMouseOut={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.12)")}
        >
          Progress
        </Link>

        <Link
          style={{ ...linkStyle, background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)" }}
          to="/reports"
          onMouseOver={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.22)")}
          onMouseOut={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.12)")}
        >
          Reports
        </Link>

        <Link
          style={{
            ...linkStyle,
            background: "rgba(255,255,255,0.12)",
            border: "1px solid rgba(255,255,255,0.2)",
          }}
          to="/notebook"
          onMouseOver={(e) =>
            (e.currentTarget.style.background = "rgba(255,255,255,0.22)")
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.background = "rgba(255,255,255,0.12)")
          }
        >
          Notebook
        </Link>

        <Link
          style={{
            ...linkStyle,
            background: "rgba(255,255,255,0.12)",
            border: "1px solid rgba(255,255,255,0.2)",
          }}
          to="/collaborate"
          onMouseOver={(e) =>
            (e.currentTarget.style.background = "rgba(255,255,255,0.22)")
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.background = "rgba(255,255,255,0.12)")
          }
        >
          <span>🤝</span> Collaborate
        </Link>

        <Link
          style={{
            ...linkStyle,
            background: "rgba(255,255,255,0.12)",
            border: "1px solid rgba(255,255,255,0.2)",
          }}
          to="/careers"
          onMouseOver={(e) =>
            (e.currentTarget.style.background = "rgba(255,255,255,0.22)")
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.background = "rgba(255,255,255,0.12)")
          }
        >
          Careers
        </Link>

        <Link
          style={{
            ...linkStyle,
            background: "rgba(255,255,255,0.12)",
            border: "1px solid rgba(255,255,255,0.2)",
          }}
          to="/leaderboard"
          onMouseOver={(e) =>
            (e.currentTarget.style.background = "rgba(255,255,255,0.22)")
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.background = "rgba(255,255,255,0.12)")
          }
        >
          🏆 Leaderboard
        </Link>

        <button
          onClick={toggleTheme}
          style={{ border: "none", background: "rgba(255,255,255,0.15)", color: "white", cursor: "pointer", fontSize: "18px", padding: "10px 14px", borderRadius: "10px" }}
          title="Toggle theme"
          aria-label="Toggle theme mode"
        >
          {theme === "light" ? "🌙" : theme === "dark" ? "🔲" : "☀️"}
        </button>
      </div>
    </nav>
  );
};

const linkStyle = {
  textDecoration: "none",
  color: "white",
  fontWeight: "600",
  padding: "8px 14px",
  borderRadius: "8px",
  transition: "all 0.3s ease",
};

export default Navbar;