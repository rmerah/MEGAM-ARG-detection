import React from "react";
import {
  AbsoluteFill,
} from "remotion";
import { SectionTitle } from "../components/SectionTitle";
import { ScreenshotFrame } from "../components/ScreenshotFrame";

export const UIDashboardScene: React.FC = () => {
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
        step={6}
        title="Real-time Monitoring"
        subtitle="Track pipeline progress & logs"
        color="#F59E0B"
      />

      <div style={{ marginTop: 30, flex: 1, display: "flex", alignItems: "flex-start" }}>
        <ScreenshotFrame
          src="screenshots/dashboard.png"
          url="localhost:8080/dashboard_monitoring.html"
          label="Live progress bar, step tracking & pipeline logs"
          startFrame={15}
        />
      </div>
    </AbsoluteFill>
  );
};
