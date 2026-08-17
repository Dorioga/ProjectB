import { Text } from "@react-three/drei";
import { useMemo, useState } from "react";

import SquareRootGroup from "./SquareRootGroup";
import SquareRootToken from "./SquareRootToken";

// =====================================
// CONFIGURACIÓN VISUAL
// =====================================

const GRID_START_Y = 0.5;

const TOKEN_SIZE = 0.42;
const TOKEN_GAP = 0.08;

const MAX_COLUMNS = 10;

// =====================================
// COMPONENTE
// =====================================

export default function SquareRootScene({
  evaluate = false,
  values = [],
}) {
  // =====================================
  // VALOR SEGURO
  // =====================================

  const inputValue = Number(values?.[0]);

  const radicand =
    Number.isFinite(inputValue) &&
    inputValue >= 0
      ? Math.floor(inputValue)
      : 16;

  // =====================================
  // RAÍZ CORRECTA
  // =====================================

  const correctAnswer = Math.sqrt(
    radicand
  );

  const isPerfectSquare =
    Number.isInteger(correctAnswer);

  // =====================================
  // FACTORES POSIBLES
  // =====================================

  const factorPairs = useMemo(() => {
    const pairs = [];

    for (let i = 1; i <= Math.sqrt(radicand); i++) {
      if (radicand % i === 0) {
        const other = radicand / i;

        pairs.push({
          a: i,
          b: other,
          isPerfect:
            i === other,
        });
      }
    }

    return pairs;
  }, [radicand]);

  // =====================================
  // FACTORES SELECCIONADOS
  // =====================================

  const [selectedFactors, setSelectedFactors] =
    useState([]);

  // =====================================
  // AGREGAR FACTOR
  // =====================================

  const handleAddFactor = (factor) => {
    if (
      selectedFactors.length >= 2
    ) {
      return;
    }

    setSelectedFactors((previous) => [
      ...previous,
      factor,
    ]);
  };

  // =====================================
  // ELIMINAR FACTOR
  // =====================================

  const handleRemoveFactor = (index) => {
    setSelectedFactors(
      (previous) =>
        previous.filter(
          (_, factorIndex) =>
            factorIndex !== index
        )
    );
  };

  // =====================================
  // FACTORES ACTUALES
  // =====================================

  const firstFactor =
    selectedFactors[0] ?? null;

  const secondFactor =
    selectedFactors[1] ?? null;

  // =====================================
  // PRODUCTO
  // =====================================

  const selectedProduct =
    firstFactor !== null &&
    secondFactor !== null
      ? firstFactor * secondFactor
      : null;

  // =====================================
  // VALIDACIÓN
  // =====================================

  const isCorrect =
    isPerfectSquare &&
    selectedFactors.length === 2 &&
    firstFactor === correctAnswer &&
    secondFactor === correctAnswer;

  // =====================================
  // RESULTADO
  // =====================================

  const showResult =
    evaluate && isCorrect;

  // =====================================
  // MATRIZ
  // =====================================

  const gridColumns = Math.min(
    MAX_COLUMNS,
    Math.max(
      1,
      Math.ceil(
        Math.sqrt(radicand)
      )
    )
  );

  const gridRows = Math.ceil(
    radicand / gridColumns
  );

  // =====================================
  // POSICIÓN DE CADA BLOQUE
  // =====================================

  const getTokenPosition = (index) => {
    const row = Math.floor(
      index / gridColumns
    );

    const column =
      index % gridColumns;

    const totalWidth =
      (gridColumns - 1) *
      (TOKEN_SIZE + TOKEN_GAP);

    const totalHeight =
      (gridRows - 1) *
      (TOKEN_SIZE + TOKEN_GAP);

    const x =
      column *
        (TOKEN_SIZE + TOKEN_GAP) -
      totalWidth / 2;

    const y =
      GRID_START_Y -
      row *
        (TOKEN_SIZE + TOKEN_GAP) +
      totalHeight / 2;

    return [x, y, 0];
  };

  // =====================================
  // BLOQUES DE LA MATRIZ
  // =====================================

  const gridTokens = useMemo(() => {
    return Array.from(
      { length: radicand },
      (_, index) => ({
        id: `square-root-token-${index}`,
        value: 1,
      })
    );
  }, [radicand]);

  // =====================================
  // TEXTO DE FACTORES
  // =====================================

  const factorExpression =
    firstFactor !== null &&
    secondFactor !== null
      ? `${firstFactor} × ${secondFactor}`
      : firstFactor !== null
      ? `${firstFactor} × ?`
      : "? × ?";

  // =====================================
  // RENDER
  // =====================================

  return (
    <group>

      {/* =====================================
          TÍTULO
      ====================================== */}

      <Text
        position={[0, 4.5, 0]}
        fontSize={0.30}
        color="#1976d2"
        anchorX="center"
        anchorY="middle"
      >
        Raíces cuadradas
      </Text>

      {/* =====================================
          RAÍZ
      ====================================== */}

      <Text
        position={[0, 3.95, 0]}
        fontSize={0.55}
        color="#172033"
        anchorX="center"
        anchorY="middle"
      >
        √{radicand} ={" "}
        {showResult
          ? correctAnswer
          : "?"}
      </Text>

      {/* =====================================
          EXPLICACIÓN
      ====================================== */}

      <Text
        position={[0, 3.45, 0]}
        fontSize={0.21}
        color="#64748b"
        anchorX="center"
        anchorY="middle"
      >
        Busca dos números que multiplicados
        formen el número dentro de la raíz
      </Text>

      {factorPairs.map((pair, index) => (
        <group
          key={`factor-pair-${index}`}
          position={[
            0,
            2.95 - index * 0.45,
            0,
          ]}
        >
          <Text
            position={[-0.2, 0, 0]}
            fontSize={0.30}
            color={
              pair.isPerfect
                ? "#16a34a"
                : "#475569"
            }
            anchorX="right"
            anchorY="middle"
          >
            {pair.a} × {pair.b} =
          </Text>

          <Text
            position={[0, 0, 0]}
            fontSize={0.30}
            color={
              pair.isPerfect
                ? "#16a34a"
                : "#1976d2"
            }
            anchorX="left"
            anchorY="middle"
          >
            {radicand}
          </Text>
        </group>
      ))}

      {/* =====================================
          MATRIZ
      ====================================== */}

      <group
        position={[0, 0, 0]}
      >
        {gridTokens.map(
          (token, index) => (
            <SquareRootToken
              key={token.id}
              position={getTokenPosition(
                index
              )}
              size={TOKEN_SIZE}
              value={token.value}
            />
          )
        )}
      </group>

      {/* =====================================
          FACTOR 1
      ====================================== */}

      <SquareRootGroup
        x={-2.3}
        y={-1.5}
        width={1.8}
        height={1.5}
        value={
          firstFactor ?? "?"
        }
        label="Primer factor"
        selected={
          firstFactor !== null
        }
        onAdd={() =>
          handleAddFactor(
            Math.floor(
              Math.sqrt(radicand)
            )
          )
        }
        onRemove={() =>
          handleRemoveFactor(0)
        }
      />

      {/* =====================================
          FACTOR 2
      ====================================== */}

      <SquareRootGroup
        x={2.3}
        y={-1.5}
        width={1.8}
        height={1.5}
        value={
          secondFactor ?? "?"
        }
        label="Segundo factor"
        selected={
          secondFactor !== null
        }
        onAdd={() =>
          handleAddFactor(
            Math.floor(
              Math.sqrt(radicand)
            )
          )
        }
        onRemove={() =>
          handleRemoveFactor(1)
        }
      />

      {/* =====================================
          MULTIPLICACIÓN
      ====================================== */}

      <Text
        position={[0, -2.65, 0]}
        fontSize={0.32}
        color="#475569"
        anchorX="center"
        anchorY="middle"
      >
        {factorExpression}
        {selectedProduct !== null &&
          ` = ${selectedProduct}`}
      </Text>

      {/* =====================================
          RELACIÓN CON LA RAÍZ
      ====================================== */}

      {showResult && (
        <Text
          position={[0, -3.15, 0]}
          fontSize={0.38}
          color="#16a34a"
          anchorX="center"
          anchorY="middle"
        >
          {correctAnswer} ×{" "}
          {correctAnswer} ={" "}
          {radicand}
        </Text>
      )}

      {/* =====================================
          EVALUACIÓN
      ====================================== */}

      {evaluate && (
        <Text
          position={[0, -3.7, 0]}
          fontSize={0.30}
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
            : "Busca dos factores iguales que formen el número de la raíz"}
        </Text>
      )}

    </group>
  );
}
