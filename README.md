# Plusveda landing page

The public marketing page. Separate from `23-jun26-medical-front/` on purpose:
a first-time visitor should never have to download the app bundle to read a
sales page.

```
npm install
npm run dev        # http://localhost:5173
npm run build      # → dist/
npm run preview    # serve dist/ on :4173
```

## Art direction — "the counter ledger"

The first build of this page looked machine-made, and it was wearing every
default that makes a page look that way: a centred hero, a rounded pill badge
above the headline, a radial gradient wash, three identical cards in a row
(twice), the same green circle-tick beside every bullet, pill buttons, and one
border-radius on everything. Those are the most common patterns on the web,
which is exactly why a page built out of all of them looks like every other
page.

What replaced them comes from what the product is. A pharmacy runs on ruled
paperwork — batch numbers, expiry dates, rate columns, a purchase register:

| Instead of                  | This page uses                                        |
| --------------------------- | ----------------------------------------------------- |
| Card shadows                | Hairline rules; the page is ruled like a ledger        |
| Rounded pills, 16px radii   | 3px corners — a tool has sharp corners                 |
| Centred everything          | Left-aligned, asymmetric columns                       |
| Gradient hero wash          | One flat green. No gradient anywhere on the page       |
| Green circle-ticks          | Ruled rows with a mono marker                          |
| 3-up card grids             | A numbered register (01/02/03), ruled apart            |
| Inter for figures           | IBM Plex Mono, tabular — the type of a batch number    |

The real wordmark from `assets/brand/` is in `public/brand/`. It is drawn on
white, which is why the footer is light rather than the default dark slab —
on a dark ground it would sit in a grey box.

**If you edit this page, do not "tidy" those choices back into the defaults.**
They are the difference between this and a template.

## This page is a phone page

India runs 72–80% mobile, and landing pages average 83% of visits from a phone.
So the phone is not the fallback here — it is the product. The first build got
this backwards: it was designed at 1440 and let mobile fall out of the media
queries, which produced a phone page **longer than the desktop one** (10,776px
vs 7,302px) with the product below the fold. Mobile-first hero structures
outperform desktop-first responsive equivalents by about 28%, and that gap is
exactly what a squashed desktop layout gives away.

What the phone gets now, and why:

| Decision | Reason |
| --- | --- |
| Product preview on the first screen (`y≈518` of 844) | The one thing that has to be seen is the software |
| Fine print moved *below* the preview | Nobody decides on "no card needed" before seeing the thing |
| Phone screenshots shown **whole, uncropped** | A 410px crop showed the top third of a screen and nothing it added up to |
| Sticky CTA bar, appearing after the hero | Worth ~14% on scrolling pages; without it there is no way to act until the footer |
| Spec sheet folded into accordions | Laid flat it was ~1,600px of skimming; folded, all five headings fit one screen |
| Ledger strip 2×2, steps as a list, footer 2-col | Four stacked rows spent 600px on four short facts |

Net: **10,776px → 8,265px** (9.8 screens). `verifyLanding.mjs` fails above ten
screens, and also asserts the preview is above the fold, the phone screenshot
is uncropped (by aspect ratio — comparing heights only measures scaling), and
that the sticky bar is hidden at the top and up after the hero.

The phone screenshots come from the same capture run as the desktop ones, at a
390×844 viewport. They are not resized desktop images.

## Why there is only one screenshot on the page

There used to be five more, full-width, under the feature headings — all of
them screens the hero preview already lets you open. That is the same proof
twice, for about 4,000px of scrolling, on a page whose whole job is to get a
busy chemist to one button. Cutting them took the page from 11,742px to
7,302px. `verifyLanding.mjs` fails if the count creeps back above one.

**Do not put a screenshot on the Scan Bill section.** The screen only means
anything with a bill on it, and every bill available to shoot — `samples/bills`,
`All Bills/` — is a real distributor's invoice carrying their GSTIN, their bank
account and a named pharmacy's purchases. Publishing someone else's paperwork
to sell software is not a trade worth making. If you want a picture there, the
options are: a bill your own business owns, a supplier who has agreed in
writing, or a crop tight enough to show only extracted medicine lines with no
party named.

## Before it goes live

Three values in [`src/config.ts`](src/config.ts) are placeholders. The page
renders honestly without them — a missing WhatsApp number falls back to email
rather than producing a dead button — but each one left empty costs you leads.

| Value             | What happens while it's empty                             |
| ----------------- | --------------------------------------------------------- |
| `whatsappNumber`  | Every "talk to us" button becomes a `mailto:` instead      |
| `playStoreUrl`    | The Play link is omitted from the footer                   |
| `appUrl`          | Points at the Vercel preview domain — change on custom domain |

Also update `<link rel="canonical">` and `og:url` in [`index.html`](index.html)
when the real domain is decided. They currently say `plusveda.app`.

## The screenshots are the proof

This page has no customer logos and no testimonials, because Plusveda has no
live customers yet. Inventing them is the fastest way to lose a chemist's
trust. So the screenshots carry the argument, and they are captured from the
**running app**, not drawn and not copied from the older `auditshot/` gallery:

```bash
# with the front-end dev server up on :8085
npm run shots
```

`tools/captureProductShots.mjs` signs in as the demo pharmacy and photographs
ten screens at two widths each — `public/shots/<id>.png` (1192×900, the app's
content with its own sidebar cropped off) and `public/shots/phone/<id>.png`
(390×844). New Sale is captured with a real two-line bill on it, because an
empty cart sells nothing.

**Re-run it after any UI change that appears on this page.** A landing page
showing a screen the product no longer has is worse than one showing nothing.

## The hero preview is navigable — and still not a replica

The obvious way to build an interactive preview is to re-implement the app's
screens in the landing page. OutVue does exactly that: ~3,000 lines of
hand-drawn replica with invented data. It was rejected here, because a replica
drifts from the product the first time anyone ships a change, it is a second
copy of the UI that nothing tests, and it turns "here is our software" into
"here is a picture we drew of our software".

So in [`ScreenPreview.tsx`](src/ScreenPreview.tsx) the sidebar is real
navigation and the panel is a **photograph** of the screen you picked. Clicking
around genuinely walks the real product. It auto-rotates through five
showpieces until you touch it, then hands you the wheel and never takes it back.

The one thing redrawn rather than photographed is the sidebar chrome itself —
two sidebars side by side is nonsense. That is the only piece that can go
stale, so `verifyLanding.mjs` reads
`../23-jun26-medical-front/src/navigation/navItems.ts` and **fails if any label
in the preview no longer exists in the app's real nav.**

## Verifying

```bash
npm run build && npm run preview   # in one terminal
npm run verify                     # in another
```

`tools/verifyLanding.mjs` asserts the things that fail silently on marketing
pages: no 404s, no console errors, every screenshot actually decodes, no empty
`href`s, the primary CTA really points at signup, no sideways scroll on a
390px phone, the phone gets the phone screenshot rather than a shrunken
desktop one — and that the page makes no customer-count claim it can't back
up. Evidence lands in `../verify-evidence/landing/`.

## Deploying

Vercel, as a separate project from the app:

| Setting          | Value           |
| ---------------- | --------------- |
| Root directory   | `landing`       |
| Framework preset | Vite            |
| Build command    | `npm run build` |
| Output directory | `dist`          |

Point the apex domain here and keep the app on its own subdomain — the landing
page should own the root for SEO.
