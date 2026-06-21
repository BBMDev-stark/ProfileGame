import { useEffect, useRef } from "react";
import gsap from "gsap";
import "./CSS/introWorld.css";

/**
 * Fantasy-themed overlay shown while IntroWorld (the broken portal scene)
 * is active. No START button here - hovering/clicking the 3D gate itself
 * is the call to action, so this is just name/title + a small hint.
 * Fades in once `loaded` (the real Loader) finishes.
 */
export default function IntroOverlay({ loaded }) {
  const rootRef = useRef(null);

  useEffect(() => {
    if (!loaded || !rootRef.current) return;
    gsap.fromTo(
      rootRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 1.4, ease: "power2.out", delay: 0.3 }
    );
  }, [loaded]);

  return (
    <div className="intro-fantasy-overlay" ref={rootRef}>
      <div className="intro-fantasy-content">
        <p className="intro-fantasy-kicker">An Ancient Adventure Awaits</p>
        <h1 className="intro-fantasy-title">BUI BINH MINH</h1>
        <p className="intro-fantasy-subtitle">
          Game Developer · Unity &amp; C# · Interactive Tech
        </p>
      </div>

      <div className="intro-fantasy-hint">
        <span className="intro-fantasy-hint-dot" />
        Hover the gate to awaken it — click to step through
      </div>
    </div>
  );
}
