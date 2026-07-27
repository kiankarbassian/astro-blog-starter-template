import { Environment, Float, Sparkles } from "@react-three/drei";
import {
  EffectComposer,
  Bloom,
  DepthOfField,
  Vignette,
  Noise,
} from "@react-three/postprocessing";
import { MotionValue } from "framer-motion";
import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

import F1ModelCar from "./F1ModelCar";
import TrackWorld from "./TrackWorld";
import SpeedStreaks from "./SpeedStreaks";

type F1SceneProps = {
  progress: MotionValue<number>;
};

const clamp01 = (value: number) => {
  return Math.min(1, Math.max(0, value));
};

const smoother = (value: number) => {
  const x = clamp01(value);
  return x * x * x * (x * (x * 6 - 15) + 10);
};

export default function F1Scene({ progress }: F1SceneProps) {
  const carRef = useRef<THREE.Group | null>(null);
  const rigRef = useRef<THREE.Group | null>(null);
  const lightRigRef = useRef<THREE.Group | null>(null);

  const { camera, mouse } = useThree();

  const carTarget = useMemo(() => new THREE.Vector3(), []);
  const cameraTarget = useMemo(() => new THREE.Vector3(), []);
  const lookTarget = useMemo(() => new THREE.Vector3(), []);

  useFrame((state, delta) => {
    const raw = progress.get();

    const intro = smoother(raw / 0.62);
    const launch = smoother((raw - 0.62) / 0.38);

    const cameraShake =
      Math.sin(state.clock.elapsedTime * 34) * launch * 0.035;

    /*
      Coordinate logic:

      Camera sits on positive Z looking toward negative Z.

      Car starts far away at z = -28.
      Car approaches camera by moving toward positive Z.
      Then car launches past camera by continuing toward positive Z.

      This should look like the car is driving forward, not reversing.
    */
    if (carRef.current) {
      const approachZ = THREE.MathUtils.lerp(-28, -5.25, intro);
      const launchZ = launch * 18;

      carTarget.set(
        THREE.MathUtils.lerp(0, -0.35, intro),
        THREE.MathUtils.lerp(0.85, 0.95, intro),
        approachZ + launchZ
      );

      carRef.current.position.lerp(
        carTarget,
        1 - Math.pow(0.0001, delta)
      );

      carRef.current.rotation.x = THREE.MathUtils.lerp(
        0,
        -0.03,
        launch
      );

      carRef.current.rotation.z = THREE.MathUtils.lerp(
        0,
        -0.025,
        launch
      );

      const scale = THREE.MathUtils.lerp(0.75, 1.35, intro);
      carRef.current.scale.setScalar(scale);
    }

    /*
      Camera starts far back, then moves into a low cinematic hero angle.
      It does NOT chase the car too aggressively, otherwise the launch feels weak.
    */
    cameraTarget.set(
      THREE.MathUtils.lerp(0.15, 0.8, intro) + mouse.x * 0.28,
      THREE.MathUtils.lerp(2.6, 1.28, intro) + mouse.y * 0.12 + cameraShake,
      THREE.MathUtils.lerp(14, 6.2, intro)
    );

    camera.position.lerp(
      cameraTarget,
      1 - Math.pow(0.0001, delta)
    );

    /*
      Look slightly ahead of the car path.
      This creates an automotive reveal instead of a flat object inspection.
    */
    lookTarget.set(
      THREE.MathUtils.lerp(0, -0.25, intro),
      THREE.MathUtils.lerp(0.7, 0.95, intro),
      THREE.MathUtils.lerp(-18, -3.5, intro)
    );

    camera.lookAt(lookTarget);

    if ("fov" in camera) {
      camera.fov = THREE.MathUtils.lerp(44, 35, intro);
      camera.updateProjectionMatrix();
    }

    if (rigRef.current) {
      rigRef.current.rotation.y = mouse.x * 0.035;
      rigRef.current.rotation.x = -mouse.y * 0.018;
    }

    if (lightRigRef.current) {
      lightRigRef.current.position.z = THREE.MathUtils.lerp(
        -4,
        4,
        launch
      );

      lightRigRef.current.rotation.y =
        state.clock.elapsedTime * 0.04;
    }
  });

  return (
    <>
      <color attach="background" args={["#020308"]} />
      <fog attach="fog" args={["#020308", 10, 72]} />

      <Environment preset="city" />

      <group ref={rigRef}>
        <TrackWorld />

        <group ref={lightRigRef}>
          <rectAreaLight
            position={[0, 5.5, 1]}
            rotation={[-Math.PI / 2.35, 0, 0]}
            width={7}
            height={5}
            intensity={6}
            color="#eef7ff"
          />

          <pointLight
            position={[-3.5, 2.4, 1.5]}
            intensity={3.6}
            color="#7dd3fc"
          />

          <pointLight
            position={[3.5, 1.7, -2]}
            intensity={2.8}
            color="#c084fc"
          />

          <spotLight
            position={[0, 7, 4]}
            angle={0.36}
            penumbra={0.9}
            intensity={9}
            color="#ffffff"
            castShadow
            shadow-mapSize={[2048, 2048]}
          />
        </group>

        <Float
          speed={1.05}
          rotationIntensity={0.025}
          floatIntensity={0.035}
        >
          <F1ModelCar ref={carRef} scale={1.25} />
        </Float>

        <SpeedStreaks progress={progress} />

        <Sparkles
          count={95}
          scale={[12, 4, 44]}
          size={1.6}
          speed={0.32}
          opacity={0.38}
          color="#dbeafe"
          position={[0, 1.15, -14]}
        />
      </group>

      <EffectComposer multisampling={0}>
        <Bloom
          intensity={0.82}
          luminanceThreshold={0.18}
          luminanceSmoothing={0.72}
          mipmapBlur
        />

        <DepthOfField
          focusDistance={0.028}
          focalLength={0.045}
          bokehScale={2.6}
        />

        <Noise opacity={0.035} />

        <Vignette
          eskil={false}
          offset={0.22}
          darkness={0.72}
        />
      </EffectComposer>
    </>
  );
}