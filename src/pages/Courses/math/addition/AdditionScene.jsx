import { Text } from "@react-three/drei";
import { useState } from "react";

import AdditionGroup from "./AdditionGroup";

const START_Y = 0.8;
const RESULT_Y = -2;

const GROUP_WIDTH = 2.3;
const GROUP_GAP = 0.35;

export default function AdditionScene({
  evaluate,
  values = [],
}) {
  // =====================================
  // VALORES
  // =====================================

  const safeValues =
    Array.isArray(values) && values.length > 0
      ? values.map((value) => {
          const number = Number(value);

          return Number.isFinite(number)
            ? Math.max(0, Math.floor(number))
            : 0;
        })
      : [2, 5];

  // =====================================
  // TOKENS
  // =====================================

  const createInitialTokens = () => {
  const tokens = [];

  safeValues.forEach((value, groupIndex) => {
    for (let i = 0; i < value; i++) {
      tokens.push({
        id: `group-${groupIndex}-token-${i}`,
        group: groupIndex,
        position: null,
      });
    }
  });

  return tokens;
};

  const [tokens, setTokens] = useState(
    createInitialTokens
  );

  const [draggingToken, setDraggingToken] = useState(null);

  // =====================================
  // RESULTADO
  // =====================================

  const correctAnswer =
    safeValues.reduce(
      (total, value) => total + value,
      0
    );

  // =====================================
  // TOKENS DEL RESULTADO
  // =====================================

  const resultTokens = tokens.filter(
    (token) => token.group === "result"
  );

  // =====================================
  // TOKENS DE UN GRUPO
  // =====================================

  const getGroupTokens = (groupIndex) => {
    return tokens.filter(
      (token) => token.group === groupIndex
    );
  };

  // =====================================
  // POSICIÓN DE LOS GRUPOS
  // =====================================

  const getGroupX = (index) => {
    const totalWidth =
      safeValues.length * GROUP_WIDTH +
      (safeValues.length - 1) * GROUP_GAP;

    const startX =
      -totalWidth / 2 +
      GROUP_WIDTH / 2;

    return (
      startX +
      index *
        (GROUP_WIDTH + GROUP_GAP)
    );
  };

  // =====================================
  // MOVER TOKEN
  // =====================================

  const handleTokenMove = (
  tokenId,
  x,
  y
) => {
  setTokens((previousTokens) =>
    previousTokens.map((token) =>
      token.id === tokenId
        ? {
            ...token,
            position: [x, y, 0],
          }
        : token
    )
  );
};

const handleTokenDragStart = (
  tokenId,
  x,
  y
) => {
  setDraggingToken({
    tokenId,
    x,
    y,
  });
};

const handleTokenDragEnd = (
  tokenId,
  x,
  y
) => {
  handleTokenDrop(
    tokenId,
    x,
    y
  );

  setDraggingToken(null);
};

  // =====================================
  // SOLTAR TOKEN
  // =====================================

  const handleTokenDrop = (
  tokenId,
  x,
  y
) => {
  const resultWidth = Math.min(
    Math.max(correctAnswer * 0.35, 3),
    7
  );

  const resultHeight = 2;

  const insideResult =
    x >= -resultWidth / 2 &&
    x <= resultWidth / 2 &&
    y >= RESULT_Y - resultHeight / 2 &&
    y <= RESULT_Y + resultHeight / 2;

  if (!insideResult) {
    return;
  }

  setTokens((previousTokens) =>
    previousTokens.map((token) =>
      token.id === tokenId
        ? {
            ...token,
            group: "result",
            position: [x, y, 0],
          }
        : token
    )
  );
};

  // =====================================
  // EVALUACIÓN
  // =====================================

  const isCorrect =
    resultTokens.length === correctAnswer;

  // =====================================
  // RESULTADO VISUAL
  // =====================================

  const resultWidth = Math.min(
    Math.max(correctAnswer * 0.35, 3),
    7
  );

  return (
    <group>

      {/* =====================================
          TÍTULO
      ====================================== */}

      <Text
        position={[0, 3.2, 0]}
        fontSize={0.30}
        color="#1976d2"
        anchorX="center"
        anchorY="middle"
      >
        Suma
      </Text>

      {/* =====================================
          OPERACIÓN
      ====================================== */}

      <Text
        position={[0, 2.75, 0]}
        fontSize={0.42}
        color="#172033"
        anchorX="center"
        anchorY="middle"
      >
        {safeValues.join(" + ")} ={" "}
        {evaluate && isCorrect
          ? correctAnswer
          : "?"}
      </Text>

      {/* =====================================
          INSTRUCCIÓN
      ====================================== */}

      <Text
        position={[0, 2.25, 0]}
        fontSize={0.22}
        color="#64748b"
        anchorX="center"
        anchorY="middle"
      >
        Arrastra las bolitas al resultado
      </Text>

      {/* =====================================
          GRUPOS DE OPERANDOS
      ====================================== */}

      {safeValues.map(
        (value, index) => (
          <AdditionGroup
  key={`group-${index}`}
  x={getGroupX(index)}
  y={START_Y}
  label={`Grupo ${String.fromCharCode(
    65 + index
  )}`}
  value={value}
  tokens={getGroupTokens(index)}
  onTokenDragStart={
    handleTokenDragStart
  }
  onTokenMove={
    handleTokenMove
  }
  onTokenDragEnd={
    handleTokenDragEnd
  }
  draggingToken={draggingToken}
/>
        )
      )}

      {/* =====================================
          GRUPO RESULTADO
      ====================================== */}

      <AdditionGroup
  x={0}
  y={RESULT_Y}
  width={resultWidth}
  height={2}
  label="Resultado"
  value={correctAnswer}
  tokens={resultTokens}
  isResult
  draggingToken={draggingToken}
/>

      {/* =====================================
          EVALUACIÓN
      ====================================== */}

      {evaluate && (
        <Text
          position={[0, -3.5, 1]}
          fontSize={0.32}
          color={
            isCorrect
              ? "#16a34a"
              : "#dc2626"
          }
          anchorX="center"
          anchorY="middle"
        >
          {isCorrect
            ? "¡Correcto!"
            : "Reúne todas las bolitas en el resultado"}
        </Text>
      )}
    </group>
  );
}