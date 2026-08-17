/**
 * Plusveda landing page — rebuilt against the reference site the owner sent.
 *
 * WHAT THIS IS
 * ------------
 * The owner pointed at mediflux.in and asked for the same page. It is copied
 * band for band: gradient hero with the product floating beside the headline,
 * layered wave divider, a strip of figures, a "what is it" block, a tabbed
 * showcase of the software, an eight-card feature grid built on images, price,
 * social proof, FAQ, closing CTA, footer. Same order, same proportions, same
 * typeface family (Outfit), same pill CTA.
 *
 * WHAT IS DELIBERATELY NOT COPIED, AND WHY
 * ----------------------------------------
 * Their headline, their body copy and their photographs are theirs. Their two
 * hero videos are recordings of the MediFlux interface — putting those on this
 * page would advertise their product on our domain. So every slot keeps the
 * reference's SHAPE and carries Plusveda's own content.
 *
 * The three claims-shaped slots are filled honestly, which is the one place
 * this page departs from the reference in substance:
 *   - the figures strip carries facts checkable inside the product, not
 *     "+4400% pharmacies";
 *   - where they run customer testimonials we say plainly that we are taking
 *     on our first pharmacies, because inventing a quote is the one mistake a
 *     chemist will tell every other chemist about;
 *   - the price band says free to start, because no price has been set.
 *
 * THE IMAGES ARE THE POINT
 * ------------------------
 * The owner's complaint about the previous version was vector illustrations
 * where the reference has photographs and product shots. There is not a single
 * drawing left on this page. It splits the work the way the reference does:
 *
 *   - the software itself, full width, where it can actually be read — the
 *     hero, the "what is it" block and the four-tab showcase. These are real
 *     screenshots of a running shop with real stock in it, shot by
 *     tools/shootLanding.mjs in the app repo, which refuses to publish a shot
 *     of an empty or unsellable screen.
 *   - photographs everywhere a picture only has to set a scene, above all the
 *     eight-card grid, where a screenshot would be unreadable at 250px.
 */
import { useEffect, useState } from "react";
import { Wave } from "./Wave";
import { Showcase, type Panel } from "./Showcase";
import { useReveal } from "./useReveal";
import {
  contactHref,
  contactLabel,
  signinHref,
  signupHref,
  site,
} from "./config";

/* ---- building blocks ----------------------------------------------------- */

function Brand({ className = "brand" }: { className?: string }) {
  return (
    <a className={className} href="#top" aria-label="Plusveda — home">
      <img src="/brand/wordmark.png" alt="Plusveda" width={720} height={202} />
    </a>
  );
}

/**
 * Sticky action bar, phones only. Four visitors in five read this on a phone
 * and the page is long; without it nothing past the hero can convert until the
 * footer. Hidden until the hero's own buttons have scrolled off so the two are
 * never competing.
 */
function StickyBar() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const hero = document.querySelector(".hero-cta");
    if (!hero || typeof IntersectionObserver === "undefined") return;
    const obs = new IntersectionObserver(
      ([e]) => setShow(!e.isIntersecting && e.boundingClientRect.top < 0),
      { threshold: 0 },
    );
    obs.observe(hero);
    return () => obs.disconnect();
  }, []);

  return (
    <div className={`sticky-bar${show ? " is-up" : ""}`} aria-hidden={!show}>
      <a className="btn btn-primary" href={signupHref} tabIndex={show ? 0 : -1}>
        Start free
      </a>
      <a className="btn btn-ghost" href={contactHref()} tabIndex={show ? 0 : -1}>
        {site.whatsappNumber ? "WhatsApp" : "Email us"}
      </a>
    </div>
  );
}

function Cta({ note, pill }: { note?: string; pill?: boolean }) {
  return (
    <>
      <div className="hero-cta">
        <a className={`btn btn-primary${pill ? " btn-pill" : ""}`} href={signupHref}>
          Start free
        </a>
        <a className={`btn btn-ghost${pill ? " btn-pill" : ""}`} href={contactHref()}>
          {contactLabel}
        </a>
      </div>
      {note ? <p className="hero-note">{note}</p> : null}
    </>
  );
}

/* ---- content ------------------------------------------------------------- */

/**
 * The figures strip. The reference runs growth percentages here; these are
 * facts a chemist can verify inside the product in a minute instead, which is
 * the only kind of number this page is entitled to publish.
 */
const LEDGER = [
  { figure: "2,00,000+", text: "medicines already in the catalogue" },
  { figure: "FEFO", text: "nearest expiry sold first, automatically" },
  { figure: "CGST · SGST · IGST", text: "worked out per line, on every bill" },
  { figure: "₹0", text: "to start — no card, no year up front" },
];

/** The tabbed showcase. Real screens, real data, no mock-ups. */
const PANELS: Panel[] = [
  {
    id: "dashboard",
    tag: "Every morning",
    label: "One screen",
    src: "/shots/dashboard.png",
    alt: "The Plusveda dashboard showing today's sales, a 30-day sales chart, expiring batches, low stock and money owed",
    line: "Today's takings, what is expiring, what has run short and what is owed — before you open the shutter.",
  },
  {
    id: "billing",
    tag: "At the counter",
    label: "GST billing",
    src: "/shots/billing.png",
    alt: "A sale in progress with three medicines, batch selection and a CGST and SGST breakdown",
    line: "Scan or search, FEFO picks the batch, CGST and SGST work themselves out per line.",
  },
  {
    id: "inventory",
    tag: "On the shelf",
    label: "Stock and batches",
    src: "/shots/inventory.png",
    alt: "The stock-on-hand screen listing products with quantities, batches and stock value",
    line: "Every batch, every location and what the stock is actually worth at cost.",
  },
  {
    id: "expiry",
    tag: "Before it hurts",
    label: "Expiry",
    src: "/shots/expiry.png",
    alt: "The expiry screen listing batches by how soon they expire",
    line: "Short-dated stock surfaces while the distributor will still take it back.",
  },
];

/**
 * Eight cards, four across, exactly as the reference lays them out — and
 * photographs rather than screenshots, for the same reason they use them.
 *
 * The first build of this grid used cropped screenshots of the product. At the
 * width these cards actually render — about 250px on a desktop — a 1440px
 * application screen is a field of grey noise; you cannot read a single row of
 * it. A photograph survives that reduction because it has one subject.
 *
 * So the software is shown where it can be seen: full width in the hero and in
 * the tabbed showcase above. The grid carries the atmosphere. That is exactly
 * how the reference site divides the same job.
 */
const FEATURES = [
  {
    id: "scan",
    title: "Photograph the purchase bill",
    line: "Batch, expiry, MRP, rate and GST read off your distributor's invoice and turned into sellable stock.",
    img: "/photos/photograph-bill.jpg",
    alt: "A phone being held over a printed invoice to photograph it",
  },
  {
    id: "gst",
    title: "Fast GST billing and barcode scanning",
    line: "Scan the pack or search by salt. CGST and SGST inside the state, IGST outside it, per line.",
    img: "/photos/scanner.jpg",
    alt: "A barcode scanner on a shop counter beside a monitor",
  },
  {
    id: "expiry",
    title: "Expiry caught early",
    line: "Nearest-expiry batches sell first, and short-dated stock is flagged while it can still go back.",
    img: "/photos/strips.jpg",
    alt: "Blister strips of tablets laid out on a wooden counter",
  },
  {
    id: "stock",
    title: "Stock you can trust",
    line: "Quantities, batches, locations and the value of what is on the shelf, at cost and at MRP.",
    img: "/photos/shelves.jpg",
    alt: "Shelves of medicine boxes in a pharmacy stockroom",
  },
  {
    id: "shortbook",
    title: "The reorder list writes itself",
    line: "One tap at the counter when something runs short. The ShortBook becomes the purchase order.",
    img: "/photos/clipboard.jpg",
    alt: "A hand writing a list on a clipboard",
  },
  {
    id: "reports",
    title: "Reports that reconcile",
    line: "Sales, expiry, warehouse and user activity — exported to Excel or PDF, totalled on the server.",
    img: "/photos/reports-desk.jpg",
    alt: "A laptop on a desk beside printed charts and a clipboard",
  },
  {
    id: "catalogue",
    title: "Two lakh medicines, ready",
    line: "Brand, salt, manufacturer and pack already in. You add what you stock and your own rates.",
    img: "/photos/pharmacist-shelves.jpg",
    alt: "A pharmacist checking a medicine box against packed shelves",
  },
  {
    id: "anywhere",
    title: "Counter PC, phone, browser",
    line: "The same stock and the same reports, so the shop and the owner never see two different numbers.",
    img: "/photos/phone-in-hand.jpg",
    alt: "Two hands holding a phone in a shop",
  },
];

/**
 * Framed as questions about the WORK, not claims about named competitors. Each
 * "usually" is something a chemist can check against his own software in a
 * minute, and none of it goes stale when a rival ships an update.
 */
const COMPARISONS = [
  { q: "Getting a purchase bill in", usual: "Typed line by line", ours: "Photograph it" },
  { q: "Which batch gets sold", usual: "Whichever the counter picks", ours: "Nearest expiry, every time" },
  { q: "When you're out of stock", usual: "Send them elsewhere", ours: "Same-salt substitute, one tap" },
  { q: "Where the reorder list comes from", usual: "A number typed in once", ours: "What you actually sold" },
  { q: "What the assistant can see", usual: "Everything", ours: "Exactly what you choose" },
  { q: "Cost to start", usual: "A year, up front", ours: "Nothing" },
];

/** Trust questions only — the one place text genuinely beats a picture. */
const FAQS = [
  {
    q: "Do I have to type in all my medicines first?",
    a: "No. Over two lakh medicines ship with it — brand, salt, manufacturer and pack. You search for what you stock and add it. Your rates, batches and quantities are yours; the medicine details are already there.",
  },
  {
    q: "Does it handle GST properly?",
    a: "Yes. Per line — CGST and SGST inside your state, IGST outside it — and the totals are worked out on the server, so the bill and the report always agree. Reports export to Excel and PDF.",
  },
  {
    q: "What happens to a bill photo I upload?",
    a: "It goes to Google's Gemini service to read the printed text, and the text comes back into your goods-received note. That is written plainly in our privacy policy, and it is the only place your data leaves our servers.",
  },
  {
    q: "Does it store patient records or prescriptions?",
    a: "No. It records what your pharmacy bought and sold. There are no patient files, no prescriptions and no medical advice anywhere in it.",
  },
];

/* ---- page ---------------------------------------------------------------- */

export default function App() {
  useReveal();

  return (
    <div id="top">
      <StickyBar />

      <header className="nav">
        <div className="wrap nav-inner">
          <Brand />
          <nav className="nav-links">
            <a href="#what">What it does</a>
            <a href="#features">Features</a>
            <a href="#compare">Compare</a>
            <a href="#faq">Questions</a>
          </nav>
          <div className="nav-cta">
            <a className="nav-signin" href={signinHref}>
              Sign in
            </a>
            <a className="btn btn-primary btn-sm btn-pill" href={signupHref}>
              Start free
            </a>
          </div>
        </div>
      </header>

      {/*
        HERO. Same construction as the reference — headline left, the product
        itself floating right, gradient band, wave along the bottom.

        The headline leads with the purchase bill rather than billing speed:
        "bill in seconds" is what Marg, eVitalRx, Vyapar and myBillBook all
        say, so saying it louder wins nothing. Reading a photographed paper
        invoice is the job none of them advertises and the one a chemist
        dreads.
      */}
      <section className="hero">
        <div className="wrap hero-grid">
          <div className="hero-copy">
            <p className="label">For medical stores in India</p>
            <h1>
              Stop typing purchase bills.
              <br />
              <span className="accent">Photograph them.</span>
            </h1>
            <p className="hero-sub">
              Billing, stock, batches, expiry and GST for an Indian medical
              store — with every line of your distributor's invoice read off a
              photograph.
            </p>
            <Cta pill note="Free to start · no card needed · browser, Android and the counter PC" />
          </div>

          <figure className="hero-fig" data-reveal>
            <img
              src="/shots/dashboard.png"
              alt="The Plusveda dashboard showing today's sales, a 30-day sales chart, batches expiring soon and stock value"
              width={1440}
              height={900}
              /* The one image above the fold — never lazy, and fetched ahead
                 of the rest so the hero is not a grey box on a 4G phone. */
              loading="eager"
              fetchPriority="high"
              decoding="async"
            />
          </figure>
        </div>
        <Wave />
      </section>

      <section className="ledger">
        <div className="wrap ledger-grid">
          {LEDGER.map((l) => (
            <div className="ledger-cell" key={l.figure}>
              <strong>{l.figure}</strong>
              <span>{l.text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* WHAT IS IT — the reference's big product-composite block. */}
      <section className="section" id="what">
        <div className="wrap what-grid">
          {/* The reference runs a composite of its own screens here. Same
              slot, same job: the billing screen, because a chemist recognises
              a GST bill faster than he recognises anything else we could
              put in front of him. */}
          <figure className="what-fig" data-reveal>
            <img
              src="/shots/billing.png"
              alt="A sale in progress in Plusveda, with three medicines, batch selection and a CGST and SGST breakdown"
              width={1440}
              height={900}
              loading="lazy"
              decoding="async"
            />
          </figure>
          <div className="what-copy" data-reveal>
            <p className="label">What is Plusveda?</p>
            <h2>The whole shop, in one place</h2>
            <p>
              Plusveda is billing and stock software for Indian medical stores.
              It knows what a batch is, what an expiry date costs you, and what
              CGST and SGST are supposed to do on a line — so the counter, the
              stockroom and the accountant are all reading the same numbers.
            </p>
            <p>
              It runs in a browser, on the counter PC and on an Android phone,
              on the same data. Nothing to install and nothing to pay to find
              out whether it suits you.
            </p>
            <Cta pill />
          </div>
        </div>
      </section>

      {/*
        SHOWCASE. The reference plays looping video of its own software behind
        a row of pill tabs. Same section, built from real stills — see
        Showcase.tsx for why stills beat video for this specific job.
      */}
      <section className="section section-sunken" id="showcase">
        <div className="wrap">
          <div className="section-head is-centred">
            <div>
              <p className="label">See it working</p>
              <h2>This is the actual software</h2>
              <p className="section-sub">
                Not a mock-up. These are screens from a running shop with real
                stock in it.
              </p>
            </div>
          </div>
          <Showcase panels={PANELS} />
        </div>
      </section>

      {/* EIGHT CARDS, four across — the reference's feature grid. */}
      <section className="section" id="features">
        <div className="wrap">
          <div className="section-head is-centred">
            <div>
              <p className="label">Everything included</p>
              <h2>All-in-one GST billing and inventory</h2>
              <p className="section-sub">
                Every job a medical store does in a day, in one login.
              </p>
            </div>
          </div>

          <div className="feat-grid">
            {FEATURES.map((f) => (
              <article className="feat" key={f.id} data-reveal>
                <figure className="feat-fig">
                  <img
                    src={f.img}
                    alt={f.alt}
                    width={1400}
                    height={933}
                    loading="lazy"
                    decoding="async"
                  />
                </figure>
                <h3>{f.title}</h3>
                <p>{f.line}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* PRICE. The reference's price band, told honestly. */}
      <section className="section section-sunken" id="price">
        <div className="wrap">
          <div className="price-card" data-reveal>
            <div>
              <p className="label">Best value</p>
              <h2>Free to start</h2>
              <p>
                No card, no annual licence up front, and no per-bill charge.
                Put one real purchase bill through it and decide from there.
                When we do set a price you will hear it from us first.
              </p>
            </div>
            <div className="price-side">
              <Cta pill note="Prefer to talk first? We'd rather that too." />
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="compare">
        <div className="wrap">
          <div className="section-head is-centred">
            <div>
              <p className="label">Side by side</p>
              <h2>The same six jobs, done two ways</h2>
            </div>
          </div>

          <div className="compare" role="table" aria-label="How the work differs">
            <div className="compare-head" role="row">
              <span role="columnheader">The job</span>
              <span role="columnheader">Usually</span>
              <span role="columnheader" className="is-ours">
                With Plusveda
              </span>
            </div>
            {COMPARISONS.map((c) => (
              <div className="compare-row" role="row" key={c.q}>
                <span role="cell" className="compare-q">
                  {c.q}
                </span>
                <span role="cell" className="compare-usual">
                  {c.usual}
                </span>
                <span role="cell" className="compare-ours">
                  {c.ours}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/*
        Where the reference runs testimonials. We have no customers yet, so it
        says so. This stays as it is — being early is a reason for a first
        customer to talk to us, and an invented quote is the one thing a
        chemist will tell every other chemist about.
      */}
      <section className="section section-sunken">
        <div className="wrap letter" data-reveal>
          <div>
            <p className="label">Where we are</p>
            <h2>Taking on our first pharmacies now</h2>
          </div>
          <div>
            <p>
              No customer logos and no testimonials on this page, because it
              would not be true yet. Plusveda is built and it works — we are
              looking for a handful of medical stores to run it properly and
              tell us where it hurts.
            </p>
            <p>
              Talk to us before you sign up. You get us on the phone rather than
              a support ticket, and what you ask for is what gets built next.
            </p>
            <p className="sign">— The team at {site.company}</p>
          </div>
        </div>
      </section>

      <section className="section" id="faq">
        <div className="wrap">
          <div className="section-head is-centred">
            <div>
              <p className="label">Straight answers</p>
              <h2>Before you put your stock in</h2>
            </div>
          </div>
          <div className="faq">
            {FAQS.map((f) => (
              <details key={f.q}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="close-cta">
        {/* Drawn INSIDE the green band, so it is painted in the colour of the
            section ABOVE — it is the previous background spilling down into
            this one. Filling it with this band's own green makes it
            invisible. */}
        <Wave fill="var(--surface)" flip height={90} className="wave-top" />
        <div className="wrap close-cta-grid">
          <div>
            <p className="label">Start today</p>
            <h2>Run your shop with confidence</h2>
            <p>Nothing to install, and nothing to pay.</p>
          </div>
          <div>
            <Cta pill note="Prefer to talk first? We'd rather that too." />
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="wrap">
          <div className="footer-top">
            <div>
              <Brand />
              <p className="footer-blurb">
                Billing and stock software for medical stores and pharmacies in
                India. Built by {site.company}.
              </p>
            </div>
            <div className="footer-cols">
              <div className="footer-col">
                <h4>Product</h4>
                <a href="#what">What it does</a>
                <a href="#features">Features</a>
                <a href="#compare">Compare</a>
                <a href="#faq">Questions</a>
                {site.playStoreUrl ? (
                  <a href={site.playStoreUrl}>Get it on Google Play</a>
                ) : null}
              </div>
              <div className="footer-col">
                <h4>Get started</h4>
                <a href={signupHref}>Start free</a>
                <a href={signinHref}>Sign in</a>
                <a href={contactHref()}>{contactLabel}</a>
              </div>
              <div className="footer-col">
                <h4>Legal</h4>
                <a href={site.privacyUrl}>Privacy policy</a>
                <a href={site.deleteAccountUrl}>Delete your account</a>
                <a href={`mailto:${site.supportEmail}`}>{site.supportEmail}</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <span>
              © {new Date().getFullYear()} {site.company}. All rights reserved.
            </span>
            <span>
              Plusveda records what your pharmacy bought and sold. It does not
              store patient records or prescriptions.
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
