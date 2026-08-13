import { Canvas } from "@react-three/fiber";

import {
  OrbitControls,
  GizmoHelper,
  GizmoViewport,
  ContactShadows,
} from "@react-three/drei";

export default function CourseScene({
  camera = [0, 2, 2.5],
  fov = 60,
  controls = {},
  gizmo = false,
  ground = false,
  children,
}) {
  return (
    <div className="courses-scene">
      <Canvas shadows camera={{ position: camera, fov }}>
        {/* Iluminación */}
        <ambientLight intensity={1.5} />
        <hemisphereLight args={["#ffffff", "#8a9ba8", 1]} />
        <directionalLight position={[5, 8, 5]} intensity={2} castShadow />

        {/* Contenido de la escena */}
        {children}

        {/* Base + sombras */}
        {ground && (
          <>
            <ContactShadows
              position={[0, -0.36, 0]}
              opacity={0.35}
              scale={5}
              blur={2.5}
              far={2}
            />

            <mesh position={[0.1, -0.01, 0]} receiveShadow castShadow>
              <cylinderGeometry args={[1, 1, 0.1, 80]} />
              <meshPhysicalMaterial
                color="#f7f4ef"
                roughness={0.8}
                clearcoat={0.2}
              />
            </mesh>
          </>
        )}

        {/* Controles */}
        <OrbitControls {...controls} />

        {/* Gizmo de orientación */}
        {gizmo && (
          <GizmoHelper alignment="bottom-right">
            <GizmoViewport />
          </GizmoHelper>
        )}
      </Canvas>
    </div>
  );
}