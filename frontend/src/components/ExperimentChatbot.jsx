import { useState, useRef, useEffect, useCallback } from "react";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
import API_URL from "../config";
const API_BASE = API_URL;
const MAX_HISTORY = 40; // keep last 40 messages in state

// ---------------------------------------------------------------------------
// Tiny helpers
// ---------------------------------------------------------------------------
const subjectEmoji = { biology: "🧬", chemistry: "🧪", physics: "⚡" };

function formatTime(date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

/** Render **bold** markdown from bot answers */
function renderBold(text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={i}>{part.slice(2, -2)}</strong>
    ) : (
      part
    )
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function MessageBubble({ msg }) {
  const isUser = msg.role === "user";
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: isUser ? "flex-end" : "flex-start",
        marginBottom: "12px",
        animation: "fadeSlideIn 0.2s ease-out",
      }}
    >
      <div
        style={{
          maxWidth: "82%",
          padding: "10px 14px",
          borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
          background: isUser
            ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
            : "var(--bubble-bot-bg, rgba(255,255,255,0.08))",
          color: isUser
            ? "#fff"
            : "var(--bubble-bot-color, inherit)",
          boxShadow: isUser
            ? "0 2px 12px rgba(99,102,241,0.35)"
            : "0 1px 4px rgba(0,0,0,0.12)",
          fontSize: "0.875rem",
          lineHeight: "1.55",
          border: isUser ? "none" : "1px solid var(--bubble-bot-border, rgba(255,255,255,0.1))",
          backdropFilter: isUser ? "none" : "blur(6px)",
          wordBreak: "break-word",
        }}
      >
        {isUser ? msg.text : renderBold(msg.text)}
      </div>
      <span
        style={{
          fontSize: "0.68rem",
          color: "var(--text-muted, #9ca3af)",
          marginTop: "4px",
          marginRight: isUser ? "2px" : 0,
          marginLeft: isUser ? 0 : "2px",
        }}
      >
        {formatTime(msg.timestamp)}
      </span>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "4px",
        padding: "10px 14px",
        background: "var(--bubble-bot-bg, rgba(255,255,255,0.08))",
        borderRadius: "18px 18px 18px 4px",
        width: "fit-content",
        border: "1px solid var(--bubble-bot-border, rgba(255,255,255,0.1))",
        marginBottom: "12px",
      }}
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: "7px",
            height: "7px",
            borderRadius: "50%",
            background: "#6366f1",
            display: "inline-block",
            animation: `dotBounce 1.2s ease-in-out ${i * 0.2}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function ExperimentChatbot({ experiment, subject }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "bot",
      text: `Hi! I'm your AI lab assistant 🔬 Ask me anything about **${
        experiment?.title || "this experiment"
      }** — theory, procedure, concepts, or results!`,
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 150);
  }, [isOpen]);

  const sendMessage = useCallback(async () => {
    const question = inputValue.trim();
    if (!question || isLoading) return;

    const userMsg = { role: "user", text: question, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg].slice(-MAX_HISTORY));
    setInputValue("");
    setIsLoading(true);
    setError(null);

    try {
      const procedureText = Array.isArray(experiment?.procedure)
        ? experiment.procedure.join(" ")
        : experiment?.procedure || "";

      const res = await fetch(`${API_BASE}/api/chatbot/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          experimentTitle: experiment?.title || "Unknown Experiment",
          experimentTheory: experiment?.theory || "",
          experimentProcedure: procedureText,
          userQuestion: question,
          subject: subject || null,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || `Server error ${res.status}`);
      }

      const data = await res.json();
      const botMsg = {
        role: "bot",
        text: data.answer,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMsg].slice(-MAX_HISTORY));
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [inputValue, isLoading, experiment, subject]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const emoji = subjectEmoji[subject?.toLowerCase()] || "🤖";

  // ---- Suggested questions -----------------------------------------------
  const suggestions = [
    "What is the aim of this experiment?",
    "Explain the theory in simple terms.",
    "What precautions should I follow?",
    "What result should I expect?",
  ];

  return (
    <>
      {/* ---- Keyframe animations (injected once) ---- */}
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes dotBounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40%            { transform: translateY(-6px); opacity: 1; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes chatOpen {
          from { opacity: 0; transform: scale(0.92) translateY(16px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);    }
        }
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(99,102,241,0.5); }
          50%       { box-shadow: 0 0 0 8px rgba(99,102,241,0); }
        }
      `}</style>

      {/* ================================================================
          FAB – Floating Action Button
      ================================================================ */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        aria-label={isOpen ? "Close AI assistant" : "Open AI assistant"}
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          zIndex: 1000,
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.5rem",
          boxShadow: "0 4px 20px rgba(99,102,241,0.45)",
          transition: "transform 0.2s, box-shadow 0.2s",
          animation: isOpen ? "none" : "pulse 2.5s infinite",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.1)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
        }}
      >
        {isOpen ? "✕" : emoji}
      </button>

      {/* ================================================================
          Chat Window
      ================================================================ */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="AI Lab Assistant"
          style={{
            position: "fixed",
            bottom: "92px",
            right: "24px",
            zIndex: 999,
            width: "min(380px, calc(100vw - 32px))",
            height: "min(540px, calc(100vh - 120px))",
            borderRadius: "20px",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            background: "var(--chat-bg, #0f172a)",
            border: "1px solid var(--chat-border, rgba(255,255,255,0.12))",
            boxShadow:
              "0 24px 48px rgba(0,0,0,0.35), 0 0 0 1px rgba(99,102,241,0.2)",
            animation: "chatOpen 0.25s ease-out",
          }}
        >
          {/* ---- Header ---- */}
          <div
            style={{
              padding: "14px 16px",
              background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: "rgba(255,255,255,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.2rem",
                flexShrink: 0,
              }}
            >
              {emoji}
            </div>
            <div style={{ flex: 1, overflow: "hidden" }}>
              <div
                style={{
                  fontWeight: 700,
                  color: "#fff",
                  fontSize: "0.9rem",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                AI Lab Assistant
              </div>
              <div
                style={{
                  fontSize: "0.72rem",
                  color: "rgba(255,255,255,0.75)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {experiment?.title || "Experiment Guide"}
              </div>
            </div>
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "#4ade80",
                flexShrink: 0,
                boxShadow: "0 0 6px #4ade80",
              }}
            />
          </div>

          {/* ---- Messages area ---- */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "16px",
              display: "flex",
              flexDirection: "column",
              scrollbarWidth: "thin",
              scrollbarColor: "rgba(99,102,241,0.3) transparent",
            }}
          >
            {messages.map((msg, i) => (
              <MessageBubble key={i} msg={msg} />
            ))}
            {isLoading && <TypingIndicator />}
            {error && (
              <div
                style={{
                  background: "rgba(239,68,68,0.12)",
                  border: "1px solid rgba(239,68,68,0.3)",
                  borderRadius: "10px",
                  padding: "10px 14px",
                  fontSize: "0.8rem",
                  color: "#fca5a5",
                  marginBottom: "12px",
                }}
              >
                ⚠️ {error}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* ---- Quick suggestions (only at start) ---- */}
          {messages.length <= 1 && (
            <div
              style={{
                padding: "0 12px 10px",
                display: "flex",
                flexWrap: "wrap",
                gap: "6px",
              }}
            >
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setInputValue(s);
                    inputRef.current?.focus();
                  }}
                  style={{
                    padding: "5px 10px",
                    borderRadius: "20px",
                    border: "1px solid rgba(99,102,241,0.4)",
                    background: "rgba(99,102,241,0.1)",
                    color: "#a5b4fc",
                    fontSize: "0.72rem",
                    cursor: "pointer",
                    transition: "background 0.15s",
                    whiteSpace: "nowrap",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(99,102,241,0.25)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(99,102,241,0.1)";
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* ---- Input area ---- */}
          <div
            style={{
              padding: "12px",
              borderTop: "1px solid var(--chat-border, rgba(255,255,255,0.1))",
              display: "flex",
              gap: "8px",
              alignItems: "flex-end",
              background: "var(--chat-input-bg, rgba(255,255,255,0.04))",
              flexShrink: 0,
            }}
          >
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about this experiment…"
              rows={1}
              disabled={isLoading}
              style={{
                flex: 1,
                resize: "none",
                border: "1px solid rgba(99,102,241,0.35)",
                borderRadius: "12px",
                padding: "9px 12px",
                fontSize: "0.875rem",
                background: "var(--input-bg, rgba(255,255,255,0.06))",
                color: "inherit",
                outline: "none",
                lineHeight: "1.4",
                maxHeight: "100px",
                overflowY: "auto",
                transition: "border-color 0.15s",
                fontFamily: "inherit",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#6366f1";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "rgba(99,102,241,0.35)";
              }}
              onInput={(e) => {
                // Auto-grow textarea
                e.target.style.height = "auto";
                e.target.style.height = Math.min(e.target.scrollHeight, 100) + "px";
              }}
            />
            <button
              onClick={sendMessage}
              disabled={!inputValue.trim() || isLoading}
              aria-label="Send message"
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "12px",
                border: "none",
                background:
                  !inputValue.trim() || isLoading
                    ? "rgba(99,102,241,0.3)"
                    : "linear-gradient(135deg, #6366f1, #8b5cf6)",
                color: "#fff",
                cursor: !inputValue.trim() || isLoading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1rem",
                flexShrink: 0,
                transition: "background 0.2s, transform 0.1s",
              }}
              onMouseEnter={(e) => {
                if (inputValue.trim() && !isLoading)
                  e.currentTarget.style.transform = "scale(1.08)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              {isLoading ? (
                <span
                  style={{
                    width: "16px",
                    height: "16px",
                    border: "2px solid rgba(255,255,255,0.4)",
                    borderTopColor: "#fff",
                    borderRadius: "50%",
                    display: "inline-block",
                    animation: "spin 0.7s linear infinite",
                  }}
                />
              ) : (
                "➤"
              )}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
