import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
} from "remotion";
import { ToolBadge } from "../components/ToolBadge";

const TOOLS = [
  { name: "AMRFinderPlus", description: "NCBI ARG Detection", color: "#3B82F6", icon: "A+" },
  { name: "ResFinder", description: "Acquired Resistance Genes", color: "#10B981", icon: "RF" },
  { name: "CARD", description: "Resistance Database", color: "#F59E0B", icon: "CA" },
  { name: "Prokka", description: "Genome Annotation", color: "#8B5CF6", icon: "Pk" },
  { name: "SPAdes / MEGAHIT", description: "De novo Assembly", color: "#EF4444", icon: "SP" },
  { name: "Kraken2", description: "Taxonomic Classification", color: "#06B6D4", icon: "K2" },
];

export const OverviewScene: React.FC = () => {
  const frame = useCurrentFrame();

  const titleOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
  });
  const titleX = interpolate(frame, [0, 15], [-30, 0], {
    extrapolateRight: "clamp",
  });

  const descOpacity = interpolate(frame, [10, 25], [0, 1], {
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
      {/* Title */}
      <div
        style={{
          opacity: titleOpacity,
          transform: `translateX(${titleX}px)`,
          fontSize: 44,
          fontWeight: 800,
          color: "#0F172A",
          marginBottom: 12,
        }}
      >
        What is <span style={{ color: "#3B82F6" }}>MEGAM ARG</span>?
      </div>

      <div
        style={{
          opacity: descOpacity,
          fontSize: 22,
          color: "#64748B",
          marginBottom: 50,
          maxWidth: 1000,
          lineHeight: 1.5,
        }}
      >
        A web-based pipeline for detecting antimicrobial resistance genes, integrating multiple reference tools and databases.
      </div>

      {/* Tools grid */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 20,
          justifyContent: "flex-start",
        }}
      >
        {TOOLS.map((tool, i) => (
          <ToolBadge
            key={tool.name}
            name={tool.name}
            description={tool.description}
            color={tool.color}
            icon={tool.icon}
            delay={15 + i * 8}
          />
        ))}
      </div>

      {/* Pipeline flow */}
      <div
        style={{
          marginTop: 50,
          display: "flex",
          alignItems: "center",
          gap: 16,
          opacity: interpolate(frame, [70, 90], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        {["Input (SRA/GenBank)", "QC & Assembly", "Annotation", "ARG Detection", "Reports"].map(
          (step, i) => (
            <React.Fragment key={step}>
              <div
                style={{
                  padding: "10px 20px",
                  borderRadius: 8,
                  backgroundColor: i === 3 ? "#3B82F6" : "#E2E8F0",
                  color: i === 3 ? "white" : "#475569",
                  fontSize: 16,
                  fontWeight: 600,
                }}
              >
                {step}
              </div>
              {i < 4 && (
                <div style={{ fontSize: 20, color: "#94A3B8" }}>→</div>
              )}
            </React.Fragment>
          )
        )}
      </div>
    </AbsoluteFill>
  );
};
