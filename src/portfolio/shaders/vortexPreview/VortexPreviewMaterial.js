import { shaderMaterial } from "@react-three/drei";
import { extend } from "@react-three/fiber";
import * as THREE from "three";
import vertexShader from "./vertex.glsl";
import fragmentShader from "./fragment.glsl";

// Same uniform set/algorithm as shaders/gate/GateMaterial.js's swirling
// portal core, packaged as its own material for the Creative section's
// live demo. See fragment.glsl for why this isn't just <gateMaterial/>
// with a couple of props.
export const VortexPreviewMaterial = shaderMaterial(
  {
    uTime: 0,
    uColor1: new THREE.Color("#1c1030"),
    uColor2: new THREE.Color("#e8a857"),
    uColor3: new THREE.Color("#07050f"),
    uResolution: new THREE.Vector2(600, 400),
    uScale: 1.0,
    uPixelFilter: 745.0,
    uSpinSpeed: 1.4,
    uContrast: 3.2,
    uBloomIntensity: 6.0,
    uGlowStrength: 2.6,
  },
  vertexShader,
  fragmentShader
);

extend({ VortexPreviewMaterial });
