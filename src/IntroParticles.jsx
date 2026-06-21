import { useRef, useState, useMemo } from "react";
import { Points, PointMaterial, Sparkles } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as random from "maath/random/dist/maath-random.esm";
import * as THREE from "three";

/**
 * Slow-drifting ambient dust, mirroring the existing Starss component in
 * World.jsx (same Points + PointMaterial + maath random.inSphere recipe)
 * so the codebase stays stylistically consistent.
 */
function Dust({ count = 1200, radius = 9, color = "#cbd0e6" }) {
  const ref = useRef();
  const [positions] = useState(() =>
    random.inSphere(new Float32Array(count * 3), { radius })
  );

  useFrame((state, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y += delta * 0.015;
    ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.05) * 0.05;
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color={color}
        size={0.02}
        sizeAttenuation
        depthWrite={false}
        opacity={0.35}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
}

/**
 * Warm embers that drift upward and wrap back around once they rise too
 * high - a small per-frame manual buffer mutation (same general technique
 * as the project's other custom-animated point clouds).
 */
function Embers({ count = 220, spread = 6, height = 6 }) {
  const ref = useRef();
  const [data] = useState(() => {
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    const sways = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * spread * 2;
      positions[i * 3 + 1] = Math.random() * height - height * 0.5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * spread * 2;
      speeds[i] = 0.15 + Math.random() * 0.35;
      sways[i] = Math.random() * Math.PI * 2;
    }
    return { positions, speeds, sways };
  });

  useFrame((state, delta) => {
    if (!ref.current) return;
    const posAttr = ref.current.geometry.attributes.position;
    const t = state.clock.elapsedTime;
    for (let i = 0; i < count; i++) {
      let y = posAttr.getY(i) + data.speeds[i] * delta;
      if (y > height * 0.5) y = -height * 0.5;
      const sway = Math.sin(t * 0.6 + data.sways[i]) * 0.35 * delta;
      const x = posAttr.getX(i) + sway;
      posAttr.setXYZ(i, x, y, posAttr.getZ(i));
    }
    posAttr.needsUpdate = true;
  });

  return (
    <Points ref={ref} positions={data.positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#ffb15e"
        size={0.045}
        sizeAttenuation
        depthWrite={false}
        opacity={0.85}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
}

/**
 * Combined "mystical fog" particle set for the intro: ambient dust +
 * rising embers + drei's built-in Sparkles for a few brighter floating
 * motes near the gate.
 */
export default function IntroParticles({ center = [0, 1.5, 0] }) {
  const sparkleProps = useMemo(
    () => ({
      count: 60,
      scale: [6, 5, 6],
      size: 2.2,
      speed: 0.25,
      opacity: 0.55,
      color: "#ffcf8a",
      noise: 1,
    }),
    []
  );

  return (
    <group>
      <Dust />
      <Embers />
      <group position={center}>
        <Sparkles {...sparkleProps} />
      </group>
    </group>
  );
}
