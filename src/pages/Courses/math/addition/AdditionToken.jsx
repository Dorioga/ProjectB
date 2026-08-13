import { useRef, useState } from "react";
import * as THREE from "three";

export default function AdditionToken({
  position = [0, 0, 0],
  onDragStart,
  onMove,
  onDragEnd,
}) {
  const [isDragging, setIsDragging] = useState(false);

  const tokenRef = useRef();

  // Plano horizontal donde se moverán las bolitas
  const dragPlane = useRef(
    new THREE.Plane(
      new THREE.Vector3(0, 0, 1),
      0
    )
  ).current;

  const intersectionPoint = useRef(
    new THREE.Vector3()
  ).current;

  // =====================================
  // OBTENER POSICIÓN DEL PUNTERO
  // =====================================

  const getPointerPosition = (event) => {
    if (!event.ray) {
      return null;
    }

    const intersection =
      event.ray.intersectPlane(
        dragPlane,
        intersectionPoint
      );

    if (!intersection) {
      return null;
    }

    return {
      x: intersection.x,
      y: intersection.y,
    };
  };

  // =====================================
  // INICIAR ARRASTRE
  // =====================================

  const handlePointerDown = (event) => {
    event.stopPropagation();

    const point =
      getPointerPosition(event);

    if (!point) {
      return;
    }

    setIsDragging(true);

    event.target.setPointerCapture(
      event.pointerId
    );

    onDragStart?.(
      point.x,
      point.y
    );
  };

  // =====================================
  // MOVER
  // =====================================

  const handlePointerMove = (event) => {
    if (!isDragging) {
      return;
    }

    event.stopPropagation();

    const point =
      getPointerPosition(event);

    if (!point) {
      return;
    }

    onMove?.(
      point.x,
      point.y
    );
  };

  // =====================================
  // SOLTAR
  // =====================================

  const handlePointerUp = (event) => {
    event.stopPropagation();

    const point =
      getPointerPosition(event);

    setIsDragging(false);

    if (point) {
      onDragEnd?.(
        point.x,
        point.y
      );
    }

    if (
      event.target.hasPointerCapture(
        event.pointerId
      )
    ) {
      event.target.releasePointerCapture(
        event.pointerId
      );
    }
  };

  return (
    <mesh
      ref={tokenRef}
      position={position}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      scale={isDragging ? 1.15 : 1}
    >
      <sphereGeometry
        args={[0.16, 32, 32]}
      />

      <meshStandardMaterial
        color={
          isDragging
            ? "#16a34a"
            : "#1976d2"
        }
        roughness={0.35}
        metalness={0.1}
      />
    </mesh>
  );
}