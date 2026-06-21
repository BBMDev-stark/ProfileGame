import { useEffect, useRef } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * useLenis — wires studio-freight/lenis into the GSAP ticker so
 * ScrollTrigger and Lenis agree on a single source of scroll truth.
 * Mount once at the root of the Main Portfolio (not during the intro,
 * which has no scrollable DOM content).
 *
 * Returns a ref to the live Lenis instance so callers can imperatively
 * scrollTo() (used by ChapterRail's nav links).
 */
export function useLenis({ enabled = true } = {}) {
  const lenisRef = useRef(null);

  useEffect(() => {
    if (!enabled) return;

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => 1 - Math.pow(1 - t, 3), // easeOutCubic
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.1,
    });
    lenisRef.current = lenis;

    lenis.on("scroll", ScrollTrigger.update);

    const tickerFn = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(tickerFn);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tickerFn);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [enabled]);

  return lenisRef;
}

export default useLenis;
