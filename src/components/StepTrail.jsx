/**
 * A small "where am I" breadcrumb for a realm: Story, Choice, Game, Rule.
 * Every realm runs the same shape, so showing it plainly helps a player know
 * how far along they are and how much is left.
 *
 * `steps`   — short labels, in order (4 for the shared flow; 3 for Passworld
 *             P4-6, where the choice and the game are one continuous level).
 * `current` — index of the step being shown right now.
 */
export default function StepTrail({ steps, current }) {
  return (
    <div className="step-trail" role="group" aria-label={`Step ${current + 1} of ${steps.length}`}>
      {steps.map((label, i) => (
        <span
          key={label}
          className={`step-pip${i === current ? ' on' : ''}${i < current ? ' done' : ''}`}
          aria-current={i === current ? 'step' : undefined}
        >
          {label}
        </span>
      ))}
    </div>
  );
}
