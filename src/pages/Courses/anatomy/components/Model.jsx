import { useGLTF } from "@react-three/drei";
import { useEffect } from "react";

export default function Model({ model, onLoaded }) {
  const { scene } = useGLTF(model.file);

  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.material.depthWrite = true;
        child.material.depthTest = true;
      }
    });

    onLoaded?.(scene);
  }, [scene]);

  return (
    <primitive
      object={scene}
      scale={model.scale}
      position={model.position}
      rotation={model.rotation}
    />
  );
}