/**
 * The Greendale Primary School crest.
 *
 * `full`  — the whole logo (emblem + wordmark). Used on the title screen,
 *           paired with Comet.
 * `mark`  — just the emblem, cropped out of the same square image (the
 *           wordmark is illegible at corner size). Used as a small
 *           top-left watermark on every screen after the title.
 *
 * One flat .jpg in /public so it needs no bundler handling; the crop is
 * pure CSS (an oversized <img> inside an overflow-hidden window), so there's
 * only ever the one asset to swap if the school's branding changes.
 */
const SRC = '/assets/greendale-logo.jpg';

export default function SchoolLogo({ variant = 'full', className = '' }) {
  if (variant === 'mark') {
    return (
      <span className={`school-mark ${className}`.trim()} aria-label="Greendale Primary School">
        <img src={SRC} alt="" draggable={false} />
      </span>
    );
  }

  return (
    <img
      className={`school-logo ${className}`.trim()}
      src={SRC}
      alt="Greendale Primary School"
      draggable={false}
    />
  );
}
