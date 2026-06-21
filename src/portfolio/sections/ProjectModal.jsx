import { useEffect, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

export default function ProjectModal({ project, onClose }) {
  const overlayRef = useRef(null);
  const modalRef = useRef(null);

  useGSAP(() => {
    gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.25 });
    gsap.fromTo(
      modalRef.current,
      { opacity: 0, y: 18, scale: 0.97 },
      { opacity: 1, y: 0, scale: 1, duration: 0.35, ease: "power3.out" }
    );
  }, []);

  // close on Escape, and lock body scroll while the modal is open
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!project) return null;

  return (
    <div
      className="pf-modal-overlay"
      ref={overlayRef}
      onMouseDown={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div className="pf-modal" ref={modalRef} role="dialog" aria-modal="true" aria-label={project.title}>
        <button type="button" className="pf-modal__close" onClick={onClose} aria-label="Close">
          ✕
        </button>

        <p className="pf-modal__period">{project.period}</p>
        <h3 className="pf-modal__title">{project.title}</h3>

        <div className="pf-modal__tech">
          {project.tech.map((t) => (
            <span key={t} className="pf-chip">
              {t}
            </span>
          ))}
        </div>

        <ul className="pf-modal__list">
          {project.details.map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ul>

        {project.award && <p className="pf-modal__award">{project.award}</p>}
      </div>
    </div>
  );
}
