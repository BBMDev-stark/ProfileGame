import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import useLenis from "../hooks/useLenis";
import ChapterRail from "./ChapterRail";
import AboutSection from "./sections/AboutSection";
import ProjectsSection from "./sections/ProjectsSection";
import SkillsSection from "./sections/SkillsSection";
import AchievementsSection from "./sections/AchievementsSection";
import CreativeSection from "./sections/CreativeSection";
import ContactSection from "./sections/ContactSection";
import AncientBookExperience from "./sections/AncientBookExperience";
import FantasyBackground from "./FantasyBackground";
import "../CSS/portfolio.css";


gsap.registerPlugin(ScrollTrigger);

function Divider() {
  return (
    <div className="pf-divider" role="presentation" aria-hidden="true">
      <span className="pf-divider__glyph" />
    </div>
  );
}

/**
 * MainPortfolio — everything the visitor sees after stepping through the
 * gate. Mounted by App.jsx once `introPassed` flips true (see the
 * gate-enter transition timeline there). Owns the single Lenis instance
 * and the document-wide scroll progress bar; each section below manages
 * its own scroll-reveal animation independently via useGSAP.
 */
export default function MainPortfolio() {
  const rootRef = useRef(null);
  const fillRef = useRef(null);
  const lenisRef = useLenis();

  useGSAP(() => {
    const progress = ScrollTrigger.create({
      trigger: rootRef.current,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => gsap.set(fillRef.current, { scaleX: self.progress }),
    });

    // Images/web fonts can finish settling a frame after mount and shift
    // section heights — one extra refresh keeps ScrollTrigger's measured
    // start/end positions honest.
    const raf = requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      progress.kill();
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="pf-app" ref={rootRef}>
      <div className="pf-progress-bar" aria-hidden="true">
        <div className="pf-progress-bar__fill" ref={fillRef} />
      </div>

      <ChapterRail lenisRef={lenisRef} />
      <FantasyBackground />

      <AboutSection />
      <Divider />
      <ProjectsSection />
      <Divider />
      <SkillsSection />
      <Divider />
      <AchievementsSection />
      <Divider />
      <CreativeSection />
      <Divider />
      <AncientBookExperience />
      <Divider />
      <ContactSection />
    </div>
  );
}
