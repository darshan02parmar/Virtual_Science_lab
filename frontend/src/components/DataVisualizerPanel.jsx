import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export default function DataVisualizerPanel({ experimentId }) {
  const cacheKey = `dataLab_${experimentId}`;

  const [isExpanded, setIsExpanded] = useState(false);
  const [xLabel, setXLabel] = useState("Time (s)");
  const [yLabel, setYLabel] = useState("Velocity (m/s)");
  const [dataPoints, setDataPoints] = useState([{ id: Date.now(), x: "", y: "" }]);

  useEffect(() => {
    const saved = localStorage.getItem(cacheKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setXLabel(parsed.xLabel || "Time (s)");
        setYLabel(parsed.yLabel || "Velocity (m/s)");
        if (parsed.dataPoints && parsed.dataPoints.length > 0) {
          setDataPoints(parsed.dataPoints);
        }
      } catch (e) {
        console.error("Failed to parse Data Lab cache", e);
      }
    }
  }, [cacheKey]);

  useEffect(() => {
    localStorage.setItem(
      cacheKey,
      JSON.stringify({ xLabel, yLabel, dataPoints })
    );
  }, [xLabel, yLabel, dataPoints, cacheKey]);

  const addRow = () => {
    setDataPoints([...dataPoints, { id: Date.now(), x: "", y: "" }]);
  };

  const updateRow = (id, field, value) => {
    setDataPoints((prev) =>
      prev.map((point) =>
        point.id === id ? { ...point, [field]: value } : point
      )
    );
  };

  const deleteRow = (id) => {
    if (dataPoints.length === 1) {
      setDataPoints([{ id: Date.now(), x: "", y: "" }]);
      return;
    }
    setDataPoints(dataPoints.filter((point) => point.id !== id));
  };

  const chartData = dataPoints
    .map((dp) => {
      const parsedX = parseFloat(dp.x);
      const parsedY = parseFloat(dp.y);
      if (!isNaN(parsedX) && !isNaN(parsedY)) {
        return { x: parsedX, y: parsedY };
      }
      return null;
    })
    .filter(Boolean)
    .sort((a, b) => a.x - b.x); // Sort by X so line charts connect left-to-right properly

  return (
    <div
      className="tracker-panel fade-in"
      style={{
        marginTop: "24px",
        background: "var(--card-bg, #ffffff)",
        borderColor: "rgba(99,102,241,0.2)",
      }}
    >
      <div
        className="tracker-panel-heading"
        style={{ cursor: "pointer", marginBottom: isExpanded ? "18px" : "0" }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "1.5rem" }}>📊</span>
          <h2 style={{ margin: 0 }}>Data Lab Visualizer</h2>
        </div>
        <button
          style={{
            background: "transparent",
            border: "none",
            fontSize: "1.2rem",
            cursor: "pointer",
            color: "var(--text-muted, #64748b)",
          }}
        >
          {isExpanded ? "▲" : "▼"}
        </button>
      </div>

      {isExpanded && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "32px" }}>
          {/* Table Section */}
          <div style={{ flex: "1 1 300px", minWidth: "300px" }}>
            <div
              style={{
                display: "flex",
                gap: "12px",
                marginBottom: "16px",
              }}
            >
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: "0.8rem", fontWeight: "bold", display: "block", marginBottom: "4px" }}>
                  X-Axis Label
                </label>
                <input
                  type="text"
                  value={xLabel}
                  onChange={(e) => setXLabel(e.target.value)}
                  style={inputStyle}
                  placeholder="e.g., Time (s)"
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: "0.8rem", fontWeight: "bold", display: "block", marginBottom: "4px" }}>
                  Y-Axis Label
                </label>
                <input
                  type="text"
                  value={yLabel}
                  onChange={(e) => setYLabel(e.target.value)}
                  style={inputStyle}
                  placeholder="e.g., Velocity (m/s)"
                />
              </div>
            </div>

            <div
              style={{
                border: "1px solid rgba(156,163,175,0.3)",
                borderRadius: "8px",
                overflow: "hidden",
              }}
            >
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "rgba(99,102,241,0.1)" }}>
                    <th style={thStyle}>{xLabel || "X"}</th>
                    <th style={thStyle}>{yLabel || "Y"}</th>
                    <th style={{ ...thStyle, width: "50px" }}></th>
                  </tr>
                </thead>
                <tbody>
                  {dataPoints.map((dp) => (
                    <tr
                      key={dp.id}
                      style={{ borderTop: "1px solid rgba(156,163,175,0.2)" }}
                    >
                      <td style={tdStyle}>
                        <input
                          type="number"
                          value={dp.x}
                          onChange={(e) => updateRow(dp.id, "x", e.target.value)}
                          style={tableInputStyle}
                          placeholder="0"
                        />
                      </td>
                      <td style={tdStyle}>
                        <input
                          type="number"
                          value={dp.y}
                          onChange={(e) => updateRow(dp.id, "y", e.target.value)}
                          style={tableInputStyle}
                          placeholder="0"
                        />
                      </td>
                      <td style={{ ...tdStyle, textAlign: "center" }}>
                        <button
                          onClick={() => deleteRow(dp.id)}
                          style={{
                            background: "transparent",
                            border: "none",
                            color: "#ef4444",
                            cursor: "pointer",
                            fontSize: "1.1rem",
                            padding: "4px",
                          }}
                          title="Delete row"
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button
                onClick={addRow}
                style={{
                  width: "100%",
                  padding: "10px",
                  background: "rgba(99,102,241,0.05)",
                  border: "none",
                  borderTop: "1px solid rgba(156,163,175,0.2)",
                  color: "#6366f1",
                  fontWeight: "bold",
                  cursor: "pointer",
                  transition: "background 0.2s",
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.background = "rgba(99,102,241,0.15)")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.background = "rgba(99,102,241,0.05)")
                }
              >
                + Add Data Point
              </button>
            </div>
          </div>

          {/* Chart Section */}
          <div
            style={{
              flex: "2 1 400px",
              minWidth: "300px",
              minHeight: "350px",
              border: "1px solid rgba(156,163,175,0.3)",
              borderRadius: "8px",
              padding: "16px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <h3 style={{ margin: "0 0 16px 0", textAlign: "center" }}>
              {yLabel || "Y"} vs. {xLabel || "X"}
            </h3>
            {chartData.length >= 2 ? (
              <div style={{ flex: 1, width: "100%", minHeight: "300px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.4} />
                    <XAxis
                      dataKey="x"
                      type="number"
                      domain={["auto", "auto"]}
                      label={{
                        value: xLabel,
                        position: "insideBottom",
                        offset: -15,
                      }}
                      tick={{ fill: "var(--text-muted, #64748b)" }}
                    />
                    <YAxis
                      domain={["auto", "auto"]}
                      label={{
                        value: yLabel,
                        angle: -90,
                        position: "insideLeft",
                        offset: -10,
                      }}
                      tick={{ fill: "var(--text-muted, #64748b)" }}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "8px",
                        backgroundColor: "var(--card-bg, #ffffff)",
                        borderColor: "rgba(99,102,241,0.3)",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      }}
                    />
                    <Legend verticalAlign="top" height={36} />
                    <Line
                      type="monotone"
                      dataKey="y"
                      name={yLabel || "Series 1"}
                      stroke="#6366f1"
                      strokeWidth={3}
                      activeDot={{ r: 8 }}
                      dot={{ r: 5, fill: "#8b5cf6", strokeWidth: 2 }}
                      animationDuration={400}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--text-muted, #9ca3af)",
                  fontStyle: "italic",
                  background: "rgba(156,163,175,0.05)",
                  borderRadius: "8px",
                }}
              >
                Add at least two data points to see the graph!
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Inline Styles
const inputStyle = {
  width: "100%",
  padding: "8px 12px",
  borderRadius: "6px",
  border: "1px solid rgba(156,163,175,0.4)",
  background: "var(--card-bg, #ffffff)",
  color: "inherit",
  outline: "none",
  boxSizing: "border-box",
};

const thStyle = {
  padding: "10px",
  textAlign: "left",
  fontWeight: "bold",
  fontSize: "0.9rem",
};

const tdStyle = {
  padding: "8px 10px",
};

const tableInputStyle = {
  width: "100%",
  padding: "6px 8px",
  borderRadius: "4px",
  border: "1px solid rgba(156,163,175,0.4)",
  background: "var(--card-bg, #ffffff)",
  color: "inherit",
  outline: "none",
  boxSizing: "border-box",
};
