import { Text } from "@react-three/drei";
import { useMemo, useState } from "react";

import AlgebraicGroup from "./algebraicGroup";

const VARIABLE = "x";

const TOKEN_SIZE = 0.48;
const TOKEN_GAP = 0.08;

// Separación entre grupos
const GROUP_GAP = 0.8;

// =====================================
// CALCULAR ANCHO DE UN GRUPO
// =====================================

const getGroupWidth = (coefficient) => {
  return (
    coefficient * TOKEN_SIZE +
    (coefficient - 1) * TOKEN_GAP
  );
};

// =====================================
// COMPONENTE
// =====================================

export default function AlgebraicScene({
  evaluate = false,
  values = [],
}) {
  // =====================================
  // VALORES SEGUROS
  // =====================================

  const coefficients = useMemo(() => {
    const parsedValues = values
      .map((value) => Number(value))
      .filter(
        (value) =>
          Number.isFinite(value) &&
          value > 0
      );

    return parsedValues.length > 0
      ? parsedValues
      : [3, 2];
  }, [values]);

  // =====================================
  // FICHAS SELECCIONADAS
  // =====================================

  const [selectedTokens, setSelectedTokens] =
    useState([]);

  // =====================================
  // SELECCIONAR / DESELECCIONAR FICHA
  // =====================================

  const handleTokenClick = (tokenId) => {
    setSelectedTokens((previous) => {
      if (previous.includes(tokenId)) {
        return previous.filter(
          (id) => id !== tokenId
        );
      }

      return [...previous, tokenId];
    });
  };

  // =====================================
  // CANTIDAD TOTAL DE FICHAS
  // =====================================

  const correctResult = coefficients.reduce(
    (total, coefficient) =>
      total + coefficient,
    0
  );

  // =====================================
  // CANTIDAD SELECCIONADA
  // =====================================

  const selectedCount =
    selectedTokens.length;

  // =====================================
  // VALIDACIÓN
  // =====================================

  const isCorrect =
    selectedCount === correctResult;

  // =====================================
  // EXPRESIÓN ORIGINAL
  // =====================================

  const originalExpression =
    coefficients
      .map(
        (coefficient) =>
          `${coefficient}${VARIABLE}`
      )
      .join(" + ");

  // =====================================
  // EXPRESIÓN SELECCIONADA
  // =====================================

  const selectedExpression =
    selectedCount > 0
      ? `${selectedCount}${VARIABLE}`
      : "?";

  // =====================================
  // TEXTO DE AYUDA
  // =====================================

  const instructionText =
    selectedCount === 0
      ? "Selecciona los cuadritos que representan términos semejantes"
      : selectedCount < correctResult
      ? `Has seleccionado ${selectedCount} de ${correctResult} fichas`
      : selectedCount === correctResult
      ? "Has seleccionado todos los términos semejantes"
      : "Has seleccionado más fichas de las necesarias";

  // =====================================
  // COLOR DE SELECCIÓN
  // =====================================

  const selectionColor = evaluate
    ? isCorrect
      ? "#16a34a"
      : "#dc2626"
    : "#1976d2";

  // =====================================
  // MOSTRAR RESULTADO
  // =====================================

  const showResult =
    evaluate && isCorrect;

  // =====================================
  // RESULTADO FINAL
  // =====================================

  const resultExpression =
    `${correctResult}${VARIABLE}`;

  // =====================================
  // MENSAJE DE EVALUACIÓN
  // =====================================

  const resultText = useMemo(() => {
    if (!evaluate) {
      return null;
    }

    if (isCorrect) {
      return "¡Correcto!";
    }

    if (selectedCount < correctResult) {
      return "Selecciona todos los términos semejantes";
    }

    return "Revisa los términos seleccionados";
  }, [
    evaluate,
    isCorrect,
    selectedCount,
    correctResult,
  ]);

  // =====================================
  // ANCHOS DE LOS GRUPOS
  // =====================================

  const groupWidths = useMemo(() => {
    return coefficients.map((coefficient) =>
      getGroupWidth(coefficient)
    );
  }, [coefficients]);

  // =====================================
  // POSICIONES DE LOS GRUPOS
  // =====================================

  const groupPositions = useMemo(() => {
    const totalGroupsWidth = groupWidths.reduce(
      (total, width) => total + width,
      0
    );

    const totalGaps =
      (groupWidths.length - 1) * GROUP_GAP;

    const totalWidth =
      totalGroupsWidth + totalGaps;

    return groupWidths.map((width, index) => {
      const previousWidths = groupWidths
        .slice(0, index)
        .reduce(
          (total, previousWidth) =>
            total + previousWidth,
          0
        );

      const previousGaps =
        index * GROUP_GAP;

      return (
        -totalWidth / 2 +
        previousWidths +
        previousGaps +
        width / 2
      );
    });
  }, [groupWidths]);

  // =====================================
  // POSICIONES DE LOS SIGNOS +
  // =====================================

  const getPlusPosition = (index) => {
    const previousGroupEnd =
      groupPositions[index - 1] +
      groupWidths[index - 1] / 2;

    const currentGroupStart =
      groupPositions[index] -
      groupWidths[index] / 2;

    return (
      (previousGroupEnd +
        currentGroupStart) /
      2
    );
  };

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
        Expresiones algebraicas
      </Text>

      {/* =====================================
          INSTRUCCIÓN
      ====================================== */}

      <Text
        position={[0, 4.0, 0]}
        fontSize={0.25}
        color="#172033"
        anchorX="center"
        anchorY="middle"
      >
        Agrupa los términos semejantes
      </Text>

      {/* =====================================
          EXPRESIÓN ORIGINAL
      ====================================== */}

      <Text
        position={[0, 3.4, 0]}
        fontSize={0.55}
        color="#172033"
        anchorX="center"
        anchorY="middle"
      >
        {originalExpression}
      </Text>

      {/* =====================================
          GRUPOS ALGEBRAICOS
      ====================================== */}

      {coefficients.map(
        (coefficient, index) => (
          <group
            key={`algebraic-group-${index}`}
          >

            {/* ================================
                SIGNO +
            ================================= */}

            {index > 0 && (
              <Text
                position={[
                  getPlusPosition(index),
                  1.8,
                  0,
                ]}
                fontSize={0.40}
                color="#475569"
                anchorX="center"
                anchorY="middle"
              >
                +
              </Text>
            )}

            {/* ================================
                GRUPO
            ================================= */}

            <AlgebraicGroup
              position={[
                groupPositions[index],
                1.8,
                0,
              ]}
              coefficient={coefficient}
              variable={VARIABLE}
              groupId={`term-${index}`}
              selectedTokens={
                selectedTokens
              }
              onTokenClick={
                handleTokenClick
              }
            />

          </group>
        )
      )}

      {/* =====================================
          TEXTO DE AYUDA
      ====================================== */}

      <Text
        position={[0, 0.5, 0]}
        fontSize={0.25}
        color="#64748b"
        anchorX="center"
        anchorY="middle"
      >
        {instructionText}
      </Text>

      {/* =====================================
          SELECCIÓN ACTUAL
      ====================================== */}

      <Text
        position={[0, -0.2, 0]}
        fontSize={0.34}
        color={selectionColor}
        anchorX="center"
        anchorY="middle"
      >
        Selección: {selectedExpression}
      </Text>

      {/* =====================================
          OPERACIÓN
      ====================================== */}

      {selectedCount > 0 && (
        <Text
          position={[0, -0.9, 0]}
          fontSize={0.34}
          color="#475569"
          anchorX="center"
          anchorY="middle"
        >
          {selectedCount} × {VARIABLE}
        </Text>
      )}

      {/* =====================================
          RESULTADO
      ===================================== */}

      {showResult && (
        <>
          <Text
            position={[0, -1.7, 0]}
            fontSize={0.50}
            color="#16a34a"
            anchorX="center"
            anchorY="middle"
          >
            {originalExpression} ={" "}
            {resultExpression}
          </Text>

          <Text
            position={[0, -2.25, 0]}
            fontSize={0.25}
            color="#64748b"
            anchorX="center"
            anchorY="middle"
          >
            Se suman los coeficientes
            porque tienen la misma variable
          </Text>
        </>
      )}

      {/* =====================================
          EVALUACIÓN
      ====================================== */}

      {evaluate && (
        <Text
          position={[0, -3.0, 0]}
          fontSize={0.30}
          color={
            isCorrect
              ? "#16a34a"
              : "#dc2626"
          }
          anchorX="center"
          anchorY="middle"
        >
          {resultText}
        </Text>
      )}

    </group>
  );
}
