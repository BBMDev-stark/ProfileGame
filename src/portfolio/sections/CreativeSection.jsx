import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { devlog, techBadges } from "../../data/portfolioData";
import { revealOnScroll } from "../scrollReveal";
import ShaderPlayground from "./ShaderPlayground";

export default function CreativeSection() {
  const sectionRef = useRef(null);

  useGSAP(
    () => {
      revealOnScroll(sectionRef.current, ".pf-reveal", { stagger: 0.1 });
    },
    { scope: sectionRef }
  );

  return (
    <section id="creative" className="pf-section" ref={sectionRef}>
      <div className="pf-section__inner">
        <header className="pf-chapter-head pf-reveal">
          <p className="pf-chapter-head__eyebrow">Chapter V</p>
          <h2 className="pf-chapter-head__title">The Forge</h2>
          <p className="pf-chapter-head__subtitle">Behind the Scenes</p>
        </header>

        <div className="pf-forge__layout">
          <div className="pf-reveal">
            <ShaderPlayground />
          </div>

          <div className="pf-reveal">
            <ul className="pf-devlog">
              {devlog.map((entry) => (
                <li key={entry.title} className="pf-devlog__item">
                  <p className="pf-devlog__title">{entry.title}</p>
                  <p className="pf-devlog__text">{entry.text}</p>
                </li>
              ))}
            </ul>

            <p className="pf-skills__column-title" style={{ marginBottom: "0.85rem" }}>
              Built this site with
            </p>
            <div className="pf-tech-badges">
              {techBadges.map((badge) => (
                <span key={badge} className="pf-chip">
                  {badge}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
