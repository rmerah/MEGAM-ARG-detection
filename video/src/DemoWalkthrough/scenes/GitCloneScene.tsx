import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
} from "remotion";
import { SectionTitle } from "../../InstallGuide/components/SectionTitle";
import { CodeBlock } from "../../InstallGuide/components/CodeBlock";

export const GitCloneScene: React.FC = () => {
  const frame = useCurrentFrame();

  const noteOpacity = interpolate(frame, [200, 220], [0, 1], {
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
        step={1}
        title="Clone the Repository"
        subtitle="Get the source code from GitHub"
        color="#3B82F6"
      />

      <div style={{ marginTop: 40, flex: 1 }}>
        <CodeBlock
          title="Terminal"
          startFrame={15}
          framesPerLine={12}
          lines={[
            { text: "# Clone the repository" },
            { text: "$ git clone https://github.com/rmerah/MEGAM-ARG-detection.git" },
            { text: "Cloning into 'MEGAM-ARG-detection'..." },
            { text: "remote: Enumerating objects: 342, done." },
            { text: "remote: Total 342 (delta 0), reused 0 (delta 0)" },
            { text: "" },
            { text: "# Navigate to the project" },
            { text: "$ cd MEGAM-ARG-detection" },
            { text: "" },
            { text: "# List project contents" },
            { text: "$ ls -la" },
            { text: "backend/  frontend/  pipeline/  python/  setup.sh  README.md" },
          ]}
        />
      </div>

      <div
        style={{
          opacity: noteOpacity,
          fontSize: 18,
          color: "#64748B",
          marginTop: 20,
        }}
      >
        The project includes backend, frontend, pipeline scripts and setup automation
      </div>
    </AbsoluteFill>
  );
};
