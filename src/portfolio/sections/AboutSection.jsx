import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { profile } from "../../data/portfolioData";
import { revealOnScroll } from "../scrollReveal";

export default function AboutSection() {
  const sectionRef = useRef(null);

  useGSAP(
    () => {
      revealOnScroll(sectionRef.current);
    },
    { scope: sectionRef }
  );

  return (
    <section id="about" className="pf-section" ref={sectionRef}>
      <div className="pf-section__inner">
        <header className="pf-chapter-head pf-reveal">
          <p className="pf-chapter-head__eyebrow">Chapter I</p>
          <h2 className="pf-chapter-head__title">The Adventurer</h2>
          <p className="pf-chapter-head__subtitle">About Me</p>
        </header>

        <div className="pf-about__grid">
          <div className="pf-about__portrait-wrap pf-reveal">
            <div className="pf-about__portrait-frame">
              <div className="pf-about__portrait-glow" aria-hidden="true" />
              <img
                className="pf-about__portrait"
                src={profile.photo}
                alt={`${profile.name}, ${profile.role}`}
                loading="lazy"
              />
            </div>

            <dl className="pf-about__facts">
              <div className="pf-about__fact">
                <dt className="pf-about__fact-label">Studying</dt>
                <dd className="pf-about__fact-value">
                  {profile.education.major} · {profile.education.school} (
                  {profile.education.period})
                </dd>
              </div>
              <div className="pf-about__fact">
                <dt className="pf-about__fact-label">Based in</dt>
                <dd className="pf-about__fact-value">{profile.location}</dd>
              </div>
              <div className="pf-about__fact">
                <dt className="pf-about__fact-label">Languages</dt>
                <dd className="pf-about__fact-value">
                  {profile.languages.join(" · ")}
                </dd>
              </div>
            </dl>
          </div>

          <div className="pf-reveal">
            <p className="pf-about__summary">{profile.summary}</p>

            <p className="pf-about__traits-label">Class Traits</p>
            <div className="pf-about__traits">
              {profile.softSkills.map((skill) => (
                <span key={skill} className="pf-chip">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}