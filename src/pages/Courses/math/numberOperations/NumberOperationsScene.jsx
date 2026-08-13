import { Line, Text } from "@react-three/drei";
import { useRef, useState } from "react";
import * as THREE from "three";

const VISUAL_MIN = -6;
const VISUAL_MAX = 6;

const START_NUMBER = 0;

export default function NumberOperationsScene({
  evaluate,
  operation,
  values = [],
}) {
  const [currentPosition, setCurrentPosition] = useState(START_NUMBER);
  const [isDragging, setIsDragging] = useState(false);
  

  const planeRef = useRef();


  // =====================================
  // VALORES
  // =====================================

  const safeValues =
  Array.isArray(values) && values.length > 0
    ? values.map((value) => Number(value))
    : [2, 5];

  // =====================================
  // SÍMBOLO DE OPERACIÓN
  // =====================================

  const getOperationSymbol = () => {
    switch (operation) {
      case "addition":
        return "+";

      case "subtraction":
        return "−";

      case "multiplication":
        return "×";

      case "division":
        return "÷";

      default:
        return "+";
    }
  };

  const OPERATION_SYMBOL = getOperationSymbol();

  // =====================================
  // TÍTULO DE OPERACIÓN
  // =====================================

  const getOperationTitle = () => {
    switch (operation) {
      case "addition":
        return "Suma";

      case "subtraction":
        return "Resta";

      case "multiplication":
        return "Multiplicación";

      case "division":
        return "División";

      default:
        return "Operación";
    }
  };

  const OPERATION_TITLE = getOperationTitle();

  // =====================================
  // RESULTADO
  // =====================================

  const calculateResult = () => {
  if (safeValues.length === 0) {
    return 0;
  }

  switch (operation) {
    case "addition":
      return safeValues.reduce(
        (total, value) => total + Number(value),
        0
      );

    case "subtraction":
      return safeValues.slice(1).reduce(
        (total, value) => total - Number(value),
        safeValues[0]
      );

    case "multiplication":
      return safeValues.reduce(
        (total, value) => total * Number(value),
        1
      );

    case "division":
      if (safeValues.length < 2) {
        return 0;
      }

      if (Number(safeValues[1]) === 0) {
        return 0;
      }

      return Number(safeValues[0]) / Number(safeValues[1]);

    default:
      return 0;
  }
};

  const CORRECT_ANSWER = calculateResult();

  // =====================================
  // RANGO DE LA RECTA
  // =====================================

  /*
   * El rango se calcula a partir del resultado.
   *
   * Ejemplo:
   *
   * 0 + 5
   * → -1 hasta 6
   *
   * 0 + 100
   * → -10 hasta 110
   *
   * -20
   * → -30 hasta 10
   */

 const calculateRange = () => {
  const result = CORRECT_ANSWER;

  const allValues = [
    START_NUMBER,
    result,
    ...safeValues,
  ].map(Number);

  const minValue = Math.min(...allValues);
  const maxValue = Math.max(...allValues);

  /*
   * Queremos que exista espacio visual
   * después del resultado.
   *
   * Ejemplo:
   *
   * resultado 5 → hasta 7
   * resultado 6 → hasta 8
   * resultado 10 → hasta 12
   */

  let padding = 2;

  /*
   * Para números grandes aumentamos
   * proporcionalmente el espacio.
   */

  if (Math.abs(maxValue) > 20) {
    padding = Math.ceil(Math.abs(maxValue) * 0.1);
  }

  if (Math.abs(minValue) > 20) {
    padding = Math.max(
      padding,
      Math.ceil(Math.abs(minValue) * 0.1)
    );
  }

  let min = minValue - padding;
  let max = maxValue + padding;

  /*
   * El 0 siempre debe estar visible.
   */

  min = Math.min(min, 0);
  max = Math.max(max, 0);

  return {
    min: Math.floor(min),
    max: Math.ceil(max),
  };
};

  const { min: MIN_NUMBER, max: MAX_NUMBER } = calculateRange();

  const RANGE = MAX_NUMBER - MIN_NUMBER;

  // =====================================
  // CONVERSIÓN VALOR → POSICIÓN VISUAL
  // =====================================

  const valueToX = (value) => {
    if (RANGE === 0) {
      return 0;
    }

    const percentage =
      (value - MIN_NUMBER) / RANGE;

    return (
      VISUAL_MIN +
      percentage * (VISUAL_MAX - VISUAL_MIN)
    );
  };

  // =====================================
  // CONVERSIÓN POSICIÓN VISUAL → VALOR
  // =====================================

  const xToValue = (x) => {
    const clampedX = THREE.MathUtils.clamp(
      x,
      VISUAL_MIN,
      VISUAL_MAX,
    );

    const percentage =
      (clampedX - VISUAL_MIN) /
      (VISUAL_MAX - VISUAL_MIN);

    const value =
      MIN_NUMBER + percentage * RANGE;

    return Math.round(value);
  };

  // =====================================
  // COLOR DE LA ESFERA
  // =====================================

  const getPointColor = () => {
    if (!evaluate) {
      return "#1976d2";
    }

    if (currentPosition === CORRECT_ANSWER) {
      return "#16a34a";
    }

    return "#dc2626";
  };

  // =====================================
  // MENSAJE DE EVALUACIÓN
  // =====================================

  const getEvaluationMessage = () => {
    if (!evaluate) {
      return "";
    }

    if (currentPosition === CORRECT_ANSWER) {
      return "¡Correcto!";
    }

    return "Incorrecto. Intenta llegar al resultado.";
  };

  // =====================================
  // MOVIMIENTO
  // =====================================

  const movePoint = (event) => {
    if (!isDragging) {
      return;
    }

    const value = xToValue(event.point.x);

    setCurrentPosition(value);
  };

  // =====================================
  // INICIO DEL ARRASTRE
  // =====================================

  const handlePointerDown = (event) => {
    event.stopPropagation();

    setIsDragging(true);

    const value = xToValue(event.point.x);

    setCurrentPosition(value);
  };

  // =====================================
  // FINAL DEL ARRASTRE
  // =====================================

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  // =====================================
  // GENERAR MARCAS
  // =====================================

  // =====================================
// GENERAR MARCAS
// =====================================

const getTickStep = () => {
  /*
   * Rangos pequeños:
   *
   * 0 - 5
   * 0 - 10
   * -5 - 10
   *
   * mostramos todos los números.
   */

  if (RANGE <= 20) {
    return 1;
  }

  /*
   * Rangos medianos
   */

  if (RANGE <= 50) {
    return 2;
  }

  if (RANGE <= 100) {
    return 5;
  }

  if (RANGE <= 500) {
    return 10;
  }

  if (RANGE <= 1000) {
    return 50;
  }

  /*
   * Rangos grandes
   *
   * Intentamos mantener aproximadamente
   * 15 marcas visibles.
   */

  const rawStep = RANGE / 15;

  const magnitude =
    Math.pow(
      10,
      Math.floor(Math.log10(rawStep)),
    );

  const normalized =
    rawStep / magnitude;

  let niceStep;

  if (normalized <= 1) {
    niceStep = 1;
  } else if (normalized <= 2) {
    niceStep = 2;
  } else if (normalized <= 5) {
    niceStep = 5;
  } else {
    niceStep = 10;
  }

  return niceStep * magnitude;
};

  const TICK_STEP = getTickStep();

  // =====================================
  // MARCAS PRINCIPALES
  // =====================================

  const ticks = [];

  /*
   * Siempre incluimos 0.
   */

  for (
    let number = MIN_NUMBER;
    number <= MAX_NUMBER;
    number += TICK_STEP
  ) {
    ticks.push(number);
  }

  if (!ticks.includes(0)) {
    ticks.push(0);
  }

  if (!ticks.includes(CORRECT_ANSWER)) {
    if (
      CORRECT_ANSWER >= MIN_NUMBER &&
      CORRECT_ANSWER <= MAX_NUMBER
    ) {
      ticks.push(CORRECT_ANSWER);
    }
  }

  ticks.sort((a, b) => a - b);

  // =====================================
  // REPRESENTACIÓN DE LA OPERACIÓN
  // =====================================

  const operationExpression = safeValues.join(
    ` ${OPERATION_SYMBOL} `,
  );

  return (
    <group>
      {/* =====================================
          TÍTULO
      ====================================== */}

      <Text
        position={[0, 2.65, 0]}
        fontSize={0.28}
        color="#1976d2"
        anchorX="center"
        anchorY="middle"
      >
        {OPERATION_TITLE}
      </Text>

      {/* =====================================
          OPERACIÓN
      ====================================== */}

      <Text
        position={[0, 2.2, 0]}
        fontSize={0.42}
        color="#172033"
        anchorX="center"
        anchorY="middle"
      >
        {operationExpression} ={" "}
        {evaluate &&
        currentPosition === CORRECT_ANSWER
          ? CORRECT_ANSWER
          : "?"}
      </Text>

      {/* =====================================
          INSTRUCCIÓN
      ====================================== */}

      <Text
        position={[0, 1.7, 0]}
        fontSize={0.22}
        color="#64748b"
        anchorX="center"
        anchorY="middle"
      >
        Arrastra el punto hasta el resultado
      </Text>

      {/* =====================================
          PLANO INTERACTIVO
      ====================================== */}

      <mesh
        ref={planeRef}
        position={[0, 0, -0.1]}
        rotation={[-Math.PI / 2, 0, 0]}
        onPointerMove={movePoint}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
      >
        <planeGeometry
          args={[12, 3]}
        />

        <meshBasicMaterial
          transparent
          opacity={0}
        />
      </mesh>

      {/* =====================================
          RECTA NUMÉRICA
      ====================================== */}

      <Line
        points={[
          [VISUAL_MIN, 0, 0],
          [VISUAL_MAX, 0, 0],
        ]}
        lineWidth={3}
        color="#334155"
      />

      {/* =====================================
          FLECHA IZQUIERDA
      ====================================== */}

      <Line
        points={[
          [VISUAL_MIN, 0, 0],
          [VISUAL_MIN + 0.25, 0.12, 0],
        ]}
        lineWidth={2}
        color="#334155"
      />

      <Line
        points={[
          [VISUAL_MIN, 0, 0],
          [VISUAL_MIN + 0.25, -0.12, 0],
        ]}
        lineWidth={2}
        color="#334155"
      />

      {/* =====================================
          FLECHA DERECHA
      ====================================== */}

      <Line
        points={[
          [VISUAL_MAX, 0, 0],
          [VISUAL_MAX - 0.25, 0.12, 0],
        ]}
        lineWidth={2}
        color="#334155"
      />

      <Line
        points={[
          [VISUAL_MAX, 0, 0],
          [VISUAL_MAX - 0.25, -0.12, 0],
        ]}
        lineWidth={2}
        color="#334155"
      />

      {/* =====================================
          MARCAS Y NÚMEROS
      ====================================== */}

      {ticks.map((number) => {
        const x = valueToX(number);

        return (
          <group key={`tick-${number}`}>
            <mesh
              position={[x, 0, 0]}
            >
              <boxGeometry
                args={[0.035, 0.25, 0.08]}
              />

              <meshStandardMaterial
                color="#475569"
              />
            </mesh>

            <Text
              position={[x, -0.45, 0]}
              fontSize={
                RANGE <= 20 ? 0.25 : 0.2
              }
              color="#1e293b"
              anchorX="center"
              anchorY="middle"
            >
              {number}
            </Text>
          </group>
        );
      })}

      {/* =====================================
          PUNTO INICIAL
      ====================================== */}

      <mesh
        position={[
          valueToX(START_NUMBER),
          0.35,
          0,
        ]}
      >
        <sphereGeometry
          args={[0.15, 32, 32]}
        />

        <meshStandardMaterial
          color="#94a3b8"
        />
      </mesh>

      {/* =====================================
          PUNTO ARRASTRABLE
      ====================================== */}

      <mesh
        position={[
          valueToX(currentPosition),
          0.35,
          0,
        ]}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerMove={movePoint}
      >
        <sphereGeometry
          args={[0.24, 32, 32]}
        />

        <meshStandardMaterial
          color={getPointColor()}
          roughness={0.35}
          metalness={0.1}
        />
      </mesh>

      {/* =====================================
          INDICADOR DE POSICIÓN
      ====================================== */}

      <Text
        position={[
          valueToX(currentPosition),
          0.85,
          0,
        ]}
        fontSize={0.28}
        color={getPointColor()}
        anchorX="center"
        anchorY="middle"
      >
        {currentPosition}
      </Text>

      {/* =====================================
          SALTOS
      ====================================== */}

      {currentPosition !== START_NUMBER &&
        (() => {
          const difference =
            currentPosition - START_NUMBER;

          const direction =
            difference > 0 ? 1 : -1;

          const amount =
            Math.abs(difference);

          /*
           * Para rangos pequeños mostramos
           * cada salto.
           *
           * Para rangos grandes agrupamos
           * visualmente los saltos para que
           * no se vuelva ilegible.
           */

          const jumpStep =
            amount <= 20
              ? 1
              : Math.ceil(amount / 10);

          const jumps = [];

          let from = START_NUMBER;

          while (
            direction > 0
              ? from < currentPosition
              : from > currentPosition
          ) {
            const remaining =
              Math.abs(
                currentPosition - from,
              );

            const jump = Math.min(
              jumpStep,
              remaining,
            );

            const to =
              from + direction * jump;

            jumps.push({
              from,
              to,
            });

            from = to;
          }

          return jumps.map((jump, index) => {
            const fromX = valueToX(jump.from);
            const toX = valueToX(jump.to);

            const jumpValue =
              jump.to - jump.from;

            return (
              <group
                key={`jump-${index}`}
              >
                <Line
                  points={[
                    [fromX, 0.95, 0],
                    [toX, 0.95, 0],
                  ]}
                  lineWidth={3}
                  color={
                    direction > 0
                      ? "#16a34a"
                      : "#dc2626"
                  }
                />

                <Text
                  position={[
                    (fromX + toX) / 2,
                    1.15,
                    0,
                  ]}
                  fontSize={0.18}
                  color={
                    direction > 0
                      ? "#16a34a"
                      : "#dc2626"
                  }
                  anchorX="center"
                  anchorY="middle"
                >
                  {jumpValue > 0
                    ? `+${jumpValue}`
                    : jumpValue}
                </Text>
              </group>
            );
          });
        })()}

      {/* =====================================
          MENSAJE DE EVALUACIÓN
      ====================================== */}

      {evaluate && (
        <Text
          position={[0, -1.25, 0]}
          fontSize={0.32}
          color={getPointColor()}
          anchorX="center"
          anchorY="middle"
        >
          {getEvaluationMessage()}
        </Text>
      )}
    </group>
  );
}