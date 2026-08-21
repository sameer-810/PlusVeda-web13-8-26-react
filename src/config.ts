/**
 * Everything on this page that is a business decision rather than a design one.
 *
 * Kept in one file on purpose: the phone number, the WhatsApp text and the app
 * URL are things the founder changes, and they should never require reading
 * JSX to find. Anything marked TODO is a real value I did not have — the page
 * renders honestly without it, but the CTA is weaker until it's filled in.
 */

/* ============================================================================
   TODO — OWNER: FILL THESE IN BEFORE THE PAGE GOES LIVE

   Three values, all in the block below, none of which can be guessed:

     1. whatsappNumber — the sales WhatsApp number.  ⚠ costs leads while empty
     2. playStoreUrl   — the Play Store listing, once the app is published
     3. appUrl         — only if the app moves off its Vercel address

   The fourth, the launch domain for canonical/og:url, is NOT here — it lives
   in `vite.config.ts` as SITE_ORIGIN, because index.html needs it at build
   time and index.html is deliberately static.

   Nothing here is a dead link while empty; each one degrades to something that
   still works. That is the whole reason this went unnoticed — an empty
   whatsappNumber does not break the page, it just quietly turns the strongest
   CTA on a page aimed at Indian chemists into a mailto: link.
   ========================================================================= */

export const site = {
  /**
   * Where "Start free" and "Sign in" send people — the live app.
   * TODO(owner): change if the app gets its own domain, e.g. "https://app.plusveda.app".
   */
  appUrl: "https://23-jun26-medical-front.vercel.app",

  /**
   * ⚠ TODO(owner) — PASTE THE SALES WHATSAPP NUMBER HERE.
   *
   * Digits only, country code first, no "+", no spaces, no dashes:
   *
   *     whatsappNumber: "919876543210",
   *
   * (Anything else pasted in is stripped down to digits below, so a number
   * copied out of a phone's contact card still works.)
   *
   * WHAT IT COSTS WHILE EMPTY: every "Talk to us" button on the page becomes a
   * mailto: link. On a page selling to Indian medical stores, WhatsApp is the
   * channel these customers actually reply on — email is a much weaker second.
   */
  whatsappNumber: "",

  /** Pre-filled so the first message tells you which page it came from. */
  whatsappMessage:
    "Hi, I run a medical store and I'd like to see Plusveda. Can you show me a demo?",

  supportEmail: "5fivempvt@gmail.com",
  company: "FiveM Infotech",

  privacyUrl:
    "https://23-jun26-medical-front.vercel.app/privacy-policy.html",
  deleteAccountUrl:
    "https://23-jun26-medical-front.vercel.app/delete-account.html",

  /**
   * ⚠ TODO(owner) — PASTE THE PLAY STORE LISTING URL HERE once the app is
   * published. The whole URL, from the Play Console's "Copy store listing link":
   *
   *     playStoreUrl: "https://play.google.com/store/apps/details?id=com.plusveda.app",
   *
   * WHAT IT COSTS WHILE EMPTY: the Play badge is omitted from the footer — a
   * missing badge is better than a button that 404s a chemist, but the page
   * then never tells anyone there is an Android app.
   */
  playStoreUrl: "",
};

/**
 * Digits only, whatever was pasted. A number copied off a phone arrives as
 * "+91 98765 43210", and wa.me silently fails on every character that isn't a
 * digit — which would look exactly like the number being wrong.
 */
const waDigits = site.whatsappNumber.replace(/\D/g, "");

/* NOTE: no credentials live in this file, and none should.
   It briefly held the Play reviewer login for a "try the demo" idea that was
   never built. That account is an admin of a real tenant on the live backend,
   and this file ships to a public repo and a public bundle. If a public demo
   login is ever wanted, create a throwaway account for it — never reuse the
   reviewer's. */

/** WhatsApp deep link, or a mailto fallback while the number is unset. */
export function contactHref(): string {
  if (waDigits) {
    return `https://wa.me/${waDigits}?text=${encodeURIComponent(
      site.whatsappMessage,
    )}`;
  }
  return `mailto:${site.supportEmail}?subject=${encodeURIComponent(
    "Plusveda demo",
  )}&body=${encodeURIComponent(site.whatsappMessage)}`;
}

/** So the button can honestly say what it will do. */
export const contactLabel = waDigits
  ? "Talk to us on WhatsApp"
  : "Email us for a demo";

/* Says it once, in the one place a developer running the site will see it.
   `import.meta.env.DEV` keeps it out of the production bundle entirely. */
if (import.meta.env.DEV) {
  const missing = [
    !waDigits && "site.whatsappNumber (src/config.ts) — CTAs fall back to email",
    !site.playStoreUrl && "site.playStoreUrl (src/config.ts) — Play badge hidden",
  ].filter(Boolean);
  if (missing.length) {
    console.warn(
      `[plusveda] launch values still unset:\n  - ${missing.join("\n  - ")}\n` +
        "  - SITE_ORIGIN (vite.config.ts) — check it matches the real domain",
    );
  }
}

export const signupHref = `${site.appUrl}/signup`;
export const signinHref = `${site.appUrl}/login`;
