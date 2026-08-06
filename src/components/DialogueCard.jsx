import CharacterArt from './Characters';

/** One character speaking. Tap-to-advance is handled by the parent (§5). */
export default function DialogueCard({ who, text, accent = 'var(--ink)' }) {
  return (
    <div className="dialogue fade-in">
      <div className="avatar">
        <CharacterArt who={who} accent={accent} size={44} />
      </div>
      <div>
        <div className="who">{who}</div>
        <p>{text}</p>
      </div>
    </div>
  );
}
