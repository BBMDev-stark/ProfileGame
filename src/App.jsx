import { useEffect, useState, useRef, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import gsap from "gsap";
import Loader from "./Loader";
import "./CSS/index.css";
import "./CSS/transition.css";
// Html.jsx (the old post-intro UI) is no longer mounted, so the icon font
// is pulled in here instead - both the intro's contact-footer and the new
// Contact chapter in MainPortfolio use "fa-*" icon classes.
import "@fortawesome/fontawesome-free/css/all.min.css";
import IntroOverlay from "./IntroOverlay.jsx";
import IntroWorld from "./IntroWorld.jsx";
import Effects from "./Effects.jsx";
import TransitionCameraPunch from "./TransitionCameraPunch.jsx";
import MainPortfolio from "./portfolio/MainPortfolio.jsx";

/**
 * App.jsx
 * ----------------------------------------------------------------------
 * Two acts, one continuous world:
 *   1) The intro (IntroWorld + PortalGate) renders inside the 3D <Canvas>
 *      until the visitor clicks the gate.
 *   2) handleEnterMainWorld() plays a short cinematic hand-off - fisheye
 *      pull, rotational swirl + darken-to-black, camera punch - then swaps
 *      whole <Canvas> for <MainPortfolio/>, the scrolling chapter-based
 *      site (Chapter I: The Adventurer -> Projects -> Skills ->
 *      Achievements -> Creative -> Contact).
 *
 * The old Html.jsx / World.jsx / World2.jsx / Controls.jsx /
 * CameraControls.jsx / Projects.jsx 3D-room navigation is retired - that's
 * what was rendering instead of MainPortfolio. IntroWorld.jsx,
 * IntroOverlay.jsx, PortalGate.jsx, Effects.jsx and shaders/gate/* are
 * untouched.
 */
export default function App() {
  const [loaded, setLoaded] = useState(false);
  const [introPassed, setIntroPassed] = useState(false);
  const [introTransitioning, setIntroTransitioning] = useState(false);

  const effectsRef = useRef(null);
  const cameraPunchRef = useRef(null);
  const fadeRef = useRef(null);

  useEffect(() => {
    document.body.style.overflow = "auto";
  }, []);

  const glSettings = useMemo(
    () => ({
      powerPerference: "high-performance",
      antialias: true,
      stencil: false,
      depth: true,
    }),
    []
  );

  /**
   * The "step through the gate" cinematic. Runs once, then unmounts the
   * intro Canvas and mounts MainPortfolio while the screen is fully black,
   * so the React swap itself is never visible.
   *
   * No white flash - a black hole gets darker as you fall in, not
   * brighter. The SwirlEffect rotates the screen around the gate (more
   * twist the closer to center) while darkening to black at that same
   * point; the fisheye pull and camera punch add to the "falling in"
   * momentum on top of it.
   *
   * Timeline (seconds from call time):
   *   0.00 - 1.30  fisheye eRadius 2 -> 0 (pulled toward the vortex)
   *   0.00 - 1.30  swirl rotation + darken-to-black ramps up, in parallel
   *   0.00 - 1.30  camera fov/z punch forward, in parallel
   *   1.05 - 1.30  a brief residual fade (safety net for the React swap -
   *                screen is already nearly black from the swirl by then)
   *   1.35         React swap: intro unmounts, MainPortfolio mounts
   *   1.40 - 2.60  swirl/fisheye/fade all release back out
   */
  const handleEnterMainWorld = () => {
    if (introTransitioning) return;
    setIntroTransitioning(true);

    const radiusUniform =
      effectsRef.current?.fisheyeEffect?.uniforms.get("eRadius") || {};
    const swirlUniforms = effectsRef.current?.swirlEffect?.uniforms;

    cameraPunchRef.current?.punch(1.3);

    const tl = gsap.timeline({
      onComplete: () => setIntroTransitioning(false),
    });

    // fall in: fisheye pulls inward while the swirl twists + darkens
    tl.to(radiusUniform, { value: 0, duration: 1.3, ease: "power2.in" }, 0);
    if (swirlUniforms) {
      tl.to(swirlUniforms.get("sStrength"), { value: 1, duration: 1.3, ease: "power2.in" }, 0);
    }
    // tiny safety-net fade so the React swap itself is never visible, even
    // on the off chance the swirl hasn't gone fully opaque at the center
    tl.to(fadeRef.current, { opacity: 1, duration: 0.3, ease: "power1.in" }, 1.0);

    tl.call(() => setIntroPassed(true), null, 1.35);

    // emerge: everything releases back out together
    tl.to(radiusUniform, { value: 2, duration: 1.2, ease: "power2.out" }, 1.4);
    if (swirlUniforms) {
      tl.to(swirlUniforms.get("sStrength"), { value: 0, duration: 1.2, ease: "power2.out" }, "<");
    }
    tl.to(fadeRef.current, { opacity: 0, duration: 1.0, ease: "power2.out" }, "<");
  };

  return (
    <>
      {!loaded && <Loader onLoaded={() => setLoaded(true)} />}

      {/* the cinematic fade overlay - see CSS/transition.css */}
      <div className="gate-fade" ref={fadeRef} />

      {!introPassed && (
        <Canvas
          dpr={[window.devicePixelRatio, 2]}
          style={{
            width: "100vw",
            height: "100vh",
            position: "fixed",
            top: 0,
            left: 0,
          }}
          shadows={false}
          gl={glSettings}
          camera={{ position: [0, 3.2, 11], fov: 46 }}
        >
          <color attach="background" args={["#000"]} />
          <Effects ref={effectsRef} />
          <TransitionCameraPunch ref={cameraPunchRef} />
          <IntroWorld onEnter={handleEnterMainWorld} transitioning={introTransitioning} />
        </Canvas>
      )}

      {!introPassed ? <IntroOverlay loaded={loaded} /> : <MainPortfolio />}

      {/* Only the intro phase shows this floating footer - the real
          contact links live in MainPortfolio's own Contact chapter. */}
      {!introPassed && (
        <div className="contact-footer">
          <div className="contact-icons">
            <a
              href="https://github.com/BBMDev-stark"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub Profile"
            >
              <i className="fab fa-github"></i>
            </a>
            <a
              href="https://www.linkedin.com/in/yourlinkedin/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn Profile"
            >
              <i className="fab fa-linkedin"></i>
            </a>
            <a href="mailto:buiminh19102004@gmail.com" aria-label="Email Contact">
              <i className="fas fa-envelope"></i>
            </a>
            <a
              href="/Portfolio/CV/CV-BuiBinhMinh.pdf"
              target="_blank"
              rel="noopener noreferrer"
            >
              <p className="fas">CV</p>
            </a>
          </div>
        </div>
      )}
    </>
  );
}