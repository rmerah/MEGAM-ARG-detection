import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";

export const SectionTitle: React.FC<{
  step: number;
  title: string;
  subtitle?: string;
  color?: string;
}> = ({ step, title, subtitle, color = "#3B82F6" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({
    fps,
    frame,
    config: { damping: 200, stiffness: 100 },
    durationInFrames: 20,
  });

  const opacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
  });

  const translateX = interpolate(frame, [0, 20], [-40, 0], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 20,
        opacity,
        transform: `translateX(${translateX}px)`,
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 12,
          backgroundColor: color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 24,
          fontWeight: 800,
          color: "white",
          transform: `scale(${scale})`,
          boxShadow: `0 4px 12px ${color}40`,
        }}
      >
        {step}
      </div>
      <div>
        <div
          style={{
            fontSize: 36,
            fontWeight: 700,
            color: "#1E293B",
            letterSpacing: -0.5,
          }}
        >
          {title}
        </div>
        {subtitle && (
          <div style={{ fontSize: 18, color: "#64748B", marginTop: 4 }}>
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
};
