varying vec2 vUv;

uniform float uTime;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
uniform vec2 uResolution;
uniform float uScale;
uniform float uPixelFilter;
uniform float uSpinSpeed;
uniform float uContrast;
uniform float uBloomIntensity;
uniform float uGlowStrength;

// ---------------------------------------------------------------------
// This is the same "spinning colour portal" algorithm that drives the
// intro gate's core (see ../../../shaders/gate/fragment.glsl -> effect()),
// kept as its own small material so the Creative-section demo can run
// it standalone with a clean main() — the gate's fragment shader has an
// extra, unconditional second pass appended after this function whose
// `mod(uv, 0.0)` divides by zero on every pixel; some GPUs' fast-math
// quietly tolerate that, but it's not something to depend on for a
// public-facing demo, and shaders/gate/* is left untouched on purpose.
// ---------------------------------------------------------------------
#define SPIN_ROTATION -2.0
#define OFFSET vec2(0.0)
#define LIGHTING 0.4
#define SPIN_AMOUNT 0.25
#define SPIN_EASE 1.0
#define IS_ROTATE false

vec4 effect(vec2 screenSize, vec2 screen_coords) {
    float pixel_size = length(screenSize.xy) / uPixelFilter;
    vec2 uv = (floor(screen_coords.xy * (1.0 / pixel_size)) * pixel_size - 0.5 * screenSize.xy) / length(screenSize.xy) - OFFSET;
    float uv_len = length(uv);

    float speed = (SPIN_ROTATION * SPIN_EASE * 0.2);
    if (IS_ROTATE) {
        speed = uTime * speed;
    }
    speed += 302.2;
    float new_pixel_angle = atan(uv.y, uv.x) + speed - SPIN_EASE * 20.0 * (1.0 * SPIN_AMOUNT * uv_len + (1.0 - 1.0 * SPIN_AMOUNT));
    vec2 mid = (screenSize.xy / length(screenSize.xy)) / 2.0;
    uv = (vec2((uv_len * cos(new_pixel_angle) + mid.x), (uv_len * sin(new_pixel_angle) + mid.y)) - mid);

    uv *= 30.0 * uScale;
    speed = uTime * uSpinSpeed;
    vec2 uv2 = vec2(uv.x + uv.y);

    for (int i = 0; i < 5; i++) {
        uv2 += sin(max(uv.x, uv.y)) + uv;
        uv += 0.5 * vec2(cos(5.1123314 + 0.353 * uv2.y + speed * 0.131121), sin(uv2.x - 0.113 * speed));
        uv -= 1.0 * cos(uv.x + uv.y) - 1.0 * sin(uv.x * 0.711 - uv.y);
    }

    float contrast_mod = (0.25 * uContrast + 0.5 * SPIN_AMOUNT + 1.2);
    float paint_res = min(2.0, max(0.0, length(uv) * 0.035 * contrast_mod));
    float c1p = max(0.0, 1.0 - contrast_mod * abs(1.0 - paint_res));
    float c2p = max(0.0, 1.0 - contrast_mod * abs(paint_res));
    float c3p = 1.0 - min(1.0, c1p + c2p);
    float light = (LIGHTING - 0.2) * max(c1p * 5.0 - 4.0, 0.0) + LIGHTING * max(c2p * 5.0 - 4.0, 0.0);

    vec4 color1 = vec4(uColor1 * uBloomIntensity, 1.0);
    vec4 color2 = vec4(uColor2 * uBloomIntensity, 1.0);
    vec4 color3 = vec4(uColor3, 1.0);

    vec4 baseColor = (0.3 / uContrast) * color1 + (1.0 - 0.3 / uContrast) * (color1 * c1p + color2 * c2p + vec4(c3p * color3.rgb, c3p * color1.a));

    vec4 glowColor = vec4(light * uGlowStrength);
    vec4 finalColor = baseColor + glowColor;

    float brightness = dot(finalColor.rgb, vec3(0.299, 0.587, 0.114));
    if (brightness > 0.5) {
        finalColor.rgb *= mix(1.0, uBloomIntensity * 1.5, smoothstep(0.5, 1.0, brightness));
    }

    return finalColor;
}

void main() {
    vec2 screenSize = uResolution;
    vec2 screen_coords = vUv * screenSize;
    gl_FragColor = effect(screenSize, screen_coords);
}
