/**
 * The hero's navigable product preview.
 *
 * The obvious way to build one of these is to re-implement the app's screens in
 * the landing page — a few thousand lines of hand-drawn replica with invented
 * data. That was rejected on purpose. A replica drifts from the product the
 * first time anyone ships a change, it is a second copy of the UI that nothing
 * tests, and it quietly turns "here is our software" into "here is a picture we
 * drew of our software" — which is the exact thing this page is trying not to
 * be.
 *
 * So the sidebar is real navigation, and the panel is a PHOTOGRAPH of the
 * screen you picked, captured from the running app by tools/captureProductShots
 * .mjs. Clicking around genuinely walks the real product.
 *
 * The one thing here that is redrawn rather than photographed is the sidebar
 * chrome itself, because two sidebars side by side is nonsense. Its labels and
 * sections mirror src/navigation/navItems.ts, and verifyLanding.mjs reads that
 * file and fails the build if they have drifted apart.
 */
import { useCallback, useEffect, useRef, useState } from "react";

type Screen = {
  id: string;
  /** Must match the label in the app's navItems.ts, exactly. */
  label: string;
  section: string;
  /** What the frame's title bar reads while this screen is up. */
  title: string;
};

const SCREENS: Screen[] = [
  { id: "dashboard", label: "Dashboard", section: "Overview", title: "dashboard" },
  { id: "products", label: "Products", section: "Catalogue", title: "products" },
  { id: "inventory", label: "Inventory", section: "Inventory", title: "stock on hand" },
  { id: "shortbook", label: "ShortBook", section: "Inventory", title: "shortbook" },
  { id: "expiry", label: "Expiry", section: "Inventory", title: "expiry" },
  {
    id: "receive",
    label: "Receive Stock",
    section: "Purchasing",
    /* Kept short — the title bar wraps to two lines past about 40 characters
       and drags the whole frame taller. */
    title: "receive stock · from a photo",
  },
  { id: "pdc", label: "Cheques / PDC", section: "Purchasing", title: "cheques · pdc" },
  // A chemist clicking "Sales" wants to see billing, not a list of past bills.
  { id: "pos", label: "Sales", section: "Sales", title: "new sale" },
  { id: "reports", label: "Reports", section: "Insights", title: "reports" },
];

/**
 * Opens on the goods-received screen filled in from a photographed bill,
 * because that is what the headline above it promises. It used to open on
 * billing, which meant the page said "photograph your purchase bills" beside a
 * picture of the till — the strongest claim on the page and a picture of
 * something else.
 *
 * That screenshot is cropped to start below the supplier name, invoice number
 * and date. What is left is generic medicines with their batch, expiry and MRP,
 * which identifies nobody. See tools/captureProductShots.mjs.
 */
const START = "receive";

/** What the idle rotation walks through. Not every screen; the showpieces. */
const ROTATION = ["receive", "pos", "shortbook", "expiry", "reports"];

const ROTATE_MS = 5200;

/** Fetch a screen's image into cache so the next click is instant. */
function prefetch(id: string) {
  const img = new Image();
  img.src = `/shots/${id}.png`;
}

export default function ScreenPreview() {
  const [active, setActive] = useState(START);
  /** Set the moment a visitor touches it. Rotation never resumes after that —
      fighting someone for control of the thing they are reading is rude. */
  const [taken, setTaken] = useState(false);
  const [seen, setSeen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  /* Rotate only while it is actually on screen. A carousel spinning in a
     scrolled-past hero is pure battery and bandwidth. */
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setSeen(true);
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => setSeen(e.isIntersecting)),
      { threshold: 0.25 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (taken || !seen) return;
    if (
      typeof matchMedia !== "undefined" &&
      matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    const t = window.setInterval(() => {
      setActive((cur) => {
        const i = ROTATION.indexOf(cur);
        const next = ROTATION[(i + 1) % ROTATION.length];
        prefetch(ROTATION[(i + 2) % ROTATION.length]);
        return next;
      });
    }, ROTATE_MS);
    return () => window.clearInterval(t);
  }, [taken, seen]);

  const pick = useCallback((id: string) => {
    setTaken(true);
    setActive(id);
  }, []);

  const current = SCREENS.find((s) => s.id === active) ?? SCREENS[0];

  /* Section headers are drawn from the data, so adding a screen can't leave a
     stray heading behind. */
  let lastSection = "";

  return (
    <div className="preview" ref={ref}>
      <div className="preview-bar">
        <span className="dot" />
        <span className="dot" />
        <span className="dot" />
        <span className="preview-route">plusveda · {current.title}</span>
        <span className="preview-hint">
          {taken ? "you're driving" : "click any screen"}
        </span>
      </div>

      <div className="preview-body">
        <nav className="preview-nav" aria-label="Product screens">
          {SCREENS.map((s) => {
            const header = s.section !== lastSection ? s.section : null;
            lastSection = s.section;
            return (
              <div key={s.id}>
                {header ? <p className="preview-section">{header}</p> : null}
                <button
                  type="button"
                  className={`preview-item${active === s.id ? " is-active" : ""}`}
                  onClick={() => pick(s.id)}
                  onMouseEnter={() => prefetch(s.id)}
                  onFocus={() => prefetch(s.id)}
                  aria-current={active === s.id ? "true" : undefined}
                >
                  {s.label}
                </button>
              </div>
            );
          })}
        </nav>

        <div className="preview-screen">
          {/*
            One <img> whose src swaps, not nine stacked and hidden: nine would
            pull well over a megabyte into a hero that needs to paint fast.
            Hover and the rotation prefetch the ones about to be needed, so a
            click still lands instantly.
          */}
          <picture>
            <source
              media="(max-width: 640px)"
              srcSet={`/shots/phone/${current.id}.png`}
            />
            <img
              key={current.id}
              src={`/shots/${current.id}.png`}
              alt={`Plusveda ${current.label} screen, photographed from the running app`}
              width={1192}
              height={900}
              fetchPriority={current.id === START ? "high" : "auto"}
              decoding="async"
            />
          </picture>
        </div>
      </div>
    </div>
  );
}
