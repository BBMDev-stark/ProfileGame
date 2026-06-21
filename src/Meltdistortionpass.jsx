import { forwardRef, useMemo, useRef, useImperativeHandle } from "react";
import { useFrame } from "@react-three/fiber";
import { Uniform, Vector2 } from "three";
import { Effect } from "postprocessing";

// Ported from this project's own (previously unused) shader at
// src/shaders/meltingMouse/fragment.glsl - same wave/melt distortion math,
// just adapted to the `postprocessing` library's mainUv() hook so it warps
// the sampled UV directly in the existing EffectComposer chain, instead of
// needing its own separate scene-texture render pass (the original
// SceneRenderer.jsx + useFBO approach).
//
// Original (src/shaders/meltingMouse/fragment.glsl):
//   float dist = distance(uv, uMouse);
//   if (dist < uRadius) {
//     float strength = (uRadius - dist) / uRadius;
//     float wave = sin((uv.y + uTime * 2.0) * 20.0) * 0.02 * strength;
//     uv.x += wave;
//     float waveY = cos((uv.x + uTime * 2.0) * 20.0) * 0.02 * strength;
//     uv.y += waveY;
//   }
const fragmentShader = `
uniform vec2 mCenter;
uniform float mRadius;
uniform float mStrength;
uniform float mAmplitude;
uniform float mFrequency;
uniform float mTime;

void mainUv(inout vec2 uv) {
  if (mRadius > 0.0 && mStrength > 0.0) {
    float dist = distance(uv, mCenter);
    if (dist < mRadius) {
      float falloff = (mRadius - dist) / mRadius;
      float strength = falloff * mStrength;

      float wave = sin((uv.y + mTime * 2.0) * mFrequency) * mAmplitude * strength;
      uv.x += wave;

      float waveY = cos((uv.x + mTime * 2.0) * mFrequency) * mAmplitude * strength;
      uv.y += waveY;
    }
  }
}

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  outputColor = inputColor;
}
`;

class MeltEffectImpl extends Effect {
  constructor() {
    super("MeltEffect", fragmentShader, {
      uniforms: new Map([
        ["mCenter", new Uniform(new Vector2(0.5, 0.5))],
        ["mRadius", new Uniform(0.0)], // 0 = off. Grow up to ~1.4-1.6 to cover the whole screen
        ["mStrength", new Uniform(0.0)], // 0-1 overall intensity
        ["mAmplitude", new Uniform(0.02)], // matches the original shader's wave amplitude
        ["mFrequency", new Uniform(20.0)], // matches the original shader's wave frequency
        ["mTime", new Uniform(0.0)],
      ]),
    });
  }
}

export const MeltEffect = forwardRef((props, ref) => {
  const effect = useMemo(() => new MeltEffectImpl(), []);
  const effectRef = useRef(effect);

  useImperativeHandle(ref, () => ({
    uniforms: effect.uniforms,
    effect: effect,
  }));

  useFrame((state, delta) => {
    effect.uniforms.get("mTime").value += delta;
  });

  return <primitive ref={ref} object={effect} dispose={null} {...props} />;
});