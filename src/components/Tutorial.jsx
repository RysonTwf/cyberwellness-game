import { useEffect, useLayoutEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { lockInput, unlockInput } from '../lib/inputLock';

/**
 * Step-by-step coach marks: the whole screen dims (dark but see-through, so
 * the game stays visible underneath), and each step spotlights one element —
 * a cutout in the dim with an accent ring — with a small card of guidance
 * beside it. A step without a `target` (or whose selector matches nothing)
 * falls back to a centred card over a full dim.
 *
 *   steps: [{ target?: '.css-selector', title?, text }]
 *
 * Input is locked while it runs (lib/inputLock.js) so the Traveler can't be
 * walked around underneath, and the overlay itself swallows stray clicks —
 * moving through the tour is the only thing to do. Enter/Space/→ advance,
 * ← goes back, Esc skips; the card's buttons do the same by touch.
 */
const PAD = 8; // breathing room between the target and the ring

export default function Tutorial({ steps, onDone, accent = 'var(--gold)' }) {
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState(null);
  const step = steps[index];

  useEffect(() => {
    lockInput();
    return () => unlockInput();
  }, []);

  useLayoutEffect(() => {
    const measure = () => {
      const el = step?.target ? document.querySelector(step.target) : null;
      if (!el) {
        setRect(null);
        return;
      }
      const r = el.getBoundingClientRect();
      setRect({
        left: r.left - PAD,
        top: r.top - PAD,
        width: r.width + PAD * 2,
        height: r.height + PAD * 2,
      });
    };
    measure();
    window.addEventListener('resize', measure);
    // Spotlit things can drift (a pin bobbing, a layout settling) — re-measure
    // on a slow tick so the ring stays honest without chasing every frame.
    const tick = setInterval(measure, 400);
    return () => {
      window.removeEventListener('resize', measure);
      clearInterval(tick);
    };
  }, [index, step?.target]);

  const done = () => onDone?.();
  const next = () => (index < steps.length - 1 ? setIndex((i) => i + 1) : done());
  const back = () => setIndex((i) => Math.max(0, i - 1));

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight') {
        e.preventDefault();
        next();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        back();
      } else if (e.key === 'Escape') {
        done();
      }
    };
    window.addEventListener('keydown', onKey, { passive: false });
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- next/back/done
    // close over index via setState; re-binding per step keeps them current.
  }, [index, steps.length]);

  // The card sits under the spotlight when there's room, above it otherwise,
  // clamped to the viewport either way; with no target it just centres.
  const CARD_W = 340;
  const cardStyle = rect
    ? (() => {
        const spaceBelow = window.innerHeight - (rect.top + rect.height);
        const vertical =
          spaceBelow >= 210
            ? { top: rect.top + rect.height + 14 }
            : rect.top >= 210
              ? { bottom: window.innerHeight - rect.top + 14 }
              : // A target so big neither side has room (e.g. the whole scene
                // box) — float the card just inside its lower edge instead.
                { bottom: Math.max(12, spaceBelow + 20) };
        return {
          left: Math.max(
            12,
            Math.min(rect.left + rect.width / 2 - CARD_W / 2, window.innerWidth - CARD_W - 12),
          ),
          ...vertical,
        };
      })()
    : // Centred by pixel math, not a transform — the card's `settle` entry
      // animation fills its own transform and would override an inline one.
      {
        left: Math.max(12, (window.innerWidth - CARD_W) / 2),
        top: Math.max(12, window.innerHeight / 2 - 140),
      };

  return createPortal(
    <div className="tutorial-scrim" role="dialog" aria-modal="true" style={{ '--accent': accent }}>
      {rect ? <div className="tutorial-spot" style={rect} /> : <div className="tutorial-dim" />}

      <div className="tutorial-card" style={cardStyle}>
        {step.title && <h3>{step.title}</h3>}
        <p>{step.text}</p>
        <div className="tutorial-nav">
          <span className="tutorial-dots" aria-label={`Step ${index + 1} of ${steps.length}`}>
            {steps.map((_, i) => (
              <span key={i} className={`dot${i === index ? ' filled' : ''}`} />
            ))}
          </span>
          <button type="button" className="btn btn-ghost btn-sm" onClick={done}>
            Skip
          </button>
          {index > 0 && (
            <button type="button" className="btn btn-ghost btn-sm" onClick={back} aria-label="Back">
              <ArrowLeft size={16} />
            </button>
          )}
          <button type="button" className="btn btn-accent btn-sm" onClick={next}>
            {index < steps.length - 1 ? 'Next' : 'Got it!'}
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
