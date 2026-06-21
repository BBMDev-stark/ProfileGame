import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * IntroFireflies
 * ----------------------------------------------------------------------
 * Warm, flickering motes that wander in lazy loops around the gate
 * clearing - distinct from IntroWorld's existing straight-rising Embers
 * (those read as heat/magic coming off the portal itself; these read as
 * living creatures inhabiting the ruins/forest, reinforcing the "ancient
 * world that's alive" brief). Each firefly gets its own randomized orbit
 * radius/speed/phase so the swarm never looks like a single repeating
 * pattern, plus an independent flicker frequency on top of the orbit so
 * they don't all pulse in lockstep.
 */
export default function IntroFireflies({ count = 26, spread = 9, color = "#ffcf8a" }) {
  const pointsRef = useRef();

  const data = useMemo(() => {
    const centers = new Float32Array(count * 3);
    const radii = new Float32Array(count);
    const speeds = new Float32Array(count);
    const phases = new Float32Array(count);
    const heights = new Float32Array(count);
    const flickerFreq = new Float32Array(count);
    const flickerPhase = new Float32Array(count);
    const baseSize = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      // keep orbit centers clear of the gate's own core effect (~3.5
      // units) so the swarm reads as inhabiting the grove around the
      // gate rather than constantly drifting across its glowing core
      const dist = 4.2 + Math.random() * spread;
      centers[i * 3] = Math.cos(angle) * dist;
      centers[i * 3 + 1] = 0;
      centers[i * 3 + 2] = Math.sin(angle) * dist - 2;
      radii[i] = 0.5 + Math.random() * 1.4;
      speeds[i] = 0.15 + Math.random() * 0.3;
      phases[i] = Math.random() * Math.PI * 2;
      heights[i] = 0.3 + Math.random() * 2.4;
      flickerFreq[i] = 1.5 + Math.random() * 2.5;
      flickerPhase[i] = Math.random() * Math.PI * 2;
      baseSize[i] = 0.05 + Math.random() * 0.05;
    }

    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const opacities = new Float32Array(count);

    return {
      centers, radii, speeds, phases, heights,
      flickerFreq, flickerPhase, baseSize,
      positions, sizes, opacities,
    };
  }, [count, spread]);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(data.positions, 3));
    geo.setAttribute("aSize", new THREE.BufferAttribute(data.sizes, 1));
    geo.setAttribute("aOpacity", new THREE.BufferAttribute(data.opacities, 1));
    return geo;
  }, [data]);

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uColor: { value: new THREE.Color(color) },
      },
      vertexShader: /* glsl */ `
        attribute float aSize;
        attribute float aOpacity;
        varying float vOpacity;
        void main() {
          vOpacity = aOpacity;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = aSize * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform vec3 uColor;
        varying float vOpacity;
        void main() {
          vec2 uv = gl_PointCoord - 0.5;
          float d = length(uv);
          float glow = smoothstep(0.5, 0.0, d);
          glow = pow(glow, 1.6);
          gl_FragColor = vec4(uColor, glow * vOpacity);
        }
      `,
    });
  }, [color]);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const t = state.clock.elapsedTime;
    const posAttr = pointsRef.current.geometry.attributes.position;
    const sizeAttr = pointsRef.current.geometry.attributes.aSize;
    const opAttr = pointsRef.current.geometry.attributes.aOpacity;

    for (let i = 0; i < count; i++) {
      const cx = data.centers[i * 3];
      const cz = data.centers[i * 3 + 2];
      const orbitAngle = t * data.speeds[i] + data.phases[i];
      const x = cx + Math.cos(orbitAngle) * data.radii[i];
      const z = cz + Math.sin(orbitAngle * 0.85) * data.radii[i];
      const y = data.heights[i] + Math.sin(t * 0.6 + data.phases[i]) * 0.35;

      posAttr.setXYZ(i, x, y, z);

      const flicker = 0.45 + 0.55 * Math.sin(t * data.flickerFreq[i] + data.flickerPhase[i]) ** 2;
      opAttr.setX(i, flicker);
      sizeAttr.setX(i, data.baseSize[i] * (0.8 + 0.4 * flicker));
    }

    posAttr.needsUpdate = true;
    sizeAttr.needsUpdate = true;
    opAttr.needsUpdate = true;
  });

  return <points ref={pointsRef} geometry={geometry} material={material} frustumCulled={false} />;
}
