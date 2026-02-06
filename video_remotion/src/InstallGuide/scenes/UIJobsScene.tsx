import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
} from "remotion";
import { SectionTitle } from "../components/SectionTitle";
import { ScreenshotFrame } from "../components/ScreenshotFrame";

export const UIJobsScene: React.FC = () => {
  const frame = useCurrentFrame();

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
        title="Jobs & Database Management"
        subtitle="History, file access & database updates"
        color="#8B5CF6"
      />

      <div
        style={{
          marginTop: 30,
          flex: 1,
          display: "flex",
          gap: 30,
          alignItems: "flex-start",
        }}
      >
        {/* Jobs screenshot */}
        <div style={{
          flex: 1,
          opacity: interpolate(frame, [15, 30], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          transform: `translateY(${interpolate(frame, [15, 30], [30, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })}px)`,
        }}>
          <ScreenshotFrame
            src="screenshots/jobs.png"
            url="localhost:8080/jobs_list.html"
            label="Analysis History"
            startFrame={0}
          />
        </div>

        {/* Databases screenshot */}
        <div style={{
          flex: 1,
          opacity: interpolate(frame, [40, 55], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          transform: `translateY(${interpolate(frame, [40, 55], [30, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })}px)`,
        }}>
          <ScreenshotFrame
            src="screenshots/databases.png"
            url="localhost:8080/databases.html"
            label="Database Management"
            startFrame={0}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};
