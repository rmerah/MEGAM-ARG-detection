import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate, Img, staticFile } from "remotion";

export const ScreenshotFrame: React.FC<{
  src: string;
  url: string;
  label: string;
  startFrame?: number;
}> = ({ src, url, label, startFrame = 15 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const slideUp = spring({
    fps,
    frame: frame - startFrame,
    config: { damping: 200, stiffness: 80 },
    durationInFrames: 25,
  });

  const opacity = interpolate(frame, [startFrame, startFrame + 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const translateY = interpolate(slideUp, [0, 1], [60, 0]);
  const scale = interpolate(slideUp, [0, 1], [0.95, 1]);

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${translateY}px) scale(${scale})`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
      }}
    >
      {/* Browser chrome */}
      <div
        style={{
          width: "90%",
          maxWidth: 1600,
          borderRadius: "12px 12px 0 0",
          backgroundColor: "#E2E8F0",
          padding: "10px 16px",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        {/* Traffic lights */}
        <div style={{ display: "flex", gap: 6 }}>
          <div style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: "#EF4444" }} />
          <div style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: "#F59E0B" }} />
          <div style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: "#22C55E" }} />
        </div>
        {/* URL bar */}
        <div
          style={{
            flex: 1,
            backgroundColor: "white",
            borderRadius: 6,
            padding: "6px 12px",
            fontSize: 13,
            color: "#64748B",
            fontFamily: "monospace",
          }}
        >
          {url}
        </div>
      </div>

      {/* Screenshot */}
      <div
        style={{
          width: "90%",
          maxWidth: 1600,
          borderRadius: "0 0 12px 12px",
          overflow: "hidden",
          boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
          border: "1px solid #CBD5E1",
          borderTop: "none",
        }}
      >
        <Img
          src={staticFile(src)}
          style={{
            width: "100%",
            display: "block",
          }}
        />
      </div>

      {/* Label */}
      <div
        style={{
          marginTop: 16,
          fontSize: 20,
          fontWeight: 600,
          color: "#475569",
          textAlign: "center",
        }}
      >
        {label}
      </div>
    </div>
  );
};
