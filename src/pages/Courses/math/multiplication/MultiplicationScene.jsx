import { Text } from "@react-three/drei";
import { useMemo, useState } from "react";

import MultiplicationToken from "./MultiplicationToken";
import MultiplicationGroup from "./MultiplicationGroup";

export default function MultiplicationScene({ evaluate, values = [] }) {
  // =====================================
  // VALORES
  // =====================================

  const safeValues =
    Array.isArray(values) && values.length > 0
      ? values
          .filter(
            (value) => value !== "" && value !== null && value !== undefined,
          )
          .map((value) => Math.max(0, Number(value)))
      : [2, 3];

  const groupCount = safeValues[0] ?? 2;

  const objectsPerGroup = safeValues
    .slice(1)
    .reduce((total, value) => total * value, 1);

  const correctAnswer = groupCount * objectsPerGroup;

  // =====================================
  // RESULTADO
  // =====================================

  // =====================================
  // TOKENS
  // =====================================

  const tokens = useMemo(() => {
    return Array.from(
      {
        length: correctAnswer,
      },
      (_, index) => ({
        id: index,
      }),
    );
  }, [correctAnswer]);

  // =====================================
  // CONFIGURACIÓN VISUAL
  // =====================================

  const groupWidth = 1.8;
  const groupHeight = 1.35;
  const groupSpacing = 2.1;
  const groupY = -0.7;

  // =====================================
  // POSICIONES INICIALES
  // =====================================

  const getInitialPosition = (index) => {
    const columns = Math.min(correctAnswer, 8);
    const spacing = 0.55;

    const row = Math.floor(index / columns);

    const column = index % columns;

    const x = (column - (columns - 1) / 2) * spacing;

    const y = 1.0 - row * spacing;

    return [x, y, 0.2];
  };

  // =====================================
  // POSICIONES DE LOS TOKENS
  // =====================================

  const [tokenPositions, setTokenPositions] = useState(() => {
    const positions = {};

    tokens.forEach((token) => {
      positions[token.id] = getInitialPosition(token.id);
    });

    return positions;
  });

  // =====================================
  // GRUPOS
  //
  // tokenId -> groupId
  // =====================================

  const [tokenGroups, setTokenGroups] = useState({});

  // =====================================
  // TOKEN ARRASTRADO
  // =====================================

  const [draggingTokenId, setDraggingTokenId] = useState(null);

  // =====================================
  // EVALUACIÓN
  // =====================================

  const [isCorrect, setIsCorrect] = useState(false);

  // =====================================
  // POSICIÓN DE LOS GRUPOS
  // =====================================

  const getGroupPosition = (groupId) => {
    const x = (groupId - (groupCount - 1) / 2) * groupSpacing;

    return [x, groupY, 0];
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
      return "¡Correcto!";
    }

    return "Organiza los grupos correctamente.";
  };

  // =====================================
  // INICIO DEL ARRASTRE
  // =====================================

  const operationExpression = safeValues.join(" × ");
  const handleTokenDragStart = (tokenId) => {
    setDraggingTokenId(tokenId);

    setTokenGroups((previous) => {
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

  const handleTokenDrag = (tokenId, position) => {
    setTokenPositions((previous) => ({
      ...previous,
      [tokenId]: position,
    }));
  };

  // =====================================
  // BUSCAR GRUPO
  // =====================================

  const getGroupAtPosition = (position) => {
    const [x, y] = position;

    for (let groupId = 0; groupId < groupCount; groupId++) {
      const [groupX, groupYPosition] = getGroupPosition(groupId);

      const insideX =
        x >= groupX - groupWidth / 2 && x <= groupX + groupWidth / 2;

      const insideY =
        y >= groupYPosition - groupHeight / 2 &&
        y <= groupYPosition + groupHeight / 2;

      if (insideX && insideY) {
        return groupId;
      }
    }

    return null;
  };

  // =====================================
  // POSICIÓN DENTRO DEL GRUPO
  // =====================================

  const getTokenPositionInGroup = (tokenId, groupId, allTokenGroups) => {
    const tokensInGroup = Object.entries(allTokenGroups)
      .filter(([, value]) => value === groupId)
      .map(([key]) => Number(key));

    const index = tokensInGroup.indexOf(tokenId);

    const columns = 4;
    const spacing = 0.38;

    const row = Math.floor(index / columns);

    const column = index % columns;

    const x =
      (column - (Math.min(columns, tokensInGroup.length) - 1) / 2) * spacing;

    const y = groupY + 0.25 - row * spacing;

    const [groupX] = getGroupPosition(groupId);

    return [groupX + x, y, 0.25];
  };

  // =====================================
  // FINAL DEL ARRASTRE
  // =====================================

  const handleTokenDragEnd = (tokenId, position) => {
    setDraggingTokenId(null);

    const groupId = getGroupAtPosition(position);

    // ===================================
    // NO SOLTÓ EN UN GRUPO
    // ===================================

    if (groupId === null) {
      setTokenPositions((previous) => ({
        ...previous,
        [tokenId]: position,
      }));

      setIsCorrect(false);

      return;
    }

    // ===================================
    // GUARDAR GRUPO
    // ===================================

    setTokenGroups((previous) => {
      const next = {
        ...previous,
        [tokenId]: groupId,
      };

      // =================================
      // REUBICAR TOKENS
      // =================================

      setTokenPositions((previousPositions) => {
        const newPositions = {
          ...previousPositions,
        };

        Object.entries(next).forEach(([tokenIdString, group]) => {
          const id = Number(tokenIdString);

          newPositions[id] = getTokenPositionInGroup(id, group, next);
        });

        return newPositions;
      });

      return next;
    });

    setIsCorrect(false);
  };

  // =====================================
  // EVALUAR
  // =====================================

  const handleEvaluate = () => {
    if (!evaluate) {
      return;
    }

    // ===================================
    // CANTIDAD DE TOKENS POR GRUPO
    // ===================================

    const groups = Array.from(
      {
        length: groupCount,
      },
      (_, index) => {
        return Object.values(tokenGroups).filter((groupId) => groupId === index)
          .length;
      },
    );

    // ===================================
    // CADA GRUPO DEBE TENER FACTORB
    // ===================================

    const allGroupsCorrect = groups.every((count) => count === objectsPerGroup);

    // ===================================
    // TODOS LOS TOKENS UTILIZADOS
    // ===================================

    const totalTokens = groups.reduce((total, count) => total + count, 0);

    const correct = allGroupsCorrect && totalTokens === correctAnswer;

    setIsCorrect(correct);
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
        position={[0, 3.1, 0]}
        fontSize={0.32}
        color="#1976d2"
        anchorX="center"
        anchorY="middle"
      >
        Multiplicación
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
        {operationExpression} = {evaluate && isCorrect ? correctAnswer : "?"}
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
        Forma grupos iguales
      </Text>

      {/* =====================================
          TOKENS
      ====================================== */}

      {tokens.map((token) => (
        <MultiplicationToken
          key={token.id}
          id={token.id}
          position={tokenPositions[token.id] ?? getInitialPosition(token.id)}
          color={
            draggingTokenId === token.id ? "#2563eb" : getEvaluationColor()
          }
          onDragStart={handleTokenDragStart}
          onDrag={handleTokenDrag}
          onDragEnd={handleTokenDragEnd}
        />
      ))}

      {/* =====================================
          GRUPOS
      ====================================== */}

      {Array.from(
        {
          length: groupCount,
        },
        (_, index) => {
          const tokensInGroup = Object.entries(tokenGroups)
            .filter(([, groupId]) => groupId === index)
            .map(([tokenId]) => Number(tokenId));

          return (
            <MultiplicationGroup
              key={index}
              id={index}
              position={getGroupPosition(index)}
              tokens={tokensInGroup}
              capacity={objectsPerGroup}
            />
          );
        },
      )}

      {/* =====================================
          INFORMACIÓN
      ====================================== */}

      <Text
        position={[0, -3.05, 0]}
        fontSize={0.25}
        color="#475569"
        anchorX="center"
        anchorY="middle"
      >
        {groupCount} grupos · {objectsPerGroup} objetos por grupo
      </Text>

      {/* =====================================
          MENSAJE
      ====================================== */}

      {evaluate && (
        <Text
          position={[0, -2.55, 0]}
          fontSize={0.32}
          color={getEvaluationColor()}
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
        <group position={[0, -4.05, 0]} onClick={handleEvaluate}>
          <mesh>
            <boxGeometry args={[2.2, 0.55, 0.15]} />

            <meshStandardMaterial color="#1976d2" />
          </mesh>

          <Text
            position={[0, 0, 0.1]}
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
