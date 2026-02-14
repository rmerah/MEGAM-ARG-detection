import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
} from "remotion";
import { SectionTitle } from "../../InstallGuide/components/SectionTitle";
import { ScreenshotFrame } from "../../InstallGuide/components/ScreenshotFrame";

const STEPS = [
  { label: "Downloading SRA data (fasterq-dump)", icon: "&#8595;" },
  { label: "Quality control (FastQC)", icon: "&#10003;" },
  { label: "De novo assembly (SPAdes)", icon: "&#10003;" },
  { label: "Genome annotation (Prokka)", icon: "&#10003;" },
  { label: "ARG detection (AMRFinderPlus, ResFinder, CARD)", icon: "&#10003;" },
  { label: "Generating HTML report", icon: "&#10003;" },
];

export const PipelineRunningScene: React.FC = () => {
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
        step={6}
        title="Pipeline Running"
        subtitle="Real-time monitoring of analysis progress"
        color="#EF4444"
      />

      <div
        style={{
          marginTop: 30,
          display: "flex",
          gap: 40,
          flex: 1,
        }}
      >
        {/* Screenshot */}
        <div style={{ flex: 1.2 }}>
          <ScreenshotFrame
            src="screenshots/dashboard.png"
            url="localhost:8080/dashboard_monitoring.html"
            label=""
            startFrame={15}
          />
        </div>

        {/* Checklist */}
        <div
          style={{
            flex: 0.8,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 16,
          }}
        >
          <div
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: "#1E293B",
              marginBottom: 8,
              opacity: interpolate(frame, [30, 45], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            Pipeline Steps
          </div>

          {STEPS.map((step, i) => {
            const delay = 50 + i * 25;
            const isActive = frame >= delay;
            const isComplete = frame >= delay + 20;
            const stepOpacity = interpolate(frame, [delay, delay + 10], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });

            return (
              <div
                key={step.label}
                style={{
                  opacity: stepOpacity,
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 16px",
                  borderRadius: 8,
                  backgroundColor: isComplete ? "#F0FDF4" : isActive ? "#FEF3C7" : "#F8FAFC",
                  border: `1px solid ${isComplete ? "#BBF7D0" : isActive ? "#FDE68A" : "#E2E8F0"}`,
                }}
              >
                <span
                  style={{
                    fontSize: 18,
                    color: isComplete ? "#16A34A" : "#F59E0B",
                    fontWeight: 700,
                    width: 24,
                    textAlign: "center",
                  }}
                  dangerouslySetInnerHTML={{ __html: isComplete ? "&#10003;" : "&#9679;" }}
                />
                <span
                  style={{
                    fontSize: 15,
                    color: isComplete ? "#166534" : "#475569",
                    fontWeight: isActive ? 600 : 400,
                  }}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
