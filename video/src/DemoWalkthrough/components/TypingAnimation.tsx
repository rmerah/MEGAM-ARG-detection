import React from "react";
import { useCurrentFrame, interpolate } from "remotion";

export const TypingAnimation: React.FC<{
  text: string;
  startFrame?: number;
  framesPerChar?: number;
  fontSize?: number;
  color?: string;
}> = ({ text, startFrame = 0, framesPerChar = 4, fontSize = 36, color = "#E2E8F0" }) => {
  const frame = useCurrentFrame();

  const charsVisible = Math.floor(
    interpolate(frame, [startFrame, startFrame + text.length * framesPerChar], [0, text.length], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );

  const cursorOpacity = Math.sin(frame * 0.3) > 0 ? 1 : 0;
  const isTyping = frame >= startFrame && charsVisible < text.length;

  return (
    <span
      style={{
        fontFamily: "'Courier New', monospace",
        fontSize,
        color,
        letterSpacing: 1,
      }}
    >
      {text.slice(0, charsVisible)}
      <span
        style={{
          opacity: isTyping || cursorOpacity ? 1 : 0,
          color: "#3B82F6",
          fontWeight: 400,
        }}
      >
        |
      </span>
    </span>
  );
};
