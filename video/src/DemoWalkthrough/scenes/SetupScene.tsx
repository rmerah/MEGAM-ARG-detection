import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
} from "remotion";
import { SectionTitle } from "../../InstallGuide/components/SectionTitle";
import { CodeBlock } from "../../InstallGuide/components/CodeBlock";

export const SetupScene: React.FC = () => {
  const frame = useCurrentFrame();

  const successOpacity = interpolate(frame, [280, 310], [0, 1], {
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
        step={2}
        title="Run the Setup Script"
        subtitle="Automated installation of all dependencies"
        color="#10B981"
      />

      <div style={{ marginTop: 40, flex: 1 }}>
        <CodeBlock
          title="Terminal"
          startFrame={15}
          framesPerLine={12}
          lines={[
            { text: "# Make setup script executable" },
            { text: "$ chmod +x setup.sh" },
            { text: "" },
            { text: "# Run the automated installer" },
            { text: "$ ./setup.sh" },
            { text: "" },
            { text: "[INFO] Checking system dependencies..." },
            { text: "[OK]   Python 3.10+ found" },
            { text: "[OK]   Conda environment configured" },
            { text: "[INFO] Installing backend dependencies..." },
            { text: "[OK]   FastAPI, uvicorn, aiosqlite installed" },
            { text: "[INFO] Downloading ARG databases..." },
            { text: "[OK]   AMRFinderPlus database updated" },
            { text: "[OK]   CARD/RGI database indexed" },
            { text: "[OK]   ResFinder KMA database ready" },
            { text: "[INFO] Setup complete!" },
          ]}
        />
      </div>

      <div
        style={{
          opacity: successOpacity,
          display: "flex",
          alignItems: "center",
          gap: 10,
          fontSize: 20,
          color: "#16A34A",
          fontWeight: 600,
          marginTop: 16,
        }}
      >
        <span style={{ fontSize: 24 }}>&#10003;</span>
        All components installed and ready
      </div>
    </AbsoluteFill>
  );
};
