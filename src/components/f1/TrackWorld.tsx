import { MeshReflectorMaterial } from "@react-three/drei";
import * as THREE from "three";

export default function TrackWorld() {
  return (
    <group>
      {/* Reflective floor */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, -12]}
        receiveShadow
      >
        <planeGeometry args={[30, 120]} />

        <MeshReflectorMaterial
          blur={[400, 100]}
          resolution={1024}
          mixBlur={1}
          mixStrength={2}
          roughness={0.35}
          depthScale={1.2}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#05060a"
          metalness={0.8}
          mirror={0.5}
        />
      </mesh>

      {/* Central track strip */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.01, -12]}
      >
        <planeGeometry args={[3, 120]} />
        <meshStandardMaterial
          color="#090b12"
          roughness={0.7}
          metalness={0.25}
        />
      </mesh>

      {/* Side glowing rails */}
      <mesh position={[-2.2, 0.05, -12]}>
        <boxGeometry args={[0.03, 0.03, 120]} />
        <meshStandardMaterial
          color="#67e8f9"
          emissive="#0891b2"
          emissiveIntensity={1}
        />
      </mesh>

      <mesh position={[2.2, 0.05, -12]}>
        <boxGeometry args={[0.03, 0.03, 120]} />
        <meshStandardMaterial
          color="#67e8f9"
          emissive="#0891b2"
          emissiveIntensity={1}
        />
      </mesh>

      {/* Tunnel rings */}
      {Array.from({ length: 18 }).map((_, i) => {
        const z = -i * 3.5 - 4;

        return (
          <group key={i} position={[0, 2, z]}>
            <mesh>
              <torusGeometry
                args={[3.6, 0.025, 12, 96]}
              />
              <meshStandardMaterial
                color="#162033"
                emissive="#0f172a"
                emissiveIntensity={0.4}
                metalness={0.75}
                roughness={0.3}
              />
            </mesh>

            {i % 2 === 0 && (
              <>
                <mesh position={[-3.2, -1.2, 0]}>
                  <boxGeometry
                    args={[0.04, 0.04, 0.8]}
                  />
                  <meshStandardMaterial
                    color="#67e8f9"
                    emissive="#22d3ee"
                    emissiveIntensity={2}
                  />
                </mesh>

                <mesh position={[3.2, -1.2, 0]}>
                  <boxGeometry
                    args={[0.04, 0.04, 0.8]}
                  />
                  <meshStandardMaterial
                    color="#67e8f9"
                    emissive="#22d3ee"
                    emissiveIntensity={2}
                  />
                </mesh>
              </>
            )}
          </group>
        );
      })}

      {/* Distant horizon glow */}
      <mesh position={[0, 1.5, -60]}>
        <boxGeometry args={[10, 0.05, 0.05]} />
        <meshStandardMaterial
          color="#c084fc"
          emissive="#c084fc"
          emissiveIntensity={4}
        />
      </mesh>

      {/* Atmospheric glow */}
      <pointLight
        position={[0, 2, -40]}
        intensity={8}
        color="#67e8f9"
      />

      <pointLight
        position={[0, 2, -60]}
        intensity={6}
        color="#c084fc"
      />

      {/* Tiny fog sphere in the distance */}
      <mesh position={[0, 2, -55]}>
        <sphereGeometry args={[6, 32, 32]} />
        <meshBasicMaterial
          color="#67e8f9"
          transparent
          opacity={0.03}
        />
      </mesh>
    </group>
  );
}