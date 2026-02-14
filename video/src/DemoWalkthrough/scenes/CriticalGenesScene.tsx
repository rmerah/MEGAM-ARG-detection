import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
} from "remotion";
import { SectionTitle } from "../../InstallGuide/components/SectionTitle";
import { ResultsTable } from "../components/ResultsTable";

const ARG_RESULTS = [
  { gene: "blaNDM-1", tool: "AMRFinderPlus", resistance: "Carbapenem (metallo-beta-lactamase)", severity: "CRITICAL" as const, identity: "100%" },
  { gene: "mcr-1", tool: "ResFinder", resistance: "Colistin (phosphoethanolamine transferase)", severity: "CRITICAL" as const, identity: "99.8%" },
  { gene: "blaKPC-3", tool: "CARD/RGI", resistance: "Carbapenem (serine beta-lactamase)", severity: "CRITICAL" as const, identity: "99.5%" },
  { gene: "blaCTX-M-15", tool: "AMRFinderPlus", resistance: "Cephalosporin (ESBL)", severity: "CRITICAL" as const, identity: "100%" },
  { gene: "qnrS1", tool: "ResFinder", resistance: "Fluoroquinolone (Qnr family)", severity: "HIGH" as const, identity: "98.7%" },
  { gene: "aac(6')-Ib-cr", tool: "CARD/RGI", resistance: "Aminoglycoside / Fluoroquinolone", severity: "HIGH" as const, identity: "99.1%" },
  { gene: "sul1", tool: "AMRFinderPlus", resistance: "Sulfonamide (dihydropteroate synthase)", severity: "MODERATE" as const, identity: "100%" },
  { gene: "tetA", tool: "ResFinder", resistance: "Tetracycline (efflux pump)", severity: "MODERATE" as const, identity: "97.3%" },
];

export const CriticalGenesScene: React.FC = () => {
  const frame = useCurrentFrame();

  const warningOpacity = interpolate(frame, [180, 210], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const warningPulse = Math.sin(frame * 0.12) * 0.15 + 0.85;

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
        step={8}
        title="Critical ARG Genes Detected"
        subtitle="Multi-tool consensus results with severity classification"
        color="#EF4444"
      />

      <div style={{ marginTop: 30 }}>
        <ResultsTable
          results={ARG_RESULTS}
          startFrame={15}
          framesPerRow={12}
        />
      </div>

      <div
        style={{
          opacity: warningOpacity * warningPulse,
          marginTop: 24,
          padding: "12px 24px",
          borderRadius: 10,
          backgroundColor: "#FEF2F2",
          border: "1px solid #FECACA",
          display: "flex",
          alignItems: "center",
          gap: 12,
          maxWidth: 800,
        }}
      >
        <span style={{ fontSize: 24 }}>&#9888;</span>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#991B1B" }}>
            4 CRITICAL resistance genes detected
          </div>
          <div style={{ fontSize: 14, color: "#B91C1C", marginTop: 2 }}>
            blaNDM-1, mcr-1, blaKPC-3, blaCTX-M-15 - Multi-drug resistance pattern
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
