/**
 * Checks the built landing page the way a visitor meets it.
 *
 * Marketing pages fail quietly — a CTA points at nothing, the hero reads fine
 * at 1440 and is unreadable on the phone the chemist is actually holding, a
 * diagram renders at zero height because its viewBox lost a dimension. None of
 * that shows up in a build log, so it gets asserted here instead.
 *
 * REWRITTEN for the graphics-led page. The previous version spent most of its
 * assertions driving the navigable product preview around and checking its
 * sidebar against the app's nav file. That preview is gone — the owner asked
 * for the interface to come off the marketing site — so those checks went with
 * it, and two new ones took their place:
 *
 *   - "No product screenshots" is now a RULE, asserted on every build. Removing
 *     them once is easy; keeping them off after six months of well-meaning
 *     edits is what an assertion is for.
 *   - Every figure must carry a <title>, because on this page the diagrams ARE
 *     the explanation. A diagram with no accessible name is a blank space to
 *     anyone using a screen reader, and this page has little text to fall back
 *     on by design.
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
  console.log(`[${ok ? "PASS" : "FAIL"}] ${id.padEnd(38)} ${detail}`);
};

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

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
await page.waitForTimeout(900);

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

/* ---- The promise the page makes ----------------------------------------- */

const h1 = (await page.locator("h1").first().innerText()).replace(/\n/g, " ");
rec("Headline renders", h1.length > 10, `"${h1}"`);

const primary = page.locator("a.btn-primary").first();
rec(
  "Primary CTA points at signup",
  /\/signup$/.test(await primary.getAttribute("href")),
  await primary.getAttribute("href"),
);

const secHref = await page.locator("a.btn-ghost").first().getAttribute("href");
rec(
  "Secondary CTA reaches a person",
  /^(https:\/\/wa\.me\/|mailto:)/.test(secHref),
  secHref,
);

/* Plusveda has no live customers. A chemist who catches an invented one will
   tell the other chemists, so this stays asserted rather than trusted. */
const body = await page.locator("body").innerText();
const inventedProof =
  /trusted by [\d,]+|[\d,]+\+? (happy )?(pharmacies|customers|stores) (use|trust)/i.test(
    body,
  );
rec(
  "No invented social proof",
  !inventedProof,
  inventedProof ? "found a customer-count claim" : "no customer counts claimed",
);

/* ---- The two rules this rebuild exists to hold --------------------------- */

/**
 * RULE 1 — the product's interface is not on this page.
 *
 * Any <img> is fair game for the brand wordmark and nothing else. A raster
 * screenshot creeping back in is the specific regression the owner asked to be
 * protected against.
 */
const rasterSrcs = await page.$$eval("img", (imgs) =>
  imgs.map((i) => i.getAttribute("src") || ""),
);
const nonBrand = rasterSrcs.filter((s) => !/\/brand\//.test(s));
rec(
  "No product screenshots",
  nonBrand.length === 0,
  nonBrand.length ? nonBrand.join(", ") : `${rasterSrcs.length} img, brand only`,
);

/**
 * RULE 2 — the diagrams carry the explanation, so they must be readable to a
 * screen reader and must actually have rendered.
 */
const figs = await page.$$eval("svg.fig", (svgs) =>
  svgs.map((s) => ({
    title: s.querySelector("title")?.textContent?.trim() || "",
    role: s.getAttribute("role") || "",
    w: s.getBoundingClientRect().width,
    h: s.getBoundingClientRect().height,
  })),
);
rec("Figures present", figs.length >= 5, `${figs.length} diagrams`);
const unnamed = figs.filter((f) => !f.title || f.role !== "img");
rec(
  "Every figure is named",
  unnamed.length === 0,
  unnamed.length ? `${unnamed.length} missing title/role` : "all have title+role",
);
const collapsed = figs.filter((f) => f.w < 80 || f.h < 40);
rec(
  "No figure collapsed",
  collapsed.length === 0,
  collapsed.length
    ? `${collapsed.length} rendered too small`
    : `smallest ${Math.round(Math.min(...figs.map((f) => f.h)))}px tall`,
);

await page.screenshot({
  path: path.join(OUT, "desktop.png"),
  fullPage: true,
});

/* ---- The phone, which is how most of them will see it -------------------- */

const phone = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
});
const p2 = await phone.newPage();
await p2.goto(BASE, { waitUntil: "networkidle" });
await p2.waitForTimeout(900);

/* The headline has to be legible under the nav without scrolling. */
const heroBox = await p2.locator("h1").first().boundingBox();
rec(
  "Headline above the fold on a phone",
  !!heroBox && heroBox.y + heroBox.height < 844,
  heroBox ? `ends at y=${Math.round(heroBox.y + heroBox.height)} of 844` : "not found",
);

/**
 * The hero diagram is the explanation. If a chemist has to scroll to find out
 * what the product does, the graphics-led rebuild has not done its job.
 */
const figBox = await p2.locator("svg.fig").first().boundingBox();
rec(
  "Hero diagram visible without scrolling",
  !!figBox && figBox.y < 844,
  figBox ? `starts at y=${Math.round(figBox.y)} of 844` : "not found",
);

/* Nothing may push the page sideways — a horizontal scrollbar on a phone is
   the single most common symptom of a wide figure or an un-wrapped table. */
const overflow = await p2.evaluate(
  () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
);
rec("No horizontal overflow", overflow <= 1, `${overflow}px past the viewport`);

/**
 * Page length. The old page ran to ~10.5 phone screens of prose; cutting the
 * copy and leading with diagrams is supposed to have shortened it materially.
 * Asserted so it cannot creep back.
 */
const screens =
  (await p2.evaluate(() => document.body.scrollHeight)) / 844;
rec(
  "Phone page stays short",
  screens <= 8,
  `${screens.toFixed(1)} screens`,
);

await p2.screenshot({ path: path.join(OUT, "phone.png"), fullPage: true });

await browser.close();

const failed = results.filter((r) => r.status === "FAIL");
fs.writeFileSync(
  path.join(OUT, "report.json"),
  JSON.stringify({ base: BASE, results }, null, 2),
);
console.log(
  `\n${results.length - failed.length}/${results.length} passed · evidence in ${OUT}`,
);
if (failed.length) process.exit(1);
