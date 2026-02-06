import React from "react";
import { AbsoluteFill } from "remotion";
import { SectionTitle } from "../components/SectionTitle";
import { CodeBlock } from "../components/CodeBlock";

export const InstallBackendScene: React.FC = () => {
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
        title="Install the Backend"
        subtitle="Python virtual environment & dependencies"
        color="#3B82F6"
      />

      <div style={{ marginTop: 40, maxWidth: 1000 }}>
        <CodeBlock
          title="Terminal"
          startFrame={15}
          framesPerLine={10}
          lines={[
            { text: "# Navigate to the backend directory" },
            { text: "$ cd backend" },
            { text: "" },
            { text: "# Create a Python virtual environment" },
            { text: "$ python3 -m venv venv" },
            { text: "" },
            { text: "# Activate it" },
            { text: "$ source venv/bin/activate" },
            { text: "" },
            { text: "# Install dependencies" },
            { text: "$ pip install -r requirements.txt" },
          ]}
        />
      </div>
    </AbsoluteFill>
  );
};
