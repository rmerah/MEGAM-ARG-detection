import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
} from "remotion";
import { SectionTitle } from "../components/SectionTitle";
import { CodeBlock } from "../components/CodeBlock";

export const StartServersScene: React.FC = () => {
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
        step={4}
        title="Start the Application"
        subtitle="Launch backend & frontend servers"
        color="#10B981"
      />

      <div style={{ marginTop: 40, display: "flex", gap: 30 }}>
        {/* Backend */}
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: "#3B82F6",
              marginBottom: 12,
              opacity: interpolate(frame, [10, 20], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            Backend API (Port 8000)
          </div>
          <CodeBlock
            startFrame={15}
            framesPerLine={10}
            lines={[
              { text: "$ cd backend" },
              { text: "$ source venv/bin/activate" },
              { text: "$ python -m uvicorn main:app \\" },
              { text: "    --reload --host 0.0.0.0 \\" , indent: 1 },
              { text: "    --port 8000", indent: 1 },
            ]}
          />
        </div>

        {/* Frontend */}
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: "#10B981",
              marginBottom: 12,
              opacity: interpolate(frame, [40, 50], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            Frontend (Port 8080)
          </div>
          <CodeBlock
            startFrame={50}
            framesPerLine={10}
            lines={[
              { text: "$ cd maquettes" },
              { text: "$ python3 -m http.server 8080" },
            ]}
          />
        </div>
      </div>

      {/* URL */}
      <div
        style={{
          marginTop: 40,
          opacity: interpolate(frame, [90, 110], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "16px 28px",
          backgroundColor: "#F0FDF4",
          borderRadius: 12,
          border: "1px solid #BBF7D0",
          maxWidth: 700,
        }}
      >
        <span style={{ fontSize: 22, fontWeight: 800, color: "#15803D" }}>&#x2192;</span>
        <span style={{ fontSize: 20, color: "#166534", fontWeight: 600 }}>
          Open:{" "}
          <span style={{ fontFamily: "monospace", color: "#15803D" }}>
            http://localhost:8080
          </span>
        </span>
      </div>
    </AbsoluteFill>
  );
};
