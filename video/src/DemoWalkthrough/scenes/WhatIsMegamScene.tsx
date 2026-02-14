import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
} from "remotion";
import { ToolBadge } from "../../InstallGuide/components/ToolBadge";

const TOOLS = [
  { name: "AMRFinderPlus", description: "NCBI ARG Detection", color: "#3B82F6", icon: "A+" },
  { name: "ResFinder", description: "Acquired Resistance Genes", color: "#10B981", icon: "RF" },
  { name: "CARD / RGI", description: "Resistance Gene Identifier", color: "#F59E0B", icon: "CA" },
  { name: "Prokka", description: "Genome Annotation", color: "#8B5CF6", icon: "Pk" },
  { name: "SPAdes / MEGAHIT", description: "De novo Assembly", color: "#EF4444", icon: "SP" },
  { name: "NCBI Entrez", description: "Species Detection API", color: "#06B6D4", icon: "NE" },
];

export const WhatIsMegamScene: React.FC = () => {
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

  const flowOpacity = interpolate(frame, [80, 100], [0, 1], {
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
        What is <span style={{ color: "#3B82F6" }}>MEGAM ARG</span> Detection?
      </div>

      <div
        style={{
          opacity: descOpacity,
          fontSize: 22,
          color: "#64748B",
          marginBottom: 50,
          maxWidth: 1100,
          lineHeight: 1.5,
        }}
      >
        A complete web pipeline for detecting antimicrobial resistance genes from SRA, GenBank, Assembly accessions or local FASTA files.
      </div>

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
            delay={20 + i * 8}
          />
        ))}
      </div>

      <div
        style={{
          marginTop: 50,
          display: "flex",
          alignItems: "center",
          gap: 16,
          opacity: flowOpacity,
        }}
      >
        {["Input (SRA/GenBank)", "Download", "Assembly", "Annotation", "ARG Detection", "Report"].map(
          (step, i) => (
            <React.Fragment key={step}>
              <div
                style={{
                  padding: "10px 20px",
                  borderRadius: 8,
                  backgroundColor: i === 4 ? "#3B82F6" : "#E2E8F0",
                  color: i === 4 ? "white" : "#475569",
                  fontSize: 15,
                  fontWeight: 600,
                }}
              >
                {step}
              </div>
              {i < 5 && (
                <div style={{ fontSize: 20, color: "#94A3B8" }}>&#8594;</div>
              )}
            </React.Fragment>
          )
        )}
      </div>
    </AbsoluteFill>
  );
};
