/**
 * The section divider.
 *
 * The reference site the owner sent separates its coloured hero from the white
 * body with a layered SVG wave rather than a straight edge, and that curve is
 * most of why their page reads as designed rather than assembled. It was the
 * one thing he screenshotted, so it is worth getting right rather than
 * approximating with a single arc.
 *
 * Three stacked paths at different opacities, not one. A single curve reads as
 * a shape stuck on the bottom of the section; overlapping translucent ones read
 * as depth, which is the whole effect. Theirs uses four; three is enough at the
 * heights this page uses and costs less to paint.
 *
 * `flip` turns it upside down for a divider that rises INTO a coloured band
 * rather than falling out of one.
 */

interface Props {
  /**
   * The colour of the ADJOINING section, not of the band the wave lives in.
   * The wave is rendered inside the coloured band and paints the neighbouring
   * background spilling across the join, so filling it with the host band's
   * own colour renders it invisible.
   */
  fill?: string;
  /** Rendered height. The viewBox is fixed, so the curve just scales. */
  height?: number;
  /** Point the wave upwards, for entering a coloured band. */
  flip?: boolean;
  className?: string;
}

export function Wave({
  fill = "var(--surface)",
  height = 110,
  flip = false,
  className,
}: Props) {
  return (
    <div
      className={`wave${flip ? " wave-flip" : ""}${className ? ` ${className}` : ""}`}
      style={{ height }}
      /* Decoration. It carries no information, so it is hidden from screen
         readers rather than announced as an unlabelled graphic. */
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Four layers at 1 / 0.2 / 0.3 / 1, matching the reference. The two
            faint middle passes are what stop it reading as one cut-out shape
            stuck on the edge of the section — remove them and it flattens. */}
        <path
          fill={fill}
          d="M0,160C120,200,240,240,480,240C720,240,960,200,1200,180C1320,170,1380,165,1440,160L1440,320L0,320Z"
        />
        <path
          fill={fill}
          fillOpacity="0.2"
          d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,165.3C1248,171,1344,149,1392,138.7L1440,128L1440,320L0,320Z"
        />
        <path
          fill={fill}
          fillOpacity="0.3"
          d="M0,192L48,197.3C96,203,192,213,288,192C384,171,480,117,576,101.3C672,85,768,107,864,128C960,149,1056,171,1152,176C1248,181,1344,171,1392,165.3L1440,160L1440,320L0,320Z"
        />
        <path
          fill={fill}
          d="M0,256L48,240C96,224,192,192,288,181.3C384,171,480,181,576,192C672,203,768,213,864,208C960,203,1056,181,1152,181.3C1248,181,1344,203,1392,213.3L1440,224L1440,320L0,320Z"
        />
      </svg>
    </div>
  );
}
