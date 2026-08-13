import { Text } from "@react-three/drei";
import { useMemo, useState } from "react";

import DraggableToken from "./DraggableToken";
import DivisionGroup from "./DivisionGroup";

export default function DivisionScene({
  evaluate,
  values,
}) {
  // =====================================
  // VALORES
  // =====================================

  const dividend = Math.max(
    0,
    Number(values?.[0] ?? 0),
  );

  const divisor = Math.max(
    0,
    Number(values?.[1] ?? 0),
  );

  // =====================================
  // DIVISIÓN
  // =====================================

  const isValidDivision =
    divisor > 0;

  const quotient = isValidDivision
    ? Math.floor(dividend / divisor)
    : 0;

  const remainder = isValidDivision
    ? dividend % divisor
    : 0;

  // =====================================
  // TOKENS
  // =====================================

  const tokens = useMemo(() => {
    return Array.from(
      { length: dividend },
      (_, index) => ({
        id: index,
      }),
    );
  }, [dividend]);

  // =====================================
  // POSICIONES INICIALES
  // =====================================

  const getInitialPosition = (index) => {
    const columns = Math.min(
      dividend,
      8,
    );

    const spacing = 0.55;

    const row = Math.floor(
      index / columns,
    );

    const column =
      index % columns;

    const x =
      (column -
        (columns - 1) / 2) *
      spacing;

    const y =
      1.1 -
      row * spacing;

    return [x, y, 0.2];
  };

  // =====================================
  // POSICIONES
  // =====================================

  const [tokenPositions, setTokenPositions] =
    useState(() => {
      const positions = {};

      tokens.forEach((token) => {
        positions[token.id] =
          getInitialPosition(
            token.id,
          );
      });

      return positions;
    });

  // =====================================
  // GRUPOS
  // =====================================

  const [tokenGroups, setTokenGroups] =
    useState({});

  // =====================================
  // SOBRANTES
  // =====================================

  const [tokenRemainders, setTokenRemainders] =
    useState({});

  // =====================================
  // TOKEN ARRASTRADO
  // =====================================

  const [draggingTokenId, setDraggingTokenId] =
    useState(null);

  // =====================================
  // EVALUACIÓN
  // =====================================

  const [isCorrect, setIsCorrect] =
    useState(false);

  // =====================================
  // CONFIGURACIÓN VISUAL
  // =====================================

  const groupY = -0.4;

  const groupWidth = 1.8;
  const groupHeight = 1.35;

  const groupSpacing = 2.0;

  // Zona de sobrantes
  const remainderPosition = [
    0,
    -2.65,
    0,
  ];

  const remainderWidth = 4.5;
  const remainderHeight = 0.75;

  // =====================================
  // POSICIÓN DE LOS GRUPOS
  // =====================================

  const getGroupPosition = (
    groupId,
  ) => {
    const x =
      (groupId -
        (divisor - 1) / 2) *
      groupSpacing;

    return [
      x,
      groupY,
      0,
    ];
  };

  // =====================================
  // COLOR
  // =====================================

  const getEvaluationColor = () => {
    if (!evaluate) {
      return "#1976d2";
    }

    if (isCorrect) {
      return "#16a34a";
    }

    return "#dc2626";
  };

  // =====================================
  // MENSAJE
  // =====================================

  const getEvaluationMessage = () => {
    if (!evaluate) {
      return "";
    }

    if (isCorrect) {
      if (remainder > 0) {
        return `¡Correcto! Sobran ${remainder}.`;
      }

      return "¡Correcto!";
    }

    return "Organiza los objetos correctamente.";
  };

  // =====================================
  // INICIO DEL ARRASTRE
  // =====================================

  const handleTokenDragStart = (
    tokenId,
  ) => {
    setDraggingTokenId(tokenId);

    // Si estaba en un grupo,
    // lo retiramos.
    setTokenGroups((previous) => {
      const next = {
        ...previous,
      };

      delete next[tokenId];

      return next;
    });

    // Si estaba como sobrante,
    // lo retiramos.
    setTokenRemainders((previous) => {
      const next = {
        ...previous,
      };

      delete next[tokenId];

      return next;
    });

    setIsCorrect(false);
  };

  // =====================================
  // MOVIMIENTO
  // =====================================

  const handleTokenDrag = (
    tokenId,
    position,
  ) => {
    setTokenPositions(
      (previous) => ({
        ...previous,
        [tokenId]: position,
      }),
    );
  };

  // =====================================
  // DETECTAR GRUPO
  // =====================================

  const getGroupAtPosition = (
    position,
  ) => {
    const [x, y] = position;

    for (
      let groupId = 0;
      groupId < divisor;
      groupId++
    ) {
      const [
        groupX,
        groupYPosition,
      ] =
        getGroupPosition(
          groupId,
        );

      const insideX =
        x >=
          groupX -
            groupWidth / 2 &&
        x <=
          groupX +
            groupWidth / 2;

      const insideY =
        y >=
          groupYPosition -
            groupHeight / 2 &&
        y <=
          groupYPosition +
            groupHeight / 2;

      if (
        insideX &&
        insideY
      ) {
        return groupId;
      }
    }

    return null;
  };

  // =====================================
  // DETECTAR ZONA SOBRANTES
  // =====================================

  const isInsideRemainderZone = (
    position,
  ) => {
    const [x, y] = position;

    const [zoneX, zoneY] =
      remainderPosition;

    return (
      x >=
        zoneX -
          remainderWidth / 2 &&
      x <=
        zoneX +
          remainderWidth / 2 &&
      y >=
        zoneY -
          remainderHeight / 2 &&
      y <=
        zoneY +
          remainderHeight / 2
    );
  };

  // =====================================
  // POSICIÓN DENTRO DEL GRUPO
  // =====================================

  const getTokenPositionInGroup = (
    tokenId,
    groupId,
    allTokenGroups,
  ) => {
    const tokensInGroup =
      Object.entries(
        allTokenGroups,
      )
        .filter(
          ([, value]) =>
            value === groupId,
        )
        .map(
          ([key]) =>
            Number(key),
        );

    const index =
      tokensInGroup.indexOf(
        tokenId,
      );

    const columns = 4;
    const spacing = 0.38;

    const row = Math.floor(
      index / columns,
    );

    const column =
      index % columns;

    const columnsUsed = Math.min(
      columns,
      tokensInGroup.length,
    );

    const x =
      (column -
        (columnsUsed - 1) / 2) *
      spacing;

    const y =
      groupY +
      0.28 -
      row * spacing;

    const [
      groupX,
    ] =
      getGroupPosition(
        groupId,
      );

    return [
      groupX + x,
      y,
      0.25,
    ];
  };

  // =====================================
  // POSICIÓN DE SOBRANTE
  // =====================================

  const getRemainderPosition = (
    tokenId,
    allRemainders,
  ) => {
    const tokenIds =
      Object.keys(
        allRemainders,
      ).map(Number);

    const index =
      tokenIds.indexOf(
        tokenId,
      );

    const columns = 6;
    const spacing = 0.42;

    const row = Math.floor(
      index / columns,
    );

    const column =
      index % columns;

    const columnsUsed =
      Math.min(
        columns,
        tokenIds.length,
      );

    const x =
      (column -
        (columnsUsed - 1) / 2) *
      spacing;

    const y =
      remainderPosition[1] +
      0.02 -
      row * spacing;

    return [
      x,
      y,
      0.3,
    ];
  };

  // =====================================
  // FINAL DEL ARRASTRE
  // =====================================

  const handleTokenDragEnd = (
    tokenId,
    position,
  ) => {
    setDraggingTokenId(null);

    const groupId =
      getGroupAtPosition(
        position,
      );

    // ===================================
    // SI ESTÁ EN UN GRUPO
    // ===================================

    if (
      groupId !== null
    ) {
      setTokenGroups(
        (previous) => {
          const next = {
            ...previous,
            [tokenId]:
              groupId,
          };

          setTokenPositions(
            (previousPositions) => {
              const newPositions = {
                ...previousPositions,
              };

              Object.entries(
                next,
              ).forEach(
                ([
                  tokenIdString,
                  group,
                ]) => {
                  const id =
                    Number(
                      tokenIdString,
                    );

                  newPositions[id] =
                    getTokenPositionInGroup(
                      id,
                      group,
                      next,
                    );
                },
              );

              return newPositions;
            },
          );

          return next;
        },
      );

      setIsCorrect(false);

      return;
    }

    // ===================================
    // SI ESTÁ EN SOBRANTES
    // ===================================

    if (
      isInsideRemainderZone(
        position,
      )
    ) {
      setTokenRemainders(
        (previous) => {
          const next = {
            ...previous,
            [tokenId]: true,
          };

          setTokenPositions(
            (previousPositions) => {
              const newPositions = {
                ...previousPositions,
              };

              Object.keys(
                next,
              ).forEach(
                (tokenIdString) => {
                  const id =
                    Number(
                      tokenIdString,
                    );

                  newPositions[id] =
                    getRemainderPosition(
                      id,
                      next,
                    );
                },
              );

              return newPositions;
            },
          );

          return next;
        },
      );

      setIsCorrect(false);

      return;
    }

    // ===================================
    // FUERA DE TODO
    // ===================================

    setTokenPositions(
      (previous) => ({
        ...previous,
        [tokenId]:
          position,
      }),
    );

    setIsCorrect(false);
  };

  // =====================================
  // EVALUAR
  // =====================================

  const handleEvaluate = () => {
    if (
      !evaluate ||
      !isValidDivision
    ) {
      return;
    }

    // ===================================
    // CANTIDAD POR GRUPO
    // ===================================

    const groups =
      Array.from(
        {
          length: divisor,
        },
        (_, index) =>
          Object.values(
            tokenGroups,
          ).filter(
            (groupId) =>
              groupId ===
              index,
          ).length,
      );

    // ===================================
    // CANTIDAD DE SOBRANTES
    // ===================================

    const remainderCount =
      Object.keys(
        tokenRemainders,
      ).length;

    // ===================================
    // GRUPOS CORRECTOS
    // ===================================

    const groupsCorrect =
      groups.every(
        (count) =>
          count ===
          quotient,
      );

    // ===================================
    // SOBRANTES CORRECTOS
    // ===================================

    const remainderCorrect =
      remainderCount ===
      remainder;

    // ===================================
    // TODOS LOS TOKENS
    // ===================================

    const totalTokens =
      groups.reduce(
        (total, count) =>
          total + count,
        0,
      ) +
      remainderCount;

    const allTokensUsed =
      totalTokens ===
      dividend;

    // ===================================
    // RESULTADO FINAL
    // ===================================

    setIsCorrect(
      groupsCorrect &&
        remainderCorrect &&
        allTokensUsed,
    );
  };

  // =====================================
  // TEXTO DE RESULTADO
  // =====================================

  const resultText =
    !isValidDivision
      ? "Divisor inválido"
      : `${dividend} objetos · ${divisor} grupos`;

  // =====================================
  // RENDER
  // =====================================

  return (
    <group>

      {/* =====================================
          TÍTULO
      ====================================== */}

      <Text
        position={[0, 3.1, 0]}
        fontSize={0.32}
        color="#1976d2"
        anchorX="center"
        anchorY="middle"
      >
        División
      </Text>

      {/* =====================================
          OPERACIÓN
      ====================================== */}

      <Text
        position={[0, 2.55, 0]}
        fontSize={0.52}
        color="#172033"
        anchorX="center"
        anchorY="middle"
      >
        {dividend} ÷ {divisor} ={" "}
        {evaluate &&
        isCorrect
          ? quotient
          : "?"}
      </Text>

      {/* =====================================
          INSTRUCCIÓN
      ====================================== */}

      <Text
        position={[0, 2.05, 0]}
        fontSize={0.22}
        color="#64748b"
        anchorX="center"
        anchorY="middle"
      >
        Reparte los objetos en grupos iguales
      </Text>

      {/* =====================================
          OBJETOS
      ====================================== */}

      {tokens.map((token) => (
        <DraggableToken
          key={token.id}
          id={token.id}
          position={
            tokenPositions[
              token.id
            ] ??
            getInitialPosition(
              token.id,
            )
          }
          color={
            draggingTokenId ===
            token.id
              ? "#2563eb"
              : getEvaluationColor()
          }
          onDragStart={
            handleTokenDragStart
          }
          onDrag={
            handleTokenDrag
          }
          onDragEnd={
            handleTokenDragEnd
          }
        />
      ))}

      {/* =====================================
          GRUPOS
      ====================================== */}

      {isValidDivision &&
        Array.from(
          {
            length: divisor,
          },
          (_, index) => {
            const tokensInGroup =
              Object.entries(
                tokenGroups,
              )
                .filter(
                  ([, groupId]) =>
                    groupId ===
                    index,
                )
                .map(
                  ([tokenId]) =>
                    Number(
                      tokenId,
                    ),
                );

            return (
              <DivisionGroup
                key={index}
                id={index}
                position={getGroupPosition(
                  index,
                )}
                tokens={
                  tokensInGroup
                }
                capacity={
                  quotient
                }
              />
            );
          },
        )}

      {/* =====================================
          ZONA DE SOBRANTES
      ====================================== */}

      {isValidDivision &&
        remainder > 0 && (
          <group
            position={
              remainderPosition
            }
          >
            <mesh>
              <boxGeometry
                args={[
                  remainderWidth,
                  remainderHeight,
                  0.08,
                ]}
              />

              <meshStandardMaterial
                color="#fef3c7"
                transparent
                opacity={0.9}
              />
            </mesh>

            <Text
              position={[
                0,
                -0.55,
                0,
              ]}
              fontSize={0.20}
              color="#92400e"
              anchorX="center"
              anchorY="middle"
            >
              Sobrantes
            </Text>

            <Text
              position={[
                0,
                0,
                0.08,
              ]}
              fontSize={0.18}
              color="#92400e"
              anchorX="center"
              anchorY="middle"
            >
              {Object.keys(
                tokenRemainders,
              ).length}{" "}
              / {remainder}
            </Text>
          </group>
        )}

      {/* =====================================
          RESULTADO
      ====================================== */}

      <Text
        position={[
          0,
          -2.55,
          0,
        ]}
        fontSize={0.25}
        color="#475569"
        anchorX="center"
        anchorY="middle"
      >
        {resultText}
        {isValidDivision &&
          remainder > 0 &&
          ` · Sobran ${remainder}`}
      </Text>

      {/* =====================================
          MENSAJE
      ====================================== */}

      {evaluate && (
        <Text
          position={[
            0,
            -3.0,
            0,
          ]}
          fontSize={0.32}
          color={
            getEvaluationColor()
          }
          anchorX="center"
          anchorY="middle"
        >
          {getEvaluationMessage()}
        </Text>
      )}

      {/* =====================================
          BOTÓN EVALUAR
      ====================================== */}

      {evaluate && (
        <group
          position={[
            0,
            -4,
            0.5,
          ]}
          onClick={
            handleEvaluate
          }
        >
          <mesh>
            <boxGeometry
              args={[
                2.2,
                0.55,
                0.15,
              ]}
            />

            <meshStandardMaterial
              color="#1976d2"
            />
          </mesh>

          <Text
            position={[
              0,
              0,
              0.1,
            ]}
            fontSize={0.22}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
          >
            Evaluar
          </Text>
        </group>
      )}
    </group>
  );
}