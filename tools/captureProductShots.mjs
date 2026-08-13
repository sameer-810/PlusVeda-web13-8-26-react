/**
 * Photographs the real product for the landing page.
 *
 * The page has no customer logos and no testimonials to lean on — it is
 * pre-launch — so the screenshots ARE the proof. That makes a stale shot worse
 * than no shot: a visitor who signs up and meets a different screen than the
 * one that sold them has been misled. So these are captured from the running
 * app rather than copied out of the older auditshot/ gallery.
 *
 * Two sets per screen:
 *   public/shots/<id>.png        1192×900, the app's CONTENT only
 *   public/shots/phone/<id>.png    390×844, as a phone shows it
 *
 * The desktop crop cuts the app's own 248px sidebar off the left, because the
 * hero preview draws a working sidebar of its own and two sidebars side by side
 * is nonsense. It also buys back 250px of width for the part that matters,
 * which is the difference between legible and grey mush.
 *
 * Prereqs: the front-end dev server on :8085 (npm run web in the front folder).
 * Run:     npm run shots
 */
import { chromium } from "playwright";
import path from "node:path";
import fs from "node:fs";

const BASE = process.env.BASE || "http://localhost:8085";
const EMAIL = process.env.REVIEWER_EMAIL || "play.reviewer@plusveda.app";
/* Never defaulted. This repo is public and that account is an admin of a live
   tenant — a convenient default here is a published password. */
const PASSWORD = process.env.REVIEWER_PASSWORD;
if (!PASSWORD) {
  console.error(
    "Set REVIEWER_PASSWORD (and REVIEWER_EMAIL if it is not the reviewer account).\n" +
      '  PowerShell:  $env:REVIEWER_PASSWORD = "..."; npm run shots',
  );
  process.exit(1);
}
const OUT = path.resolve("public/shots");
const OUT_PHONE = path.join(OUT, "phone");
fs.mkdirSync(OUT_PHONE, { recursive: true });

/** The app's own sidebar, in CSS pixels at 1440 wide. */
const SIDEBAR_W = 248;
const CONTENT = { x: SIDEBAR_W, y: 0, width: 1440 - SIDEBAR_W, height: 900 };

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
});
ctx.setDefaultNavigationTimeout(180000);
ctx.setDefaultTimeout(30000);
const page = await ctx.newPage();

await page.goto(BASE, { waitUntil: "domcontentloaded" });
await page.waitForSelector("input", { timeout: 300000 });
await page.waitForTimeout(1500);
await page.locator("input").nth(0).fill(EMAIL);
await page.locator("input").nth(1).fill(PASSWORD);
await page.keyboard.press("Enter");
await page.waitForTimeout(9000);

/** Puts real lines on the bill — an empty cart sells nothing. */
async function billedSale() {
  await page.goto(`${BASE}/sales/new`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(4500);
  for (const term of ["tab", "syrup"]) {
    const search = page.locator("input").first();
    await search.click();
    await search.fill(term);
    await page.waitForTimeout(3500);
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
    await page.waitForTimeout(2500);
  }
  await page.waitForTimeout(1500);
}

const goto = (route) => async () =>
  page.goto(`${BASE}${route}`, { waitUntil: "domcontentloaded" });

/**
 * Every screen the hero preview can show, plus the two the feature rows use.
 *
 * `label` and `section` MIRROR src/navigation/navItems.ts in the front-end.
 * They are the one piece of the app this page redraws rather than photographs,
 * so verifyLanding.mjs reads navItems.ts and fails if any label here has
 * drifted away from the real sidebar.
 */
const SCREENS = [
  { id: "dashboard", route: "/", go: goto("/") },
  { id: "products", route: "/products", go: goto("/products") },
  { id: "inventory", route: "/inventory", go: goto("/inventory") },
  { id: "shortbook", route: "/shortbook", go: goto("/shortbook") },
  { id: "expiry", route: "/expiry", go: goto("/expiry") },
  { id: "receive", route: "/receive-stock", go: goto("/receive-stock") },
  { id: "pdc", route: "/pdc", go: goto("/pdc") },
  { id: "pos", route: "/sales/new", go: billedSale },
  { id: "reports", route: "/reports", go: goto("/reports") },
  // Feature-row only — the bill-scanning screen is reached from Receive Stock,
  // so it is not a sidebar destination and does not belong in the switcher.
  { id: "scanbill", route: "/receive-stock/scan", go: goto("/receive-stock/scan") },
];

const kb = (f) => `${Math.round(fs.statSync(f).size / 1024)} KB`;

console.log("desktop (1192×900, content only)");
for (const s of SCREENS) {
  await s.go();
  await page.waitForTimeout(6000);
  const file = path.join(OUT, `${s.id}.png`);
  await page.screenshot({ path: file, clip: CONTENT });
  console.log(`  ${s.id.padEnd(11)} ${kb(file)}`);
}

/**
 * The phone set.
 *
 * Roughly four visitors in five meet this product on a phone, so these are not
 * a fallback — they are the main event, and the landing page shows them whole,
 * uncropped, at their real size.
 *
 * `SCROLL_TO` exists for screens whose first 844px is mostly chrome. It has to
 * move an inner element: the app is react-native-web, so the page scrolls a
 * ScrollView and window.scrollTo is silently a no-op.
 */
console.log("\nphone (390×844)");
await page.setViewportSize({ width: 390, height: 844 });
const SCROLL_TO = {};
for (const s of SCREENS) {
  await s.go();
  await page.waitForTimeout(5000);
  const y = SCROLL_TO[s.id] ?? 0;
  if (y) {
    /* The app is react-native-web: the page scrolls an inner ScrollView, not
       the window, so window.scrollTo is silently a no-op. Find the tallest
       actually-scrollable element and move that instead. */
    const moved = await page.evaluate((to) => {
      const scrollers = [...document.querySelectorAll("div")].filter((el) => {
        const o = getComputedStyle(el).overflowY;
        return (
          (o === "auto" || o === "scroll") &&
          el.scrollHeight > el.clientHeight + 40
        );
      });
      const el = scrollers.sort((a, b) => b.scrollHeight - a.scrollHeight)[0];
      if (!el) return 0;
      el.scrollTop = to;
      return el.scrollTop;
    }, y);
    await page.waitForTimeout(1200);
    if (!moved) console.log(`  (${s.id}: nothing scrolled)`);
  }
  const file = path.join(OUT_PHONE, `${s.id}.png`);
  await page.screenshot({ path: file });
  console.log(`  ${s.id.padEnd(11)} ${kb(file)}${y ? ` (scrolled ${y}px)` : ""}`);
}

await browser.close();
console.log(`\nWrote ${SCREENS.length} screens × 2 widths to public/shots/`);
