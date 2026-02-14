import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";

export const DemoIntroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const dots = Array.from({ length: 12 }, (_, i) => ({
    x: 150 + Math.sin(i * 0.8 + frame * 0.03) * 60,
    y: 100 + i * 75,
    size: 8 + Math.sin(i * 1.2) * 3,
    opacity: 0.15 + Math.sin(i * 0.5 + frame * 0.05) * 0.1,
  }));

  const dots2 = Array.from({ length: 12 }, (_, i) => ({
    x: 1770 - Math.sin(i * 0.8 + frame * 0.03) * 60,
    y: 100 + i * 75,
    size: 8 + Math.cos(i * 1.2) * 3,
    opacity: 0.15 + Math.cos(i * 0.5 + frame * 0.05) * 0.1,
  }));

  const titleScale = spring({
    fps,
    frame,
    config: { damping: 12, stiffness: 80, mass: 0.8 },
    durationInFrames: 30,
  });

  const subtitleOpacity = interpolate(frame, [30, 50], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const subtitleY = interpolate(frame, [30, 50], [20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const lineWidth = interpolate(frame, [15, 50], [0, 500], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const badgeScale = spring({
    fps,
    frame,
    config: { damping: 200 },
    delay: 70,
    durationInFrames: 20,
  });

  const demoOpacity = interpolate(frame, [90, 120], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const demoY = interpolate(frame, [90, 120], [15, 0], {
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
      {[...dots, ...dots2].map((dot, i) => (
        <div
          key={`dot-${i}`}
          style={{
            position: "absolute",
            left: dot.x,
            top: dot.y,
            width: dot.size,
            height: dot.size,
            borderRadius: "50%",
            backgroundColor: "#3B82F6",
            opacity: dot.opacity,
          }}
        />
      ))}

      <div
        style={{
          transform: `scale(${titleScale})`,
          fontSize: 82,
          fontWeight: 800,
          color: "white",
          letterSpacing: -2,
          textAlign: "center",
        }}
      >
        <span style={{ color: "#60A5FA" }}>MEGAM</span>{" "}
        <span style={{ color: "#F59E0B" }}>ARG</span>{" "}
        <span>Detection</span>
      </div>

      <div
        style={{
          width: lineWidth,
          height: 3,
          backgroundColor: "#3B82F6",
          borderRadius: 2,
          marginTop: 20,
          marginBottom: 20,
        }}
      />

      <div
        style={{
          opacity: subtitleOpacity,
          transform: `translateY(${subtitleY}px)`,
          fontSize: 36,
          color: "#94A3B8",
          textAlign: "center",
          maxWidth: 900,
          lineHeight: 1.5,
        }}
      >
        Complete Demo Walkthrough
      </div>

      <div
        style={{
          transform: `scale(${badgeScale})`,
          marginTop: 30,
          padding: "8px 24px",
          borderRadius: 20,
          backgroundColor: "#1E293B",
          border: "1px solid #334155",
          fontSize: 16,
          color: "#94A3B8",
        }}
      >
        v3.2 &mdash; From Installation to Results
      </div>

      <div
        style={{
          opacity: demoOpacity,
          transform: `translateY(${demoY}px)`,
          marginTop: 50,
          fontSize: 18,
          color: "#64748B",
        }}
      >
        by Rachid Merah
      </div>
    </AbsoluteFill>
  );
};
