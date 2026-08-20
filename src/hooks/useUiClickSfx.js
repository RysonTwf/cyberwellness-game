import { useEffect } from 'react';
import { playSfx } from '../lib/sfx';

/**
 * Plays a click sound for every button press, app-wide — one listener at
 * the document root rather than wiring a sound into each onClick. Every
 * interactive element in this app (MainScreen's Start, AtlasMap's realm
 * pins, ChoiceCard's picks, the diary's Next/Back, World's floating
 * interact button, panel-close buttons, mini-game controls, ...) already
 * renders as a real <button>, so this one hook covers all of them —
 * including future ones, as long as they stay real buttons.
 */
export function useUiClickSfx() {
  useEffect(() => {
    const onClick = (e) => {
      const btn = e.target.closest('button');
      if (!btn || btn.disabled) return;
      playSfx('click');
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);
}
