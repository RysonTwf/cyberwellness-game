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
  'Every good traveler carries two things: curiosity, and a second thought.';

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
      text: "A visitor! Wonderful. Before I let you through, I just need a few things — your full name, your school, your address, and — oh, while we're at it, what's your password? Just so I know you're trustworthy.",
    },
  ],

  decision: {
    prompt: 'Vex is waiting, smiling, holding a very long clipboard. What do you do?',
    options: [
      {
        id: 'answer',
        text: 'Answer everything Vex asks.',
        tag: 'Option A',
        safe: false,
        who: 'Comet',
        // Warm redirect, not a punishment (design.md §5)
        response:
          "Vex's vault door creaks open — and there's nothing behind it but more fog. Vex means well, but a stranger, even a friendly one, never needs your real info or your password to prove anything. Want to look at that again?",
      },
      {
        id: 'decline',
        text: '"I don\'t think I should share that with someone I just met."',
        tag: 'Option B',
        safe: true,
        who: 'Keeper Vex',
        response:
          'Oh — right, right, good instinct! I ask everyone that, you know, just to check. Come on in properly, then.',
      },
    ],
  },

  game: {
    type: 'sort',
    title: 'Guard the Vault',
    instruction:
      'Drag each card into a vault — or tap the card, then tap a vault. Which things stay locked up, and which are fine to tell people?',
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
    text: "Here's the rule that works everywhere in the Atlas: your name, your address, your school and your passwords stay locked. Your favourite colour, your nickname, the games you love — share away. And a real grown-up who needs something will never need your password to get it.",
  },
};

/**
 * P4–P6 variant — the *Sam & Tom* account-takeover/impersonation scenario
 * (Improvement Plan §3, confirmed age-appropriate with the school contact,
 * §1a), paired with the Phase 2 Phaser platformer ("Guard the Vault: Level
 * Up" — minigames/MiniGamePlatformer.jsx).
 */
const passworldHigher = {
  story: [
    {
      who: 'Comet',
      text: "Passworld again — but something's different this time. That side door, the one to Sam's vault? It's swinging wide open.",
    },
    {
      who: '"Sam"',
      text: "hey!! it's me, sam, lol. forgot my password AGAIN. can u just send me urs so i can get back into my own stuff? promise i'll delete it after 😅",
    },
  ],

  decision: {
    prompt:
      "That message says it's from Sam. Sam's vault door is open, and now someone's asking for your password too. What do you do?",
    options: [
      {
        id: 'send',
        text: "Send your password — it's Sam, they wouldn't ask if it wasn't important.",
        tag: 'Option A',
        safe: false,
        who: 'Comet',
        response:
          "You send it — and your door creaks open too. That wasn't really Sam. Someone got into Sam's vault because a password got shared or guessed, and now they're using it to get into more doors, including yours. A real friend never actually needs your password, even to \"help.\" Want to look again?",
      },
      {
        id: 'verify',
        text: '"That doesn\'t sound like something the real Sam would ask. I\'m checking with them another way first — and I\'m not sending my password to anyone."',
        tag: 'Option B',
        safe: true,
        who: 'Comet',
        response:
          "Good call. You message Sam through a different door entirely — and the real Sam has no idea what you're talking about. Whoever's in that vault isn't them. Now Sam knows to lock it back down.",
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
      "Walk right with the arrow keys (or the on-screen buttons). You'll meet whoever's in Sam's vault first — the gate past them won't open until you've decided what to do. Past that: jump between platforms to collect the letter, number, and the tiles scattered through the vault. It's a long climb that doubles back on itself, so take the jumps one at a time. Grab whatever you can reach — they all go in your bag, and nothing you pick up is wasted. The vault door at the far end is where you decide which of them actually belong in a strong password, so read them as you go. Guards patrol the ledges and the floor; a bump only knocks you back, so pick your moment and go again.",
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
    text: "Here's the Passworld rule for older travelers: accounts don't usually get \"stolen\" by someone breaking down the door — they get taken over because a password got shared, reused, or guessed. So: a different password for everything that matters, never hand yours over even to a friend who \"really needs it,\" and if a message ever feels off — even from someone you know — check with them a different way before you trust it.",
  },
};

/* ------------------------------------------------------------------------ */
/* Realm 2 — Privacy Peaks                                                  */
/* ------------------------------------------------------------------------ */

const privacyLower = {
  story: [
    {
      who: 'Comet',
      text: `Privacy Peaks. Careful — the fog up here isn't dangerous, it just hides who's really on the other side of a message. ${COMET_CATCHPHRASE}`,
    },
    {
      who: 'The Fog',
      text: "hii!! u just won a free tablet!! click here fast before it's gone, only for the next 5 minutes!! also whats ur address so we can send it lol",
    },
  ],

  decision: {
    prompt: 'A shape in the fog is messaging you directly. What do you do?',
    options: [
      {
        id: 'click',
        text: 'Click the link.',
        tag: 'Option A',
        safe: false,
        who: 'Comet',
        response:
          "The fog gets thicker and… nothing good happens. Look at that message again — that's three signs at once. A prize you never entered for, a rush to click fast, and someone asking for your address. Let's look again.",
      },
      {
        id: 'refuse',
        text: '"That looks like a scam. I\'m not clicking, and I\'ll tell a trusted adult."',
        tag: 'Option B',
        safe: true,
        who: 'Comet',
        response:
          'The fog thins out and drifts away, and there’s the real path, right where it always was. Telling someone is the part most travelers forget — nice work.',
      },
    ],
  },

  game: {
    type: 'spot',
    title: 'Clear the Fog',
    instruction:
      'Tap each message to clear the fog off it. Find the parts that should make you stop and think — not everything here is a trick.',
    messages: [
      { id: 'm1', text: 'hii!! 😊', flag: false, note: 'Just a hello. Nothing wrong with that.' },
      {
        id: 'm2',
        text: 'u just won a free tablet!! 🎉',
        flag: true,
        note: 'A prize you never entered for. If you didn’t enter, you didn’t win.',
      },
      {
        id: 'm3',
        text: 'click here fast, only 5 minutes left!!',
        flag: true,
        note: 'Rushing you on purpose, so you don’t stop and think.',
      },
      {
        id: 'm4',
        text: 'whats ur favourite game?',
        flag: false,
        note: 'Your favourite game is safe to share — remember Passworld? Not everything a stranger asks is a trap.',
      },
      {
        id: 'm5',
        text: 'whats ur address so we can send it lol',
        flag: true,
        note: 'Your address is yours. That one stays locked.',
      },
      {
        id: 'm6',
        text: 'wanna meet at the park after school? dont tell ur parents 🤫',
        flag: true,
        note: 'Wanting to meet up — and asking you to keep it secret. That’s the biggest one on this whole mountain.',
      },
    ],
  },

  rule: {
    who: 'Comet',
    text: 'The rule for the Peaks: you can’t see through fog, so don’t guess. If a message rushes you, promises you something, asks where you live, or asks you to keep a secret from your grown-ups — stop, don’t reply, and show it to an adult you trust.',
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
      text: "Privacy Peaks, but the fog's cleverer this time — it's learned to sound official.",
    },
    {
      who: '"Atlas Security"',
      text: '⚠️ URGENT: Unusual activity detected on your account. Verify your identity within 24 hours or your account will be permanently suspended. Tap here to confirm your password and continue.',
    },
  ],

  decision: {
    prompt: 'It looks official — a logo, a warning icon, a countdown. What do you do?',
    options: [
      {
        id: 'verify',
        text: 'Tap the link and enter your password to "verify" before time runs out.',
        tag: 'Option A',
        safe: false,
        who: 'Comet',
        response:
          "The fog swallows the path whole. Real services almost never threaten to lock you out in 24 hours, and they never ask you to type your password into a link from a message. Looking official — a logo, a scary warning — is the easiest part to fake. Let's look again.",
      },
      {
        id: 'pause',
        text: '"A real warning wouldn\'t need to rush me. I\'ll check by opening the app myself — not through this link."',
        tag: 'Option B',
        safe: true,
        who: 'Comet',
        response:
          "You open the Atlas app directly, the ordinary way — and there's no warning waiting for you there. The fog wanted you to click before you could check. Slowing down was the whole trick.",
      },
    ],
  },

  game: {
    type: 'steppingstones',
    title: 'Clear the Fog: Level Up',
    instruction:
      "Six stones, six messages — one at a time. Step on the ones that are fine. Skip the ones with a red flag, rather than just walking into them. These are trickier than before: official-looking doesn't mean official.",
    stones: [
      {
        id: 'q1',
        text: '"Your order has shipped — no action needed."',
        flag: false,
        note: 'No link to click, no urgency, nothing asked of you. Fine to step on.',
      },
      {
        id: 'q2',
        text: '"URGENT: verify within 24 hours or lose your account — tap here"',
        flag: true,
        note: 'A countdown and a threat, both designed to rush you past thinking. Worth skipping.',
      },
      {
        id: 'q3',
        text: '"This is the Atlas Team. Please confirm your password to continue."',
        flag: true,
        note: 'No real team ever needs your password typed into a message. Worth skipping.',
      },
      {
        id: 'q4',
        text: '"Reminder: your library book is due Friday."',
        flag: false,
        note: 'Ordinary, boring, no ask. Not everything official-looking is a trap — fine to step on.',
      },
      {
        id: 'q5',
        text: 'atlas-security-verify.free-rewards.net',
        flag: true,
        note: "Look at the actual address, not just the words around it — that's not where the real Atlas lives. Worth skipping.",
      },
      {
        id: 'q6',
        text: '"Hi, it\'s your teacher — can you send me your login so I can check something on your account?"',
        flag: true,
        note: 'A real adult in charge can look into your account their own way — they never need your password to do it. Worth skipping.',
      },
    ],
  },

  rule: {
    who: 'Comet',
    text: 'The upgraded rule for the Peaks: scams get better at looking real the older you get — logos, official language, countdowns. None of that is proof. The tell is always the same underneath: rushing you, and asking for something (a password, a click, a link) a real message wouldn\'t need. When in doubt, go check the official way yourself, and loop in a trusted adult.',
  },
};

/* ------------------------------------------------------------------------ */
/* Realm 3 — Bully Bog                                                      */
/* ------------------------------------------------------------------------ */

const bullybogLower = {
  story: [
    {
      who: 'Comet',
      text: `Bully Bog. The water here shows whatever people post about the ones who live in it. ${COMET_CATCHPHRASE}`,
    },
    {
      who: 'Pockets',
      text: '🎵 ribbit-a-doo, ribbit-a-daaaa — oh! Hello. Sorry, I was just singing. I do that.',
    },
    {
      who: 'A comment appears',
      text: '"nobody wants to hear this, go away."',
    },
    {
      who: 'Comet',
      text: 'Pockets has stopped singing. Two other bog creatures are typing something… and now they’re both looking at you.',
    },
  ],

  decision: {
    prompt: 'The water is going darker. What do you type?',
    options: [
      {
        id: 'joinin',
        text: '"yeah that was bad"',
        tag: 'Option A',
        safe: false,
        who: 'Comet',
        response:
          'The water goes darker still, and Pockets sinks a little lower in it. That made it heavier for Pockets, not lighter — even though it was only four words. Want to try a different response?',
      },
      {
        id: 'standup',
        text: '"That wasn\'t kind. I liked your song, Pockets."',
        tag: 'Option B',
        safe: true,
        who: 'Pockets',
        response:
          'Oh. Oh! You did? Nobody’s ever… The water’s going clear right where you said it. Thank you, Traveler.',
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
        'One more thing, before it goes up for good — would it be okay if what you just typed stayed online forever? Posts don’t really disappear, even the kind ones.',
      accept: 'Good point.',
      followUp:
        'That’s the habit hiding inside this one moment: not just "is it kind," but "would I still be okay with this next year." You just did both.',
    },
    tellSomeone: {
      who: 'Comet',
      prompt:
        'You handled that one yourself — but you don’t always have to. If the water here ever got a lot darker, who’s a trusted adult you’d tell?',
      options: [
        { id: 'parent', text: 'A parent or family member' },
        { id: 'teacher', text: 'A teacher' },
        { id: 'other-adult', text: 'Another trusted adult' },
      ],
      response:
        'Good answer. Seeking help isn’t a last resort — it’s one of the habits, same as being kind or checking a fact. Knowing who, before you need to, is half the job done.',
    },
  },

  game: {
    type: 'sort',
    title: 'Clear the Water',
    instruction:
      'Drag each comment into a pile — or tap the comment, then tap a pile. Which ones would you actually send?',
    bins: [
      { id: 'send', title: 'Send It', sub: 'Kind, or just fine', icon: 'send' },
      { id: 'leave', title: 'Leave It', sub: 'This would sting', icon: 'trash' },
    ],
    items: [
      { id: 'c1', text: '"I liked your song, Pockets!"', bin: 'send' },
      { id: 'c2', text: '"Want to sing the next one together?"', bin: 'send' },
      { id: 'c3', text: '"That took guts. Nice one."', bin: 'send' },
      { id: 'c4', text: '"I\'m here if you want to talk."', bin: 'send' },
      { id: 'c5', text: '"nobody wants to hear this"', bin: 'leave' },
      { id: 'c6', text: '"lol that was so bad 💀"', bin: 'leave' },
      { id: 'c7', text: '"we\'re not inviting you next time"', bin: 'leave' },
      { id: 'c8', text: '"everyone agrees with me btw"', bin: 'leave' },
    ],
  },

  rule: {
    who: 'Comet',
    text: 'And if it’s ever about you instead of Pockets — same rule. Don’t respond to be mean back. Save it, and show a trusted adult. Standing up for someone can be as small as one kind sentence.',
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
      text: "Bully Bog. Look — it's not just one comment this time. It's a pile-on.",
    },
    {
      who: 'Pockets',
      text: "🎵 ribbit-a— oh. Everyone's already looking at my post. I probably shouldn't have posted my voice.",
    },
    {
      who: 'A comment appears',
      text: '"of course it sounds like that, it\'s a frog lol what did u expect"',
    },
    {
      who: 'Another comment appears',
      text: '"yeah that voice is exactly why nobody picks pockets for anything"',
    },
    {
      who: 'Comet',
      text: "Three more bog creatures have liked both comments. Now they're waiting to see who else joins in.",
    },
  ],

  decision: {
    prompt: "It's easier to go along with a crowd than to be the one who doesn't. What do you type?",
    options: [
      {
        id: 'jointhepile',
        text: '"lol true" — just to fit in with everyone else.',
        tag: 'Option A',
        safe: false,
        who: 'Comet',
        response:
          'The water goes darker, and this time it\'s not just your words doing it — it\'s the weight of everyone\'s added up. "Everyone else was doing it" doesn\'t make a pile-on lighter for the person underneath it. Want to try again?',
      },
      {
        id: 'standupharder',
        text: '"That\'s making fun of who Pockets actually is, not something they did. Not okay — with any of you."',
        tag: 'Option B',
        safe: true,
        who: 'Pockets',
        response:
          "The water clears — slower this time, because more of it was dark. But it clears. And two of the others quietly delete their comments. Thank you for saying it to all of them, not just to me.",
      },
    ],
  },

  extraBeats: {
    footprint: {
      who: 'Comet',
      prompt:
        'One more thing — before any of this goes up for good, would it be okay if it stayed online forever? That includes the comments that pile on, not just the first one.',
      accept: 'Good point.',
      followUp:
        "That's the same habit as before, just harder to remember mid-pile-on: not just \"is this kind,\" but \"would I still stand by this next year.\"",
    },
    tellSomeone: {
      who: 'Comet',
      prompt:
        "Standing up in the moment is hard, especially against more than one person. If a pile-on like this ever got bigger than you could handle alone, who's a trusted adult you'd tell?",
      options: [
        { id: 'parent', text: 'A parent or family member' },
        { id: 'teacher', text: 'A teacher' },
        { id: 'other-adult', text: 'Another trusted adult' },
      ],
      response:
        "Good answer. Standing up doesn't mean handling a whole pile-on by yourself — telling an adult is just as much a part of standing up as the comment was.",
    },
  },

  game: {
    type: 'sort',
    title: 'Clear the Water: Level Up',
    instruction:
      "Some of these are about what someone did. Some are about who they are. Sort by which kind they are — and which pile you'd add to.",
    bins: [
      { id: 'send', title: 'Send It', sub: 'Kind, or just fine', icon: 'send' },
      { id: 'leave', title: 'Leave It', sub: 'This would sting', icon: 'trash' },
    ],
    items: [
      { id: 'd1', text: '"Your voice is part of what makes your songs yours. Keep singing."', bin: 'send' },
      { id: 'd2', text: '"I don\'t care what anyone else says, I\'m still listening."', bin: 'send' },
      { id: 'd3', text: '"of course it sounds like that, it\'s a frog lol"', bin: 'leave' },
      { id: 'd4', text: '"that voice is exactly why nobody picks pockets for anything"', bin: 'leave' },
      { id: 'd5', text: '"not joining in on this one, sorry"', bin: 'send' },
      { id: 'd6', text: '"everyone else is saying it too so it\'s not that deep"', bin: 'leave' },
      { id: 'd7', text: '"deleting my comment, that wasn\'t fair"', bin: 'send' },
      { id: 'd8', text: '"guess we know who\'s getting picked last now"', bin: 'leave' },
    ],
  },

  rule: {
    who: 'Comet',
    text: "The upgraded rule for the Bog: the meanest comments usually aren't about what someone did — they're about who they are, and those are the ones that sting longest. A pile-on feels different from one comment, but the rule doesn't change: don't add to it, and it counts even more when you're the one who says something while others are watching. That's not small. That's the hardest version of standing up, and the most it's ever mattered.",
  },
};

/* ------------------------------------------------------------------------ */
/* Realm 4 — Balance Bay                                                    */
/* ------------------------------------------------------------------------ */

const balanceLower = {
  story: [
    {
      who: 'Comet',
      text: `Balance Bay — last one. The tide's way too high tonight. That'll be the Glimmer. ${COMET_CATCHPHRASE}`,
    },
    {
      who: 'The Glimmer',
      text: "Stay a little longer! One more round, one more video, one more level — time doesn't really pass here, promise.",
    },
    {
      who: 'Comet',
      text: 'Out past the glow, down the beach, there’s a bonfire. Your friends are sitting around it. They’ve been there a while.',
    },
  ],

  decision: {
    prompt: 'The Glimmer is very, very fun. The bonfire is very far away. What do you do?',
    options: [
      {
        id: 'stay',
        text: '"Just a little longer."',
        tag: 'Option A',
        safe: false,
        who: 'Comet',
        response:
          'The Glimmer glows brighter, and down the beach the bonfire dims a little. The Glimmer isn’t bad — it’s just very good at being fun, and it says that every single time. Let’s go look at what a balanced day actually looks like.',
      },
      {
        id: 'leave',
        text: '"I\'ve had a good amount of time here — I\'m heading to the bonfire."',
        tag: 'Option B',
        safe: true,
        who: 'Comet',
        response:
          'The tide slides back down to where it should be, and the bonfire goes warm and bright. You didn’t even have to stop having fun — you just decided when.',
      },
    ],
  },

  game: {
    type: 'balance',
    title: 'Balance the Day',
    instruction:
      'Fill the six hours between school and bed. Tap a card to add it, tap it again in a slot to take it back. There’s no one right answer — just see how the tide sits.',
    slots: 6,
    items: [
      { id: 'b1', text: 'Watch videos', screen: true },
      { id: 'b2', text: 'Play my game', screen: true },
      { id: 'b3', text: 'Group chat', screen: true },
      { id: 'b4', text: 'Video call my cousin', screen: true },
      // Six screen cards for six slots, matching the six non-screen ones.
      // With only four, `screenCount >= slots - 1` could never be true, so
      // the `allScreen` verdict below was unreachable — the one outcome that
      // carries the Bay's actual lesson never fired, in either band.
      { id: 'b11', text: 'Scroll my feed', screen: true },
      { id: 'b12', text: 'Watch a show', screen: true },
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
        'Whoa — the tide’s all the way up. A day that’s only screens leaves no room for the rest of you. Try swapping one or two out?',
      noScreen:
        'The tide’s all the way out! You don’t have to cut screens completely — they’re fun, and that’s allowed. Try adding one back in.',
      level:
        'Look at that — the tide’s sitting level. Some screen time, plenty of everything else. That’s the whole trick.',
    },
  },

  rule: {
    who: 'Comet',
    text: 'The rule for the Bay: screens aren’t the enemy — losing track is. Decide when you’ll stop before you start, and make sure sleep, moving about, and actual people all still get their turn.',
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
      text: "Balance Bay again. The tide's high, same as always — but look closer this time.",
    },
    {
      who: 'The Glimmer',
      text: "Stay a little longer! You don't even look tired. You're basically fine, right?",
    },
    {
      who: 'Comet',
      text: 'Down the beach, the bonfire\'s still going. But notice — how does it actually feel, sitting here with the Glimmer this long?',
    },
  ],

  decision: {
    prompt: "The Glimmer says you're fine. What does noticing actually tell you?",
    options: [
      {
        id: 'ignorefeeling',
        text: '"I feel fine, the Glimmer\'s right — I\'ll just keep going."',
        tag: 'Option A',
        safe: false,
        who: 'Comet',
        response:
          "The tide creeps higher, and something quieter creeps in with it — a little restless, a little flat, hard to name. The Glimmer isn't lying exactly, it's just not the one who'd notice for you. That's on you to check. Want to look again?",
      },
      {
        id: 'noticefeeling',
        text: '"Actually — I feel kind of wound up, not relaxed. That\'s my sign to stop."',
        tag: 'Option B',
        safe: true,
        who: 'Comet',
        response:
          "You name it, and the tide eases back on its own. That's the actual skill here — not a timer going off, just noticing how you feel and trusting that over how fun something says it is.",
      },
    ],
  },

  game: {
    type: 'balance',
    title: 'Balance the Day: Level Up',
    instruction:
      "Same six hours — but this time, as you fill them, notice which ones you'd actually look forward to versus just fall into.",
    slots: 6,
    items: balanceLower.game.items,
    verdicts: {
      allScreen:
        "All screens, and be honest — does that actually feel good right now, or just familiar? A day that's only screens doesn't leave room to find out.",
      noScreen:
        "Zero screens isn't the goal either — that's swinging just as hard the other way. Screens can be one of the things that feels good. The question was never really \"how many,\" it's \"does this still feel good, or am I just still here.\"",
      level:
        "Look at that — level, and probably because some of this actually sounded good to choose, not just easy to default to. That's the whole trick at this age: noticing, not counting.",
    },
  },

  rule: {
    who: 'Comet',
    text: "The upgraded rule for the Bay: counting hours matters less as you get older than noticing how you actually feel. Glimmer-type stuff is built to feel fine in the moment, so \"do I feel fine\" isn't always a reliable stop sign — check in with yourself, on purpose, sometimes, and let that be the thing that decides when enough's enough.",
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
 * shapes only, no image assets), so "Compare" here means comparing the
 * trusted original against the version going around, not literal
 * side-by-side altered-image spotting the way the SLS "Interactive Images,
 * Compare" activity does. That reading is deliberate rather than a
 * shortfall: for a media-literacy lesson the comparison that teaches is
 * source-against-claim, and it needs no photographs to be real.
 *
 * Both bands now run the bespoke **Detective/Compare** mechanic that
 * Milestones Phase 2 originally specified (`minigames/MiniGameCompare.jsx`),
 * replacing the Spot (P1–P3) and Sort (P4–P6) stand-ins that stood here
 * while it was unbuilt. Same component, different `framework`: 'stopcheck'
 * for P1–P3, 'sure' for P4–P6, where every mismatch also names the S.U.R.E.
 * question that catches it.
 */

const fableFallsLower = {
  story: [
    {
      who: 'Comet',
      text: `Fable Falls. Every tale that's ever been told in the Atlas ends up in this water eventually — some of it true, some of it made up along the way. ${COMET_CATCHPHRASE}`,
    },
    {
      who: 'The Echo',
      text: "Did you hear?? Mia got sent to the office for stealing snacks from the canteen! Everyone's saying it! I heard it from someone who heard it from someone!",
    },
  ],

  decision: {
    prompt: 'The Echo is very sure about this one. What do you do?',
    options: [
      {
        id: 'spread',
        text: "It's probably true if everyone's saying it — I'll tell people too!",
        tag: 'Option A',
        safe: false,
        who: 'Comet',
        response:
          "The tale tumbles further down the Falls, getting a little bigger each time. Here's the thing about The Echo: it repeats whatever it hears, loudly and confidently — but it never once checked if any of it was true. Want to look again?",
      },
      {
        id: 'stopcheck',
        text: '🛑 STOP — I\'ll pause. ✅ CHECK — I\'ll ask a trusted adult or look for another source before I believe or share this.',
        tag: 'Option B',
        safe: true,
        who: 'Comet',
        response:
          "The water goes still and clear right where you stood. Turns out Mia wasn't in trouble at all — she was helping count snacks for the class party. One pause saved a rumour from growing.",
      },
    ],
  },

  game: {
    type: 'compare',
    framework: 'stopcheck',
    title: 'Sort the Tales',
    instruction:
      "Two versions of the same story, side by side. The left one you can go and check yourself. Click every line on the right that doesn't match it — some lines are perfectly fine, and some were never in the original at all.",
    original: {
      label: 'What actually happened',
      source: 'On the class noticeboard — you can go and read it',
    },
    going: { label: "What's going round", source: 'Passed along by The Echo' },
    pairs: [
      {
        id: 'c1',
        original: 'Mia was in the office at lunchtime.',
        going: 'Mia was in the office at lunchtime.',
        changed: false,
        note: 'Same in both. This bit really did happen — which is exactly what makes the rest sound believable.',
      },
      {
        id: 'c2',
        original: 'She was helping count snacks for the class party.',
        going: 'She was caught stealing snacks.',
        changed: true,
        note: 'Helping became stealing. That is not a small change — it is a completely different story about a real person.',
      },
      {
        id: 'c3',
        original: 'Mrs Tan asked her to help.',
        going: 'Mrs Tan told her off.',
        changed: true,
        note: 'Asked to help became told off. Nobody who was actually there said that.',
      },
      {
        id: 'c4',
        original: 'The class party is on Friday.',
        going: 'The class party is on Friday.',
        changed: false,
        note: 'Same in both, and it is right there on the noticeboard. Not everything inside a rumour is made up.',
      },
      {
        id: 'c5',
        original: null,
        going: "Everyone's saying it, so it must be true.",
        changed: true,
        note: '"Everyone’s saying it" is not in the original at all. It is not where a story started — it is only how far it has travelled.',
      },
      {
        id: 'c6',
        original: null,
        going: 'Send it on quick, before she deletes it!',
        changed: true,
        note: 'Nothing in the original is in a hurry. Being rushed is a reason to 🛑 STOP, never a reason to share.',
      },
    ],
    settled:
      'Read side by side, the tale falls apart on its own — Mia was helping, not stealing. And the two lines pushing hardest to make you share were never in the original at all. That is what 🛑 STOP and ✅ CHECK actually looks like: put it next to something you can trust, before you pass it on.',
    doneLabel: 'Done comparing',
  },

  rule: {
    who: 'Comet',
    text: "The rule for Fable Falls: not everything that reaches you here is true, even things a lot of people are repeating. 🛑 STOP before you believe or share something surprising or upsetting. ✅ CHECK — ask a trusted adult, or see if you can find it from another place — before you pass it on.",
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
      text: 'Fable Falls, Cyber Defender Quest level. A video is going around claiming a classmate said something they never said — and it looks almost real.',
    },
    {
      who: 'The Echo',
      text: "Watch this!! I found it first! It's DEFINITELY real, look how real it looks! Everyone needs to see this before it gets taken down!",
    },
  ],

  decision: {
    prompt: 'The Echo wants you to share it right now, before you\'ve looked at it properly. What do you do?',
    options: [
      {
        id: 'shareNow',
        text: 'Share it now — it looks real, and everyone else is already sharing it.',
        tag: 'Option A',
        safe: false,
        who: 'Comet',
        response:
          "It spreads fast — and so does the embarrassment for the classmate it's about, once it turns out to be faked. \"Looks real\" and \"is real\" aren't the same thing, and \"before it gets taken down\" is exactly the kind of urgency that's designed to stop you thinking. Want to look again?",
      },
      {
        id: 'sure',
        text: "I'll run it through S.U.R.E. first — Source, Understand, Research, Evaluate — before I believe or share anything.",
        tag: 'Option B',
        safe: true,
        who: 'Comet',
        response:
          "Good call. Four questions, in order: where did this actually come from, what is it actually claiming, can you find it anywhere else trustworthy, and does it really add up? That's the whole method — and it takes less time than the embarrassment does to undo.",
      },
    ],
  },

  game: {
    type: 'compare',
    framework: 'sure',
    title: 'Cyber Defender Quest: The Clue Board',
    instruction:
      "The school's own post is on the left. The clip being forwarded around is on the right. Click every line on the right that does not hold up against it — then see which S.U.R.E. question caught each one.",
    original: {
      label: 'What the school posted',
      source: 'Official school account — the one you already follow',
    },
    going: { label: 'The clip going round', source: 'Forwarded to you by The Echo' },
    pairs: [
      {
        id: 's1',
        original: "Posted by the school's official account, which you already follow.",
        going: 'Posted by an account created yesterday, with no other posts.',
        changed: true,
        step: 'Source',
        note: 'Same story, different messenger. A brand-new account with no history is not a source — it is a stranger.',
      },
      {
        id: 's2',
        original: 'Assembly ran on Tuesday morning.',
        going: 'Assembly ran on Tuesday morning.',
        changed: false,
        note: 'Matches. This part is simply true, and you could check it a dozen ways.',
      },
      {
        id: 's3',
        original: 'A student read out a poem about the school fair.',
        going: 'A student was recorded insulting the whole class.',
        changed: true,
        step: 'Understand',
        note: 'The caption claims far more than any clip could actually show. Ask what is being claimed, exactly.',
      },
      {
        id: 's4',
        original: 'The full recording runs four minutes.',
        going: 'An eight-second clip, starting mid-sentence.',
        changed: true,
        step: 'Understand',
        note: 'Eight seconds out of four minutes is not the event — it is the part somebody chose for you.',
      },
      {
        id: 's5',
        original: 'Two classmates who were there describe the same thing.',
        going: "Two classmates who were there say it didn't happen that way.",
        changed: true,
        step: 'Research',
        note: 'The people actually in the room disagree with the clip. That outweighs how real it looks.',
      },
      {
        id: 's6',
        original: 'The school newsletter covers the assembly.',
        going: 'Searching turns up nothing on any news site or school page.',
        changed: true,
        step: 'Research',
        note: 'If something this big were real, it would not exist only inside one forwarded clip.',
      },
      {
        id: 's7',
        original: 'Nothing about it is especially surprising.',
        going: "It's shocking, and it lands the week before the fair.",
        changed: true,
        step: 'Evaluate',
        note: 'Too shocking, too perfectly timed. That is the moment to slow down, not to speed up.',
      },
      {
        id: 's8',
        original: 'Fine to talk about at home.',
        going: 'Fine to talk about at home.',
        changed: false,
        note: 'Matches. Not every line in a suspicious post is suspicious — calling this one a lie would be its own mistake.',
      },
    ],
    settled:
      'Side by side, the clip loses — and notice you never had to prove the video itself was edited. The source was brand new, the caption outran the footage, the people who were there disagreed, and it arrived far too conveniently.',
    doneLabel: 'Close the case',
  },

  rule: {
    who: 'Comet',
    text: "S.U.R.E., every time something makes you want to react fast: Source — who actually posted this, and do you trust them? Understand — what is it actually claiming, exactly? Research — can you find it confirmed somewhere else you trust? Evaluate — does it really add up, or is it a little too perfect, too shocking, too convenient? Four questions is usually enough to catch a fake.",
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
    topic: 'Passwords & personal info',
    stamp: { icon: 'key', label: 'Passworld · Visited' },
    enabled: true,

    world: {
      spawn: { x: 10, y: 84 },
      // minY keeps the Traveler below the wall's base (scene y=188), so they
      // can't walk up into the stonework.
      bounds: { minX: 5, maxX: 94, minY: 68, maxY: 90 },
      stops: {
        story: { x: 68, y: 72, label: 'Keeper Vex', action: 'Talk' },
        decision: { x: 68, y: 72, label: 'Keeper Vex', action: 'Answer' },
        game: { x: 20, y: 78, label: 'the vault doors', action: 'Sort' },
        rule: { x: 51, y: 74, label: 'the open gate', action: 'Go through' },
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

    world: {
      spawn: { x: 12, y: 86 },
      // The near ridge dips to scene y=198; minY clears it so the Traveler
      // always stands in front of the mountain rather than inside its face.
      bounds: { minX: 6, maxX: 93, minY: 72, maxY: 92 },
      stops: {
        story: { x: 72, y: 76, label: 'the shape in the fog', action: 'Look' },
        decision: { x: 72, y: 76, label: 'the message', action: 'Reply' },
        game: { x: 18, y: 82, label: 'the lookout', action: 'Read' },
        rule: { x: 84, y: 76, label: 'the clear path', action: 'Take it' },
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
    blurb: 'Murky water that reflects whatever gets posted about the folks who live here.',
    topic: 'Cyberbullying & kindness',
    stamp: { icon: 'heart', label: 'Bully Bog · Visited' },
    enabled: true,

    world: {
      spawn: { x: 10, y: 88 },
      // The bank starts at scene y=188; minY keeps the Traveler on it instead
      // of out on the open water.
      bounds: { minX: 5, maxX: 92, minY: 70, maxY: 92 },
      stops: {
        story: { x: 48, y: 76, label: 'Pockets', action: 'Listen' },
        decision: { x: 66, y: 74, label: 'the comment', action: 'Respond' },
        game: { x: 24, y: 74, label: 'the murky water', action: 'Clear it' },
        rule: { x: 48, y: 78, label: 'Pockets', action: 'Talk' },
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

    world: {
      spawn: { x: 8, y: 88 },
      bounds: { minX: 5, maxX: 93, minY: 74, maxY: 93 },
      stops: {
        story: { x: 40, y: 80, label: 'The Glimmer', action: 'Listen' },
        decision: { x: 40, y: 80, label: 'The Glimmer', action: 'Answer' },
        game: { x: 22, y: 90, label: 'the tide line', action: 'Plan the day' },
        rule: { x: 84, y: 84, label: 'the bonfire', action: 'Sit down' },
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
    blurb: "A waterfall of stories, where some of what tumbles down turns out to be true — and some doesn't.",
    topic: 'Fake news & altered images',
    stamp: { icon: 'eye', label: 'Fable Falls · Visited' },
    enabled: true,
    reportBlockEligible: true,

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
  return [...ACTIVE_REALMS].sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
}

/**
 * Resolve a realm + band into the flat shape the rest of the app expects
 * (`realm.story`, `.decision`, `.game`, `.rule`, alongside the always-shared
 * `.world`/`.accent`/etc.). Falls back to `bands.lower` when a band's content
 * hasn't been authored yet, so the app never breaks mid-development.
 */
export function getBandView(realm, band = 'lower') {
  const content = realm.bands[band] ?? realm.bands.lower;
  return { ...realm, ...content };
}

/**
 * Traveler's Pledge, written in the child's own voice (storyline.md finale).
 * Drafted per Improvement Plan §5's open item, but only realms currently in
 * `ACTIVE_REALMS` should ever render — see `activePledge()` below. Now that
 * Fable Falls is enabled its line renders like everyone else's; the filter
 * stays in place as a safety net for the next realm that ships disabled.
 */
export const PLEDGE = [
  { realm: 'passworld', text: 'I’ll keep my personal info to myself.' },
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
