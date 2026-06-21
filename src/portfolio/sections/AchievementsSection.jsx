import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { achievements, profile } from "../../data/portfolioData";
import { revealOnScroll } from "../scrollReveal";
import AchievementLightbox from "./AchievementLightbox";

export default function AchievementsSection() {
  const sectionRef = useRef(null);
  const [activeAward, setActiveAward] = useState(null);

  useGSAP(
    () => {
      revealOnScroll(sectionRef.current, ".pf-reveal", { stagger: 0.12 });
    },
    { scope: sectionRef }
  );

  return (
    <section id="achievements" className="pf-section" ref={sectionRef}>
      <div className="pf-section__inner">
        <header className="pf-chapter-head pf-reveal">
          <p className="pf-chapter-head__eyebrow">Chapter IV</p>
          <h2 className="pf-chapter-head__title">Trophies</h2>
          <p className="pf-chapter-head__subtitle">Achievements</p>
        </header>

        <div className="pf-trophies">
          {achievements.map((award) => (
            <article key={award.id} className="pf-trophy pf-reveal">
              <button
                type="button"
                className="pf-trophy__image-btn"
                onClick={() => setActiveAward(award)}
                aria-label={`View full size — ${award.event}`}
              >
                <img
                  className="pf-trophy__image"
                  src={award.image}
                  alt={award.event}
                  loading="lazy"
                />
                <span className="pf-trophy__zoom-hint" aria-hidden="true">
                  ⤢
                </span>
              </button>

              <div className="pf-trophy__body">
                <p className="pf-trophy__year">{award.year}</p>
                <h3 className="pf-trophy__title">{award.title}</h3>
                <p className="pf-trophy__event">{award.event}</p>
                {award.project && <p className="pf-trophy__project">{award.project}</p>}
              </div>
            </article>
          ))}
        </div>

        <p className="pf-trophies-more pf-reveal">
          A few more wins (RoboG 2024, Dong Nai Provincial Hackathon 2024) live
          on the{" "}
          <a href={profile.cv} target="_blank" rel="noopener noreferrer">
            full CV
          </a>
          .
        </p>
      </div>

      {activeAward && (
        <AchievementLightbox award={activeAward} onClose={() => setActiveAward(null)} />
      )}
    </section>
  );
}