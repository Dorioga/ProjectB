import { useState } from "react";
import * as THREE from "three";

export default function SubtractionToken({
  position = [0, 0, 0],
  onDragStart,
  onMove,
  onDrop,
}) {
  const [isDragging, setIsDragging] = useState(false);

  // =====================================
  // OBTENER POSICIÓN SOBRE EL PLANO
  // =====================================

  const getPointerPosition = (event) => {
    const plane = new THREE.Plane(
      new THREE.Vector3(0, 0, 1),
      0
    );

    const point = new THREE.Vector3();

    event.ray.intersectPlane(
      plane,
      point
    );

    return {
      x: point.x,
      y: point.y,
    };
  };

  // =====================================
  // INICIO DRAG
  // =====================================

  const handlePointerDown = (event) => {
    event.stopPropagation();

    setIsDragging(true);

    const { x, y } =
      getPointerPosition(event);

    onDragStart?.(x, y);

    event.currentTarget.setPointerCapture(
      event.pointerId
    );
  };

  // =====================================
  // MOVIMIENTO
  // =====================================

  const handlePointerMove = (event) => {
    if (!isDragging) {
      return;
    }

    event.stopPropagation();

    const { x, y } =
      getPointerPosition(event);

    onMove?.(x, y);
  };

  // =====================================
  // FIN DRAG
  // =====================================

  const handlePointerUp = (event) => {
    if (!isDragging) {
      return;
    }

    event.stopPropagation();

    const { x, y } =
      getPointerPosition(event);

    setIsDragging(false);

    onDrop?.(x, y);

    event.currentTarget.releasePointerCapture(
      event.pointerId
    );
  };

  // =====================================
  // RENDER
  // =====================================

  return (
    <mesh
      position={position}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      scale={isDragging ? 1.2 : 1}
    >
      <sphereGeometry
        args={[0.16, 32, 32]}
      />

      <meshStandardMaterial
        color={
          isDragging
            ? "#dc2626"
            : "#1976d2"
        }
        roughness={0.35}
        metalness={0.1}
      />
    </mesh>
  );
}