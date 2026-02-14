import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
} from "remotion";
import { SectionTitle } from "../components/SectionTitle";

const DATABASES = [
  { name: "Kraken2", desc: "Taxonomic classification", size: "~8 GB", status: "Required" },
  { name: "AMRFinderPlus", desc: "NCBI ARG detection", size: "~200 MB", status: "Required" },
  { name: "CARD", desc: "Resistance database", size: "~1 GB", status: "Required" },
  { name: "ResFinder (KMA)", desc: "Acquired resistance", size: "~60 MB", status: "Required" },
  { name: "PointFinder", desc: "Resistance mutations", size: "~3 MB", status: "Optional" },
  { name: "MLST", desc: "Sequence typing", size: "~200 MB", status: "Optional" },
];

export const DatabasesScene: React.FC = () => {
  const frame = useCurrentFrame();

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
        step={3}
        title="Setup Databases"
        subtitle="ARG reference databases"
        color="#F59E0B"
      />

      {/* Table */}
      <div
        style={{
          marginTop: 40,
          maxWidth: 1100,
          backgroundColor: "white",
          borderRadius: 12,
          overflow: "hidden",
          border: "1px solid #E2E8F0",
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 3fr 1fr 1fr",
            padding: "14px 24px",
            backgroundColor: "#1E293B",
            color: "white",
            fontSize: 16,
            fontWeight: 700,
            opacity: interpolate(frame, [10, 20], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          <div>Database</div>
          <div>Description</div>
          <div>Size</div>
          <div>Status</div>
        </div>

        {/* Rows */}
        {DATABASES.map((db, i) => {
          const delay = 20 + i * 8;
          const rowOpacity = interpolate(frame, [delay, delay + 8], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const rowX = interpolate(frame, [delay, delay + 10], [20, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });

          return (
            <div
              key={db.name}
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 3fr 1fr 1fr",
                padding: "14px 24px",
                borderBottom: "1px solid #F1F5F9",
                opacity: rowOpacity,
                transform: `translateX(${rowX}px)`,
                backgroundColor: i % 2 === 0 ? "white" : "#F8FAFC",
              }}
            >
              <div style={{ fontWeight: 700, color: "#1E293B", fontSize: 17 }}>{db.name}</div>
              <div style={{ color: "#64748B", fontSize: 15 }}>{db.desc}</div>
              <div style={{ color: "#475569", fontFamily: "monospace", fontSize: 15 }}>{db.size}</div>
              <div>
                <span
                  style={{
                    padding: "3px 10px",
                    borderRadius: 6,
                    fontSize: 13,
                    fontWeight: 600,
                    backgroundColor: db.status === "Required" ? "#DCFCE7" : "#FEF3C7",
                    color: db.status === "Required" ? "#166534" : "#92400E",
                  }}
                >
                  {db.status}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Note */}
      <div
        style={{
          marginTop: 24,
          opacity: interpolate(frame, [80, 100], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          fontSize: 18,
          color: "#64748B",
        }}
      >
        Databases can be managed from the web interface
      </div>
    </AbsoluteFill>
  );
};
