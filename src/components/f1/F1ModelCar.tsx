import { Center, useGLTF } from "@react-three/drei";
import { forwardRef, useEffect, useMemo } from "react";
import * as THREE from "three";

type F1ModelCarProps = {
  scale?: number;
  rotation?: [number, number, number];
  position?: [number, number, number];
};

const F1ModelCar = forwardRef<THREE.Group, F1ModelCarProps>(
  (
    {
      scale = 1,
      rotation = [0, Math.PI, 0],
      position = [0, -0.12, 0],
    },
    ref
  ) => {
    const { scene } = useGLTF("/models/f1-car.glb");

    const clonedScene = useMemo(() => {
      const clone = scene.clone(true);

      clone.traverse((object) => {
        if (!(object instanceof THREE.Mesh)) return;

        object.castShadow = true;
        object.receiveShadow = true;

        const material = object.material;

        if (Array.isArray(material)) {
          material.forEach((mat) => enhanceMaterial(mat));
        } else {
          enhanceMaterial(material);
        }
      });

      return clone;
    }, [scene]);

    useEffect(() => {
      clonedScene.traverse((object) => {
        if (!(object instanceof THREE.Mesh)) return;

        object.castShadow = true;
        object.receiveShadow = true;
      });
    }, [clonedScene]);

    return (
  <group ref={ref}>
    <group rotation={[0, Math.PI / 2, 0]} scale={scale}>
      <primitive object={clonedScene} />
    </group>
  </group>
);
  }
);

function enhanceMaterial(material: THREE.Material) {
  if (!material) return;

  material.needsUpdate = true;

  if (
    material instanceof THREE.MeshStandardMaterial ||
    material instanceof THREE.MeshPhysicalMaterial
  ) {
    material.envMapIntensity = 1.6;
    material.roughness = Math.max(material.roughness ?? 0.35, 0.22);
    material.metalness = Math.max(material.metalness ?? 0.25, 0.35);

    if (material.name.toLowerCase().includes("glass")) {
      material.transparent = true;
      material.opacity = 0.55;
      material.roughness = 0.05;
      material.metalness = 0.1;
    }

    if (
      material.name.toLowerCase().includes("carbon") ||
      material.name.toLowerCase().includes("body") ||
      material.name.toLowerCase().includes("paint")
    ) {
      material.roughness = 0.18;
      material.metalness = 0.65;
    }

    if (
      material.name.toLowerCase().includes("tire") ||
      material.name.toLowerCase().includes("rubber")
    ) {
      material.roughness = 0.82;
      material.metalness = 0.04;
    }
  }
}

F1ModelCar.displayName = "F1ModelCar";

useGLTF.preload("/models/f1-car.glb");

export default F1ModelCar;