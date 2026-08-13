import { useState } from "react";
import * as THREE from "three";

export default function DraggableToken({
  id,
  position = [0, 0, 0],
  color = "#1976d2",
  onDragStart,
  onDrag,
  onDragEnd,
}) {
  const [isDragging, setIsDragging] =
    useState(false);

  const getWorldPosition = (event) => {
    const plane = new THREE.Plane(
      new THREE.Vector3(0, 0, 1),
      0,
    );

    const point =
      new THREE.Vector3();

    event.ray.intersectPlane(
      plane,
      point,
    );

    return [
      point.x,
      point.y,
      0.2,
    ];
  };

  const handlePointerDown = (
    event,
  ) => {
    event.stopPropagation();

    setIsDragging(true);

    event.target.setPointerCapture(
      event.pointerId,
    );

    onDragStart?.(id);
  };

  const handlePointerMove = (
    event,
  ) => {
    if (!isDragging) return;

    event.stopPropagation();

    const newPosition =
      getWorldPosition(event);

    onDrag?.(
      id,
      newPosition,
    );
  };

  const handlePointerUp = (
    event,
  ) => {
    event.stopPropagation();

    const finalPosition =
      getWorldPosition(event);

    setIsDragging(false);

    try {
      event.target.releasePointerCapture(
        event.pointerId,
      );
    } catch {
      // El puntero puede haber perdido la captura.
    }

    onDragEnd?.(
      id,
      finalPosition,
    );
  };

  return (
    <mesh
      position={position}
      onPointerDown={
        handlePointerDown
      }
      onPointerMove={
        handlePointerMove
      }
      onPointerUp={
        handlePointerUp
      }
      scale={
        isDragging ? 1.2 : 1
      }
      renderOrder={10}
    >
      <sphereGeometry
        args={[0.18, 32, 32]}
      />

      <meshStandardMaterial
        color={color}
        roughness={0.35}
        metalness={0.1}
      />
    </mesh>
  );
}