import { useEffect, useRef, useState } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { chapters } from "../data/portfolioData";

/**
 * ChapterRail — vertical (desktop) / top-bar (mobile) scroll-spy nav.
 * Each chapter gets a ScrollTrigger watching its own <section>; whichever
 * one is most centered in the viewport is marked active. Clicking a
 * chapter asks Lenis (via the shared instance ref) to smooth-scroll there,
 * so the rail and the scrolling itself are driven by the same engine.
 */
export default function ChapterRail({ lenisRef }) {
  const [active, setActive] = useState(chapters[0].id);
  const triggersRef = useRef([]);

  useEffect(() => {
    triggersRef.current = chapters.map(({ id }) =>
      ScrollTrigger.create({
        trigger: `#${id}`,
        start: "top center",
        end: "bottom center",
        onToggle: ({ isActive }) => {
          if (isActive) setActive(id);
        },
      })
    );

    return () => {
      triggersRef.current.forEach((t) => t.kill());
      triggersRef.current = [];
    };
  }, []);

  const goTo = (id) => {
    const target = document.getElementById(id);
    if (!target) return;
    if (lenisRef?.current) {
      lenisRef.current.scrollTo(target, { offset: -8, duration: 1.2 });
    } else {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav className="pf-rail" aria-label="Portfolio chapters">
      {chapters.map((chapter) => (
        <button
          key={chapter.id}
          type="button"
          className={`pf-rail__item${active === chapter.id ? " pf-rail__item--active" : ""}`}
          onClick={() => goTo(chapter.id)}
          aria-current={active === chapter.id ? "true" : undefined}
        >
          <span className="pf-rail__num" aria-hidden="true" />
          <span className="pf-rail__label">
            {chapter.numeral}. {chapter.label}
          </span>
        </button>
      ))}
    </nav>
  );
}
