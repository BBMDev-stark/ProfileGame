import { useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import "../shaders/vortexPreview/VortexPreviewMaterial"; // registers <vortexPreviewMaterial />

/**
 * VortexPlane — a flat quad running the same swirling-portal shader
 * algorithm as the intro gate's core, repackaged as VortexPreviewMaterial
 * (see ../shaders/vortexPreview/fragment.glsl for why it's a separate
 * material rather than <gateMaterial/> directly). Sliders below feed its
 * uniforms live.
 */
function VortexPlane({ spin, glow, bloom, contrast }) {
  const matRef = useRef();
  const { size } = useThree();

  useFrame((state) => {
    if (!matRef.current) return;
    matRef.current.uTime = state.clock.elapsedTime;
    matRef.current.uResolution.set(size.width, size.height);
  });

  return (
    <mesh>
      <planeGeometry args={[2.3, 1.6]} />
      <vortexPreviewMaterial
        ref={matRef}
        uSpinSpeed={spin}
        uGlowStrength={glow}
        uBloomIntensity={bloom}
        uContrast={contrast}
        transparent
      />
    </mesh>
  );
}

function SliderRow({ label, value, min, max, step, onChange }) {
  return (
    <label className="pf-slider-row">
      <span>{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        aria-label={label}
      />
      <span className="pf-slider-row__value">{value.toFixed(1)}</span>
    </label>
  );
}

export default function ShaderPlayground() {
  const [spin, setSpin] = useState(1.4);
  const [glow, setGlow] = useState(2.6);
  const [bloom, setBloom] = useState(6);
  const [contrast, setContrast] = useState(3.2);

  return (
    <div className="pf-forge__canvas-card">
      <div className="pf-forge__canvas-wrap">
        <Canvas camera={{ position: [0, 0, 2.15], fov: 50 }} dpr={[1, 1.8]} gl={{ antialias: true }}>
          <VortexPlane spin={spin} glow={glow} bloom={bloom} contrast={contrast} />
        </Canvas>
      </div>
      <div className="pf-forge__canvas-caption">
        <span>portfolio/shaders/vortexPreview</span>
        <span>live uniforms</span>
      </div>

      <div className="pf-forge__controls">
        <SliderRow label="Vortex Speed" value={spin} min={0.2} max={4} step={0.05} onChange={setSpin} />
        <SliderRow label="Glow" value={glow} min={0.5} max={6} step={0.05} onChange={setGlow} />
        <SliderRow label="Bloom" value={bloom} min={2} max={14} step={0.1} onChange={setBloom} />
        <SliderRow label="Contrast" value={contrast} min={1} max={6} step={0.05} onChange={setContrast} />
      </div>
    </div>
  );
}
