import React from "react";
import { useCurrentFrame, interpolate } from "remotion";

type ARGResult = {
  gene: string;
  tool: string;
  resistance: string;
  severity: "CRITICAL" | "HIGH" | "MODERATE" | "LOW";
  identity: string;
};

const SEVERITY_STYLES: Record<string, { bg: string; color: string }> = {
  CRITICAL: { bg: "#FEE2E2", color: "#991B1B" },
  HIGH: { bg: "#FEF3C7", color: "#92400E" },
  MODERATE: { bg: "#DBEAFE", color: "#1E40AF" },
  LOW: { bg: "#F1F5F9", color: "#475569" },
};

export const ResultsTable: React.FC<{
  results: ARGResult[];
  startFrame?: number;
  framesPerRow?: number;
}> = ({ results, startFrame = 15, framesPerRow = 10 }) => {
  const frame = useCurrentFrame();

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 1400,
        backgroundColor: "white",
        borderRadius: 12,
        overflow: "hidden",
        border: "1px solid #E2E8F0",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1.5fr 2.5fr 1.2fr 1fr",
          padding: "14px 24px",
          backgroundColor: "#1E293B",
          color: "white",
          fontSize: 16,
          fontWeight: 700,
          opacity: interpolate(frame, [startFrame, startFrame + 10], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        <div>Gene</div>
        <div>Tool</div>
        <div>Resistance</div>
        <div>Severity</div>
        <div>Identity</div>
      </div>

      {/* Rows */}
      {results.map((row, i) => {
        const delay = startFrame + 10 + i * framesPerRow;
        const rowOpacity = interpolate(frame, [delay, delay + framesPerRow], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const rowX = interpolate(frame, [delay, delay + 12], [20, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

        const severity = SEVERITY_STYLES[row.severity] || SEVERITY_STYLES.LOW;
        const isCritical = row.severity === "CRITICAL";
        const isHigh = row.severity === "HIGH";

        return (
          <div
            key={`${row.gene}-${i}`}
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1.5fr 2.5fr 1.2fr 1fr",
              padding: "14px 24px",
              borderBottom: "1px solid #F1F5F9",
              opacity: rowOpacity,
              transform: `translateX(${rowX}px)`,
              backgroundColor: isCritical ? "#FEE2E2" : isHigh ? "#FEF3C7" : i % 2 === 0 ? "white" : "#F8FAFC",
            }}
          >
            <div
              style={{
                fontWeight: 700,
                color: isCritical ? "#991B1B" : "#1E293B",
                fontSize: 17,
                fontFamily: "monospace",
              }}
            >
              {row.gene}
            </div>
            <div style={{ color: "#64748B", fontSize: 15 }}>{row.tool}</div>
            <div style={{ color: "#475569", fontSize: 15 }}>{row.resistance}</div>
            <div>
              <span
                style={{
                  padding: "3px 10px",
                  borderRadius: 6,
                  fontSize: 13,
                  fontWeight: 600,
                  backgroundColor: severity.bg,
                  color: severity.color,
                }}
              >
                {row.severity}
              </span>
            </div>
            <div style={{ color: "#475569", fontFamily: "monospace", fontSize: 15 }}>{row.identity}</div>
          </div>
        );
      })}
    </div>
  );
};
