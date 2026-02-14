import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
} from "remotion";
import { SectionTitle } from "../../InstallGuide/components/SectionTitle";
import { CodeBlock } from "../../InstallGuide/components/CodeBlock";

export const LaunchServersScene: React.FC = () => {
  const frame = useCurrentFrame();

  const readyOpacity = interpolate(frame, [220, 250], [0, 1], {
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
        step={3}
        title="Launch the Servers"
        subtitle="Start backend API and frontend web server"
        color="#8B5CF6"
      />

      <div
        style={{
          marginTop: 40,
          display: "flex",
          gap: 30,
          flex: 1,
        }}
      >
        <div style={{ flex: 1 }}>
          <CodeBlock
            title="Terminal 1 - Backend"
            startFrame={15}
            framesPerLine={12}
            lines={[
              { text: "$ cd backend" },
              { text: "$ source venv/bin/activate" },
              { text: "$ python -m uvicorn main:app --reload --port 8000" },
              { text: "" },
              { text: "INFO:     Uvicorn running on http://0.0.0.0:8000" },
              { text: "INFO:     Started reloader process" },
              { text: "INFO:     Application startup complete." },
            ]}
          />
        </div>

        <div style={{ flex: 1 }}>
          <CodeBlock
            title="Terminal 2 - Frontend"
            startFrame={60}
            framesPerLine={12}
            lines={[
              { text: "$ cd frontend" },
              { text: "$ python3 -m http.server 8080" },
              { text: "" },
              { text: "Serving HTTP on 0.0.0.0 port 8080" },
              { text: "http://0.0.0.0:8080/ ..." },
            ]}
          />
        </div>
      </div>

      <div
        style={{
          opacity: readyOpacity,
          display: "flex",
          gap: 30,
          justifyContent: "center",
          marginTop: 16,
        }}
      >
        {[
          { label: "API", url: "localhost:8000/docs", color: "#3B82F6" },
          { label: "Web UI", url: "localhost:8080", color: "#10B981" },
        ].map((item) => (
          <div
            key={item.label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 20px",
              borderRadius: 8,
              backgroundColor: `${item.color}15`,
              border: `1px solid ${item.color}30`,
            }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                backgroundColor: item.color,
              }}
            />
            <span style={{ fontSize: 16, fontWeight: 600, color: item.color }}>
              {item.label}
            </span>
            <span style={{ fontSize: 14, color: "#64748B", fontFamily: "monospace" }}>
              {item.url}
            </span>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
