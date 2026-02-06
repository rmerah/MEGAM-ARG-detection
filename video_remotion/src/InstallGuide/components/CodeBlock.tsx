import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";

type CodeLine = {
  text: string;
  color?: string;
  indent?: number;
};

export const CodeBlock: React.FC<{
  lines: CodeLine[];
  title?: string;
  startFrame?: number;
  framesPerLine?: number;
}> = ({ lines, title, startFrame = 0, framesPerLine = 8 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const containerOpacity = interpolate(frame, [startFrame, startFrame + fps * 0.3], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div style={{ opacity: containerOpacity }}>
      {title && (
        <div
          style={{
            fontSize: 16,
            fontFamily: "monospace",
            color: "#94A3B8",
            marginBottom: 8,
            paddingLeft: 16,
          }}
        >
          {title}
        </div>
      )}
      <div
        style={{
          backgroundColor: "#0F172A",
          borderRadius: 12,
          padding: 24,
          border: "1px solid #1E293B",
          boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
        }}
      >
        {lines.map((line, i) => {
          const lineStart = startFrame + i * framesPerLine;
          const lineOpacity = interpolate(frame, [lineStart, lineStart + framesPerLine], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });

          const parts = parseLine(line.text);

          return (
            <div
              key={`line-${i}-${line.text.slice(0, 10)}`}
              style={{
                opacity: lineOpacity,
                fontFamily: "'Courier New', monospace",
                fontSize: 22,
                lineHeight: 1.8,
                paddingLeft: (line.indent || 0) * 20,
                whiteSpace: "pre",
              }}
            >
              {parts.map((part, j) => (
                <span key={`part-${j}-${part.text.slice(0, 5)}`} style={{ color: part.color }}>
                  {part.text}
                </span>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};

function parseLine(text: string): { text: string; color: string }[] {
  const parts: { text: string; color: string }[] = [];

  if (text.startsWith("$ ")) {
    parts.push({ text: "$ ", color: "#22C55E" });
    parts.push({ text: text.slice(2), color: "#E2E8F0" });
  } else if (text.startsWith("#")) {
    parts.push({ text: text, color: "#64748B" });
  } else if (text.startsWith("//")) {
    parts.push({ text: text, color: "#64748B" });
  } else {
    parts.push({ text: text, color: "#E2E8F0" });
  }

  return parts;
}
