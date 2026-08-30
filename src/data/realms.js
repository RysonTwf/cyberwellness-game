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
      text: `Passworld! Every door here is a vault, and every vault has a keeper. ${COMET_CATCHPHRASE}`,
    },
    {
      who: 'Keeper Vex',
      text: 'A visitor! Lovely. First I need a few things from you. Your full name, your school, and your home address. Oh, and your password. Just so I know I can trust you.',
    },
  ],

  decision: {
    prompt: 'Vex waits with a very long list. What do you do?',
    options: [
      {
        id: 'answer',
        text: 'Tell Vex everything.',
        tag: 'Option A',
        safe: false,
        who: 'Comet',
        // Warm redirect, not a punishment (design.md §5)
        response:
          'The vault door swings open. There is only fog behind it. Vex seems kind, but a stranger, even a friendly one, never needs your real details or your password. Shall we try again?',
      },
      {
        id: 'decline',
        text: '"I should not share that with someone I have only just met."',
        tag: 'Option B',
        safe: true,
        who: 'Keeper Vex',
        response:
          'Good thinking! I ask everyone that, just to check. Come inside properly, then.',
      },
    ],
  },

  game: {
    type: 'sort',
    title: 'Guard the Vault',
    instruction:
      'These are the things Vex asked you for, and a few more. Put each one where it belongs. Which stay locked away, and which are fine to share?',
    bins: [
      { id: 'locked', title: 'Keep It Locked', sub: 'Only for me and my family', icon: 'lock' },
      { id: 'share', title: 'Safe to Share', sub: 'Fine for other people to know', icon: 'unlock' },
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
    text: 'Here is the rule for the whole Atlas. Your name, your address, your school and your passwords stay locked. Your favourite colour, your nickname and the games you love are fine to share. And a real grown-up will never need your password. Not for anything.',
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
      text: 'Passworld! Every door here is a vault, and every vault has a keeper. But Sam\'s vault, the side door, is wide open.',
    },
    {
      who: '"Sam"',
      text: 'Hi, it is me, Sam. I have forgotten my password again. Can you send me yours so I can get back in? I will delete it straight after, I promise.',
    },
  ],

  decision: {
    prompt:
      'The message says it is Sam. Sam\'s vault is open, and now someone wants your password too. What do you do?',
    options: [
      {
        id: 'send',
        text: 'Send your password. It is Sam, and Sam would not ask unless it mattered.',
        tag: 'Option A',
        safe: false,
        who: 'Comet',
        response:
          'You send it. Now your door swings open too. That was not Sam. Once a password gets out, anyone who has it can open every door it fits, and that is happening to your door right now. A real friend never needs your password, not even to help. Shall we look again?',
      },
      {
        id: 'verify',
        text: '"That does not sound like Sam. I will check with them another way first. I am not sending my password to anyone."',
        tag: 'Option B',
        safe: true,
        who: 'Comet',
        response:
          'Good call. You message Sam another way. The real Sam has no idea what you mean. Whoever is in that vault is not Sam, and now Sam knows to lock it again.',
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
    title: 'Guard the Vault',
    instruction:
      'Walk to the right with the arrow keys, or the buttons on screen. First you meet whoever is in Sam\'s vault. The gate stays shut until you decide what to do. After that, jump between the platforms and collect the letters, numbers and symbols. The climb is long and folds back on itself, so take the jumps one at a time. Everything you grab goes in your bag. At the vault door you choose which pieces make a strong password, so read them as you go. Guards walk the ledges. A bump only knocks you back, so wait for your moment and try again.',
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
    text: 'Here is the Passworld rule for older travellers. Accounts are almost never taken by force. They are taken over when a password is shared, reused, or easy to guess. So use a different password for everything that matters. Never hand yours over, not even to a friend who says they really need it. And if a message feels wrong, even from someone you know, check another way before you trust it.',
  },
};

/* ------------------------------------------------------------------------ */
/* Realm 2 — Privacy Peaks                                                  */
/* ------------------------------------------------------------------------ */

const privacyLower = {
  story: [
    {
      who: 'Comet',
      text: `Privacy Peaks. Take care up here. The fog is not dangerous, but it hides who is really sending a message. ${COMET_CATCHPHRASE}`,
    },
    {
      who: 'The Fog',
      text: 'Hello! You have won a free tablet! Tap here quickly, before it is gone. Only five minutes left. Also, what is your home address, so we can send it to you?',
    },
  ],

  decision: {
    prompt: 'A shape in the fog sends you this. What do you do?',
    options: [
      {
        id: 'click',
        text: 'Tap the link.',
        tag: 'Option A',
        safe: false,
        who: 'Comet',
        response:
          'The fog grows thicker. Nothing good happens. Look at that message again. A prize from nowhere. A rush to tap. A question about where you live. Let us look again.',
      },
      {
        id: 'refuse',
        text: '"This looks like a trick. I am not tapping it, and I will tell an adult I trust."',
        tag: 'Option B',
        safe: true,
        who: 'Comet',
        response:
          'The fog thins and drifts away, and there is the real path again. Telling someone is the part most travellers forget. Nice work.',
      },
    ],
  },

  game: {
    type: 'quiz',
    title: 'Read the Fog',
    instruction:
      'A few more messages drift out of the fog. Answer each one the way you answered the shape you just met.',
    questions: [
      {
        id: 'q1',
        text: 'A message says you have won a phone in a competition you never entered. What do you think?',
        options: [
          {
            id: 'a',
            text: 'Brilliant, I will claim my prize.',
            correct: false,
            feedback:
              'A prize you never entered is almost always a trick to get you to tap a link or share your details. Real competitions do not work like this.',
          },
          {
            id: 'b',
            text: 'I never entered, so this is not real.',
            correct: true,
            feedback:
              'Exactly. No entry means no prize. A surprise win is one of the oldest tricks in the fog.',
          },
        ],
      },
      {
        id: 'q2',
        text: 'The message says "only three minutes left, hurry". Why does it say that?',
        options: [
          {
            id: 'a',
            text: 'To help me, so I do not miss out.',
            correct: false,
            feedback:
              'A rush is not there to help you. It is there to stop you thinking. Slow down and the trick usually falls apart.',
          },
          {
            id: 'b',
            text: 'To rush me so I do not stop and think.',
            correct: true,
            feedback: 'That is it. Anything that pushes you to hurry is a sign to slow right down.',
          },
        ],
      },
      {
        id: 'q3',
        text: 'Someone you do not know asks for your home address. What do you do?',
        options: [
          {
            id: 'a',
            text: 'Send it, they seem friendly.',
            correct: false,
            feedback:
              'Friendly words are easy to type. Your address is yours, and a stranger never needs it.',
          },
          {
            id: 'b',
            text: 'Keep it to myself and tell an adult I trust.',
            correct: true,
            feedback: 'Yes. Your address stays locked, just like in Passworld.',
          },
        ],
      },
      {
        id: 'q4',
        text: 'A new online friend asks you to keep your chats a secret from your family. Is that okay?',
        options: [
          {
            id: 'a',
            text: 'Yes, secrets between friends are normal.',
            correct: false,
            feedback:
              'Someone asking you to hide a whole friendship from your family is the biggest warning sign there is.',
          },
          {
            id: 'b',
            text: 'No. I will tell an adult I trust.',
            correct: true,
            feedback:
              'Right. Anyone who wants to be kept secret from your grown-ups is someone to tell a grown-up about.',
          },
        ],
      },
      {
        id: 'q5',
        text: 'A message says, "Hi, it is your friend from school." How do you know it really is?',
        options: [
          {
            id: 'a',
            text: 'It says so, so it must be.',
            correct: false,
            feedback:
              'Words in a message are easy to fake. In the fog you cannot see who is really typing.',
          },
          {
            id: 'b',
            text: 'I check in person or ask an adult. I cannot be sure from the message alone.',
            correct: true,
            feedback:
              'Good. When you cannot see who is talking, check another way before you trust it.',
          },
        ],
      },
    ],
  },

  rule: {
    who: 'Comet',
    text: 'Here is the rule for the Peaks. You cannot see through fog, so do not guess. Watch for a message that rushes you, promises you a prize, asks where you live, or asks you to keep a secret from your grown-ups. If you see any of these, stop. Do not reply. Show an adult you trust.',
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
      text: 'Privacy Peaks. Some of the fog up here has learned to sound very official. That does not make it real.',
    },
    {
      who: '"Atlas Security"',
      text: 'Warning: we have seen unusual activity on your account. Confirm who you are within 24 hours or your account will be closed for good. Tap here to type your password.',
    },
  ],

  decision: {
    prompt: 'It looks official. There is a logo, a warning sign and a countdown. What do you do?',
    options: [
      {
        id: 'verify',
        text: 'Tap the link and type your password to confirm, before the time runs out.',
        tag: 'Option A',
        safe: false,
        who: 'Comet',
        response:
          'The fog swallows the path. Real services almost never threaten to lock you out in a day, and they never ask you to type your password into a link. A logo and a scary warning are the easiest parts to copy. Let us look again.',
      },
      {
        id: 'pause',
        text: '"A real warning would not rush me. I will open the app myself and check, not through this link."',
        tag: 'Option B',
        safe: true,
        who: 'Comet',
        response:
          'You open the Atlas app the normal way. There is no warning there at all. The fog wants you to tap before you check. Slowing down is all it takes.',
      },
    ],
  },

  game: {
    type: 'steppingstones',
    title: 'Clear the Fog',
    instruction:
      'Six stones, six messages, one at a time. Step on the ones that are safe. Skip the ones with a warning sign. These are trickier than before. Looking official does not make something official.',
    stones: [
      {
        id: 'q1',
        text: '"Your order has shipped. No action needed."',
        flag: false,
        note: 'No link, no rush, nothing asked of you. Safe to step on.',
      },
      {
        id: 'q2',
        text: '"Warning: confirm within 24 hours or lose your account. Tap here."',
        flag: true,
        note: 'A countdown and a threat, both there to rush you past thinking. Skip it.',
      },
      {
        id: 'q3',
        text: '"This is the Atlas Team. Please confirm your password to continue."',
        flag: true,
        note: 'No real team needs your password typed into a message. Skip it.',
      },
      {
        id: 'q4',
        text: '"Reminder: your library book is due on Friday."',
        flag: false,
        note: 'Ordinary and dull, and nothing is asked of you. Not everything official looking is a trick. Step on it.',
      },
      {
        id: 'q5',
        text: 'atlas-security-verify.free-rewards.net',
        flag: true,
        note: 'Look at the address itself, not the words around it. That is not where the real Atlas lives. Skip it.',
      },
      {
        id: 'q6',
        text: '"Hi, it is your teacher. Can you send me your login so I can check your account?"',
        flag: true,
        note: 'A real teacher can check your account their own way. They never need your password. Skip it.',
      },
    ],
  },

  rule: {
    who: 'Comet',
    text: 'Here is the rule for the Peaks. Some tricks look very real. Logos, official words, countdowns: none of that is proof. The sign is always the same. They rush you, and they ask for something a real message never would, like a password or a tap on a link. Not sure? Check the official way yourself, and tell an adult you trust.',
  },
};

/* ------------------------------------------------------------------------ */
/* Realm 3 — Bully Bog                                                      */
/* ------------------------------------------------------------------------ */

/**
 * Bully Bog runs the *same* scenario for both bands — Pockets is singing, a
 * mean comment lands, others are watching, you choose whether to join in or
 * stand up, then sort replies. Only the wording changes: `bullybogLower` is
 * kept very short for P1–P3, `bullybogHigher` fills the sentences out a
 * little for P4–P6 without getting long. Structure, ids, decision and game
 * items are identical.
 */
const bullybogLower = {
  story: [
    {
      who: 'Comet',
      text: `Bully Bog. What people post about someone shows up in the water here. ${COMET_CATCHPHRASE}`,
    },
    {
      who: 'Pockets the frog',
      text: 'Ribbit-a-doo... oh, hello! I am just practising my song.',
    },
    {
      who: 'A comment appears',
      text: '"Nobody wants to hear this. Go away."',
    },
    {
      who: 'Comet',
      text: 'Pockets has stopped singing. Two others are typing, and looking at you.',
    },
  ],

  decision: {
    prompt: 'The water is going dark. What do you type?',
    options: [
      {
        id: 'joinin',
        text: '"Yes, that is bad."',
        tag: 'Option A',
        safe: false,
        who: 'Comet',
        response:
          'The water goes darker. Pockets sinks lower. Those words sting. Shall we try a kinder reply?',
      },
      {
        id: 'standup',
        text: '"That is not kind. I love your song, Pockets."',
        tag: 'Option B',
        safe: true,
        who: 'Pockets the frog',
        response:
          'Oh! You do? The water is going clear, right where you typed. Thank you, Traveller.',
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
        'One more thing. This stays online for good. Would you be happy for that? Posts do not really go away.',
      accept: 'Good point.',
      followUp: 'Good habit. Ask if it is kind. Then ask if you would still be happy with it next year.',
    },
    tellSomeone: {
      who: 'Comet',
      prompt:
        'You did this one yourself. But you do not have to. If the water got much darker, which grown-up would you tell?',
      options: [
        { id: 'parent', text: 'A parent or family member' },
        { id: 'teacher', text: 'A teacher' },
        { id: 'other-adult', text: 'Another trusted adult' },
      ],
      response:
        'Good answer. Asking for help matters as much as being kind. Know who to tell before you need to.',
    },
  },

  game: {
    type: 'sort',
    title: 'Clear the Water',
    instruction: 'Replies people could send Pockets. Which would you send, and which would sting?',
    bins: [
      { id: 'send', title: 'Send It', sub: 'Kind, or just fine', icon: 'send' },
      { id: 'leave', title: 'Leave It', sub: 'This would hurt', icon: 'trash' },
    ],
    items: [
      { id: 'c1', text: '"I love your song, Pockets!"', bin: 'send' },
      { id: 'c2', text: '"Do you want to sing the next one together?"', bin: 'send' },
      { id: 'c3', text: '"That is brave. Nice one."', bin: 'send' },
      { id: 'c4', text: '"I am here if you want to talk."', bin: 'send' },
      { id: 'c5', text: '"Nobody wants to hear this."', bin: 'leave' },
      { id: 'c6', text: '"That is so bad."', bin: 'leave' },
      { id: 'c7', text: '"We are not inviting you next time."', bin: 'leave' },
      { id: 'c8', text: '"Everyone agrees with me, by the way."', bin: 'leave' },
    ],
  },

  rule: {
    who: 'Comet',
    text: 'If it is ever about you, not Pockets, the rule is the same. Do not be mean back. Save it, and show an adult you trust. Standing up can be one kind sentence.',
  },
};

/**
 * P4–P6 — the same Bully Bog scenario as `bullybogLower`, just with fuller
 * sentences. Not a harder level: this game is played once, so P4–P6 pupils
 * meet the scenario for the first time here too.
 */
const bullybogHigher = {
  story: [
    {
      who: 'Comet',
      text: `Bully Bog. Whatever people post about someone shows up in the water here. ${COMET_CATCHPHRASE}`,
    },
    {
      who: 'Pockets the frog',
      text: 'Ribbit-a-doo, ribbit-a-day... oh, hello! Sorry, I am just practising my song. I do it a lot.',
    },
    {
      who: 'A comment appears',
      text: '"Nobody wants to hear this. Go away."',
    },
    {
      who: 'Comet',
      text: 'Pockets has stopped singing. Two other bog creatures are typing, and now they are watching to see what you will do.',
    },
  ],

  decision: {
    prompt: 'The water is turning darker. Going along with the others is easier than being the one who does not. What do you type?',
    options: [
      {
        id: 'joinin',
        text: '"Yes, that is bad."',
        tag: 'Option A',
        safe: false,
        who: 'Comet',
        response:
          'The water turns darker, and Pockets sinks a little lower. "Everyone else said it too" does not make those words any lighter for the one reading them. Shall we try a kinder reply?',
      },
      {
        id: 'standup',
        text: '"That is not kind. I love your song, Pockets."',
        tag: 'Option B',
        safe: true,
        who: 'Pockets the frog',
        response:
          'Oh. You do? Nobody usually says that. The water is clearing, right where you typed. Thank you, Traveller.',
      },
    ],
  },

  extraBeats: {
    footprint: {
      who: 'Comet',
      prompt:
        'One more thing, before this goes up for good. Would you be happy for it to stay online forever? Posts do not really disappear, even the kind ones.',
      accept: 'Good point.',
      followUp:
        'A good habit to keep. First ask if it is kind. Then ask if you would still stand by it next year.',
    },
    tellSomeone: {
      who: 'Comet',
      prompt:
        'You handled this one yourself, but you do not always have to. If it ever got bigger than you could deal with alone, which grown-up would you tell?',
      options: [
        { id: 'parent', text: 'A parent or family member' },
        { id: 'teacher', text: 'A teacher' },
        { id: 'other-adult', text: 'Another trusted adult' },
      ],
      response:
        'Good answer. Telling a grown-up is part of standing up too, just as much as the comment you send.',
    },
  },

  game: {
    type: 'sort',
    title: 'Clear the Water',
    instruction:
      'Replies people could send Pockets. Sort each one, then pick the pile you would add to. Which would you send, and which would sting?',
    bins: [
      { id: 'send', title: 'Send It', sub: 'Kind, or just fine', icon: 'send' },
      { id: 'leave', title: 'Leave It', sub: 'This would hurt', icon: 'trash' },
    ],
    items: [
      { id: 'c1', text: '"I love your song, Pockets!"', bin: 'send' },
      { id: 'c2', text: '"Do you want to sing the next one together?"', bin: 'send' },
      { id: 'c3', text: '"That is brave. Nice one."', bin: 'send' },
      { id: 'c4', text: '"I am here if you want to talk."', bin: 'send' },
      { id: 'c5', text: '"Nobody wants to hear this."', bin: 'leave' },
      { id: 'c6', text: '"That is so bad."', bin: 'leave' },
      { id: 'c7', text: '"We are not inviting you next time."', bin: 'leave' },
      { id: 'c8', text: '"Everyone agrees with me, by the way."', bin: 'leave' },
    ],
  },

  rule: {
    who: 'Comet',
    text: 'And if it is ever about you, not Pockets, the rule is the same. Do not reply to be mean back. Save it, show an adult you trust, and use block or report if you need to. Standing up for someone can be one kind sentence, and it counts most when other people are watching.',
  },
};

/* ------------------------------------------------------------------------ */
/* Realm 4 — Balance Bay                                                    */
/* ------------------------------------------------------------------------ */
/**
 * Balance Bay runs the *same* walkable beach for both bands
 * (components/BalanceBeachRealm.jsx, via `fullMechanic: 'balanceBeach'` on
 * the realm below): walk the sand picking activities up for one evening
 * while a seesaw tips. There is no branching choice and no Glimmer
 * character. Only the wording changes: `balanceLower` is very short for
 * P1–P3; `balanceHigher` says a little more for P4–P6 (noticing how screen
 * time feels, not just how long) without getting long. Same ten activity
 * cards, same verdict thresholds.
 */

const balanceLower = {
  story: [
    {
      who: 'Comet',
      text: `Balance Bay, the last realm. This one is about balancing your time, especially time on screens. ${COMET_CATCHPHRASE}`,
    },
    {
      who: 'Comet',
      text: 'Screens are fun. But a day only has so many hours, and screens can take up more than you mean to give.',
    },
    {
      who: 'Comet',
      text: 'Let us plan one evening. Six hours between school and bed. Fill them in, and watch the seesaw.',
    },
  ],

  game: {
    type: 'balance',
    title: 'Balance the Day',
    instruction:
      'Fill the six hours between school and bed. Add something, or tap it in your list to take it back. Watch how the seesaw sits.',
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
        'The seesaw tipped right over. A day of only screens leaves no room for the rest of you. Swap one or two out.',
      noScreen:
        'The seesaw tipped the other way. You do not have to cut screens out completely. Add one back in.',
      level: 'The seesaw is level. Some screen time, plenty of everything else. That is it.',
    },
  },

  rule: {
    who: 'Comet',
    text: 'The rule for the Bay. Screens are not bad. Losing track of time is. Decide when you will stop before you start. Leave room for sleep, playing, and real people.',
  },
};

const balanceHigher = {
  story: [
    {
      who: 'Comet',
      text: `Balance Bay, the last realm. This one is about balancing your time, especially the time you spend on screens. ${COMET_CATCHPHRASE}`,
    },
    {
      who: 'Comet',
      text: 'Screens are fun, and that is fine. But the day only has so many hours, and they can quietly take up more than you meant to give. School, hobbies, family and sleep all need room too.',
    },
    {
      who: 'Comet',
      text: 'Plan one evening: six hours between school and bed. As you fill them, notice which parts you would look forward to, and which you would just fall into. Then watch the seesaw.',
    },
  ],

  game: {
    type: 'balance',
    title: 'Balance the Day',
    instruction:
      'Fill the six hours between school and bed. Add something, or tap it in your list to take it back. Notice which parts you would look forward to, and watch how the seesaw sits.',
    slots: 6,
    items: balanceLower.game.items,
    verdicts: {
      allScreen:
        'The seesaw tipped right over. Be honest: does a day of only screens feel good, or just familiar? It does not leave room to find out.',
      noScreen:
        'The seesaw tipped the other way. Zero screens is not the goal either. Screens can be one of the good things. Add one back in.',
      level:
        'The seesaw is level. Probably because some of this sounds good to choose, not just easy to fall into. That is the real skill: noticing, not counting.',
    },
  },

  rule: {
    who: 'Comet',
    text: 'The rule for the Bay. Screens are not bad, and losing track of time is the real problem. As you get older, it helps to notice how screen time feels, not just how long it lasts. Decide when you will stop before you start, and leave room for sleep, hobbies and real people.',
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
 * School revision pass: the rumour about Mia now spreads online (a forwarded
 * screenshot/post) rather than by word of mouth, and both bands teach
 * through a plain 5-question Q&A (`game.type: 'quiz'`,
 * minigames/MiniGameQuiz.jsx) instead of the Spot/Sort pile the school
 * found confusing. The lessons cover source-checking, "looks real vs is
 * real", edited / AI-made picture tells, and does-it-add-up evaluation,
 * consistent with the S.U.R.E. framework the Overview Plan names.
 *
 * The official "3 tips to CHECK real vs. digitally-altered content" (the
 * SLS package's specific bullet list) was never sourced; the general,
 * well-established media-literacy signals used here are easy to swap for the
 * verbatim wording once it surfaces.
 */

const fableFallsLower = {
  story: [
    {
      who: 'Comet',
      text: `Fable Falls. Every story in the Atlas ends up in this water. Some of it true, some of it made up. ${COMET_CATCHPHRASE}`,
    },
    {
      who: 'The Echo',
      text: 'Have you seen this? Someone posted that Mia got caught taking snacks from the canteen. It is a screenshot, and it already has loads of shares. Everyone is passing it on.',
    },
  ],

  decision: {
    prompt: 'The Echo wants you to share the post too. What do you do?',
    options: [
      {
        id: 'spread',
        text: 'Share it. It has so many shares already, so it must be true.',
        tag: 'Option A',
        safe: false,
        who: 'Comet',
        response:
          'The post tumbles further down the Falls, growing a little bigger each time. Lots of shares only tells you a story has spread, not that it is true. Shall we look again?',
      },
      {
        id: 'stopcheck',
        text: '"I will stop. Then I will check with an adult I trust, or look for it somewhere real, before I believe it or share it."',
        tag: 'Option B',
        safe: true,
        who: 'Comet',
        response:
          'The water goes still and clear where you stand. It turns out Mia is not in trouble at all. She is counting snacks for the class party. One pause stops a rumour from growing.',
      },
    ],
  },

  game: {
    type: 'quiz',
    title: 'Check Before You Share',
    instruction:
      'A few more things about the post reach you. Decide what to do with each one, the way you decided with the Echo.',
    questions: [
      {
        id: 'q1',
        text: 'The post is a screenshot with no name on it. Who actually said this first?',
        options: [
          {
            id: 'a',
            text: 'It does not matter, lots of people shared it.',
            correct: false,
            feedback:
              'If nobody can tell you where a story started, that is a reason to doubt it, not to pass it on.',
          },
          {
            id: 'b',
            text: 'Nobody can say, so I should not trust it yet.',
            correct: true,
            feedback: 'Right. A story with no clear start is one to check, not share.',
          },
        ],
      },
      {
        id: 'q2',
        text: 'The post has hundreds of shares. Does that make it true?',
        options: [
          {
            id: 'a',
            text: 'Yes, that many people cannot be wrong.',
            correct: false,
            feedback:
              'Shares only show how far something has travelled. A wrong story can travel just as fast as a true one, often faster.',
          },
          {
            id: 'b',
            text: 'No, it just means it has spread a lot.',
            correct: true,
            feedback: 'Exactly. Popular and true are not the same thing.',
          },
        ],
      },
      {
        id: 'q3',
        text: 'You want to know if the snack story is real. What is the best thing to do?',
        options: [
          {
            id: 'a',
            text: 'Ask the group chat what they think.',
            correct: false,
            feedback:
              'The group chat is where the rumour is already spreading. Asking there just adds to it.',
          },
          {
            id: 'b',
            text: 'Ask a teacher or another adult I trust.',
            correct: true,
            feedback:
              'Yes. A trusted adult can find out the real story, and telling one is never the wrong move.',
          },
        ],
      },
      {
        id: 'q4',
        text: 'The screenshot has a photo of Mia, but one edge looks stretched and blurry. What does that tell you?',
        options: [
          {
            id: 'a',
            text: 'Nothing, photos look odd sometimes.',
            correct: false,
            feedback:
              'Sometimes they do, but a stretched or smudged patch can also mean a picture has been changed. It is a reason to look closer.',
          },
          {
            id: 'b',
            text: 'The picture might have been changed, so I should look closer.',
            correct: true,
            feedback:
              'Good eye. Odd edges, blurry patches and strange shadows are all signs a picture may not be real.',
          },
        ],
      },
      {
        id: 'q5',
        text: 'A friend says, "just share it, you can always say sorry later." What do you think?',
        options: [
          {
            id: 'a',
            text: 'Fair enough, sorry fixes it.',
            correct: false,
            feedback:
              'Once a story is shared it keeps going, even after you say sorry. The embarrassment for Mia does not disappear.',
          },
          {
            id: 'b',
            text: 'No. It is easier to check first than to fix it after.',
            correct: true,
            feedback: 'That is it. Checking takes a minute. Undoing a rumour can take a lot longer.',
          },
        ],
      },
    ],
  },

  rule: {
    who: 'Comet',
    text: 'Here is the rule for Fable Falls. Not everything that reaches you is true, even a post that lots of people have shared. Stop before you believe or share something surprising or upsetting. Check it: ask an adult you trust, or find it somewhere real, before you pass it on.',
  },
};

/**
 * P4–P6 — the S.U.R.E. framework, styled as the Cyber Defender Quest. The
 * five quiz questions walk the four letters in order (Source, Understand,
 * Research, then two Evaluate questions: one on picture/video tells, one on
 * plausibility), so the framework is taught through practice rather than a
 * lecture for each letter.
 */
const fableFallsHigher = {
  story: [
    {
      who: 'Comet',
      text: 'Fable Falls. A video is going round. It puts words in a classmate\'s mouth, and it looks almost real.',
    },
    {
      who: 'The Echo',
      text: 'Watch this, I am sharing it first! It is definitely real, look how real it looks. Everyone needs to see it before it gets taken down.',
    },
  ],

  decision: {
    prompt: 'The Echo wants you to share the video now, before you have really looked. What do you do?',
    options: [
      {
        id: 'shareNow',
        text: 'Share it now. It looks real, and everyone else is sharing it.',
        tag: 'Option A',
        safe: false,
        who: 'Comet',
        response:
          'It spreads fast, and so does the embarrassment for the classmate once it turns out to be fake. "Looks real" and "is real" are not the same thing. And "before it gets taken down" is the kind of rush that is built to stop you thinking. Shall we look again?',
      },
      {
        id: 'sure',
        text: '"I will run it through S.U.R.E. first: Source, Understand, Research, Evaluate. Then I will decide."',
        tag: 'Option B',
        safe: true,
        who: 'Comet',
        response:
          'Good call. Four questions, in order. Where does it come from? What is it really claiming? Can you find it anywhere you trust? Does it add up? That is the whole method, and it is faster than clearing up the mess afterwards.',
      },
    ],
  },

  game: {
    type: 'quiz',
    title: 'Run It Through S.U.R.E.',
    instruction:
      'Five things you notice about the video. For each one, decide whether it points to fake, or holds up. Use S.U.R.E. as you go.',
    questions: [
      {
        id: 'q1',
        text: 'Source. The account that posted the video was made yesterday and has no other posts. What does that suggest?',
        options: [
          {
            id: 'a',
            text: 'Nothing, plenty of new accounts are fine.',
            correct: false,
            feedback:
              'New accounts are fine on their own. But a brand new account with no history, posting something dramatic, is a classic sign of a fake.',
          },
          {
            id: 'b',
            text: 'It is a weak source, so I should be careful.',
            correct: true,
            feedback: 'Yes. Source is the S in S.U.R.E. Who is behind this, and is there any reason to trust them?',
          },
        ],
      },
      {
        id: 'q2',
        text: 'Understand. The caption says the classmate "admitted everything". The video only shows them talking for two seconds. What is going on?',
        options: [
          {
            id: 'a',
            text: 'The caption fills in the rest, that is normal.',
            correct: false,
            feedback:
              'A caption that claims far more than the video actually shows is trying to tell you what to think. Go by what you can see, not what you are told.',
          },
          {
            id: 'b',
            text: 'The caption claims much more than the video shows, so I should not trust it.',
            correct: true,
            feedback:
              'Right. Understand means working out what is really being claimed, and whether the evidence matches.',
          },
        ],
      },
      {
        id: 'q3',
        text: 'Research. You search online and find nothing about this on any news site or school page. What does that mean?',
        options: [
          {
            id: 'a',
            text: 'It is too new to be reported yet.',
            correct: false,
            feedback:
              'Real, big news usually shows up in more than one trusted place quickly. Finding nothing is a strong sign it did not happen.',
          },
          {
            id: 'b',
            text: 'If nowhere I trust has it, that points to fake.',
            correct: true,
            feedback:
              'Yes. Research means checking whether anyone reliable is saying the same thing, on their own.',
          },
        ],
      },
      {
        id: 'q4',
        text: 'Evaluate. Watching closely, the mouth does not quite match the words and the lighting jumps partway through. What does that tell you?',
        options: [
          {
            id: 'a',
            text: 'Videos glitch, it is probably fine.',
            correct: false,
            feedback:
              'A mouth that is out of sync, jumpy lighting, blurry edges, or hands that look wrong are all common signs a video has been edited or made by a computer.',
          },
          {
            id: 'b',
            text: 'Those are signs the video may be edited or AI made.',
            correct: true,
            feedback:
              'Good eye. Those small mismatches are some of the easiest tells that a video is not real.',
          },
        ],
      },
      {
        id: 'q5',
        text: 'Evaluate. The video is dramatic, perfectly timed, and makes one person look very bad. How does that sit with you?',
        options: [
          {
            id: 'a',
            text: 'Dramatic means important, so I should share it.',
            correct: false,
            feedback:
              'Something built to shock you is built to be shared before you think. That is the moment to slow down, not speed up.',
          },
          {
            id: 'b',
            text: 'Too perfect and too shocking is a reason to doubt it.',
            correct: true,
            feedback:
              'Exactly. If something seems designed to make you react fast, treat that as a warning, not proof.',
          },
        ],
      },
    ],
  },

  rule: {
    who: 'Comet',
    text: 'Use S.U.R.E. every time something makes you want to react fast. Source: who posted this, and do you trust them? Understand: what is it actually claiming? Research: can you find it confirmed somewhere you trust? Evaluate: does it add up, or is it a bit too perfect, too shocking, too convenient? Four questions is usually enough to catch a fake.',
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
        'Who is safe to share secrets with, and who is not',
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
    blurb: 'Misty mountain lookouts where you cannot quite see who is talking.',
    topic: 'Strangers & tricks online',
    stamp: { icon: 'compass', label: 'Privacy Peaks · Visited' },
    enabled: true,
    intro: {
      lore: 'High in Privacy Peaks the fog rolls in thick. Through it, you can never quite see who you are talking to. Friendly voices drift out of the mist with gifts and promises. But some of the shapes in the fog are not what they say they are.',
      learn: [
        'Why you cannot always tell who is really behind a message',
        'How to spot an offer that is too good to be true',
        'What to do when a stranger messages you online',
      ],
      learnShort: 'Learn: spotting strangers & online tricks',
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
    blurb: 'Murky water that shows whatever gets posted about the folk who live here.',
    topic: 'Cyberbullying & kindness',
    stamp: { icon: 'heart', label: 'Bully Bog · Visited' },
    enabled: true,
    intro: {
      lore: 'The bog\'s still water shows every word posted about the folk who live here. Lately the ponds have turned murky, because unkind comments sink in and cloud everything. Pockets the frog sits alone in the murkiest one. The bog needs someone who can clear the water.',
      learn: [
        'How unkind words online really make other people feel',
        'What you can do when you see someone being bullied',
        'When to report, block, and tell an adult you trust',
      ],
      learnShort: 'Learn: kindness online & standing up to bullying',
    },

    world: {
      spawn: { x: 10, y: 88 },
      // Pin positions hand-placed against the pond art: Pockets sits in the
      // right-hand pond (story / decision / rule all talk to Pockets there),
      // and the murky water to clear is the left-hand pond.
      bounds: { minX: 5, maxX: 92, minY: 70, maxY: 92 },
      stops: {
        story: { x: 72, y: 69, label: 'Pockets the frog', action: 'Listen' },
        decision: { x: 72, y: 69, label: 'the comment', action: 'Respond' },
        game: { x: 26, y: 73, label: 'the murky water', action: 'Clear it' },
        rule: { x: 72, y: 69, label: 'Pockets the frog', action: 'Talk' },
      },
    },

    // Both bands run the same scenario / mechanic (see the bullybog objects
    // above); only the wording is shorter for P1–P3.
    bands: { lower: bullybogLower, higher: bullybogHigher },
  },

  {
    id: 'balance',
    name: 'Balance Bay',
    accent: 'var(--periwinkle)',
    accentWash: 'rgba(123, 110, 246, 0.13)',
    blurb: 'A calm beach at the end of the Atlas, for weighing up screens against everything else in your day.',
    topic: 'Screen time balance',
    stamp: { icon: 'sun', label: 'Balance Bay · Visited' },
    enabled: true,
    // Both bands run the walkable beach (components/BalanceBeachRealm.jsx):
    // the Traveler walks around the sand picking activities up while a real
    // seesaw (world/beach/BeachScene.jsx) tips. Realm-level so the spread in
    // bandViewRaw carries it to both bands.
    fullMechanic: 'balanceBeach',
    intro: {
      lore: 'Balance Bay is a quiet beach. It is a good place to stop and think about how your day is split. How much time goes to screens, and how much is left for school, hobbies, family and rest. Getting that balance right is a skill, and this is where you practice it.',
      learn: [
        'How screen time can take up more of your day than you notice',
        'How to tell when screen time feels good, and when it just fills time',
        'How to plan a day that balances screens with school, hobbies and rest',
      ],
      learnShort: 'Learn: balancing screen time',
    },

    // `world` is unused for this realm now that `fullMechanic: 'balanceBeach'`
    // delegates the whole flow to BalanceBeachRealm (which carries its own
    // SPAWN / BOUNDS / activity spots), but the key is kept so anything that
    // reads `realm.world` defensively still finds an object.
    world: {
      spawn: { x: 8, y: 88 },
      bounds: { minX: 5, maxX: 93, minY: 74, maxY: 93 },
      stops: {
        story: { x: 58, y: 78, label: 'the water', action: 'Stop here' },
        game: { x: 50, y: 78, label: 'the seesaw', action: 'Plan the day' },
        rule: { x: 78, y: 88, label: 'the bonfire', action: 'Sit down' },
      },
    },

    // higher: same seesaw, reframed around noticing how screen time feels
    // rather than just counting hours.
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
    blurb: 'A waterfall of stories and posts, where some of what tumbles down turns out to be true, and some does not.',
    topic: 'Fake news & edited pictures',
    stamp: { icon: 'eye', label: 'Fable Falls · Visited' },
    enabled: true,
    reportBlockEligible: true,
    intro: {
      lore: 'Fable Falls is a waterfall of stories. Every post, message and picture on the internet tumbles through here on its way somewhere else. Some of it is true. Some of it only looks true. The Echo lives behind the falls, and can teach you to tell the difference.',
      learn: [
        'How fake news and edited pictures spread so fast online',
        'The questions to ask before you believe a post, or share it',
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
        game: { x: 22, y: 84, label: 'the still water', action: 'Look closer' },
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
  { realm: 'passworld', text: 'I will keep my personal information to myself.' },
  { realm: 'privacy', text: 'I will stop and think before I tap.' },
  { realm: 'bullybog', text: 'I will be kind, and stand up for others.' },
  { realm: 'balance', text: 'I will balance my screen time with the rest of my day.' },
  { realm: 'fablefalls', text: 'I will stop and check before I believe or share.' },
];

/** PLEDGE, filtered to realms that actually exist in the game right now. */
export function activePledge() {
  const activeIds = new Set(ACTIVE_REALMS.map((r) => r.id));
  return PLEDGE.filter((line) => activeIds.has(line.realm));
}
