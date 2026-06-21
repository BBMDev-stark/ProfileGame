import { useEffect, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

/**
 * AchievementLightbox — full-screen enlarged view of a trophy card's image.
 * Same open/close animation pattern as ProjectModal.jsx, kept separate
 * since this one is image-first (no bullet list, no tech chips).
 */
export default function AchievementLightbox({ award, onClose }) {
  const overlayRef = useRef(null);
  const figureRef = useRef(null);

  useGSAP(() => {
    gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.25 });
    gsap.fromTo(
      figureRef.current,
      { opacity: 0, scale: 0.94 },
      { opacity: 1, scale: 1, duration: 0.35, ease: "power3.out" }
    );
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!award) return null;

  return (
    <div
      className="pf-lightbox-overlay"
      ref={overlayRef}
      onMouseDown={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <button type="button" className="pf-lightbox-close" onClick={onClose} aria-label="Close">
        ✕
      </button>
      <figure className="pf-lightbox-figure" ref={figureRef}>
        <img className="pf-lightbox-img" src={award.image} alt={award.event} />
        <figcaption className="pf-lightbox-caption">
          <strong>{award.title}</strong> — {award.event}
        </figcaption>
      </figure>
    </div>
  );
}