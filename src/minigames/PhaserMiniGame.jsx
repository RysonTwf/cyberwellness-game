import { useEffect, useRef, useState } from 'react';

/**
 * Phaser integration wrapper (Milestones Phase 0 → used by Phase 2's
 * Passworld platformer, now the full-level version in
 * `phaser-scenes/passwordFortressLevelScene.js`, and Privacy Peaks
 * stepping-stone mechanics).
 *
 * Phaser is scoped to exactly those two mechanics (Milestones "Tech stack
 * decisions") — every other mini-game stays plain React. This wrapper is
 * the seam: it dynamically `import()`s Phaser so the ~1MB library is only
 * fetched when a player actually reaches a realm that needs it (lazy-load,
 * not bundled into the main chunk), mounts a `Phaser.Game` into a plain div,
 * and destroys it again on unmount so leaving the realm doesn't leak a
 * running WebGL/Canvas context.
 *
 * Usage: pass either a plain Phaser game config object, or a *factory*
 * `(Phaser) => config` — the factory form is how every scene in this game
 * is actually written, since a Scene class has to `extends Phaser.Scene`,
 * and `Phaser` itself only exists after the dynamic import resolves. Either
 * way the config is shaped like a normal Phaser game config *minus*
 * `type`/`parent`/`width`/`height` (this wrapper fills those in — `parent`
 * from its own ref, `width`/`height` from the realm art's 560×280 viewBox
 * so it matches the rest of the game's scene box).
 *
 *   <PhaserMiniGame
 *     config={(Phaser) => makePasswordFortressLevelConfig(Phaser, { game, onWin })}
 *     onReady={(game) => {...}}   // optional: fires once with the Phaser.Game instance
 *   >
 *     {overlay}                     // optional: anything pinned over the canvas,
 *   </PhaserMiniGame>               // e.g. the on-screen controls for touch screens
 */
export default function PhaserMiniGame({ config, onReady, children }) {
  const hostRef = useRef(null);
  const gameRef = useRef(null);
  const [loadError, setLoadError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    import('phaser')
      .then((mod) => {
        if (cancelled || !hostRef.current) return;
        const Phaser = mod.default ?? mod;
        const resolvedConfig = typeof config === 'function' ? config(Phaser) : config;
        const w = resolvedConfig.width ?? 560;
        const h = resolvedConfig.height ?? 280;
        // Match the host box to the scene's own aspect ratio (the shared
        // `.phaser-host` rule assumes 2:1; a scene that returns its own
        // width/height — e.g. the wide-and-short stepping-stone ravine —
        // would otherwise be stretched by the `canvas { height: 100% }` rule).
        hostRef.current.style.setProperty('--scene-ar', String(w / h));
        gameRef.current = new Phaser.Game({
          type: Phaser.AUTO,
          parent: hostRef.current,
          width: 560,
          height: 280,
          transparent: true,
          ...resolvedConfig,
        });
        setLoading(false);
        onReady?.(gameRef.current);
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err);
      });

    return () => {
      cancelled = true;
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
    // config/onReady are expected to be stable for the component's lifetime —
    // a mini-game shouldn't be reconfigured in place, it should remount
    // (give the parent a `key` if it needs a fresh instance).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loadError) {
    return (
      <p className="muted" role="alert">
        This mini-game couldn&rsquo;t load. Try again in a moment?
      </p>
    );
  }

  return (
    <div ref={hostRef} className="phaser-host">
      {loading && (
        <p className="muted" style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
          Loading…
        </p>
      )}
      {!loading && children}
    </div>
  );
}
