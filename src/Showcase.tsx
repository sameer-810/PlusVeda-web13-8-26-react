import { useState } from "react";

/**
 * The tabbed product showcase.
 *
 * The reference site plays two silent looping MP4s of its own software here,
 * fronted by a row of pill-shaped labels. This is the same section built from
 * stills instead of video, which is a straight upgrade for the job it has to
 * do: a chemist can stop on the screen he cares about and actually read the
 * numbers, it costs a few hundred KB rather than several MB on a phone
 * connection, and there is no autoplay to fight with iOS.
 *
 * The images are real screenshots of the running product against the demo
 * pharmacy's real data — see tools/shootLanding.mjs in the app repo, which
 * refuses to publish a shot of an empty or unsellable screen.
 */

export interface Panel {
  id: string;
  tag: string;
  label: string;
  src: string;
  alt: string;
  line: string;
}

export function Showcase({ panels }: { panels: Panel[] }) {
  const [active, setActive] = useState(panels[0]?.id);
  const current = panels.find((p) => p.id === active) ?? panels[0];

  return (
    <div className="showcase">
      {/*
        A real tablist, not a row of divs. Arrow-key movement between tabs is
        what a screen-reader user expects the moment this announces itself as
        tabs, so if we are not prepared to wire that up we should not claim the
        role. It is wired up.
      */}
      <div className="showcase-tabs" role="tablist" aria-label="What Plusveda looks like">
        {panels.map((p, i) => (
          <button
            key={p.id}
            role="tab"
            id={`tab-${p.id}`}
            aria-selected={p.id === current.id}
            aria-controls={`panel-${p.id}`}
            tabIndex={p.id === current.id ? 0 : -1}
            className={`showcase-tab${p.id === current.id ? " is-on" : ""}`}
            onClick={() => setActive(p.id)}
            onKeyDown={(e) => {
              if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
              e.preventDefault();
              const next =
                panels[(i + (e.key === "ArrowRight" ? 1 : -1) + panels.length) % panels.length];
              setActive(next.id);
              document.getElementById(`tab-${next.id}`)?.focus();
            }}
          >
            <span className="showcase-tag">{p.tag}</span>
            <span className="showcase-label">{p.label}</span>
          </button>
        ))}
      </div>

      <figure
        className="showcase-frame"
        role="tabpanel"
        id={`panel-${current.id}`}
        aria-labelledby={`tab-${current.id}`}
      >
        {/*
          Every panel is in the DOM and all but one is hidden, rather than
          swapping a single `src`. Mounting a fresh <img> on each tab press
          shows a white flash while the next screenshot decodes; this way every
          screen is decoded once and switching is instant.
        */}
        {panels.map((p) => (
          <img
            key={p.id}
            src={p.src}
            alt={p.alt}
            width={1440}
            height={900}
            hidden={p.id !== current.id}
            loading={p.id === panels[0].id ? "eager" : "lazy"}
            decoding="async"
          />
        ))}
        <figcaption>{current.line}</figcaption>
      </figure>
    </div>
  );
}
