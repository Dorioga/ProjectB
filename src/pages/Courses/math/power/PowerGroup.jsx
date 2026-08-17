import { Line, Text } from "@react-three/drei";

import PowerToken from "./PowerToken";

export default function PowerGroup({
  x,
  y,
  width = 2.2,
  height = 1.6,
  value = 0,
  selected = false,
  onAdd,
  onRemove,
}) {
  // =====================================
  // COLOR DEL GRUPO
  // =====================================

  const borderColor = selected
    ? "#1976d2"
    : "#94a3b8";

  const counterColor = selected
    ? "#1976d2"
    : "#94a3b8";

  // =====================================
  // POSICIÓN DEL BLOQUE
  // =====================================

  const tokenPosition = [
    x,
    y,
    0.08,
  ];

  // =====================================
  // CLICK EN EL GRUPO
  // =====================================

  const handleGroupClick = () => {
    if (selected) {
      return;
    }

    onAdd?.();
  };

  // =====================================
  // CLICK EN EL BLOQUE
  // =====================================

  const handleTokenClick = () => {
    if (!selected) {
      return;
    }

    onRemove?.();
  };

  // =====================================
  // RENDER
  // =====================================

  return (
    <group>

      {/* =====================================
          ÁREA CLICKEABLE DEL GRUPO
      ====================================== */}

      <mesh
        position={[
          x,
          y,
          -0.02,
        ]}
        onClick={(event) => {
          event.stopPropagation();
          handleGroupClick();
        }}
      >
        <planeGeometry
          args={[
            width,
            height,
          ]}
        />

        <meshBasicMaterial
          transparent
          opacity={0.001}
        />
      </mesh>

      {/* =====================================
          BORDE
      ====================================== */}

      <Line
        points={[
          [
            x - width / 2,
            y - height / 2,
            0,
          ],
          [
            x + width / 2,
            y - height / 2,
            0,
          ],
          [
            x + width / 2,
            y + height / 2,
            0,
          ],
          [
            x - width / 2,
            y + height / 2,
            0,
          ],
          [
            x - width / 2,
            y - height / 2,
            0,
          ],
        ]}
        lineWidth={2}
        color={borderColor}
      />

      {/* =====================================
          CONTADOR
      ====================================== */}

      <Text
        position={[
          x,
          y + height / 2 + 0.28,
          0,
        ]}
        fontSize={0.20}
        color={counterColor}
        anchorX="center"
        anchorY="middle"
      >
        {selected ? "1 / 1" : "0 / 1"}
      </Text>

      {/* =====================================
          ETIQUETA
      ====================================== */}

      <Text
        position={[
          x,
          y - height / 2 - 0.35,
          0,
        ]}
        fontSize={0.22}
        color="#475569"
        anchorX="center"
        anchorY="middle"
      >
        Factor
      </Text>

      {/* =====================================
          BLOQUE MATEMÁTICO
      ====================================== */}

      {selected && (
        <PowerToken
          value={value}
          position={tokenPosition}
          onClick={handleTokenClick}
        />
      )}

    </group>
  );
}
