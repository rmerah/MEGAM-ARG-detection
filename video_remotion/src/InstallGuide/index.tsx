import React from "react";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { slide } from "@remotion/transitions/slide";
import { fade } from "@remotion/transitions/fade";

import { IntroScene } from "./scenes/IntroScene";
import { OverviewScene } from "./scenes/OverviewScene";
import { PrerequisitesScene } from "./scenes/PrerequisitesScene";
import { InstallBackendScene } from "./scenes/InstallBackendScene";
import { DatabasesScene } from "./scenes/DatabasesScene";
import { StartServersScene } from "./scenes/StartServersScene";
import { UIFormScene } from "./scenes/UIFormScene";
import { UIDashboardScene } from "./scenes/UIDashboardScene";
import { UIJobsScene } from "./scenes/UIJobsScene";
import { OutroScene } from "./scenes/OutroScene";

const TRANSITION_DURATION = 15;

export const InstallGuide: React.FC = () => {
  return (
    <TransitionSeries>
      {/* 1. Intro */}
      <TransitionSeries.Sequence durationInFrames={120}>
        <IntroScene />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
      />

      {/* 2. Overview */}
      <TransitionSeries.Sequence durationInFrames={150}>
        <OverviewScene />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={slide({ direction: "from-right" })}
        timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
      />

      {/* 3. Prerequisites */}
      <TransitionSeries.Sequence durationInFrames={120}>
        <PrerequisitesScene />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={slide({ direction: "from-right" })}
        timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
      />

      {/* 4. Install Backend */}
      <TransitionSeries.Sequence durationInFrames={150}>
        <InstallBackendScene />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={slide({ direction: "from-right" })}
        timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
      />

      {/* 5. Databases */}
      <TransitionSeries.Sequence durationInFrames={150}>
        <DatabasesScene />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={slide({ direction: "from-right" })}
        timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
      />

      {/* 6. Start Servers */}
      <TransitionSeries.Sequence durationInFrames={150}>
        <StartServersScene />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
      />

      {/* 7. UI - Form */}
      <TransitionSeries.Sequence durationInFrames={120}>
        <UIFormScene />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={slide({ direction: "from-right" })}
        timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
      />

      {/* 8. UI - Dashboard */}
      <TransitionSeries.Sequence durationInFrames={150}>
        <UIDashboardScene />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={slide({ direction: "from-right" })}
        timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
      />

      {/* 9. UI - Jobs & Databases */}
      <TransitionSeries.Sequence durationInFrames={150}>
        <UIJobsScene />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
      />

      {/* 10. Outro */}
      <TransitionSeries.Sequence durationInFrames={120}>
        <OutroScene />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  );
};

// Total: 10 scenes + 9 transitions
// Scenes: 120+150+120+150+150+150+120+150+150+120 = 1380 frames
// Transitions overlap: 9 * 15 = 135 frames
// Net duration: 1380 - 135 = 1245 frames (~41.5s at 30fps)
export const INSTALL_GUIDE_DURATION = 1245;
