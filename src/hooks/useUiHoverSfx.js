import { useEffect, useRef } from 'react';
import { playSfx } from '../lib/sfx';

/**
 * Plays a soft hover sound the first time the pointer lands on a button,
 * mirroring useUiClickSfx's document-level delegation. Mouse-only (checked
 * via pointerType) so touch taps — which fire a synthetic hover right
 * before their click — don't double up the sound.
 */
export function useUiHoverSfx() {
  const lastRef = useRef(null);

  useEffect(() => {
    const onOver = (e) => {
      if (e.pointerType && e.pointerType !== 'mouse') return;
      const btn = e.target.closest('button');
      if (!btn || btn.disabled || btn === lastRef.current) return;
      lastRef.current = btn;
      playSfx('hover');
    };
    const onOut = (e) => {
      const btn = e.target.closest('button');
      if (btn && btn === lastRef.current) lastRef.current = null;
    };
    document.addEventListener('pointerover', onOver);
    document.addEventListener('pointerout', onOut);
    return () => {
      document.removeEventListener('pointerover', onOver);
      document.removeEventListener('pointerout', onOut);
    };
  }, []);
}
