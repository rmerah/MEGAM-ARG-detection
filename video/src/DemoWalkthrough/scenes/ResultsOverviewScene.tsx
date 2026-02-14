import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
} from "remotion";
import { SectionTitle } from "../../InstallGuide/components/SectionTitle";
import { ScreenshotFrame } from "../../InstallGuide/components/ScreenshotFrame";

export const ResultsOverviewScene: React.FC = () => {
  const frame = useCurrentFrame();

  const statsOpacity = interpolate(frame, [120, 150], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#F8FAFC",
        padding: "60px 80px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <SectionTitle
        step={7}
        title="Results Overview"
        subtitle="Analysis complete - viewing detected ARGs"
        color="#10B981"
      />

      <div style={{ marginTop: 20, flex: 1 }}>
        <ScreenshotFrame
          src="screenshots/results-detailed.png"
          url="localhost:8080/page_results_arg.html?job_id=1"
          label=""
          startFrame={15}
        />
      </div>

      <div
        style={{
          opacity: statsOpacity,
          display: "flex",
          gap: 24,
          justifyContent: "center",
          marginTop: 16,
        }}
      >
        {[
          { label: "Genes Detected", value: "12", color: "#EF4444" },
          { label: "Tools Used", value: "3", color: "#3B82F6" },
          { label: "Critical", value: "4", color: "#DC2626" },
          { label: "Identity Avg", value: "99.2%", color: "#10B981" },
        ].map((stat) => (
          <div
            key={stat.label}
            style={{
              padding: "12px 24px",
              borderRadius: 10,
              backgroundColor: "white",
              border: `1px solid ${stat.color}30`,
              textAlign: "center",
              boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
            }}
          >
            <div style={{ fontSize: 28, fontWeight: 800, color: stat.color }}>
              {stat.value}
            </div>
            <div style={{ fontSize: 13, color: "#64748B", marginTop: 4 }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
