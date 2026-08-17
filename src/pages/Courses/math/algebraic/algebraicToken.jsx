import * as THREE from "three";
import { Text } from "@react-three/drei";

export default function AlgebraicToken({
  position = [0, 0, 0],
  size = 0.5,
  value = "x",
  selected = false,
  onClick,
}) {
  return (
    <group position={position}>

      {/* =====================================
          ÁREA INTERACTIVA
      ====================================== */}

      <mesh
        position={[0, 0, 0]}
        onPointerDown={(event) => {
          event.stopPropagation();
          onClick?.();
        }}
      >
        <planeGeometry args={[size, size]} />

        <meshBasicMaterial
          transparent
          opacity={selected ? 0.9 : 0.15}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* =====================================
          BORDE
      ====================================== */}

      <lineSegments
        position={[0, 0, 0.01]}
        raycast={() => null}
      >
        <edgesGeometry
          args={[
            new THREE.PlaneGeometry(
              size,
              size
            ),
          ]}
        />

        <lineBasicMaterial
          color={
            selected
              ? "#16a34a"
              : "#1976d2"
          }
        />
      </lineSegments>

      {/* =====================================
          TEXTO
      ====================================== */}

      <Text
        position={[0, 0, 0.02]}
        fontSize={size * 0.45}
        color={
          selected
            ? "#16a34a"
            : "#1976d2"
        }
        anchorX="center"
        anchorY="middle"
        raycast={() => null}
      >
        {value}
      </Text>

    </group>
  );
}
