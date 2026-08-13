import { Text } from "@react-three/drei";

export default function MultiplicationGroup({
  id,
  position = [0, 0, 0],
  tokens = [],
  capacity,
}) {
  // =====================================
  // CONFIGURACIÓN VISUAL
  // =====================================

  const width = 1.8;
  const height = 1.35;

  const isComplete =
    capacity !== undefined &&
    tokens.length === capacity;

  const isOverCapacity =
    capacity !== undefined &&
    tokens.length > capacity;

  // =====================================
  // COLOR DEL GRUPO
  // =====================================

  const getGroupColor = () => {
    if (isOverCapacity) {
      return "#fee2e2";
    }

    if (isComplete) {
      return "#dcfce7";
    }

    return "#f1f5f9";
  };

  const getBorderColor = () => {
    if (isOverCapacity) {
      return "#dc2626";
    }

    if (isComplete) {
      return "#16a34a";
    }

    return "#94a3b8";
  };

  // =====================================
  // RENDER
  // =====================================

  return (
    <group position={position}>

      {/* =====================================
          FONDO DEL GRUPO
      ====================================== */}

      <mesh>
        <boxGeometry
          args={[
            width,
            height,
            0.12,
          ]}
        />

        <meshStandardMaterial
          color={getGroupColor()}
          transparent
          opacity={0.9}
          roughness={0.8}
        />
      </mesh>

      {/* =====================================
          BORDE SUPERIOR
      ====================================== */}

      <mesh
        position={[
          0,
          height / 2,
          0.08,
        ]}
      >
        <boxGeometry
          args={[
            width,
            0.05,
            0.05,
          ]}
        />

        <meshStandardMaterial
          color={getBorderColor()}
        />
      </mesh>

      {/* =====================================
          BORDE INFERIOR
      ====================================== */}

      <mesh
        position={[
          0,
          -height / 2,
          0.08,
        ]}
      >
        <boxGeometry
          args={[
            width,
            0.05,
            0.05,
          ]}
        />

        <meshStandardMaterial
          color={getBorderColor()}
        />
      </mesh>

      {/* =====================================
          BORDE IZQUIERDO
      ====================================== */}

      <mesh
        position={[
          -width / 2,
          0,
          0.08,
        ]}
      >
        <boxGeometry
          args={[
            0.05,
            height,
            0.05,
          ]}
        />

        <meshStandardMaterial
          color={getBorderColor()}
        />
      </mesh>

      {/* =====================================
          BORDE DERECHO
      ====================================== */}

      <mesh
        position={[
          width / 2,
          0,
          0.08,
        ]}
      >
        <boxGeometry
          args={[
            0.05,
            height,
            0.05,
          ]}
        />

        <meshStandardMaterial
          color={getBorderColor()}
        />
      </mesh>

      {/* =====================================
          NOMBRE DEL GRUPO
      ====================================== */}

      <Text
        position={[
          0,
          -height / 2 - 0.32,
          0,
        ]}
        fontSize={0.20}
        color="#475569"
        anchorX="center"
        anchorY="middle"
      >
        Grupo {id + 1}
      </Text>

      {/* =====================================
          CONTADOR
      ====================================== */}

      <Text
        position={[
          0,
          height / 2 + 0.25,
          0,
        ]}
        fontSize={0.18}
        color={getBorderColor()}
        anchorX="center"
        anchorY="middle"
      >
        {tokens.length}
        {capacity !== undefined
          ? ` / ${capacity}`
          : ""}
      </Text>
    </group>
  );
}