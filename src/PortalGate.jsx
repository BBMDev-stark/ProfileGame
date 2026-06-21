import {
  useRef,
  useState,
  useMemo,
  useEffect,
  forwardRef,
  useImperativeHandle,
  Suspense,
} from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import gsap from "gsap";
import * as THREE from "three";
import "./shaders/gate/GateMaterial";
import { fractureGeometry } from "./helpers/fractureGeometry";
import AssetErrorBoundary from "./helpers/AssetErrorBoundary";

const FRAGMENT_COUNT = 12;
const TARGET_HEIGHT = 4.4;

const NODE_MAP = {
  structure: "Portal_Wood_0",
  core: "Portal_Portal Final_0",
  haze: "Portal Magic Spin Haze_Portal Haze_0",
};

/* Seeded PRNG */
function makeRng(seed) {
  let s = seed >>> 0 || 1;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* Fit Assembly cho fragments */
function fitAssembly(fragments, targetHeight) {
  const box = new THREE.Box3();
  fragments.forEach((f) => {
    f.geometry.computeBoundingBox();
    const b = f.geometry.boundingBox.clone();
    b.translate(f.center);
    box.union(b);
  });
  const size = new THREE.Vector3();
  box.getSize(size);
  const fitScale = Math.round((targetHeight / (size.y || 1)) * 10000) / 10000;
  const fitCenter = new THREE.Vector3();
  box.getCenter(fitCenter);
  return { fitScale, fitCenter };
}

/* Portal Fragment */
const PortalFragment = forwardRef(function PortalFragment(
  { geometry, center, index, assembledRotation, hovered, entered, locked, color },
  ref
) {
  const meshRef = useRef();
  useImperativeHandle(ref, () => meshRef.current);

  const { brokenPos, brokenRot } = useMemo(() => {
    const rand = makeRng(index * 9301 + 49297);
    const dir = new THREE.Vector3(rand() - 0.5, rand() - 0.5, rand() - 0.5).normalize();
    const dist = 1.1 + rand() * 1.9;
    const offset = dir.multiplyScalar(dist);
    offset.y -= rand() * 0.7;
    return {
      brokenPos: center.clone().add(offset),
      brokenRot: new THREE.Euler(
        (rand() - 0.5) * 1.3,
        (rand() - 0.5) * 1.3,
        (rand() - 0.5) * 1.3
      ),
    };
  }, [index, center]);

  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.position.copy(brokenPos);
      meshRef.current.rotation.set(brokenRot.x, brokenRot.y, brokenRot.z);
    }
  }, [brokenPos, brokenRot]);

  useEffect(() => {
    if (!meshRef.current) return;
    const assembled = hovered || entered;
    const targetPos = assembled ? center : brokenPos;
    const targetRot = assembled ? assembledRotation : [brokenRot.x, brokenRot.y, brokenRot.z];

    const finalPos = assembled ? {
      x: Math.round(targetPos.x * 10000) / 10000,
      y: Math.round(targetPos.y * 10000) / 10000,
      z: Math.round(targetPos.z * 10000) / 10000,
    } : targetPos;

    gsap.to(meshRef.current.position, {
      ...finalPos,
      duration: entered ? 0.85 : assembled ? 1.0 : 0.9,
      delay: index * 0.012,
      ease: entered ? "power3.in" : assembled ? "power3.out" : "power2.inOut",
      overwrite: true,
    });

    gsap.to(meshRef.current.rotation, {
      x: targetRot[0], y: targetRot[1], z: targetRot[2],
      duration: entered ? 0.85 : assembled ? 1.0 : 0.9,
      delay: index * 0.012,
      ease: "power2.inOut",
      overwrite: true,
    });
  }, [hovered, entered, center, assembledRotation, brokenPos, brokenRot, index]);

  return (
    <mesh ref={meshRef} geometry={geometry} frustumCulled={false} castShadow={false}>
      <meshStandardMaterial color={color} roughness={0.85} metalness={0.08} />
    </mesh>
  );
});

/* Procedural fallback */
function buildArchFragments() {
  const frags = [];
  const pillarSegs = 4;
  const segH = 0.85;
  for (const side of [-1, 1]) {
    for (let i = 0; i < pillarSegs; i++) {
      const geo = new THREE.BoxGeometry(0.42, segH * 0.94, 0.42);
      frags.push({
        geometry: geo,
        center: new THREE.Vector3(side * 1.15, i * segH + segH / 2, 0),
        rot: [0, 0, 0],
      });
    }
  }
  const archSteps = 7;
  const radius = 1.2;
  const archBaseY = pillarSegs * segH;
  for (let i = 0; i < archSteps; i++) {
    const t = i / (archSteps - 1);
    const angle = Math.PI - t * Math.PI;
    const geo = new THREE.BoxGeometry(0.52, 0.36, 0.42);
    frags.push({
      geometry: geo,
      center: new THREE.Vector3(
        Math.cos(angle) * radius,
        archBaseY + Math.sin(angle) * radius,
        0
      ),
      rot: [0, 0, angle - Math.PI / 2],
    });
  }
  return frags;
}

/* Gate Assembly */
function GateAssembly({ fragments, coreGeo, hazeGeo, locked, onEnter, fragmentColor }) {
  const innerRef = useRef();
  const coreGroupRef = useRef();
  const coreMatRef = useRef();
  const hazeMatRef = useRef();

  const [hovered, setHovered] = useState(false);
  const [entered, setEntered] = useState(false);

  const { fitScale, fitCenter } = useMemo(
    () => fitAssembly(fragments, TARGET_HEIGHT),
    [fragments]
  );

  // ====================== CHỈNH CORE Ở ĐÂY ======================
  const MASK_SCALE = 0.95;           // Tăng để core to hơn, lấp đầy khung
  const CORE_Y_OFFSET = 1        // ← Đẩy core lên (tăng nếu vẫn thấp)
  const CORE_Z_OFFSET = 0.08;        // ← Đẩy core ra phía trước

  const coreMaskSize = useMemo(() => {
    if (!coreGeo) return [TARGET_HEIGHT * 0.48, TARGET_HEIGHT * 0.48];
    coreGeo.computeBoundingBox();
    const size = new THREE.Vector3();
    coreGeo.boundingBox.getSize(size);
    const s = Math.max(size.x, size.y) * MASK_SCALE;
    return [s, s];
  }, [coreGeo]);

  const coreCenterOffset = useMemo(() => {
    if (!coreGeo) return new THREE.Vector3(0, 0, 0);
    coreGeo.computeBoundingBox();
    const center = new THREE.Vector3();
    coreGeo.boundingBox.getCenter(center);
    return center;
  }, [coreGeo]);

  useFrame((state) => {
    if (coreMatRef.current) {
      coreMatRef.current.uTime = state.clock.elapsedTime * 1.6;
    }
  });

  useEffect(() => {
    const assembled = hovered || entered;
    if (coreGroupRef.current) {
      const s = assembled ? 1 : 0.0001;
      gsap.to(coreGroupRef.current.scale, {
        x: s, y: s, z: s,
        duration: assembled ? 0.9 : 0.7,
        ease: assembled ? "back.out(1.6)" : "power2.inOut",
        overwrite: true,
      });
    }
    if (hazeMatRef.current) {
      gsap.to(hazeMatRef.current, { opacity: assembled ? 0.5 : 0, duration: 0.9, overwrite: true });
    }
    if (coreMatRef.current) {
      gsap.to(coreMatRef.current, {
        uGlowStrength: assembled ? 3.2 : 1.0,
        uBloomIntensity: assembled ? 9 : 4,
        duration: 0.9,
        overwrite: true,
      });
    }
  }, [hovered, entered]);

  const handlePointerOver = (e) => {
    e.stopPropagation();
    if (locked || entered) return;
    setHovered(true);
    document.body.style.cursor = "pointer";
  };
  const handlePointerOut = (e) => {
    e.stopPropagation();
    if (locked || entered) return;
    setHovered(false);
    document.body.style.cursor = "auto";
  };
  const handleClick = (e) => {
    e.stopPropagation();
    if (locked || entered) return;
    setEntered(true);
    setHovered(true);
    document.body.style.cursor = "auto";

    if (coreMatRef.current) {
      gsap.to(coreMatRef.current, {
        uGlowStrength: 6, uBloomIntensity: 16,
        duration: 0.45, yoyo: true, repeat: 1,
      });
    }
    gsap.delayedCall(0.85, () => onEnter?.());
  };

  return (
    <group onPointerOver={handlePointerOver} onPointerOut={handlePointerOut} onClick={handleClick}>
      {/* Invisible hit-area covering the whole gate (broken pieces have gaps
          between them - without this, moving the mouse through a gap fires
          pointerout/pointerover rapidly and can leave the core's glow tween
          stuck mid-transition). This is the ONLY thing that should drive
          hover/click; the fragments themselves no longer need to. */}
      <mesh position={[0, 0, 0]} renderOrder={-1}>
        <sphereGeometry args={[TARGET_HEIGHT * 0.68, 12, 12]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} depthTest={false} />
      </mesh>

      <group
        ref={innerRef}
        scale={fitScale}
        position={[
          -fitCenter.x * fitScale,
          -fitCenter.y * fitScale,
          -fitCenter.z * fitScale,
        ]}
      >
        {fragments.map((f, i) => (
          <PortalFragment
            key={i}
            index={i}
            geometry={f.geometry}
            center={f.center}
            assembledRotation={f.rot || [0, 0, 0]}
            hovered={hovered}
            entered={entered}
            locked={locked}
            color={fragmentColor}
          />
        ))}

        {/* Core + Haze */}
        <group ref={coreGroupRef} scale={0.0001}>
          {coreGeo ? (
            <mesh 
              geometry={coreGeo} 
              position={[0, CORE_Y_OFFSET, CORE_Z_OFFSET]} 
              frustumCulled={false}
            >
              <gateMaterial
                ref={coreMatRef}
                side={THREE.DoubleSide}
                transparent
                uMaskEnabled={1}
                uMaskSize={coreMaskSize}
                uMaskEdge={0.045}
              />
            </mesh>
          ) : (
            <mesh
              position={[0, CORE_Y_OFFSET, CORE_Z_OFFSET]}
              frustumCulled={false}
            >
              <planeGeometry args={[TARGET_HEIGHT * 0.48, TARGET_HEIGHT * 0.48]} />
              <gateMaterial
                ref={coreMatRef}
                side={THREE.DoubleSide}
                transparent
                uMaskEnabled={1}
                uMaskSize={[TARGET_HEIGHT * 0.48, TARGET_HEIGHT * 0.48]}
                uMaskEdge={0.05}
              />
            </mesh>
          )}

          {hazeGeo && (
            <mesh 
              geometry={hazeGeo} 
              position={[0, CORE_Y_OFFSET, CORE_Z_OFFSET]} 
              frustumCulled={false}
            >
              <meshBasicMaterial
                ref={hazeMatRef}
                color="#ffb066"
                transparent
                opacity={0}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
              />
            </mesh>
          )}
        </group>
      </group>
    </group>
  );
}

/* Loaded Gate */
function LoadedGate({ modelPath, locked, onEnter, fragmentColor }) {
  const { nodes, scene } = useGLTF(modelPath);

  const { fragments, coreGeo, hazeGeo } = useMemo(() => {
    let structureMesh = nodes[NODE_MAP.structure];
    let coreMesh = nodes[NODE_MAP.core];
    let hazeMesh = nodes[NODE_MAP.haze];

    if (!structureMesh?.isMesh) {
      scene.traverse((o) => {
        if (!structureMesh && o.isMesh && !/particle/i.test(o.name)) structureMesh = o;
      });
    }

    if (!structureMesh) {
      console.warn("[PortalGate] No structure mesh — using procedural");
      return { fragments: buildArchFragments(), coreGeo: null, hazeGeo: null };
    }

    structureMesh.updateWorldMatrix(true, false);
    const bakedStructure = structureMesh.geometry.clone().applyMatrix4(structureMesh.matrixWorld);
    const frags = fractureGeometry(bakedStructure, FRAGMENT_COUNT, 7).map(f => ({ ...f, rot: [0, 0, 0] }));

    const coreGeo = coreMesh?.isMesh 
      ? coreMesh.geometry.clone().applyMatrix4(coreMesh.matrixWorld) 
      : null;

    const hazeGeo = hazeMesh?.isMesh 
      ? hazeMesh.geometry.clone().applyMatrix4(hazeMesh.matrixWorld) 
      : null;

    return { fragments: frags, coreGeo, hazeGeo };
  }, [nodes, scene]);

  return <GateAssembly fragments={fragments} coreGeo={coreGeo} hazeGeo={hazeGeo} locked={locked} onEnter={onEnter} fragmentColor={fragmentColor} />;
}

function ProceduralGate({ locked, onEnter, fragmentColor }) {
  const fragments = useMemo(() => buildArchFragments(), []);
  return <GateAssembly fragments={fragments} coreGeo={null} hazeGeo={null} locked={locked} onEnter={onEnter} fragmentColor={fragmentColor} />;
}

export default function PortalGate({
  modelPath = "./models/intro/fantasy-gate.glb",
  position = [0, 0, 0],
  locked = false,
  onEnter,
  fragmentColor = "#4a3526",
}) {
  return (
    <group position={position}>
      <AssetErrorBoundary
        label="PortalGate"
        fallback={<ProceduralGate locked={locked} onEnter={onEnter} fragmentColor={fragmentColor} />}
      >
        <Suspense fallback={null}>
          <LoadedGate modelPath={modelPath} locked={locked} onEnter={onEnter} fragmentColor={fragmentColor} />
        </Suspense>
      </AssetErrorBoundary>
    </group>
  );
}