/**
 * Checks the built landing page the way a visitor meets it.
 *
 * Marketing pages fail quietly — an image 404s, a CTA points at nothing, the
 * hero reads fine at 1440 and is unreadable on the phone the chemist is
 * actually holding. None of that shows up in a build log, so it gets asserted
 * here instead.
 *
 * Prereqs: npm run build && npm run preview  (or pass BASE=)
 * Run:     npm run verify
 */
import { chromium } from "playwright";
import path from "node:path";
import fs from "node:fs";

/* No credentials here — this script only reads the public landing page. If it
   ever needs to sign in, take the password from the environment, never a
   default: this repo is public. */
const BASE = process.env.BASE || "http://localhost:4173";
const OUT = path.resolve("../verify-evidence/landing");
fs.mkdirSync(OUT, { recursive: true });

const results = [];
const rec = (id, ok, detail) => {
  results.push({ id, status: ok ? "PASS" : "FAIL", detail });
  console.log(`[${ok ? "PASS" : "FAIL"}] ${id.padEnd(36)} ${detail}`);
};

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

/** Anything that fails to load, and anything the page shouts about. */
const failedRequests = [];
const consoleErrors = [];
page.on("requestfailed", (r) => failedRequests.push(r.url()));
page.on("response", (r) => {
  if (r.status() >= 400) failedRequests.push(`${r.status()} ${r.url()}`);
});
page.on("console", (m) => {
  if (m.type() === "error") consoleErrors.push(m.text());
});

await page.goto(BASE, { waitUntil: "networkidle" });
await page.waitForTimeout(1200);

rec(
  "Nothing 404s",
  failedRequests.length === 0,
  failedRequests.length ? failedRequests.join(", ") : "every asset loaded",
);
rec(
  "No console errors",
  consoleErrors.length === 0,
  consoleErrors.length ? consoleErrors[0] : "clean",
);

// --- The hero has to say something, above the fold --------------------------
const h1 = (await page.locator("h1").first().innerText()).replace(/\n/g, " ");
rec("Headline renders", h1.length > 10, `"${h1}"`);

const heroImg = page.locator(".hero-shot img").first();
const heroBox = await heroImg.boundingBox();
const heroLoaded = await heroImg.evaluate(
  (el) => el.complete && el.naturalWidth > 0,
);
rec(
  "Product shot loads above the fold",
  heroLoaded && !!heroBox && heroBox.y < 900,
  heroBox ? `y=${Math.round(heroBox.y)}, natural width ok` : "no box",
);

// --- Every link goes somewhere real -----------------------------------------
const hrefs = await page.$$eval("a[href]", (as) => as.map((a) => a.getAttribute("href")));
const empty = hrefs.filter((h) => !h || h === "#" || h === "");
rec("No dead links", empty.length === 0, `${hrefs.length} links, ${empty.length} empty`);

const primary = page.locator("a.btn-primary").first();
rec(
  "Primary CTA points at signup",
  /\/signup$/.test(await primary.getAttribute("href")),
  await primary.getAttribute("href"),
);
const secondary = page.locator("a.btn-ghost").first();
const secHref = await secondary.getAttribute("href");
rec(
  "Secondary CTA reaches a human",
  /^(https:\/\/wa\.me\/|mailto:)/.test(secHref),
  secHref.slice(0, 60),
);

// --- Proof claims must match what the page can back up ----------------------
const bodyText = await page.locator("body").innerText();
const inventedProof =
  /trusted by [\d,]+|[\d,]+\+? (happy )?(pharmacies|customers|stores) (use|trust)/i.test(
    bodyText,
  );
rec(
  "No invented social proof",
  !inventedProof,
  inventedProof ? "found a customer-count claim" : "no customer counts claimed",
);

/**
 * The proof is the navigable preview, plus the one screen it cannot reach.
 * It used to be five more full-width screenshots of screens the preview
 * already opens; if that count creeps back up, the duplication has returned.
 */
const shots = await page.$$eval("img", (imgs) =>
  imgs.filter((i) => i.getAttribute("src")?.includes("/shots/")).length,
);
rec(
  "Product shots aren't duplicated",
  shots === 1,
  `${shots} on the page — the navigable preview, and nothing repeating it`,
);

/* Captured before anything is clicked — this is the first impression, and the
   rest of this block drives the preview around, which would otherwise leave
   the evidence showing whatever screen the test happened to stop on. */
await page.screenshot({ path: path.join(OUT, "desktop-fold.png") });

/* ---- The hero preview ---------------------------------------------------
   It is navigable, so the things that can break are: the sidebar drifting away
   from the app's real navigation, and a click not actually changing the
   screen. Both are silent failures. */

const navLabels = await page.$$eval(".preview-item", (bs) =>
  bs.map((b) => b.textContent.trim()),
);
rec("Preview offers several screens", navLabels.length >= 8, `${navLabels.length} screens`);

/**
 * The sidebar is the one piece of the app this page redraws instead of
 * photographing, so it is the one piece that can go stale. Read the app's
 * actual nav and fail if a label here no longer exists there.
 */
const navSrc = fs.readFileSync(
  path.resolve("../23-jun26-medical-front/src/navigation/navItems.ts"),
  "utf8",
);
const realLabels = [...navSrc.matchAll(/label:\s*"([^"]+)"/g)].map((m) => m[1]);
const drifted = navLabels.filter((l) => !realLabels.includes(l));
rec(
  "Preview sidebar matches the real app nav",
  drifted.length === 0,
  drifted.length ? `not in navItems.ts: ${drifted.join(", ")}` : `all ${navLabels.length} labels found in navItems.ts`,
);

const screenSrc = () =>
  page.locator(".preview-screen img").evaluate((el) => el.getAttribute("src"));
const before = await screenSrc();
await page.locator(".preview-item", { hasText: "Expiry" }).first().click();
await page.waitForTimeout(900);
const after = await screenSrc();
rec(
  "Clicking a screen actually changes it",
  before !== after && /expiry\.png$/.test(after),
  `${before?.split("/").pop()} → ${after?.split("/").pop()}`,
);

const activeLabel = await page
  .locator(".preview-item.is-active")
  .first()
  .textContent();
rec(
  "The clicked screen is marked active",
  activeLabel?.trim() === "Expiry",
  `active: ${activeLabel?.trim()}`,
);

/* Rotation must stop once a visitor takes over — otherwise the page yanks the
   screen away from someone mid-read. */
await page.waitForTimeout(7000);
const stillExpiry = await screenSrc();
rec(
  "Rotation stops once you take control",
  /expiry\.png$/.test(stillExpiry),
  `after 7s: ${stillExpiry?.split("/").pop()}`,
);

await page.screenshot({ path: path.join(OUT, "desktop-fold-driven.png") });

/**
 * Prove every screenshot decodes, and get a full-page capture that shows them.
 *
 * Everything below the hero is loading="lazy" — right for a visitor, a trap for
 * a test. Scrolling programmatically past an image faster than Chromium's
 * lazy-load heuristic reacts leaves it unloaded, so a naive check reports a
 * perfectly good PNG as blank. Opting the images back into eager loading and
 * waiting for them tests the thing that actually matters (the asset resolves
 * and decodes) instead of the scroll timing.
 */
await page.$$eval("img", (imgs) => {
  imgs.forEach((i) => i.setAttribute("loading", "eager"));
});
await page.evaluate(() =>
  Promise.all(
    Array.from(document.images)
      .filter((i) => !i.complete)
      .map(
        (i) =>
          new Promise((res) => {
            i.addEventListener("load", res, { once: true });
            i.addEventListener("error", res, { once: true });
          }),
      ),
  ),
);
await page.waitForTimeout(600);

const broken = await page.$$eval("img", (imgs) =>
  imgs
    .filter((i) => !(i.complete && i.naturalWidth > 0))
    .map((i) => i.getAttribute("src")),
);
rec(
  "Every screenshot actually renders",
  broken.length === 0,
  broken.length ? `blank: ${broken.join(", ")}` : "all images decoded",
);

/**
 * Full-page evidence via a tall viewport, not fullPage:true.
 *
 * Chromium's stitched full-page capture drops images that were lazy at load
 * time even after they decode, which produced an "evidence" screenshot showing
 * blank boxes for three working screenshots. Growing the viewport to the whole
 * document and taking an ordinary shot renders everything that is really there.
 */
const docHeight = await page.evaluate(() => document.body.scrollHeight);
await page.setViewportSize({ width: 1440, height: Math.min(docHeight, 16000) });
await page.waitForTimeout(1800);
await page.screenshot({ path: path.join(OUT, "desktop-full.png") });
await page.setViewportSize({ width: 1440, height: 900 });

// --- The phone the owner actually holds -------------------------------------
await page.setViewportSize({ width: 390, height: 844 });
await page.waitForTimeout(900);

const overflow = await page.evaluate(
  () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
);
rec("No sideways scroll on a phone", overflow <= 1, `${overflow}px overflow`);

/* The `.wrap` padding shorthand once collapsed this to 11px, jamming the
   headline under the nav on every phone. Cheap to assert, easy to regress. */
const h1Top = (await page.locator("h1").first().boundingBox())?.y ?? 0;
const navBottom =
  (await page.locator(".nav").first().boundingBox())?.height ?? 0;
rec(
  "Hero breathes under the nav on a phone",
  h1Top - navBottom >= 24,
  `${Math.round(h1Top - navBottom)}px of air`,
);

const phoneHeroSrc = await page
  .locator(".hero-shot img")
  .first()
  .evaluate((el) => el.currentSrc || el.src);
rec(
  "Phone gets the phone screenshot",
  /\/shots\/phone\//.test(phoneHeroSrc),
  phoneHeroSrc.replace(/^.*\/shots\//, "shots/"),
);

const mobileCta = page.locator(".hero-cta a.btn-primary").first();
const mBox = await mobileCta.boundingBox();
rec(
  "Hero CTA reachable on a phone",
  !!mBox && mBox.y < 844 && mBox.height >= 40,
  mBox ? `y=${Math.round(mBox.y)}, ${Math.round(mBox.height)}px tall` : "not found",
);

/* ---- Mobile-first checks -------------------------------------------------
   India is 72–80% mobile and landing pages average 83% of visits from a phone,
   so these are the assertions that decide whether this page works at all. */

const previewBox = await page.locator(".preview").first().boundingBox();
rec(
  "Product is on the first screen of a phone",
  !!previewBox && previewBox.y < 844,
  previewBox ? `preview starts at y=${Math.round(previewBox.y)} of 844` : "not found",
);

/* Aspect ratio, not height: the image is scaled down to fit the frame's width,
   so comparing rendered height to natural height only measures that scaling.
   A changed ratio is what actually means something got clipped. */
const ratio = await page
  .locator(".preview-screen img")
  .first()
  .evaluate((el) => {
    const r = el.getBoundingClientRect();
    return {
      shown: r.height / r.width,
      natural: el.naturalHeight / el.naturalWidth,
    };
  });
rec(
  "Phone screen shown whole, not cropped",
  Math.abs(ratio.shown - ratio.natural) < 0.03,
  `aspect ${ratio.shown.toFixed(2)} vs the screen's own ${ratio.natural.toFixed(2)}`,
);

/* The sticky bar must be absent at the top — two competing Start free buttons
   on one screen — and present once the hero's own has scrolled away. */
const barAtTop = await page
  .locator(".sticky-bar")
  .first()
  .evaluate((el) => el.classList.contains("is-up"));
await page.evaluate(() => window.scrollTo(0, 2200));
await page.waitForTimeout(900);
const barAfterScroll = await page
  .locator(".sticky-bar")
  .first()
  .evaluate((el) => {
    const r = el.getBoundingClientRect();
    return el.classList.contains("is-up") && r.top < window.innerHeight;
  });
rec(
  "Sticky CTA appears only after the hero",
  !barAtTop && barAfterScroll,
  `at top: ${barAtTop ? "shown" : "hidden"} · after scrolling: ${barAfterScroll ? "shown" : "hidden"}`,
);
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(400);

const phoneHeight = await page.evaluate(() => document.body.scrollHeight);
rec(
  "Phone page stays under 10 screens",
  phoneHeight <= 8440,
  `${phoneHeight}px ≈ ${(phoneHeight / 844).toFixed(1)} screens`,
);

await page.screenshot({ path: path.join(OUT, "phone-fold.png") });
await page.screenshot({ path: path.join(OUT, "phone-full.png"), fullPage: true });

fs.writeFileSync(
  path.join(OUT, "results.json"),
  JSON.stringify(results, null, 2),
);
await browser.close();

const failed = results.filter((r) => r.status === "FAIL").length;
console.log(`\n${results.length - failed}/${results.length} passed`);
process.exit(failed ? 1 : 0);
