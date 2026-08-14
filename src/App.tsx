/**
 * Plusveda landing page — graphics-led rebuild.
 *
 * WHAT CHANGED FROM THE PREVIOUS VERSION, AND WHY
 * ------------------------------------------------
 * The old page was honest and well-organised and it lost on one point: it asked
 * a shop owner to READ. Five feature blocks of five bullets each, three
 * problem/fix essays, a founder's letter, six FAQs. The owner's verdict was
 * that nobody reads that, and that people understand a product from pictures —
 * and on a phone, scrolling past nine screens of prose, he is right.
 *
 * He also asked for the product screenshots to come off, because publishing the
 * whole interface hands it to whoever wants to copy it.
 *
 * Those two asks pull in the same direction, which is lucky, because the naive
 * reading of them does not: "no text and no screenshots" would leave a page of
 * decoration. What this page does instead is carry every claim on a DIAGRAM OF
 * THE WORK — the paper bill becoming stock, the nearest-expiry lot leaving the
 * shelf, the reorder list assembling itself at the counter. See
 * Illustrations.tsx. A diagram is faster to read than a paragraph AND shows
 * nothing an imitator could copy, because it depicts the job rather than the
 * interface.
 *
 * Copy is cut to roughly a quarter of what it was: a headline, one sentence
 * under it, and three-to-six words per diagram node. Everything that survived
 * is load-bearing.
 *
 * THREE THINGS THAT MUST NOT BE "IMPROVED" AWAY:
 *
 * 1. No logo wall, no testimonials, no customer count. Plusveda has no live
 *    customers yet, and a chemist who catches you inventing one will tell the
 *    other chemists. The diagrams and the free trial are the proof instead.
 * 2. The secondary CTA is a person, not a form. Indian SMB software is bought
 *    after a conversation, and that conversation happens on WhatsApp.
 * 3. The FAQ stays. It is the one place text genuinely beats a picture, because
 *    "what happens to my bill photo" and "does it do GST properly" are trust
 *    questions, and a diagram cannot answer them credibly.
 */
import { useEffect, useState } from "react";
import {
  FigBillToStock,
  FigFefo,
  FigExpiryRunway,
  FigShortbook,
  FigOneStock,
} from "./Illustrations";
import {
  contactHref,
  contactLabel,
  signinHref,
  signupHref,
  site,
} from "./config";

/* ---- building blocks ----------------------------------------------------- */

/** The real wordmark, not a letter in a rounded square. */
function Brand({ className = "brand" }: { className?: string }) {
  return (
    <a className={className} href="#top" aria-label="Plusveda — home">
      <img src="/brand/wordmark.png" alt="Plusveda" width={720} height={202} />
    </a>
  );
}

/**
 * Sticky action bar, phones only.
 *
 * Four visitors in five read this on a phone and the page is several screens
 * long. Without this, everything past the hero has no way to convert until the
 * footer. It stays out of the way until the hero's own buttons have scrolled
 * off, so the two are never on screen competing.
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

function Cta({ note }: { note?: string }) {
  return (
    <>
      <div className="hero-cta">
        <a className="btn btn-primary" href={signupHref}>
          Start free
        </a>
        <a className="btn btn-ghost" href={contactHref()}>
          {contactLabel}
        </a>
      </div>
      {note ? <p className="hero-note">{note}</p> : null}
    </>
  );
}

/* ---- content ------------------------------------------------------------- */

/**
 * Three facts, in figures. These are the page's only "stats", and each one is
 * checkable inside the product rather than being a marketing number.
 */
const LEDGER = [
  { figure: "2,00,000+", text: "medicines already in the catalogue" },
  { figure: "FEFO", text: "nearest expiry sold first, automatically" },
  { figure: "CGST · SGST · IGST", text: "worked out per line, on every bill" },
];

/**
 * The four capabilities, each carried by its diagram.
 *
 * One sentence each. The old page gave these five bullets apiece; if a chemist
 * wants that level of detail he is already in the free trial, where the real
 * answer lives.
 */
const CAPABILITIES = [
  {
    id: "fefo",
    kicker: "Expiry, handled",
    title: "The nearest-expiry batch sells itself",
    line: "Not an alert someone has to notice — the lot closest to its date is the one that goes on the bill.",
    Fig: FigFefo,
  },
  {
    id: "runway",
    kicker: "Money back",
    title: "See short-dated stock months out",
    line: "Early enough that the distributor will still take it back, which is the difference between a return and a write-off.",
    Fig: FigExpiryRunway,
  },
  {
    id: "shortbook",
    kicker: "Buying",
    title: "The reorder list writes itself",
    line: "One tap at the counter when something runs short or a customer asks for it. The list becomes the purchase order.",
    Fig: FigShortbook,
  },
  {
    id: "devices",
    kicker: "Everywhere",
    title: "Counter PC, phone, browser",
    line: "The same stock, so the shop and the owner are never looking at two different numbers.",
    Fig: FigOneStock,
  },
];

/**
 * Framed as questions about the WORK, not as claims about named competitors.
 * Each "usually" describes the common way of doing the job, which a chemist can
 * check against his own software in a minute — and which cannot go stale or
 * turn into a claim we have to defend when a rival ships an update.
 */
const COMPARISONS = [
  {
    q: "Getting a purchase bill in",
    usual: "Typed line by line",
    ours: "Photograph it",
  },
  {
    q: "Which batch gets sold",
    usual: "Whichever the counter picks",
    ours: "Nearest expiry, every time",
  },
  {
    q: "When you're out of stock",
    usual: "Send them elsewhere",
    ours: "Same-salt substitute, one tap",
  },
  {
    q: "Where the reorder list comes from",
    usual: "A number typed in once",
    ours: "What you actually sold",
  },
  {
    q: "What the assistant can see",
    usual: "Everything",
    ours: "Exactly what you choose",
  },
  { q: "Cost to start", usual: "A year, up front", ours: "Nothing" },
];

/**
 * Trust questions only. Every one of these is something a chemist asks before
 * he will put his stock in — and none of them can be answered by a picture.
 */
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
  return (
    <div id="top">
      <StickyBar />

      <header className="nav">
        <div className="wrap nav-inner">
          <Brand />
          <nav className="nav-links">
            <a href="#what">What it does</a>
            <a href="#compare">Compare</a>
            <a href="#faq">Questions</a>
          </nav>
          <div className="nav-cta">
            <a className="nav-signin" href={signinHref}>
              Sign in
            </a>
            <a className="btn btn-primary btn-sm" href={signupHref}>
              Start free
            </a>
          </div>
        </div>
      </header>

      {/*
        HERO. The headline leads with the purchase bill rather than billing
        speed: "bill in seconds" is what Marg, eVitalRx, Vyapar and myBillBook
        all say, so saying it louder wins nothing. Reading a photographed paper
        invoice is the job none of them advertises and the one a chemist dreads.

        The diagram does the explaining. One sentence supports it, and that is
        the whole of the hero copy.
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
              Every line — batch, expiry, MRP, rate and GST — read off your
              distributor's invoice and turned into stock you can sell.
            </p>
            <Cta note="Free to start · no card needed · browser, Android and the counter PC" />
          </div>

          <figure className="hero-fig">
            <FigBillToStock className="fig" />
          </figure>
        </div>
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

      {/*
        WHAT IT DOES — one diagram per capability, alternating sides so the eye
        zig-zags down the page instead of running down a column of identical
        cards. On a phone they stack, graphic first: the picture is the point,
        and it should arrive before the words.
      */}
      <section className="section" id="what">
        <div className="wrap">
          <div className="section-head">
            <div>
              <p className="label">What it does</p>
              <h2>Four jobs a medical store does every day</h2>
            </div>
          </div>

          <div className="caps">
            {CAPABILITIES.map(({ id, kicker, title, line, Fig }) => (
              <article className="cap" key={id}>
                <figure className="cap-fig">
                  <Fig className="fig" />
                </figure>
                <div className="cap-copy">
                  <p className="label">{kicker}</p>
                  <h3>{title}</h3>
                  <p>{line}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-sunken" id="compare">
        <div className="wrap">
          <div className="section-head">
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
        Where we are. Short, and it stays: it is the honest substitute for the
        logo wall this page cannot have, and being early is a reason for a first
        customer to talk to us rather than a weakness to hide.
      */}
      <section className="section">
        <div className="wrap letter">
          <div>
            <p className="label">Where we are</p>
            <h2>Taking on our first pharmacies now</h2>
          </div>
          <div>
            <p>
              No customer logos on this page, because it would not be true yet.
              Plusveda is built and it works — we are looking for a handful of
              medical stores to run it properly and tell us where it hurts.
            </p>
            <p>
              Talk to us before you sign up. You get us on the phone rather than
              a support ticket, and what you ask for is what gets built next.
            </p>
            <p className="sign">— The team at {site.company}</p>
          </div>
        </div>
      </section>

      <section className="section section-sunken" id="faq">
        <div className="wrap">
          <div className="section-head">
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
        <div className="wrap close-cta-grid">
          <div>
            <p className="label">Start today</p>
            <h2>Put one real bill through it</h2>
            <p>Nothing to install, and nothing to pay.</p>
          </div>
          <div>
            <Cta note="Prefer to talk first? We'd rather that too." />
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
