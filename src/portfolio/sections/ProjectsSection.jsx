/**
 * ProjectsSection — Chapter II "Outstanding Product"
 *
 * Replaces the flat card grid with a fully interactive Three.js scene.
 * Each project is represented as a hand-crafted fantasy 3D artefact
 * (treasure chest, sword, scroll, crystal orb, shield) floating on a
 * carved stone plinth. Hovering an artefact makes it glow and spin;
 * clicking it opens the existing ProjectModal with full detail.
 *
 * Architecture:
 *  ┌─ ProjectsSection (React)
 *  │   ├─ Chapter header  (plain HTML/CSS, same as other chapters)
 *  │   ├─ ProductBanner   (full-width image banner)
 *  │   ├─ DesignGallery   (9-thumb image grid)
 *  │   └─ ProjectArena    (Three.js canvas via R3F)
 *  │       └─ ArtefactScene (lights + 5 × ProjectArtefact)
 *  │           └─ ProjectArtefact (plinth + 3D mesh + particles + label)
 *  └─ ProjectModal (existing, unchanged)
 */

import { useRef, useState, useEffect, Suspense, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, Float, Environment } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { projects, projectsBanner, designGallery } from "../../data/portfolioData";
import { revealOnScroll } from "../scrollReveal";
import ProjectModal from "./ProjectModal";

/* ─── colour palette (mirrors portfolio.css vars) ─────────────────────── */
const C = {
  gold:       new THREE.Color("#e8a857"),
  goldBright: new THREE.Color("#ffc97a"),
  purple:     new THREE.Color("#b46bff"),
  void:       new THREE.Color("#07060c"),
  parchment:  new THREE.Color("#f3e6cf"),
  ember:      new THREE.Color("#c97a2e"),
};

/* ─── per-project artefact config ─────────────────────────────────────── */
const ARTEFACT_CFG = [
  {
    id: "stem-minigames",
    shape: "chest",
    color: C.goldBright,
    glow:  C.gold,
    label: "STEM\nMini-Games",
  },
  {
    id: "2d-platformer",
    shape: "sword",
    color: C.parchment,
    glow:  C.goldBright,
    label: "2D\nPlatformer",
  },
  {
    id: "food-connection",
    shape: "scroll",
    color: new THREE.Color("#a0e8a0"),
    glow:  new THREE.Color("#60b860"),
    label: "Food\nConnection",
  },
  {
    id: "your-voice",
    shape: "orb",
    color: C.purple,
    glow:  new THREE.Color("#d2a0ff"),
    label: "Your\nVoice AI",
  },
  {
    id: "borderwave",
    shape: "shield",
    color: new THREE.Color("#6ab4ff"),
    glow:  new THREE.Color("#4090ff"),
    label: "Border\nwave",
  },
];

/* ─── Particle cloud around each artefact ──────────────────────────────── */
function GlowParticles({ color, active }) {
  const ref = useRef();
  const count = 28;

  const { positions, phases } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const ph  = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.acos(2 * Math.random() - 1);
      const r     = 0.55 + Math.random() * 0.35;
      pos[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
      ph[i] = Math.random() * Math.PI * 2;
    }
    return { positions: pos, phases: ph };
  }, []);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    const pos = ref.current.geometry.attributes.position.array;
    for (let i = 0; i < count; i++) {
      const p = phases[i];
      const dy = Math.sin(t * 0.9 + p) * 0.06;
      pos[i * 3 + 1] = positions[i * 3 + 1] + dy;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
    ref.current.material.opacity = active ? 0.85 : 0.3;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions.slice(), 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color={color}
        size={0.045}
        transparent
        opacity={0.3}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

/* ─── Stone plinth (the base each artefact sits on) ───────────────────── */
function Plinth({ active }) {
  return (
    <group position={[0, -0.72, 0]}>
      {/* main block */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.9, 0.22, 0.9]} />
        <meshStandardMaterial
          color={active ? "#2a1e3a" : "#1a1226"}
          roughness={0.85}
          metalness={0.1}
          emissive={active ? "#3a2550" : "#0d0a16"}
          emissiveIntensity={active ? 0.4 : 0.1}
        />
      </mesh>
      {/* chamfer top strip */}
      <mesh position={[0, 0.115, 0]} castShadow>
        <boxGeometry args={[0.96, 0.045, 0.96]} />
        <meshStandardMaterial
          color="#2e2040"
          roughness={0.6}
          metalness={0.3}
          emissive={active ? "#5a3a80" : "#1a1226"}
          emissiveIntensity={active ? 0.3 : 0.08}
        />
      </mesh>
      {/* rune groove lines */}
      {[-0.28, 0, 0.28].map((x, i) => (
        <mesh key={i} position={[x, 0.14, 0.46]} rotation={[0, 0, 0]}>
          <boxGeometry args={[0.06, 0.008, 0.004]} />
          <meshStandardMaterial
            color={active ? "#e8a857" : "#3a2550"}
            emissive={active ? "#e8a857" : "#2a1530"}
            emissiveIntensity={active ? 1.2 : 0.2}
            roughness={0.2}
            metalness={0.8}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ─── Individual 3D shape builders ─────────────────────────────────────── */

function ChestShape({ color, active }) {
  const lidRef = useRef();
  useFrame(({ clock }) => {
    if (!lidRef.current) return;
    const angle = active ? Math.sin(clock.getElapsedTime() * 1.2) * 0.12 + 0.32 : 0;
    lidRef.current.rotation.x = -angle;
  });
  return (
    <group>
      {/* body */}
      <mesh castShadow position={[0, -0.06, 0]}>
        <boxGeometry args={[0.7, 0.38, 0.5]} />
        <meshStandardMaterial color="#5a3a1a" roughness={0.7} metalness={0.2}
          emissive={active ? "#3a200a" : "#1a0a00"} emissiveIntensity={0.5} />
      </mesh>
      {/* metal straps */}
      {[-0.2, 0.2].map((x, i) => (
        <mesh key={i} position={[x, -0.06, 0.26]} castShadow>
          <boxGeometry args={[0.06, 0.42, 0.02]} />
          <meshStandardMaterial color={color} roughness={0.3} metalness={0.9}
            emissive={color} emissiveIntensity={active ? 0.8 : 0.2} />
        </mesh>
      ))}
      {/* lid */}
      <group ref={lidRef} position={[0, 0.15, -0.25]}>
        <mesh position={[0, 0, 0.25]} castShadow>
          <boxGeometry args={[0.7, 0.16, 0.5]} />
          <meshStandardMaterial color="#6a4a2a" roughness={0.65} metalness={0.2}
            emissive={active ? "#4a2a10" : "#200e00"} emissiveIntensity={0.4} />
        </mesh>
        {/* lock */}
        <mesh position={[0, -0.04, 0.505]}>
          <boxGeometry args={[0.1, 0.1, 0.04]} />
          <meshStandardMaterial color={color} metalness={0.95} roughness={0.1}
            emissive={color} emissiveIntensity={active ? 1.5 : 0.3} />
        </mesh>
      </group>
      {/* inner glow when active */}
      {active && (
        <pointLight position={[0, 0, 0]} color={color} intensity={1.2} distance={1.2} />
      )}
    </group>
  );
}

function SwordShape({ color, active }) {
  return (
    <group rotation={[0, 0, Math.PI / 8]}>
      {/* blade */}
      <mesh castShadow position={[0, 0.28, 0]}>
        <boxGeometry args={[0.06, 0.7, 0.02]} />
        <meshStandardMaterial color={active ? "#e0e8ff" : "#aab0c0"} metalness={0.95} roughness={0.05}
          emissive={color} emissiveIntensity={active ? 0.6 : 0.1} />
      </mesh>
      {/* fuller (groove) */}
      <mesh position={[0, 0.28, 0.011]}>
        <boxGeometry args={[0.015, 0.62, 0.004]} />
        <meshStandardMaterial color={color} metalness={1} roughness={0}
          emissive={color} emissiveIntensity={active ? 1.5 : 0.4} />
      </mesh>
      {/* crossguard */}
      <mesh castShadow position={[0, -0.08, 0]}>
        <boxGeometry args={[0.46, 0.06, 0.06]} />
        <meshStandardMaterial color={color} metalness={0.9} roughness={0.15}
          emissive={color} emissiveIntensity={active ? 0.8 : 0.2} />
      </mesh>
      {/* grip */}
      <mesh castShadow position={[0, -0.25, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.3, 8]} />
        <meshStandardMaterial color="#4a2a10" roughness={0.8} metalness={0.1} />
      </mesh>
      {/* pommel */}
      <mesh castShadow position={[0, -0.42, 0]}>
        <sphereGeometry args={[0.075, 10, 8]} />
        <meshStandardMaterial color={color} metalness={0.9} roughness={0.1}
          emissive={color} emissiveIntensity={active ? 1 : 0.2} />
      </mesh>
      {active && <pointLight position={[0, 0.3, 0]} color={color} intensity={1.5} distance={1.5} />}
    </group>
  );
}

function ScrollShape({ color, active }) {
  return (
    <group>
      {/* parchment body */}
      <mesh castShadow>
        <cylinderGeometry args={[0.22, 0.22, 0.72, 16]} />
        <meshStandardMaterial color="#d4b896" roughness={0.9} metalness={0}
          emissive={active ? "#604020" : "#201000"} emissiveIntensity={0.3} />
      </mesh>
      {/* end caps */}
      {[-0.38, 0.38].map((y, i) => (
        <mesh key={i} castShadow position={[0, y, 0]}>
          <cylinderGeometry args={[0.28, 0.28, 0.08, 16]} />
          <meshStandardMaterial color={color} metalness={0.7} roughness={0.2}
            emissive={color} emissiveIntensity={active ? 0.8 : 0.15} />
        </mesh>
      ))}
      {/* rune text lines */}
      {[-0.18, 0, 0.18].map((y, i) => (
        <mesh key={i} position={[0.221, y, 0]} rotation={[0, 0, 0]}>
          <boxGeometry args={[0.003, 0.04, 0.28]} />
          <meshStandardMaterial color={color} emissive={color}
            emissiveIntensity={active ? 1.2 : 0.3} metalness={0.5} roughness={0.2} />
        </mesh>
      ))}
      {active && <pointLight position={[0, 0, 0]} color={color} intensity={1} distance={1.2} />}
    </group>
  );
}

function OrbShape({ color, active }) {
  const coreRef = useRef();
  const ringRef = useRef();
  useFrame(({ clock }) => {
    if (ringRef.current) ringRef.current.rotation.x = clock.getElapsedTime() * 0.7;
    if (ringRef.current) ringRef.current.rotation.z = clock.getElapsedTime() * 0.4;
    if (coreRef.current) {
      const s = 1 + (active ? Math.sin(clock.getElapsedTime() * 2) * 0.04 : 0);
      coreRef.current.scale.setScalar(s);
    }
  });
  return (
    <group>
      {/* core sphere */}
      <mesh ref={coreRef} castShadow>
        <sphereGeometry args={[0.28, 24, 18]} />
        <meshStandardMaterial color={color} roughness={0.05} metalness={0.1}
          emissive={color} emissiveIntensity={active ? 0.9 : 0.3} transparent opacity={0.88} />
      </mesh>
      {/* inner glow layer */}
      <mesh>
        <sphereGeometry args={[0.22, 16, 12]} />
        <meshStandardMaterial color={color} emissive={color}
          emissiveIntensity={active ? 2 : 0.6} transparent opacity={0.4} depthWrite={false} />
      </mesh>
      {/* orbit ring */}
      <group ref={ringRef}>
        <mesh>
          <torusGeometry args={[0.4, 0.018, 8, 48]} />
          <meshStandardMaterial color={color} metalness={0.8} roughness={0.1}
            emissive={color} emissiveIntensity={active ? 1 : 0.25} />
        </mesh>
      </group>
      {/* small orbit ring 2 */}
      <mesh rotation={[Math.PI / 2.5, 0, 0]}>
        <torusGeometry args={[0.36, 0.01, 6, 40]} />
        <meshStandardMaterial color={color} metalness={0.7} roughness={0.2}
          emissive={color} emissiveIntensity={active ? 0.7 : 0.15} />
      </mesh>
      {active && <pointLight position={[0, 0, 0]} color={color} intensity={2.5} distance={1.8} />}
    </group>
  );
}

function ShieldShape({ color, active }) {
  return (
    <group>
      {/* shield face — extruded hex-ish */}
      <mesh castShadow>
        <cylinderGeometry args={[0.36, 0.42, 0.07, 6]} />
        <meshStandardMaterial color="#1a2a4a" roughness={0.5} metalness={0.6}
          emissive={active ? "#0a1a3a" : "#050e1e"} emissiveIntensity={0.5} />
      </mesh>
      {/* rim */}
      <mesh castShadow>
        <torusGeometry args={[0.38, 0.045, 6, 6]} />
        <meshStandardMaterial color={color} metalness={0.95} roughness={0.05}
          emissive={color} emissiveIntensity={active ? 0.9 : 0.2} />
      </mesh>
      {/* central boss */}
      <mesh castShadow position={[0, 0.06, 0]}>
        <sphereGeometry args={[0.1, 12, 10]} />
        <meshStandardMaterial color={color} metalness={0.95} roughness={0.05}
          emissive={color} emissiveIntensity={active ? 1.5 : 0.3} />
      </mesh>
      {/* cross bar */}
      <mesh position={[0, 0.06, 0]}>
        <boxGeometry args={[0.55, 0.04, 0.04]} />
        <meshStandardMaterial color={color} metalness={0.9} roughness={0.1}
          emissive={color} emissiveIntensity={active ? 0.8 : 0.15} />
      </mesh>
      <mesh position={[0, 0.06, 0]}>
        <boxGeometry args={[0.04, 0.55, 0.04]} />
        <meshStandardMaterial color={color} metalness={0.9} roughness={0.1}
          emissive={color} emissiveIntensity={active ? 0.8 : 0.15} />
      </mesh>
      {active && <pointLight position={[0, 0.1, 0]} color={color} intensity={1.8} distance={1.5} />}
    </group>
  );
}

const SHAPE_MAP = {
  chest:  ChestShape,
  sword:  SwordShape,
  scroll: ScrollShape,
  orb:    OrbShape,
  shield: ShieldShape,
};

/* ─── One artefact = plinth + 3D shape + particles + HTML label ─────── */
function ProjectArtefact({ cfg, project, position, onSelect }) {
  const groupRef  = useRef();
  const meshRef   = useRef();
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  const ShapeComp = SHAPE_MAP[cfg.shape];

  /* hover: float up + spin; idle: gentle bob */
  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    if (hovered) {
      groupRef.current.rotation.y += 0.018;
      groupRef.current.position.y = position[1] + Math.sin(t * 2) * 0.04 + 0.12;
    } else {
      groupRef.current.rotation.y += 0.004;
      groupRef.current.position.y = position[1] + Math.sin(t * 0.8 + position[0]) * 0.025;
    }
  });

  /* scale pop on hover via GSAP */
  const handlePointerOver = () => {
    setHovered(true);
    document.body.style.cursor = "pointer";
    if (groupRef.current) {
      gsap.to(groupRef.current.scale, { x: 1.13, y: 1.13, z: 1.13, duration: 0.35, ease: "back.out(2)" });
    }
  };

  const handlePointerOut = () => {
    setHovered(false);
    document.body.style.cursor = "auto";
    if (groupRef.current) {
      gsap.to(groupRef.current.scale, { x: 1, y: 1, z: 1, duration: 0.4, ease: "power3.out" });
    }
  };

  const handleClick = () => {
    onSelect(project);
    if (groupRef.current) {
      gsap.to(groupRef.current.scale, {
        x: 1.25, y: 1.25, z: 1.25, duration: 0.15, ease: "power2.out",
        onComplete: () => gsap.to(groupRef.current.scale, { x: 1.1, y: 1.1, z: 1.1, duration: 0.3 }),
      });
    }
  };

  return (
    <group
      ref={groupRef}
      position={position}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
    >
      <Plinth active={hovered} />

      {/* floating artefact mesh at y+0.1 above plinth */}
      <group position={[0, 0.18, 0]}>
        <ShapeComp color={cfg.color} active={hovered} />
        <GlowParticles color={cfg.glow} active={hovered} />
      </group>

      {/* HTML label — always faces camera */}
      <Html
        position={[0, -1.08, 0]}
        center
        distanceFactor={5}
        style={{ pointerEvents: "none" }}
      >
        <div
          style={{
            fontFamily: "'NewAmsterdam', Georgia, serif",
            fontSize: "13px",
            lineHeight: 1.25,
            textAlign: "center",
            color: hovered ? "#ffc97a" : "rgba(243,230,207,0.65)",
            textShadow: hovered
              ? "0 0 14px rgba(232,168,87,0.9), 0 0 4px rgba(0,0,0,1)"
              : "0 0 6px rgba(0,0,0,0.9)",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            whiteSpace: "pre-line",
            transition: "color 0.3s, text-shadow 0.3s",
          }}
        >
          {cfg.label}
        </div>
      </Html>
    </group>
  );
}

/* ─── Ground plane with glowing rune circle ────────────────────────────── */
function RuneGround() {
  const ringRef = useRef();
  useFrame(({ clock }) => {
    if (ringRef.current) {
      ringRef.current.material.emissiveIntensity = 0.18 + Math.sin(clock.getElapsedTime() * 0.6) * 0.08;
    }
  });
  return (
    <group position={[0, -0.88, 0]}>
      {/* stone floor */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[14, 6]} />
        <meshStandardMaterial color="#0d0a16" roughness={0.95} metalness={0.05} />
      </mesh>
      {/* outer glow ring */}
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
        <torusGeometry args={[4.5, 0.06, 6, 96]} />
        <meshStandardMaterial color="#b46bff" emissive="#b46bff" emissiveIntensity={0.18}
          roughness={0.2} metalness={0.6} />
      </mesh>
      {/* inner ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
        <torusGeometry args={[3.8, 0.02, 6, 80]} />
        <meshStandardMaterial color="#e8a857" emissive="#e8a857" emissiveIntensity={0.12}
          roughness={0.2} metalness={0.8} />
      </mesh>
    </group>
  );
}

/* ─── Ambient fog particles (floating dust) ────────────────────────────── */
function AmbientDust() {
  const ref = useRef();
  const count = 80;
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3]     = (Math.random() - 0.5) * 12;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 3;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 4;
    }
    return arr;
  }, []);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime() * 0.18;
    const pos = ref.current.geometry.attributes.position.array;
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 1] = ((positions[i * 3 + 1] + t) % 3) - 1.5;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions.slice(), 3]} />
      </bufferGeometry>
      <pointsMaterial color="#b46bff" size={0.03} transparent opacity={0.25}
        sizeAttenuation depthWrite={false} />
    </points>
  );
}

/* ─── Camera rig that reacts to mouse movement ─────────────────────────── */
function CameraRig() {
  const { camera } = useThree();
  const mouse = useRef([0, 0]);

  useEffect(() => {
    const onMove = (e) => {
      mouse.current = [
        (e.clientX / window.innerWidth  - 0.5) * 2,
        (e.clientY / window.innerHeight - 0.5) * 2,
      ];
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  useFrame(() => {
    camera.position.x += (mouse.current[0] * 0.6 - camera.position.x) * 0.04;
    camera.position.y += (-mouse.current[1] * 0.3 - camera.position.y + 1.5) * 0.04;
    camera.lookAt(0, 0, 0);
  });

  return null;
}

/* ─── The full Three.js scene ──────────────────────────────────────────── */
/* 5 artefacts in a gentle arc:  -2  -1  0  1  2 on X */
const POSITIONS = [
  [-3.6, 0, 0],
  [-1.8, 0, 0.3],
  [ 0,   0, 0.5],
  [ 1.8, 0, 0.3],
  [ 3.6, 0, 0],
];

function ArtefactScene({ onSelect }) {
  return (
    <>
      <CameraRig />
      <AmbientDust />
      <RuneGround />

      {/* Lighting */}
      <ambientLight intensity={0.12} color="#1a0a2e" />
      <directionalLight position={[0, 8, 4]} intensity={0.4} color="#ffe9c2" castShadow />
      <pointLight position={[-5, 3, 2]} color="#b46bff" intensity={0.7} distance={8} />
      <pointLight position={[ 5, 3, 2]} color="#e8a857" intensity={0.7} distance={8} />
      <pointLight position={[ 0, 5, -3]} color="#4060a0" intensity={0.5} distance={10} />

      <Suspense fallback={null}>
        {ARTEFACT_CFG.map((cfg, i) => (
          <Float
            key={cfg.id}
            speed={1.2}
            rotationIntensity={0}
            floatIntensity={0}
          >
            <ProjectArtefact
              cfg={cfg}
              project={projects[i]}
              position={POSITIONS[i]}
              onSelect={onSelect}
            />
          </Float>
        ))}
      </Suspense>
    </>
  );
}

/* ─── Wrapper canvas component ─────────────────────────────────────────── */
function ProjectArena({ onSelect }) {
  return (
    <div className="pf-arena">
      <div className="pf-arena__hint">
        Click an artefact to reveal its quest
      </div>
      <Canvas
        className="pf-arena__canvas"
        camera={{ position: [0, 1.5, 7], fov: 52 }}
        shadows
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <ArtefactScene onSelect={onSelect} />
      </Canvas>
    </div>
  );
}

/* ─── Main section export ──────────────────────────────────────────────── */
export default function ProjectsSection() {
  const sectionRef  = useRef(null);
  const [openProject, setOpenProject] = useState(null);
  const [lightboxImg, setLightboxImg] = useState(null);

  useGSAP(
    () => { revealOnScroll(sectionRef.current, ".pf-reveal", { stagger: 0.1 }); },
    { scope: sectionRef }
  );

  return (
    <section id="projects" className="pf-section" ref={sectionRef}>
      <div className="pf-section__inner">

        {/* chapter header */}
        <header className="pf-chapter-head pf-reveal">
          <p className="pf-chapter-head__eyebrow">Chapter II</p>
          <h2 className="pf-chapter-head__title">Outstanding Product</h2>
          <p className="pf-chapter-head__subtitle">Featured Projects & Design</p>
        </header>

        {/* full-width game banner */}
        <div className="pf-product-banner pf-reveal">
          <img className="pf-product-banner__img"
            src={projectsBanner.image} alt={projectsBanner.alt} />
          <div className="pf-product-banner__overlay" aria-hidden="true">
            <span className="pf-product-banner__rune">⚔</span>
            <span className="pf-product-banner__label">Outstanding Product</span>
            <span className="pf-product-banner__rune">⚔</span>
          </div>
        </div>

        {/* 9-image design gallery */}
        <div className="pf-design-gallery pf-reveal">
          {designGallery.map((item) => (
            <button key={item.id} type="button" className="pf-design-gallery__thumb"
              onClick={() => setLightboxImg(item)}
              aria-label={`View full size — ${item.alt}`}
            >
              <img className="pf-design-gallery__img" src={item.image} alt={item.alt} loading="lazy" />
              <span className="pf-design-gallery__zoom" aria-hidden="true">⤢</span>
            </button>
          ))}
        </div>

      </div>{/* /pf-section__inner — arena goes full-bleed */}

      {/* 3D artefact arena — replaces the flat project card grid */}
      <ProjectArena onSelect={setOpenProject} />

      {/* Design lightbox */}
      {lightboxImg && (
        <div className="pf-lightbox-overlay"
          onMouseDown={(e) => { if (e.target === e.currentTarget) setLightboxImg(null); }}>
          <button type="button" className="pf-lightbox-close"
            onClick={() => setLightboxImg(null)} aria-label="Close">✕</button>
          <figure className="pf-lightbox-figure">
            <img className="pf-lightbox-img" src={lightboxImg.image} alt={lightboxImg.alt} />
            <figcaption className="pf-lightbox-caption">{lightboxImg.alt}</figcaption>
          </figure>
        </div>
      )}

      {openProject && (
        <ProjectModal project={openProject} onClose={() => setOpenProject(null)} />
      )}
    </section>
  );
}