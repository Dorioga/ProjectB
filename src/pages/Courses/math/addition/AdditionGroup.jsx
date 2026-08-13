import { Line, Text } from "@react-three/drei";
import AdditionToken from "./AdditionToken";

export default function AdditionGroup({
  x,
  y,
  width = 2.2,
  height = 1.8,
  label,
  value = 0,
  tokens = [],
  isResult = false,

  onTokenDragStart,
  onTokenMove,
  onTokenDragEnd,
}) {
  const getTokenPosition = (index) => {
    const columns = 4;

    const spacingX = 0.42;
    const spacingY = 0.42;

    const row = Math.floor(index / columns);
    const column = index % columns;

    const totalColumns = Math.min(columns, value);

    const rowWidth =
      (totalColumns - 1) * spacingX;

    const tokenX =
      column * spacingX - rowWidth / 2;

    const tokenY =
      height / 2 - 0.55 - row * spacingY;

    return [
      x + tokenX,
      y + tokenY,
      0,
    ];
  };

  return (
    <group>
      {/* =====================================
          CAJA
      ====================================== */}

      <Line
        points={[
          [x - width / 2, y - height / 2, 0],
          [x + width / 2, y - height / 2, 0],
          [x + width / 2, y + height / 2, 0],
          [x - width / 2, y + height / 2, 0],
          [x - width / 2, y - height / 2, 0],
        ]}
        lineWidth={2}
        color={isResult ? "#16a34a" : "#94a3b8"}
      />

      {/* =====================================
          TÍTULO
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
        {label}
      </Text>

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
        color={
          isResult
            ? "#16a34a"
            : "#94a3b8"
        }
        anchorX="center"
        anchorY="middle"
      >
        {tokens.length} / {value}
      </Text>

      {/* =====================================
          BOLITAS
      ====================================== */}

      {tokens.map((token, index) => {
  const position =
    token.position ??
    getTokenPosition(index);

  return (
    <AdditionToken
      key={token.id}
      position={position}

      onDragStart={(
        xPosition,
        yPosition
      ) =>
        onTokenDragStart?.(
          token.id,
          xPosition,
          yPosition
        )
      }

      onMove={(
        xPosition,
        yPosition
      ) =>
        onTokenMove?.(
          token.id,
          xPosition,
          yPosition
        )
      }

      onDragEnd={(
        xPosition,
        yPosition
      ) =>
        onTokenDragEnd?.(
          token.id,
          xPosition,
          yPosition
        )
      }
    />
  );
})}
    </group>
  );
}