import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";

export const ToolBadge: React.FC<{
  name: string;
  description: string;
  color: string;
  icon: string;
  delay: number;
}> = ({ name, description, color, icon, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({
    fps,
    frame,
    config: { damping: 200, stiffness: 120 },
    delay,
    durationInFrames: 20,
  });

  const opacity = interpolate(frame, [delay, delay + 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        opacity,
        transform: `scale(${scale})`,
        backgroundColor: "white",
        borderRadius: 12,
        padding: "16px 20px",
        display: "flex",
        alignItems: "center",
        gap: 14,
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        border: `2px solid ${color}30`,
        minWidth: 260,
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 10,
          backgroundColor: `${color}15`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 16,
          fontWeight: 800,
          color: color,
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 18, fontWeight: 700, color: "#1E293B" }}>{name}</div>
        <div style={{ fontSize: 13, color: "#64748B", marginTop: 2 }}>{description}</div>
      </div>
    </div>
  );
};
