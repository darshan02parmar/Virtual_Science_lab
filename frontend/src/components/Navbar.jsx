import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useGamification } from "../context/GamificationContext";

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const { xp } = useGamification();

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
      <h2
        style={{
          margin: 0,
          fontSize: "1.6rem",
          fontWeight: "700",
        }}
      >
        <Link
          to="/"
          style={{
            textDecoration: "none",
            color: "white",
          }}
        >
          🔬 Virtual Science Lab
        </Link>
      </h2>

      {/* Desktop Nav */}
      <div
        style={{
          display: "flex",
          gap: "16px",
          alignItems: "center",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        <Link
          style={linkStyle}
          to="/biology"
          onMouseOver={(e) =>
            (e.target.style.background = "rgba(255,255,255,0.15)")
          }
          onMouseOut={(e) =>
            (e.target.style.background = "transparent")
          }
        >
          Biology
        </Link>

        <Link
          style={linkStyle}
          to="/chemistry"
          onMouseOver={(e) =>
            (e.target.style.background = "rgba(255,255,255,0.15)")
          }
          onMouseOut={(e) =>
            (e.target.style.background = "transparent")
          }
        >
          Chemistry
        </Link>

        <Link
          style={linkStyle}
          to="/physics"
          onMouseOver={(e) =>
            (e.target.style.background = "rgba(255,255,255,0.15)")
          }
          onMouseOut={(e) =>
            (e.target.style.background = "transparent")
          }
        >
          Physics
        </Link>

        <Link
          style={{
            ...linkStyle,
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "rgba(255,255,255,0.12)",
            border: "1px solid rgba(255,255,255,0.2)",
          }}
          to="/profile"
          onMouseOver={(e) =>
            (e.currentTarget.style.background = "rgba(255,255,255,0.22)")
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.background = "rgba(255,255,255,0.12)")
          }
        >
          <span>Profile</span>
          <span
            style={{
              backgroundColor: "#eab308",
              color: "#1e293b",
              padding: "2px 8px",
              borderRadius: "20px",
              fontSize: "11px",
              fontWeight: "900",
              boxShadow: "0 2px 5px rgba(0,0,0,0.15)",
            }}
          >
            ⭐ {xp} XP
          </span>
        </Link>

        <Link
          style={{
            ...linkStyle,
            background: "rgba(255,255,255,0.12)",
            border: "1px solid rgba(255,255,255,0.2)",
          }}
          to="/progress"
          onMouseOver={(e) =>
            (e.currentTarget.style.background = "rgba(255,255,255,0.22)")
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.background = "rgba(255,255,255,0.12)")
          }
        >
          Progress
        </Link>

        <button
          onClick={toggleTheme}
          style={{
            border: "none",
            background: "rgba(255,255,255,0.15)",
            color: "white",
            cursor: "pointer",
            fontSize: "18px",
            padding: "10px 14px",
            borderRadius: "10px",
          }}
          title="Toggle theme"
        >
          {theme === "light" ? "🌙" : "☀️"}
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
