/**
 * Dev-only scene contact sheet — open the app at `#art`.
 *
 * Every realm is drawn twice ('before' and 'after') with the walkable strip
 * from realms.js overlaid on top, because the single most common art bug in
 * this game is scenery that doesn't line up with the ground the Traveler can
 * actually stand on. Seeing all eight states at once makes that obvious.
 *
 * Not reachable from the game itself and not linked anywhere; it costs a few
 * kB in the bundle and saves walking to every corner of four realms by hand.
 */
import RealmArt from '../components/RealmArt';
import { REALMS } from '../data/realms';

const MOODS = ['before', 'after'];

function Scene({ realm, mood }) {
  const { bounds, spawn, stops } = realm.world;

  return (
    <figure className="ap-cell">
      <figcaption>
        {realm.name} · <em>{mood}</em>
      </figcaption>

      <div className="ap-frame">
        <RealmArt realmId={realm.id} mood={mood} />

        {/* the band the Traveler can occupy */}
        <div
          className="ap-band"
          style={{
            left: `${bounds.minX}%`,
            top: `${bounds.minY}%`,
            width: `${bounds.maxX - bounds.minX}%`,
            height: `${bounds.maxY - bounds.minY}%`,
          }}
        />

        {/* every stop, at the exact spot the pin renders */}
        {Object.entries(stops).map(([step, s]) => (
          <div key={step} className="ap-stop" style={{ left: `${s.x}%`, top: `${s.y}%` }}>
            <span>{step}</span>
          </div>
        ))}

        <div className="ap-spawn" style={{ left: `${spawn.x}%`, top: `${spawn.y}%` }}>
          <span>spawn</span>
        </div>
      </div>
    </figure>
  );
}

export default function ArtPreview() {
  return (
    <div className="ap">
      <h1>Scene contact sheet</h1>
      <p>
        The tinted box is the walkable band (<code>world.bounds</code>); dots are
        hotspots. Anything the Traveler stands on must be drawn as solid ground
        across the whole box, and nothing solid should float above it.
      </p>

      <div className="ap-grid">
        {REALMS.map((realm) =>
          MOODS.map((mood) => <Scene key={`${realm.id}-${mood}`} realm={realm} mood={mood} />),
        )}
      </div>
    </div>
  );
}
