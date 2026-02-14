import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";
import { SectionTitle } from "../../InstallGuide/components/SectionTitle";
import { TypingAnimation } from "../components/TypingAnimation";

export const EnterSampleScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const formOpacity = interpolate(frame, [10, 25], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const buttonScale = spring({
    fps,
    frame: frame - 200,
    config: { damping: 8, stiffness: 100, mass: 0.6 },
    durationInFrames: 30,
  });

  const buttonGlow = Math.sin(frame * 0.15) * 0.3 + 0.7;

  const infoOpacity = interpolate(frame, [250, 280], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#F8FAFC",
        padding: 80,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <SectionTitle
        step={5}
        title="Submit a Sample"
        subtitle="Enter an SRA accession for analysis"
        color="#F59E0B"
      />

      <div
        style={{
          marginTop: 60,
          opacity: formOpacity,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 30,
        }}
      >
        {/* Input field */}
        <div
          style={{
            width: 700,
            backgroundColor: "white",
            borderRadius: 12,
            border: "2px solid #3B82F6",
            padding: "20px 24px",
            boxShadow: "0 4px 12px rgba(59, 130, 246, 0.15)",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <div style={{ fontSize: 14, color: "#64748B", fontWeight: 600 }}>
            Sample ID / Accession
          </div>
          <div style={{ minHeight: 44, display: "flex", alignItems: "center" }}>
            <TypingAnimation
              text="GCA_027890155.2"
              startFrame={40}
              framesPerChar={5}
              fontSize={32}
              color="#1E293B"
            />
          </div>
        </div>

        {/* Sample type badge */}
        <div
          style={{
            opacity: interpolate(frame, [120, 140], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            padding: "8px 20px",
            borderRadius: 8,
            backgroundColor: "#DBEAFE",
            fontSize: 16,
            color: "#1E40AF",
            fontWeight: 600,
          }}
        >
          Detected: Assembly Accession (NCBI GenBank Assembly)
        </div>

        {/* Launch button */}
        <div
          style={{
            transform: `scale(${buttonScale})`,
            opacity: frame > 180 ? 1 : 0,
            padding: "16px 48px",
            borderRadius: 12,
            backgroundColor: "#3B82F6",
            color: "white",
            fontSize: 22,
            fontWeight: 700,
            boxShadow: `0 4px ${20 * buttonGlow}px rgba(59, 130, 246, ${0.4 * buttonGlow})`,
            cursor: "pointer",
          }}
        >
          Launch Analysis
        </div>

        {/* Info text */}
        <div
          style={{
            opacity: infoOpacity,
            display: "flex",
            gap: 24,
            marginTop: 10,
          }}
        >
          {[
            { label: "Threads", value: "8" },
            { label: "Assembler", value: "SPAdes" },
            { label: "Prokka", value: "Auto-detect" },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                padding: "8px 16px",
                borderRadius: 8,
                backgroundColor: "#F1F5F9",
                fontSize: 15,
                color: "#475569",
              }}
            >
              <span style={{ fontWeight: 600 }}>{item.label}:</span> {item.value}
            </div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};
