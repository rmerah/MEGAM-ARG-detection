import React from "react";
import { Audio, staticFile } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { slide } from "@remotion/transitions/slide";
import { fade } from "@remotion/transitions/fade";

import { DemoIntroScene } from "./scenes/DemoIntroScene";
import { WhatIsMegamScene } from "./scenes/WhatIsMegamScene";
import { GitCloneScene } from "./scenes/GitCloneScene";
import { SetupScene } from "./scenes/SetupScene";
import { LaunchServersScene } from "./scenes/LaunchServersScene";
import { OpenBrowserScene } from "./scenes/OpenBrowserScene";
import { EnterSampleScene } from "./scenes/EnterSampleScene";
import { PipelineRunningScene } from "./scenes/PipelineRunningScene";
import { ResultsOverviewScene } from "./scenes/ResultsOverviewScene";
import { CriticalGenesScene } from "./scenes/CriticalGenesScene";
import { DemoOutroScene } from "./scenes/DemoOutroScene";

const TRANSITION_DURATION = 15;

const MUSIC_VOLUME = 0.6;

const BackgroundMusic: React.FC = () => {
  return (
    <Audio
      src={staticFile("audio/paulyudin-technology-innovation-113978.mp3")}
      volume={(f) => {
        if (f < 60) return MUSIC_VOLUME * (f / 60);
        if (f > DEMO_WALKTHROUGH_DURATION - 60)
          return MUSIC_VOLUME * ((DEMO_WALKTHROUGH_DURATION - f) / 60);
        return MUSIC_VOLUME;
      }}
    />
  );
};

export const DemoWalkthrough: React.FC = () => {
  return (
    <>
      <BackgroundMusic />

      <TransitionSeries>
        {/* 1. Intro */}
        <TransitionSeries.Sequence durationInFrames={150}>
          <DemoIntroScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
        />

        {/* 2. What is MEGAM */}
        <TransitionSeries.Sequence durationInFrames={180}>
          <WhatIsMegamScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={slide({ direction: "from-right" })}
          timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
        />

        {/* 3. Git Clone */}
        <TransitionSeries.Sequence durationInFrames={180}>
          <GitCloneScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={slide({ direction: "from-right" })}
          timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
        />

        {/* 4. Setup */}
        <TransitionSeries.Sequence durationInFrames={210}>
          <SetupScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
        />

        {/* 5. Launch Servers */}
        <TransitionSeries.Sequence durationInFrames={165}>
          <LaunchServersScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={slide({ direction: "from-right" })}
          timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
        />

        {/* 6. Open Browser */}
        <TransitionSeries.Sequence durationInFrames={135}>
          <OpenBrowserScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
        />

        {/* 7. Enter Sample */}
        <TransitionSeries.Sequence durationInFrames={210}>
          <EnterSampleScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={slide({ direction: "from-right" })}
          timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
        />

        {/* 8. Pipeline Running */}
        <TransitionSeries.Sequence durationInFrames={195}>
          <PipelineRunningScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
        />

        {/* 9. Results Overview */}
        <TransitionSeries.Sequence durationInFrames={165}>
          <ResultsOverviewScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={slide({ direction: "from-right" })}
          timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
        />

        {/* 10. Critical Genes */}
        <TransitionSeries.Sequence durationInFrames={210}>
          <CriticalGenesScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
        />

        {/* 11. Outro */}
        <TransitionSeries.Sequence durationInFrames={150}>
          <DemoOutroScene />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </>
  );
};

// Total: 11 scenes + 10 transitions
// Scenes: 150+180+180+210+165+135+210+195+165+210+150 = 1950 frames
// Transitions overlap: 10 * 15 = 150 frames
// Net duration: 1950 - 150 = 1800 frames = 60s at 30fps
export const DEMO_WALKTHROUGH_DURATION = 1800;
