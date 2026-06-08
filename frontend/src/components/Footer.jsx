import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

const Footer = () => {
    const { theme } = useTheme();

    return (
        <footer
            style={{
                marginTop: "60px",
                padding: "40px 24px 20px",
                background:
                    theme === "light"
                        ? "linear-gradient(90deg, #2563eb, #7c3aed)"
                        : "linear-gradient(90deg, #111827, #1f2937)",
                color: "white",
                borderRadius: "16px 16px 0 0",
            }}
        >
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "40px",
                }}
            >
                {/* Brand */}
                <div style={{ maxWidth: "300px" }}>
                    <h2>🔬 Virtual Science Lab</h2>

                    <p style={{ lineHeight: "1.6" }}>
                        Explore interactive Biology, Chemistry, and Physics
                        experiments in a virtual environment.
                    </p>
                </div>

                {/* Quick Links */}
                <div>
                    <h3 style={{ marginBottom: "12px" }}>
                        Quick Links
                    </h3>

                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "10px",
                        }}
                    >
                        <Link
                            to="/"
                            style={footerLink}
                            onMouseOver={(e) => {
                                e.target.style.opacity = "0.8";
                                e.target.style.transform = "translateX(4px)";
                            }}
                            onMouseOut={(e) => {
                                e.target.style.opacity = "1";
                                e.target.style.transform = "translateX(0)";
                            }}
                        >
                            Home
                        </Link>

                        <Link
                            to="/biology"
                            style={footerLink}
                            onMouseOver={(e) => {
                                e.target.style.opacity = "0.8";
                                e.target.style.transform = "translateX(4px)";
                            }}
                            onMouseOut={(e) => {
                                e.target.style.opacity = "1";
                                e.target.style.transform = "translateX(0)";
                            }}
                        >
                            Biology
                        </Link>

                        <Link
                            to="/chemistry"
                            style={footerLink}
                            onMouseOver={(e) => {
                                e.target.style.opacity = "0.8";
                                e.target.style.transform = "translateX(4px)";
                            }}
                            onMouseOut={(e) => {
                                e.target.style.opacity = "1";
                                e.target.style.transform = "translateX(0)";
                            }}
                        >
                            Chemistry
                        </Link>

                        <Link
                            to="/physics"
                            style={footerLink}
                            onMouseOver={(e) => {
                                e.target.style.opacity = "0.8";
                                e.target.style.transform = "translateX(4px)";
                            }}
                            onMouseOut={(e) => {
                                e.target.style.opacity = "1";
                                e.target.style.transform = "translateX(0)";
                            }}
                        >
                            Physics
                        </Link>

                        <Link
                            to="/faq"
                            style={footerLink}
                            onMouseOver={(e) => {
                                e.target.style.opacity = "0.8";
                                e.target.style.transform = "translateX(4px)";
                            }}
                            onMouseOut={(e) => {
                                e.target.style.opacity = "1";
                                e.target.style.transform = "translateX(0)";
                            }}
                        >
                            FAQ
                        </Link>

                        <Link
                            to="/policy"
                            style={footerLink}
                            onMouseOver={(e) => {
                                e.target.style.opacity = "0.8";
                                e.target.style.transform = "translateX(4px)";
                            }}
                            onMouseOut={(e) => {
                                e.target.style.opacity = "1";
                                e.target.style.transform = "translateX(0)";
                            }}
                        >
                            Privacy Policy
                        </Link>
                    </div>
                </div>

                {/* Contact */}
                <div>
                    <h3 style={{ marginBottom: "12px" }}>
                        Connect
                    </h3>

                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "10px",
                        }}
                    >
                        <a
                            href="#"
                            style={footerLink}
                            onMouseOver={(e) => {
                                e.target.style.opacity = "0.8";
                                e.target.style.transform = "translateX(4px)";
                            }}
                            onMouseOut={(e) => {
                                e.target.style.opacity = "1";
                                e.target.style.transform = "translateX(0)";
                            }}
                        >
                            GitHub
                        </a>

                        <a
                            href="#"
                            style={footerLink}
                            onMouseOver={(e) => {
                                e.target.style.opacity = "0.8";
                                e.target.style.transform = "translateX(4px)";
                            }}
                            onMouseOut={(e) => {
                                e.target.style.opacity = "1";
                                e.target.style.transform = "translateX(0)";
                            }}
                        >
                            LinkedIn
                        </a>

                        <a
                            href="#"
                            style={footerLink}
                            onMouseOver={(e) => {
                                e.target.style.opacity = "0.8";
                                e.target.style.transform = "translateX(4px)";
                            }}
                            onMouseOut={(e) => {
                                e.target.style.opacity = "1";
                                e.target.style.transform = "translateX(0)";
                            }}
                        >
                            Email Support
                        </a>
                    </div>
                </div>
            </div>

            {/* Bottom */}
            <div
                style={{
                    borderTop: "1px solid rgba(255,255,255,0.2)",
                    marginTop: "30px",
                    paddingTop: "18px",
                    textAlign: "center",
                    fontSize: "14px",
                }}
            >
                © 2026 Virtual Science Lab • Interactive Learning Platform
            </div>
        </footer>
    );
};

const footerLink = {
    color: "white",
    textDecoration: "none",
    transition: "all 0.3s ease",
    cursor: "pointer"
};

export default Footer;