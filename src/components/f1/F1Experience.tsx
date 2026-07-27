import { Canvas } from "@react-three/fiber";
import { Suspense, useRef } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import F1Scene from "./F1Scene";

export default function F1Experience() {
  const sectionRef = useRef<HTMLElement | null>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 26,
    mass: 0.45,
  });

  const titleOpacity = useTransform(smoothProgress, [0, 0.18, 0.38], [1, 1, 0]);
  const titleY = useTransform(smoothProgress, [0, 0.35], [0, -90]);
  const titleScale = useTransform(smoothProgress, [0, 0.35], [1, 0.94]);

  const specsOpacity = useTransform(
    smoothProgress,
    [0.18, 0.34, 0.72, 0.9],
    [0, 1, 1, 0]
  );

  const endingOpacity = useTransform(smoothProgress, [0.68, 0.88], [0, 1]);
  const endingY = useTransform(smoothProgress, [0.68, 0.88], [60, 0]);

  return (
    <section ref={sectionRef} className="f1-scroll-stage">
      <div className="f1-sticky-scene">
        <div className="f1-canvas-wrap">
          <Canvas
            shadows
            dpr={[1, 1.75]}
            camera={{
              position: [0, 1.7, 7.8],
              fov: 42,
              near: 0.1,
              far: 140,
            }}
            gl={{
              antialias: true,
              alpha: true,
              powerPreference: "high-performance",
            }}
          >
            <Suspense fallback={null}>
              <F1Scene progress={smoothProgress} />
            </Suspense>
          </Canvas>
        </div>

        <div className="f1-vignette" />
        <div className="f1-gradient-top" />
        <div className="f1-gradient-bottom" />

        <motion.div
          className="f1-hero-copy"
          style={{
            opacity: titleOpacity,
            y: titleY,
            scale: titleScale,
          }}
        >
          <p className="f1-kicker">Interactive Engineering Portfolio</p>
          <h1>
            Kian Karbassian
            <span>AI systems with a sense of motion.</span>
          </h1>
          <p className="f1-subcopy">
            Multimodal AI, agent frameworks, developer tools, and production-grade
            software — presented like a cinematic product reveal.
          </p>
        </motion.div>

        <motion.div className="f1-spec-panel left" style={{ opacity: specsOpacity }}>
          <span>01</span>
          <p>Scroll-linked cinematic camera rig</p>
        </motion.div>

        <motion.div className="f1-spec-panel right" style={{ opacity: specsOpacity }}>
          <span>02</span>
          <p>Procedural F1-inspired hero object with premium materials</p>
        </motion.div>

        <motion.div
          className="f1-ending-copy"
          style={{
            opacity: endingOpacity,
            y: endingY,
          }}
        >
          <p className="f1-kicker">From prototype to production</p>
          <h2>Engineering that moves.</h2>
          <p>
            A portfolio built around systems thinking, visual craft, and the kind
            of polish that makes technical work feel memorable.
          </p>
        </motion.div>

        <div className="f1-scroll-hint">
          <span />
          Scroll to launch
        </div>
      </div>
    </section>
  );
}