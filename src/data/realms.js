import { applyOverrides } from '../dev/contentOverrides';

/**
 * All game content, lifted from storyline.md.
 *
 * Tone rules being honoured here (storyline.md "Tone & Writing Guidelines"):
 *  - nothing is a villain; every unsafe pick is a misunderstanding to retry
 *  - Comet asks rather than tells ("let's look again", never "wrong")
 *  - plain words, no jargon ("phishing", "PII") unless explained in kid terms
 *  - school language: full proper English, no short forms ("do not", never
 *    "don't"), no text-speak, no em-dashes. See the writing rules in
 *    CLAUDE.md and design.md, which the client set.
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

  // One follow-up before the sort game: how to make a strong password
  // (P4–P6 learns this in its platformer; P1–P3 had nothing on it).
  extraBeats: {
    strongPassword: {
      who: 'Comet',
      prompt:
        'One thing first. You will need a password for your own vault. Which one would be hardest for someone else to guess?',
      options: [
        { id: 'birthday', text: 'My name and my birthday' },
        { id: 'pet', text: "My pet's name" },
        { id: 'words', text: 'Three random words joined up, like BlueTigerMoon' },
      ],
      response:
        'Three random words wins. It is long, and it is not about you, so nobody can guess it from what they know. A name or a birthday is the easiest to crack.',
    },
  },

  game: {
    type: 'sort',
    title: 'Guard the Vault',
    instruction:
      'These are the things Vex asked you for, and a few more. Put each one where it belongs. Which stay locked away, and which are fine to share?',
    // The method, on screen the whole time you play. P1–P3 read the three
    // questions and sort by them; they aren't asked to *name* which one an
    // item fails (`nameTheCheck`), that step is P4–P6's, in `privacyCheck`
    // on the higher band below.
    purpose: {
      name: 'The Three Questions',
      why: 'Ask these before you tell anyone anything.',
      checks: [
        { key: 'F', name: 'Find', sub: 'Could this help someone find me?' },
        { key: 'U', name: 'Unlock', sub: 'Could this unlock something of mine?' },
        { key: 'P', name: 'Pretend', sub: 'Could someone pretend to be me with it?' },
      ],
    },
    bins: [
      { id: 'locked', title: 'Keep It Locked', sub: 'Only for me and my family', icon: 'lock' },
      { id: 'share', title: 'Safe to Share', sub: 'Fine for other people to know', icon: 'unlock' },
    ],
    // Nine of these fourteen come up each time, drawn fresh every run
    // (lib/draw.js) so one blind attempt can't buy a clean one on memory.
    roundSize: 9,
    items: [
      { id: 'address', text: 'My home address', bin: 'locked', check: 'F' },
      { id: 'fullname', text: 'My full name', bin: 'locked', check: 'P' },
      { id: 'school', text: 'The school I go to', bin: 'locked', check: 'F' },
      { id: 'password', text: 'My password', bin: 'locked', check: 'U' },
      { id: 'phone', text: 'My phone number', bin: 'locked', check: 'F' },
      { id: 'birthday', text: 'The day I was born', bin: 'locked', check: 'P' },
      { id: 'mumphone', text: "My mum's phone number", bin: 'locked', check: 'F' },
      { id: 'secret', text: 'The answer to my secret question', bin: 'locked', check: 'U' },
      { id: 'colour', text: 'My favourite colour', bin: 'share' },
      { id: 'game', text: 'The game I like most', bin: 'share' },
      { id: 'nickname', text: 'My nickname', bin: 'share' },
      { id: 'hobby', text: 'That I like drawing', bin: 'share' },
      { id: 'food', text: 'My favourite food', bin: 'share' },
      { id: 'animal', text: 'My favourite animal', bin: 'share' },
    ],
  },

  // The realm's real-world rule, stated once and plainly (storyline.md).
  rule: {
    who: 'Comet',
    text: 'Here is the rule for the whole Atlas. Your name, your address, your school and your passwords stay locked. Your favourite colour, your nickname and the games you love are fine to share. A strong password is long, and not about you. And a real grown-up will never need it. Not for anything.',
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
    // The door's method, shown beside the keypad while you choose (L.M.N.).
    purpose: {
      name: 'L.M.N.',
      why: 'Three things every strong password piece has to survive.',
      checks: [
        { key: 'L', name: 'Long', sub: 'Enough pieces to be long' },
        { key: 'M', name: 'Mixed', sub: 'Letters, numbers and symbols' },
        { key: 'N', name: 'Not me', sub: 'Not about me, not a real word' },
      ],
    },
    // Six real, six decoy, but *not* sortable on shape. The old set was six
    // single characters against six recognisable English words, so a player
    // could clear the door on silhouette alone without reading a tile
    // (thingstoimproveon.md, "the vault door"). Now one real piece is
    // word-shaped nonsense (`Zub`) and two decoys are short and symbol-ish
    // (`abc`, a keyboard run; `Pockets`, a pet name, "not about me"), so the
    // tile has to be read against L.M.N. rather than classified by length.
    tiles: [
      { id: 'letter', type: 'letter', label: 'A', kind: 'real', x: 621, y: 95 },
      { id: 'number', type: 'number', label: '7', kind: 'real', x: 1179, y: 91 },
      { id: 'symbol', type: 'symbol', label: '#', kind: 'real', x: 1622, y: 43 },
      { id: 'letter2', type: 'letter', label: 'Zub', kind: 'real', x: 2185, y: 51 },
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
      { id: 'decoy4', label: 'abc', kind: 'decoy', x: 1731, y: 99 },
      { id: 'decoy5', label: 'Pockets', kind: 'decoy', x: 1400, y: 245 },
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

  // A short Sort after the vault run (PlatformerStoryRealm's 'check' step) —
  // the "what counts as personal information" lesson P1–P3 gets from its own
  // sort game, pitched at the older band: things that seem harmless but give
  // you away, mostly in combination (uniform + routine, real name as a
  // handle, birthday for security questions, location tags).
  privacyCheck: {
    type: 'sort',
    title: 'Before You Post',
    instruction:
      'Some of these seem harmless. Sort each one, then say which of the three questions it falls foul of.',
    // Same three questions P1–P3 sort by, but this band has to *name* the one
    // an item fails (`nameTheCheck`), which is the move that turns "pick a
    // bin" into a judgement you could carry to a post the game never showed
    // you (thingstoimproveon.md, "The purpose question").
    purpose: {
      name: 'The Three Questions',
      why: 'Ask these before anything of yours goes up.',
      nameTheCheck: true,
      prompt: 'Which question does this one fall foul of?',
      checks: [
        { key: 'F', name: 'Find', sub: 'Could this help someone find me?' },
        { key: 'U', name: 'Unlock', sub: 'Could this unlock an account of mine?' },
        { key: 'P', name: 'Pretend', sub: 'Could someone pretend to be me with it?' },
      ],
    },
    bins: [
      { id: 'post', title: 'Safe to Post', sub: 'Gives nothing away', icon: 'unlock' },
      { id: 'private', title: 'Keep Private', sub: 'Could give you away', icon: 'lock' },
    ],
    roundSize: 8,
    items: [
      { id: 'tag', text: 'My gamer tag', bin: 'post' },
      { id: 'drawing', text: 'A drawing I made', bin: 'post' },
      { id: 'band', text: 'My favourite band', bin: 'post' },
      { id: 'dinner', text: 'A photo of my dinner', bin: 'post' },
      { id: 'opinion', text: 'What I thought of a film', bin: 'post' },
      {
        id: 'realname',
        text: 'My real full name as my username',
        bin: 'private',
        check: 'P',
        checkNote: 'A real name as a handle lets someone find the rest of you, and pose as you.',
      },
      {
        id: 'uniform',
        text: 'A photo of me in my school uniform',
        bin: 'private',
        check: 'F',
        checkNote: 'A uniform names your school to anyone who recognises it.',
      },
      {
        id: 'location',
        text: 'A photo with the place tagged on it',
        bin: 'private',
        check: 'F',
        checkNote: 'The tag is the map. It says exactly where you were, and probably where you go.',
      },
      {
        id: 'birthday',
        text: 'My full date of birth',
        bin: 'private',
        check: 'U',
        checkNote: 'A date of birth is half of most "prove it is really you" questions.',
      },
      {
        id: 'routine',
        text: 'That I walk home alone at the same time every day',
        bin: 'private',
        check: 'F',
        checkNote: 'A routine tells someone where to wait. That is the whole risk.',
      },
      {
        id: 'door',
        text: 'A photo out my front door with the house number in it',
        bin: 'private',
        check: 'F',
        checkNote: 'One number in the background is enough to turn a street into an address.',
      },
      {
        id: 'firstpet',
        text: 'The name of my first pet',
        bin: 'private',
        check: 'U',
        checkNote: 'That is a security question on half the internet. Answering it in public hands it over.',
      },
      {
        id: 'timetable',
        text: 'A screenshot of my school timetable',
        bin: 'private',
        check: 'F',
        checkNote: 'It says where you are, hour by hour, all week.',
      },
    ],
  },

  rule: {
    who: 'Comet',
    text: 'Here is the Passworld rule for older travellers. Accounts are taken over when a password is shared, reused, or easy to guess, so use a different one for everything that matters and never hand yours over. Personal information adds up: a uniform, a location tag and a daily routine together can point a stranger straight to you, so keep those private even when each one feels small. And if a message feels wrong, even from someone you know, check another way first.',
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
      text: 'Hello! You have won a free tablet! Tap this link quickly, before it is gone! Only five minutes left. Also, what is your home address, so we can send it to you?',
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
    // P1–P3 read S.T.O.P. off the track while they answer; naming the check
    // is the older band's job (see `privacyHigher` below).
    purpose: {
      name: 'S.T.O.P.',
      why: 'Four things that give a trick away.',
      checks: [
        { key: 'S', name: 'Sender', sub: 'Do I really know who this is?' },
        { key: 'T', name: 'Tone', sub: 'Is it rushing or scaring me?' },
        { key: 'O', name: 'Offer', sub: 'Is it dangling a prize?' },
        { key: 'P', name: 'Password', sub: 'Does it want a secret of mine?' },
      ],
    },
    // Five of these nine each run (lib/draw.js).
    roundSize: 5,
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
          {
            id: 'c',
            text: 'Ask them to prove the prize is real.',
            correct: false,
            feedback:
              'Replying at all tells them a real person is reading. Do not answer it.',
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
          {
            id: 'c',
            text: 'Because the prize really is about to run out.',
            correct: false,
            feedback:
              'Real things do not need you to hurry past thinking. The clock is the trick.',
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
          {
            id: 'c',
            text: 'Tell them my street but not my house number.',
            correct: false,
            feedback:
              'Half an address is still an address. A stranger needs none of it.',
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
          {
            id: 'c',
            text: 'Only if they are the same age as me.',
            correct: false,
            feedback:
              'You cannot tell how old someone is from a message. That is why the secret is the warning sign.',
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
          {
            id: 'c',
            text: 'Reply and see if they sound like my friend.',
            correct: false,
            feedback:
              'Anyone can copy the way a person types. You cannot tell from inside the message.',
          },
        ],
      },
      {
        id: 'q6',
        text: 'A game sends you a code and says "type this code back to us to prove it is you". What do you do?',
        options: [
          {
            id: 'a',
            text: 'Send the code back. They sent it to me.',
            correct: false,
            feedback:
              'That code is the key to your account. Anyone asking you to pass it on is trying to get in.',
          },
          {
            id: 'b',
            text: 'Keep the code. A code is a secret, like a password.',
            correct: true,
            feedback: 'Yes. Codes are for typing in yourself, never for sending on.',
          },
          {
            id: 'c',
            text: 'Send it if the message has the game\'s logo on it.',
            correct: false,
            feedback:
              'A logo is just a picture. Anyone can paste one in.',
          },
        ],
      },
      {
        id: 'q7',
        text: 'A message says "your library book is due back on Friday". Is that a trick?',
        options: [
          {
            id: 'a',
            text: 'Yes. All messages are tricks.',
            correct: false,
            feedback:
              'Not all of them. This one asks you for nothing and does not rush you. Most messages are ordinary.',
          },
          {
            id: 'b',
            text: 'No. It does not rush me and it does not ask me for anything.',
            correct: true,
            feedback:
              'Good. Being careful is not the same as being scared of everything. Look for the signs, not for messages.',
          },
          {
            id: 'c',
            text: 'Yes, because I do not remember borrowing a book.',
            correct: false,
            feedback:
              'Forgetting is not a warning sign. Look at what it asks of you, which is nothing.',
          },
        ],
      },
      {
        id: 'q8',
        text: 'Someone you have only met in a game wants to chat somewhere else instead. What do you think?',
        options: [
          {
            id: 'a',
            text: 'Fine. We are friends in the game.',
            correct: false,
            feedback:
              'Moving you somewhere quieter is a way of getting you on your own. Tell an adult you trust.',
          },
          {
            id: 'b',
            text: 'I will stay where I am and tell an adult I trust.',
            correct: true,
            feedback: 'Right. Someone wanting you alone somewhere else is a sign to stop.',
          },
          {
            id: 'c',
            text: 'Go, as long as I do not tell them my name.',
            correct: false,
            feedback:
              'Being somewhere quiet on your own with them is the risk, not your name.',
          },
        ],
      },
      {
        id: 'q9',
        text: 'A message has your first name in it. Does that prove it is really from someone who knows you?',
        options: [
          {
            id: 'a',
            text: 'Yes. They knew my name.',
            correct: false,
            feedback: 'Your first name is easy to find. Knowing it proves nothing at all.',
          },
          {
            id: 'b',
            text: 'No. Anyone could find out my name.',
            correct: true,
            feedback: 'Exactly. A name in a message is not proof of anything.',
          },
          {
            id: 'c',
            text: 'Yes, if they know my school as well.',
            correct: false,
            feedback:
              'Both of those are easy to find out. Neither one is proof.',
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
      text: 'Warning: we have seen unusual activity on your account. Confirm who you are within 24 hours or your account will be closed for good. Tap this link to type your password.',
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
      'Step on the ones that are safe. Skip the ones with a warning sign, then say which check caught it. Looking official does not make something official.',
    // Naming the check is what stops this being "skip anything that sounds
    // scary". A stone can trip more than one check, `check` takes an array
    // and any of them counts, so the gate never punishes a right answer for
    // being the second-best one.
    purpose: {
      name: 'S.T.O.P.',
      why: 'Four signs that a message is not what it says it is.',
      nameTheCheck: true,
      prompt: 'Which check caught it?',
      checks: [
        { key: 'S', name: 'Sender', sub: 'Do I actually know who this is?' },
        { key: 'T', name: 'Tone', sub: 'Is it rushing or threatening me?' },
        { key: 'O', name: 'Offer', sub: 'Is it dangling a prize or a reward?' },
        { key: 'P', name: 'Password', sub: 'Does it want a secret, or a tap to type one?' },
      ],
    },
    // Six of these eleven each crossing (lib/draw.js), so a blind run can't
    // be traded for a memorised clean one.
    roundSize: 6,
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
        check: 'T',
        note: 'A countdown and a threat, both there to rush you past thinking. Skip it.',
      },
      {
        id: 'q3',
        text: '"This is the Atlas Team. Send us your One-Time-Password to continue"',
        flag: true,
        check: ['P', 'S'],
        note: 'No real team needs your One-Time-Password typed into a message. Skip it.',
      },
      {
        id: 'q4',
        text: '"Reminder: your library book is due on Friday."',
        flag: false,
        note: 'Ordinary and dull, and nothing is asked of you. Not everything official looking is a trick. Step on it.',
      },
      {
        id: 'q5',
        text: 'atlas.free-rewards.net',
        flag: true,
        check: ['O', 'S'],
        note: 'Look at the address itself, not the words around it. That is not where the real Atlas lives. Skip it.',
      },
      {
        id: 'q6',
        text: '"Hi, it is your teacher. Can you send me your login so I can check your account?"',
        flag: true,
        check: ['S', 'P'],
        note: 'A real teacher can check your account their own way. They never need your password. Skip it.',
      },
      {
        id: 'q7',
        text: '"You are our 1,000,000th visitor! Claim your prize in the next 5 minutes."',
        flag: true,
        check: ['O', 'T'],
        note: 'A prize you never entered for, and a clock on it. Both halves are the trick. Skip it.',
      },
      {
        id: 'q8',
        text: '"Your parcel could not be delivered. Pay 30p here to rebook it."',
        flag: true,
        check: 'P',
        note: 'A tiny amount, so you do not think twice, but it wants your card details on a page you did not go looking for. Skip it.'
      },
      {
        id: 'q9',
        text: '"School closed tomorrow, check the school website for details."',
        flag: false,
        note: 'It sends you to look something up yourself rather than tapping through. Nothing is asked of you. Step on it.',
      },
      {
        id: 'q10',
        text: '"It is Jamie, I got a new number. Can you lend me some money? Do not tell mum."',
        flag: true,
        check: ['S', 'T'],
        note: 'A new number you cannot check, and an instruction to keep it quiet. Ring the old number. Skip it.',
      },
      {
        id: 'q11',
        text: '"Two new photos were added to the class album."',
        flag: false,
        note: 'Nothing is claimed, nothing is asked, nothing is rushed. Step on it.',
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
 * little for P4–P6 without getting long. Structure, ids and the decision are
 * shared.
 *
 * The two bands no longer share a game, though. They used to run
 * byte-identical items: four unmistakably kind replies against four
 * unmistakably cruel ones: which asks nothing of a 10–12 year old and was
 * the clearest band-parity gap in the product (thingstoimproveon.md §4).
 * P4–P6 now gets the ambiguous middle (the laugh, the joke, the bystander,
 * the defence that starts a second pile-on) and has to name which T.H.I.N.K.
 * check each reply fails.
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
      text: 'Pockets is sad and has stopped singing. ',
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

  // One follow-up beat: digital footprint (Improvement Plan §2, Term 1
  // "Think Before You Act" — respectful + positive trail). The "who would
  // you tell" beat was dropped from Bully Bog per the school.
  extraBeats: {
    // Asked as a real two-option pick, not a "Good point." button. It puts a
    // genuine question to the child, *would* you be happy with this next
    // year, and a single tap-to-agree accepted any answer at all, which is
    // no answer (thingstoimproveon.md, Secondary findings).
    footprint: {
      who: 'Comet',
      prompt:
        'One more thing. What you just typed stays online for good. Which of these would you still be happy about next year?',
      options: [
        { id: 'kind', text: 'The kind reply I sent Pockets.' },
        { id: 'mean', text: 'The mean one about Pockets.' },
      ],
      response:
        'Kind ones are the easy answer, and that is the point. Posts do not really go away, so ask before you send: is it kind, and would you still be happy with it next year?',
    },
  },

  game: {
    type: 'sort',
    title: 'Clear the Water',
    instruction: 'Replies people could send Pockets. Which would you send and not send?',
    // T.H.I.N.K. is the standard school poster, so it reads as something the
    // classroom already owns rather than a game invention. P1–P3 sort by it
    // off the track; P4–P6 (below) name the check a reply fails.
    purpose: {
      name: 'T.H.I.N.K.',
      why: 'Five checks before you send anything about someone.',
      checks: [
        { key: 'T', name: 'True', sub: 'Do I know it is true?' },
        { key: 'H', name: 'Helpful', sub: 'Does it help anyone?' },
        { key: 'I', name: 'Inspiring', sub: 'Does it lift them up?' },
        { key: 'N', name: 'Necessary', sub: 'Does it need saying?' },
        { key: 'K', name: 'Kind', sub: 'Is it kind?' },
      ],
    },
    bins: [
      { id: 'send', title: 'Send It', sub: 'Kind, or just fine', icon: 'send' },
      { id: 'leave', title: 'Leave It', sub: 'This would hurt', icon: 'trash' },
    ],
    roundSize: 8,
    items: [
      { id: 'c1', text: '"I love your song, Pockets!"', bin: 'send' },
      { id: 'c2', text: '"Do you want to sing the next one together?"', bin: 'send' },
      { id: 'c3', text: '"That is brave. Nice one."', bin: 'send' },
      { id: 'c4', text: '"I am here if you want to talk."', bin: 'send' },
      { id: 'c9', text: '"Your song made me smile."', bin: 'send' },
      { id: 'c10', text: '"Can I hear the rest of it?"', bin: 'send' },
      { id: 'c5', text: '"Nobody wants to hear this."', bin: 'leave' },
      { id: 'c6', text: '"That is so bad."', bin: 'leave' },
      { id: 'c7', text: '"We are not inviting you next time."', bin: 'leave' },
      { id: 'c8', text: '"Everyone agrees with me, by the way."', bin: 'leave' },
      { id: 'c11', text: '"You should stop singing."', bin: 'leave' },
      { id: 'c12', text: '"Nobody here likes you."', bin: 'leave' },
      { id: 'c13', text: '"That was the worst song I have heard."', bin: 'leave' },
    ],
  },

  rule: {
    who: 'Comet',
    text: 'If it is ever about you, not Pockets, the rule is the same. Do not be mean back. Standing up can be one kind sentence.',
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
      text: 'Pockets the Frog is sad and has stopped singing.',
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

  // One follow-up beat only: digital footprint. The "who would you tell"
  // beat was dropped from Bully Bog per the school.
  extraBeats: {
    // A real pick rather than a tap-to-agree, see `bullybogLower` above.
    footprint: {
      who: 'Comet',
      prompt:
        'One more thing, before this goes up for good. Posts do not really disappear. Which of these would you still stand by in a year, when someone screenshots it back to you?',
      options: [
        { id: 'kind', text: 'The reply I actually sent, sticking up for Pockets.' },
        { id: 'joke', text: '"Ha ha ha." under the mean one. It was only a laugh.' },
      ],
      response:
        'The laugh is the trap. It feels like saying nothing, and it reads as agreeing, and it lasts exactly as long as the sentence you would have been proud of. Ask if it is kind first, then ask whether you would still stand by it next year.',
    },
  },

  game: {
    type: 'sort',
    title: 'Clear the Water',
    instruction:
      'Replies people could send Pockets. Sort each one, then name the check it fails. Some of these are not cruel at all, they just do not help.',
    // The band-parity fix (thingstoimproveon.md §4). P1–P3 sorts four
    // unmistakably kind replies against four unmistakably cruel ones, which
    // asks nothing of a 10–12 year old. This set is the *ambiguous middle*,
    // where the real skill lives: the joke, the laugh under the pile-on, the
    // bystander who only laughed, the defence that starts a second pile-on.
    // Naming which check it fails is what stops "long and negative = leave".
    purpose: {
      name: 'T.H.I.N.K.',
      why: 'Five checks before you send anything about someone.',
      nameTheCheck: true,
      prompt: 'Which check does this reply fail?',
      checks: [
        { key: 'T', name: 'True', sub: 'Do I know it is true?' },
        { key: 'H', name: 'Helpful', sub: 'Does it help anyone?' },
        { key: 'I', name: 'Inspiring', sub: 'Does it lift them up?' },
        { key: 'N', name: 'Necessary', sub: 'Did it need saying?' },
        { key: 'K', name: 'Kind', sub: 'Is it kind?' },
      ],
    },
    bins: [
      { id: 'send', title: 'Send It', sub: 'Kind, or just fine', icon: 'send' },
      { id: 'leave', title: 'Leave It', sub: 'This would hurt', icon: 'trash' },
    ],
    roundSize: 8,
    items: [
      { id: 'h1', text: '"I love your song, Pockets!"', bin: 'send' },
      { id: 'h2', text: '"Do you want to sing the next one together?"', bin: 'send' },
      { id: 'h3', text: '"I am here if you want to talk."', bin: 'send' },
      { id: 'h4', text: '"I thought it sounded good, honestly."', bin: 'send' },
      { id: 'h5', text: '"Are you okay? That comment was out of order."', bin: 'send' },
      { id: 'h6', text: '"Never mind them. Sing the next one."', bin: 'send' },
      {
        id: 'h7',
        text: '"Nobody wants to hear this."',
        bin: 'leave',
        check: 'K',
        checkNote: 'Nothing complicated here. It is simply unkind, and it is the comment that started all this.',
      },
      {
        id: 'h8',
        text: '"That was the worst singing I have ever heard."',
        bin: 'leave',
        check: 'K',
        checkNote: 'Dressed up as an opinion, but it is aimed at a person who can read it.',
      },
      {
        id: 'h9',
        text: '"Ha ha ha.", posted under the mean comment',
        bin: 'leave',
        check: ['H', 'K'],
        checkNote:
          'It costs nothing to type, and it helps nobody. To Pockets it reads as one more person agreeing.',
      },
      {
        id: 'h10',
        text: '"It is just a joke, do not be so sensitive."',
        bin: 'leave',
        check: 'K',
        checkNote:
          'This one tells the person they are wrong to be hurt. That is the unkind part, not the joke.',
      },
      {
        id: 'h11',
        text: '"I did not say anything. I only laughed."',
        bin: 'leave',
        check: 'H',
        checkNote:
          'Laughing along is still weight on the pile. Doing nothing helps the comment, not Pockets.',
      },
      {
        id: 'h12',
        text: '"Everyone thinks it, I am just the one who said it."',
        bin: 'leave',
        check: 'N',
        checkNote:
          '"Everyone thinks it" is not a reason. Nothing here needed saying at all.',
      },
      {
        id: 'h13',
        text: '"Ignore them, Pockets. They are losers anyway."',
        bin: 'leave',
        check: ['I', 'K'],
        checkNote:
          'Meant kindly, and it still starts a second pile-on. Standing up for someone does not need a target.',
      },
      {
        id: 'h14',
        text: '"I heard he got told off for singing in class as well."',
        bin: 'leave',
        check: 'T',
        checkNote: 'You heard it. You do not know it. Passing that on is how a rumour gets its second life.',
      },
    ],
  },

  rule: {
    who: 'Comet',
    text: 'And if it is ever about you, not Pockets, the rule is the same. Do not reply to be mean back. Save it, and use block or report if you need to. Standing up for someone can be one kind sentence, and it counts most when other people are watching.',
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
 * cards, same verdict copy: and, since 31 Aug 2026, the same Three Musts
 * which are what the realm actually requires to finish (see `musts` below
 * and components/BalanceBeachRealm.jsx). Filling six slots used to be the
 * whole requirement, which made this the one unfailable realm.
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
      'Fill the six hours between school and bed. All three musts have to be true before you can call it a day. Add something, or tap it in your list to take it back.',
    slots: 6,
    // The gate. Filling six slots used to be the whole requirement, so six
    // hours of screens passed exactly as readily as a balanced day and the
    // realm was not merely guessable but *unfailable* (thingstoimproveon.md
    // §1). These three are defensible conditions a child can reason from and
    // watch tick off live, rather than an invisible threshold.
    purpose: {
      name: 'The Three Musts',
      why: 'All three have to be true before a day counts as balanced.',
      checks: [
        { key: 'S', name: 'Sleep', sub: 'Sleep is in the day' },
        { key: 'E', name: 'Else', sub: 'One thing that is not a screen, sleep or homework' },
        { key: 'H', name: 'Half', sub: 'Screens take up no more than half' },
      ],
    },
    musts: {
      sleep: 'b9',
      somethingElse: ['b6', 'b7', 'b8', 'b10'],
      maxScreenShare: 0.5,
    },
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
    text: 'The rule for the Bay. Screens are not bad. Losing track of time is. Decide when you will stop before you start. And keep the Three Musts: sleep is in the day, one thing is away from a screen, and screens take no more than half.',
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
      'Fill the six hours between school and bed. All three musts have to be true before you can call it a day. Notice which parts you would look forward to, and which you would just fall into.',
    slots: 6,
    purpose: {
      name: 'The Three Musts',
      why: 'A day is not balanced until all three are true. After that, judge it on how it would feel.',
      checks: [
        { key: 'S', name: 'Sleep', sub: 'Sleep is in the day' },
        { key: 'E', name: 'Else', sub: 'One thing that is not a screen, sleep or homework' },
        { key: 'H', name: 'Half', sub: 'Screens take up no more than half' },
      ],
    },
    musts: balanceLower.game.musts,
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
    text: 'Start with the Three Musts: sleep is in the day, one thing is off a screen, and screens take no more than half. Past that, counting hours matters less than noticing how you feel. Apps and games are built to keep you going, so "I feel fine" is not always a good sign to stop. Check in with yourself on purpose, and let that decide when enough is enough.',
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
 * School revision pass: the rumour about Mia spreads online (a forwarded
 * screenshot claiming she got caught taking snacks). Both bands run the
 * *same* Mia scenario — `fableFallsHigher` reuses `fableFallsLower.story`
 * verbatim — and the difference between them is how hard the checking gets.
 *
 * P1–P3 (7–9) is a plain Q&A (`game.type: 'quiz'`,
 * minigames/MiniGameQuiz.jsx), kept deliberately short-sentenced: five
 * questions drawn from a pool of nine, with the four S.U.R.E. checks on
 * screen in short words while they answer.
 *
 * P4–P6 (10–12) is the S.U.R.E. framework (Source, Understand, Research,
 * Evaluate) and has to be *run*, not just agreed with: the clues arrive
 * unlabelled and shuffled and the child names the check each one belongs to
 * (`game.type: 'sure'`, minigames/MiniGameSure.jsx). The earlier version
 * labelled each question with its own step, which a child could clear on
 * common sense without ever learning the method. Both halves of every clue
 * are gated now, and one of two unrelated posts is drawn per run so the
 * clue-to-letter mapping can't be learned off a single scenario.
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
    instruction: 'More things about the post reach you. Decide what to do with each one.',
    // The same four checks the older band has to *run* (see fableFallsHigher),
    // here just kept on screen in short words while a 7–9 year old answers.
    // Both bands now leave Fable Falls able to name the method.
    purpose: {
      name: 'S.U.R.E.',
      why: 'Four checks before you believe it or pass it on.',
      checks: [
        { key: 'S', name: 'Source', sub: 'Who said it first?' },
        { key: 'U', name: 'Understand', sub: 'What is it really saying?' },
        { key: 'R', name: 'Research', sub: 'Can I check it somewhere real?' },
        { key: 'E', name: 'Evaluate', sub: 'Does it add up?' },
      ],
    },
    // Five of these nine each run (lib/draw.js).
    roundSize: 5,
    questions: [
      {
        id: 'q1',
        text: 'The screenshot has no name on it. Who said it first?',
        options: [
          {
            id: 'a',
            text: 'It does not matter. Lots of people shared it.',
            correct: false,
            feedback: 'If nobody knows where a story started, that is a reason to doubt it.',
          },
          {
            id: 'b',
            text: 'Nobody knows, so I should not trust it.',
            correct: true,
            feedback: 'Right. A story with no start is one to check, not to share.',
          },
          {
            id: 'c',
            text: 'The person who sent it to me said it first.',
            correct: false,
            feedback:
              'They forwarded it too. Keep asking who is at the very start, not who passed it on.',
          },
        ],
      },
      {
        id: 'q2',
        text: 'Hundreds of people shared the post. Does that make it true?',
        options: [
          {
            id: 'a',
            text: 'Yes. That many people cannot be wrong.',
            correct: false,
            feedback: 'Shares only show how far it went. A made-up story travels just as fast.',
          },
          {
            id: 'b',
            text: 'No. It only means it spread a lot.',
            correct: true,
            feedback: 'Exactly. Popular and true are not the same thing.',
          },
          {
            id: 'c',
            text: 'Yes, if the people sharing it are my friends.',
            correct: false,
            feedback:
              'Your friends got it the same way you did. Sharing it is not the same as knowing it.',
          },
        ],
      },
      {
        id: 'q3',
        text: 'You want to know if the snack story is real. What is best?',
        options: [
          {
            id: 'a',
            text: 'Ask the group chat what they think.',
            correct: false,
            feedback: 'That is where the rumour is already spreading. Asking there adds to it.',
          },
          {
            id: 'b',
            text: 'Ask a teacher or another adult I trust.',
            correct: true,
            feedback: 'Yes. A trusted adult can find out the real story.',
          },
          {
            id: 'c',
            text: 'Count how many likes it has.',
            correct: false,
            feedback:
              'Likes count taps, not truth. A made-up story can collect plenty.',
          },
        ],
      },
      {
        id: 'q4',
        text: 'The photo of Mia has a stretched, blurry edge. What does that tell you?',
        options: [
          {
            id: 'a',
            text: 'Nothing. Photos look odd sometimes.',
            correct: false,
            feedback: 'Sometimes they do. A stretched, smudged bit can also mean it was changed.',
          },
          {
            id: 'b',
            text: 'The picture might have been changed.',
            correct: true,
            feedback: 'Good eye. Odd edges and strange shadows are signs a photo is not real.',
          },
          {
            id: 'c',
            text: 'It just means the photo is old.',
            correct: false,
            feedback:
              'Being old does not stretch one edge of a picture. Editing does.',
          },
        ],
      },
      {
        id: 'q5',
        text: 'A friend says, "just share it, you can say sorry later." What do you think?',
        options: [
          {
            id: 'a',
            text: 'Okay. Sorry fixes it.',
            correct: false,
            feedback: 'Once a story is out it keeps going. Sorry does not call it back.',
          },
          {
            id: 'b',
            text: 'No. Checking first is easier than fixing it after.',
            correct: true,
            feedback: 'That is it. Checking takes a minute. Undoing a rumour takes much longer.',
          },
          {
            id: 'c',
            text: 'Share it, then delete it quickly after.',
            correct: false,
            feedback:
              'Screenshots take a second. Deleting your copy does not call the others back.',
          },
        ],
      },
      {
        id: 'q6',
        text: 'Mia says the post is not true. The post says it is. Who do you ask?',
        options: [
          {
            id: 'a',
            text: 'Whoever has more people agreeing with them.',
            correct: false,
            feedback: 'Counting sides does not find the truth. Someone who actually knows does.',
          },
          {
            id: 'b',
            text: 'A teacher or an adult I trust, who can find out.',
            correct: true,
            feedback: 'Yes. Ask someone who can check, not the crowd.',
          },
          {
            id: 'c',
            text: 'Nobody. I will wait and see what happens.',
            correct: false,
            feedback:
              'Waiting lets it keep spreading. Asking someone who can actually check is what stops it.',
          },
        ],
      },
      {
        id: 'q7',
        text: 'The post makes you feel angry straight away. What is that a sign of?',
        options: [
          {
            id: 'a',
            text: 'That it must be important, so I should send it on fast.',
            correct: false,
            feedback:
              'Something made to make you cross is made to be shared before you think. That is the moment to slow down.',
          },
          {
            id: 'b',
            text: 'Slow down. Feeling cross fast is a reason to check.',
            correct: true,
            feedback: 'Good. Strong feelings are the hook. Notice the hook and you are already safer.',
          },
          {
            id: 'c',
            text: 'Reply angrily, so everyone knows it is wrong.',
            correct: false,
            feedback:
              'Angry replies spread it further. Check first, then say something.',
          },
        ],
      },
      {
        id: 'q8',
        text: 'Someone says "I saw it on a video, so it is real." Is a video proof?',
        options: [
          {
            id: 'a',
            text: 'Yes. You cannot fake a video.',
            correct: false,
            feedback: 'You can. Videos get cut, sped up and made up, just like pictures.',
          },
          {
            id: 'b',
            text: 'No. Videos can be changed too.',
            correct: true,
            feedback: 'Right. Seeing it is not the same as it being true.',
          },
          {
            id: 'c',
            text: 'Yes, if I can clearly see the person\'s face.',
            correct: false,
            feedback:
              'Faces are the part people change most of all.',
          },
        ],
      },
      {
        id: 'q9',
        text: 'You shared the post before you checked, and now you know it is not true. What now?',
        options: [
          {
            id: 'a',
            text: 'Say nothing and hope people forget.',
            correct: false,
            feedback: 'It keeps going while you stay quiet. Saying so is how it stops.',
          },
          {
            id: 'b',
            text: 'Take it down, say it was not true, and tell an adult I trust.',
            correct: true,
            feedback:
              'That is the brave one. Getting it wrong is fixable. Leaving it up is what does the damage.',
          },
          {
            id: 'c',
            text: 'Say it was not my fault, because someone sent it to me.',
            correct: false,
            feedback:
              'Passing the blame does not take the post down. Fix it first, then tell an adult.',
          },
        ],
      },
    ],
  },

  rule: {
    who: 'Comet',
    text: 'Here is the rule for Fable Falls. Not everything that reaches you is true, even when lots of people shared it. Stop before you believe it or pass it on. Then check: ask an adult you trust, or find the story somewhere real.',
  },
};

/**
 * P4–P6 — the same Mia screenshot as `fableFallsLower` (story reused
 * verbatim), but where the younger band answers five plain questions, this
 * band has to actually *run* S.U.R.E.
 *
 * The version this replaced labelled every quiz question with its own step
 * ("Source. The screenshot has no name…"), which meant a child could clear
 * the whole thing on ordinary common sense and never learn the method — the
 * letters were decoration. Now the clues arrive unlabelled and shuffled
 * (`game.type: 'sure'`, minigames/MiniGameSure.jsx): you have to name the
 * check a clue belongs to before you can say what to do about it, a missed
 * check comes back round at the end, and the game closes on the verdict all
 * four checks add up to.
 */
const fableFallsHigher = {
  story: fableFallsLower.story,

  decision: {
    prompt: 'The Echo wants you to forward the screenshot too. What do you do?',
    options: [
      {
        id: 'spread',
        text: 'Forward it. So many people have shared it already, so it is probably true.',
        tag: 'Option A',
        safe: false,
        who: 'Comet',
        response:
          'The screenshot tumbles further down the Falls, a bit bigger each time. Lots of shares only means a story has spread, not that it is true, and a screenshot is one of the easiest things to fake. Shall we look again?',
      },
      {
        id: 'sure',
        text: '"I will run it through S.U.R.E. first: Source, Understand, Research, Evaluate. Then I will decide."',
        tag: 'Option B',
        safe: true,
        who: 'Comet',
        response:
          'Good call. Four checks. Source: who is behind it? Understand: what is it really claiming? Research: can you find it somewhere you trust? Evaluate: does it add up? Let us take this post apart properly.',
      },
    ],
  },

  game: {
    type: 'sure',
    title: 'Run It Through S.U.R.E.',
    instruction:
      'Four clues about the post, jumbled up. Work out which check each one belongs to, then decide what it means.',
    purpose: {
      name: 'S.U.R.E.',
      why: 'Four checks for anything that reaches you and wants a reaction.',
      nameTheCheck: true,
      checks: [
        { key: 'S', name: 'Source', sub: 'Who is behind it?' },
        { key: 'U', name: 'Understand', sub: 'What is it claiming?' },
        { key: 'R', name: 'Research', sub: 'Can I find it somewhere I trust?' },
        { key: 'E', name: 'Evaluate', sub: 'Does it add up?' },
      ],
    },
    // Two posts, one drawn per run. With a single post the `miss` and `note`
    // copy eventually teaches the clue→letter mapping, so by the second
    // recheck round a child could pass on memory of *this post* rather than
    // on the method (thingstoimproveon.md, "the two games that are already
    // close"). A second, unrelated post means the method is the only thing
    // that carries over.
    posts: [
      {
        id: 'mia',
        lead: 'The screenshot about Mia.',
        cards: [
          {
            id: 'source',
            step: 'S',
            text: 'The screenshot has no name on it. It reached you as a forward of a forward of a forward.',
            miss: 'Not that check. This clue is about where the post came from in the first place.',
            note: 'Source. Nobody can point to who posted it first, so there is nobody here to trust.',
            action: {
              prompt: 'So what does that mean for the post?',
              options: [
                {
                  id: 'a',
                  text: 'Someone must have seen it happen, or they would not have posted it.',
                  correct: false,
                  feedback:
                    '"Someone said so" is not the same as someone knowing. With no first poster, there is nothing you can check.',
                },
                {
                  id: 'b',
                  text: 'Treat it as unproven until I know who posted it.',
                  correct: true,
                  feedback: 'Right. A story with no clear start is one to check, not one to pass on.',
                },
              ],
            },
          },
          {
            id: 'understand',
            step: 'U',
            text: 'The caption says Mia "got caught stealing". The picture under it is three lines of chat.',
            miss: 'Not that check. This clue is about the claim itself, and whether the picture backs it up.',
            note: 'Understand. The caption claims far more than three lines of chat could ever show.',
            action: {
              prompt: 'So what is the post actually proving?',
              options: [
                {
                  id: 'a',
                  text: 'The caption explains what the chat means.',
                  correct: false,
                  feedback:
                    'A caption tells you what to think, and it was written by whoever wanted the post shared. It is not evidence.',
                },
                {
                  id: 'b',
                  text: 'Nothing. Nobody gets caught doing anything in those three lines.',
                  correct: true,
                  feedback:
                    'Exactly. Understand means holding the claim up against the evidence, and this evidence is very thin.',
                },
              ],
            },
          },
          {
            id: 'research',
            step: 'R',
            text: 'No teacher has mentioned it. There is no notice. Nobody outside the chat has heard of it.',
            miss: 'Not that check. This clue is about looking for the story somewhere other than the chat.',
            note: 'Research. Something this big would turn up somewhere real, and it has not turned up anywhere.',
            action: {
              prompt: 'Where do you go to find out?',
              options: [
                {
                  id: 'a',
                  text: 'Ask the group chat what everyone thinks.',
                  correct: false,
                  feedback:
                    'The group chat is where the rumour is already spreading. Asking there only adds to it.',
                },
                {
                  id: 'b',
                  text: 'Ask a teacher, or Mia herself, or wait for something official.',
                  correct: true,
                  feedback:
                    'Yes. Research means finding the story on its own, somewhere you trust, not counting how many forwards it has.',
                },
              ],
            },
          },
          {
            id: 'evaluate',
            step: 'E',
            text: 'It is shocking, it is spreading fast, and it makes one person look bad. One edge of the photo is stretched and blurry.',
            miss: 'Not that check. This clue is about whether the post holds together when you look hard at it.',
            note: 'Evaluate. Too shocking, too fast, too one-sided, and the picture itself looks tampered with.',
            action: {
              prompt: 'What do those signs tell you?',
              options: [
                {
                  id: 'a',
                  text: 'Dramatic means important, so it is worth sending on quickly.',
                  correct: false,
                  feedback:
                    'Something built to shock you is built to be shared before you think. That is the moment to slow down, not speed up.',
                },
                {
                  id: 'b',
                  text: 'A stretched edge and a story this convenient are reasons to doubt it.',
                  correct: true,
                  feedback:
                    'Good eye. Odd edges, strange blur and shadows that do not match are common signs a picture has been changed.',
                },
              ],
            },
          },
        ],
        verdict: {
          prompt: 'All four checks are done, and not one of them held up. Do you forward the screenshot?',
          options: [
            {
              id: 'a',
              text: 'Forward it, but add "not sure if this is true".',
              correct: false,
              feedback:
                'That still passes it on, and the "not sure" gets dropped at the very next forward. The post keeps travelling either way.',
            },
            {
              id: 'b',
              text: 'No. And if it keeps spreading, tell an adult I trust.',
              correct: true,
              feedback:
                'That is S.U.R.E. finished properly. Four checks gave you four reasons to doubt it and not one reason to send it on.',
            },
          ],
        },
      },
      {
        id: 'shutdown',
        lead: 'The post about the game shutting down.',
        cards: [
          {
            id: 'source',
            step: 'S',
            text: 'It is headed "OFFICIAL ANNOUNCEMENT". The account that posted it is called gamenews_daily_real, and it was made three weeks ago.',
            miss: 'Not that check. This clue is about who is behind the post in the first place.',
            note: 'Source. A three-week-old account calling itself "real" is not the people who make the game.',
            action: {
              prompt: 'So what does the account tell you?',
              options: [
                {
                  id: 'a',
                  text: 'It says official, so it must be speaking for the game.',
                  correct: false,
                  feedback:
                    'Anyone can type the word official. The word is free. Being the actual studio is not.',
                },
                {
                  id: 'b',
                  text: 'Nothing yet. Anyone can name an account anything.',
                  correct: true,
                  feedback:
                    'Right. "Real" in a username is a claim, not proof. Look for who is genuinely behind it.',
                },
              ],
            },
          },
          {
            id: 'understand',
            step: 'U',
            text: 'The caption says the game is "shutting down for good next week". The screenshot under it is a notice about servers being down for maintenance.',
            miss: 'Not that check. This clue is about the claim itself, and whether the picture backs it up.',
            note: 'Understand. Maintenance means back soon. The caption turned that into gone forever.',
            action: {
              prompt: 'So what is the screenshot actually showing?',
              options: [
                {
                  id: 'a',
                  text: 'It proves the game is closing. That is what the notice is about.',
                  correct: false,
                  feedback:
                    'It is about a few hours offline. The caption is doing all the work, and the caption is the part someone wrote.',
                },
                {
                  id: 'b',
                  text: 'A short outage, which is not the same thing at all.',
                  correct: true,
                  feedback:
                    'Exactly. Understand means holding the claim up against the evidence, and the evidence says something much smaller.',
                },
              ],
            },
          },
          {
            id: 'research',
            step: 'R',
            text: 'The game\'s own app says nothing about it. Neither does its website. Nobody who actually works on it has mentioned it anywhere.',
            miss: 'Not that check. This clue is about looking for the story somewhere other than the post.',
            note: 'Research. News this big would be on the game\'s own channels first, and it is on none of them.',
            action: {
              prompt: 'Where do you go to find out?',
              options: [
                {
                  id: 'a',
                  text: 'Check how many people have shared it.',
                  correct: false,
                  feedback:
                    'Shares measure how fast something travelled, never whether it was true when it set off.',
                },
                {
                  id: 'b',
                  text: 'Open the game itself, or its own site, and see what they say.',
                  correct: true,
                  feedback:
                    'Yes. Research means going to the source that would actually know, not to the crowd repeating it.',
                },
              ],
            },
          },
          {
            id: 'evaluate',
            step: 'E',
            text: 'It is upsetting, it is spreading fast, and it ends with "share this to save the game". The logo in the picture is the wrong shade of blue.',
            miss: 'Not that check. This clue is about whether the post holds together when you look hard at it.',
            note: 'Evaluate. Upsetting, urgent, and it asks you to share as the fix. That combination is the tell.',
            action: {
              prompt: 'What do those signs tell you?',
              options: [
                {
                  id: 'a',
                  text: 'Sharing costs nothing, so I may as well, just in case.',
                  correct: false,
                  feedback:
                    'Sharing is exactly what it was built to make you do. "Just in case" is how a made-up story gets its reach.',
                },
                {
                  id: 'b',
                  text: 'A post that asks to be shared to fix something is a post to doubt.',
                  correct: true,
                  feedback:
                    'Good eye. Wrong-shade logos, urgency, and "share to save it" are all signs of something made to travel, not something true.',
                },
              ],
            },
          },
        ],
        verdict: {
          prompt: 'All four checks are done, and not one of them held up. Do you forward it to the group chat?',
          options: [
            {
              id: 'a',
              text: 'Send it, but say "might not be true".',
              correct: false,
              feedback:
                'The "might not be true" gets dropped at the very next forward, and the post keeps travelling without it. Passing it on with a warning is still passing it on.',
            },
            {
              id: 'b',
              text: 'No. And I will say where I actually checked, so nobody else falls for it.',
              correct: true,
              feedback:
                'That is S.U.R.E. finished properly. Four checks gave you four reasons to doubt it, and telling people where you looked is what stops the next forward.',
            },
          ],
        },
      },
    ],
  },

  rule: {
    who: 'Comet',
    text: 'Run S.U.R.E. every time something makes you want to react fast, even a screenshot everyone is forwarding. Source: who is behind it, and do you trust them? Understand: what is it really claiming? Research: can you find it somewhere you trust? Evaluate: does it add up, or is it too shocking, too perfect, too convenient? Four checks is usually enough to catch a fake.',
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
    blurb: 'Murky water that shows whatever gets posted about the folks who live here.',
    topic: 'Cyberbullying & kindness',
    stamp: { icon: 'heart', label: 'Bully Bog · Visited' },
    enabled: true,
    intro: {
      lore: 'The bog\'s still water shows every word posted about the folks who live here. Lately the ponds have turned murky, because unkind comments sink in and cloud everything. Pockets the frog sits alone in the murkiest one. The bog needs someone who can clear the water.',
      learn: [
        'How unkind words online really make other people feel',
        'What you can do when you see someone being bullied',
        'When to use block or report',
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

// The Traveller's Pledge (storyline.md finale) moved to
// components/CertificateScreen.jsx (CERTIFICATE_COPY) so the whole passport
// scene is editable from one place in the dev Copy Editor. Each pledge entry
// there carries a `realm` id and only renders for an active realm.
