import { Suspense, useMemo } from "react";
import { PerspectiveCamera, Environment, Stars, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import PortalGate from "./PortalGate.jsx";
import AssetErrorBoundary from "./helpers/AssetErrorBoundary";
import IntroForest from "./IntroForest.jsx";
import IntroFireflies from "./IntroFireflies.jsx";
import IntroCameraParallax from "./IntroCameraParallax.jsx";
import IntroParticles from "./IntroParticles.jsx";

function RuinsBackdrop({ path }) {
  const { scene } = useGLTF(path);
  const cloned = useMemo(() => scene.clone(true), [scene]);

  const scale = useMemo(() => {
    const box = new THREE.Box3().setFromObject(cloned);
    const size = box.getSize(new THREE.Vector3());
    return 12.5 / Math.max(size.x, size.y, size.z);
  }, [cloned]);

  return (
    <group position={[0, -1.2, -9]} rotation={[0, Math.PI * 0.08, 0]} scale={scale}>
      <primitive object={cloned} />
    </group>
  );
}

export default function IntroWorld({ onEnter, transitioning = false }) {
  return (
    <>
      <PerspectiveCamera
        makeDefault
        position={[0, 3.2, 11]}
        fov={46}
        near={0.1}
        far={150}
      />

      {/* Subtle mouse-driven parallax - disabled the moment the gate is
          clicked so it never fights the enter-cinematic camera punch */}
      <IntroCameraParallax locked={transitioning} />

      {/* Background Atmosphere */}
      <color attach="background" args={["#0b0a14"]} />
      <fog attach="fog" args={["#0b0a14", 15, 55]} />

      {/* Dramatic Lighting */}
      <ambientLight intensity={0.25} color="#445577" />
      <hemisphereLight color="#aabbff" groundColor="#1a0f08" intensity={0.6} />

      {/* Main Key Light */}
      <directionalLight
        position={[12, 18, 8]}
        intensity={3.5}
        color="#ffcc88"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={1}
        shadow-camera-far={100}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-10}
      />

      {/* Portal Glow Light */}
      <pointLight
        position={[0, 2.8, 0.5]}
        intensity={6}
        color="#ffaa33"
        distance={15}
        decay={1.5}
      />

      <pointLight
        position={[0, 1.5, -1.5]}
        intensity={4}
        color="#ff3366"
        distance={12}
      />

      {/* HDRI Environment */}
      <AssetErrorBoundary label="Environment">
        <Suspense fallback={null}>
          <Environment
            files="https://assets.buinhminh.com/hdri/royal_esplanade_1k.hdr"
            background
            backgroundBlurriness={0.9}
            environmentIntensity={0.85}
          />
        </Suspense>
      </AssetErrorBoundary>

      {/* Stars */}
      <Stars
        radius={180}
        depth={60}
        count={1200}
        factor={3}
        saturation={0.5}
        fade
        speed={0.3}
      />

      {/* Ancient Ruins */}
      <AssetErrorBoundary label="Ruins">
        <Suspense fallback={null}>
          <RuinsBackdrop path="./models/intro/ruins.glb" />
        </Suspense>
      </AssetErrorBoundary>

      {/* Ancient Grove - surrounds the clearing so the gate doesn't sit
          in an empty void. Mushroom caps are retinted amber to match the
          gate's palette and double as the light source the fireflies
          read as drifting around. */}
      <AssetErrorBoundary label="Forest">
        <Suspense fallback={null}>
          <IntroForest />
        </Suspense>
      </AssetErrorBoundary>

      {/* Soft warm rim lights skimming the tree line, separate from the
          gate's own point lights so the grove reads as lit by its own
          glowing mushrooms rather than just the portal */}
      <pointLight position={[-6, 1.2, -3]} intensity={2.2} color="#ff9a3c" distance={8} decay={2} />
      <pointLight position={[6.2, 1.2, -3]} intensity={2.2} color="#ff9a3c" distance={8} decay={2} />
      <pointLight position={[0, 1, -10]} intensity={1.6} color="#ffb15e" distance={9} decay={2} />

      {/* Fireflies drifting through the grove - reinforces "living
          world" distinct from the portal's own straight-rising embers */}
      <IntroFireflies count={26} spread={9} color="#ffcf8a" />

      {/* Ambient mystical dust + bright sparkle motes hugging the gate -
          previously-unused IntroParticles.jsx, layered in for extra
          atmospheric depth alongside the grove and fireflies */}
      <IntroParticles center={[0, 1.8, 0.5]} />

      {/* Magical Portal Gate - Core */}
      <PortalGate
        modelPath="./models/intro/fantasy-gate.glb"
        position={[0, 0, 0]}
        scale={1.12}
        locked={transitioning}
        onEnter={onEnter}
      />

      {/* Ground Platform */}
      <mesh 
        rotation={[-Math.PI * 0.5, 0, 0]} 
        position={[0, -1.1, 0]}
      >
        <circleGeometry args={[28, 64]} />
        <meshStandardMaterial 
          color="#0c0d12" 
          roughness={0.95} 
          metalness={0.1}
        />
      </mesh>

      {/* Floating Embers / Magical Particles */}
      <group>
        {Array.from({ length: 12 }).map((_, i) => (
          <mesh
            key={i}
            position={[
              Math.sin(i) * 6 + (i % 3 - 1) * 2,
              1.5 + Math.cos(i) * 2.5,
              -2 + (i % 5) * 1.2
            ]}
          >
            <sphereGeometry args={[0.025 + Math.random() * 0.02]} />
            <meshBasicMaterial 
              color={i % 2 === 0 ? "#ffaa44" : "#ffdd88"} 
              transparent 
              opacity={0.7} 
            />
          </mesh>
        ))}
      </group>
    </>
  );
}