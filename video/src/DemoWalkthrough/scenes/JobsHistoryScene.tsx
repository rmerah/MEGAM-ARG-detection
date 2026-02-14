import React from "react";
import {
  AbsoluteFill,
} from "remotion";
import { SectionTitle } from "../../InstallGuide/components/SectionTitle";
import { ScreenshotFrame } from "../../InstallGuide/components/ScreenshotFrame";

export const JobsHistoryScene: React.FC = () => {

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
        step={10}
        title="Jobs History & Database Management"
        subtitle="Track all analyses and manage ARG databases"
        color="#06B6D4"
      />

      <div
        style={{
          marginTop: 30,
          display: "flex",
          gap: 30,
          flex: 1,
          alignItems: "center",
        }}
      >
        <div style={{ flex: 1 }}>
          <ScreenshotFrame
            src="screenshots/jobs.png"
            url="localhost:8080/jobs_list.html"
            label="Jobs History"
            startFrame={15}
          />
        </div>

        <div style={{ flex: 1 }}>
          <ScreenshotFrame
            src="screenshots/databases.png"
            url="localhost:8080/databases.html"
            label="Database Management"
            startFrame={40}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};
