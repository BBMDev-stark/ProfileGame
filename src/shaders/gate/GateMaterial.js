import { shaderMaterial } from "@react-three/drei";
import { extend } from "@react-three/fiber";
import * as THREE from "three";
import vertexShader from "./vertex.glsl";
import fragmentShader from "./fragment.glsl";

// Shared portal-vortex shader material used by World.jsx, World2.jsx, and
// the fantasy IntroWorld / PortalGate.
//
// Key change vs previous version:
//   - uResolution is now square (600×600) to match the circular portal
//     opening confirmed by XZ vertex analysis (perfect circle, r≈2.61).
//   - uMaskEdge raised to 0.08 — the circle SDF needs a slightly wider
//     feather than the old arch shape to avoid aliasing on the curved edge.
//   - uMaskSize default stays (1,1); callers must supply the real quad size.
export const GateMaterial = shaderMaterial(
  {
    uTime:          0,
    uColor1:        new THREE.Color("#000"),      // first colour
    uColor2:        new THREE.Color("#ff8200"),   // second colour (amber vortex)
    uColor3:        new THREE.Color("#000"),      // third colour (background)
    uResolution:    new THREE.Vector2(600, 600),  // square — portal is circular
    uScale:         1.0,
    uPixelFilter:   745.0,
    uSpinSpeed:     7.0,
    uContrast:      3.5,
    uBloomIntensity: 7.0,
    uGlowStrength:  2.5,
    // Mask uniforms
    // uMaskEnabled = 0  →  old rectangular fill (World.jsx / World2.jsx)
    // uMaskEnabled = 1  →  circle mask (PortalGate intro)
    uMaskEnabled:   0,
    uMaskSize:      new THREE.Vector2(1, 1),  // pass equal x/y for true circle
    uMaskEdge:      0.08,                     // softer feather suits the circle SDF
  },
  vertexShader,
  fragmentShader
);

extend({ GateMaterial });