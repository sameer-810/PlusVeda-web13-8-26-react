import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

/**
 * ============================================================================
 * TODO — OWNER: THE ONE LINE TO CHANGE WHEN THE LAUNCH DOMAIN IS DECIDED
 * ============================================================================
 *
 * The site's own address, with scheme, no trailing slash. Every absolute URL on
 * the page is built from it: `<link rel="canonical">`, `og:url`, `og:image` and
 * the JSON-LD `url`. Change it here and rebuild — there is nowhere else to look.
 *
 * CORRECTED 2026-09-05. This said `https://plusveda.app`, a domain that does not
 * resolve — the site is served from www.plusveda.online. While it was wrong the
 * canonical tag handed the ranking to nobody, and WhatsApp fetched og:image from
 * a host that does not exist, so every shared link drew its card with a hole
 * where the picture goes. The owner confirmed the two live addresses:
 *
 *   landing  https://www.plusveda.online
 *   app      https://portal.plusveda.online   (see site.appUrl in src/config.ts)
 *
 * Absolute is not optional for the share tags: WhatsApp and Facebook fetch
 * og:image from their own servers, where a relative "/og.png" resolves against
 * nothing and the card renders with a hole in it.
 */
const SITE_ORIGIN = "https://www.plusveda.online";

/**
 * Substitutes %SITE_ORIGIN% in index.html at dev-server and build time.
 *
 * index.html is deliberately static — this is a React SPA, and anything a
 * crawler or a WhatsApp scraper needs has to be in the served HTML rather than
 * rendered by JS. Static markup with one substituted token keeps that property
 * while giving the domain a single home.
 */
function siteOrigin() {
  return {
    name: "plusveda-site-origin",
    transformIndexHtml: {
      /**
       * `order: "pre"` is load-bearing, not tidiness.
       *
       * Vite's own build-html step walks every href/src and runs decodeURI on
       * it. Left until after that step, the literal `%SI…` in `%SITE_ORIGIN%`
       * reads as a malformed percent-escape and the whole build dies with
       * "URI malformed" — which is exactly what happened. Substituting first
       * means Vite only ever sees a finished absolute URL.
       */
      order: "pre" as const,
      handler(html: string) {
        return html.replaceAll("%SITE_ORIGIN%", SITE_ORIGIN);
      },
    },
  };
}

export default defineConfig({
  plugins: [react(), siteOrigin()],
  build: {
    // The page is one route with no code-splitting to do. A single chunk beats
    // a chunk graph here: fewer round trips before the hero paints.
    chunkSizeWarningLimit: 700,
  },
});
