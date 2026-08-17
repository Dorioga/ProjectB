import * as THREE from "three";
import { Text } from "@react-three/drei";

export default function SquareRootToken({
  position = [0, 0, 0],
  size = 0.5,
  value,
  selected = false,
}) {
  return (
    <group position={position}>
      <mesh>
        <planeGeometry args={[size, size]} />

        <meshBasicMaterial
          transparent
          opacity={selected ? 0.9 : 0.15}
        />
      </mesh>

      <lineSegments>
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

      {value !== undefined && (
        <Text
          position={[0, 0, 0.02]}
          fontSize={size * 0.35}
          color={
            selected
              ? "#16a34a"
              : "#1976d2"
          }
          anchorX="center"
          anchorY="middle"
        >
          {value}
        </Text>
      )}
    </group>
  );
}
