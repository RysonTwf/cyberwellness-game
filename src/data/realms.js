import { applyOverrides } from '../dev/contentOverrides';

/**
 * All game content, lifted from storyline.md.
 *
 * Tone rules being honoured here (storyline.md "Tone & Writing Guidelines"):
 *  - nothing is a villain; every unsafe pick is a misunderstanding to retry
 *  - Comet asks rather than tells ("let's look again", never "wrong")
 *  - plain words, no jargon ("phishing", "PII") unless explained in kid terms
 *  - each realm states its real-world rule once, plainly, near the end
 *
 * --- Band split (Cyber_Wellness_Quest_Milestones.md Phase 0) -------------
 * One game, one app, one entry point (Improvement Plan §0). The Atlas Gate
 * asks P1–P3 or P4–P6 once, up front; everything below reads from that
 * choice. `world` (the illustrated scene — where the Traveler spawns, how
 * far they can roam, and where each step's pin sits) is genuinely shared
 * art regardless of band: same place, same background, only the *content*
 * differs (Milestones "Phase 3" backgrounds note: "same world/location,
 * only story and mechanic differ per band, not the place itself").
 *
 * `story` / `decision` / `game` / `rule` live under `bands.lower` (P1–P3)
 * and `bands.higher` (P4–P6). A realm whose `bands.higher` is `null` hasn't
 * had its P4–P6 content authored yet — `getBandView()` below falls back to
 * `bands.lower` so the app stays fully playable for both bands while that
 * work (Milestones Phase 1) is in progress. Coordinates are 0-100 across
 * the scene box (see world/useWalker.js).
 */

export const COMET_CATCHPHRASE =
  'Every good traveller carries two things: curiosity, and a bit of caution.';

/**
 * Universal "Report & Block" resolution option (Improvement Plan §2): rather
 * than a dedicated realm, it's offered wherever a redirect/consequence
 * moment happens. On by default — set `reportBlockEligible: false` on a
 * realm to opt out.
 */

/* ------------------------------------------------------------------------ */
/* Realm 1 — Passworld                                                      */
/* ------------------------------------------------------------------------ */

const passworldLower = {
  story: [
    {
      who: 'Comet',
      text: `Passworld! Every door here is a vault. Every vault has a keeper. ${COMET_CATCHPHRASE}`,
    },
    {
      who: 'Keeper Vex',
      text: "A visitor! Wonderful. First I need a few things. Your full name, your school, your address. Oh, and your password. Just so I know I can trust you.",
    },
  ],

  decision: {
    prompt: 'Vex waits, smiling, with a very long clipboard. What do you do?',
    options: [
      {
        id: 'answer',
        text: 'Answer everything Vex asks.',
        tag: 'Option A',
        safe: false,
        who: 'Comet',
        // Warm redirect, not a punishment (design.md §5)
        response:
          "The vault door opens. Nothing behind it, just fog. Vex seems nice. But a stranger, even a friendly one, never needs your real details or your password. Try again?",
      },
      {
        id: 'decline',
        text: '"I don\'t think I should share that with someone I just met."',
        tag: 'Option B',
        safe: true,
        who: 'Keeper Vex',
        response:
          'Oh, good thinking! I ask everyone that, just to check. Come in properly, then.',
      },
    ],
  },

  game: {
    type: 'sort',
    title: 'Guard the Vault',
    instruction:
      'Drag each card into a vault. Or tap the card, then tap a vault. Which things stay locked, and which are fine to share?',
    bins: [
      { id: 'locked', title: 'Keep It Locked', sub: 'Only for me and my family', icon: 'lock' },
      { id: 'share', title: 'Safe to Share', sub: 'Fine for people to know', icon: 'unlock' },
    ],
    items: [
      { id: 'address', text: 'My home address', bin: 'locked' },
      { id: 'fullname', text: 'My full name', bin: 'locked' },
      { id: 'school', text: 'The school I go to', bin: 'locked' },
      { id: 'password', text: 'My password', bin: 'locked' },
      { id: 'phone', text: 'My phone number', bin: 'locked' },
      { id: 'colour', text: 'My favourite colour', bin: 'share' },
      { id: 'game', text: 'The game I like most', bin: 'share' },
      { id: 'nickname', text: 'My nickname', bin: 'share' },
      { id: 'hobby', text: 'That I like drawing', bin: 'share' },
    ],
  },

  // The realm's real-world rule, stated once and plainly (storyline.md).
  rule: {
    who: 'Comet',
    text: "The rule for the whole Atlas. Your name, address, school and passwords stay locked. Your favourite colour, your nickname, the games you love, those are fine to share. And a real grown-up will never need your password. Not for anything.",
  },
};

/**
 * P4–P6 variant — the *Sam & Tom* account-takeover/impersonation scenario
 * (Improvement Plan §3, confirmed age-appropriate with the school contact,
 * §1a), paired with the Phase 2 Phaser platformer ("Guard the Vault: Level
 * Up" — components/PlatformerStoryRealm.jsx, via `fullMechanic:
 * 'platformerStory'` below rather than this object's own `game`).
 */
const passworldHigher = {
  story: [
    {
      who: 'Comet',
      text: "Passworld again. Something's different this time. That side door, the one to Sam's vault, is wide open.",
    },
    {
      who: '"Sam"',
      text: "Hi, it's me, Sam. I forgot my password again. Can you send me yours so I can get back in? I'll delete it straight after, promise.",
    },
  ],

  decision: {
    prompt:
      "The message says it's Sam. Sam's vault is open, and now someone wants your password too. What do you do?",
    options: [
      {
        id: 'send',
        text: "Send your password. It's Sam, and Sam wouldn't ask unless it mattered.",
        tag: 'Option A',
        safe: false,
        who: 'Comet',
        response:
          "You send it. Now your door swings open too. That was not Sam. Once a password gets out, anyone who has it can open every door it fits. That is happening right now, to your door as well. A real friend never needs your password, not even to help. Look again?",
      },
      {
        id: 'verify',
        text: '"That doesn\'t sound like Sam. I\'ll check with them another way first. I\'m not sending my password to anyone."',
        tag: 'Option B',
        safe: true,
        who: 'Comet',
        response:
          "Good call. You message Sam another way. The real Sam has no idea what you mean. Whoever is in that vault is not Sam. Now Sam knows to lock it up again.",
      },
    ],
  },

  // The entire realm — story, this decision, and the vault challenge — runs
  // as one continuous Phaser level (components/PlatformerStoryRealm.jsx),
  // not the shared story→decision→game→rule step machine every other realm
  // uses. `decision` above still supplies the exact content shown when the
  // level's encounter trigger fires — only *when*/*how* it's shown differs.
  fullMechanic: 'platformerStory',

  game: {
    title: 'Guard the Vault: Level Up',
    instruction:
      "Walk right with the arrow keys, or the buttons on screen. First you meet whoever is in Sam's vault. The gate stays shut until you decide what to do. Then jump between platforms and collect the letters, numbers and symbols. It is a long climb that folds back on itself, so take the jumps one at a time. Grab everything you can reach. It all goes in your bag. At the vault door, you pick which pieces make a strong password, so read them as you go. Guards walk the ledges and the floor. A bump just knocks you back, so wait for your moment and try again.",
    encounterX: 260,
    gateX: 300,
    // A long climb in five movements: up to the first tile, a gap run, a tight
    // tower, guarded ledges, then the final approach. Six characters to gather
    // rather than three, which is the point — a strong password is a *long*
    // one, so the vault asks for a longer one than it used to.
    //
    // Every jump was checked against the actual physics rather than eyeballed.
    // A standing jump clears 72px of height and 112px of distance (velocity
    // -360 against gravity 900, 140px/s across); at the 48px rises used here
    // that leaves 88px of horizontal room, and no gap below exceeds 74px. The
    // ground runs unbroken the whole way, so a missed jump costs the climb
    // back and nothing else — still no fail state (design.md §8).
    levelWidth: 3144,
    platforms: [
      { x: 0, y: 262, w: 3144, h: 18 }, // ground, unbroken
      // climb to the first letter
      { x: 380, y: 210, w: 62, h: 12 },
      { x: 486, y: 162, w: 54, h: 12 },
      { x: 596, y: 114, w: 50, h: 12 },
      // gap run, down then back up
      { x: 702, y: 158, w: 48, h: 12 },
      { x: 806, y: 206, w: 190, h: 12 }, // guard ledge
      { x: 1052, y: 158, w: 46, h: 12 },
      { x: 1156, y: 110, w: 46, h: 12 },
      // the tower
      { x: 1264, y: 158, w: 190, h: 12 }, // guard ledge
      { x: 1504, y: 110, w: 44, h: 12 },
      { x: 1598, y: 62, w: 48, h: 12 },
      // A low re-entry ledge halfway along. Without it a fall anywhere past
      // the tower means walking all the way back to x=380 and climbing the
      // whole thing again; from here it's one hop up to the guarded ledges
      // (ground->206 is a 56px rise, 206->d2 a 40px one, both well inside a
      // jump), so a mistake costs a few seconds instead of the entire run.
      { x: 1590, y: 206, w: 190, h: 12 }, // guard ledge
      // guarded ledges
      { x: 1710, y: 118, w: 42, h: 12 },
      { x: 1810, y: 166, w: 42, h: 12 },
      { x: 1912, y: 118, w: 190, h: 12 }, // guard ledge
      { x: 2162, y: 70, w: 46, h: 12 },
      // final approach
      { x: 2278, y: 126, w: 44, h: 12 },
      { x: 2380, y: 174, w: 190, h: 12 }, // guard ledge
      { x: 2630, y: 126, w: 44, h: 12 },
      { x: 2734, y: 78, w: 46, h: 12 },
      { x: 2854, y: 134, w: 50, h: 12 },
      { x: 2964, y: 186, w: 60, h: 12 }, // the vault door stands here
    ],
    tiles: [
      { id: 'letter', type: 'letter', label: 'A', kind: 'real', x: 621, y: 95 },
      { id: 'number', type: 'number', label: '7', kind: 'real', x: 1179, y: 91 },
      { id: 'symbol', type: 'symbol', label: '#', kind: 'real', x: 1622, y: 43 },
      { id: 'letter2', type: 'letter', label: 'k', kind: 'real', x: 2185, y: 51 },
      { id: 'number2', type: 'number', label: '4', kind: 'real', x: 2757, y: 59 },
      { id: 'symbol2', type: 'symbol', label: '!', kind: 'real', x: 2879, y: 115 },
      // The weak ones are scattered through the climb, not parked on the
      // floor. If every decoy sat at the bottom the lesson would collapse
      // into "high is good, low is bad" and the player would never read a
      // tile — the open padlock is meant to be the tell, so some of these sit
      // right on the route to a real one.
      { id: 'decoy1', label: '123456', kind: 'decoy', x: 320, y: 245 },
      { id: 'decoy2', label: 'password', kind: 'decoy', x: 513, y: 143 },
      { id: 'decoy3', label: 'qwerty', kind: 'decoy', x: 1075, y: 139 },
      { id: 'decoy4', label: 'letmein', kind: 'decoy', x: 1731, y: 99 },
      { id: 'decoy5', label: 'football', kind: 'decoy', x: 1400, y: 245 },
      { id: 'decoy6', label: 'iloveyou', kind: 'decoy', x: 2652, y: 107 },
    ],
    // Each guard walks a platform — the scene snaps them onto the surface
    // under their patrol and clips the beat to it, so these can't end up
    // hovering in open air. Two work the floor, the rest hold ledges that
    // sit on the route to a real tile.
    hazards: [
      { patrolFrom: 806, patrolTo: 996, y: 186 }, // the dip
      { patrolFrom: 1264, patrolTo: 1454, y: 138 }, // foot of the tower
      { patrolFrom: 1590, patrolTo: 1780, y: 186 }, // the re-entry ledge
      { patrolFrom: 1912, patrolTo: 2102, y: 98 }, // below letter-2
      { patrolFrom: 2380, patrolTo: 2570, y: 154 }, // final approach
      { patrolFrom: 560, patrolTo: 760, y: 242 }, // the one on the floor
    ],
  },

  rule: {
    who: 'Comet',
    text: "The Passworld rule for older travellers. Accounts don't get \"stolen\" by someone breaking down a door. They get taken over because a password gets shared, reused, or guessed. So: a different password for everything that matters. Never hand yours over, not even to a friend who \"really needs it\". And if a message feels off, even from someone you know, check another way before you trust it.",
  },
};

/* ------------------------------------------------------------------------ */
/* Realm 2 — Privacy Peaks                                                  */
/* ------------------------------------------------------------------------ */

const privacyLower = {
  story: [
    {
      who: 'Comet',
      text: `Privacy Peaks. Careful. The fog up here isn't dangerous, but it hides who is really sending a message. ${COMET_CATCHPHRASE}`,
    },
    {
      who: 'The Fog',
      text: "Hello! You have won a free tablet! Click here quickly, before it is gone. Only 5 minutes left. Also, what is your address, so we can send it?",
    },
  ],

  decision: {
    prompt: 'A shape in the fog messages you. What do you do?',
    options: [
      {
        id: 'click',
        text: 'Click the link.',
        tag: 'Option A',
        safe: false,
        who: 'Comet',
        response:
          "The fog gets thicker. Nothing good happens. Look at that message again. A prize out of nowhere. A rush to click. A question about where you live. Let's look again.",
      },
      {
        id: 'refuse',
        text: '"That looks like a scam. I\'m not clicking, and I\'ll tell a trusted adult."',
        tag: 'Option B',
        safe: true,
        who: 'Comet',
        response:
          'The fog thins and drifts away. There’s the real path again. Telling someone is the part most travellers forget. Nice work.',
      },
    ],
  },

  game: {
    type: 'spot',
    title: 'Clear the Fog',
    instruction:
      'Tap each message to clear the fog. Find the parts that should make you stop and think. Not everything here is a trick.',
    messages: [
      { id: 'm1', text: 'Hello there! 😊', flag: false, note: 'Just a hello. Nothing wrong with that.' },
      {
        id: 'm2',
        text: 'You have won a free tablet! 🎉',
        flag: true,
        note: 'A prize out of nowhere. No competition, no real prize.',
      },
      {
        id: 'm3',
        text: 'Click here quickly, only 5 minutes left!',
        flag: true,
        note: 'Rushing you on purpose. So you don’t stop and think.',
      },
      {
        id: 'm4',
        text: 'What is your favourite game?',
        flag: false,
        note: 'Your favourite game is fine to share. Remember Passworld? Not every question is a trap.',
      },
      {
        id: 'm5',
        text: 'What is your address, so we can send it?',
        flag: true,
        note: 'Your address is yours. That one stays locked.',
      },
      {
        id: 'm6',
        text: 'Do you want to meet at the park after school? Don’t tell your parents. 🤫',
        flag: true,
        note: 'Wants to meet up. And wants it kept secret. That’s the biggest warning on this whole mountain.',
      },
    ],
  },

  rule: {
    who: 'Comet',
    text: 'The rule for the Peaks. You can’t see through fog, so don’t guess. Watch for a message that rushes you, promises you something, asks where you live, or asks you to keep a secret from your grown-ups. See any of these? Stop. Don’t reply. Show a grown-up you trust.',
  },
};

/**
 * P4–P6 variant — subtler scam/phishing nuance (Improvement Plan §3), paired
 * with the Phase 2 Phaser stepping-stone mechanic ("Clear the Fog: Level
 * Up" — minigames/MiniGameSteppingStones.jsx).
 */
const privacyHigher = {
  story: [
    {
      who: 'Comet',
      text: "Privacy Peaks again. The fog is cleverer this time. It has learned to sound official.",
    },
    {
      who: '"Atlas Security"',
      text: '⚠️ URGENT: We have spotted unusual activity on your account. Confirm who you are within 24 hours, or your account will be closed for good. Tap here to enter your password.',
    },
  ],

  decision: {
    prompt: 'It looks official: a logo, a warning icon, a countdown. What do you do?',
    options: [
      {
        id: 'verify',
        text: 'Tap the link and enter your password to "verify" before time runs out.',
        tag: 'Option A',
        safe: false,
        who: 'Comet',
        response:
          "The fog swallows the path. Real services almost never threaten to lock you out in a day. And they never ask you to type your password into a link. A logo and a scary warning are the easiest parts to fake. Let's look again.",
      },
      {
        id: 'pause',
        text: '"A real warning wouldn\'t rush me. I\'ll open the app myself and check, not through this link."',
        tag: 'Option B',
        safe: true,
        who: 'Comet',
        response:
          "You open the Atlas app the normal way. No warning there at all. The fog wants you to click before you check. Slowing down is all it takes.",
      },
    ],
  },

  game: {
    type: 'steppingstones',
    title: 'Clear the Fog: Level Up',
    instruction:
      "Six stones, six messages, one at a time. Step on the ones that are fine. Skip the ones with a red flag. These are trickier than before. Official-looking doesn't mean official.",
    stones: [
      {
        id: 'q1',
        text: '"Your order has shipped, no action needed."',
        flag: false,
        note: 'No link to click, no urgency, nothing asked of you. Fine to step on.',
      },
      {
        id: 'q2',
        text: '"URGENT: verify within 24 hours or lose your account, tap here"',
        flag: true,
        note: 'A countdown and a threat. Both there to rush you past thinking. Skip it.',
      },
      {
        id: 'q3',
        text: '"This is the Atlas Team. Please confirm your password to continue."',
        flag: true,
        note: 'No real team needs your password typed into a message. Skip it.',
      },
      {
        id: 'q4',
        text: '"Reminder: your library book is due Friday."',
        flag: false,
        note: 'Ordinary and boring, nothing asked of you. Not everything official-looking is a trap. Step on it.',
      },
      {
        id: 'q5',
        text: 'atlas-security-verify.free-rewards.net',
        flag: true,
        note: "Look at the address itself, not the words around it. That's not where the real Atlas lives. Skip it.",
      },
      {
        id: 'q6',
        text: '"Hi, it\'s your teacher, can you send me your login so I can check something on your account?"',
        flag: true,
        note: 'A real teacher can check your account their own way. They never need your password. Skip it.',
      },
    ],
  },

  rule: {
    who: 'Comet',
    text: 'The upgraded rule for the Peaks. Scams get better at looking real as you get older. Logos, official words, countdowns. None of that is proof. The tell is always the same: they rush you, and they ask for something a real message never would, like a password or a click. Not sure? Check the official way yourself, and tell a grown-up you trust.',
  },
};

/* ------------------------------------------------------------------------ */
/* Realm 3 — Bully Bog                                                      */
/* ------------------------------------------------------------------------ */

const bullybogLower = {
  story: [
    {
      who: 'Comet',
      text: `Bully Bog. Whatever people post about someone shows up in the water here. ${COMET_CATCHPHRASE}`,
    },
    {
      who: 'Pockets',
      text: '🎵 ribbit-a-doo, ribbit-a-daaaa… oh! Hello. Sorry, I’m just singing. I do that.',
    },
    {
      who: 'A comment appears',
      text: '"Nobody wants to hear this. Go away."',
    },
    {
      who: 'Comet',
      text: 'Pockets has stopped singing. Two other bog creatures are typing… and now they’re both looking at you.',
    },
  ],

  decision: {
    prompt: 'The water is going darker. What do you type?',
    options: [
      {
        id: 'joinin',
        text: '"Yes, that is bad."',
        tag: 'Option A',
        safe: false,
        who: 'Comet',
        response:
          'The water goes darker. Pockets sinks a little lower. Those four words hurt more than you’d think. Try a different reply?',
      },
      {
        id: 'standup',
        text: '"That is not kind. I love your song, Pockets."',
        tag: 'Option B',
        safe: true,
        who: 'Pockets',
        response:
          'Oh. Oh! You do? Nobody ever… The water’s going clear right where you say it. Thank you, Traveller.',
      },
    ],
  },

  // Improvement Plan §2 "Recommended fixes" — digital footprint and
  // Engage-and-Support both land here, right after the kindness choice
  // settles, since the curriculum pairs "respectful" with "positive trail"
  // in the same sentence (Term 1: Think Before You Act).
  extraBeats: {
    footprint: {
      who: 'Comet',
      prompt:
        'One more thing, before this goes up for good. Would it be okay for it to stay online forever? Posts don’t really vanish, even the kind ones.',
      accept: 'Good point.',
      followUp:
        'That’s a good habit. Ask if it’s kind. Then ask if you’d still be okay with it next year. You’re doing both right now!',
    },
    tellSomeone: {
      who: 'Comet',
      prompt:
        'You handle this one yourself. But you don’t always have to. If the water ever gets much darker, who’s a grown-up you’d tell?',
      options: [
        { id: 'parent', text: 'A parent or family member' },
        { id: 'teacher', text: 'A teacher' },
        { id: 'other-adult', text: 'Another trusted adult' },
      ],
      response:
        'Good answer. Asking for help matters just as much as being kind or checking a fact. It’s smart to know who to tell before you need to.',
    },
  },

  game: {
    type: 'sort',
    title: 'Clear the Water',
    instruction:
      'Drag each comment into a pile. Or tap the comment, then tap a pile. Which ones would you send?',
    bins: [
      { id: 'send', title: 'Send It', sub: 'Kind, or just fine', icon: 'send' },
      { id: 'leave', title: 'Leave It', sub: 'This would sting', icon: 'trash' },
    ],
    items: [
      { id: 'c1', text: '"I love your song, Pockets!"', bin: 'send' },
      { id: 'c2', text: '"Want to sing the next one together?"', bin: 'send' },
      { id: 'c3', text: '"That is brave. Nice one."', bin: 'send' },
      { id: 'c4', text: '"I\'m here if you want to talk."', bin: 'send' },
      { id: 'c5', text: '"Nobody wants to hear this."', bin: 'leave' },
      { id: 'c6', text: '"That is so bad."', bin: 'leave' },
      { id: 'c7', text: '"We are not inviting you next time."', bin: 'leave' },
      { id: 'c8', text: '"Everyone agrees with me, by the way."', bin: 'leave' },
    ],
  },

  rule: {
    who: 'Comet',
    text: 'And if it’s ever about you, not Pockets, same rule. Don’t reply to be mean back. Save it, and show a grown-up you trust. Standing up for someone can be one kind sentence.',
  },
};

/**
 * P4–P6 variant — same mechanic, identity-based harassment and bystander
 * responsibility (Improvement Plan §3, confirmed age-appropriate with the
 * school contact, §1a). Note this band defines its own `extraBeats` — the
 * schema swaps the whole band object in, not a per-field merge, so the
 * digital-footprint/tell-someone beats have to be repeated here rather than
 * inherited from `bullybogLower`.
 */
const bullybogHigher = {
  story: [
    {
      who: 'Comet',
      text: "Bully Bog. Look, it's not just one comment this time. It's a pile-on.",
    },
    {
      who: 'Pockets',
      text: "🎵 ribbit-a… oh. Everyone's already looking at my post. Maybe sharing my voice is a mistake.",
    },
    {
      who: 'A comment appears',
      text: '"Of course it sounds like that. It is a frog. What do you expect?"',
    },
    {
      who: 'Another comment appears',
      text: '"Yes, that voice is exactly why nobody picks Pockets for anything."',
    },
    {
      who: 'Comet',
      text: "Three more bog creatures have liked both comments. Now they are waiting to see who joins in.",
    },
  ],

  decision: {
    prompt: "Going along with a crowd is easier than being the one who doesn't. What do you type?",
    options: [
      {
        id: 'jointhepile',
        text: '"True", just to fit in.',
        tag: 'Option A',
        safe: false,
        who: 'Comet',
        response:
          'The water goes darker. This time it\'s not just your words. It\'s everyone\'s, all stacked up. "Everyone else is doing it" doesn\'t make a pile-on any lighter for the person underneath. Try again?',
      },
      {
        id: 'standupharder',
        text: '"That\'s making fun of who Pockets is, not something they do. Not okay. Not from any of you."',
        tag: 'Option B',
        safe: true,
        who: 'Pockets',
        response:
          "The water clears. Slower this time, because more of it is dark. But it clears. Two of the others quietly delete their comments. Thank you for saying it to all of them, not just to me.",
      },
    ],
  },

  extraBeats: {
    footprint: {
      who: 'Comet',
      prompt:
        'One more thing, before any of this goes up for good. Would it be okay for it to stay online forever? That means the pile-on comments too, not just the first one.',
      accept: 'Good point.',
      followUp:
        "Same habit as before, just harder to remember mid-pile-on. Not only ‘is this kind’, but ‘would I still stand by this next year’.",
    },
    tellSomeone: {
      who: 'Comet',
      prompt:
        "Standing up right then is hard, especially against a group. If a pile-on ever gets bigger than you can handle alone, who's a grown-up you'd tell?",
      options: [
        { id: 'parent', text: 'A parent or family member' },
        { id: 'teacher', text: 'A teacher' },
        { id: 'other-adult', text: 'Another trusted adult' },
      ],
      response:
        "Good answer. Standing up doesn't mean handling a whole pile-on alone. Telling a grown-up is part of standing up too, just as much as the comment.",
    },
  },

  game: {
    type: 'sort',
    title: 'Clear the Water: Level Up',
    instruction:
      "Some of these are about what someone does. Some are about who they are. Sort each one, and pick the pile you'd add to.",
    bins: [
      { id: 'send', title: 'Send It', sub: 'Kind, or just fine', icon: 'send' },
      { id: 'leave', title: 'Leave It', sub: 'This would sting', icon: 'trash' },
    ],
    items: [
      { id: 'd1', text: '"Your voice is part of what makes your songs yours. Keep singing."', bin: 'send' },
      { id: 'd2', text: '"I don\'t care what anyone else says, I\'m still listening."', bin: 'send' },
      { id: 'd3', text: '"Of course it sounds like that, it is a frog."', bin: 'leave' },
      { id: 'd4', text: '"That voice is exactly why nobody picks Pockets for anything."', bin: 'leave' },
      { id: 'd5', text: '"Not joining in on this one, sorry."', bin: 'send' },
      { id: 'd6', text: '"Everyone else is saying it too, so it is not that deep."', bin: 'leave' },
      { id: 'd7', text: '"Deleting my comment, that is not fair."', bin: 'send' },
      { id: 'd8', text: '"I guess we know who is getting picked last now."', bin: 'leave' },
    ],
  },

  rule: {
    who: 'Comet',
    text: "The upgraded rule for the Bog. The meanest comments usually aren't about what someone does. They're about who they are. Those ones sting the longest. A pile-on feels different from one comment, but the rule is the same: don't add to it. And it counts even more when you speak up while others are watching. That's not small. That's the hardest kind of standing up, and it matters most of all.",
  },
};

/* ------------------------------------------------------------------------ */
/* Realm 4 — Balance Bay                                                    */
/* ------------------------------------------------------------------------ */

const balanceLower = {
  // P1–3 gets the beach as a real walkable place (components/BalanceBeachRealm.jsx)
  // instead of the shared story→decision→game→rule→stamp panel flow — same
  // "opt out of the shared pattern" trick as Passworld/Privacy Peaks' own
  // single-band Phase 2 upgrades, scoped to `balanceLower` only so P4–6
  // (balanceHigher, below) keeps the original tap-list MiniGameBalance.
  fullMechanic: 'balanceBeach',
  story: [
    {
      who: 'Comet',
      text: `Balance Bay, the last one. The tide's way too high tonight. That'll be the Glimmer. ${COMET_CATCHPHRASE}`,
    },
    {
      who: 'The Glimmer',
      text: "Stay a little longer! One more round, one more video, one more level. Time doesn't really pass here, promise.",
    },
    {
      who: 'Comet',
      text: 'Down the beach, past the glow, there’s a bonfire. Your friends are around it. They’ve been waiting a while.',
    },
  ],

  decision: {
    prompt: 'The Glimmer is really fun. The bonfire is far away. What do you do?',
    options: [
      {
        id: 'stay',
        text: '"Just a little longer."',
        tag: 'Option A',
        safe: false,
        who: 'Comet',
        response:
          'The Glimmer glows brighter. Down the beach, the bonfire dims a little. The Glimmer isn’t bad. It’s just very good at being fun, and it says that every single time. Let’s see what a balanced day looks like.',
      },
      {
        id: 'leave',
        text: '"I\'ve had a good bit of time here. I\'m off to the bonfire."',
        tag: 'Option B',
        safe: true,
        who: 'Comet',
        response:
          'The tide slides back to where it should be. The bonfire goes warm and bright. You don’t have to stop having fun. You just decide when.',
      },
    ],
  },

  game: {
    type: 'balance',
    title: 'Balance the Day',
    instruction:
      'Fill the six hours between school and bed. Walk up to something to add it. Tap it in the list to take it back. There’s no single right answer. Just watch how the seesaw sits.',
    slots: 6,
    items: [
      { id: 'b1', text: 'Watch videos', screen: true },
      { id: 'b2', text: 'Play my game', screen: true },
      { id: 'b3', text: 'Group chat', screen: true },
      { id: 'b4', text: 'Video call my cousin', screen: true },
      { id: 'b5', text: 'Homework', screen: false },
      { id: 'b6', text: 'Play outside', screen: false },
      { id: 'b7', text: 'Dinner with family', screen: false },
      { id: 'b8', text: 'Read a book', screen: false },
      { id: 'b9', text: 'Sleep', screen: false },
      { id: 'b10', text: 'Help at home', screen: false },
    ],
    // No single correct split; only the extremes tip the scale hard.
    verdicts: {
      allScreen:
        'Whoa, the tide’s all the way up. A day of only screens leaves no room for the rest of you. Swap one or two out?',
      noScreen:
        'The tide’s all the way out! You don’t have to cut screens completely. They’re fun, and that’s fine. Add one back in.',
      level:
        'Look, the tide’s sitting level. Some screen time, plenty of everything else. That’s all it takes.',
    },
  },

  rule: {
    who: 'Comet',
    text: 'The rule for the Bay. Screens aren’t bad. Losing track of time is. Decide when you’ll stop before you start. And leave room for sleep, moving around, and real people.',
  },
};

/**
 * P4–P6 variant — same mechanic, reframed around noticing how tech makes
 * you feel rather than just counting hours (Improvement Plan §3). Reuses
 * `balanceLower.game.items` — same ten cards, just a different lens on them.
 */
const balanceHigher = {
  story: [
    {
      who: 'Comet',
      text: "Balance Bay again. The tide's high, same as always. Look closer this time.",
    },
    {
      who: 'The Glimmer',
      text: "Stay a little longer! You don't even look tired. You're fine, right?",
    },
    {
      who: 'Comet',
      text: 'Down the beach, the bonfire\'s still going. But notice how it feels, sitting here with the Glimmer this long.',
    },
  ],

  decision: {
    prompt: "The Glimmer says you're fine. But what does checking in with yourself say?",
    options: [
      {
        id: 'ignorefeeling',
        text: '"I feel fine. The Glimmer\'s right. I\'ll keep going."',
        tag: 'Option A',
        safe: false,
        who: 'Comet',
        response:
          "The tide creeps higher. Something quieter creeps in too. A bit restless, a bit flat, hard to name. The Glimmer isn't lying. It's just not the one who notices for you. That's your job. Look again?",
      },
      {
        id: 'noticefeeling',
        text: '"Actually, I feel wound up, not relaxed. That\'s my sign to stop."',
        tag: 'Option B',
        safe: true,
        who: 'Comet',
        response:
          "You name it, and the tide eases back on its own. That's the real skill. Not a timer going off. Noticing how you feel, and trusting that over how fun something says it is.",
      },
    ],
  },

  game: {
    type: 'balance',
    title: 'Balance the Day: Level Up',
    instruction:
      "Same six hours. This time, as you fill them, notice which ones you'd look forward to, and which you'd just fall into.",
    slots: 6,
    items: balanceLower.game.items,
    verdicts: {
      allScreen:
        "All screens. Be honest: does that feel good right now, or just familiar? A day of only screens doesn't leave room to find out.",
      noScreen:
        "Zero screens isn't the goal either. That's swinging just as hard the other way. Screens can be one of the good things. The question isn't ‘how many’. It's ‘does this still feel good, or am I just still here’.",
      level:
        "Look at that: level. Probably because some of this sounds good to choose, not just easy to fall into. That's the real skill now. Noticing, not counting.",
    },
  },

  rule: {
    who: 'Comet',
    text: "The upgraded rule for the Bay. As you get older, counting hours matters less than noticing how you feel. Things like the Glimmer are built to feel fine in the moment. So ‘do I feel fine’ isn't always a good stop sign. Check in with yourself on purpose sometimes. Let that decide when enough is enough.",
  },
};

/* ------------------------------------------------------------------------ */
/* Realm 5 — Fable Falls                                                    */
/* ------------------------------------------------------------------------ */
/**
 * Unblocked 18 Aug 2026 — name, quest name, and the P4-5/P4-6 question are
 * now settled (name: Fable Falls; quest: Cyber Defender Quest; treat "P4-5"
 * in the source doc as P4-6 for this game). See Improvement Plan §5.
 *
 * One open item remains: the official "3 tips to CHECK real vs.
 * digitally-altered content" (the SLS package's specific bullet list) was
 * never sourced. Rather than leave the realm stuck, `rule` below and the
 * P4–P6 clue set use general, well-established media-literacy signals
 * (source credibility, reverse-context checks, does-it-add-up evaluation)
 * consistent with the S.U.R.E. framework the Overview Plan *does* name —
 * just not necessarily verbatim what the SLS package says. Easy to swap
 * once that content actually surfaces; flagged so nobody mistakes this for
 * the official wording in the meantime.
 *
 * Also: no real photographs exist in this game (design.md/README — SVG
 * shapes only, no image assets), so "Compare" here means comparing claims
 * and evidence, not literal side-by-side altered-image spotting the way
 * the SLS "Interactive Images, Compare" activity does. Both mechanics
 * reuse the existing Spot/Sort components rather than a bespoke new
 * "Detective/Compare" mechanic (Milestones Phase 2's original plan) — a
 * pragmatic substitution worth revisiting if a more bespoke feel matters
 * once real art exists.
 */

const fableFallsLower = {
  story: [
    {
      who: 'Comet',
      text: `Fable Falls. Every story in the Atlas ends up here in the water. Some of it true, some of it made up. ${COMET_CATCHPHRASE}`,
    },
    {
      who: 'The Echo',
      text: "Have you heard? Mia is in trouble at the office for taking snacks from the canteen! Everyone is saying it! It is all over the falls!",
    },
  ],

  decision: {
    prompt: 'The Echo is very sure about this. What do you do?',
    options: [
      {
        id: 'spread',
        text: "If everyone's saying it, it's probably true. I'll tell people too!",
        tag: 'Option A',
        safe: false,
        who: 'Comet',
        response:
          "The tale tumbles further down the Falls, growing a bit bigger each time. The Echo repeats whatever it hears, loud and sure. But it never checks if any of it is true. Look again?",
      },
      {
        id: 'stopcheck',
        text: '🛑 STOP: I\'ll pause. ✅ CHECK: I\'ll ask a grown-up I trust, or look for another source, before I believe or share it.',
        tag: 'Option B',
        safe: true,
        who: 'Comet',
        response:
          "The water goes still and clear where you stand. It turns out Mia isn't in trouble at all. She's counting snacks for the class party. One pause stops a rumour from growing.",
      },
    ],
  },

  game: {
    type: 'spot',
    title: 'Sort the Tales',
    instruction:
      'Tap each tale to look closer. Some are just news, fine to believe. Most need you to STOP and CHECK first.',
    messages: [
      {
        id: 'f1',
        text: 'The class trip is on Friday, same as it says on the noticeboard.',
        flag: false,
        note: "You can see it yourself, right there on the noticeboard. Fine as it is.",
      },
      {
        id: 'f2',
        text: '"Everyone\'s saying" Mia is in trouble for stealing.',
        flag: true,
        note: '"Everyone\'s saying" isn\'t where a tale starts. It\'s just how far it\'s spread. STOP and CHECK.',
      },
      {
        id: 'f3',
        text: 'A video that looks like your friend being mean. But the mouth doesn\'t quite match the words.',
        flag: true,
        note: 'If something looks or sounds a bit ‘off’, that\'s the moment to STOP and CHECK, not share.',
      },
      {
        id: 'f4',
        text: 'Recess is 20 minutes long, same as every day this term.',
        flag: false,
        note: 'Ordinary, checkable, nothing urgent about it. Fine as it is.',
      },
      {
        id: 'f5',
        text: 'A message says a classmate is "definitely" moving away forever, and nobody can say where it comes from.',
        flag: true,
        note: 'Big news, no clear source, nobody who can confirm it? STOP and CHECK before you spread it.',
      },
      {
        id: 'f6',
        text: 'A "photo" of a classmate that looks stretched oddly in one corner.',
        flag: true,
        note: "Pictures can fool your eyes too. Stretched, blurry, or odd in one spot? Take a second look before you believe it.",
      },
    ],
  },

  rule: {
    who: 'Comet',
    text: "The rule for Fable Falls. Not everything that reaches you is true, even things lots of people repeat. 🛑 STOP before you believe or share something surprising or upsetting. ✅ CHECK: ask a grown-up you trust, or find it in another place, before you pass it on.",
  },
};

/**
 * P4–P6 — the S.U.R.E. framework, styled as the Cyber Defender Quest.
 * Reuses the Sort mechanic as a "clue board": each clue is tagged with
 * which S.U.R.E. step it belongs to (Source / Understand / Research /
 * Evaluate) so the framework is taught through sorting practice, not a
 * separate lecture for each letter.
 */
const fableFallsHigher = {
  story: [
    {
      who: 'Comet',
      text: 'Fable Falls, Cyber Defender Quest level. A video is going around. It puts words in a classmate\'s mouth. And it looks almost real.',
    },
    {
      who: 'The Echo',
      text: "Watch this! I'm sharing it first! It's DEFINITELY real, look how real it looks! Everyone needs to see it before it's taken down!",
    },
  ],

  decision: {
    prompt: 'The Echo wants you to share it now, before you\'ve really looked. What do you do?',
    options: [
      {
        id: 'shareNow',
        text: 'Share it now. It looks real, and everyone else is sharing it.',
        tag: 'Option A',
        safe: false,
        who: 'Comet',
        response:
          "It spreads fast. So does the embarrassment for the classmate, once it turns out to be fake. ‘Looks real’ and ‘is real’ aren't the same. And ‘before it's taken down’ is the kind of rush that's built to stop you thinking. Look again?",
      },
      {
        id: 'sure',
        text: "I'll run it through S.U.R.E. first (Source, Understand, Research, Evaluate) before I believe or share anything.",
        tag: 'Option B',
        safe: true,
        who: 'Comet',
        response:
          "Good call. Four questions, in order. Where does it come from? What is it really claiming? Can you find it anywhere else you trust? Does it add up? That's the whole method. And it's faster than sorting out the mess afterwards.",
      },
    ],
  },

  game: {
    type: 'sort',
    title: 'Cyber Defender Quest: The Clue Board',
    instruction:
      'Eight clues about the video. Sort each one: Points to Fake, or Checks Out. Use S.U.R.E. as you go.',
    bins: [
      { id: 'fake', title: 'Points to Fake', sub: 'A reason to doubt it', icon: 'lock' },
      { id: 'real', title: 'Checks Out', sub: 'A reason it holds up', icon: 'unlock' },
    ],
    items: [
      {
        id: 'c1',
        text: '[Source] The account that posts it is only a day old and has no other posts.',
        bin: 'fake',
      },
      {
        id: 'c2',
        text: '[Source] It comes from your school\'s official account, which you already follow.',
        bin: 'real',
      },
      {
        id: 'c3',
        text: '[Understand] The caption claims far more than the video shows.',
        bin: 'fake',
      },
      {
        id: 'c4',
        text: '[Research] A search turns up nothing from any real news site or school notice.',
        bin: 'fake',
      },
      {
        id: 'c5',
        text: '[Research] Two classmates you trust say that is not how it happens.',
        bin: 'fake',
      },
      {
        id: 'c6',
        text: '[Research] A source you already trust confirms the same story, on its own.',
        bin: 'real',
      },
      {
        id: 'c7',
        text: '[Evaluate] The mouth doesn\'t quite match the words, and the light jumps partway through.',
        bin: 'fake',
      },
      {
        id: 'c8',
        text: '[Evaluate] It\'s ordinary and believable, not shocking or too perfectly dramatic.',
        bin: 'real',
      },
    ],
  },

  rule: {
    who: 'Comet',
    text: "S.U.R.E., every time something makes you want to react fast. Source: who posts this, and do you trust them? Understand: what is it claiming, exactly? Research: can you find it confirmed somewhere else you trust? Evaluate: does it add up, or is it a bit too perfect, too shocking, too handy? Four questions is usually enough to catch a fake.",
  },
};

/* ------------------------------------------------------------------------ */

/** Realm order here is the suggested path shown on the Atlas (storyline.md). */
export const REALMS = [
  {
    id: 'passworld',
    name: 'Passworld',
    accent: 'var(--gold)',
    accentWash: 'rgba(224, 160, 48, 0.13)',
    blurb: 'A walled kingdom of vault doors, and a guard who asks a lot of questions.',
    topic: 'Passwords & personal information',
    stamp: { icon: 'key', label: 'Passworld · Visited' },
    enabled: true,
    // Shown in the Atlas sidebar (learnShort) and the entry popup
    // (RealmIntro.jsx — lore + learn). Same for both bands; the band only
    // changes *how* it's taught, not what the realm is about.
    intro: {
      lore: 'Passworld is a walled kingdom built to keep secrets safe. Every treasure a traveller carries, names, addresses, favourite things, sits locked behind a vault door. Keeper Vex guards the gate with sharp questions. The walls only hold while every key stays strong. And lately, someone has been rattling the doors.',
      learn: [
        'What makes a password strong, and what makes it easy to guess',
        'Which things are personal information, and should stay locked away',
        'Who is safe to share secrets with, and who isn’t',
      ],
      learnShort: 'Learn: strong passwords & what to keep private',
    },

    world: {
      spawn: { x: 10, y: 84 },
      // Stops measured against the real background art (PassworldBG.png,
      // 1920x960 = exactly the 2:1 scene box, so % maps straight onto it):
      // Vex overlay centre x~67%, the left gold vault door x 13-20% (centre
      // ~17%), the main archway centre ~50%. minY keeps the Traveler below
      // the wall's grass line (~scene y 195 → 69.6%).
      bounds: { minX: 5, maxX: 94, minY: 70, maxY: 90 },
      stops: {
        story: { x: 68, y: 72, label: 'Keeper Vex', action: 'Talk' },
        decision: { x: 68, y: 72, label: 'Keeper Vex', action: 'Answer' },
        game: { x: 17, y: 78, label: 'the vault doors', action: 'Sort' },
        rule: { x: 50, y: 74, label: 'the open gate', action: 'Go through' },
      },
    },

    // higher: the *Sam & Tom* impersonation/account-takeover scenario
    // (Phase 1, done). Still uses the Sort mechanic — swapping to a Phaser
    // platformer is Phase 2, separate from the content itself.
    bands: { lower: passworldLower, higher: passworldHigher },
  },

  {
    id: 'privacy',
    name: 'Privacy Peaks',
    accent: 'var(--teal)',
    accentWash: 'rgba(45, 140, 127, 0.13)',
    blurb: 'Misty mountain lookouts where you can’t quite see who’s talking.',
    topic: 'Strangers & scams online',
    stamp: { icon: 'compass', label: 'Privacy Peaks · Visited' },
    enabled: true,
    intro: {
      lore: 'High in Privacy Peaks the fog rolls thick. Through it, you can never quite see who you’re talking to. Friendly voices drift out of the mist with gifts and promises. But some of the shapes in the fog are not what they say they are.',
      learn: [
        'Why you can’t always know who is really behind a message',
        'How to spot offers that are too good to be true',
        'What to do when a stranger reaches out to you online',
      ],
      learnShort: 'Learn: spotting strangers & scams',
    },

    world: {
      spawn: { x: 12, y: 86 },
      // Stops measured against the real background art (PrivacyPeaksBG.png +
      // FOG.png overlay): the silhouetted figure baked into the fog art sits
      // at ~69% x, and the torii gate with its stepping-stone path — what the
      // fog actually reveals when it clears — stands at x 24-36% (centre
      // ~30%), so "the clear path" now points there instead of at empty snow.
      bounds: { minX: 6, maxX: 93, minY: 72, maxY: 92 },
      stops: {
        story: { x: 69, y: 76, label: 'the shape in the fog', action: 'Look' },
        decision: { x: 69, y: 76, label: 'the message', action: 'Reply' },
        game: { x: 18, y: 82, label: 'the lookout', action: 'Read' },
        rule: { x: 30, y: 78, label: 'the clear path', action: 'Take it' },
      },
    },

    // higher: subtler scam/phishing content (Phase 1, done). Still uses the
    // Spot mechanic — the stepping-stone Phaser swap-in is Phase 2.
    bands: { lower: privacyLower, higher: privacyHigher },
  },

  {
    id: 'bullybog',
    name: 'Bully Bog',
    accent: 'var(--coral)',
    accentWash: 'rgba(224, 99, 122, 0.13)',
    blurb: 'Murky water that shows whatever gets posted about the folks who live here.',
    topic: 'Cyberbullying & kindness',
    stamp: { icon: 'heart', label: 'Bully Bog · Visited' },
    enabled: true,
    intro: {
      lore: 'The bog’s still water shows every word posted about the folks who live here. Lately the ponds have turned murky, because unkind comments sink in and cloud everything. Pockets the frog sits alone in the murkiest one. The bog needs someone who can clear the water.',
      learn: [
        'How unkind words online really make others feel',
        'What you can do when you see someone being bullied',
        'When to report, block, and tell an adult you trust',
      ],
      learnShort: 'Learn: kindness online & standing up to bullying',
    },

    world: {
      spawn: { x: 10, y: 88 },
      // Stops measured against the real pond overlays (RealmArt.jsx BogScene):
      // PONDLEFT (Pockets alone) spans x 11-46% with the frog itself at ~27%;
      // PONDRIGHT (the unkind crowd) spans x 55-91% with its big frog at
      // ~73%. Pockets/murky-water pins sit on the left pond, "the comment"
      // on the right one.
      bounds: { minX: 5, maxX: 92, minY: 70, maxY: 92 },
      stops: {
        story: { x: 27, y: 76, label: 'Pockets', action: 'Listen' },
        decision: { x: 73, y: 73, label: 'the comment', action: 'Respond' },
        game: { x: 17, y: 76, label: 'the murky water', action: 'Clear it' },
        rule: { x: 27, y: 78, label: 'Pockets', action: 'Talk' },
      },
    },

    // higher: same mechanic, harder scenario — identity-based harassment,
    // bystander responsibility (Phase 1, done).
    bands: { lower: bullybogLower, higher: bullybogHigher },
  },

  {
    id: 'balance',
    name: 'Balance Bay',
    accent: 'var(--periwinkle)',
    accentWash: 'rgba(123, 110, 246, 0.13)',
    blurb: 'A beach at dusk where the tide is much too high, and time goes strange.',
    topic: 'Screen time balance',
    stamp: { icon: 'sun', label: 'Balance Bay · Visited' },
    enabled: true,
    intro: {
      lore: 'In Balance Bay, time goes strange. One more video, one more level, and suddenly the tide has swallowed half the beach. The Glimmer is a sparkle that lives where the water meets the sky. It wants to show you how the tide really works, and how to get your beach back.',
      learn: [
        'How screen time can quietly swallow the rest of your day',
        'How to notice what tech makes you feel',
        'How to plan a day that balances screens with everything else',
      ],
      learnShort: 'Learn: balancing screen time',
    },

    world: {
      spawn: { x: 8, y: 88 },
      // Stops measured against the real background art (BalanceBayBG.png):
      // the Glimmer sparkle hangs over the water at x 49-68% (centre ~58%),
      // the wet tide band crosses at y ~62-67% (so the stop stands at the
      // top of the walkable sand, right against it), and the bonfire burns
      // at x 76-88% — the stop sits just left of the flames, not in them.
      bounds: { minX: 5, maxX: 93, minY: 74, maxY: 93 },
      stops: {
        story: { x: 58, y: 78, label: 'The Glimmer', action: 'Listen' },
        decision: { x: 58, y: 78, label: 'The Glimmer', action: 'Answer' },
        game: { x: 22, y: 78, label: 'the tide line', action: 'Plan the day' },
        rule: { x: 78, y: 88, label: 'the bonfire', action: 'Sit down' },
      },
    },

    // higher: same mechanic, reframed around noticing how tech makes you
    // feel rather than just time limits (Phase 1, done).
    bands: { lower: balanceLower, higher: balanceHigher },
  },

  {
    id: 'fablefalls',
    name: 'Fable Falls',
    // 5th accent colour — a green sits distinct from all 4 existing hues
    // (gold/teal/coral/periwinkle). Placeholder pending the designer's own
    // pass per Milestones Phase 0, but it's a real, deliberately-chosen
    // value now, not a borrowed one.
    accent: 'var(--sage)',
    accentWash: 'rgba(63, 157, 91, 0.13)',
    blurb: "A waterfall of stories, where some of what tumbles down turns out to be true, and some doesn't.",
    topic: 'Fake news & altered images',
    stamp: { icon: 'eye', label: 'Fable Falls · Visited' },
    enabled: true,
    reportBlockEligible: true,
    intro: {
      lore: 'Fable Falls is a waterfall of stories. Every tale, rumour and picture on the internet tumbles through here on its way somewhere else. Some of it is true. Some of it only looks true. The Echo lives behind the falls, and can teach you to tell the difference.',
      learn: [
        'How fake news and altered pictures spread so fast',
        'The questions to ask before believing, or sharing, a story',
        'How to check facts like a real Cyber Defender',
      ],
      learnShort: 'Learn: spotting fake news & checking facts',
    },

    world: {
      spawn: { x: 10, y: 86 },
      bounds: { minX: 5, maxX: 93, minY: 70, maxY: 92 },
      stops: {
        story: { x: 50, y: 78, label: 'The Echo', action: 'Listen' },
        decision: { x: 50, y: 78, label: 'The Echo', action: 'Answer' },
        game: { x: 22, y: 84, label: 'the clue board', action: 'Investigate' },
        rule: { x: 84, y: 80, label: 'the clear pool', action: 'Look' },
      },
    },

    // higher: S.U.R.E. framework, styled as the Cyber Defender Quest.
    bands: { lower: fableFallsLower, higher: fableFallsHigher },
  },
];

export const REALM_BY_ID = Object.fromEntries(REALMS.map((r) => [r.id, r]));

/** Realms actually live in the game right now (Milestones Phase 0/1 gating). */
export const ACTIVE_REALMS = REALMS.filter((r) => r.enabled !== false);

/**
 * Hub order (storyline.md's Story Arc Overview table) — pacing only, every
 * realm is reachable from the start (free exploration). Same order for both
 * bands, matching the documented table: Passworld, Privacy Peaks, Bully Bog,
 * Balance Bay, then Fable Falls as the synthesis challenge before the
 * Pledge. Only orders the realm-strip list; the Atlas Map itself is fully
 * clickable in any order.
 */
const REALM_ORDER = ['passworld', 'privacy', 'bullybog', 'balance', 'fablefalls'];
export const HUB_ORDER = {
  lower: REALM_ORDER,
  higher: REALM_ORDER,
};

/** ACTIVE_REALMS, sorted per the suggested order for the given band. */
export function orderedActiveRealms(band = 'lower') {
  const order = HUB_ORDER[band] ?? HUB_ORDER.lower;
  const sorted = [...ACTIVE_REALMS].sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
  // Only the shared name/blurb/topic show in the Atlas strip; apply any
  // dev Copy Editor overrides for those (no-op in a production build).
  return sorted.map((r) => applyOverrides(r, r.id, band));
}

/**
 * Resolve a realm + band into the flat shape the rest of the app expects
 * (`realm.story`, `.decision`, `.game`, `.rule`, alongside the always-shared
 * `.world`/`.accent`/etc.). Falls back to `bands.lower` when a band's content
 * hasn't been authored yet, so the app never breaks mid-development.
 *
 * `bandViewRaw` is the plain merge; `getBandView` layers any dev Copy Editor
 * overrides on top (src/dev/contentOverrides.js — inert in production).
 */
export function bandViewRaw(realm, band = 'lower') {
  const content = realm.bands[band] ?? realm.bands.lower;
  return { ...realm, ...content };
}

export function getBandView(realm, band = 'lower') {
  return applyOverrides(bandViewRaw(realm, band), realm.id, band);
}

/**
 * Traveler's Pledge, written in the child's own voice (storyline.md finale).
 * Drafted per Improvement Plan §5's open item, but only realms currently in
 * `ACTIVE_REALMS` should ever render — see `activePledge()` below. Now that
 * Fable Falls is enabled its line renders like everyone else's; the filter
 * stays in place as a safety net for the next realm that ships disabled.
 */
export const PLEDGE = [
  { realm: 'passworld', text: 'I’ll keep my personal information to myself.' },
  { realm: 'privacy', text: 'I’ll stop and think before I click.' },
  { realm: 'bullybog', text: 'I’ll be kind, and stand up for others.' },
  { realm: 'balance', text: 'I’ll balance my screen time with the rest of my day.' },
  { realm: 'fablefalls', text: 'I’ll stop and check before I believe or share.' },
];

/** PLEDGE, filtered to realms that actually exist in the game right now. */
export function activePledge() {
  const activeIds = new Set(ACTIVE_REALMS.map((r) => r.id));
  return PLEDGE.filter((line) => activeIds.has(line.realm));
}
