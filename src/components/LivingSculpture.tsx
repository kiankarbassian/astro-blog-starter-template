import { Canvas, useFrame } from "@react-three/fiber";
import {
  Environment,
  Float,
  MeshTransmissionMaterial,
  Sparkles,
  Stars,
} from "@react-three/drei";
import {
  EffectComposer,
  Bloom,
  ChromaticAberration,
  Vignette,
} from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import { useMemo, useRef } from "react";
import * as THREE from "three";

const vertexShader = `
  uniform float uTime;

  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  varying float vDistort;

  void main() {
    vec3 pos = position;

    float wave1 = sin(pos.y * 3.0 + uTime * 1.4) * 0.13;
    float wave2 = sin(pos.x * 4.0 - uTime * 1.1) * 0.09;
    float wave3 = sin((pos.x + pos.y + pos.z) * 2.4 + uTime * 0.8) * 0.11;
    float pulse = sin(uTime * 1.8) * 0.04;

    float distort = wave1 + wave2 + wave3 + pulse;

    pos += normal * distort;

    vDistort = distort;
    vNormal = normalize(normalMatrix * normal);

    vec4 worldPosition = modelMatrix * vec4(pos, 1.0);
    vWorldPosition = worldPosition.xyz;

    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

const fragmentShader = `
  uniform float uTime;

  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  varying float vDistort;

  void main() {
    vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
    float fresnel = pow(1.0 - dot(viewDirection, normalize(vNormal)), 2.4);

    vec3 deepPurple = vec3(0.25, 0.12, 0.85);
    vec3 electricBlue = vec3(0.1, 0.55, 1.0);
    vec3 softGold = vec3(1.0, 0.68, 0.18);
    vec3 whiteGlow = vec3(1.0);

    float shimmer = sin(vWorldPosition.y * 5.0 + uTime * 2.0) * 0.5 + 0.5;
    float innerLight = smoothstep(-0.18, 0.22, vDistort);

    vec3 color = mix(deepPurple, electricBlue, shimmer);
    color = mix(color, softGold, innerLight * 0.35);
    color += fresnel * whiteGlow * 1.15;

    float alpha = 0.62 + fresnel * 0.35;

    gl_FragColor = vec4(color, alpha);
  }
`;

function LivingCore() {
  const meshRef = useRef<THREE.Mesh>(null);

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: {
          value: 0,
        },
      },
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
  }, []);

  useFrame((state) => {
    material.uniforms.uTime.value = state.clock.elapsedTime;

    if (!meshRef.current) return;

    meshRef.current.rotation.y += 0.0035;
    meshRef.current.rotation.x += 0.0018;

    meshRef.current.position.x = THREE.MathUtils.lerp(
      meshRef.current.position.x,
      state.pointer.x * 0.25,
      0.04
    );

    meshRef.current.position.y = THREE.MathUtils.lerp(
      meshRef.current.position.y,
      state.pointer.y * 0.16,
      0.04
    );
  });

  return (
    <Float speed={1.2} rotationIntensity={0.25} floatIntensity={0.32}>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1.35, 8]} />
        <primitive object={material} attach="material" />
      </mesh>
    </Float>
  );
}

function OrbitalRibbon({
  scale,
  rotation,
  color,
  speed,
}: {
  scale: number;
  rotation: [number, number, number];
  color: string;
  speed: number;
}) {
  const ribbonRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (!ribbonRef.current) return;

    ribbonRef.current.rotation.x += speed * 0.35;
    ribbonRef.current.rotation.y += speed;
  });

  return (
    <mesh ref={ribbonRef} scale={scale} rotation={rotation}>
      <torusKnotGeometry args={[1.55, 0.025, 260, 18, 2, 3]} />
      <MeshTransmissionMaterial
        color={color}
        thickness={0.55}
        roughness={0.08}
        transmission={0.8}
        ior={1.45}
        chromaticAberration={0.08}
        anisotropy={0.35}
        distortion={0.35}
        distortionScale={0.35}
        temporalDistortion={0.22}
        transparent
        opacity={0.52}
      />
    </mesh>
  );
}

function FloatingShards() {
  const shards = useMemo(() => {
    return Array.from({ length: 18 }, (_, index) => {
      const angle = index * 0.75;
      const radius = 2.4 + (index % 4) * 0.28;

      return {
        id: index,
        position: [
          Math.cos(angle) * radius,
          Math.sin(index * 1.7) * 1.15,
          Math.sin(angle) * radius,
        ] as [number, number, number],
        rotation: [
          index * 0.36,
          index * 0.72,
          index * 0.19,
        ] as [number, number, number],
        scale: 0.16 + (index % 5) * 0.035,
        color:
          index % 3 === 0
            ? "#c4b5fd"
            : index % 3 === 1
              ? "#93c5fd"
              : "#fde68a",
      };
    });
  }, []);

  return (
    <>
      {shards.map((shard) => (
        <Float
          key={shard.id}
          speed={1.2 + shard.id * 0.035}
          rotationIntensity={0.9}
          floatIntensity={0.7}
        >
          <mesh
            position={shard.position}
            rotation={shard.rotation}
            scale={shard.scale}
          >
            <tetrahedronGeometry args={[1, 0]} />
            <meshPhysicalMaterial
              color={shard.color}
              roughness={0.08}
              metalness={0.05}
              transmission={0.55}
              thickness={0.4}
              transparent
              opacity={0.62}
              emissive={shard.color}
              emissiveIntensity={0.35}
            />
          </mesh>
        </Float>
      ))}
    </>
  );
}

function HaloRings() {
  const ringOne = useRef<THREE.Mesh>(null);
  const ringTwo = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (ringOne.current) {
      ringOne.current.rotation.z += 0.002;
      ringOne.current.rotation.x += 0.001;
    }

    if (ringTwo.current) {
      ringTwo.current.rotation.z -= 0.0016;
      ringTwo.current.rotation.y += 0.001;
    }
  });

  return (
    <>
      <mesh ref={ringOne} rotation={[1.1, 0.25, 0.4]}>
        <torusGeometry args={[2.2, 0.006, 12, 220]} />
        <meshBasicMaterial
          color="#a78bfa"
          transparent
          opacity={0.32}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <mesh ref={ringTwo} rotation={[0.35, 1.15, -0.2]}>
        <torusGeometry args={[2.75, 0.004, 12, 220]} />
        <meshBasicMaterial
          color="#60a5fa"
          transparent
          opacity={0.22}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </>
  );
}

function SceneRig() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;

    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      state.pointer.x * 0.28,
      0.035
    );

    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      -state.pointer.y * 0.16,
      0.035
    );

    groupRef.current.position.y =
      Math.sin(state.clock.elapsedTime * 0.45) * 0.08;
  });

  return (
    <group ref={groupRef}>
      <LivingCore />

      <OrbitalRibbon
        scale={1.08}
        rotation={[0.8, 0.2, 0.55]}
        color="#a78bfa"
        speed={0.004}
      />

      <OrbitalRibbon
        scale={0.92}
        rotation={[-0.45, 0.9, -0.35]}
        color="#60a5fa"
        speed={-0.0045}
      />

      <OrbitalRibbon
        scale={1.22}
        rotation={[0.2, -0.7, 1.05]}
        color="#fbbf24"
        speed={0.0025}
      />

      <HaloRings />
      <FloatingShards />
    </group>
  );
}

function LivingSculptureScene() {
  return (
    <>
      <color attach="background" args={["#050505"]} />

      <ambientLight intensity={0.55} />

      <pointLight
        position={[3.5, 4, 5]}
        intensity={18}
        color="#a78bfa"
      />

      <pointLight
        position={[-4.5, -2.5, 3]}
        intensity={10}
        color="#60a5fa"
      />

      <spotLight
        position={[0, 5, 4]}
        angle={0.45}
        penumbra={0.9}
        intensity={12}
        color="#fde68a"
      />

      <Environment preset="city" />

      <Stars
        radius={55}
        depth={35}
        count={1300}
        factor={4}
        saturation={0}
        fade
        speed={0.45}
      />

      <Sparkles
        count={180}
        scale={[7, 5, 5]}
        size={2.4}
        speed={0.42}
        opacity={0.6}
        color="#ddd6fe"
      />

      <SceneRig />

      <EffectComposer>
        <Bloom
          intensity={1.25}
          luminanceThreshold={0.18}
          luminanceSmoothing={0.72}
          mipmapBlur
        />

        <ChromaticAberration
          blendFunction={BlendFunction.NORMAL}
          offset={[0.0008, 0.0012]}
        />

        <Vignette
          eskil={false}
          offset={0.18}
          darkness={0.75}
        />
      </EffectComposer>
    </>
  );
}

export default function LivingSculpture() {
  return (
    <section className="sculpture-section">
      <div className="sculpture-copy">
        <p className="sculpture-label">LIVING SYSTEM</p>

        <h2 className="sculpture-title">
          A portfolio built around motion, depth, and curiosity.
        </h2>

        <p className="sculpture-description">
          This centerpiece is meant to feel like a small impossible machine:
          part glass, part light, part living system. It reflects the kind of
          work I am drawn to — intelligent tools, experimental interfaces, and
          systems that feel alive.
        </p>
      </div>

      <div className="sculpture-stage">
        <Canvas
          camera={{
            position: [0, 0, 6.2],
            fov: 42,
          }}
          dpr={[1, 2]}
          gl={{
            antialias: true,
            alpha: false,
            powerPreference: "high-performance",
          }}
        >
          <LivingSculptureScene />
        </Canvas>
      </div>
    </section>
  );
}