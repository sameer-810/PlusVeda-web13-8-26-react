import { useEffect } from "react";

/**
 * Scroll-reveal, the cheap way. The reference site uses Framer Motion — a
 * ~40KB main-thread tax on a page whose job is to load fast on a mid-range
 * Android, for an effect that is twelve lines of CSS. This adds one class via
 * IntersectionObserver; the transition is `transform` and `opacity` only.
 *
 * Three things that are not optional:
 *
 * 1. Elements start VISIBLE and are hidden by a class added at runtime. If the
 *    observer never runs, the page is un-animated rather than blank.
 * 2. `prefers-reduced-motion` bails out entirely, so nothing is even armed.
 * 3. It reveals once and stops observing. Re-animating on every scroll past is
 *    what makes these effects feel cheap.
 */
export function useReveal() {
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;

    const reduced =
      typeof matchMedia !== "undefined" &&
      matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const targets = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal]"),
    );
    if (!targets.length) return;

    // Arm them only now that we know we can also disarm them.
    targets.forEach((el) => el.classList.add("reveal-armed"));

    /**
     * Stagger, for elements that arrive as a group. Eight cards fading in
     * together reads as a page loading late; 60ms apart reads as the grid
     * assembling.
     *
     * The index is per-parent, so each grid counts from zero. The cap matters:
     * without it the last card of a long grid is still animating after it has
     * left the screen.
     */
    const STEP = 60;
    const MAX = 240;
    const seen = new Map<Element, number>();
    for (const el of targets) {
      const parent = el.parentElement;
      if (!parent) continue;
      const i = seen.get(parent) ?? 0;
      seen.set(parent, i + 1);
      if (i > 0) {
        el.style.setProperty("--reveal-delay", `${Math.min(i * STEP, MAX)}ms`);
      }
    }

    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          e.target.classList.add("reveal-in");
          obs.unobserve(e.target);
        }
      },
      // A little before it reaches the viewport, so the element is already
      // settling as it arrives rather than starting once it is on screen.
      { threshold: 0.05, rootMargin: "0px 0px -40px 0px" },
    );

    targets.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}
