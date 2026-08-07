import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
    
import { Draggable } from "gsap/Draggable";
import { EaselPlugin } from "gsap/EaselPlugin";
import { Flip } from "gsap/Flip";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { Observer } from "gsap/Observer";
import { PixiPlugin } from "gsap/PixiPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { TextPlugin } from "gsap/TextPlugin";
import { ScrambleTextPlugin } from "./plugins/ScrambleTextPlugin.js";
import { DrawSVGPlugin } from "./plugins/DrawSVGPlugin.js";
import { GSDevTools } from "./plugins/GSDevTools.js";
import { MotionPathHelper } from "./plugins/MotionPathHelper.js";
import { MorphSVGPlugin } from "./plugins/MorphSVGPlugin.js";
import { Physics2DPlugin } from "./plugins/Physics2DPlugin.js";
import { PhysicsPropsPlugin } from "./plugins/PhysicsPropsPlugin.js";
import { ScrollSmoother } from "./plugins/ScrollSmoother.js";
import { SplitText } from "./plugins/SplitText.js";

gsap.registerPlugin(
  useGSAP,
  Draggable,
  EaselPlugin,
  Flip,
  MotionPathPlugin,
  Observer,
  PixiPlugin,
  ScrollTrigger,
  ScrollToPlugin,
  TextPlugin,
  ScrambleTextPlugin,
  DrawSVGPlugin,
  GSDevTools,
  MotionPathHelper,
  MorphSVGPlugin,
  Physics2DPlugin,
  PhysicsPropsPlugin,
  ScrollSmoother,
  SplitText
);

export { gsap, ScrollSmoother, SplitText };
