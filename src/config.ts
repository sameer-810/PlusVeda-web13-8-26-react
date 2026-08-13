/**
 * Everything on this page that is a business decision rather than a design one.
 *
 * Kept in one file on purpose: the phone number, the WhatsApp text and the app
 * URL are things the founder changes, and they should never require reading
 * JSX to find. Anything marked TODO is a real value I did not have — the page
 * renders honestly without it, but the CTA is weaker until it's filled in.
 */

export const site = {
  /** Where "Start free" and "Sign in" send people — the live app. */
  appUrl: "https://23-jun26-medical-front.vercel.app",

  /**
   * TODO: put the real sales WhatsApp number here, digits only with country
   * code (e.g. "919876543210"). Until it's set, every WhatsApp button falls
   * back to email so nothing on the page is a dead link.
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
   * TODO: paste the Play listing URL once the app is live. Left empty the badge
   * simply doesn't render — better than a button that 404s a chemist.
   */
  playStoreUrl: "",
};

/* NOTE: no credentials live in this file, and none should.
   It briefly held the Play reviewer login for a "try the demo" idea that was
   never built. That account is an admin of a real tenant on the live backend,
   and this file ships to a public repo and a public bundle. If a public demo
   login is ever wanted, create a throwaway account for it — never reuse the
   reviewer's. */

/** WhatsApp deep link, or a mailto fallback while the number is unset. */
export function contactHref(): string {
  if (site.whatsappNumber) {
    return `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(
      site.whatsappMessage,
    )}`;
  }
  return `mailto:${site.supportEmail}?subject=${encodeURIComponent(
    "Plusveda demo",
  )}&body=${encodeURIComponent(site.whatsappMessage)}`;
}

/** So the button can honestly say what it will do. */
export const contactLabel = site.whatsappNumber
  ? "Talk to us on WhatsApp"
  : "Email us for a demo";

export const signupHref = `${site.appUrl}/signup`;
export const signinHref = `${site.appUrl}/login`;
