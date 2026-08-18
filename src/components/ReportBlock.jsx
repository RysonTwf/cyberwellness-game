import { useState } from 'react';
import { ShieldAlert, ShieldCheck } from 'lucide-react';

/**
 * Reusable "Report & Block" resolution option (Improvement Plan §2 / §5;
 * Milestones Phase 1 "build once, reuse everywhere"). Term 1 names Report
 * Inappropriate Content as its own habit; Term 2 pairs it with Block under
 * "When Things Go Wrong." Neither is a dedicated realm in this game — both
 * show up here instead, wherever a realm's story reaches a redirect moment.
 *
 * Deliberately optional and non-blocking: it sits alongside "let me look
 * again," not instead of it, so a child can still just retry the decision.
 */
export default function ReportBlock({ accent = 'var(--ink)' }) {
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <div className="dialogue fade-in">
        <div className="avatar" style={{ display: 'grid', placeItems: 'center' }}>
          <ShieldCheck size={22} color={accent} />
        </div>
        <div>
          <div className="who">Good instinct</div>
          <p>
            Reporting and blocking tells the app to stop this from reaching you again — you
            don&rsquo;t have to just put up with it.
          </p>
        </div>
      </div>
    );
  }

  return (
    <button type="button" className="btn btn-ghost btn-sm" onClick={() => setDone(true)}>
      <ShieldAlert size={16} />
      I&rsquo;d also report &amp; block this
    </button>
  );
}
