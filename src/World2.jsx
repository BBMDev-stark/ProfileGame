import { useGLTF } from "@react-three/drei";
import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import gsap from "gsap";
import * as THREE from "three";
import "./shaders/gate/GateMaterial"; // registers <gateMaterial /> via extend()

export default function World2({ showWorld, onObjectClick }) {
  const { nodes } = useGLTF("./models/new room/web 2.glb");

  const gateMaterialRef = useRef();
  const group = useRef();
  const handleMeshClick = (objectName) => {
    // if (clicksLocked) return; // Prevent clicks if locked

    // console.log("animate");
    if (onObjectClick) {
      onObjectClick();
    }
  };
  useEffect(() => {
    if (!showWorld && group.current) {
      gsap.to(group.current.scale, {
        y: 0.01,
        x: 0.01,
        z: 0.01,
        duration: 0.5,
      });
    } else if (showWorld && group.current) {
      gsap.to(group.current.scale, { y: 1.5, x: 1.5, z: 1.5, duration: 0.5 });
    } else {
      null;
    }
  }, [showWorld]);
  useFrame((state) => {
    if (gateMaterialRef.current) {
      gateMaterialRef.current.uTime = state.clock.elapsedTime * 5;
    }
  });

  return (
    <>
      <group
        key={50}
        ref={group}
        position={[0, -17, 0]}
        rotation={[0, 0, 0]}
        scale={[1.5, 1.5, 1.5]}
      >
        {Object.keys(nodes).map((key) => {
          const node = nodes[key];

          if (node.isMesh) {
            if (node.name === "gate") {
              return (
                <mesh
                  key={key}
                  scale={node.scale}
                  position={node.position}
                  rotation={node.rotation}
                  frustumCulled={false}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMeshClick("reset");
                  }}
                  onPointerOver={(e) =>
                    (document.body.style.cursor = "pointer")
                  }
                  onPointerOut={(e) => (document.body.style.cursor = "auto")}
                >
                  <planeGeometry args={[1.035, 1.4]}></planeGeometry>
                  <gateMaterial ref={gateMaterialRef} side={THREE.DoubleSide} />
                </mesh>
              );
            } else {
              return (
                <mesh
                  key={key}
                  scale={node.scale}
                  position={node.position}
                  rotation={node.rotation}
                  geometry={node.geometry}
                  material={node.material}
                  frustumCulled={false}
                />
              );
            }
          }
          return null;
        })}
        {showWorld && (
          <pointLight
            position={[1, 5, 4]}
            color={"#ffaa00"}
            rotation={[Math.PI / 1, 0, 0]}
            intensity={100}
            castShadow
          />
        )}
      </group>
    </>
  );
}
