import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";
import { SectionTitle } from "../components/SectionTitle";

const PREREQS = [
  { name: "Python 3.8+", icon: "Py", color: "#3776AB", desc: "Backend API & scripts" },
  { name: "Conda", icon: "C", color: "#44A833", desc: "Bioinformatics tool manager" },
  { name: "SPAdes & MEGAHIT", icon: "S", color: "#EF4444", desc: "De novo assemblers" },
  { name: "Prokka", icon: "Pk", color: "#8B5CF6", desc: "Genome annotation" },
  { name: "AMRFinderPlus", icon: "A+", color: "#3B82F6", desc: "NCBI resistance detection" },
  { name: "Abricate", icon: "Ab", color: "#F59E0B", desc: "ResFinder, CARD, VFDB" },
  { name: "Kraken2", icon: "K2", color: "#06B6D4", desc: "Taxonomic classification" },
];

export const PrerequisitesScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#F8FAFC",
        padding: 80,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <SectionTitle step={1} title="Prerequisites" subtitle="Required software" color="#8B5CF6" />

      <div
        style={{
          marginTop: 50,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
          maxWidth: 1200,
        }}
      >
        {PREREQS.map((prereq, i) => {
          const delay = 15 + i * 7;
          const itemScale = spring({
            fps,
            frame,
            config: { damping: 200 },
            delay,
            durationInFrames: 18,
          });
          const itemOpacity = interpolate(frame, [delay, delay + 10], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });

          return (
            <div
              key={prereq.name}
              style={{
                opacity: itemOpacity,
                transform: `scale(${itemScale})`,
                display: "flex",
                alignItems: "center",
                gap: 16,
                padding: "16px 24px",
                backgroundColor: "white",
                borderRadius: 12,
                border: "1px solid #E2E8F0",
                boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 8,
                  backgroundColor: `${prereq.color}18`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 16,
                  fontWeight: 800,
                  color: prereq.color,
                  flexShrink: 0,
                }}
              >
                {prereq.icon}
              </div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#1E293B" }}>
                  {prereq.name}
                </div>
                <div style={{ fontSize: 14, color: "#64748B" }}>{prereq.desc}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Install hint */}
      <div
        style={{
          marginTop: 30,
          opacity: interpolate(frame, [75, 95], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          padding: "12px 24px",
          backgroundColor: "#EFF6FF",
          borderRadius: 8,
          border: "1px solid #BFDBFE",
          fontSize: 18,
          color: "#1D4ED8",
          maxWidth: 600,
        }}
      >
        Tip: Install bioinformatics tools via <strong>Conda</strong>
      </div>
    </AbsoluteFill>
  );
};
