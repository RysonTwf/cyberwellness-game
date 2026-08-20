import { useMemo, useState } from 'react';
import { ArrowRight, Check, Lightbulb, RefreshCw, Send, Waves, XCircle } from 'lucide-react';
import DialogueCard from './DialogueCard';
import ChoiceCard from './ChoiceCard';
import ReportBlock from './ReportBlock';
import StampMoment from './StampMoment';
import RealmArt from './RealmArt';
import {
  TOOLS,
  TOOL_BY_ID,
  answerDecision,
  ask,
  commit,
  createBoard,
} from '../minigames/fallsBoard';

/**
 * Fable Falls P4–P6, run as three chapters of one board instead of the shared
 * story → decision → mini-game → rule step machine (RealmScreen.jsx). Opted
 * into with `realm.fullMechanic === 'fallsBoard'`.
 *
 * The realm's problem was not length — it was that its Compare board **handed
 * over the verified original for free**, in the left-hand column. Going and
 * getting the original is Research, one of the four letters S.U.R.E. is made
 * of, and the puzzle pre-completed it; what was left was a text diff, with the
 * four steps printed on the debrief as labels. See minigames/fallsBoard.js,
 * which is where all the rules and all the arithmetic live.
 *
 * So the right-hand column now starts empty and you fill it in by spending
 * questions, while the water keeps moving:
 *
 *   Chapter 1  Who's Actually Talking — Source and Understand, and the
 *              discovery that a right answer you guessed is worth a third of
 *              a right answer you found out.
 *   Chapter 2  It Looks Right — Research, and claims whose account really is
 *              who it says and whose words really do say what they say. The
 *              realm's decision fires here, mid-board, with the clip about a
 *              classmate still sitting in front of you.
 *   Chapter 3  Too Perfect — Evaluate, and one alarming claim that is simply
 *              true, so that "it shocked me" cannot quietly become the test.
 *
 * **This realm is the one that isn't an arcade game, and that's deliberate.**
 * The other four rebuilds are Phaser scenes because their lessons are about
 * doing something under pressure. This one's subject is *claims* — text you
 * read and check — so the mechanic is text you read and check, in real DOM,
 * reachable by tab and readable by a screen reader. Nothing here is drawn on
 * a canvas, nothing depends on a frame loop, and the pressure is a clock made
 * of your own actions rather than of seconds. That last part is why the
 * balance for this realm could be measured by running the game (see
 * `scripts/simulate-falls.mjs`) rather than by hand-stepping a hidden tab.
 *
 * **Deliberate design constraint, same as the Peaks:** nothing tells the
 * player which claim is which until the debrief. A finding is a fact, never a
 * verdict; the board never says "that settles it", because saying so would
 * hand back exactly the free answer this rebuild took away.
 */
export default function FallsStoryRealm({
  realm,
  progress,
  travelerName,
  Icon,
  onSettle,
  onStamp,
  onBackToAtlas,
}) {
  const chapters = useMemo(() => realm.game.levels ?? [realm.game], [realm.game]);

  const [step, setStep] = useState('story'); // story | chapter | round | debrief | rule | stamp
  const [index, setIndex] = useState(0);
  const [beat, setBeat] = useState(0);
  const [board, setBoard] = useState(null);
  const [pick, setPick] = useState(null);
  const [cleared, setCleared] = useState([]); // clarity reached per chapter
  const [beatAcked, setBeatAcked] = useState(false);
  const [beatPick, setBeatPick] = useState(null);

  const accentVars = { '--accent': realm.accent, '--accent-wash': realm.accentWash };
  const level = chapters[index];
  const target = level.target ?? 82;
  const isLast = index >= chapters.length - 1;
  const picked = pick ? realm.decision.options.find((o) => o.id === pick) : null;

  const clarity = board ? board.clarity : (level.startClarity ?? 30);
  const passed = board?.over && board.clarity >= target;

  // The post-decision beats live on the chapter whose lesson they belong to.
  // Their *shape* is read off the data rather than hard-coded by key — a beat
  // with `options` is a question, anything else is an acknowledgement — which
  // is BayStoryRealm's trick, and it means a new beat can be added in
  // realms.js without touching this file.
  const extra = passed && level.beat ? realm.extraBeats?.[level.beat] : null;
  const extraIsQuestion = Boolean(extra?.options);
  const beatDone = !extra || (extraIsQuestion ? Boolean(beatPick) : beatAcked);

  function startChapter(i) {
    setIndex(i);
    setPick(null);
    setBeatAcked(false);
    setBeatPick(null);
    setBoard(createBoard(chapters[i]));
    setStep('round');
  }

  function goToChapter(i) {
    setIndex(i);
    setPick(null);
    setBeatAcked(false);
    setBeatPick(null);
    setBoard(null);
    setStep('chapter');
  }

  const replay = () => startChapter(index);

  /** Every action runs through here so the round can end in one place. */
  function act(next) {
    setBoard(next);
    if (next.over) setStep('debrief');
  }

  function choose(optionId) {
    setPick(optionId);
    const option = realm.decision.options.find((o) => o.id === optionId);
    if (option.safe) {
      onSettle(realm.id, optionId);
      setBoard((b) => answerDecision(b, true));
    } else {
      // The water closes over it where you said it, and the question comes
      // straight back — never a dead end, and never a way through (§5).
      setBoard((b) => answerDecision(b, false, level.decisionCost ?? 10));
    }
  }

  /* --------------------------------------------------------------- render -- */

  if (step === 'stamp') {
    return (
      <div className="fold" style={accentVars}>
        <div className="accent-bar" />
        <StampMoment
          realm={realm}
          angle={progress.stampAngle}
          travelerName={travelerName}
          onBackToAtlas={onBackToAtlas}
        />
      </div>
    );
  }

  const meter = (
    <div
      className="bog-meter"
      role="img"
      aria-label={`The water is ${clarity} percent clear, and you need ${target}`}
    >
      <span className="bog-meter-label">How clear the water is</span>
      <div className="bog-meter-track">
        <div
          className="bog-meter-fill"
          style={{ width: `${clarity}%`, background: clarity >= target ? 'var(--teal)' : undefined }}
        />
        <span className="bog-meter-goal" style={{ left: `${target}%` }} />
      </div>
      <span className="bog-meter-read">
        {clarity} / {target} clear
      </span>
    </div>
  );

  return (
    <div className="fold" style={accentVars}>
      <div className="accent-bar" />

      <div className="realm-head">
        <span className="badge-ic">
          <Icon size={22} strokeWidth={2.2} />
        </span>
        <div>
          <h2>{realm.name}</h2>
          <span className="pin-label">
            {realm.topic}
            {(step === 'round' || step === 'debrief') && level.chapter ? ` · ${level.chapter}` : ''}
          </span>
        </div>
      </div>

      {/* ---------------------------------------------------------- story -- */}
      {step === 'story' && (
        <div className="stage">
          <div className="stage-main">
            <div className="world" style={{ cursor: 'default' }}>
              <RealmArt realmId={realm.id} mood="before" />
            </div>
          </div>
          <aside className="stage-side">
            {realm.story.slice(0, beat + 1).map((b, i) => (
              <DialogueCard key={i} who={b.who} text={b.text} accent={realm.accent} />
            ))}
            <div className="center">
              <button
                type="button"
                className="btn btn-accent"
                onClick={() => {
                  if (beat < realm.story.length - 1) setBeat((b) => b + 1);
                  else setStep('chapter');
                }}
              >
                {beat < realm.story.length - 1 ? 'Next' : 'Go down to the water'}
                <ArrowRight size={19} />
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* ------------------------------------------------- chapter opener -- */}
      {step === 'chapter' && (
        <div className="stage">
          <div className="stage-main">
            <div className="world" style={{ cursor: 'default' }}>
              <RealmArt realmId={realm.id} mood="before" />
            </div>
          </div>
          <aside className="stage-side">
            <div className="chapter-card">
              <span className="chapter-kicker">{level.chapter}</span>
              <h3>{level.name}</h3>
              <p>{level.intro}</p>
              {level.goal && (
                <p className="chapter-goal">
                  <Lightbulb size={16} /> {level.goal}
                </p>
              )}
            </div>
            <Questions tools={level.tools} />
            <div className="center">
              <button type="button" className="btn btn-accent" onClick={() => startChapter(index)}>
                Go to the water
                <ArrowRight size={19} />
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* ---------------------------------------------------------- round -- */}
      {step === 'round' && board && (
        <div className="stage">
          <div className="stage-main falls-main">
            <div className="falls-water" aria-hidden="true" />
            <ul className="falls-board">
              {board.board.map((slot) => (
                <ClaimCard
                  key={slot.id}
                  slot={slot}
                  claim={level.claims.find((c) => c.id === slot.id)}
                  tools={level.tools}
                  left={(level.drift ?? 8) - (board.t - slot.arrived)}
                  frozen={board.frozen}
                  onAsk={(tool) => act(ask(board, slot.id, tool))}
                  onCommit={(action) => act(commit(board, slot.id, action))}
                />
              ))}
            </ul>
            <p className="falls-queue">
              {board.queue.length > 0
                ? `${board.queue.length} more still coming down`
                : 'Nothing left upstream — finish what is in front of you'}
            </p>
          </div>

          <aside className="stage-side">
            {board.frozen ? (
              /* The Falls are stopped, and the clip is still sitting there. */
              <div className="stack">
                <h3>{realm.decision.prompt}</h3>
                <div className="choices">
                  {realm.decision.options.map((option) => (
                    <ChoiceCard
                      key={option.id}
                      option={option}
                      disabled={Boolean(picked)}
                      state={
                        !picked
                          ? 'idle'
                          : picked.id !== option.id
                            ? 'faded'
                            : option.safe
                              ? 'safe'
                              : 'rethink'
                      }
                      onPick={() => choose(option.id)}
                    />
                  ))}
                </div>
                {picked && !picked.safe && (
                  <>
                    <DialogueCard who={picked.who} text={picked.response} accent={realm.accent} />
                    <div className="row" style={{ justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
                      <button type="button" className="btn btn-ghost" onClick={() => setPick(null)}>
                        <RefreshCw size={17} />
                        Let me look again
                      </button>
                      {realm.reportBlockEligible !== false && <ReportBlock accent={realm.accent} />}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                <p className="instruction">{level.instruction}</p>
                {meter}
                <Questions tools={level.tools} compact />
                <p className="muted bog-controls">
                  Every question and every decision moves the water one step —{' '}
                  <strong>including the questions that come back useless.</strong> Whatever is still
                  in front of you when its last step runs out has gone downstream without you.
                </p>
                <div className="falls-live" aria-live="polite">
                  {board.lastNote && (
                    <p className={`falls-note ${board.lastNote.ok ? 'good' : 'weak'}`}>
                      {board.lastNote.note}{' '}
                      <em>
                        {board.lastNote.delta >= 0 ? '+' : ''}
                        {board.lastNote.delta}
                      </em>
                    </p>
                  )}
                </div>
                <div className="center">
                  <button type="button" className="btn btn-ghost btn-sm" onClick={replay}>
                    <RefreshCw size={16} />
                    Start this stretch again
                  </button>
                </div>
              </>
            )}
          </aside>
        </div>
      )}

      {/* -------------------------------------------------------- debrief -- */}
      {/* Only here does the game say what each claim actually was. Before the
          chapter ended, that would have been the answer sheet. */}
      {step === 'debrief' && board && (
        <div className="stage">
          <div className="stage-main">
            <div className="world" style={{ cursor: 'default' }}>
              <RealmArt realmId={realm.id} mood={passed ? 'after' : 'before'} />
            </div>
          </div>
          <aside className="stage-side">
            <div className="chapter-card">
              <span className="chapter-kicker">
                {level.chapter} · {passed ? 'the water cleared' : 'still churning'}
              </span>
              <h3>{level.name}</h3>
              <p>{passed ? level.pass : level.retry}</p>
            </div>

            {meter}

            <h4 className="debrief-head">Every claim, and what it really was</h4>
            <ul className="debrief-list falls-debrief">
              {board.done.map((e) => (
                <li key={e.id} className={e.ok ? 'good' : 'weak'}>
                  <span className="peak-from">{e.from}</span>
                  <code>{e.text}</code>
                  <span className="debrief-verdict">
                    {KIND_LABEL[e.kind]} · {ACTION_LABEL[e.action]}
                    {/* A harmless claim scores the same whether or not you
                        asked, so crediting a question here would be claiming
                        credit the arithmetic never gave. Say what actually
                        happened instead — it is the triage lesson, not a
                        consolation line. */}
                    {e.action !== 'drift' && e.kind === 'harmless' && (
                      <em className="peak-unchecked">
                        {e.asked.length > 0
                          ? ` · ${e.asked.length} question${e.asked.length > 1 ? 's' : ''} spent on something nothing rode on`
                          : ' · you spent nothing on it, which was right'}
                      </em>
                    )}
                    {e.action !== 'drift' && e.kind !== 'harmless' && (
                      <em className={e.cracked ? 'peak-checked' : 'peak-unchecked'}>
                        {e.cracked
                          ? ` · you had asked the right question`
                          : e.asked.length > 0
                            ? ` · you asked ${e.asked.map((t) => TOOL_BY_ID[t].name).join(' and ')}, which didn’t settle it`
                            : ' · you never asked anything'}
                      </em>
                    )}
                    <em className="falls-delta">
                      {' '}
                      {e.delta >= 0 ? '+' : ''}
                      {e.delta}
                    </em>
                  </span>
                  {e.why && <p>{e.why}</p>}
                </li>
              ))}
            </ul>

            {level.lesson && (
              <div className="note-card">
                <strong>What the water was showing you</strong>
                <p>{level.lesson}</p>
              </div>
            )}

            {extra && (
              <>
                <DialogueCard who={extra.who} text={extra.prompt} accent={realm.accent} />
                {extraIsQuestion ? (
                  beatPick ? (
                    <DialogueCard who={extra.who} text={extra.response} accent={realm.accent} />
                  ) : (
                    <div className="row" style={{ justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
                      {extra.options.map((o) => (
                        <button
                          key={o.id}
                          type="button"
                          className="btn btn-ghost btn-sm"
                          onClick={() => setBeatPick(o.id)}
                        >
                          {o.text}
                        </button>
                      ))}
                    </div>
                  )
                ) : beatAcked ? (
                  <DialogueCard who={extra.who} text={extra.followUp} accent={realm.accent} />
                ) : (
                  <div className="center">
                    <button type="button" className="btn btn-accent" onClick={() => setBeatAcked(true)}>
                      {extra.accept}
                    </button>
                  </div>
                )}
              </>
            )}

            <div className="center">
              {passed ? (
                <button
                  type="button"
                  className="btn btn-accent"
                  disabled={!beatDone}
                  onClick={() => {
                    setCleared((c) => [...c, board.clarity]);
                    if (isLast) setStep('rule');
                    else goToChapter(index + 1);
                  }}
                >
                  {isLast ? 'Climb up beside the Falls' : `Next: ${chapters[index + 1].name}`}
                  <ArrowRight size={19} />
                </button>
              ) : (
                <button type="button" className="btn btn-accent" onClick={replay}>
                  <RefreshCw size={18} />
                  Take that stretch again
                </button>
              )}
            </div>
          </aside>
        </div>
      )}

      {/* ----------------------------------------------------------- rule -- */}
      {step === 'rule' && (
        <div className="stage">
          <div className="stage-main">
            <div className="world" style={{ cursor: 'default' }}>
              <RealmArt realmId={realm.id} mood="after" />
            </div>
          </div>
          <aside className="stage-side">
            <DialogueCard who={realm.rule.who} text={realm.rule.text} accent={realm.accent} />
            <h4 className="debrief-head">What you carried up from the Falls</h4>
            <ul className="notes-list">
              {chapters.map((c, i) => (
                <li key={c.id} className="note-card">
                  <strong>{c.name}</strong>
                  <p>{c.lesson}</p>
                  {cleared[i] != null && (
                    <p className="muted" style={{ marginTop: 6 }}>
                      You cleared the water to {cleared[i]}%.
                    </p>
                  )}
                </li>
              ))}
            </ul>
            <div className="center">
              <button
                type="button"
                className="btn btn-accent"
                onClick={() => {
                  onStamp(realm.id, cleared.reduce((a, b) => a + b, 0));
                  setStep('stamp');
                }}
              >
                <Check size={19} />
                Stamp my passport
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

const KIND_LABEL = {
  false: 'Not true',
  matters: 'True, and it mattered',
  harmless: 'True, and harmless',
};

const ACTION_LABEL = {
  pass: 'you passed it on',
  drop: 'you let it go',
  drift: 'it went past you',
};

/**
 * One claim, on the board.
 *
 * The two columns are the realm's old Compare board, with the half that used
 * to be free now empty until you pay for it. Findings appear one at a time,
 * each labelled with the question that produced it, and **none of them is
 * marked as decisive** — several are perfectly true and settle nothing, which
 * is the entire difficulty.
 */
function ClaimCard({ slot, claim, tools, left, frozen, onAsk, onCommit }) {
  const urgent = left <= 2;
  return (
    <li className={`falls-claim${urgent ? ' urgent' : ''}${frozen ? ' frozen' : ''}`}>
      <div className="falls-claim-head">
        <span className="falls-from">{claim.from}</span>
        <span
          className={`falls-left${urgent ? ' urgent' : ''}`}
          title="How many more moves before this goes downstream without you"
        >
          <Waves size={14} aria-hidden="true" />
          {left} {left === 1 ? 'move' : 'moves'} left
        </span>
      </div>

      <div className="falls-cols">
        <div className="falls-col">
          <h5>What it says</h5>
          <blockquote>{claim.text}</blockquote>
        </div>
        <div className="falls-col">
          <h5>What you&rsquo;ve found out</h5>
          {slot.found.length === 0 ? (
            <p className="falls-empty">Nothing yet. You have to go and ask.</p>
          ) : (
            <ul className="falls-found">
              {slot.found.map((f) => (
                <li key={f.tool}>
                  <span className="falls-found-tag">{TOOL_BY_ID[f.tool].name}</span>
                  {f.text}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="falls-actions">
        <div className="falls-asks">
          {tools.map((id) => {
            const tool = TOOL_BY_ID[id];
            const spent = slot.found.some((f) => f.tool === id);
            return (
              <button
                key={id}
                type="button"
                className="btn btn-ghost btn-sm falls-ask"
                disabled={spent || frozen}
                title={tool.ask}
                onClick={() => onAsk(id)}
              >
                <span className="falls-letter" aria-hidden="true">
                  {tool.letter}
                </span>
                {tool.name}
              </button>
            );
          })}
        </div>
        {/* The two commits are deliberately given **equal** visual weight, and
            this realm is the one place in the game where that matters. Balance
            Bay makes "one more" loud and "I'm done" quiet on purpose, because
            there the asymmetry *is* the dark pattern being taught and the
            debrief names it. Here neither answer is the safe one — passing on
            a true, useful thing is right twice a chapter, and letting a true
            thing go is scored as a mistake — so a loud "Pass it on" would just
            be a thumb on a scale the game wants genuinely level. Icons
            distinguish them; nothing ranks them. */}
        <div className="falls-commits">
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            disabled={frozen}
            onClick={() => onCommit('pass')}
          >
            <Send size={15} />
            Pass it on
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            disabled={frozen}
            onClick={() => onCommit('drop')}
          >
            <XCircle size={15} />
            Let it go
          </button>
        </div>
      </div>
    </li>
  );
}

/**
 * What the four questions are for. Shown on the chapter card and again,
 * smaller, beside the running board — a player who forgets which one does
 * what shouldn't have to lose a chapter to find out. Only the questions a
 * chapter has actually opened are listed.
 */
function Questions({ tools, compact = false }) {
  return (
    <ul className={`bog-stations falls-questions${compact ? ' compact' : ''}`}>
      {TOOLS.filter((t) => tools.includes(t.id)).map((t) => (
        <li key={t.id} className="bog-station">
          <strong>
            <span className="falls-letter" aria-hidden="true">
              {t.letter}
            </span>
            {t.name}
          </strong>
          <span>{t.ask}</span>
        </li>
      ))}
    </ul>
  );
}
