/**
 * Reduced-motion support for Phaser's tween engine (Milestones Phase 4).
 *
 * styles.css already has a blanket `@media (prefers-reduced-motion: reduce)`
 * rule that collapses every *CSS* animation/transition automatically (the
 * walk-bob, leg, and scarf keyframes on world/Traveler.jsx's neutral figure,
 * among others). Phaser's tweens (minigames/phaser-scenes/*.js) run on
 * canvas, entirely outside CSS, so that rule has no effect on them — they
 * need to check the same preference directly instead.
 */

/**
 * Checked live rather than cached: the preference can change mid-session
 * (an OS setting, or — as prompted this file — a DevTools override) without
 * a reload, and this is cheap enough to call per-tween.
 */
export function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true
  );
}

/**
 * Shrinks a *decorative* one-shot Phaser tween's duration under reduced
 * motion, leaving everything else untouched — target values, `delay` (a
 * pause isn't motion), `onUpdate`, `onComplete`. Anything gated on "the
 * tween finished" — a gate unlocking, a win firing — keeps working exactly
 * the same, just without the travel in between.
 *
 * Not for infinite/looping decorative tweens (a hover bob, a patrol beat) —
 * those have nothing useful left once they're merely very fast, so skip
 * them outright behind `prefersReducedMotion()` at the call site instead of
 * forcing them through this. And not for tweens that are the gameplay
 * itself (a patrolling hazard the player has to time around) — reduced
 * motion trims unnecessary movement, not the game.
 */
export function motionTween(config) {
  if (!prefersReducedMotion()) return config;
  return { ...config, duration: Math.min(config.duration ?? 0, 1) };
}
