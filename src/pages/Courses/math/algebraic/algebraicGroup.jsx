import { Text } from "@react-three/drei";
import AlgebraicToken from "./algebraicToken";

// =====================================
// CONFIGURACIÓN
// =====================================

const TOKEN_SIZE = 0.48;
const TOKEN_GAP = 0.08;

// =====================================
// COMPONENTE
// =====================================

export default function AlgebraicGroup({
  position = [0, 0, 0],
  coefficient = 1,
  variable = "x",
  selectedTokens = [],
  groupId,
  onTokenClick,
}) {
  const safeCoefficient = Math.max(
    1,
    Math.floor(Number(coefficient) || 1)
  );

  const totalWidth =
    safeCoefficient * TOKEN_SIZE +
    (safeCoefficient - 1) * TOKEN_GAP;

  const getTokenPosition = (index) => {
    const x =
      index *
        (TOKEN_SIZE + TOKEN_GAP) -
      totalWidth / 2 +
      TOKEN_SIZE / 2;

    return [x, 0, 0];
  };

  return (
    <group position={position}>

      {/* =====================================
          TOKENS
      ====================================== */}

      {Array.from(
        { length: safeCoefficient },
        (_, index) => {
          const tokenId =
            `${groupId}-${index}`;

          return (
            <AlgebraicToken
              key={tokenId}
              position={getTokenPosition(index)}
              size={TOKEN_SIZE}
              value={variable}
              selected={selectedTokens.includes(
                tokenId
              )}
              onClick={() =>
                onTokenClick?.(tokenId)
              }
            />
          );
        }
      )}

      {/* =====================================
          EXPRESIÓN
      ====================================== */}

      <Text
        position={[0, -0.45, 0]}
        fontSize={0.24}
        color="#475569"
        anchorX="center"
        anchorY="middle"
        raycast={() => null}
      >
        {safeCoefficient === 1
          ? variable
          : `${safeCoefficient}${variable}`}
      </Text>

    </group>
  );
}
