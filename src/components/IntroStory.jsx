import { useState } from 'react';
import { ArrowRight, SkipForward } from 'lucide-react';
import { Comet } from './Characters';
import { applyScreenOverrides } from '../dev/contentOverrides';

/**
 * The opening story, shown once when a fresh player taps Start (title →
 * intro → character → room → atlas). It carries the lore that used to be
 * split between the old title card and the diary: the journal on the shelf,
 * the map drawing itself, Comet unfolding out of the last page, and what a
 * Traveler is actually here to do. It ends by handing the player to
 * character select ("who's walking the Atlas with me?"), and the diary in
 * the Traveler's Room then picks up with the practical part — the name and
 * the grade band — instead of re-introducing Comet.
 *
 * storyline.md "Prologue: The Atlas Gate".
 *
 * Exported so the dev-only Copy Editor (src/dev/CopyEditor.jsx) can list and
 * edit these lines; `applyScreenOverrides` merges any live edits at render.
 */
export const INTRO_BEATS = [
  {
    kind: 'scene',
    text: "On the shelf, behind everything else, there's a journal you don't remember owning. ",
  },
  {
    kind: 'scene',
    text: 'You open it. Ink races across the pages on its own, drawing coasts and islands and a whole map. Then something folds itself up out of the last page.',
  },
  {
    kind: 'comet',
    text: 'Oh, hello! You actually opened it. Most people dust this off and put it straight back.',
  },
  {
    kind: 'comet',
    text: "I'm Comet. I carry messages across the Atlas. It's a map of every path the Internet takes. Five islands, five realms.",
  },
  {
    kind: 'comet',
    text: "Each realm teaches a traveller something about getting around out here, safely and kindly. Visit one and it stamps your passport. That's this journal you're holding.",
  },
  {
    kind: 'comet',
    text: "Collect all five stamps and you're a Wise Traveller.",
  },
  {
    kind: 'comet',
    text: "Let's get you ready first. Who's walking the Atlas with me?",
    cta: 'Choose my traveller',
  },
];

/** A small glowing journal, for the scene-setting beats before Comet appears. */
function Journal() {
  return (
    <svg className="intro-journal" viewBox="0 0 96 96" width="112" height="112" aria-hidden="true">
      <ellipse cx="48" cy="86" rx="30" ry="5" fill="var(--ink)" opacity="0.12" />
      <g className="intro-journal-glow">
        <rect x="24" y="16" width="46" height="62" rx="5" fill="var(--gold)" opacity="0.18" />
      </g>
      <rect x="22" y="14" width="46" height="62" rx="5" fill="var(--paper-card)" stroke="var(--ink)" strokeWidth="2.5" />
      <path d="M22 14 v62" stroke="var(--ink)" strokeWidth="2.5" />
      <path d="M45 14 v62" stroke="var(--line)" strokeWidth="2" />
      {/* brass clasp */}
      <rect x="64" y="38" width="10" height="14" rx="3" fill="var(--gold)" />
      {/* a hint of the map drawing itself */}
      <path
        d="M28 30 q8 -4 14 2 q6 6 14 1"
        fill="none"
        stroke="var(--teal)"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.6"
      />
      <circle cx="34" cy="48" r="2.4" fill="var(--coral)" opacity="0.7" />
      <circle cx="52" cy="58" r="2.4" fill="var(--periwinkle)" opacity="0.7" />
    </svg>
  );
}

export default function IntroStory({ onDone }) {
  const [i, setI] = useState(0);
  const BEATS = applyScreenOverrides(INTRO_BEATS, 'intro');
  const beat = BEATS[i];
  const last = i === BEATS.length - 1;

  const next = () => (last ? onDone() : setI((n) => n + 1));

  return (
    <div className="fold intro-story">
      <button type="button" className="btn btn-ghost btn-sm intro-skip" onClick={onDone}>
        <SkipForward size={15} />
        Skip
      </button>

      <div className="intro-stage">
        <div key={i} className="intro-beat">
          {beat.kind === 'comet' ? <Comet size={84} /> : <Journal />}
          <p className={`intro-line intro-line-${beat.kind}`}>
            {beat.kind === 'comet' && <span className="intro-who">Comet</span>}
            {beat.text}
          </p>
        </div>

        <div className="intro-dots" aria-hidden="true">
          {BEATS.map((_, n) => (
            <span key={n} className={`intro-dot${n === i ? ' on' : ''}${n < i ? ' seen' : ''}`} />
          ))}
        </div>

        <button type="button" className="btn btn-accent" onClick={next}>
          {beat.cta ?? (last ? 'Begin' : 'Next')}
          <ArrowRight size={19} />
        </button>
      </div>
    </div>
  );
}
