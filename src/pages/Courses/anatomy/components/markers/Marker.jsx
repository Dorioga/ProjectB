import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef, useState, useEffect } from "react";
import * as THREE from "three";

export default function Marker({ position, title, onClick, selected }) {
  const ref = useRef();
  const waveRef = useRef();
  const [mobile, setMobile] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [wave, setWave] = useState(false);

  useFrame(({ clock }) => {
    const scale = 1 + Math.sin(clock.elapsedTime * 3) * 0.08;

    if (ref.current) {
      ref.current.scale.set(scale, scale, scale);
    }

    if (wave && waveRef.current) {
      waveRef.current.scale.x += 0.04;
      waveRef.current.scale.y += 0.04;

      const material = waveRef.current.material;
      material.opacity -= 0.03;

      if (material.opacity <= 0) {
        material.opacity = 1;
        waveRef.current.scale.set(1, 1, 1);
        setWave(false);
      }
    }
  });

  useEffect(() => {
    const checkMobile = () => {
      setMobile(window.innerWidth < 768);
    };

    checkMobile();

    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  return (
    <group position={position}>
      {/* Onda */}
      {wave && (
        <mesh ref={waveRef} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.07, 0.085, 64]} />
          <meshBasicMaterial
            color="#1976d2"
            transparent
            opacity={1}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Marcador */}
      <mesh
        ref={ref}
        onClick={onClick}
        onPointerOver={() => {
          setHovered(true);
          setWave(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = "default";
        }}
      >
        <sphereGeometry args={[0.03, 32, 32]} />

        <meshStandardMaterial color={hovered ? "#1976d2" : "#FF8D0D"} />
      </mesh>

      {/* Tooltip */}
      {(hovered || selected) && (
        <Html
          sprite={!mobile}
          position={mobile ? undefined : [0.05, 0.12, 0]}
          distanceFactor={mobile ? undefined : 3}
        >
          <div
            style={{
              background: "#1f2937",
              color: "#fff",
              padding: "6px 12px",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: "500",
              whiteSpace: "nowrap",
              pointerEvents: "none",
              userSelect: "none",
              boxShadow: "0 4px 12px rgba(0,0,0,.25)",
              border: "1px solid rgba(255,255,255,.1)",
            }}
          >
            {title}
          </div>
        </Html>
      )}
    </group>
  );
}