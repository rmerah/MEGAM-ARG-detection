import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
} from "remotion";
import { SectionTitle } from "../../InstallGuide/components/SectionTitle";

const FEATURES = [
  { text: "Interactive HTML report with sortable tables", icon: "&#128196;" },
  { text: "Multi-tool comparison (AMRFinderPlus, ResFinder, CARD)", icon: "&#128269;" },
  { text: "Severity classification (CRITICAL / HIGH / MODERATE / LOW)", icon: "&#9888;" },
  { text: "Sample metadata and species identification", icon: "&#129516;" },
  { text: "Downloadable TSV data for further analysis", icon: "&#128190;" },
  { text: "Prokka genome annotation summary", icon: "&#129516;" },
];

export const ReportScene: React.FC = () => {
  const frame = useCurrentFrame();

  const headerOpacity = interpolate(frame, [10, 25], [0, 1], {
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
        step={9}
        title="HTML Report Generation"
        subtitle="Comprehensive analysis report"
        color="#8B5CF6"
      />

      <div
        style={{
          marginTop: 50,
          display: "flex",
          gap: 40,
        }}
      >
        {/* Report preview card */}
        <div
          style={{
            flex: 1,
            opacity: headerOpacity,
            backgroundColor: "white",
            borderRadius: 16,
            padding: 32,
            border: "1px solid #E2E8F0",
            boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
          }}
        >
          <div style={{ fontSize: 64 }}>&#128202;</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#1E293B" }}>
            ARG Detection Report
          </div>
          <div style={{ fontSize: 16, color: "#64748B", textAlign: "center" }}>
            SRR28083254_run_1
          </div>
          <div
            style={{
              marginTop: 12,
              padding: "8px 20px",
              borderRadius: 8,
              backgroundColor: "#F0FDF4",
              border: "1px solid #BBF7D0",
              fontSize: 14,
              fontWeight: 600,
              color: "#166534",
            }}
          >
            report_arg_SRR28083254.html
          </div>
        </div>

        {/* Features list */}
        <div
          style={{
            flex: 1.2,
            display: "flex",
            flexDirection: "column",
            gap: 16,
            justifyContent: "center",
          }}
        >
          {FEATURES.map((feature, i) => {
            const delay = 25 + i * 12;
            const featureOpacity = interpolate(frame, [delay, delay + 10], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            const featureX = interpolate(frame, [delay, delay + 12], [20, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });

            return (
              <div
                key={feature.text}
                style={{
                  opacity: featureOpacity,
                  transform: `translateX(${featureX}px)`,
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "12px 18px",
                  borderRadius: 10,
                  backgroundColor: "white",
                  border: "1px solid #E2E8F0",
                }}
              >
                <span
                  style={{ fontSize: 22, width: 30, textAlign: "center" }}
                  dangerouslySetInnerHTML={{ __html: feature.icon }}
                />
                <span style={{ fontSize: 17, color: "#334155", fontWeight: 500 }}>
                  {feature.text}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
