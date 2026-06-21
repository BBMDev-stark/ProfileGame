import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";

function PixelStars() {
  const ref = useRef();

  useFrame((state) => {
    ref.current.rotation.z =
      state.clock.elapsedTime * 0.01;
  });

  const stars = [];

  for (let i = 0; i < 400; i++) {
    stars.push([
      (Math.random() - 0.5) * 80,
      Math.random() * 40,
      (Math.random() - 0.5) * 80,
    ]);
  }

  return (
    <group ref={ref}>
      {stars.map((p, i) => (
        <mesh key={i} position={p}>
          <boxGeometry args={[0.08, 0.08, 0.08]} />
          <meshBasicMaterial />
        </mesh>
      ))}
    </group>
  );
}

export default function FantasyBackground() {
  return (
    <div className="pf-fantasy-bg">

      <Canvas camera={{ position: [0, 0, 20] }}>

        <fog
          attach="fog"
          args={["#07060c", 10, 60]}
        />

        <ambientLight intensity={1.2} />

        <PixelStars />

      </Canvas>

    </div>
  );
}