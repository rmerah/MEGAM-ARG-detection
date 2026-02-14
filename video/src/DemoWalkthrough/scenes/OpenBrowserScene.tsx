import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
} from "remotion";
import { SectionTitle } from "../../InstallGuide/components/SectionTitle";
import { ScreenshotFrame } from "../../InstallGuide/components/ScreenshotFrame";

export const OpenBrowserScene: React.FC = () => {
  const frame = useCurrentFrame();

  const hintOpacity = interpolate(frame, [120, 150], [0, 1], {
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
        step={4}
        title="Open the Web Interface"
        subtitle="Navigate to the analysis form"
        color="#06B6D4"
      />

      <div style={{ marginTop: 30, flex: 1 }}>
        <ScreenshotFrame
          src="screenshots/form.png"
          url="localhost:8080/form_launch_analysis.html"
          label=""
          startFrame={15}
        />
      </div>

      <div
        style={{
          opacity: hintOpacity,
          textAlign: "center",
          fontSize: 20,
          color: "#64748B",
          marginTop: 12,
        }}
      >
        Supports SRA, GenBank, Assembly accessions and local FASTA files
      </div>
    </AbsoluteFill>
  );
};
