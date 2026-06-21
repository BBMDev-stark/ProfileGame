import { forwardRef, useMemo, useRef, useImperativeHandle } from "react";
import { useFrame } from "@react-three/fiber";
import { Uniform, Vector2 } from "three";
import { Effect } from "postprocessing";

// A literal "swirling into a black hole" effect: as sStrength ramps 0->1,
// the screen rotates around sCenter (more rotation the closer to center -
// a real vortex twist, not just a radial zoom/pull like FisheyeEffect),
// AND darkens toward pure black right at that same center point. No flash,
// no brightness - it reads as being pulled down into darkness, which a
// bright white flash never did.
const fragmentShader = `
uniform vec2 sCenter;
uniform float sStrength;   // 0 = off, 1 = fully swirled/dark
uniform float sSwirl;      // how many radians of twist at full strength

void mainUv(inout vec2 uv) {
  if (sStrength > 0.0) {
    vec2 toCenter = uv - sCenter;
    float dist = length(toCenter);
    float falloff = 1.0 - smoothstep(0.0, 0.8, dist);
    float angle = sStrength * sSwirl * falloff * falloff;

    float s = sin(angle);
    float c = cos(angle);
    vec2 rotated = vec2(
      toCenter.x * c - toCenter.y * s,
      toCenter.x * s + toCenter.y * c
    );

    // pull slightly inward too, on top of the rotation
    rotated *= mix(1.0, 0.55, sStrength * falloff);

    uv = sCenter + rotated;
  }
}

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  float dist = distance(uv, sCenter);
  float darken = sStrength * (1.0 - smoothstep(0.0, 0.6, dist));
  outputColor = vec4(inputColor.rgb * (1.0 - darken), inputColor.a);
}
`;

class SwirlEffectImpl extends Effect {
  constructor() {
    super("SwirlEffect", fragmentShader, {
      uniforms: new Map([
        ["sCenter", new Uniform(new Vector2(0.5, 0.5))],
        ["sStrength", new Uniform(0.0)],
        ["sSwirl", new Uniform(10.0)],
      ]),
    });
  }
}

export const SwirlEffect = forwardRef((props, ref) => {
  const effect = useMemo(() => new SwirlEffectImpl(), []);

  useImperativeHandle(ref, () => ({
    uniforms: effect.uniforms,
    effect,
  }));

  return <primitive ref={ref} object={effect} dispose={null} {...props} />;
});