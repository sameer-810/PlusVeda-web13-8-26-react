/**
 * Checks the built landing page the way a visitor meets it.
 *
 * Marketing pages fail quietly — a CTA points at nothing, the hero reads fine
 * at 1440 and is unreadable on the phone the chemist is actually holding, a
 * diagram renders at zero height because its viewBox lost a dimension. None of
 * that shows up in a build log, so it gets asserted here instead.
 *
 * REWRITTEN TWICE, and the history matters because one rule reversed.
 *
 * v1 drove the navigable product preview around and checked its sidebar
 * against the app's nav file. v2 deleted all of that and asserted the
 * opposite — that the interface never appeared here at all — because the
 * owner had asked for the preview to come off ("everyone will copy").
 *
 * v3 is this one. The owner then pointed at a competitor and asked for their
 * structure, including the way they lead with their own dashboard, so the
 * screenshots are back and the rule that banned them is inverted. See RULE 1.
 * What is asserted now:
 *
 *   - every image is first-party, and the product is genuinely on the page;
 *   - every image decodes, occupies real height and carries alt text, because
 *     a graphics-led page whose graphics fail is a blank page;
 *   - the headline AND the product shot both land above the fold on a phone.
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
 * RULE 1 — every image is ours, and the product is actually shown.
 *
 * THIS RULE WAS INVERTED, ON INSTRUCTION. It used to assert the opposite: that
 * the product's interface never appeared on the page. That came from the owner
 * asking for the preview to come off because "everyone will copy". He has since
 * pointed at the reference site and asked for the dashboard to be shown the way
 * they show theirs, which overrides it. The screens are back, deliberately.
 *
 * What survives is the part that was always worth asserting:
 *
 *   1. Every image is served from this site — /brand/, /photos/ or /shots/.
 *      No hotlinks, and above all no image lifted from the reference site.
 *   2. The product IS on the page. The whole point of the rebuild is that a
 *      visitor sees the real software, so a refactor that quietly drops the
 *      screenshots should fail the build rather than pass it silently.
 */
const rasterSrcs = await page.$$eval("img", (imgs) =>
  imgs.map((i) => i.getAttribute("src") || ""),
);
const OURS = /^\/(brand|photos|shots)\//;
const foreign = rasterSrcs.filter((s) => !OURS.test(s));
rec(
  "Every image is ours",
  foreign.length === 0,
  foreign.length ? foreign.join(", ") : `${rasterSrcs.length} img, all first-party`,
);

const shots = rasterSrcs.filter((s) => s.startsWith("/shots/"));
rec(
  "The product is on the page",
  shots.length >= 4,
  `${shots.length} product screens shown`,
);

/**
 * RULE 2 — the images actually arrived, and every one of them is described.
 *
 * This replaces the three SVG-figure checks that used to live here. The page
 * no longer has illustrated scenes to measure, but the failure they guarded
 * against is unchanged and now MORE likely, because these are network images
 * rather than inline markup: a broken path, a mis-sized frame, or a collapsed
 * container leaves a graphics-led page with nothing on it.
 *
 * `naturalWidth === 0` is the check that matters — an <img> whose src 404s
 * still has a layout box, so measuring the element alone would pass.
 *
 * The page has to be scrolled first. Almost everything below the hero is
 * `loading="lazy"`, so on an un-scrolled page the honest answer to "did it
 * decode" is "it was never asked for" — which is not a failure.
 */
await page.evaluate(async () => {
  for (let y = 0; y < document.body.scrollHeight; y += 400) {
    window.scrollTo(0, y);
    await new Promise((r) => setTimeout(r, 60));
  }
  window.scrollTo(0, 0);
});
await page.waitForTimeout(1200);

const imgState = await page.$$eval("img", (imgs) =>
  imgs.map((i) => ({
    src: i.getAttribute("src") || "",
    loaded: i.complete && i.naturalWidth > 0,
    h: Math.round(i.getBoundingClientRect().height),
    alt: (i.getAttribute("alt") || "").trim(),
    hidden: i.hidden,
  })),
);
/* Hidden showcase panels are display:none, so the browser may legitimately
   never fetch them however far you scroll. Only visible images are asserted. */
const broken = imgState.filter((i) => !i.hidden && !i.loaded);
rec(
  "Every image decoded",
  broken.length === 0,
  broken.length ? broken.map((i) => i.src).join(", ") : `${imgState.length} images`,
);

/* Content images only: the wordmark is 26px tall by design, and a threshold
   that flags the logo is a threshold nobody will keep. */
const content = imgState.filter((i) => !i.hidden && !i.src.startsWith("/brand/"));
const collapsed = content.filter((i) => i.h < 90);
rec(
  "No image collapsed",
  collapsed.length === 0,
  collapsed.length
    ? collapsed.map((i) => `${i.src} @${i.h}px`).join(", ")
    : `smallest ${Math.min(...content.map((i) => i.h))}px tall`,
);

const unlabelled = imgState.filter((i) => !i.alt);
rec(
  "Every image is described",
  unlabelled.length === 0,
  unlabelled.length ? unlabelled.map((i) => i.src).join(", ") : "all have alt text",
);

/* ---- The phone, which is how most of them will see it -------------------- */

const phoneCtx = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
});
const p2 = await phoneCtx.newPage();
await p2.goto(BASE, { waitUntil: "networkidle" });
await p2.evaluate(async () => {
  for (let y = 0; y < document.body.scrollHeight; y += 400) {
    window.scrollTo(0, y);
    await new Promise((r) => setTimeout(r, 60));
  }
  window.scrollTo(0, 0);
});
await p2.waitForTimeout(900);

/* The headline has to land before the fold, or the first thing a chemist sees
   on a 390px screen is a nav bar and a gradient. */
const h1Bottom = await p2.evaluate(() => {
  const h = document.querySelector("h1");
  return h ? Math.round(h.getBoundingClientRect().bottom) : 9999;
});
rec(
  "Headline above the fold on a phone",
  h1Bottom < 844,
  `ends at y=${h1Bottom} of 844`,
);

/* And the product shot has to be at least starting, so the fold is not all
   words. This is the whole argument of the redesign in one assertion. */
const figTop = await p2.evaluate(() => {
  const f = document.querySelector(".hero-fig img");
  return f ? Math.round(f.getBoundingClientRect().top) : 9999;
});
rec(
  "Product visible without scrolling",
  figTop < 844,
  `starts at y=${figTop} of 844`,
);

const overflow = await p2.evaluate(
  () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
);
rec("No horizontal overflow", overflow <= 1, `${overflow}px past the viewport`);

/**
 * Page length. The old page ran to ~10.5 phone screens of prose; cutting the
 * copy and leading with graphics is supposed to have shortened it materially.
 * Asserted so it cannot creep back.
 *
 * RAISED TWICE, each time because the brief changed, each time written down.
 *
 *   8 -> 9: the owner asked for photography, wave dividers and scroll
 *   animation after the first number was set, and all three cost vertical
 *   space the text-only version did not spend.
 *
 *   9 -> 12: the owner asked for the reference site's structure, which is four
 *   sections longer than what this page had — a "what is it" block, a tabbed
 *   showcase, an eight-card grid and a price band. On a phone the eight cards
 *   stack into a single column, and that one change is most of the increase.
 *
 * Everything cheap has already been spent: card rhythm, section padding, and
 * both the photo and wave heights are shorter on a phone than on a desktop.
 * Cutting real content to defend a threshold chosen under a different brief
 * would be optimising for the gate rather than for the page.
 *
 * It is still a hard ceiling and it is not to be raised again without the same
 * kind of reason written down here. For scale: the reference site itself is
 * about 34 phone screens, so this is a third of it.
 */
const screens =
  (await p2.evaluate(() => document.body.scrollHeight)) / 844;
rec(
  "Phone page stays short",
  screens <= 12,
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
