/**
 * Renders public/og.png — the card WhatsApp and Twitter show for a shared link.
 *
 * This used to be a product screenshot. It can't be any more, so it is built
 * from the same hero diagram the page leads with: it says what the product does
 * in one picture, which is exactly the job of a link preview, and it gives away
 * no interface.
 *
 * Built rather than hand-drawn so it cannot drift from the page. It reuses the
 * page's own CSS variables and the real wordmark.
 *
 * Run: npm run og      (after npm run build && npm run preview)
 */
import { chromium } from "playwright";
import path from "node:path";

const BASE = process.env.BASE || "http://localhost:4173";
const OUT = path.resolve("public/og.png");

const browser = await chromium.launch();
/* 1200x630 is the size both WhatsApp and Twitter crop least aggressively. */
const ctx = await browser.newContext({
  viewport: { width: 1200, height: 630 },
  deviceScaleFactor: 1,
});
const page = await ctx.newPage();

await page.goto(BASE, { waitUntil: "networkidle" });
await page.waitForTimeout(600);

/**
 * Compose the card in the live page, so it inherits the real fonts, the real
 * brand green and the real hero SVG rather than a copy of any of them.
 */
await page.evaluate(() => {
  const heroFig = document.querySelector(".hero-fig svg");
  const wordmark = document.querySelector(".brand img");
  if (!heroFig || !wordmark) throw new Error("hero figure or wordmark missing");

  const card = document.createElement("div");
  card.id = "og-card";
  card.style.cssText = [
    "position:fixed",
    "inset:0",
    "z-index:99999",
    "background:#fff",
    "display:flex",
    "flex-direction:column",
    "justify-content:center",
    "gap:26px",
    "padding:56px 64px",
    "box-sizing:border-box",
    "border-bottom:14px solid var(--brand-600)",
  ].join(";");

  const logo = wordmark.cloneNode(true);
  logo.removeAttribute("width");
  logo.removeAttribute("height");
  logo.style.cssText = "height:44px;width:auto;";

  const h = document.createElement("div");
  h.style.cssText =
    "font-family:var(--font-head);font-weight:700;font-size:54px;line-height:1.1;letter-spacing:-0.02em;color:var(--text-primary);max-width:20ch";
  h.innerHTML =
    'Stop typing purchase bills.<br><span style="color:var(--brand-600)">Photograph them.</span>';

  const fig = heroFig.cloneNode(true);
  fig.style.cssText = "width:100%;max-height:250px;height:auto";

  const foot = document.createElement("div");
  foot.style.cssText =
    "font-family:var(--font-mono);font-size:17px;letter-spacing:0.04em;color:var(--text-tertiary)";
  foot.textContent = "Billing, stock and expiry for Indian medical stores";

  card.append(logo, h, fig, foot);
  document.body.append(card);
});

await page.waitForTimeout(400);
await page.locator("#og-card").screenshot({ path: OUT });
await browser.close();
console.log(`wrote ${OUT}`);
