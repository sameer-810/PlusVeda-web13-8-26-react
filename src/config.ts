/**
 * Everything on this page that is a business decision rather than a design one
 * — the phone number, the WhatsApp text, the app URL, the prices. Kept in one
 * file so changing them never means reading JSX.
 */

/* ============================================================================
   TODO — OWNER: FILL THESE IN BEFORE THE PAGE GOES LIVE

     1. whatsappNumber — the sales WhatsApp number.  ⚠ costs leads while empty
     2. playStoreUrl   — the Play Store listing, once the app is published

   Neither is a dead link while empty; each degrades to something that still
   works, which is why they went unnoticed. SITE_ORIGIN lives in vite.config.ts,
   not here, because index.html needs it at build time.
   ========================================================================= */

export const site = {
  /**
   * Where every plan button, "Start free" and "Sign in" send people — the live
   * app. Confirmed by the owner on 2026-09-05: the app is served from its own
   * subdomain now, not the Vercel address this used to hold.
   */
  appUrl: "https://portal.plusveda.online",

  /**
   * ⚠ TODO(owner) — the sales WhatsApp number. Digits only, country code
   * first: "919876543210". Anything else pasted in is stripped to digits.
   *
   * While empty, every "Talk to us" button falls back to a mailto: link —
   * a much weaker channel for Indian medical stores.
   */
  whatsappNumber: "",

  /** Pre-filled so the first message tells you which page it came from. */
  whatsappMessage:
    "Hi, I run a medical store and I'd like to see Plusveda. Can you show me a demo?",

  supportEmail: "5fivempvt@gmail.com",
  company: "FiveM Infotech",

  privacyUrl: "https://23-jun26-medical-front.vercel.app/privacy-policy.html",
  deleteAccountUrl:
    "https://23-jun26-medical-front.vercel.app/delete-account.html",

  /**
   * ⚠ TODO(owner) — the Play Store listing URL, from the Play Console's
   * "Copy store listing link". While empty the Play badge is hidden, so the
   * page never mentions there is an Android app.
   */
  playStoreUrl: "",
};

/* ============================================================================
   THE PRICE LIST — set by the owner on 2026-09-01
   ============================================================================
   The only prices published on this page. `total` is what a pharmacy pays ONCE
   for the whole term; the per-month figure, discount badge and rupees saved are
   all DERIVED from it. Never hardcode a derived number into the JSX.

   Plan names are the owner's own words, verbatim.

   ⚠ TODO(owner): confirm whether these include GST. The page says neither.
   ========================================================================= */

/**
 * The undiscounted rate — one month, bought one month at a time. Every
 * discount on the page is measured against this, so it is also the price of
 * the 1-month plan and the two must never drift apart.
 */
export const monthlyListPrice = 1000;

export type Plan = {
  id: string;
  /** The owner's wording, verbatim. */
  name: string;
  months: number;
  /** Rupees, paid once, for the whole term. */
  total: number;
  /** The one card that is raised and carries the ribbon. */
  featured?: boolean;
  /** One line under the term, in the card. */
  blurb: string;
};

export const plans: Plan[] = [
  {
    id: "12m",
    name: "12 Month Plan",
    months: 12,
    total: 2700,
    featured: true,
    blurb: "A full year, at the lowest rate we sell.",
  },
  {
    id: "6m",
    name: "6 Month Plan",
    months: 6,
    total: 1800,
    blurb: "Half a year — the usual choice after a trial.",
  },
  {
    id: "3m",
    name: "3 Month Plan",
    months: 3,
    total: 1275,
    blurb: "A quarter at a time, if you want to be sure first.",
  },
  {
    id: "1m",
    name: "1 Month Plan",
    months: 1,
    total: 1000,
    blurb: "Month to month. Stop whenever you like.",
  },
];

/** ₹1,275 — Indian digit grouping, which is not what the default gives you. */
export function inr(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

/**
 * Everything a price card shows beyond the term and the total. Derived rather
 * than typed out so the four cards can never disagree with each other.
 */
export function planMath(plan: Plan) {
  const perMonth = Math.round(plan.total / plan.months);
  const listTotal = monthlyListPrice * plan.months;
  const saves = listTotal - plan.total;
  const savePct = Math.round((1 - perMonth / monthlyListPrice) * 100);
  return { perMonth, listTotal, saves, savePct };
}

/** The cheapest per-month figure on the list — the number the hero quotes. */
export const cheapestPerMonth = Math.min(
  ...plans.map((p) => planMath(p).perMonth),
);

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

/**
 * WhatsApp deep link, or a mailto fallback while the number is unset.
 *
 * Takes the message so a card can say which plan it came from. There is no
 * card-payment page — a plan is activated by a person — so this link is the
 * checkout, and arriving with the plan already named makes it a lead.
 */
export function contactHref(
  message: string = site.whatsappMessage,
  subject = "Plusveda demo",
): string {
  if (waDigits) {
    return `https://wa.me/${waDigits}?text=${encodeURIComponent(message)}`;
  }
  return `mailto:${site.supportEmail}?subject=${encodeURIComponent(
    subject,
  )}&body=${encodeURIComponent(message)}`;
}

/**
 * Where a price card goes: the signup form, with the plan carried along.
 *
 * It used to open WhatsApp, because there was no checkout to send anyone to.
 * The flow now is the hosting-company one: pick a plan, register, then see the
 * full breakdown.
 *
 * `?plan=12m` rides through signup to the platform team so the quotation call
 * opens with the right number. A note, not a purchase — an unrecognised code is
 * ignored, since these links get forwarded weeks later.
 */
export function planHref(plan: Plan): string {
  return `${signupHref}?plan=${encodeURIComponent(plan.id)}`;
}

/** So the button can honestly say what it will do. */
export const contactLabel = waDigits
  ? "Talk to us on WhatsApp"
  : "Email us for a demo";

/* Says it once, in the one place a developer running the site will see it.
   `import.meta.env.DEV` keeps it out of the production bundle entirely. */
if (import.meta.env.DEV) {
  const missing = [
    !waDigits &&
      "site.whatsappNumber (src/config.ts) — CTAs fall back to email",
    !site.playStoreUrl &&
      "site.playStoreUrl (src/config.ts) — Play badge hidden",
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
