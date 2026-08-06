/**
 * One tappable decision card (design.md §5).
 *
 * Picking the unsafe option is never a dead end and never scored — it shows a
 * warm redirect and the child picks again. So there is no "wrong" styling
 * here, only "settled" (teal) and "let's rethink" (gold).
 */
export default function ChoiceCard({ option, state = 'idle', onPick, disabled }) {
  const cls =
    state === 'safe'
      ? 'choice picked-safe'
      : state === 'rethink'
        ? 'choice picked-rethink'
        : state === 'faded'
          ? 'choice faded'
          : 'choice';

  return (
    <button type="button" className={cls} onClick={onPick} disabled={disabled}>
      <span className="tag">{option.tag}</span>
      <span>{option.text}</span>
    </button>
  );
}
