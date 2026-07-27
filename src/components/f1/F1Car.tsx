import { RoundedBox } from "@react-three/drei";
import { forwardRef, useMemo } from "react";
import * as THREE from "three";

const F1Car = forwardRef<THREE.Group>((_, ref) => {
  const bodyMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#07080d",
        metalness: 0.88,
        roughness: 0.2,
        clearcoat: 1,
        clearcoatRoughness: 0.16,
        reflectivity: 0.85,
      }),
    []
  );

  const graphiteMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#161923",
        metalness: 0.72,
        roughness: 0.28,
        clearcoat: 0.85,
        clearcoatRoughness: 0.24,
      }),
    []
  );

  const glassMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#9bdcff",
        metalness: 0.1,
        roughness: 0.06,
        transmission: 0.45,
        transparent: true,
        opacity: 0.58,
        clearcoat: 1,
        clearcoatRoughness: 0.04,
      }),
    []
  );

  const tireMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#050507",
        roughness: 0.78,
        metalness: 0.05,
      }),
    []
  );

  const accentMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#38bdf8",
        emissive: "#0ea5e9",
        emissiveIntensity: 1.85,
        roughness: 0.22,
        metalness: 0.55,
      }),
    []
  );

  const purpleAccentMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#c084fc",
        emissive: "#7c3aed",
        emissiveIntensity: 1.25,
        roughness: 0.28,
        metalness: 0.4,
      }),
    []
  );

  return (
    <group ref={ref} position={[0, -0.12, 0]} rotation={[0, 0.14, 0]} scale={1}>
      <group castShadow receiveShadow>
        {/* main carbon body */}
        <RoundedBox
          args={[1.15, 0.34, 2.35]}
          radius={0.16}
          smoothness={10}
          position={[0, 0.38, 0]}
          material={bodyMaterial}
          castShadow
        />

        {/* tapered nose */}
        <mesh position={[0, 0.32, 1.54]} castShadow material={bodyMaterial}>
          <boxGeometry args={[0.34, 0.18, 1.45]} />
        </mesh>

        <mesh position={[0, 0.31, 2.28]} castShadow material={graphiteMaterial}>
          <boxGeometry args={[0.2, 0.11, 0.82]} />
        </mesh>

        {/* cockpit glass */}
        <RoundedBox
          args={[0.58, 0.32, 0.62]}
          radius={0.18}
          smoothness={14}
          position={[0, 0.66, -0.18]}
          rotation={[0.05, 0, 0]}
          material={glassMaterial}
          castShadow
        />

        {/* engine cover spine */}
        <RoundedBox
          args={[0.42, 0.48, 1.24]}
          radius={0.14}
          smoothness={12}
          position={[0, 0.67, -0.86]}
          rotation={[-0.08, 0, 0]}
          material={graphiteMaterial}
          castShadow
        />

        {/* vertical shark fin */}
        <mesh position={[0, 1.05, -1.03]} material={graphiteMaterial} castShadow>
          <boxGeometry args={[0.07, 0.7, 0.9]} />
        </mesh>

        {/* front wing */}
        <group position={[0, 0.18, 2.64]}>
          <RoundedBox
            args={[2.56, 0.1, 0.34]}
            radius={0.06}
            smoothness={8}
            material={graphiteMaterial}
            castShadow
          />
          <mesh position={[-1.38, 0.12, 0.02]} rotation={[0, 0, -0.16]} material={accentMaterial}>
            <boxGeometry args={[0.12, 0.4, 0.45]} />
          </mesh>
          <mesh position={[1.38, 0.12, 0.02]} rotation={[0, 0, 0.16]} material={accentMaterial}>
            <boxGeometry args={[0.12, 0.4, 0.45]} />
          </mesh>
          <mesh position={[0, 0.12, -0.16]} material={accentMaterial}>
            <boxGeometry args={[2.22, 0.035, 0.03]} />
          </mesh>
        </group>

        {/* rear wing */}
        <group position={[0, 0.82, -1.83]}>
          <RoundedBox
            args={[2.18, 0.12, 0.28]}
            radius={0.06}
            smoothness={8}
            material={graphiteMaterial}
            castShadow
          />
          <RoundedBox
            args={[2.02, 0.065, 0.2]}
            radius={0.04}
            smoothness={6}
            position={[0, 0.24, -0.08]}
            material={bodyMaterial}
            castShadow
          />
          <mesh position={[-0.95, -0.22, 0]} material={graphiteMaterial}>
            <boxGeometry args={[0.08, 0.55, 0.18]} />
          </mesh>
          <mesh position={[0.95, -0.22, 0]} material={graphiteMaterial}>
            <boxGeometry args={[0.08, 0.55, 0.18]} />
          </mesh>
          <mesh position={[0, 0.36, -0.17]} material={purpleAccentMaterial}>
            <boxGeometry args={[1.3, 0.035, 0.035]} />
          </mesh>
        </group>

        {/* halo */}
        <group position={[0, 0.86, 0.1]}>
          <mesh rotation={[Math.PI / 2, 0, 0]} material={graphiteMaterial} castShadow>
            <torusGeometry args={[0.48, 0.035, 12, 48, Math.PI]} />
          </mesh>
          <mesh position={[0, -0.12, 0.18]} material={graphiteMaterial} castShadow>
            <boxGeometry args={[0.065, 0.5, 0.065]} />
          </mesh>
        </group>

        {/* side pods */}
        <RoundedBox
          args={[0.46, 0.25, 1.14]}
          radius={0.13}
          smoothness={10}
          position={[-0.76, 0.34, -0.4]}
          rotation={[0, 0.05, 0]}
          material={graphiteMaterial}
          castShadow
        />
        <RoundedBox
          args={[0.46, 0.25, 1.14]}
          radius={0.13}
          smoothness={10}
          position={[0.76, 0.34, -0.4]}
          rotation={[0, -0.05, 0]}
          material={graphiteMaterial}
          castShadow
        />

        {/* luminous side accents */}
        <mesh position={[-0.82, 0.47, -0.1]} material={accentMaterial}>
          <boxGeometry args={[0.035, 0.035, 1.18]} />
        </mesh>
        <mesh position={[0.82, 0.47, -0.1]} material={accentMaterial}>
          <boxGeometry args={[0.035, 0.035, 1.18]} />
        </mesh>

        {/* suspension arms */}
        <SuspensionArm x={-0.72} z={1.25} material={graphiteMaterial} />
        <SuspensionArm x={0.72} z={1.25} material={graphiteMaterial} />
        <SuspensionArm x={-0.75} z={-1.23} material={graphiteMaterial} />
        <SuspensionArm x={0.75} z={-1.23} material={graphiteMaterial} />

        {/* wheels */}
        <Wheel x={-1.1} z={1.22} tireMaterial={tireMaterial} accentMaterial={accentMaterial} />
        <Wheel x={1.1} z={1.22} tireMaterial={tireMaterial} accentMaterial={accentMaterial} />
        <Wheel x={-1.13} z={-1.22} tireMaterial={tireMaterial} accentMaterial={purpleAccentMaterial} />
        <Wheel x={1.13} z={-1.22} tireMaterial={tireMaterial} accentMaterial={purpleAccentMaterial} />

        {/* underglow */}
        <mesh position={[0, 0.11, -0.18]} material={accentMaterial}>
          <boxGeometry args={[1.05, 0.025, 2.2]} />
        </mesh>
      </group>
    </group>
  );
});

F1Car.displayName = "F1Car";

function SuspensionArm({
  x,
  z,
  material,
}: {
  x: number;
  z: number;
  material: THREE.Material;
}) {
  const angle = x < 0 ? -0.32 : 0.32;

  return (
    <group position={[x * 0.54, 0.34, z]}>
      <mesh rotation={[0, 0, angle]} material={material} castShadow>
        <boxGeometry args={[0.82, 0.035, 0.035]} />
      </mesh>
      <mesh position={[0, -0.13, 0.05]} rotation={[0, 0, -angle]} material={material} castShadow>
        <boxGeometry args={[0.76, 0.03, 0.03]} />
      </mesh>
    </group>
  );
}

function Wheel({
  x,
  z,
  tireMaterial,
  accentMaterial,
}: {
  x: number;
  z: number;
  tireMaterial: THREE.Material;
  accentMaterial: THREE.Material;
}) {
  return (
    <group position={[x, 0.28, z]} rotation={[0, 0, Math.PI / 2]}>
      <mesh material={tireMaterial} castShadow receiveShadow>
        <cylinderGeometry args={[0.34, 0.34, 0.34, 48]} />
      </mesh>

      <mesh material={accentMaterial}>
        <torusGeometry args={[0.22, 0.018, 10, 44]} />
      </mesh>

      <mesh material={accentMaterial} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.115, 0.012, 8, 32]} />
      </mesh>

      <mesh material={new THREE.MeshStandardMaterial({ color: "#d8e7ff", metalness: 0.8, roughness: 0.18 })}>
        <cylinderGeometry args={[0.07, 0.07, 0.37, 32]} />
      </mesh>
    </group>
  );
}

export default F1Car;