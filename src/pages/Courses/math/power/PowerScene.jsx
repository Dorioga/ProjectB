import { Text } from "@react-three/drei";
import { useMemo, useState } from "react";

import PowerGroup from "./PowerGroup";

const START_Y = 0.8;

const FACTOR_WIDTH = 1.5;
const FACTOR_HEIGHT = 1.2;
const FACTOR_GAP = 0.35;

export default function PowerScene({
  evaluate = false,
  values = [],
}) {
  // =====================================
  // VALORES SEGUROS
  // =====================================

  const baseValue = Number(values?.[0]);
  const exponentValue = Number(values?.[1]);

  const base =
    Number.isFinite(baseValue)
      ? Math.max(0, Math.floor(baseValue))
      : 2;

  const exponent =
    Number.isFinite(exponentValue)
      ? Math.max(0, Math.floor(exponentValue))
      : 3;

  // =====================================
  // RESULTADO
  // =====================================

  const correctAnswer = Math.pow(
    base,
    exponent
  );

  // =====================================
  // FACTORES
  // =====================================

  const factors = useMemo(() => {
    return Array.from(
      { length: exponent },
      () => base
    );
  }, [base, exponent]);

  // =====================================
  // FACTORES SELECCIONADOS
  // =====================================

  const [selectedFactors, setSelectedFactors] =
    useState([]);

  // =====================================
  // VALIDACIÓN
  // =====================================

  const isCorrect =
    selectedFactors.length === exponent &&
    selectedFactors.every(
      (value) => value === base
    );

  // =====================================
  // POSICIÓN DE LOS FACTORES
  // =====================================

  const getFactorX = (index) => {
    const totalWidth =
      exponent * FACTOR_WIDTH +
      (exponent - 1) * FACTOR_GAP;

    const startX =
      -totalWidth / 2 +
      FACTOR_WIDTH / 2;

    return (
      startX +
      index *
        (FACTOR_WIDTH + FACTOR_GAP)
    );
  };

  // =====================================
  // AGREGAR FACTOR
  // =====================================

  const handleAddFactor = (index) => {
    // Evitamos agregar más factores
    // de los necesarios.

    if (
      selectedFactors.length >= exponent
    ) {
      return;
    }

    // Evitamos duplicar el mismo índice.

    if (
      selectedFactors[index] !== undefined
    ) {
      return;
    }

    setSelectedFactors(
      (previous) => {
        const next = [
          ...previous,
          base,
        ];

        return next;
      }
    );
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
  // RESULTADO
  // =====================================

  const showResult =
    evaluate && isCorrect;

  // =====================================
  // OPERACIÓN PROGRESIVA
  // =====================================
  //
  // Ejemplo:
  //
  // 2⁴
  //
  // 2 × 2 = 4
  // 4 × 2 = 8
  // 8 × 2 = 16
  //
  // Se construye únicamente con los
  // factores que el estudiante ya colocó.
  // =====================================

  const progressiveSteps = [];

  if (selectedFactors.length >= 2) {
    let accumulated =
      selectedFactors[0];

    for (
      let index = 1;
      index < selectedFactors.length;
      index++
    ) {
      const currentFactor =
        selectedFactors[index];

      const previousResult =
        accumulated;

      const newResult =
        previousResult *
        currentFactor;

      progressiveSteps.push({
        id: `step-${index}`,
        expression:
          `${previousResult} × ${currentFactor} = ${newResult}`,
      });

      accumulated =
        newResult;
    }
  }

  // =====================================
  // EXPRESIÓN DESARROLLADA
  // =====================================

  const expandedExpression =
    factors.length > 0
      ? factors.join(" × ")
      : "1";

  // =====================================
  // POSICIÓN DE LA OPERACIÓN
  // =====================================

  const operationStartY = -1.2;

  // =====================================
  // RENDER
  // =====================================

  return (
    <group>

      {/* =====================================
          TÍTULO
      ====================================== */}

      <Text
        position={[
          0,
          4.6,
          0,
        ]}
        fontSize={0.30}
        color="#1976d2"
        anchorX="center"
        anchorY="middle"
      >
        Potencias
      </Text>

      {/* =====================================
          POTENCIA
      ====================================== */}

      <Text
        position={[
          0,
          4,
          0,
        ]}
        fontSize={0.50}
        color="#172033"
        anchorX="center"
        anchorY="middle"
      >
        {base}^{exponent} ={" "}
        {showResult
          ? correctAnswer
          : "?"}
      </Text>

      {/* =====================================
          EXPLICACIÓN
      ====================================== */}

      <Text
        position={[
          0,
          3.5,
          0,
        ]}
        fontSize={0.21}
        color="#64748b"
        anchorX="center"
        anchorY="middle"
      >
        La base se multiplica tantas veces como indica el exponente
      </Text>

      {/* =====================================
          FACTORES
      ====================================== */}

      {factors.map(
        (factor, index) => {
          const selected =
            selectedFactors.length >
            index;

          return (
            <PowerGroup
              key={`factor-${index}`}
              x={getFactorX(index)}
              y={START_Y}
              width={FACTOR_WIDTH}
              height={FACTOR_HEIGHT}
              value={factor}
              index={index}
              selected={selected}
              onAdd={() =>
                handleAddFactor(index)
              }
              onRemove={() =>
                handleRemoveFactor(index)
              }
            />
          );
        }
      )}

      {/* =====================================
          CONTADOR DE FACTORES
      ====================================== */}

      <Text
        position={[
          0,
          -0.8,
          0,
        ]}
        fontSize={0.20}
        color={
          selectedFactors.length ===
          exponent
            ? "#16a34a"
            : "#64748b"
        }
        anchorX="center"
        anchorY="middle"
      >
        {selectedFactors.length} /{" "}
        {exponent} factores
      </Text>

      {/* =====================================
          OPERACIÓN PROGRESIVA
      ====================================== */}

      {progressiveSteps.length > 0 && (
        <group
          position={[
            0,
            operationStartY,
            0,
          ]}
        >
          {progressiveSteps.map(
            (step, index) => (
              <Text
                key={step.id}
                position={[
                  0,
                  -index * 0.42,
                  0,
                ]}
                fontSize={0.30}
                color="#475569"
                anchorX="center"
                anchorY="middle"
              >
                {step.expression}
              </Text>
            )
          )}
        </group>
      )}

      {/* =====================================
          EXPRESIÓN COMPLETA
      ====================================== */}

      {selectedFactors.length > 0 && (
        <Text
          position={[
            0,
            3,
            0,
          ]}
          fontSize={0.30}
          color="#475569"
          anchorX="center"
          anchorY="middle"
        >
          {selectedFactors.join(" × ")}
        </Text>
      )}

      {/* =====================================
          RESULTADO FINAL
      ====================================== */}

      {showResult && (
        <Text
          position={[
            0,
            2.55,
            0,
          ]}
          fontSize={0.42}
          color="#16a34a"
          anchorX="center"
          anchorY="middle"
        >
          {expandedExpression} ={" "}
          {correctAnswer}
        </Text>
      )}

      {/* =====================================
          EVALUACIÓN
      ====================================== */}

      {evaluate && (
        <Text
          position={[
            0,
            2,
            0,
          ]}
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
            : "Completa correctamente la potencia"}
        </Text>
      )}

    </group>
  );
}
