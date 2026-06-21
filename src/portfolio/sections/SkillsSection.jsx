import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { skills } from "../../data/portfolioData";
import { revealOnScroll } from "../scrollReveal";

export default function SkillsSection() {
  const sectionRef = useRef(null);

  useGSAP(
    () => {
      revealOnScroll(sectionRef.current, ".pf-reveal", { stagger: 0.05 });
    },
    { scope: sectionRef }
  );

  return (
    <section id="skills" className="pf-section" ref={sectionRef}>
      <div className="pf-section__inner">
        <header className="pf-chapter-head pf-reveal">
          <p className="pf-chapter-head__eyebrow">Chapter III</p>
          <h2 className="pf-chapter-head__title">The Arsenal</h2>
          <p className="pf-chapter-head__subtitle">Skills &amp; Tools</p>
        </header>

        <div className="pf-skills__columns">
          <div className="pf-skills__column pf-reveal">
            <p className="pf-skills__column-title">Technical Skills</p>
            <div className="pf-skills__grid">
              {skills.technical.map((skill) => (
                <span key={skill} className="pf-skill-tile">
                  <span className="pf-skill-tile__mark" aria-hidden="true" />
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div className="pf-skills__column pf-reveal">
            <p className="pf-skills__column-title">Programming Languages</p>
            <div className="pf-skills__grid">
              {skills.languages.map((lang) => (
                <span key={lang} className="pf-skill-tile">
                  <span className="pf-skill-tile__mark" aria-hidden="true" />
                  {lang}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}