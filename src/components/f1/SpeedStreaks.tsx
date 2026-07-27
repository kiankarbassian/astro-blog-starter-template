import { MotionValue } from "framer-motion";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

type SpeedStreaksProps = {
  progress: MotionValue<number>;
};

type Streak = {
  x: number;
  y: number;
  z: number;
  length: number;
  speed: number;
  color: string;
};

export default function SpeedStreaks({
  progress,
}: SpeedStreaksProps) {
  const groupRef = useRef<THREE.Group>(null);

  const streaks = useMemo<Streak[]>(() => {
    return Array.from({ length: 60 }, (_, i) => ({
      x: (i % 2 === 0 ? -1 : 1) * (2 + Math.random() * 4),
      y: Math.random() * 2.5 + 0.2,
      z: -Math.random() * 45 - 2,
      length: Math.random() * 5 + 2,
      speed: Math.random() * 0.5 + 0.1,
      color: Math.random() > 0.5 ? "#67e8f9" : "#c084fc",
    }));
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;

    const raw = progress.get();

    const launch = THREE.MathUtils.clamp(
      (raw - 0.12) / 0.78,
      0,
      1
    );

    groupRef.current.children.forEach((child, index) => {
      const streak = streaks[index];

      child.position.z =
        streak.z +
        Math.sin(
          state.clock.elapsedTime *
            streak.speed *
            20 +
            index
        ) *
          1.5;

      child.position.x =
        streak.x +
        Math.sin(
          state.clock.elapsedTime * 0.7 + index
        ) *
          0.08;

      child.scale.z = THREE.MathUtils.lerp(
        0.2,
        1.8,
        launch
      );

      child.scale.x = THREE.MathUtils.lerp(
        0.4,
        1,
        launch
      );

      child.visible = launch > 0.05;
    });
  });

  return (
    <group ref={groupRef}>
      {streaks.map((streak, index) => (
        <mesh
          key={index}
          position={[
            streak.x,
            streak.y,
            streak.z,
          ]}
          rotation={[
            0,
            0,
            streak.x < 0 ? -0.05 : 0.05,
          ]}
        >
          <boxGeometry
            args={[
              0.02,
              0.02,
              streak.length,
            ]}
          />

          <meshStandardMaterial
            color={streak.color}
            emissive={streak.color}
            emissiveIntensity={2}
            transparent
            opacity={0.45}
            roughness={0.2}
            metalness={0.3}
          />
        </mesh>
      ))}
    </group>
  );
}