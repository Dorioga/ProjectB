import { Text, RoundedBox } from "@react-three/drei";

export default function PowerToken({
  value,
  position = [0, 0, 0],
  onClick,
}) {
  return (
    <group
      position={position}
      onClick={(event) => {
        event.stopPropagation();
        onClick?.();
      }}
    >
      {/* =====================================
          BLOQUE
      ====================================== */}

      <RoundedBox
        args={[0.95, 0.70, 0.12]}
        radius={0.08}
        smoothness={4}
        position={[0, 0, 0]}
      >
        <meshStandardMaterial
          color="#1976d2"
          roughness={0.35}
          metalness={0.05}
        />
      </RoundedBox>

      {/* =====================================
          NÚMERO
      ====================================== */}

      <Text
        position={[0, 0, 0.08]}
        fontSize={0.34}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        {value}
      </Text>
    </group>
  );
}
