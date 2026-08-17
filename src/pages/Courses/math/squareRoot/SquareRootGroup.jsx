import { Line, Text } from "@react-three/drei";

export default function SquareRootGroup({
  x,
  y,
  width = 1.8,
  height = 1.5,
  value = 0,
  label = "",
  selected = false,
  isResult = false,
  onAdd,
  onRemove,
}) {
  // =====================================
  // COLOR DEL BORDE
  // =====================================

  const borderColor = isResult
    ? "#16a34a"
    : selected
    ? "#1976d2"
    : "#94a3b8";

  const textColor = isResult
    ? "#16a34a"
    : selected
    ? "#1976d2"
    : "#475569";

  // =====================================
  // RENDER
  // =====================================

  return (
    <group position={[x, y, 0]}>

      {/* =====================================
          CAJA
      ====================================== */}

      <Line
        points={[
          [-width / 2, -height / 2, 0],
          [width / 2, -height / 2, 0],
          [width / 2, height / 2, 0],
          [-width / 2, height / 2, 0],
          [-width / 2, -height / 2, 0],
        ]}
        lineWidth={2}
        color={borderColor}
      />

      {/* =====================================
          FONDO
      ====================================== */}

      <mesh position={[0, 0, -0.01]}>
        <planeGeometry
          args={[width, height]}
        />

        <meshBasicMaterial
          transparent
          opacity={0.04}
        />
      </mesh>

      {/* =====================================
          VALOR
      ====================================== */}

      <Text
        position={[0, 0, 0.02]}
        fontSize={0.45}
        color={textColor}
        anchorX="center"
        anchorY="middle"
      >
        {value}
      </Text>

      {/* =====================================
          ETIQUETA
      ====================================== */}

      {label && (
        <Text
          position={[
            0,
            -height / 2 - 0.30,
            0,
          ]}
          fontSize={0.20}
          color="#64748b"
          anchorX="center"
          anchorY="middle"
        >
          {label}
        </Text>
      )}

      {/* =====================================
          BOTÓN AGREGAR
      ====================================== */}

      {!isResult && !selected && (
        <group
          position={[
            width / 2 + 0.25,
            0,
            0.02,
          ]}
          onClick={(event) => {
            event.stopPropagation();
            onAdd?.();
          }}
        >
          <mesh>
            <circleGeometry
              args={[0.16, 32]}
            />

            <meshBasicMaterial
              color="#1976d2"
            />
          </mesh>

          <Text
            position={[0, 0, 0.02]}
            fontSize={0.22}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
          >
            +
          </Text>
        </group>
      )}

      {/* =====================================
          BOTÓN ELIMINAR
      ====================================== */}

      {!isResult && selected && (
        <group
          position={[
            width / 2 + 0.25,
            0,
            0.02,
          ]}
          onClick={(event) => {
            event.stopPropagation();
            onRemove?.();
          }}
        >
          <mesh>
            <circleGeometry
              args={[0.16, 32]}
            />

            <meshBasicMaterial
              color="#dc2626"
            />
          </mesh>

          <Text
            position={[0, 0, 0.02]}
            fontSize={0.22}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
          >
            −
          </Text>
        </group>
      )}
    </group>
  );
}
