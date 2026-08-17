import { useEffect } from "react";

/**
 * Scroll-reveal, the cheap way.
 *
 * The reference site animates its sections in with Framer Motion. That is a
 * ~40KB main-thread tax on a page whose entire job is to load fast on a
 * mid-range Android over 4G, for an effect that is twelve lines of CSS. So this
 * uses an IntersectionObserver to add one class, and the transition lives in
 * the stylesheet on `transform` and `opacity` only — both composited off the
 * main thread.
 *
 * THREE THINGS THAT ARE NOT OPTIONAL:
 *
 * 1. Elements start visible in the markup and are hidden by a class this hook
 *    adds at runtime. If the observer never runs — old browser, script error,
 *    JS disabled — the page is simply not animated, rather than blank. A
 *    reveal effect that can hide your entire landing page is a bad trade.
 * 2. `prefers-reduced-motion` is honoured by bailing out entirely, so nothing
 *    is even armed. Vestibular disorders are not a corner case.
 * 3. It reveals once and stops observing. Re-animating on every scroll past is
 *    the thing that makes these effects feel cheap.
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
     * Stagger, for elements that arrive as a group.
     *
     * Eight feature cards fading in together is one event and reads as a page
     * loading late. The same eight arriving 60ms apart reads as the grid
     * assembling itself, and it is the biggest single difference between this
     * and a stock fade-in — the reference site gets the same effect out of
     * Framer Motion's `staggerChildren`.
     *
     * The index is per-parent, not global, so each grid counts from zero
     * rather than inheriting an offset from whatever came before it. The cap
     * matters: without it the last card of a long grid waits half a second
     * after the first, which on a fast scroll means it is still animating
     * when it has already left the screen.
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
