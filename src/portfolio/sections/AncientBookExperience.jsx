import { useState, useRef, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, useGLTF, PointerLockControls } from "@react-three/drei";
import { Suspense } from "react";
import * as THREE from "three";

/* ── Preload models ── */
useGLTF.preload("/models/book/chained_medieval_library_book.glb");
useGLTF.preload("/models/book/medieval_fantasy_book.glb");

/* ── FPS Controller + Fullscreen ── */
function FPSCamera({ opened, exploreMode, onExit }) {
  const { camera, gl } = useThree();
  const controlsRef = useRef();

  const keys = useRef({
    w: false, a: false, s: false, d: false,
    space: false, shift: false
  });

  // Fullscreen khi vào mode
  useEffect(() => {
    if (exploreMode) {
      const canvas = gl.domElement;
      if (canvas.requestFullscreen) canvas.requestFullscreen();
      else if (canvas.webkitRequestFullscreen) canvas.webkitRequestFullscreen();
      else if (canvas.mozRequestFullScreen) canvas.mozRequestFullScreen();
    }
  }, [exploreMode, gl]);

  // Thoát fullscreen khi ESC
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && !document.webkitFullscreenElement) {
        if (exploreMode) onExit();
      }
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
    };
  }, [exploreMode, onExit]);

  useEffect(() => {
    if (!exploreMode) return;

    const handleKeyDown = (e) => {
      const k = e.key.toLowerCase();
      if (k === "w") keys.current.w = true;
      if (k === "a") keys.current.a = true;
      if (k === "s") keys.current.s = true;
      if (k === "d") keys.current.d = true;
      if (e.key === " ") keys.current.space = true;
      if (k === "shift") keys.current.shift = true;
      if (e.key === "Escape") onExit();
    };

    const handleKeyUp = (e) => {
      const k = e.key.toLowerCase();
      if (k === "w") keys.current.w = false;
      if (k === "a") keys.current.a = false;
      if (k === "s") keys.current.s = false;
      if (k === "d") keys.current.d = false;
      if (e.key === " ") keys.current.space = false;
      if (k === "shift") keys.current.shift = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [exploreMode, onExit]);

  useFrame((_, delta) => {
    if (!opened || !exploreMode) return;

    const speed = 12 * delta;
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);

    if (keys.current.w) camera.position.addScaledVector(forward, speed);
    if (keys.current.s) camera.position.addScaledVector(forward, -speed);
    if (keys.current.a) camera.position.addScaledVector(right, -speed);
    if (keys.current.d) camera.position.addScaledVector(right, speed);

    if (keys.current.space) camera.position.y += speed * 15;
    if (keys.current.shift) camera.position.y -= speed * 15;

    camera.position.y = Math.max(0.8, Math.min(20, camera.position.y));
  });

  return <PointerLockControls ref={controlsRef} enabled={exploreMode} />;
}

/* ── Closed Book (ĐÃ TĂNG SIZE & GẦN HƠN) ── */
function ClosedBook({ onClick }) {
  const { scene } = useGLTF("/models/book/chained_medieval_library_book.glb");
  const groupRef = useRef();
  const hoverRef = useRef(false);
  const t = useRef(0);

  useFrame((_, delta) => {
    t.current += delta;
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(t.current * 1.2) * 0.08;
      if (hoverRef.current) groupRef.current.rotation.y += delta * 0.8;
    }
  });

  return (
    <group
      ref={groupRef}
      onClick={onClick}
      onPointerOver={() => { hoverRef.current = true; document.body.style.cursor = "pointer"; }}
      onPointerOut={() => { hoverRef.current = false; document.body.style.cursor = "default"; }}
      scale={130}                    // ← TĂNG RẤT NHIỀU
      position={[0, 0.6, 0]}       // ← Nâng cao hơn
    >
      <primitive object={scene} />
    </group>
  );
}

/* ── Open Book (TĂNG SIZE) ── */
function OpenBook() {
  const { scene } = useGLTF("/models/book/medieval_fantasy_book.glb");
  const groupRef = useRef();
  const scaleProgress = useRef(0);

  useFrame((_, delta) => {
    if (scaleProgress.current < 1) {
      scaleProgress.current = Math.min(1, scaleProgress.current + delta * 3);
      const s = 3.0 * easeOutBack(scaleProgress.current);   // ← Tăng size mạnh
      if (groupRef.current) groupRef.current.scale.setScalar(s);
    }

    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(Date.now() * 0.0015) * 0.06;
    }
  });

  return (
    <group 
      ref={groupRef} 
      scale={0}
      position={[0, 0.7, 0]}        // ← Nâng cao hơn
    >
      <primitive object={scene} />
    </group>
  );
}

function easeOutBack(x) {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
}

/* ── Click Particles ── */
function ClickParticles({ active }) {
  const meshRef = useRef();
  const posRef = useRef(null);
  const t = useRef(0);

  if (!posRef.current) {
    const count = 80;
    const positions = new Float32Array(count * 3);
    const velocities = [];
    for (let i = 0; i < count; i++) {
      positions[i * 3] = 0; positions[i * 3 + 1] = 0; positions[i * 3 + 2] = 0;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const speed = 0.5 + Math.random() * 2;
      velocities.push(
        Math.sin(phi) * Math.cos(theta) * speed,
        Math.sin(phi) * Math.sin(theta) * speed + 0.5,
        Math.cos(phi) * speed
      );
    }
    posRef.current = { positions, velocities };
  }

  useFrame((_, delta) => {
    if (!active || !meshRef.current) return;
    t.current += delta;
    const pos = meshRef.current.geometry.attributes.position.array;
    const vel = posRef.current.velocities;
    const count = pos.length / 3;

    for (let i = 0; i < count; i++) {
      pos[i * 3] += vel[i * 3] * delta;
      pos[i * 3 + 1] += vel[i * 3 + 1] * delta - 0.5 * delta;
      pos[i * 3 + 2] += vel[i * 3 + 2] * delta;
      vel[i * 3 + 1] -= 2 * delta;
    }
    meshRef.current.geometry.attributes.position.needsUpdate = true;
    meshRef.current.material.opacity = Math.max(0, 1 - t.current * 0.8);
  });

  if (!active) return null;

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={posRef.current.positions} count={posRef.current.positions.length / 3} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="#ffc97a" transparent opacity={1} sizeAttenuation />
    </points>
  );
}

/* ── Main Component ── */
export default function AncientBookExperience() {
  const [opened, setOpened] = useState(false);
  const [burst, setBurst] = useState(false);
  const [exploreMode, setExploreMode] = useState(false);

  function handleOpen() {
    if (opened) return;
    setBurst(true);
    setTimeout(() => setOpened(true), 300);
    setTimeout(() => setBurst(false), 2000);
  }

  const toggleExplore = () => setExploreMode(!exploreMode);

  const exitExplore = () => {
    setExploreMode(false);
    if (document.fullscreenElement || document.webkitFullscreenElement) {
      document.exitFullscreen?.() || document.webkitExitFullscreen?.();
    }
  };

  return (
    <section className="pf-section pf-book-section" id="book">
      <div className="pf-section__inner">
        <header className="pf-chapter-head">
          <p className="pf-chapter-head__eyebrow">Secret Chapter</p>
          <h2 className="pf-chapter-head__title">Ancient Library</h2>
          <p className="pf-chapter-head__subtitle">Discover the hidden knowledge</p>
        </header>

        {!opened && (
          <p className="pf-book-hint">
            ✦ Click vào cuốn sách để mở ra bí ẩn ✦
          </p>
        )}

        {opened && (
          <div style={{ textAlign: "center", marginBottom: "15px" }}>
            <button 
              id="explore-button"
              onClick={toggleExplore}
              style={{
                padding: "14px 32px",
                fontSize: "18px",
                background: exploreMode ? "#3a2a1f" : "#d4af37",
                color: exploreMode ? "#ffeb9f" : "#1a0f08",
                border: "none",
                borderRadius: "50px",
                cursor: "pointer",
                fontWeight: "bold",
                boxShadow: "0 6px 25px rgba(0,0,0,0.6)"
              }}
            >
              {exploreMode ? "🔙 Thoát Khám Phá" : "🔍 BẮT ĐẦU KHÁM PHÁ (FPS)"}
            </button>
          </div>
        )}

        <div className="pf-book-container" style={{ height: "75vh", borderRadius: "12px", overflow: "hidden" }}>
          <Canvas 
            camera={{ 
              position: [0, 1.8, 3.2],   // ← GẦN HƠN
              fov: 42,                    // ← Zoom in mạnh
              near: 0.1, 
              far: 100 
            }}
            style={{ background: "#0a0503" }}
          >
            <ambientLight intensity={1.4} />
            <directionalLight position={[5, 8, 5]} intensity={3} />
            <pointLight position={[-3, 2, 2]} intensity={1.5} color="#ffb15e" />
            
            <Environment preset="sunset" />

            <Suspense fallback={
              <mesh position={[0, 0.5, 0]}>
                <boxGeometry args={[2,2,2]} />
                <meshStandardMaterial color="#4a3728" />
              </mesh>
            }>
              {!opened ? <ClosedBook onClick={handleOpen} /> : <OpenBook />}
            </Suspense>

            <ClickParticles active={burst} />

            {opened && <FPSCamera opened={opened} exploreMode={exploreMode} onExit={exitExplore} />}
          </Canvas>
        </div>

        {opened && (
          <div className="pf-book-content">
            <h3>Legendary Journey</h3>
            <p>Chào mừng lữ hành giả...</p>
            <p>Cuốn cổ thư này chứa đựng những câu chuyện ẩn giấu...</p>
          </div>
        )}
      </div>
    </section>
  );
}