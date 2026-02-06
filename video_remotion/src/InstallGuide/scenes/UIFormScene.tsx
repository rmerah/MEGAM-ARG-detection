import React from "react";
import { AbsoluteFill } from "remotion";
import { SectionTitle } from "../components/SectionTitle";
import { ScreenshotFrame } from "../components/ScreenshotFrame";

export const UIFormScene: React.FC = () => {
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
        step={5}
        title="Launch an Analysis"
        subtitle="Enter a sample ID and start the pipeline"
        color="#3B82F6"
      />

      <div style={{ marginTop: 30, flex: 1, display: "flex", alignItems: "flex-start" }}>
        <ScreenshotFrame
          src="screenshots/form.png"
          url="localhost:8080/form_launch_analysis.html"
          label="Supports SRA, GenBank, Assembly & local FASTA files"
          startFrame={15}
        />
      </div>
    </AbsoluteFill>
  );
};
