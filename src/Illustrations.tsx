/**
 * The page's graphics.
 *
 * WHY THESE EXIST, AND WHY THEY ARE NOT SCREENSHOTS
 * -------------------------------------------------
 * The previous page led with photographs of the running app, on the principle
 * that a real screenshot beats a drawing of one. That principle is sound and it
 * lost to two arguments from the owner:
 *
 *   1. Screenshots hand the interface to anyone who wants to copy it. In a
 *      market where half a dozen products chase the same chemist, publishing
 *      your whole UI is a decision, not a default.
 *   2. Nobody reads a wall of prose. A shop owner scanning on a phone takes in
 *      shapes before sentences, and the old page asked him to read four
 *      paragraphs before he understood what the thing did.
 *
 * So the page is carried by DIAGRAMS OF THE WORK, not pictures of the product.
 * That is a genuinely different thing and it happens to be better at the job: a
 * screenshot shows what a screen looks like, while a diagram shows what happens
 * to your paper bill — which is the question a chemist is actually asking.
 *
 * Rules these follow:
 *  - Every diagram is a WORKFLOW: something goes in on the left, something
 *    useful comes out on the right. No invented UI chrome, no fake sidebars.
 *  - Inline SVG, no image files. They stay sharp on any screen, cost no extra
 *    request, theme with CSS variables, and cannot be lifted as an asset.
 *  - Short labels, not sentences. A diagram with no words is decoration; a
 *    diagram with a paragraph in it is just prose in a box. Two or three words
 *    per node.
 *  - `role="img"` with a real title, because a diagram that carries the
 *    explanation must also carry it for a screen reader.
 *  - The ledger art direction: hairlines, one flat green, sharp corners, mono
 *    figures. It matches the product and it is not what a template looks like.
 */

const RULE = "var(--rule-strong)";
const HAIR = "var(--rule)";
const INK = "var(--text-primary)";
const MUTED = "var(--text-tertiary)";
const GREEN = "var(--brand-600)";
const GREEN_DEEP = "var(--brand-700)";
const WASH = "var(--brand-50)";

interface FigProps {
  className?: string;
}

/** Shared <title>/<desc> so every figure is described, not just drawn. */
function A11y({ title, desc }: { title: string; desc: string }) {
  return (
    <>
      <title>{title}</title>
      <desc>{desc}</desc>
    </>
  );
}

/** A sheet of paper with ruled lines — the distributor's invoice. */
function PaperBill({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect
        width="96"
        height="120"
        rx="3"
        fill="#fff"
        stroke={RULE}
        strokeWidth="1.5"
      />
      {/* A folded corner says "paper" faster than any label. */}
      <path d="M96 0 L96 18 L78 0 Z" fill={HAIR} />
      <rect x="12" y="18" width="44" height="5" rx="2" fill={RULE} />
      {[36, 50, 64, 78, 92].map((ly) => (
        <g key={ly}>
          <rect x="12" y={ly} width="40" height="4" rx="2" fill={HAIR} />
          <rect x="62" y={ly} width="22" height="4" rx="2" fill={HAIR} />
        </g>
      ))}
    </g>
  );
}

/** An arrow between stages. Direction is the whole point of these diagrams. */
function Flow({ x, y, w = 44 }: { x: number; y: number; w?: number }) {
  return (
    <g transform={`translate(${x} ${y})`} aria-hidden="true">
      <line x1="0" y1="0" x2={w - 8} y2="0" stroke={RULE} strokeWidth="1.5" />
      <path
        d={`M${w - 10} -4 L${w} 0 L${w - 10} 4 Z`}
        fill={RULE}
      />
    </g>
  );
}

function Caption({
  x,
  y,
  children,
  strong,
}: {
  x: number;
  y: number;
  children: string;
  strong?: boolean;
}) {
  return (
    <text
      x={x}
      y={y}
      textAnchor="middle"
      fill={strong ? INK : MUTED}
      fontSize="12"
      fontFamily="var(--font-mono)"
      fontWeight={strong ? 600 : 400}
    >
      {children}
    </text>
  );
}

/**
 * HERO — the paper bill becomes stock.
 *
 * This is the one thing on the page that competitors don't advertise, so it is
 * the one thing the top of the page should show rather than claim.
 */
export function FigBillToStock({ className }: FigProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 520 200"
      role="img"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <A11y
        title="A photographed paper bill becomes stock on the shelf"
        desc="A distributor's paper invoice is photographed with a phone; every line — medicine, batch, expiry and rate — is read off it and lands as stock, without typing."
      />

      <PaperBill x={8} y={34} />
      <Caption x={56} y={176}>
        paper bill
      </Caption>

      <Flow x={116} y={94} />

      {/* The phone, mid-capture. */}
      <g transform="translate(176 24)">
        <rect
          width="84"
          height="140"
          rx="10"
          fill="#fff"
          stroke={INK}
          strokeWidth="1.5"
        />
        <rect x="30" y="7" width="24" height="4" rx="2" fill={RULE} />
        {/* Camera frame corners — the universal "scanning" mark. */}
        <g stroke={GREEN} strokeWidth="2.5" strokeLinecap="round">
          <path d="M20 40 L20 30 L30 30" />
          <path d="M54 30 L64 30 L64 40" />
          <path d="M64 104 L64 114 L54 114" />
          <path d="M30 114 L20 114 L20 104" />
        </g>
        <line
          x1="20"
          y1="72"
          x2="64"
          y2="72"
          stroke={GREEN}
          strokeWidth="2"
          strokeLinecap="round"
        />
      </g>
      <Caption x={218} y={176} strong>
        one photo
      </Caption>

      <Flow x={276} y={94} />

      {/* Stock rows, arriving already filled in. */}
      <g transform="translate(336 34)">
        <rect
          width="176"
          height="120"
          rx="3"
          fill="#fff"
          stroke={RULE}
          strokeWidth="1.5"
        />
        <rect width="176" height="24" rx="3" fill={WASH} />
        <text
          x="12"
          y="16"
          fill={GREEN_DEEP}
          fontSize="10"
          fontFamily="var(--font-mono)"
          fontWeight="600"
          letterSpacing="0.6"
        >
          BATCH · EXP · RATE
        </text>
        {[38, 60, 82, 104].map((ly, i) => (
          <g key={ly}>
            <line
              x1="0"
              y1={ly - 10}
              x2="176"
              y2={ly - 10}
              stroke={HAIR}
              strokeWidth="1"
            />
            <rect x="12" y={ly - 5} width="52" height="5" rx="2" fill={RULE} />
            <rect x="74" y={ly - 5} width="30" height="5" rx="2" fill={HAIR} />
            <rect
              x="114"
              y={ly - 5}
              width="50"
              height="5"
              rx="2"
              fill={i === 0 ? GREEN : HAIR}
            />
          </g>
        ))}
      </g>
      <Caption x={424} y={176}>
        stock, priced
      </Caption>
    </svg>
  );
}

/**
 * FEFO — which batch leaves the shelf.
 *
 * Three lots of the same medicine with different expiry dates; the nearest one
 * is the one that goes. The whole idea in one picture, where the old page spent
 * a paragraph on it.
 */
export function FigFefo({ className }: FigProps) {
  const lots = [
    { code: "B-104", exp: "08/26", near: true },
    { code: "B-118", exp: "02/27", near: false },
    { code: "B-133", exp: "11/27", near: false },
  ];
  return (
    <svg
      className={className}
      viewBox="0 0 420 190"
      role="img"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <A11y
        title="The nearest-expiry batch is sold first"
        desc="Three batches of the same medicine sit on the shelf with different expiry dates. The one expiring soonest is picked automatically for the bill, so stock is used before it can expire."
      />

      {lots.map((l, i) => {
        const x = 8 + i * 104;
        const on = l.near;
        return (
          <g key={l.code} transform={`translate(${x} 30)`}>
            <rect
              width="88"
              height="70"
              rx="3"
              fill={on ? WASH : "#fff"}
              stroke={on ? GREEN : RULE}
              strokeWidth={on ? 2 : 1.5}
            />
            <text
              x="44"
              y="28"
              textAnchor="middle"
              fill={on ? GREEN_DEEP : MUTED}
              fontSize="12"
              fontFamily="var(--font-mono)"
              fontWeight="600"
            >
              {l.code}
            </text>
            <text
              x="44"
              y="50"
              textAnchor="middle"
              fill={on ? GREEN_DEEP : MUTED}
              fontSize="14"
              fontFamily="var(--font-mono)"
            >
              {l.exp}
            </text>
            <Caption x={44} y={92}>
              {on ? "expires first" : "waits"}
            </Caption>
          </g>
        );
      })}

      {/* Only the near lot has a path out to the bill. */}
      <path
        d="M52 132 L52 152 L360 152"
        stroke={GREEN}
        strokeWidth="2"
        strokeDasharray="0"
        fill="none"
      />
      <path d="M356 148 L366 152 L356 156 Z" fill={GREEN} />
      <text
        x="200"
        y="172"
        textAnchor="middle"
        fill={GREEN_DEEP}
        fontSize="12"
        fontFamily="var(--font-mono)"
        fontWeight="600"
      >
        goes on the bill
      </text>
    </svg>
  );
}

/**
 * EXPIRY — how far ahead you see it.
 *
 * A timeline, because "months out" is a statement about time and a bar chart of
 * months says it instantly.
 */
export function FigExpiryRunway({ className }: FigProps) {
  const months = [
    { m: "now", h: 0 },
    { m: "+1", h: 16 },
    { m: "+2", h: 30 },
    { m: "+3", h: 44 },
  ];
  return (
    <svg
      className={className}
      viewBox="0 0 420 170"
      role="img"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <A11y
        title="Short-dated stock is flagged months before it expires"
        desc="A timeline showing stock flagged at thirty, sixty and ninety days before expiry — while the distributor will still take it back."
      />
      <line
        x1="16"
        y1="112"
        x2="404"
        y2="112"
        stroke={RULE}
        strokeWidth="1.5"
      />
      {months.map((mo, i) => {
        const x = 40 + i * 108;
        const on = i > 0;
        return (
          <g key={mo.m}>
            <line
              x1={x}
              y1="106"
              x2={x}
              y2="118"
              stroke={RULE}
              strokeWidth="1.5"
            />
            {on ? (
              <rect
                x={x - 22}
                y={112 - 24 - mo.h}
                width="44"
                height={24 + mo.h}
                rx="3"
                fill={i === 1 ? GREEN : WASH}
                stroke={i === 1 ? GREEN : GREEN}
                strokeWidth="1.5"
              />
            ) : null}
            <text
              x={x}
              y="136"
              textAnchor="middle"
              fill={MUTED}
              fontSize="12"
              fontFamily="var(--font-mono)"
            >
              {mo.m === "now" ? "today" : `${mo.m} mo`}
            </text>
          </g>
        );
      })}
      <text
        x="210"
        y="24"
        textAnchor="middle"
        fill={INK}
        fontSize="13"
        fontFamily="var(--font-mono)"
        fontWeight="600"
      >
        flagged while it can still go back
      </text>
    </svg>
  );
}

/**
 * SHORTBOOK — the reorder list builds itself.
 *
 * Counter moment on the left, purchase order on the right. The point is that
 * nobody sat down to write the list.
 */
export function FigShortbook({ className }: FigProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 480 200"
      role="img"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <A11y
        title="The reorder list is built at the counter, one tap at a time"
        desc="When a medicine runs short or a customer asks for something you do not stock, one tap at the counter adds it to the reorder list, which becomes a purchase order for the distributor."
      />

      {/* The tap. */}
      <g transform="translate(20 48)">
        <rect
          width="120"
          height="60"
          rx="3"
          fill="#fff"
          stroke={RULE}
          strokeWidth="1.5"
        />
        <rect x="14" y="18" width="58" height="6" rx="3" fill={HAIR} />
        <rect x="14" y="34" width="38" height="5" rx="2" fill={HAIR} />
        <circle cx="98" cy="30" r="13" fill={GREEN} />
        <path
          d="M98 24 L98 36 M92 30 L104 30"
          stroke="#fff"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </g>
      <Caption x={80} y={132}>
        at the counter
      </Caption>

      <Flow x={152} y={78} w={38} />

      {/* The list accumulating. */}
      <g transform="translate(202 36)">
        <rect
          width="104"
          height="84"
          rx="3"
          fill="#fff"
          stroke={RULE}
          strokeWidth="1.5"
        />
        {[20, 38, 56, 74].map((ly, i) => (
          <rect
            key={ly}
            x="14"
            y={ly - 4}
            width={i === 3 ? 40 : 62}
            height="5"
            rx="2"
            fill={i === 3 ? GREEN : HAIR}
          />
        ))}
      </g>
      <Caption x={254} y={140} strong>
        shortbook
      </Caption>

      <Flow x={318} y={78} w={38} />

      {/* The order out. */}
      <g transform="translate(368 44)">
        <rect
          width="80"
          height="68"
          rx="3"
          fill={WASH}
          stroke={GREEN}
          strokeWidth="1.5"
        />
        <text
          x="40"
          y="30"
          textAnchor="middle"
          fill={GREEN_DEEP}
          fontSize="11"
          fontFamily="var(--font-mono)"
          fontWeight="600"
        >
          ORDER
        </text>
        <path
          d="M25 44 L36 55 L57 34"
          stroke={GREEN_DEEP}
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </g>
      {/* Two short words rather than "to the distributor" — at 12px mono that
          string is wider than the column it sits under and was being clipped. */}
      <Caption x={408} y={132}>
        to the supplier
      </Caption>
    </svg>
  );
}

/**
 * ONE STOCK FIGURE — counter PC, phone and browser.
 *
 * The competitive point is not "we have an app"; it is that the three of them
 * cannot disagree. Three devices converging on one number says that.
 */
export function FigOneStock({ className }: FigProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 440 210"
      role="img"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <A11y
        title="Counter PC, phone and browser all read one stock figure"
        desc="The desktop app at the counter, the phone in your pocket and any browser all read and write the same stock, so the shop and the owner never see different numbers."
      />

      {/* Counter PC */}
      <g transform="translate(22 16)">
        <rect width="96" height="60" rx="3" fill="#fff" stroke={RULE} strokeWidth="1.5" />
        <rect x="40" y="60" width="16" height="10" fill={HAIR} />
        <rect x="28" y="70" width="40" height="4" rx="2" fill={RULE} />
      </g>
      <Caption x={70} y={98}>
        counter PC
      </Caption>

      {/* Phone */}
      <g transform="translate(197 10)">
        <rect width="46" height="78" rx="7" fill="#fff" stroke={RULE} strokeWidth="1.5" />
        <rect x="16" y="5" width="14" height="3" rx="1.5" fill={HAIR} />
      </g>
      <Caption x={220} y={104}>
        phone
      </Caption>

      {/* Browser */}
      <g transform="translate(322 16)">
        <rect width="96" height="60" rx="3" fill="#fff" stroke={RULE} strokeWidth="1.5" />
        <line x1="0" y1="14" x2="96" y2="14" stroke={HAIR} strokeWidth="1.5" />
        <circle cx="9" cy="7" r="2.5" fill={HAIR} />
        <circle cx="18" cy="7" r="2.5" fill={HAIR} />
      </g>
      <Caption x={370} y={98}>
        any browser
      </Caption>

      {/* Converging on one figure, clear of every caption. */}
      <path d="M70 112 L70 132 L206 132" stroke={RULE} strokeWidth="1.5" fill="none" />
      <path d="M220 118 L220 132" stroke={RULE} strokeWidth="1.5" fill="none" />
      <path d="M370 112 L370 132 L234 132" stroke={RULE} strokeWidth="1.5" fill="none" />

      <rect
        x="152"
        y="150"
        width="136"
        height="38"
        rx="3"
        fill={WASH}
        stroke={GREEN}
        strokeWidth="1.5"
      />
      <text
        x="220"
        y="174"
        textAnchor="middle"
        fill={GREEN_DEEP}
        fontSize="13"
        fontFamily="var(--font-mono)"
        fontWeight="600"
      >
        one stock figure
      </text>
    </svg>
  );
}
