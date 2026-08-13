import { Text } from "@react-three/drei";
import { useState } from "react";

import SubtractionGroup from "./SubtractionGroup";

const START_Y = 0.8;
const RESULT_Y = -2;

const GROUP_WIDTH = 2.5;
const GROUP_GAP = 0.5;
const GROUP_HEIGHT = 1.8;

export default function SubtractionScene({
  evaluate,
  values = [],
}) {
  // =====================================
  // VALORES SEGUROS
  // =====================================

  const safeValues =
    Array.isArray(values) && values.length >= 2
      ? values.map((value) => {
          const number = Number(value);

          return Number.isFinite(number)
            ? Math.max(0, Math.floor(number))
            : 0;
        })
      : [8, 3];

  // =====================================
  // IMPORTANTE:
  // NO ORDENAR LOS VALORES
  // =====================================
  //
  // Si recibimos:
  //
  // 2 - 5
  //
  // debe continuar siendo:
  //
  // 2 - 5
  //
  // Nunca:
  //
  // 5 - 2
  // =====================================

  const operationValues = safeValues;

  // =====================================
  // OPERACIÓN
  // =====================================

  const minuend = operationValues[0];

  const subtractionValues =
    operationValues.slice(1);

  const totalToRemove =
    subtractionValues.reduce(
      (total, value) => total + value,
      0
    );

  const correctAnswer =
    minuend - totalToRemove;

  const isNegative =
    correctAnswer < 0;

  // =====================================
  // TOKENS INICIALES
  // =====================================

  const createInitialTokens = () => {
    const tokens = [];

    for (let i = 0; i < minuend; i++) {
      tokens.push({
        id: `token-${i}`,
        group: "available",
        position: null,
      });
    }

    return tokens;
  };

  const [tokens, setTokens] = useState(
    createInitialTokens
  );

  // =====================================
  // TOKEN ARRASTRADO
  // =====================================

  const [draggingToken, setDraggingToken] =
    useState(null);

  // =====================================
  // TOKENS DISPONIBLES
  // =====================================

  const availableTokens = tokens.filter(
    (token) =>
      token.group === "available"
  );

  // =====================================
  // TOKENS DE CADA GRUPO
  // =====================================

  const getRemovedTokens = (groupIndex) => {
    return tokens.filter(
      (token) =>
        token.group === `remove-${groupIndex}`
    );
  };

  // =====================================
  // TOTAL RETIRADO
  // =====================================

  const totalRemoved = tokens.filter(
    (token) =>
      typeof token.group === "string" &&
      token.group.startsWith("remove-")
  ).length;

  // =====================================
  // RETIRADOS POR GRUPO
  // =====================================

  const removedByGroup =
    subtractionValues.map((_, index) => {
      return getRemovedTokens(index + 1).length;
    });

  // =====================================
  // VALIDACIÓN NORMAL
  // =====================================
  //
  // Ejemplo:
  //
  // 5 - 2
  //
  // Quitar 1:
  // 2 / 2
  //
  // =====================================

  const normalOperationCorrect =
    removedByGroup.every(
      (removed, index) =>
        removed ===
        subtractionValues[index]
    );

  // =====================================
  // DÉFICIT PARA RESTAS NEGATIVAS
  // =====================================
  //
  // Ejemplo:
  //
  // 2 - 5 = -3
  //
  // Tenemos solamente 2 bolitas físicas.
  //
  // Después de retirar las 2:
  //
  // 2 / 5
  //
  // Faltan:
  //
  // 5 - 2 = 3
  //
  // Esas 3 unidades se representan
  // visualmente como déficit.
  // =====================================

  const negativeDeficit =
    isNegative
      ? totalToRemove - minuend
      : 0;

  // =====================================
  // EJERCICIO COMPLETADO
  // =====================================

  const exerciseCompleted =
    isNegative
      ? totalRemoved === minuend &&
        totalToRemove > minuend
      : normalOperationCorrect;

  // =====================================
  // POSICIÓN DE LOS GRUPOS
  // =====================================

  const getGroupX = (index) => {
    const groupCount =
      operationValues.length;

    const totalWidth =
      groupCount * GROUP_WIDTH +
      (groupCount - 1) * GROUP_GAP;

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

  // =====================================
  // DETERMINAR GRUPO DE DESTINO
  // =====================================

  const getDropGroup = (x, y) => {
    for (
      let index = 0;
      index < operationValues.length;
      index++
    ) {
      const groupX =
        getGroupX(index);

      const insideX =
        x >=
          groupX -
            GROUP_WIDTH / 2 &&
        x <=
          groupX +
            GROUP_WIDTH / 2;

      const insideY =
        y >=
          START_Y -
            GROUP_HEIGHT / 2 &&
        y <=
          START_Y +
            GROUP_HEIGHT / 2;

      if (insideX && insideY) {
        return index;
      }
    }

    return null;
  };

  // =====================================
  // SOLTAR TOKEN
  // =====================================

  const handleTokenDrop = (
    tokenId,
    x,
    y
  ) => {
    const targetGroup =
      getDropGroup(x, y);

    // =====================================
    // FUERA DE CUALQUIER GRUPO
    // =====================================

    if (targetGroup === null) {
      setTokens((previousTokens) =>
        previousTokens.map((token) =>
          token.id === tokenId
            ? {
                ...token,
                position: null,
              }
            : token
        )
      );

      return;
    }

    // =====================================
    // BUSCAR TOKEN
    // =====================================

    const tokenToMove =
      tokens.find(
        (token) =>
          token.id === tokenId
      );

    if (!tokenToMove) {
      return;
    }

    // =====================================
    // GRUPO 0
    // CANTIDAD INICIAL
    // =====================================
    //
    // Permite devolver una bolita:
    //
    // Quitar 1 → Cantidad inicial
    //
    // Esto permite corregir errores.
    // =====================================

    if (targetGroup === 0) {
      setTokens((previousTokens) =>
        previousTokens.map((token) =>
          token.id === tokenId
            ? {
                ...token,
                group: "available",
                position: null,
              }
            : token
        )
      );

      return;
    }

    // =====================================
    // GRUPO DE RESTA
    // =====================================
    //
    // No imponemos límite.
    //
    // Esto es importante porque el estudiante
    // puede equivocarse.
    //
    // Ejemplo:
    //
    // 5 - 2
    //
    // Puede poner:
    //
    // 3 bolitas en Quitar 1
    //
    // y el ejercicio será incorrecto.
    //
    // Después puede regresar una bolita.
    // =====================================

    setTokens((previousTokens) =>
      previousTokens.map((token) =>
        token.id === tokenId
          ? {
              ...token,
              group:
                `remove-${targetGroup}`,
              position: null,
            }
          : token
      )
    );
  };

  // =====================================
  // INICIO DEL DRAG
  // =====================================

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

  // =====================================
  // FIN DEL DRAG
  // =====================================

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
  // MOSTRAR RESULTADO
  // =====================================
  //
  // Solo después de completar
  // correctamente la representación.
  //
  // =====================================

  const showResult =
    exerciseCompleted;

  // =====================================
  // ANCHO DEL RESULTADO
  // =====================================

  const resultWidth =
    Math.min(
      Math.max(
        Math.max(
          Math.abs(correctAnswer),
          1
        ) * 0.45,
        3
      ),
      7
    );

  // =====================================
  // TOKENS DEL RESULTADO
  // =====================================
  //
  // Para resultados positivos mostramos
  // las bolitas que quedaron disponibles.
  //
  // Para negativos las bolitas rojas
  // se dibujan aparte.
  // =====================================

  const resultTokens =
    showResult && !isNegative
      ? availableTokens
      : [];

  // =====================================
  // RENDER
  // =====================================

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
        Resta
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
        {operationValues.join(" − ")} ={" "}
        {showResult
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
        Arrastra las bolitas que debes quitar
      </Text>

      {/* =====================================
          GRUPOS DE LA RESTA
      ====================================== */}

      {operationValues.map(
        (value, index) => {
          const isInitial =
            index === 0;

          return (
            <SubtractionGroup
              key={`subtraction-group-${index}`}
              x={getGroupX(index)}
              y={START_Y}
              width={GROUP_WIDTH}
              height={GROUP_HEIGHT}
              label={
                isInitial
                  ? "Cantidad inicial"
                  : `Quitar ${index}`
              }
              value={value}
              tokens={
                isInitial
                  ? availableTokens
                  : getRemovedTokens(index)
              }
              onTokenMove={
                handleTokenMove
              }
              onTokenDragStart={
                handleTokenDragStart
              }
              onTokenDragEnd={
                handleTokenDragEnd
              }
              onTokenDrop={
                handleTokenDrop
              }
              draggingToken={
                draggingToken
              }
              isInitial={
                isInitial
              }
            />
          );
        }
      )}

      {/* =====================================
          RESULTADO
      ====================================== */}

      <SubtractionGroup
        x={0}
        y={RESULT_Y}
        width={resultWidth}
        height={2}
        label="Resultado"
        value={
          showResult
            ? Math.abs(correctAnswer)
            : 0
        }
        tokens={resultTokens}
        isResult
      />

      {/* =====================================
          REPRESENTACIÓN NEGATIVA
      ===================================== */}
      //
      // Ejemplo:
      //
      // 2 - 5 = -3
      //
      // El estudiante retira:
      //
      // 🔵 🔵
      //
      // Como necesita retirar 5 pero
      // solamente existen 2, quedan
      // 3 unidades de déficit.
      //
      // Las mostramos como bolitas rojas.
      // =====================================

      {showResult &&
        isNegative &&
        Array.from({
          length: negativeDeficit,
        }).map((_, index) => {
          const spacing = 0.42;
          const columns = 4;

          const row =
            Math.floor(
              index / columns
            );

          const column =
            index % columns;

          const totalColumns =
            Math.min(
              columns,
              negativeDeficit
            );

          const rowWidth =
            (totalColumns - 1) *
            spacing;

          const x =
            column * spacing -
            rowWidth / 2;

          const y =
            RESULT_Y +
            0.35 -
            row * spacing;

          return (
            <mesh
              key={`negative-token-${index}`}
              position={[
                x,
                y,
                0.02,
              ]}
            >
              <sphereGeometry
                args={[
                  0.16,
                  32,
                  32,
                ]}
              />

              <meshStandardMaterial
                color="#dc2626"
                roughness={0.35}
                metalness={0.1}
              />
            </mesh>
          );
        })}

      {/* =====================================
          TEXTO EXPLICATIVO PARA NEGATIVOS
      ====================================== */}

      {showResult &&
        isNegative && (
          <Text
            position={[
              0,
              RESULT_Y - 1.64,
              0,
            ]}
            fontSize={0.20}
            color="#dc2626"
            anchorX="center"
            anchorY="middle"
          >
            Faltan {negativeDeficit} unidades
          </Text>
        )}

      {/* =====================================
          EVALUACIÓN
      ====================================== */}

      {evaluate && (
        <Text
          position={[0, -4, 0]}
          fontSize={0.32}
          color={
            exerciseCompleted
              ? "#16a34a"
              : "#dc2626"
          }
          anchorX="center"
          anchorY="middle"
        >
          {exerciseCompleted
            ? "¡Correcto!"
            : "La respuesta no es correcta. Puedes intentarlo nuevamente."}
        </Text>
      )}

    </group>
  );
}