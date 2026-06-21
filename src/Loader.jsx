import { useEffect, useState, useRef } from "react";
import { useProgress } from "@react-three/drei";
import gsap from "gsap";
import "./CSS/loader.css";

// Safety net: if for some reason the loading manager never reports
// completion (e.g. a stalled connection), don't trap the visitor on the
// loader forever. Raised from 15s -> 60s because the intro's gate/forest
// GLBs are tens of MB; on a slow connection 15s wasn't enough and the
// loader would hide itself while those assets were still silently
// downloading in the background (visitor sees the UI but no gate).
const MAX_WAIT_MS = 60000;

export default function Loader({ onLoaded }) {
  const { progress, active } = useProgress();
  const [displayProgress, setDisplayProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const startedRef = useRef(false);
  const finishedRef = useRef(false);

  //refs
  const refs = useRef({
    loader: null,
    progressBar: null,
    logo: null,
    text: null,
  });

  // track whether the loading manager has actually started loading
  // anything yet (it can briefly read inactive/0 before the Canvas
  // mounts and queues its first GLTF/texture/HDRI requests)
  useEffect(() => {
    if (active) startedRef.current = true;
  }, [active]);

  // smoothly creep the displayed bar toward the real progress value
  // instead of snapping, so fast/cached loads don't look jarring
  useEffect(() => {
    const id = setInterval(() => {
      setDisplayProgress((p) => {
        if (p >= progress) return p;
        return Math.min(p + Math.max(0.6, (progress - p) * 0.18), progress);
      });
    }, 60);
    return () => clearInterval(id);
  }, [progress]);

  // real completion: loading manager started, finished, and bar caught up
  useEffect(() => {
    if (finishedRef.current) return;
    if (startedRef.current && !active && displayProgress >= 99.5) {
      finishedRef.current = true;
      setDisplayProgress(100);
    }
  }, [active, displayProgress]);

  // safety fallback so the loader can never trap a visitor indefinitely
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!finishedRef.current) {
        finishedRef.current = true;
        setDisplayProgress(100);
      }
    }, MAX_WAIT_MS);
    return () => clearTimeout(timeout);
  }, []);

  // animations
  useEffect(() => {
    if (!refs.current.logo || !refs.current.text) return;

    const timeline = gsap.timeline();

    timeline
      .fromTo(
        refs.current.logo,
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 1 }
      )
      .fromTo(
        refs.current.text,
        { opacity: 0 },
        { opacity: 1, duration: 1 },
        0
      );
  }, []);

  // progress bar
  useEffect(() => {
    if (!refs.current.progressBar) return;

    gsap.to(refs.current.progressBar, {
      width: `${displayProgress}%`,
      duration: 0.4,
      ease: "power2.out",
    });
  }, [displayProgress]);

  // loading completion
  useEffect(() => {
    if (displayProgress < 100) return;

    gsap.to(refs.current.loader, {
      opacity: 0,
      duration: 1,
      onComplete: () => {
        setIsLoading(false);
        onLoaded?.();
      },
    });
  }, [displayProgress, onLoaded]);

  if (!isLoading) return null;

  return (
    <div className="loading-container" ref={(el) => (refs.current.loader = el)}>
      {/* logo animation */}
      <video
        ref={(el) => (refs.current.logo = el)}
        src="logo.webm"
        className="logo"
        loop
        autoPlay
        muted
        playsInline
        preload="auto"
      />

      {/* loading bar container */}
      <div className="loading-bar-container">
        <div
          className="loading-bar"
          ref={(el) => (refs.current.progressBar = el)}
        />
      </div>

      {/* loading percentage */}
      <p className="loading-text" ref={(el) => (refs.current.text = el)}>
        Loading {Math.round(displayProgress)}%
      </p>
      <br />
      <br />
      <p
        className="loading-text"
        style={{ fontSize: "17px", marginTop: "20px" }}
      >
        Quick Tip: use PC or Laptop for better experince !
      </p>
    </div>
  );
}
