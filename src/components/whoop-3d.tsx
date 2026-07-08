"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Float, RoundedBox } from "@react-three/drei";
import type { Group, MeshStandardMaterial } from "three";

/**
 * An original 3D model in the familiar silhouette of a fitness strap: a knit
 * band loop, a rounded sensor pod, and a pulsing status LED. Modeled from
 * primitives (no third party assets), lit for the paper background, slowly
 * rotating with a gentle float.
 */
function StrapModel() {
  const group = useRef<Group>(null);
  const led = useRef<MeshStandardMaterial>(null);

  useFrame((state, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.35;
    if (led.current) {
      const t = state.clock.elapsedTime;
      led.current.emissiveIntensity = 1.6 + Math.sin(t * 2.4) * 1.2;
    }
  });

  return (
    <group ref={group} rotation={[0.5, 0.6, 0.1]}>
      {/* knit band loop, slightly ovaled like a wrist */}
      <mesh scale={[1, 1, 0.85]}>
        <torusGeometry args={[1.55, 0.3, 32, 96]} />
        <meshStandardMaterial color="#3a4046" roughness={0.85} metalness={0.05} />
      </mesh>

      {/* band ridge lines to suggest the woven texture */}
      {[-0.12, 0, 0.12].map((offset) => (
        <mesh key={offset} scale={[1, 1, 0.85]} position={[0, 0, offset]}>
          <torusGeometry args={[1.55 + (offset === 0 ? 0.301 : 0.29), 0.012, 8, 96]} />
          <meshStandardMaterial color="#565e66" roughness={0.8} />
        </mesh>
      ))}

      {/* sensor pod on top of the band */}
      <group position={[0, 1.86, 0]} rotation={[0, 0, 0]}>
        <RoundedBox args={[0.95, 0.42, 1.35]} radius={0.16} smoothness={6}>
          <meshStandardMaterial color="#22262b" roughness={0.28} metalness={0.55} />
        </RoundedBox>
        {/* clasp lip where the band threads through */}
        <RoundedBox args={[1.0, 0.14, 0.5]} radius={0.06} smoothness={4} position={[0, -0.12, 0.85]}>
          <meshStandardMaterial color="#2b3036" roughness={0.45} metalness={0.4} />
        </RoundedBox>
        {/* status LED */}
        <mesh position={[0, 0.225, 0.32]} rotation={[-Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.045, 0.045, 0.02, 24]} />
          <meshStandardMaterial
            ref={led}
            color="#0d3321"
            emissive="#22c55e"
            emissiveIntensity={1.6}
            toneMapped={false}
          />
        </mesh>
      </group>

      {/* underside optical sensor dots, visible as it rotates */}
      <group position={[0, -1.83, 0]} rotation={[Math.PI, 0, 0]}>
        <RoundedBox args={[0.7, 0.18, 0.9]} radius={0.09} smoothness={4}>
          <meshStandardMaterial color="#282d33" roughness={0.4} metalness={0.4} />
        </RoundedBox>
        {[[-0.15, 0.18], [0.15, 0.18], [-0.15, -0.18], [0.15, -0.18]].map(([x, z], i) => (
          <mesh key={i} position={[x, 0.1, z]} rotation={[-Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 0.02, 20]} />
            <meshStandardMaterial
              color="#052e16"
              emissive="#4ade80"
              emissiveIntensity={0.9}
              toneMapped={false}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}

export default function Whoop3D({ className }: { className?: string }) {
  return (
    <div className={className} aria-label="3D model of a fitness strap" role="img">
      <Canvas
        camera={{ position: [0, 0.5, 8.4], fov: 34 }}
        dpr={[1, 2]}
        gl={{ alpha: true, antialias: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={1.1} />
        <directionalLight position={[4, 6, 5]} intensity={2.4} />
        <directionalLight position={[-5, 2, -4]} intensity={1.1} color="#cfe8e4" />
        <directionalLight position={[0, 5, -7]} intensity={1.4} color="#fff4e6" />
        <Float speed={1.6} rotationIntensity={0.25} floatIntensity={0.9}>
          <StrapModel />
        </Float>
        <ContactShadows position={[0, -2.9, 0]} opacity={0.22} scale={8} blur={2.8} far={3.4} />
      </Canvas>
    </div>
  );
}
