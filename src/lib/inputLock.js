/**
 * A tiny shared "is a modal open" counter. World movement (useWalker) and
 * the Space/Enter interact shortcut (world/World.jsx) both listen on
 * `window`, unscoped by focus — so without this, holding an arrow key while
 * a floating overlay like the settings menu sits on top would still walk
 * the Traveler around underneath it. Anything that opens such an overlay
 * should call lockInput() while it's open and unlockInput() when it closes.
 *
 * A counter, not a boolean, so two overlays opening in sequence (unlikely
 * today, cheap to guard against) can't have the first one's close unlock
 * input out from under the second.
 */
let count = 0;

export function lockInput() {
  count += 1;
}

export function unlockInput() {
  count = Math.max(0, count - 1);
}

export function isInputLocked() {
  return count > 0;
}
