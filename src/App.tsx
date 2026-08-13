/**
 * Plusveda landing page.
 *
 * The section order follows what holds up across the 2026 SaaS teardowns —
 * hero → proof → problem → features → how it works → objections → one closing
 * CTA. The DRESSING of those sections deliberately does not, because the
 * default dressing is what makes a page look machine-made. See styles.css for
 * the art direction; the short version is that a pharmacy runs on ruled
 * paperwork and batch numbers, so this page is ruled and set in mono figures
 * rather than stacked out of rounded cards.
 *
 * Two things are load-bearing and should not be "improved" away:
 *
 * 1. No logo wall, no testimonials, no customer count. Plusveda has no live
 *    customers yet, and a chemist who finds out you invented one will tell the
 *    other chemists. The screenshots are the proof instead — every one captured
 *    from the running app by tools/captureProductShots.mjs.
 * 2. The secondary CTA is a person, not a form. Indian SMB software is bought
 *    after a conversation, and that conversation happens on WhatsApp.
 */
import { useEffect, useState } from "react";
import ScreenPreview from "./ScreenPreview";
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
      <img
        src="/brand/wordmark.png"
        alt="Plusveda"
        width={720}
        height={202}
      />
    </a>
  );
}

/**
 * Sticky action bar, phones only.
 *
 * This page is read on a phone by roughly four visitors in five, and it is
 * several screens long. Without this, everything past the hero has no way to
 * convert until the footer — the reader has to scroll back up to act on the
 * moment they decided. A sticky bar is worth about 14% on scrolling pages, and
 * it costs nothing but a fixed strip at the bottom of the glass.
 *
 * It stays out of the way until the hero's own buttons have gone, so the two
 * are never on screen competing.
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
      <a
        className="btn btn-primary"
        href={signupHref}
        tabIndex={show ? 0 : -1}
      >
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

const LEDGER = [
  {
    figure: "2,00,000+",
    text: "medicines already in the catalogue — you won't type yours in",
  },
  {
    figure: "FEFO",
    text: "nearest expiry is picked and sold first, automatically",
  },
  {
    figure: "CGST · SGST · IGST",
    text: "worked out per line, in-state or out, on every bill",
  },
  {
    figure: "3 screens, 1 shelf",
    text: "counter PC, the owner's phone and any browser see the same stock",
  },
];

const LOSSES = [
  {
    tag: "Money on the shelf",
    title: "Stock expires before you notice",
    what: "A strip that crosses its date is a full write-off — you paid for it and you can't sell it. By the time it turns up in a stock check, the supplier won't take it back either.",
    fix: "Plusveda sells the nearest-expiry batch first and shows you what's going short-dated while there is still time to return it.",
  },
  {
    tag: "The queue",
    title: "Billing is slower than the counter",
    what: "Find the medicine, then the batch, then the rate, then the GST — for every line, with four people waiting and one of them asking whether you have a cheaper salt.",
    fix: "Scan the pack, or type a brand or salt name. Batch, expiry, rate and GST land on the line already filled in.",
  },
  {
    tag: "Buying blind",
    title: "The reorder list lives in your head",
    what: "You remember the fast movers on the day the distributor calls, and forget the one a customer asked for on Tuesday. The order goes out short.",
    fix: "ShortBook records it the moment it happens — one tap at the counter — and turns the list into a purchase order.",
  },
];

const FEATURES = [
  {
    label: "Billing",
    title: "Billing that keeps up with the queue",
    body: "Search by brand name or by salt, or scan the pack — the nearest-expiry batch is chosen for you, priced, and taxed.",
    points: [
      "Barcode, pack photo, brand name or salt composition — four ways to find one medicine",
      "Sell by strip or by piece; the rate converts itself",
      "CGST + SGST for local supply, IGST outside the state",
      "Cash, card, UPI or credit — then print or share the invoice",
      "Out of stock? Same-salt substitutes that are on your shelf, in one tap",
    ],
  },
  {
    label: "Expiry",
    title: "See expiry coming, months out",
    body: "Short-dated stock is worth full value to your supplier and nothing at all to you. The difference is how early you spot it.",
    points: [
      "Every medicine tracked by batch, expiry date and shelf location",
      "Near-expiry report while the stock can still go back",
      "Damage and write-offs recorded with a reason, so the loss is explainable",
      "Batch and expiry search — find one lot across the whole shop",
    ],
  },
  {
    label: "Reordering",
    title: "The reorder list writes itself",
    body: "ShortBook is built from what you actually sell and what customers ask for — not from a number you guessed when you set the product up.",
    points: [
      "Add any medicine while billing, in one tap, without leaving the bill",
      "Set how many of each you want to keep on the shelf",
      "Turn the whole list into a purchase order for the distributor",
    ],
  },
  {
    label: "Suppliers & money",
    title: "What you owe, and what clears when",
    body: "Purchases, returns and the cheque register in the same place as the stock they paid for.",
    points: [
      "Purchase returns recorded against the original bill",
      "Supplier ledger with what is outstanding against each one",
      "Cheque / PDC register so a post-dated cheque never surprises you",
      "Warehouse and branch transfers, tracked both ends",
    ],
  },
  {
    label: "Owner's view",
    title: "Know what happened, and who did it",
    body: "The counter runs on the app; you run on what it tells you afterwards. Both from the same data, wherever you are.",
    points: [
      "Sales, expiry, warehouse and staff activity reports — export to Excel or PDF",
      "Add staff and choose exactly what each person can see and do",
      "A full audit trail of who did what, and when",
      "Limit how many devices one account can be signed in on",
    ],
  },
];

const SCANBILL_POINTS = [
  "Product, batch, expiry, quantity, rate, MRP, discount and GST read off the page",
  "The goods-received note is laid out like the bill, so you can match it line by line",
  "Correct anything it misread before a single unit reaches your stock",
];

const FAQS = [
  {
    q: "Do I have to type in all my medicines first?",
    a: "No. Plusveda ships with a catalogue of over two lakh medicines — brand, salt composition, manufacturer and pack. You search for what you stock and add it. Your rates, batches and quantities are yours; the medicine details are already there.",
  },
  {
    q: "Does it handle GST properly?",
    a: "Yes. GST is worked out per line — CGST and SGST for supply inside your state, IGST outside it — and the totals are calculated on the server, not in the browser, so the bill and the report always agree. Reports export to Excel and PDF.",
  },
  {
    q: "Can my staff use it without seeing everything?",
    a: "Yes. You add each person and choose exactly what they can see and do, so a counter assistant can bill without opening your purchase rates or your reports. Every action is written to an audit trail with a name and a time against it.",
  },
  {
    q: "What happens to a bill photo I upload?",
    a: "It is sent to Google's Gemini service to read the printed text off it, and the text comes back into your goods-received note. That is written down plainly in our privacy policy, and it is the only place your data leaves our servers.",
  },
  {
    q: "Does Plusveda store patient records or prescriptions?",
    a: "No. It records what your pharmacy bought and sold. There are no patient files, no prescriptions and no medical advice anywhere in it.",
  },
  {
    q: "What does it run on?",
    a: "Any browser, an Android phone or tablet, and a Windows desktop app for the counter PC. They all read and write the same stock, so the shop and the owner are never looking at two different numbers.",
  },
];

/* ---- page ---------------------------------------------------------------- */

/**
 * True on a phone, and it keeps listening — a tablet turned on its side or a
 * desktop window dragged narrow crosses this line, and reading it once at
 * mount left the spec sheet in whichever state the first paint happened to
 * catch.
 */
function useIsPhone() {
  const [phone, setPhone] = useState(false);
  useEffect(() => {
    if (typeof matchMedia === "undefined") return;
    const mq = matchMedia("(max-width: 640px)");
    const sync = () => setPhone(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return phone;
}

export default function App() {
  const phone = useIsPhone();

  return (
    <div id="top">
      <StickyBar />
      <header className="nav">
        <div className="wrap nav-inner">
          <Brand />
          <nav className="nav-links">
            <a href="#losses">Why switch</a>
            <a href="#features">What's inside</a>
            <a href="#how">Getting started</a>
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

      <section className="hero">
        <div className="wrap hero-grid">
          <div>
            <p className="label">For medical stores in India</p>
            <h1>
              Bill in seconds.
              <br />
              Never sell an <span className="accent">expired strip</span>.
            </h1>
            <p className="hero-sub">
              Plusveda is GST billing and batch-wise stock software for your
              medical store. Scan the pack — the nearest-expiry batch is picked,
              priced and taxed for you.
            </p>
            <Cta note="Free to start · no card needed · browser, Android and the counter PC" />
          </div>

          {/* Navigable, and every screen in it is a photograph rather than a
              replica — see ScreenPreview.tsx. It runs off the right edge of
              the page on purpose: that keeps the app big enough to read. */}
          <div className="hero-shot">
            <ScreenPreview />
          </div>
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

      <section className="section" id="losses">
        <div className="wrap">
          <div className="section-head">
            <div>
              <p className="label">Why a chemist switches</p>
              <h2>Three things quietly cost you money every month</h2>
            </div>
            <div>
              <p>
                None of them looks like an emergency on any single day. That is
                exactly why they add up.
              </p>
            </div>
          </div>

          <div className="losses">
            {LOSSES.map((l, i) => (
              <article className="loss" key={l.title}>
                <div className="loss-n">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div>
                  <span className="loss-tag">{l.tag}</span>
                  <h3>{l.title}</h3>
                  <p className="loss-what">{l.what}</p>
                </div>
                <div className="loss-fix">
                  <span className="label-plain">With Plusveda</span>
                  {l.fix}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/*
        Specifications, not a slideshow.
        This section used to repeat a full-width screenshot under every heading
        — five of them, all screens the visitor could already click through in
        the hero. That is the same proof twice, and it cost about 4,000px of
        scrolling to say nothing new. Free-to-start products convert on short
        pages; the reader who is still here wants the spec sheet, not another
        picture of a screen they just drove.
      */}
      <section className="section section-sunken" id="features">
        <div className="wrap">
          <div className="section-head">
            <div>
              <p className="label">What's inside</p>
              <h2>The whole shop, not just the billing screen</h2>
            </div>
            <div>
              <p>
                Every one of these is on the screens you just clicked through —
                scroll back up and open any of them.
              </p>
            </div>
          </div>

          {/*
            Open on a desktop, folded on a phone.
            Laid flat, these five ran to about 1,600px of phone scrolling —
            most of it detail that a chemist skims past looking for the one
            area they came to check. Folded, the five headings fit on one
            screen and the reader opens what they care about. Desktop has the
            room, so it keeps them all open and nobody has to click anything.
          */}
          <div className="specs">
            {FEATURES.map((f) => (
              <details className="spec" key={f.title} open={!phone}>
                <summary>
                  <span>
                    <span className="label">{f.label}</span>
                    <h3>{f.title}</h3>
                  </span>
                </summary>
                <p className="spec-body">{f.body}</p>
                <ul>
                  {f.points.map((pt) => (
                    <li key={pt}>
                      <i aria-hidden="true">—</i>
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/*
        Scan Bill is reached from Receive Stock rather than the sidebar, so it
        is the one capability the hero preview cannot show you — hence its own
        section.
        It has NO screenshot, deliberately. The screen only means anything with
        a bill on it, and every bill available to shoot is a real distributor's
        invoice carrying their GSTIN, their bank details and a named pharmacy's
        purchases. Publishing somebody else's paperwork to sell software is not
        a trade worth making. The empty screen proves nothing, so it says so in
        words instead — see README before adding a picture here.
      */}
      <section className="section" id="scan">
        <div className="wrap">
          <div className="feature-copy">
            <div>
              <p className="label">Not in the preview</p>
              <h3>Photograph the distributor's bill</h3>
              <p>
                The slowest hour of the week is typing a purchase bill back in.
                Take a picture of it instead and check what Plusveda read. It
                opens from Receive Stock, so it is the one screen you can't
                click to at the top of this page.
              </p>
            </div>
            <ul>
              {SCANBILL_POINTS.map((pt) => (
                <li key={pt}>
                  <i aria-hidden="true">—</i>
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="section" id="how">
        <div className="wrap">
          <div className="section-head">
            <div>
              <p className="label">Getting started</p>
              <h2>Billing your first customer takes an afternoon, not a week</h2>
            </div>
            <div>
              <p>
                Nobody has to visit your shop, and there is nothing to install
                on the counter PC unless you want the desktop app.
              </p>
            </div>
          </div>

          <div className="steps">
            <article className="step">
              <p className="step-n">STEP 01</p>
              <h3>Create your pharmacy</h3>
              <p>
                Your shop name, GSTIN and drug licence number. A few minutes,
                and you are inside the software.
              </p>
            </article>
            <article className="step">
              <p className="step-n">STEP 02</p>
              <h3>Pick what you stock</h3>
              <p>
                Search the two-lakh catalogue and add what is on your shelves,
                then enter opening batches — or let your first purchase bill do
                it by photograph.
              </p>
            </article>
            <article className="step">
              <p className="step-n">STEP 03</p>
              <h3>Start billing</h3>
              <p>
                Scan a pack and sell. Expiry tracking, GST, ShortBook and the
                reports fill themselves in from the sales you make.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="section section-sunken">
        <div className="wrap letter">
          <div>
            <p className="label">Where we are</p>
            <h2>We're taking on our first pharmacies now</h2>
          </div>
          <div>
            <p>
              You won't find a wall of customer logos on this page, because it
              would not be true yet. Plusveda is built, it works, and every
              screenshot above is the real thing — but we are at the start,
              looking for a handful of medical stores to run it properly and
              tell us where it hurts.
            </p>
            <p>
              If that is interesting to you, talk to us before you sign up. You
              will get us on the phone rather than a support ticket, and what
              you ask for is what gets built next.
            </p>
            <p className="sign">— The team at {site.company}</p>
          </div>
        </div>
      </section>

      <section className="section" id="faq">
        <div className="wrap">
          <div className="section-head">
            <div>
              <p className="label">Straight answers</p>
              <h2>Questions a chemist actually asks</h2>
            </div>
            <div>
              <p>
                If yours is not here, ask us — the same person who built it will
                answer.
              </p>
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
            <h2>Your shelf, finally telling you the truth</h2>
            <p>
              Add your own medicines and put a real bill through it. Nothing to
              install, and nothing to pay.
            </p>
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
                <a href="#features">What's inside</a>
                <a href="#how">Getting started</a>
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
