import "./index.css";
import { Composition } from "remotion";
import { HelloWorld, myCompSchema } from "./HelloWorld";
import { Logo, myCompSchema2 } from "./HelloWorld/Logo";
import { InstallGuide, INSTALL_GUIDE_DURATION } from "./InstallGuide";
import { DemoWalkthrough, DEMO_WALKTHROUGH_DURATION } from "./DemoWalkthrough";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* MEGAM ARG Installation Guide Video */}
      <Composition
        id="InstallGuide"
        component={InstallGuide}
        durationInFrames={INSTALL_GUIDE_DURATION}
        fps={30}
        width={1920}
        height={1080}
      />

      {/* MEGAM ARG Complete Demo Walkthrough Video */}
      <Composition
        id="DemoWalkthrough"
        component={DemoWalkthrough}
        durationInFrames={DEMO_WALKTHROUGH_DURATION}
        fps={30}
        width={1920}
        height={1080}
      />

      <Composition
        id="HelloWorld"
        component={HelloWorld}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        schema={myCompSchema}
        defaultProps={{
          titleText: "Welcome to Remotion",
          titleColor: "#000000",
          logoColor1: "#91EAE4",
          logoColor2: "#86A8E7",
        }}
      />

      <Composition
        id="OnlyLogo"
        component={Logo}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        schema={myCompSchema2}
        defaultProps={{
          logoColor1: "#91dAE2" as const,
          logoColor2: "#86A8E7" as const,
        }}
      />
    </>
  );
};
