import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * revealOnScroll — batches every element matching `selector` inside `scope`
 * and fades/lifts each one in as it crosses into the viewport.
 *
 * Sets the hidden starting state itself (rather than relying on a CSS
 * `opacity: 0` default) so content is never permanently invisible if a
 * script error stops the animation from ever running.
 */
export function revealOnScroll(scope, selector = ".pf-reveal", { stagger = 0.08 } = {}) {
  const els = gsap.utils.toArray(scope.querySelectorAll(selector));
  if (!els.length) return;

  gsap.set(els, { opacity: 0, y: 28 });

  ScrollTrigger.batch(els, {
    start: "top 88%",
    onEnter: (batch) =>
      gsap.to(batch, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power3.out",
        stagger,
        overwrite: true,
      }),
    once: true,
  });
}

export default revealOnScroll;
