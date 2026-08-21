/**
 * Renders public/og.png — the card WhatsApp and Twitter show for a shared link.
 *
 * REWRITTEN, because the old one had stopped producing anything at all.
 *
 * It composed the card inside the running page from `.hero-fig svg`, and the
 * Aug-17 rebuild replaced that hero diagram with a real screenshot in an
 * `<img>`. So every run threw "hero figure or wordmark missing", and the tag in
 * index.html pointed at a file that was never written. A broken og:image is not
 * a missing preview — WhatsApp still draws the card, with a grey hole where the
 * picture should be, on the one channel this page is actually shared through.
 *
 * Two things changed:
 *
 *   1. It composes from `public/shots/dashboard.png` — the same screenshot the
 *      hero leads with — instead of scraping a live DOM node. One less thing
 *      that a layout change can silently break.
 *   2. It no longer needs `npm run build && npm run preview` first. Needing a
 *      server to be up in another terminal is most of why this went unnoticed;
 *      now it reads the source files straight off disk and can run any time.
 *
 * What it deliberately keeps: the colours come from the real `:root` block in
 * src/styles.css, and the headline comes from the real `og:title` in
 * index.html. A share card promising a headline the page doesn't carry is a
 * small bait-and-switch, so the card cannot state one on its own.
 *
 * Run: npm run og
 */
import { chromium } from "playwright";
import path from "node:path";
import fs from "node:fs";
import os from "node:os";
import { fileURLToPath, pathToFileURL } from "node:url";

/* fileURLToPath, not `new URL(...).pathname` — on Windows the latter hands back
   "/D:/…", which resolves to "D:\D:\…" and fails on the first read. */
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "public", "og.png");

const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");
const asset = (p) => {
  const abs = path.join(ROOT, p);
  if (!fs.existsSync(abs)) throw new Error(`missing asset: ${p}`);
  return pathToFileURL(abs).href;
};

/* ---- Everything on the card comes from the page, not from here ----------- */

/** The real design tokens, so the card can never be a different green. */
const css = read("src/styles.css");
const rootBlock = css.match(/:root\s*\{[\s\S]*?\n\}/);
if (!rootBlock) throw new Error("could not find the :root token block in src/styles.css");

/** The real share headline, so the card and the tag cannot disagree. */
const html = read("index.html");
const title = html.match(
  /<meta\s+property="og:title"\s+content="([^"]+)"/,
)?.[1];
if (!title) throw new Error("no og:title in index.html — nothing to put on the card");
const headline = title.replace(/&amp;/g, "&");

const shot = asset("public/shots/dashboard.png");
const wordmark = asset("public/brand/wordmark.png");

/* ---- The card ------------------------------------------------------------ */

/* 1200x630 is the size both WhatsApp and Twitter crop least aggressively.
   Laid out like the hero — copy left, the product bleeding off the right — so
   the card and the page a chemist lands on look like the same thing. */
const card = `<!doctype html>
<html lang="en-IN">
<head>
<meta charset="utf-8" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@600;700;800&family=Inter:wght@400;500&family=IBM+Plex+Mono:wght@600&display=swap" rel="stylesheet" />
<style>
${rootBlock[0]}
* { box-sizing: border-box; margin: 0; }
body {
  width: 1200px; height: 630px; overflow: hidden;
  background: var(--surface); color: var(--text-primary);
  font-family: var(--font-body);
}
#og-card {
  position: relative; width: 1200px; height: 630px;
  display: grid; grid-template-columns: 580px 1fr; align-items: center;
  padding: 54px 0 54px 64px; overflow: hidden;
  border-bottom: 14px solid var(--brand-600);
}
/* flex-start, not the default stretch: an <img> in a stretched column gets its
   width forced to the column and comes out as a 580px-wide smear of wordmark. */
.copy { display: flex; flex-direction: column; align-items: flex-start; gap: 20px; }
.logo { height: 40px; width: auto; }
.eyebrow {
  font-family: var(--font-mono); font-size: 15px; font-weight: 600;
  letter-spacing: 0.12em; text-transform: uppercase; color: var(--brand-600);
}
h1 {
  font-family: var(--font-head); font-weight: 700; font-size: 50px;
  line-height: 1.1; letter-spacing: -0.022em; max-width: 15ch;
}
.sub {
  font-size: 20px; line-height: 1.45; color: var(--text-secondary);
  max-width: 30ch; padding-top: 2px;
  border-top: 1px solid var(--rule); padding-top: 18px;
}
/* Bleeds off the right edge exactly as the hero does — it is the same picture
   doing the same job, and a fully-contained screenshot reads as a thumbnail. */
.shot {
  width: 680px; height: auto; border-radius: 12px;
  box-shadow: 0 24px 60px rgba(4, 30, 20, 0.3);
}
</style>
</head>
<body>
  <div id="og-card">
    <div class="copy">
      <img class="logo" src="${wordmark}" alt="" />
      <span class="eyebrow">For medical stores in India</span>
      <h1>${headline}</h1>
      <p class="sub">Photograph the distributor's bill — batch, expiry, MRP, rate and GST come back as stock you can sell.</p>
    </div>
    <img class="shot" src="${shot}" alt="" />
  </div>
</body>
</html>`;

const tmp = path.join(os.tmpdir(), `plusveda-og-${process.pid}.html`);
fs.writeFileSync(tmp, card, "utf8");

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1200, height: 630 },
  deviceScaleFactor: 1,
});
const page = await ctx.newPage();
await page.goto(pathToFileURL(tmp).href, { waitUntil: "load" });

/* Webfonts come off the network and the screenshots are large local PNGs, so
   both are waited for explicitly. A card shot before its picture decodes is a
   white rectangle, and nothing downstream would notice. */
await page.evaluate(() =>
  Promise.all([
    document.fonts?.ready,
    ...[...document.images].map((i) =>
      i.complete ? null : new Promise((r) => { i.onload = i.onerror = r; }),
    ),
  ]),
);
await page.waitForTimeout(300);

const missing = await page.evaluate(() =>
  [...document.images].filter((i) => !i.naturalWidth).map((i) => i.src),
);
if (missing.length) throw new Error(`image did not decode: ${missing.join(", ")}`);

await page.locator("#og-card").screenshot({ path: OUT });
await browser.close();
fs.rmSync(tmp, { force: true });
console.log(`wrote ${OUT} (${(fs.statSync(OUT).size / 1024).toFixed(0)} KB)`);
