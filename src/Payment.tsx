/**
 * The payment page — /payment/. Pick a plan, pay by UPI QR or bank transfer.
 *
 * There is no gateway behind it: the QR is a plain UPI intent carrying the
 * plan's amount, so nothing here learns whether a payment landed. The visitor
 * sends the reference to us and a person activates the plan.
 */
import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import {
  contactHref,
  inr,
  payment,
  planMath,
  plans,
  site,
  upiUri,
  type Plan,
} from "./config";

type Checkout = { plan: Plan; ref: string; expiresAt: number };

function newCheckout(plan: Plan): Checkout {
  const ref = `PV${plan.id.toUpperCase()}${Date.now().toString(36).toUpperCase()}`;
  return { plan, ref, expiresAt: Date.now() + payment.qrValidMs };
}

function CopyRow({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard?.writeText(value).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      },
      () => setCopied(false),
    );
  };

  return (
    <div className="pay-row">
      <dt>{label}</dt>
      <dd>
        <span className="pay-value">{value}</span>
        <button
          type="button"
          className="pay-copy"
          onClick={copy}
          aria-label={`Copy ${label}`}
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </dd>
    </div>
  );
}

/** Ticks once a second until `until`, then stops. */
function useRemaining(until: number) {
  const [now, setNow] = useState(Date.now());
  const left = Math.max(0, until - now);
  useEffect(() => {
    if (left === 0) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [left === 0]);
  return left;
}

function PaymentDetails({
  checkout,
  onRenew,
}: {
  checkout: Checkout;
  onRenew: () => void;
}) {
  const { plan, ref, expiresAt } = checkout;
  const uri = upiUri(plan, ref);
  const [qr, setQr] = useState<string | null>(null);
  const [qrError, setQrError] = useState(false);
  const left = useRemaining(expiresAt);
  const expired = left === 0;

  useEffect(() => {
    QRCode.toDataURL(uri, { width: 480, margin: 1, errorCorrectionLevel: "M" })
      .then(setQr)
      .catch(() => setQrError(true));
  }, [uri]);

  const mm = Math.floor(left / 60000);
  const ss = String(Math.floor((left % 60000) / 1000)).padStart(2, "0");

  return (
    <div className="pay-panel" id="pay" tabIndex={-1}>
      <div className="pay-summary">
        <p className="label">Paying for</p>
        <h2>{plan.name}</h2>
        <p className="pay-amount">{inr(plan.total)}</p>
        <p className="pay-ref">
          Reference <strong>{ref}</strong>
        </p>
      </div>

      <div className="pay-grid">
        <section className="pay-card" aria-labelledby="pay-upi">
          <h3 id="pay-upi">Scan and pay with any UPI app</h3>

          {expired ? (
            <div className="pay-expired" role="status">
              <p>This QR code has expired.</p>
              <button
                type="button"
                className="btn btn-primary"
                onClick={onRenew}
              >
                Generate a new QR
              </button>
            </div>
          ) : (
            <>
              <div className="pay-qr">
                {qr ? (
                  <img
                    src={qr}
                    width={240}
                    height={240}
                    alt={`UPI QR code to pay ${inr(plan.total)} to ${payment.accountName}`}
                  />
                ) : (
                  <p>
                    {qrError
                      ? "Could not draw the QR. Use the UPI ID below."
                      : "Loading…"}
                  </p>
                )}
              </div>
              <p className="pay-timer">
                Valid for {mm}:{ss}
              </p>
              {/* A phone cannot scan its own screen — this opens the UPI app
                  directly with the same amount. */}
              <a className="btn btn-primary pay-open" href={uri}>
                Pay {inr(plan.total)} in a UPI app
              </a>
            </>
          )}

          <dl className="pay-list">
            <CopyRow label="UPI ID" value={payment.upiId} />
          </dl>
        </section>

        <section className="pay-card" aria-labelledby="pay-bank">
          <h3 id="pay-bank">Or pay by bank transfer</h3>
          <dl className="pay-list">
            <CopyRow label="Account name" value={payment.accountName} />
            <CopyRow label="Account no." value={payment.accountNumber} />
            <CopyRow label="IFSC" value={payment.ifsc} />
            <CopyRow label="Amount" value={String(plan.total)} />
          </dl>
          <p className="pay-hint">
            Put <strong>{ref}</strong> in the transfer remarks.
          </p>
        </section>
      </div>

      <p className="pay-after">
        After paying, send us the reference with your UTR number or a
        screenshot, and we&apos;ll activate your plan.{" "}
        <a
          href={contactHref(
            `Hi, I've paid ${inr(plan.total)} for the Plusveda ${plan.name}. Reference: ${ref}. UTR: `,
            `Plusveda payment ${ref}`,
          )}
        >
          {site.whatsappNumber ? "Send on WhatsApp" : "Email us"}
        </a>
      </p>
    </div>
  );
}

export default function Payment() {
  const [checkout, setCheckout] = useState<Checkout | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const choose = (plan: Plan) => setCheckout(newCheckout(plan));

  useEffect(() => {
    const el = panelRef.current?.querySelector<HTMLElement>("#pay");
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
    el?.focus({ preventScroll: true });
  }, [checkout?.plan.id]);

  return (
    <>
      <header className="nav">
        <div className="wrap nav-inner">
          <a className="brand" href="/" aria-label="Plusveda — home">
            <img
              src="/brand/wordmark.png"
              alt="Plusveda"
              width={1000}
              height={299}
            />
          </a>
          <a className="nav-signin" href="/#price">
            &larr; Back to pricing
          </a>
        </div>
      </header>

      <main className="section">
        <div className="wrap">
          <div className="section-head is-centred">
            <div>
              <p className="label">Payment</p>
              <h1>Choose your plan</h1>
              <p className="section-sub">
                Each plan is paid once for the whole term. Nothing renews on its
                own.
              </p>
            </div>
          </div>

          <div className="plans">
            {plans.map((plan) => {
              const { perMonth, savePct } = planMath(plan);
              const selected = checkout?.plan.id === plan.id;
              return (
                <article
                  key={plan.id}
                  className={`plan${plan.featured ? " is-featured" : ""}${
                    selected ? " is-selected" : ""
                  }`}
                >
                  {plan.featured ? (
                    <p className="plan-ribbon">Best value</p>
                  ) : null}
                  <div className="plan-head">
                    <h3>{plan.name}</h3>
                    {savePct > 0 ? (
                      <span className="plan-save">Save {savePct}%</span>
                    ) : null}
                  </div>
                  <p className="plan-blurb">
                    {inr(perMonth)}/month · {plan.blurb}
                  </p>
                  <p className="plan-rate">
                    <span className="plan-cur">₹</span>
                    <span className="plan-num">
                      {plan.total.toLocaleString("en-IN")}
                    </span>
                    <span className="plan-per">once</span>
                  </p>
                  <button
                    type="button"
                    className={`btn btn-pill plan-cta ${
                      selected || plan.featured ? "btn-primary" : "btn-ghost"
                    }`}
                    aria-pressed={selected}
                    onClick={() => choose(plan)}
                  >
                    {selected ? "Selected" : `Pay ${inr(plan.total)}`}
                  </button>
                </article>
              );
            })}
          </div>

          <div ref={panelRef}>
            {checkout ? (
              <PaymentDetails
                key={checkout.ref}
                checkout={checkout}
                onRenew={() => choose(checkout.plan)}
              />
            ) : null}
          </div>
        </div>
      </main>

      <footer className="footer">
        <div className="wrap footer-bottom">
          <span>
            © {new Date().getFullYear()} {site.company}. Questions about
            paying?{" "}
            <a href={`mailto:${site.supportEmail}`}>{site.supportEmail}</a>
          </span>
        </div>
      </footer>
    </>
  );
}
