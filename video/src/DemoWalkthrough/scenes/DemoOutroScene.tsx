import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";

export const DemoOutroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleScale = spring({
    fps,
    frame,
    config: { damping: 12, stiffness: 80, mass: 0.8 },
    durationInFrames: 25,
  });

  const lineWidth = interpolate(frame, [10, 40], [0, 400], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const checkOpacity = interpolate(frame, [20, 35], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const contactOpacity = interpolate(frame, [60, 80], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(135deg, #0F172A 0%, #1E3A5F 50%, #0F172A 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          transform: `scale(${titleScale})`,
          fontSize: 52,
          fontWeight: 800,
          color: "white",
          textAlign: "center",
          marginBottom: 20,
        }}
      >
        Start Detecting{" "}
        <span style={{ color: "#F59E0B" }}>ARGs</span>{" "}
        Today!
      </div>

      <div
        style={{
          width: lineWidth,
          height: 3,
          backgroundColor: "#3B82F6",
          borderRadius: 2,
          marginBottom: 40,
        }}
      />

      <div
        style={{
          opacity: checkOpacity,
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        {[
          "Clone & install in minutes",
          "Web interface for easy analysis",
          "Multi-tool ARG detection",
          "Critical genes highlighted",
          "Comprehensive HTML reports",
        ].map((item, i) => (
          <div
            key={item}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              fontSize: 22,
              color: "#CBD5E1",
              opacity: interpolate(frame, [25 + i * 6, 30 + i * 6], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            <span style={{ color: "#22C55E", fontSize: 24 }}>&#10003;</span>
            {item}
          </div>
        ))}
      </div>

      <div
        style={{
          opacity: contactOpacity,
          marginTop: 50,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
        }}
      >
        <div style={{ fontSize: 20, color: "#94A3B8" }}>
          Rachid Merah &mdash; rachid.merah77@gmail.com
        </div>
        <div style={{ fontSize: 16, color: "#64748B" }}>
          MEGAM ARG Detection v3.2
        </div>
      </div>
    </AbsoluteFill>
  );
};
