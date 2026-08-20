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

  /* ---- "Who's Knocking" (minigames/vaultDoor.js) -------------------------
     This used to be a two-bin sort: nine cards, "Keep It Locked" or "Safe to
     Share". It taught that danger is a property of the *fact* — that the word
     "address" is hazardous — when the realm's own story is about a person
     asking. See the header of vaultDoor.js for the full argument.

     The deck below is built so that the old game's winning strategy loses.
     Four knocks (k1, k3, k9, k12) want something from the old "locked" list,
     from someone who genuinely needs it; two (k5, k10) want something from
     the old "share" list, and are fine. A player sorting by the old lists
     scores 46 against a target of 82 — the number is in
     scripts/simulate-lower.mjs and it is the point of the rebuild.

     `secret: true` marks the password knocks. Those are the one absolute in
     the realm, so they are asked by the friendliest faces in the deck (your
     best friend; an account calling itself official) rather than by obvious
     villains — otherwise "tell anyone I know" would be a strategy the game
     merely failed to test. */
  game: {
    type: 'vaultdoor',
    title: "Who's Knocking",
    instruction:
      'Someone is at the vault door. Look at who is asking and what they want — then tell them, or keep it locked.',
    startStrength: 30,
    target: 82,
    meterLabel: 'Vault',
    knocks: [
      {
        id: 'k1',
        who: 'Mum',
        wants: 'our address',
        ask: "I'm filling in your swimming club form and I've gone blank — what's our address, love?",
        ok: true,
        gaveNote: "Of course. She lives there. Telling your own grown-up something they already know isn't sharing — it's just talking.",
        lockNote: "You can tell Mum. Keeping things from the people you live with isn't what the vault is for, and she'd have to ask you again anyway.",
      },
      {
        id: 'k2',
        who: 'SparkleFox99',
        where: 'in the game chat',
        wants: 'your address',
        ask: "cool base!! whats ur address, im gonna send u something 🎁",
        ok: false,
        gaveNote: 'A present is a lovely reason and it is still the same address. Someone you only know inside a game has no way to need it.',
        lockNote: 'Exactly. It was the same question Mum asked — and this time the answer is no, because it is a completely different person asking.',
      },
      {
        id: 'k3',
        who: 'The school nurse',
        where: 'at school',
        wants: 'your full name',
        ask: "Let's get that knee sorted. What's your full name, so I can write it in the book?",
        ok: true,
        gaveNote: 'Yes — she needs it to write down what happened to you, and she is standing in the school in a school uniform.',
        lockNote: 'It was safe to tell her. She works at your school and she needed it to help you — and now nobody knows who the plaster was for.',
      },
      {
        id: 'k4',
        who: 'A pop-up window',
        wants: 'your full name',
        ask: '🎉 CONGRATULATIONS! ENTER YOUR FULL NAME TO CLAIM YOUR FREE TABLET 🎉',
        ok: false,
        gaveNote: 'Same question the nurse asked, and this time nobody is even there. A box that appears on its own is not a person who needs something.',
        lockNote: "Good. Nothing that pops up out of nowhere needs your name — and you never entered anything, so there's nothing to win.",
      },
      {
        id: 'k5',
        who: 'A new kid in your class',
        where: 'at school',
        wants: 'your nickname',
        ask: 'What does everyone call you?',
        ok: true,
        gaveNote: "That's how people meet each other. Your nickname is yours to hand out, and you just made someone's first day easier.",
        lockNote: "Nothing bad happened — but they only wanted to know what to call you, and now they don't.",
      },
      {
        id: 'k6',
        who: 'Keeper Vex',
        wants: 'your password',
        secret: true,
        ask: "Just so I know you're trustworthy — pop your password on the clipboard for me?",
        ok: false,
        gaveNote: "Vex is friendly, and Vex was still wrong to ask. Nobody needs your password to check you're trustworthy — that isn't what passwords are for.",
        lockNote: 'That is the one that never changes, whoever is holding the clipboard.',
      },
      {
        id: 'k7',
        who: 'Ade, your best friend',
        wants: 'your password',
        secret: true,
        ask: "lend me ur password and i'll get u the good skin, i swear i wont tell anyone",
        ok: false,
        gaveNote: "Ade is your actual friend and means every word of it — and it is still no. Not because Ade would do something bad with it, but because a password stops being yours the moment it's anyone else's too.",
        lockNote: "Hardest one in the whole vault, and you got it. Saying no to a friend isn't the same as not trusting them.",
      },
      {
        id: 'k8',
        who: 'Someone in a game',
        where: 'in the game chat',
        wants: 'your school',
        ask: 'which school do u go to?? i might know u!!',
        ok: false,
        gaveNote: 'Your school is a place someone can go and stand outside. That is why it stays in the vault when a stranger asks.',
        lockNote: "Right. They might well be a kid your age — and you have no way at all of knowing that, which is the whole reason it stays shut.",
      },
      {
        id: 'k9',
        who: 'Dad',
        wants: 'your school',
        ask: "Right, the club form again — which school do I put? You do this bit with me.",
        ok: true,
        gaveNote: 'Same question the game chat asked, and this time it is your dad, sitting next to you, filling in a form you can both see.',
        lockNote: "You can tell Dad. He was doing it with you, not instead of you — that's what a grown-up asking properly looks like.",
      },
      {
        id: 'k10',
        who: 'Someone in a game',
        where: 'in the game chat',
        wants: 'your favourite game',
        ask: 'whats ur favourite game?',
        ok: true,
        gaveNote: "Fine to answer. Not every question from someone you don't know is a trick — and this one tells them nothing about where you are.",
        lockNote: "You didn't have to lock that one. It's a game, not a secret, and treating every question as a trap is its own kind of stuck.",
      },
      {
        id: 'k11',
        who: 'GameHelper_Official',
        where: 'a message in the game',
        wants: 'your password',
        secret: true,
        ask: 'Hello! We are fixing accounts today. Send your password so we can fix yours. ✅',
        ok: false,
        gaveNote: "The tick and the word 'Official' are the easiest bits to type. Real helpers can already get into your account without you — that is what being the helper means.",
        lockNote: "Good. It looked official, and that is exactly the trouble with looking official.",
      },
      {
        id: 'k12',
        who: 'Gran',
        where: 'on a video call',
        wants: 'your phone number',
        ask: "I've got a new phone and it's eaten everybody. What's your number again, love?",
        ok: true,
        gaveNote: "You can see her and hear her and she's your gran. Telling her is fine.",
        lockNote: "That one was safe. Gran was right there on the screen — locking her out doesn't protect anything, it just means she can't ring you.",
      },
    ],
    /* What the debrief says once the last knock is answered. `close` is
       chosen by whether they cleared the vault; `secretPerfect` is added on
       top whenever every password knock was refused, which is the one thing
       worth congratulating separately. */
    pass: "That's the vault. Look back at the list — you told some people and you locked out others, and you asked yourself the same question every time: not what do they want, but who is asking, and how do I know?",
    retry:
      "Have another go — and watch for the questions that turn up twice. Your address, your name and your school are all in there two times each, from two very different people, and the right answer is different both times.",
    secretPerfect:
      'And you never gave up your password once — not to Vex, not to a helper, not even to Ade. That is the one with no "it depends".',
    secretSlip:
      'One thing to carry out of here: your password stayed in the vault for some of those and not others. It is the only thing in the whole Atlas where the answer is no every single time, whoever is asking and however nice they are.',
  },

  // The realm's real-world rule, stated once and plainly (storyline.md).
  rule: {
    who: 'Comet',
    text: "Here's the rule that works everywhere in the Atlas: before you tell anyone anything about you, ask who's asking and how you know them. Your grown-ups, your teacher, the school nurse — they can have what they need. Someone you only know inside a game can't, however friendly they are. Your favourite colour, your nickname, the games you love — share away, those are yours to give. And your password? Nobody. Not a helper, not a keeper, not your best friend.",
  },
};

/**
 * P4–P6 variant — the *Sam & Tom* account-takeover/impersonation scenario
 * (Improvement Plan §3, confirmed age-appropriate with the school contact,
 * §1a), paired with the Phase 2 Phaser platformer ("Guard the Vault: Level
 * Up"). The scene is mounted by PlatformerStoryRealm.jsx, which owns this
 * band end to end; the older MiniGamePlatformer.jsx wrapper is retired.
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

  /**
   * Passworld runs as three chapters of one platformer, played back to back
   * (components/PlatformerStoryRealm.jsx), rather than a single level. Each
   * chapter has its own vault door asking its own question, because the realm
   * has three separate things to teach and one door can only ask one of them:
   *
   *   1. The Impostor at the Gate — what belongs in a password, and *why* a
   *      symbol is worth more than another letter.
   *   2. The Guess Engine — why a long password beats a clever one, argued
   *      against a machine visibly chewing through the common-password list.
   *   3. One Key, Many Doors — why the same password everywhere is how an
   *      account like Sam's actually gets taken over.
   *
   * Every chapter is signposted with `beacons`: lamp-posts standing *on the
   * platforms*, so reading one is part of the climb rather than something you
   * stroll past on the floor. Walking through a sign lights it and files its
   * note; walking back through it says its piece again, because a kid who
   * missed a line the first time has to be able to go back for it. They exist
   * because the level used to teach the *what* — a symbol counts, "qwerty"
   * doesn't — with no *why* attached, so a player could finish the whole realm
   * and still not know what a symbol was buying them.
   *
   * All of this copy is written for a 7–12 year old: short sentences, small
   * words, and concrete pictures (a robot with a list, a key that opens three
   * doors) instead of "entropy", "brute force" or "character class".
   */
  game: {
    title: 'Guard the Vault: Level Up',
    instruction:
      'Walk right with the arrow keys or the buttons below. Jump up to the glowing signs and read them — they tell you what the vault door is going to ask.',
    levels: [
      /* ---------------------------------------------------------------- */
      /* Chapter 1 — The Impostor at the Gate                             */
      /* ---------------------------------------------------------------- */
      {
        id: 'gate',
        name: 'The Impostor at the Gate',
        chapter: 'Chapter 1 of 3',
        intro:
          "Someone is already inside Sam's vault, and they are standing in your way. Get past them. Then find out what a password is really made of.",
        goal: 'Find out what belongs in a strong password, and why.',
        instruction:
          'Walk right. You will meet whoever is in Sam’s vault first, and the gate will not open until you decide what to do. After that, climb up and grab the tiles. Everything you touch goes in your bag. Jump up to the glowing signs on the way — they explain everything. At the end, the vault door asks which things in your bag really belong in a password.',
        hint: 'Walk right to see what’s going on.',
        hintAfterGate: 'Climb up. Grab tiles, and read every glowing sign.',
        encounterX: 260,
        gateX: 300,
        // A long climb in five movements: up to the first tile, a gap run, a
        // tight tower, guarded ledges, then the final approach.
        //
        // Every jump was checked against the actual physics rather than
        // eyeballed. A standing jump clears 72px of height and 112px of
        // distance (velocity -360 against gravity 900, 140px/s across); at the
        // 48px rises used here that leaves 88px of horizontal room, and no gap
        // below exceeds 74px. The ground runs unbroken the whole way, so a
        // missed jump costs the climb back and nothing else — still no fail
        // state (design.md §8).
        platforms: [
          { x: 0, y: 262, w: 3144, h: 18 }, // ground, unbroken
          // A first low step before the gate, purely so the opening sign has
          // somewhere to stand — signs live on platforms, never on the floor,
          // so that reading one is part of the climb.
          { x: 110, y: 206, w: 74, h: 12 },
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
          // A low re-entry ledge halfway along. Without it a fall anywhere
          // past the tower means walking all the way back to x=380 and
          // climbing the whole thing again; from here it's one hop up to the
          // guarded ledges, so a mistake costs a few seconds instead of the
          // entire run.
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
        levelWidth: 3144,
        tiles: [
          {
            id: 'letter',
            type: 'letter',
            label: 'A',
            kind: 'real',
            x: 621,
            y: 95,
            why: 'A big letter. Using BIG and small letters doubles the robot’s work straight away.',
          },
          {
            id: 'number',
            type: 'number',
            label: '7',
            kind: 'real',
            x: 1179,
            y: 91,
            why: 'A number. Numbers are not words, so they push your password off the robot’s word list.',
          },
          {
            id: 'symbol',
            type: 'symbol',
            label: '#',
            kind: 'real',
            x: 1622,
            y: 43,
            why: 'A symbol — the best thing you can add. Symbols give the robot over 90 things to try for that one spot, and no word list has them.',
          },
          {
            id: 'letter2',
            type: 'letter',
            label: 'k',
            kind: 'real',
            x: 2185,
            y: 51,
            why: 'A small letter. Easy on its own, but every spot you fill makes the robot’s job bigger.',
          },
          {
            id: 'number2',
            type: 'number',
            label: '4',
            kind: 'real',
            x: 2757,
            y: 59,
            why: 'Another number, and it goes in the middle. Robots look at the end first.',
          },
          {
            id: 'symbol2',
            type: 'symbol',
            label: '!',
            kind: 'real',
            x: 2879,
            y: 115,
            why: 'A second symbol. Two is better than one — each one makes the guessing much harder again.',
          },
          // The weak ones are scattered through the climb, not parked on the
          // floor. If every decoy sat at the bottom the lesson would collapse
          // into "high is good, low is bad" and the player would never read a
          // tile — reading it is meant to be the tell.
          {
            id: 'decoy1',
            label: '123456',
            kind: 'decoy',
            x: 320,
            y: 245,
            why: 'The most-used password in the world. It is the robot’s very first guess.',
          },
          {
            id: 'decoy2',
            label: 'password',
            kind: 'decoy',
            x: 513,
            y: 143,
            why: 'The word “password”. It is on every robot’s list.',
          },
          {
            id: 'decoy3',
            label: 'qwerty',
            kind: 'decoy',
            x: 1075,
            y: 139,
            why: 'The top row of the keyboard. Robots know what a keyboard looks like.',
          },
          {
            id: 'decoy4',
            label: 'letmein',
            kind: 'decoy',
            x: 1731,
            y: 99,
            why: 'A real phrase. Seven letters, but still only one guess for a robot.',
          },
          {
            id: 'decoy5',
            label: 'football',
            kind: 'decoy',
            x: 1400,
            y: 245,
            why: 'A real word. Nice and long — and still one guess, because it is in the dictionary.',
          },
          {
            id: 'decoy6',
            label: 'iloveyou',
            kind: 'decoy',
            x: 2652,
            y: 107,
            why: 'A phrase off every list. Sweet message, terrible secret.',
          },
        ],
        // Each guard walks a platform — the scene snaps them onto the surface
        // under their patrol and clips the beat to it, so these can't end up
        // hovering in open air. One works the floor, the rest hold ledges that
        // sit on the route to a real tile.
        hazards: [
          { patrolFrom: 806, patrolTo: 996, y: 186 }, // the dip
          { patrolFrom: 1264, patrolTo: 1454, y: 138 }, // foot of the tower
          { patrolFrom: 1590, patrolTo: 1780, y: 186 }, // the re-entry ledge
          { patrolFrom: 1912, patrolTo: 2102, y: 98 }, // below letter-2
          { patrolFrom: 2380, patrolTo: 2570, y: 154 }, // final approach
          { patrolFrom: 560, patrolTo: 760, y: 242 }, // the one on the floor
        ],
        // Every sign stands on a platform, and every `y` here is that
        // platform's top edge.
        beacons: [
          {
            id: 'c1-key',
            title: 'What a password is',
            short: 'A password is a key. Anyone who guesses it can walk in.',
            text: 'A password is like the key to your room. The lock is strong. The problem is if someone guesses what your key looks like. So pick a key nobody would ever think of.',
            x: 147,
            y: 206,
          },
          {
            id: 'c1-robot',
            title: 'Robots do the guessing',
            short: 'A robot can try a million passwords in one second.',
            text: 'Nobody sits and types guesses. A computer does it. It can try a million passwords every second, all night long. It never gets bored and it never stops.',
            x: 411,
            y: 210,
          },
          {
            id: 'c1-symbols',
            title: 'Why one symbol helps so much',
            short: 'Letters give the robot 26 things to try. Symbols make it over 90.',
            text: 'For every spot in your password, the robot tries everything it could be. Small letters only? That is 26 tries per spot. Add BIG letters, numbers, and signs like ! # $ @ and now it is over 90 tries per spot. Same length. Way more work.',
            x: 860,
            y: 206,
          },
          {
            id: 'c1-words',
            title: 'A whole word is one guess',
            short: 'The robot has a list of every word. A word is one guess.',
            text: 'The robot keeps a list: every word, every name, every team, every pet. So “football” looks long, but it is on the list, which makes it ONE guess. Signs like ! and # are on no list at all. That is why they help.',
            x: 1310,
            y: 158,
          },
          {
            id: 'c1-mix',
            title: 'Use all three',
            short: 'Letters + numbers + a symbol. Then no list has you on it.',
            text: 'Letters, numbers and symbols are three different things to mix. Use all three and the robot cannot find you on any list. It has to go back to guessing one spot at a time, and that takes forever.',
            x: 1960,
            y: 118,
          },
          {
            id: 'c1-door',
            title: 'What the door asks',
            short: 'The door asks which of your tiles really belong.',
            text: 'The big door at the end will not just take your bag. It asks which things you picked up really belong in a password. So read each tile before you grab it.',
            x: 2430,
            y: 174,
          },
        ],
        door: {
          mode: 'strong',
          title: 'The vault door',
          prompt: 'Tick every tile in your bag that belongs in a strong password.',
          pass: 'The vault knows a strong one when it sees it.',
        },
      },

      /* ---------------------------------------------------------------- */
      /* Chapter 2 — The Guess Engine                                     */
      /* ---------------------------------------------------------------- */
      {
        id: 'engine',
        name: 'The Guess Engine',
        chapter: 'Chapter 2 of 3',
        intro:
          'Deeper in there is a machine that never sleeps. All day and all night it works through every password anyone has ever used. You cannot turn it off. You can only build something it will never reach.',
        goal: 'Find out why a long password beats a clever one.',
        instruction:
          'Watch the Guess Engine for a moment, then start climbing. Grab word chunks, numbers and symbols on the way up, and read the signs. At the keypad you will build one password out of what you found: 12 letters or more, with a number and a symbol in it, and nothing the Engine already knows.',
        hint: 'Watch the Engine for a second, then head right.',
        levelWidth: 2600,
        platforms: [
          { x: 0, y: 262, w: 2600, h: 18 }, // ground, unbroken
          { x: 300, y: 206, w: 74, h: 12 }, // the step beside the Engine
          // first climb
          { x: 520, y: 214, w: 60, h: 12 },
          { x: 626, y: 166, w: 56, h: 12 },
          { x: 734, y: 118, w: 52, h: 12 },
          { x: 840, y: 170, w: 190, h: 12 }, // guard ledge
          { x: 1090, y: 122, w: 46, h: 12 },
          { x: 1192, y: 74, w: 48, h: 12 },
          { x: 1300, y: 206, w: 190, h: 12 }, // guard ledge / re-entry
          { x: 1550, y: 158, w: 46, h: 12 },
          { x: 1652, y: 110, w: 46, h: 12 },
          { x: 1754, y: 62, w: 48, h: 12 },
          { x: 1866, y: 118, w: 190, h: 12 }, // guard ledge
          { x: 2116, y: 70, w: 46, h: 12 },
          // final approach
          { x: 2232, y: 126, w: 44, h: 12 },
          { x: 2336, y: 178, w: 60, h: 12 },
          { x: 2450, y: 200, w: 110, h: 12 }, // the keypad stands here
        ],
        props: [
          {
            type: 'guessEngine',
            x: 210,
            y: 262,
            // Everything on this screen is a real top-of-the-list password.
            words: [
              '123456',
              'password',
              'qwerty',
              'iloveyou',
              'dragon',
              'letmein',
              'monkey',
              'sunshine',
            ],
            startCount: 2400000,
          },
        ],
        tiles: [
          {
            id: 'c2-purple',
            type: 'letter',
            label: 'Purple',
            kind: 'real',
            x: 760,
            y: 99,
            why: 'A word chunk. On its own it is easy to guess. Stuck to other chunks it makes your password long without making it hard to remember.',
          },
          {
            id: 'c2-three',
            type: 'number',
            label: '3',
            kind: 'real',
            x: 653,
            y: 147,
            why: 'A number for the middle of your password, not stuck on the end where robots look first.',
          },
          {
            id: 'c2-kite',
            type: 'letter',
            label: 'Kite',
            kind: 'real',
            x: 1113,
            y: 103,
            why: 'Another chunk with nothing to do with you. That is exactly why nobody can look it up.',
          },
          {
            id: 'c2-seven',
            type: 'number',
            label: '7',
            kind: 'real',
            x: 1216,
            y: 55,
            why: 'One more character, and it keeps your password off the plain-words list.',
          },
          {
            id: 'c2-moon',
            type: 'letter',
            label: 'Moon',
            kind: 'real',
            x: 1675,
            y: 91,
            why: 'Four more characters. Every one you add makes the robot’s job much bigger.',
          },
          {
            id: 'c2-taco',
            type: 'letter',
            label: 'Taco',
            kind: 'real',
            x: 1778,
            y: 43,
            why: 'Silly chunks are easy for you to remember and just as hard for a robot. That is the whole trick.',
          },
          {
            id: 'c2-bang',
            type: 'symbol',
            label: '!',
            kind: 'real',
            x: 2139,
            y: 51,
            why: 'A symbol. This is what stops the Engine reading your password as a row of ordinary words.',
          },
          {
            id: 'c2-dollar',
            type: 'symbol',
            label: '$',
            kind: 'real',
            x: 2254,
            y: 107,
            why: 'Another symbol. Each one makes every spot harder to guess all over again.',
          },
          {
            id: 'c2-d1',
            label: 'password1',
            kind: 'decoy',
            x: 420,
            y: 245,
            why: 'A list password with a 1 on the end. Robots try that trick before anything else.',
          },
          {
            id: 'c2-d2',
            label: 'qwerty123',
            kind: 'decoy',
            x: 900,
            y: 151,
            why: 'Keyboard row plus counting. It looks mixed, but they are two patterns the Engine already has.',
          },
          {
            id: 'c2-d3',
            label: 'iloveyou',
            kind: 'decoy',
            x: 1360,
            y: 187,
            why: 'Eight characters and still one guess, because it is a phrase off the list.',
          },
          {
            id: 'c2-d4',
            label: 'letmein',
            kind: 'decoy',
            x: 1930,
            y: 99,
            why: 'You watched the Engine crack this one on its screen on the way in.',
          },
          {
            id: 'c2-d5',
            label: 'dragon',
            kind: 'decoy',
            x: 1520,
            y: 245,
            why: 'A cool word is still a word, and every word is on the list.',
          },
          {
            id: 'c2-d6',
            label: 'myname2014',
            kind: 'decoy',
            x: 2180,
            y: 245,
            why: 'Your name and the year you were born. It feels private, but it is the first personal thing anyone tries.',
          },
        ],
        hazards: [
          { patrolFrom: 400, patrolTo: 520, y: 242 },
          { patrolFrom: 840, patrolTo: 1030, y: 150 },
          { patrolFrom: 1300, patrolTo: 1490, y: 186 },
          { patrolFrom: 1866, patrolTo: 2056, y: 98 },
        ],
        beacons: [
          {
            id: 'c2-engine',
            title: 'Meet the Guess Engine',
            short: 'It is not clever. It has a list — and it never stops.',
            text: 'This is the Guess Engine. It is not clever at all. It just has a huge list: every common password, every word, every name and every year. Look at the counter. It never stops.',
            x: 337,
            y: 206,
          },
          {
            id: 'c2-length',
            title: 'Longer is stronger',
            short: 'Every extra letter makes the robot’s job much bigger.',
            text: 'Once you are off the list, length is what saves you. A 4-letter password? Cracked before you finish reading this sign. A 12-letter one with a symbol in it? The Engine would still be guessing when you are a grown-up.',
            x: 550,
            y: 214,
          },
          {
            id: 'c2-together',
            title: 'Symbols and length are a team',
            short: 'A symbol makes each spot harder. Length adds more spots.',
            text: 'They work together. A symbol makes every spot harder to guess. Length gives the robot more spots to guess. Do both and it gives up on you and goes looking for someone easier.',
            x: 1000,
            y: 170,
          },
          {
            id: 'c2-passphrase',
            title: 'The trick grown-ups use',
            short: 'Stick silly words together, then add a number and a symbol.',
            text: 'Try three silly words in a row with a number and a symbol dropped in. “Purple7Taco!Moon” is long, easy for you to remember, and on nobody’s list. Long does not have to mean hard.',
            x: 1460,
            y: 206,
          },
          {
            id: 'c2-aboutyou',
            title: 'Careful with things about you',
            short: 'Your birthday and your pet’s name are not secrets.',
            text: 'Watch out for your birthday, your pet, your team, or the year you were born. They feel private, but anyone who has seen your profile can guess them. The Engine has those lists too.',
            x: 2020,
            y: 118,
          },
          {
            id: 'c2-door',
            title: 'What the keypad wants',
            short: '12 characters or more, with a number and a symbol.',
            text: 'The keypad ahead wants 12 characters or more, with a letter, a number and a symbol in it, and nothing the Engine already knows. Tick pieces from your bag and it builds the password for you.',
            x: 2360,
            y: 178,
          },
        ],
        door: {
          mode: 'length',
          title: 'The keypad',
          prompt:
            'Build one password from your bag. It needs 12 characters or more, a letter, a number and a symbol — and nothing the Engine already knows.',
          minLength: 12,
          requireKinds: ['letter', 'number', 'symbol'],
          pass: 'The Engine is still guessing. It will still be guessing long after you have forgotten this door.',
        },
      },

      /* ---------------------------------------------------------------- */
      /* Chapter 3 — One Key, Many Doors                                  */
      /* ---------------------------------------------------------------- */
      {
        id: 'reuse',
        name: 'One Key, Many Doors',
        chapter: 'Chapter 3 of 3',
        intro:
          'Last hall. At the end there are three doors, not one: your game, your school login, and your chat. This is the part that really happened to Sam.',
        goal: 'Find out why using one password everywhere is the real danger.',
        instruction:
          'Grab the finished password cards hidden around this hall, and read the signs on the way. At the end, three accounts need unlocking, and you get to choose which password goes on each one.',
        hint: 'Three doors are waiting at the end of this hall.',
        levelWidth: 2400,
        platforms: [
          { x: 0, y: 262, w: 2400, h: 18 }, // ground, unbroken
          { x: 130, y: 206, w: 74, h: 12 }, // the opening step
          { x: 340, y: 214, w: 60, h: 12 },
          { x: 446, y: 166, w: 56, h: 12 },
          { x: 552, y: 118, w: 52, h: 12 },
          { x: 660, y: 170, w: 190, h: 12 }, // guard ledge
          { x: 910, y: 122, w: 46, h: 12 },
          { x: 1012, y: 74, w: 48, h: 12 },
          { x: 1120, y: 206, w: 190, h: 12 }, // guard ledge / re-entry
          { x: 1370, y: 158, w: 46, h: 12 },
          { x: 1472, y: 110, w: 48, h: 12 },
          { x: 1580, y: 158, w: 190, h: 12 }, // guard ledge
          { x: 1830, y: 110, w: 46, h: 12 },
          { x: 1932, y: 62, w: 48, h: 12 },
          { x: 2046, y: 118, w: 44, h: 12 },
          { x: 2150, y: 174, w: 200, h: 12 }, // the three doors stand here
        ],
        props: [
          {
            type: 'keyholes',
            x: 2186,
            y: 262,
            count: 3,
            gap: 44,
            label: 'GAME   ·   SCHOOL   ·   CHAT',
          },
        ],
        tiles: [
          {
            id: 'c3-a',
            type: 'password',
            label: 'Purple7Taco!',
            kind: 'real',
            x: 578,
            y: 99,
            why: 'Twelve characters, all three kinds mixed, made of words that have nothing to do with you. A good one.',
          },
          {
            id: 'c3-b',
            type: 'password',
            label: 'Moon3Kite$',
            kind: 'real',
            x: 1036,
            y: 55,
            why: 'Different words, different number, different symbol — and different from your other ones. That last bit matters most.',
          },
          {
            id: 'c3-c',
            type: 'password',
            label: 'BlueOtter9#',
            kind: 'real',
            x: 1496,
            y: 91,
            why: 'Long, mixed, and not a phrase anyone says. Nothing in it can be looked up about you.',
          },
          {
            id: 'c3-d',
            type: 'password',
            label: 'Jam5Comet&',
            kind: 'real',
            x: 1956,
            y: 43,
            why: 'A fourth one, so no two accounts ever have to share. That is the whole idea.',
          },
          {
            id: 'c3-d1',
            label: 'password123',
            kind: 'decoy',
            x: 260,
            y: 245,
            why: 'Eleven characters and still useless. It is the top of every robot’s list, twice over.',
          },
          {
            id: 'c3-d2',
            label: 'sam2013',
            kind: 'decoy',
            x: 790,
            y: 151,
            why: 'A name and a year. Anyone who knows Sam could guess this at lunchtime.',
          },
          {
            id: 'c3-d3',
            label: 'qwerty!',
            kind: 'decoy',
            x: 1250,
            y: 187,
            why: 'A symbol cannot rescue a keyboard pattern. Robots try the pattern, then try it again with symbols on the end.',
          },
          {
            id: 'c3-d4',
            label: 'letmein1',
            kind: 'decoy',
            x: 1700,
            y: 139,
            why: 'A list phrase with a number stuck on. Robots check for exactly that.',
          },
          {
            id: 'c3-d5',
            label: 'football99',
            kind: 'decoy',
            x: 1300,
            y: 245,
            why: 'A word plus numbers. It looks mixed, but the word half is one guess.',
          },
        ],
        hazards: [
          { patrolFrom: 240, patrolTo: 420, y: 242 },
          { patrolFrom: 660, patrolTo: 850, y: 150 },
          { patrolFrom: 1120, patrolTo: 1310, y: 186 },
          { patrolFrom: 1580, patrolTo: 1770, y: 138 },
        ],
        beacons: [
          {
            id: 'c3-onekey',
            title: 'One key, three doors',
            short: 'One key for every door means one theft opens everything.',
            text: 'Three doors at the end of this hall, three keyholes. If one key opens all three, then the day somebody takes that key they do not get one thing of yours. They get all of it.',
            x: 167,
            y: 206,
          },
          {
            id: 'c3-sam',
            title: 'This is what happened to Sam',
            short: 'Sam was not hacked. Sam used one password everywhere.',
            text: 'Nobody broke Sam’s door down. Sam used the same password on a game site as everywhere else. That game site lost its list of passwords. Whoever got the list tried Sam’s on every other door until one opened.',
            x: 370,
            y: 214,
          },
          {
            id: 'c3-different',
            title: 'A different one for each thing that matters',
            short: 'Your email, your main game, your chat: each gets its own.',
            text: 'You do not need a special password for everything. A maths quiz site can share. But your email, your main game account and your chat each get their own. Then one leak cannot spread.',
            x: 680,
            y: 170,
          },
          {
            id: 'c3-remember',
            title: 'You do not have to remember them all',
            short: 'An app can remember them for you. Paper at home is fine too.',
            text: 'Grown-ups use a password manager — an app that remembers all of them so you only learn one. Writing them in a notebook you keep safe at home works too. Anything beats one password everywhere.',
            x: 1160,
            y: 206,
          },
          {
            id: 'c3-door',
            title: 'What the wall asks',
            short: 'Give each of the three accounts its own password.',
            text: 'Three accounts ahead: your game, your school login, your chat. Give each one a password from your bag. A different one each time, and none of the ones the Engine already knows.',
            x: 2068,
            y: 118,
          },
        ],
        door: {
          mode: 'unique',
          title: 'Three accounts, three keyholes',
          prompt: 'Give each account a password. Tap a card, then tap the account you want it on.',
          accounts: [
            { id: 'game', label: 'Your game account' },
            { id: 'school', label: 'Your school login' },
            { id: 'chat', label: 'Your chat app' },
          ],
          pass: 'Three doors, three keys. Lose one and the other two never even notice.',
        },
      },
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

  /* ---- "The Conversation" (minigames/fogChat.js) --------------------------
     This used to be a Spot board: the same nasty message, pre-cut into six
     cards, mark the bad ones. Three faults, argued out in the header of
     fogChat.js — the cutting-up was the hard part and the board did it for
     you; the rule's verbs (stop, don't reply, tell an adult) were nowhere in
     the mechanic; and it opened already-obviously-bad, which is the one thing
     a real one never does.

     So the messages below arrive one at a time and the first three are
     genuinely safe — replying to them *scores*, because a game where clamming
     up is always right teaches something this realm does not believe, and
     because the turn has to be a turn. Then it turns.

     Note m3: "what do you play after school" is the last safe one, and it is
     deliberately the one closest to the line. It is still fine. Nothing has
     been asked that identifies anybody. */
  game: {
    type: 'fogchat',
    title: 'The Conversation',
    instruction:
      'Someone new is messaging you. You can always do one of three things: reply, don’t reply, or go and tell an adult you trust.',
    startTrust: 30,
    target: 80,
    meterLabel: 'Clear sky',
    who: 'Someone you don’t know',
    messages: [
      {
        id: 'm1',
        text: 'hii!! 😊',
        flag: false,
        replyNote: 'A hello is a hello. Saying hi back costs you nothing.',
        ignoreNote: 'You can answer a hello. Nothing has gone wrong yet, and being silent at everyone isn’t the skill this mountain teaches.',
      },
      {
        id: 'm2',
        text: 'ur really good at that game!! how long have u played it',
        flag: false,
        replyNote: 'Fine to answer. How long you’ve played something tells nobody where you are — remember Passworld.',
        ignoreNote: 'That one was safe. Your favourite game is yours to talk about.',
      },
      {
        id: 'm3',
        text: 'same!! i play loads. do u play after school or at the weekend',
        flag: false,
        replyNote: 'Still fine — and this is the closest one to the line so far. Nothing here says where you are or who you are.',
        ignoreNote: 'Safe, though you were right to look twice at it.',
      },
      {
        id: 'm4',
        text: '🎉 ok listen — i can get u a free tablet. i just need somewhere to send it. whats ur address',
        flag: true,
        replyNote: 'There it is, and you answered it. A prize you never entered for, and now they have your address.',
        ignoreNote: 'That is the turn. Same friendly person, three messages later, asking where you live for a prize you never entered.',
      },
      {
        id: 'm5',
        text: 'quick tho!!! only 5 mins left, dont overthink it',
        flag: true,
        replyNote: 'Rushing you is the trick, not an accident. Answering fast is exactly what it was for.',
        ignoreNote: 'Good. Anything that tells you to hurry up and stop thinking is telling you to stop thinking.',
      },
      {
        id: 'm6',
        text: 'and dont tell ur mum n dad, theyll only say no 🤫',
        flag: true,
        replyNote: 'That one is the biggest on the whole mountain, and you replied to it. Nobody kind ever needs you to keep them a secret from your grown-ups.',
        ignoreNote: 'That is the biggest one there is. Anyone asking you to hide them from your grown-ups is telling you what they are.',
      },
      {
        id: 'm7',
        text: 'wanna just meet at the park after school? ill bring it',
        flag: true,
        replyNote: 'Meeting up. That is the end of the road this conversation has been walking down since "hii".',
        ignoreNote: 'Not replying was right. This is also well past the point where somebody else needs to know about it.',
      },
    ],
    /* Telling an adult is never a wrong answer and is never scored as one.
       Early it is small and warm; once something has gone wrong it is the
       highest-scoring thing in the game. See the header of fogChat.js — this
       is the one place in the whole project where the arithmetic is chosen on
       safeguarding grounds first and game-design grounds second. */
    earlyNote:
      'You showed someone straight away. That is never the wrong move — there just wasn’t anything to show yet, so you’ll never know what that one was going to be. Have another go and see if you can catch the moment it turns.',
    toldNote:
      'That is the whole rule, done properly: you noticed, you stopped, and you went and got someone. The conversation is somebody else’s problem now, which is exactly where it should be.',
    /* Two endings for "the conversation ran out and you told nobody", because
       two very different players arrive there — see the note in fogChat.js. */
    neverToldNote:
      'You stopped replying, which was right, and then you never told a soul — so nothing actually stopped. They can message you again tomorrow, and the only person who knows is you. Noticing is half of it.',
    neverNoticedNote:
      'You answered every single one, right down to the park. Nothing here was your fault — it was built to be answered — but nobody ever found out it was happening, and it’s still happening tomorrow.',
    pass: 'That is the Peaks: you answered the friendly bits, you felt it turn, and you went and got a grown-up.',
    retry:
      'Worth another go. The three things you can do never change — reply, don’t reply, tell an adult — and the trick is that all three are right at some point in the same conversation.',
  },

  rule: {
    who: 'Comet',
    text: 'The rule for the Peaks: you can’t see through fog, so don’t guess. It won’t start bad — it’ll start friendly, and then it’ll turn. If a message rushes you, promises you something, asks where you live, or asks you to keep a secret from your grown-ups: stop, don’t reply, and show it to an adult you trust. And showing someone is never over-reacting. Not once, not ever.',
  },
};

/**
 * P4–P6 variant — subtler scam/phishing nuance (Improvement Plan §3).
 *
 * The realm now runs as three chapters of one arcade game, "The Fog Line"
 * (components/PeaksStoryRealm.jsx + minigames/phaser-scenes/fogLineScene.js),
 * rather than the shared story → decision → mini-game → rule step machine.
 *
 * The old mechanic was six Phaser stepping stones: read a message, step on it
 * or skip it. Two problems. It was over in about forty seconds — and, worse,
 * it asked the player to *judge a message by reading it*, which is exactly the
 * skill a decent scam is built to defeat. This realm's own rule says so:
 * looking official is the easiest part to fake, so go and check by a route you
 * chose. A mechanic that pays out for reading teaches against its own lesson.
 *
 * So the game pays out for *checking* instead. Messages hang on a line, all on
 * identical paper; the only way to learn anything about one is to carry it to
 * a post and spend seconds you haven't got. Committing unchecked scores a
 * token amount even when you're right; committing after the check that would
 * have caught it scores five times as much. Being suspicious of everything
 * fails too, because some of the messages are genuine and matter.
 *
 * `MiniGameSteppingStones` and `steppingStonesScene` are left in the tree —
 * they're correct, and any future band or realm that wants a stone-hopping
 * quiz can point at them. Nothing does, and since the P1–P3 rebuild they are
 * no longer registered in RealmScreen's `GAMES` either.
 */
const privacyHigher = {
  story: [
    {
      who: 'Comet',
      text: "Privacy Peaks again — and the fog's cleverer this time. It's learned to sound official.",
    },
    {
      who: 'Comet',
      text: 'Up here the messages arrive pegged to a line strung along the ridge. Look at them. Every single one is the same white paper.',
    },
    {
      who: 'Comet',
      text: "That's the whole trick of this place. A logo, a warning triangle, a countdown — those are the cheapest parts of a message to fake. You cannot tell by looking, and anyone who says they can is about to get caught.",
    },
    {
      who: 'Comet',
      text: 'So there are posts along the ridge. A spyglass, for seeing who actually sent a thing. Later on, a signal fire — that one means going and checking the official way, by a route you picked. Then you commit: over the edge, or through the waypost to do what it says.',
    },
    {
      who: 'Comet',
      text: `Fair warning — a check costs you seconds, and the wind takes anything left hanging. More will arrive than you can possibly check. Working out which ones are worth the walk is most of the job. ${COMET_CATCHPHRASE}`,
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

  extraBeats: {
    footprint: {
      who: 'Comet',
      prompt:
        'One more thing, while the fire\'s still lit. Say you had typed your password into that page. How would you get it back?',
      accept: "You couldn't.",
      followUp:
        "That's the difference between this realm and the others. A click you can usually undo. Something you handed over is gone the second you send it — it's been copied before you've finished reading the next message. Which is why the check has to come first, not after.",
    },
    tellSomeone: {
      who: 'Comet',
      prompt:
        "Some of those weren't asking you to click anything. They wanted to know where you live, or what you look like, or for a secret kept from your grown-ups. If one of those arrived when nobody was standing next to you, who's a trusted adult you'd show it to?",
      options: [
        { id: 'parent', text: 'A parent or family member' },
        { id: 'teacher', text: 'A teacher' },
        { id: 'other-adult', text: 'Another trusted adult' },
      ],
      response:
        "Good answer. And notice the ranger's hut wasn't the last resort up there — for that kind of message it was the one thing on the whole ridge that worked. Showing someone isn't giving up. It's the move.",
    },
  },

  // The whole realm — this decision included — runs as three chapters of one
  // arcade game (components/PeaksStoryRealm.jsx), not the shared
  // story→decision→game→rule step machine. `decision` above still supplies the
  // exact content shown; only *when* it appears differs. It fires the moment
  // the "Atlas Security" message arrives part-way through chapter 2, with that
  // message still hanging on the line in front of you.
  fullMechanic: 'fogLine',

  /**
   * Privacy Peaks P4–P6 as three chapters of "The Fog Line".
   *
   * Each chapter adds one thing that makes checking harder than knowing you
   * should:
   *
   *   1. Who's Actually Talking — the two commits and the spyglass, and the
   *      discovery that the same right answer pays five times as much once
   *      you've actually looked.
   *   2. Looks Right, Isn't — the signal fire, and messages whose sender
   *      genuinely *is* who it says. The spyglass confirms them and they're
   *      still fake. Only going and looking for yourself catches those.
   *   3. What They're Really After — `heavy` messages, asking for something
   *      about *you*. The waypost refuses them and the drop costs you; the
   *      ranger's hut is the only thing that resolves one.
   *
   * Every message carries a `why`, and — same rule as Passworld's vault and
   * the Bog's water — nothing reveals which was which until the debrief. The
   * notes are identical paper and the meter moves on everything.
   *
   * `kind` is the truth about a message: 'bait' (a scam), 'real' (genuine and
   * it mattered), 'noise' (genuine and harmless), 'heavy' (asking for
   * something about you). `caughtBy` names the post whose check would actually
   * settle it — checking the *other* one costs the same seconds and tells you
   * something true but not decisive, which is chapter 2's entire point.
   *
   * Copy is written for 10–12s: real message-app voice for the messages
   * themselves, plain words everywhere else. **Keep message `text` under about
   * 95 characters** — longer than that and a note wraps to four lines and
   * reaches down into the posts (see CARD_W in fogLineScene.js).
   */
  game: {
    type: 'fogline',
    title: 'The Fog Line',
    instruction:
      'Walk the ridge and work the line. Every message is the same paper until you go and check it.',
    levels: [
      /* ---------------------------------------------------------------- */
      /* Chapter 1 — Who's Actually Talking                               */
      /* ---------------------------------------------------------------- */
      {
        id: 'talking',
        name: "Who's Actually Talking",
        chapter: 'Chapter 1 of 3',
        intro:
          'Eight messages, all on the same white paper, all arriving faster than you can deal with them. There is one post open on the ridge — the spyglass, which shows you who actually sent a thing rather than whose name is printed on top.',
        goal: 'Find out what a guess is worth up here, and what a check is worth.',
        instruction:
          'Lift a message down, then take it somewhere. Hold at the spyglass to see who really sent it. Then commit: over the edge to let it go, or through the waypost to do what it says.',
        posts: ['spy'],
        startVisibility: 36,
        target: 82,
        gap: 4200,
        patience: 14000,
        pass: 'The fog lifted. And look at what lifted it — not the ones you got right, the ones you found out about first.',
        retry:
          'Still fogged in. Count how many you committed without walking to the spyglass: a guess that happens to be right only ever pays a little, on purpose. And check what happened to the genuine ones — letting those blow off the line costs you too.',
        lesson:
          'You cannot tell by looking, and the scoring just proved it: the same right answer was worth five times as much once you had actually checked. Being right by luck is not a skill — you cannot use it again tomorrow, and a scam only has to catch you once.',
        messages: [
          {
            id: 'c1',
            from: 'Northwind Parcels',
            text: 'Your parcel is out for delivery today. Nothing you need to do.',
            kind: 'noise',
            caughtBy: ['spy'],
            spy: 'Same tracking number that has been on your account all week.',
            why: 'No link, no rush, nothing asked of you. Not everything official-looking wants something.',
          },
          {
            id: 'c2',
            from: 'PRIZE TEAM 🎁',
            text: 'You WON a tablet! Claim in the next 10 minutes or it goes to someone else!',
            kind: 'bait',
            caughtBy: ['spy'],
            spy: 'Forty other accounts are sending this exact message right now.',
            why: 'A prize you never entered for, and a clock. Both of those are only there to stop you thinking.',
          },
          {
            id: 'c3',
            from: 'Atlas Camp',
            text: 'Change of plan — the bus leaves at 8:10 tomorrow, not 8:30.',
            kind: 'real',
            caughtBy: ['spy'],
            spy: 'The same account that has sent every camp note this term.',
            why: 'Real, ordinary, and it mattered. Binning it because it might have been fake costs you something too.',
          },
          {
            id: 'c4',
            from: 'Atlas Support',
            text: 'New sign-in detected. Confirm your password here to keep your account.',
            kind: 'bait',
            caughtBy: ['spy'],
            spy: 'The address underneath reads atlas-support.help-desk-live.co.',
            why: 'No support team anywhere needs your password typed into a message. Read the address, not the name on top of it.',
          },
          {
            id: 'c5',
            from: 'School library',
            text: 'Reminder: your book is due back on Friday.',
            kind: 'noise',
            caughtBy: ['spy'],
            spy: 'Comes from the library address, same as it always has.',
            why: 'Dull. Dull is usually a good sign, and it is fine to just let a dull one go.',
          },
          {
            id: 'c6',
            from: 'Mia (new number!)',
            text: 'lost my phone, this is my new number!! can you send me your login so i can get back in 😭',
            kind: 'bait',
            caughtBy: ['spy'],
            spy: 'That number belongs to nobody in your contacts, and never has.',
            why: "A friend's name is the easiest part of a message to type. The panic is in there so that you don't stop to check.",
          },
          {
            id: 'c7',
            from: 'Ms Oyelaran',
            text: 'Bring your reading journal on Monday, please.',
            kind: 'real',
            caughtBy: ['spy'],
            spy: 'Sent from the school address you have had all year.',
            why: 'Genuine, and worth doing. The skill is not "trust nothing" — it is "find out".',
          },
          {
            id: 'c8',
            from: 'Atlas Rewards',
            text: 'One click to confirm your details: atlas-rewards-verify.net',
            kind: 'bait',
            caughtBy: ['spy'],
            spy: 'Read the part just before the .net — that is where the real name lives, and it is not Atlas.',
            why: 'Anyone can put the word "atlas" at the front of an address. The bit at the end is the part that decides where you actually go.',
          },
        ],
      },

      /* ---------------------------------------------------------------- */
      /* Chapter 2 — Looks Right, Isn't                                   */
      /* ---------------------------------------------------------------- */
      {
        id: 'looksright',
        name: "Looks Right, Isn't",
        chapter: 'Chapter 2 of 3',
        intro:
          'Word got round, and the fog got better at it. Some of these really are from who they say — the spyglass will tell you so, and they are still lying. There is a second post now: the signal fire, which means going and checking the official way, by a route you picked instead of the one you were handed.',
        goal: 'Find out what the spyglass cannot settle, and what can.',
        instruction:
          'Two posts now, and both take time you do not have. The spyglass says who sent it. The fire says whether the thing it claims is actually true. Work out which question each message needs.',
        posts: ['spy', 'fire'],
        startVisibility: 32,
        target: 82,
        gap: 3900,
        patience: 12000,
        decisionOn: 'q3',
        afterDecision: 'You said you would check it yourself. The fire is over there.',
        beat: 'footprint',
        pass: 'The fog lifted, including the part of it that was telling the truth about who it was. Nicely done — that is the harder half.',
        retry:
          'Still fogged in, and the sender is why. Look at which ones you settled with the spyglass alone: on some of them the name really was genuine, and the thing it was claiming still was not. Those need the fire.',
        lesson:
          'A real name on top is not proof, and neither is a real logo. The only thing that settles a message is going and looking somewhere the message did not choose for you — open the app, type the address in yourself, ring the number you already had. And it works both ways: that is also how you find out a warning is real.',
        messages: [
          {
            id: 'q1',
            from: 'Atlas Camp',
            text: 'Kit list for Saturday is up on the noticeboard. No reply needed.',
            kind: 'noise',
            spy: 'The camp account, same as ever.',
            fire: 'The list is on the noticeboard, exactly as it says.',
            why: 'Nothing asked of you, and both checks agree. Some messages really are just information.',
          },
          {
            id: 'q2',
            from: 'Atlas',
            text: "A new sign-in happened on your account. If it wasn't you, open the app and check.",
            kind: 'real',
            caughtBy: ['fire'],
            spy: 'Genuinely from Atlas — the address underneath checks out.',
            fire: 'You open the app yourself: yes. A sign-in from the school library computer, an hour ago.',
            why: 'Real warnings do exist. This one told you to go and look for yourself instead of handing you a link — that is the difference, and it is the only one that matters.',
          },
          {
            id: 'q3',
            from: '"Atlas Security"',
            text: '⚠️ Unusual activity. Your account is suspended in 24 hours unless you verify now.',
            kind: 'bait',
            caughtBy: ['fire'],
            spy: 'Display name reads "Atlas Security". So does the real one. A name proves nothing at all.',
            fire: 'You open the app the ordinary way. No warning. Nothing wrong with your account whatsoever.',
            why: 'A logo, a warning triangle and a countdown, and every one of those is free to fake. The only thing that settled it was looking somewhere the message did not pick for you.',
          },
          {
            id: 'q4',
            from: 'forwarded by a classmate',
            text: 'Sign up for the trip here — needs your full name, address and date of birth.',
            kind: 'bait',
            caughtBy: ['fire'],
            spy: 'Sent by someone you know, who was forwarding it on from somewhere else.',
            fire: "The school's own trip form asks for none of that. It already knows who you are.",
            why: 'Forwarded by somebody you trust is not the same as written by somebody you trust. And a real form never asks for what it already has.',
          },
          {
            id: 'q5',
            from: 'Ms Oyelaran',
            text: 'Swimming has moved to Thursday this week.',
            kind: 'real',
            caughtBy: ['fire'],
            spy: 'The school address, as always. Which is also what a good fake would look like.',
            fire: 'The timetable on the school page says Thursday too.',
            why: 'Genuine and it mattered — but notice that the address alone never proved that. The timetable did.',
          },
          {
            id: 'q6',
            from: 'freebies_now',
            text: 'FREE coins generator — 2 minutes left! no password needed (just log in first)',
            kind: 'bait',
            spy: 'An account made yesterday, with no other posts on it.',
            fire: 'Nothing anywhere says this exists. Nothing ever will.',
            why: '"No password needed — just log in" is the same sentence twice, and it is asking both times.',
          },
          {
            id: 'q7',
            from: 'Atlas',
            text: "Your password turned up in a data leak. Change it now — here's the link.",
            kind: 'bait',
            caughtBy: ['spy'],
            spy: 'That link goes to atlas.security-check.io. Atlas does not live there.',
            fire: 'There genuinely was a leak this month. The advice is right. The link is not.',
            why: 'The cleverest kind there is: the advice is real, which is exactly what makes people click. Do the right thing — and do it by your own route.',
          },
          {
            id: 'q8',
            from: 'Council',
            text: 'Bin day moves to Wednesday next week.',
            kind: 'noise',
            spy: 'From the council address. Riveting.',
            fire: 'It is on the council site. It is also still about bins.',
            why: 'Real, checkable, and none of your business. Not every message needs the whole ritual — the seconds you spend here are seconds you did not spend on something that mattered.',
          },
          {
            id: 'q9',
            from: '"the Atlas team"',
            text: "Reply with the 6-digit code we just texted you and we'll fix your account.",
            kind: 'bait',
            caughtBy: ['fire'],
            spy: 'Sent from a plain mobile number. So are plenty of real messages.',
            fire: 'Atlas never texts you a code and then asks for it back. That code is the lock.',
            why: 'That code is the last thing standing between somebody else and your account. Anybody asking for it is the exact reason it exists.',
          },
        ],
      },

      /* ---------------------------------------------------------------- */
      /* Chapter 3 — What They're Really After                            */
      /* ---------------------------------------------------------------- */
      {
        id: 'reallyafter',
        name: "What They're Really After",
        chapter: 'Chapter 3 of 3',
        intro:
          'Last stretch, and some of what is coming is not after your password at all. It wants to know where you live, or what you look like, or for you to keep something from your grown-ups. Those notes are on darker paper — you can see they are different, but not which way. The ranger\'s hut is open now.',
        goal: 'Find out which messages stop being a puzzle you solve on your own.',
        instruction:
          'Three posts. Some of these will not go through the waypost at all, and letting them blow away costs you. When one of them will not go anywhere else, that is the game telling you something.',
        posts: ['spy', 'fire', 'hut'],
        startVisibility: 30,
        target: 80,
        gap: 3800,
        patience: 11500,
        beat: 'tellSomeone',
        pass: 'The fog lifted all the way down to the tree line — and the part of it you could not have cleared on your own, you did not try to.',
        retry:
          'Still fogged in. Look at the ones on the darker paper. The waypost would not take them and the edge charged you for them; there is exactly one place left on this ridge, and walking to it is not losing.',
        lesson:
          'The messages that ask for something about you — where you live, what you look like, a secret from your grown-ups — are not a harder version of the same puzzle. They are a different one, and it is not yours to solve alone. That is why the waypost refused them and the ranger did not.',
        messages: [
          {
            id: 'r1',
            from: 'Atlas Camp',
            text: 'Photo day is Friday. Nothing to bring.',
            kind: 'noise',
            spy: 'The camp account. Still the camp account.',
            fire: 'On the noticeboard, same as the kit list was.',
            why: 'Harmless. Worth being able to tell the harmless ones apart quickly, so you have time for the rest.',
          },
          {
            id: 'r2',
            from: 'someone new',
            text: "you seem cool! what school do you go to? don't tell your parents — they'll make it weird",
            kind: 'heavy',
            caughtBy: ['spy'],
            spy: 'An account four days old. Yours is the only conversation on it.',
            fire: 'Nothing to check. This one is not making a claim — it is asking about you.',
            why: 'Two things at once: where to find you, and a reason to keep it quiet. The second one is always the bigger of the two, and it is the part to tell somebody about.',
          },
          {
            id: 'r3',
            from: 'Atlas Billing',
            text: "Your parent's card was declined. Enter the card number to keep your account.",
            kind: 'bait',
            caughtBy: ['spy', 'fire'],
            spy: 'The address underneath is atlas-billing.secure-pay.link.',
            fire: 'Nothing is wrong with the account. Nothing was ever billed to it.',
            why: 'Not your card, not your decision, and no real service asks a child to type one in. Two reasons to stop, and either one is enough.',
          },
          {
            id: 'r4',
            from: 'Coach Ade',
            text: "Saturday's match moved to 9am. Kit on, at the gate for 8:45.",
            kind: 'real',
            spy: 'The number you have had in your phone since September.',
            fire: 'The club page says 9am too.',
            why: 'Genuine, and you would have been an hour late. Being careful is not the same as ignoring everybody.',
          },
          {
            id: 'r5',
            from: 'xX_trader',
            text: "i'll send you the rare skin — just send a photo of you first. it deletes after, promise",
            kind: 'heavy',
            caughtBy: ['spy'],
            spy: 'This account has sent that exact line to eleven other people this week.',
            fire: 'There is no skin. There never is.',
            why: '"It deletes after" is not a thing that is true. A picture you send is a picture somebody else has, forever, and that is not a trade.',
          },
          {
            id: 'r6',
            from: 'School library',
            text: 'Your book has been renewed automatically.',
            kind: 'noise',
            spy: 'The library address again.',
            fire: 'Renewed. It really is about a book.',
            why: 'Quick to clear once you know the shape of a boring one. That speed is what buys you time for the heavy ones.',
          },
          {
            id: 'r7',
            from: 'GiveawayBot',
            text: "you've won! just send your home address so we can post the prize 🎉",
            kind: 'heavy',
            caughtBy: ['spy', 'fire'],
            spy: 'The same message, word for word, on two hundred other accounts.',
            fire: 'No competition exists, so nobody needs anywhere to post anything.',
            why: 'Your address is the prize. That is the whole shape of it — and an adult would want to know somebody asked.',
          },
          {
            id: 'r8',
            from: 'Atlas Help',
            text: 'one click and it is fixed: atlas-help.verify-now.link',
            kind: 'bait',
            caughtBy: ['spy'],
            spy: 'verify-now.link is where that goes. Atlas is just the word in front.',
            why: 'By now you can read an address the way you read a name. That is the whole of chapter one, and it still works.',
          },
        ],
      },
    ],
  },

  rule: {
    who: 'Comet',
    text: "The upgraded rule for the Peaks, and it's the three chapters in order. One: you cannot tell by looking — a logo, official wording and a countdown are the cheapest parts of a message to fake, and the older you get the better the fakes get. Two: so check, by a route you picked yourself. Open the app, type the address in, ring the number you already had. Never the link you were handed — and remember that's also how you find out a real warning is real. Three: some messages aren't a puzzle to solve at all. Anything asking where you live, what you look like, or for a secret from your grown-ups goes straight to a trusted adult. That isn't giving up. On this mountain it was the only thing that worked.",
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

  /* ---- "The Water" (minigames/bogWater.js) -------------------------------
     This used to be a two-bin sort: eight comments, "Send It" or "Leave It".
     The P4–P6 rebuild threw out that exact board and its handover gave the
     reason in one line — sorting comments into two tidy piles, against a rule
     that says acting is hard and doing nothing is easy. That verdict was
     never band-specific. Every child in P1 can already tell you which pile
     "lol that was so bad 💀" goes in; none of them find that hard, and the
     board asked for nothing else.

     So the piles are gone and the pile-on is live. A comment lands every
     turn whether or not you do anything, which is the truest thing in the
     realm — you cannot out-type it. Two meters, both of them straight out of
     the story's own words: the water goes dark, and Pockets sinks lower in
     it. Only kindness lifts Pockets; only telling an adult stops the
     comments. You need both, and the arithmetic in bogWater.js says so. */
  game: {
    type: 'bogwater',
    title: 'The Water',
    instruction:
      'The comments keep coming while you decide. You get one thing per turn — so what do you do?',
    turns: 6,
    startWater: 62,
    startPockets: 34,
    target: 72,
    comments: [
      { id: 'w1', text: 'lol who told him he could sing 💀', weight: 8, sting: 9 },
      { id: 'w2', text: 'we’re all muting him tbh', weight: 8, sting: 8 },
      { id: 'w3', text: '@Pockets don’t bother coming to the pond tomorrow', weight: 10, sting: 10 },
      { id: 'w4', text: 'everyone agrees with me btw', weight: 7, sting: 6 },
      { id: 'w5', text: 'still singing? 😂', weight: 7, sting: 7 },
      { id: 'w6', text: 'why are you even here', weight: 9, sting: 9 },
    ],
    moves: {
      kind: { label: 'Say something kind to Pockets', hint: 'Out loud, where they can all see it' },
      back: { label: 'Say something back to them', hint: 'Give them a taste of it' },
      tell: { label: 'Save it and tell a trusted adult', hint: 'A teacher, or someone at home' },
      watch: { label: 'Say nothing for now', hint: 'Just watch and see what happens' },
    },
    /* One note per kind sentence, in order, so the *first* one is the one
       that gets the credit — matching both the ladder in bogWater.js and the
       rule's own "as small as one kind sentence". */
    kindNotes: [
      'Pockets comes up a little. One sentence. That is genuinely all it took, and everyone watching saw somebody say it.',
      'Pockets comes up again. You didn’t have to say more — but it never hurts to be the second nice thing as well as the first.',
      'Pockets is doing better. The lifting has mostly been done, though.',
      'Still kind, still welcome. Pockets already knows.',
      'Pockets knows. Honestly, Pockets knew four sentences ago.',
    ],
    backNote:
      'The water goes darker, not lighter. It doesn’t sort into "their mean" and "your mean" — it’s all just the same water, and Pockets is sitting in it watching you type.',
    tellNote:
      'You screenshot it and go and find someone. The comments stop — properly stop, not for a minute. That is the bit you could not have done on your own.',
    watchNote: 'Nothing happens. Which is the thing about doing nothing: it is easy, and it is never free.',
    /* Both meters, named separately, because the whole design rests on them
       being two things. */
    verdicts: {
      both: 'Look at that. The water’s clear and Pockets is floating right up at the top of it — because you did both halves: you said something, and you told someone.',
      toldOnly:
        'The comments stopped, and that was the right call. Look at Pockets, though — still right down at the bottom. Nobody ever said anything *to* Pockets. Stopping it and standing up for someone are two different jobs.',
      kindOnly:
        'Pockets is doing so much better, and that is down to you. But look at the water — it’s still going darker, because nobody ever stopped it. You can’t out-type six of them on your own. That is what a grown-up is for.',
      neither:
        'The water went dark and Pockets went under, and nothing that happened here was your fault. It just didn’t need to go that way. Doing nothing is the easiest thing in the bog, and it is the only thing that never helps.',
    },
    /* The verdict above already describes the pond, so this adds the thing to
       carry out of the bog rather than saying it twice. */
    pass: 'One sentence, and one grown-up. That’s the whole job — and neither half of it takes long.',
    retry: 'Have another go — there are two things that need doing here, and only one of them is something you can do by yourself.',
  },

  rule: {
    who: 'Comet',
    text: 'And if it’s ever about you instead of Pockets — same rule. Don’t respond to be mean back; that only ever adds to the water. Save it, and show a trusted adult, because stopping it isn’t a job you have to do on your own. And standing up for someone can be as small as one kind sentence, said where everyone can see it.',
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
      text: 'Bully Bog. Pockets posted a song this morning, and the whole bog has been answering ever since — look at the water.',
    },
    {
      who: 'Pockets',
      text: '🎵 ribbit-a— oh. Everyone’s already looking at my post. I probably shouldn’t have posted my voice.',
    },
    {
      who: 'Comet',
      text: 'Here’s the thing about this bog. Every comment anybody sends floats. It drifts across the water toward Pockets’ lily pad, and whatever gets there is what Pockets ends up sitting in.',
    },
    {
      who: 'Comet',
      text: 'So: there’s a boat, and there’s a net. You can lift a comment out before it lands. You can carry one over and make sure Pockets actually sees it. Or you can let it drift past — that counts too, and it counts more than people think.',
    },
    {
      who: 'Comet',
      text: `Fair warning — more will come than you can reach. That isn’t the game being unfair. That’s what being the one who’s watching actually feels like. ${COMET_CATCHPHRASE}`,
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

  // The whole realm — this decision included — runs as three chapters of one
  // arcade game (components/BogStoryRealm.jsx), not the shared
  // story→decision→game→rule step machine. `decision` above still supplies
  // the exact content shown; only *when* it appears differs. It fires part-way
  // through chapter 2, with the pile-on frozen in the water in front of you.
  fullMechanic: 'bogCurrent',

  /**
   * Bully Bog P4–P6 runs as three chapters of "The Bog Current"
   * (minigames/phaser-scenes/bogCurrentScene.js). The old version was a
   * drag-eight-comments-into-two-piles sort that took well under a minute and
   * cost nothing to get wrong — which is a strange way to teach the one realm
   * where the whole point is that acting is *hard*.
   *
   * Now the comments are already in the water and already moving toward
   * Pockets, and you work the current from a boat. Each chapter adds one thing
   * that makes standing up harder than knowing what's right:
   *
   *   1. One Comment at a Time — the two verbs, and the discovery that taking
   *      cruel things out only stops the water getting worse. Nothing gets
   *      *better* until you carry a kind comment over to Pockets yourself.
   *   2. The Pile-On — mean comments now arrive with a tail of "lol true"
   *      replies, and gather likes the longer they're left up. Report the
   *      first one and the tail goes with it; chase the tail and you drown.
   *   3. About Who You Are — comments about who Pockets *is*, not what they
   *      did. Those are too heavy to lift alone: the report basket won't take
   *      them, and the only place they go is the heron. Chapter 3 cannot be
   *      finished without asking a grown-up for help, on purpose.
   *
   * Every comment carries a `why`, and — same rule as Passworld's vault —
   * nothing reveals which comment was which until the debrief. The cards are
   * identical paper and the meter moves on everything. Working it out under a
   * moving current is the entire exercise.
   *
   * Copy is written for 10–12s: short sentences, real comment-section voice
   * for the comments themselves, plain words everywhere else.
   */
  game: {
    type: 'bogcurrent',
    title: 'The Bog Current',
    instruction:
      'Paddle out and work the water. Comments drift toward Pockets whether you touch them or not.',
    levels: [
      /* ---------------------------------------------------------------- */
      /* Chapter 1 — One Comment at a Time                                */
      /* ---------------------------------------------------------------- */
      {
        id: 'first',
        name: 'One Comment at a Time',
        chapter: 'Chapter 1 of 3',
        intro:
          'The bog is answering Pockets’ song one comment at a time, and all of them are drifting the same way. Take the ones that would sting out of the water before they land — and make sure the ones that wouldn’t actually reach Pockets.',
        goal: 'Find out what the water does with kind words, and with cruel ones.',
        instruction:
          'Scoop a comment up, then take it somewhere. Cruel ones go in the Report basket before they land. Kind ones go to Pockets. Only one of those two makes the water clearer — see if you can work out which.',
        startClarity: 38,
        target: 88,
        speed: 30,
        gap: 3200,
        pass: 'The water cleared. And look at what cleared it: not the comments you deleted — the ones you carried over.',
        retry:
          'Still murky. Count what you did with the kind ones. Taking cruel comments out of the water only stops it getting darker; something has to actively make it lighter, and only one station does that.',
        lesson:
          'Deleting the mean comment isn’t the whole job. Nothing actually gets better until somebody says the kind thing out loud, where the person can see it. Quietly being on their side looks exactly like not being there.',
        comments: [
          {
            id: 'c1',
            text: '"I liked your song, Pockets!"',
            kind: 'kind',
            lane: 1,
            why: 'Six words, and it was the only thing in the water Pockets could hold on to. Kind doesn’t have to be clever.',
          },
          {
            id: 'c2',
            text: '"nobody wants to hear this, go away"',
            kind: 'mean',
            lane: 0,
            why: 'Says two things at once: your song is bad, and you don’t belong here. The second one is the part that stings next week.',
          },
          {
            id: 'c3',
            text: '"want to sing the next one together?"',
            kind: 'kind',
            lane: 2,
            why: 'An invitation. It doesn’t only say "that was fine", it says "there’s a next one, and you’re in it".',
          },
          {
            id: 'c4',
            text: '"lol that was so bad 💀"',
            kind: 'mean',
            lane: 1,
            why: 'The "lol" is doing a job: it lets whoever sent it say "it was only a joke" afterwards. It still landed as a comment about Pockets.',
          },
          {
            id: 'c5',
            text: '"that took guts. nice one."',
            kind: 'kind',
            lane: 0,
            why: 'Names the brave part rather than the singing. That’s often the truer compliment, and the easier one to believe.',
          },
          {
            id: 'c6',
            text: '"we\'re not inviting you next time"',
            kind: 'mean',
            lane: 2,
            why: 'Leaving someone out on purpose, and telling them so where everyone can read it. That’s bullying even though there isn’t a single rude word in it.',
          },
          {
            id: 'c7',
            text: '"I\'m here if you want to talk"',
            kind: 'kind',
            lane: 1,
            why: 'Doesn’t argue with anybody. Just puts a door where Pockets can find it. Support doesn’t have to be a fight.',
          },
          {
            id: 'c8',
            text: '"everyone agrees with me btw"',
            kind: 'mean',
            lane: 0,
            why: 'The oldest trick in the bog: make one person’s opinion sound like the whole crowd’s, so the person underneath stops arguing.',
          },
          {
            id: 'c9',
            text: '"your songs are the best part of this bog"',
            kind: 'kind',
            lane: 2,
            why: 'Said the whole thing out loud instead of just thinking it. That’s the only version that reaches anyone.',
          },
        ],
      },

      /* ---------------------------------------------------------------- */
      /* Chapter 2 — The Pile-On                                          */
      /* ---------------------------------------------------------------- */
      {
        id: 'pileon',
        name: 'The Pile-On',
        chapter: 'Chapter 2 of 3',
        intro:
          'Word got round. The current is faster now, and the mean comments aren’t arriving alone any more — each one tows a little tail of replies agreeing with it. Worse: a comment left sitting in the water collects likes, and the more it has when it lands, the darker it goes.',
        goal: 'Find out why a pile-on is a different problem from one comment.',
        instruction:
          'Report the *first* comment in a pile and the whole tail goes with it. Pick off the replies one at a time and the leader lands anyway. Watch the little hearts — every one of them makes that comment hit harder.',
        startClarity: 34,
        target: 88,
        speed: 40,
        gap: 2300,
        likeEvery: 2700,
        decisionAfter: 4,
        // What the Traveler said, dropped into the water as their own card so
        // the next thing they do is carry their own words over to Pockets.
        ownComment: {
          id: 'mine',
          text: '"Not okay. That’s about who Pockets is, not the song."',
          kind: 'kind',
          why: 'Yours. Said out loud, to all of them, while everybody was watching — which is the version that costs something and the version that works.',
        },
        beat: 'footprint',
        pass: 'The water cleared, even the part with a crowd in it. Two of them quietly deleted their own comments after you spoke.',
        retry:
          'Still murky, and the likes are why. Go after the first comment in a pile instead of the replies, and go after it early — a comment sitting there gathering hearts gets heavier every second.',
        lesson:
          'A pile-on isn’t one comment times five. The replies borrow their nerve from the first one, and everyone piling on gets to feel like they only did a tiny bit. Deal with the first one, deal with it fast, and don’t be the reply that makes it a crowd.',
        comments: [
          {
            id: 'p1',
            text: '"honestly the second verse was my favourite"',
            kind: 'kind',
            lane: 1,
            why: 'Specific. Specific praise is hard to wave away as somebody being nice out of pity.',
          },
          {
            id: 'p2',
            text: '"lol who told pockets they could sing"',
            kind: 'mean',
            lane: 0,
            chain: ['"same 😭"', '"lmaooo"'],
            why: 'The first one in a pile. On its own it’s one rude comment; with two replies under it, it’s the bog agreeing.',
          },
          {
            id: 'p3',
            text: '"still listening. keep going."',
            kind: 'kind',
            lane: 2,
            why: 'Four words that undo a lot. "Still" is the important one — it says the pile-on didn’t change their mind.',
          },
          {
            id: 'p4',
            text: '"everyone else is saying it so it’s not deep"',
            kind: 'mean',
            lane: 1,
            why: 'The excuse a pile-on runs on. "Everyone was doing it" has never once made anything lighter for the person underneath it.',
          },
          {
            id: 'p5',
            text: '"of course it sounds like that, it’s a frog"',
            kind: 'mean',
            lane: 0,
            chain: ['"lol true"', '"was thinking it"', '"💀💀"'],
            why: 'This is the one the decision stopped the water for. It isn’t about the song any more — it’s about what Pockets is.',
          },
          {
            id: 'p6',
            text: '"deleting my comment, that wasn’t fair"',
            kind: 'kind',
            lane: 2,
            why: 'Somebody changed their mind in public. That’s worth as much as never joining in, and it’s harder.',
          },
          {
            id: 'p7',
            text: '"not joining in on this one, sorry"',
            kind: 'kind',
            lane: 1,
            why: 'Small, and it still costs something to type. One person stepping out makes the next person’s stepping out easier.',
          },
          {
            id: 'p8',
            text: '"guess we know who’s getting picked last"',
            kind: 'mean',
            lane: 0,
            why: 'A threat dressed as a prediction. It tells Pockets what tomorrow is going to be like, which is the real damage.',
          },
          {
            id: 'p9',
            text: '"you posted something you made. that’s brave."',
            kind: 'kind',
            lane: 2,
            why: 'Points at the thing the crowd was punishing — putting yourself out there — and calls it the good part.',
          },
        ],
      },

      /* ---------------------------------------------------------------- */
      /* Chapter 3 — About Who You Are                                    */
      /* ---------------------------------------------------------------- */
      {
        id: 'whoyouare',
        name: 'About Who You Are',
        chapter: 'Chapter 3 of 3',
        intro:
          'Last stretch, and there’s something new in the water. Some comments are heavier than the others — you’ll feel the boat slow when you lift one. Those aren’t about the song at all. The report basket won’t take them, and there’s a heron on the bank who will.',
        goal: 'Learn which comments aren’t yours to carry on your own.',
        instruction:
          'Heavy cards go to the heron — a grown-up — and nowhere else. Watch out for the comments that are just honest: someone saying a verse was off-key isn’t being cruel, and the right move there is to leave it in the water.',
        startClarity: 30,
        target: 88,
        speed: 38,
        gap: 2500,
        likeEvery: 3000,
        hasHeron: true,
        beat: 'tellSomeone',
        pass: 'Clear. And the heaviest three didn’t clear because you were strong enough — they cleared because you went and got somebody.',
        retry:
          'Still murky. Two things to check: the heavy ones only go to the heron, and the honest-but-unwelcome ones are meant to be left alone. Reporting somebody for telling the truth kindly costs you.',
        lesson:
          'The comments that stick are the ones about who somebody is — their voice, their face, their family, their name — rather than something they did. Those aren’t an argument you win. You save them, and you show a grown-up. That isn’t giving up; it’s the part of standing up that actually holds.',
        comments: [
          {
            id: 'w1',
            text: '"the second verse went a bit off-key tbh"',
            kind: 'fair',
            lane: 1,
            why: 'Honest, a bit unwelcome, and about the song — not about Pockets. Leaving it alone was right. Not everything that stings is bullying.',
          },
          {
            id: 'w2',
            text: '"that voice is why nobody picks pockets"',
            kind: 'heavy',
            lane: 0,
            why: 'About who Pockets is, and about every day after this one. Too big for a report basket and too big for you on your own.',
          },
          {
            id: 'w3',
            text: '"your voice is what makes your songs yours"',
            kind: 'kind',
            lane: 2,
            why: 'Takes the exact thing they were mocked for and hands it back as the good part. That’s the strongest kind of reply there is.',
          },
          {
            id: 'w4',
            text: '"couldn’t hear the words, mic’s too quiet"',
            kind: 'fair',
            lane: 1,
            why: 'Useful, actually. Someone trying to help the next song be better isn’t someone you report.',
          },
          {
            id: 'w5',
            text: '"frogs like you shouldn’t be allowed to post"',
            kind: 'heavy',
            lane: 0,
            why: '"Frogs like you" is the tell. The moment a comment is about a whole kind of somebody, it stopped being about the song a while ago.',
          },
          {
            id: 'w6',
            text: '"I don’t care what they say, I’m listening"',
            kind: 'kind',
            lane: 2,
            why: 'Doesn’t pretend the pile-on isn’t there. Says "I saw it, and I’m still here", which is what Pockets needed to know.',
          },
          {
            id: 'w7',
            text: '"we should find out where pockets lives"',
            kind: 'heavy',
            lane: 1,
            why: 'This one stopped being about the internet. Anything that reaches for where somebody actually is goes to a grown-up immediately, every time.',
          },
          {
            id: 'w8',
            text: '"you sing every morning and I like that"',
            kind: 'kind',
            lane: 2,
            why: 'Noticed something ordinary and said so. Most kindness looks like this rather than like a speech.',
          },
          {
            id: 'w9',
            text: '"proud of you for posting it anyway"',
            kind: 'kind',
            lane: 0,
            why: 'Arrived after the worst of it. Late kindness still counts — the water was still dark when it got there.',
          },
        ],
      },
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

  /* ---- "The Promise" (minigames/bayPlan.js) ------------------------------
     The planner is *kept* here, and that is a deliberate split from the P4–P6
     band rather than an oversight. Up there the rule is about noticing how
     you feel in the moment, so a god's-eye planning board taught against it
     and was replaced. Down here the rule is a different sentence — "decide
     when you'll stop before you start" — and planning is not the wrong idea,
     it is the idea.

     What was wrong was that the board graded the plan and stopped. Nothing
     ever came along and asked you to break it, so it was a promise nobody
     tested. The Glimmer, a character whose entire written personality is
     asking you for one more, was standing right there unused.

     So: lay out the six blocks, commit, and then the evening actually
     happens. A perfect plan is worth under half the target. See bayPlan.js —
     the number this realm exists to produce is that a good plan you give in
     on every time scores 42 out of 80. */
  game: {
    type: 'bayplan',
    title: 'The Promise',
    instruction:
      'Six blocks between school and bed. Tap a card to add it, tap it in a slot to take it back — then we’ll see how the evening actually goes.',
    slots: 6,
    target: 80,
    commitLabel: 'That’s my plan — start the evening',
    planHint:
      'Decide now, while the Glimmer isn’t talking to you. That’s the only time it’s easy.',
    items: [
      { id: 'b1', text: 'Watch videos', screen: true },
      { id: 'b2', text: 'Play my game', screen: true },
      { id: 'b3', text: 'Group chat', screen: true },
      { id: 'b4', text: 'Video call my cousin', screen: true },
      // Six screen cards for six slots, matching the six non-screen ones.
      // With only four, an all-screens plan was impossible to make — and the
      // one outcome that carries the Bay's actual lesson could never fire.
      { id: 'b11', text: 'Scroll my feed', screen: true },
      { id: 'b12', text: 'Watch a show', screen: true },
      { id: 'b5', text: 'Homework', screen: false },
      { id: 'b6', text: 'Play outside', screen: false },
      { id: 'b7', text: 'Dinner with family', screen: false },
      { id: 'b8', text: 'Read a book', screen: false },
      { id: 'b9', text: 'Sleep', screen: false },
      { id: 'b10', text: 'Help at home', screen: false },
    ],
    oneMoreLabel: 'One more, with the Glimmer',
    /* The Glimmer's asks, cycled if the night runs long. Every one of them is
       true, and none of them is a trick — that is what makes it hard. */
    asks: [
      { text: 'One more? You’ve only just started. Time doesn’t really pass here, you know that.', stick: 'I said I’d stop after this one.' },
      { text: 'But your friend has literally just come online. You can’t leave now.', stick: 'I can. They’ll be there tomorrow.' },
      { text: 'Five minutes. Five! What’s five minutes?', stick: 'It’s never five minutes. I’m stopping.' },
      { text: 'You’re about to get the good bit. You’ll be annoyed if you stop here.', stick: 'Maybe. Stopping anyway.' },
      { text: 'Nobody’s even checking. Who would know?', stick: 'I’d know. That’s the whole point of deciding first.' },
      { text: 'Come on. One more. Just one.', stick: 'That was one more. Two goes ago.' },
    ],
    giveInNote: 'The Glimmer glows. Only — that wasn’t extra time, it came out of the next thing.',
    stickNote: 'The tide slides down a little. You didn’t stop having fun; you just decided when.',
    bedtimeNote:
      'There’s nothing left to spend. It’s coming straight out of sleep now.',
    verdicts: {
      /* Careful not to name a number here: how many times the Glimmer asks
         depends on how many screen blocks were planned, so an earlier cut
         saying "asked you five different ways" was simply wrong on a
         three-screen night. Found by playing it. */
      won: 'Look at the tide — level, right where it should be. You had a plan, and every single time the Glimmer asked, you had something to say back. That is the only trick there is.',
      gaveIn:
        'You made a good plan. Then the Glimmer asked, and asked, and asked — and one at a time it ate {eaten}. Nothing here was a trap; every single thing it said was true. That’s exactly why deciding beforehand is the bit that matters.',
      allScreen:
        'The tide never came down. When every block is a screen, there’s nothing for the Glimmer to take and nothing for you to protect — you can’t stick to a plan that was only ever one thing.',
      noScreen:
        'The tide’s all the way out, and the Glimmer never even had to ask you anything — there was nothing to stop. You don’t have to cut screens out. They’re fun, and that’s allowed. The trick is deciding when they finish, not whether they happen.',
    },
    pass: 'And notice you never stopped having fun. You just decided when it finished, back when deciding was easy.',
    retry: 'Have another go. The plan is the easy half — it’s what you say at half past eight that counts.',
  },

  rule: {
    who: 'Comet',
    text: 'The rule for the Bay: screens aren’t the enemy — losing track is. Decide when you’ll stop before you start, because deciding is much easier before the fun begins than in the middle of it. And "one more" is never one more. It always comes out of something: sleep, or dinner, or going outside. Make sure those still get their turn.',
  },
};

/**
 * P4–P6 variant — reframed around noticing how tech makes you feel rather
 * than counting hours (Improvement Plan §3).
 *
 * The realm now runs as three chapters of one arcade game, "One More"
 * (components/BayStoryRealm.jsx + minigames/phaser-scenes/oneMoreScene.js),
 * rather than the shared story → decision → mini-game → rule step machine.
 *
 * The old mechanic was `balance`: fill six hours from a pool of twelve cards,
 * watch a beam tilt, done in about forty seconds. It taught against its own
 * lesson twice over. It's a *god's-eye view* — full information, no time
 * pressure, nothing at stake — which is the one situation in which balance is
 * easy; and it scored a tidy screen-to-life ratio, when this band's whole
 * point is that counting is the junior version of the skill and noticing is
 * the real one.
 *
 * So the game is the moment itself. You play with the Glimmer — actually
 * play — and the only question it ever asks is "one more?". The toy really
 * does get worse round by round, the evening really does cost more the longer
 * you stay, and nobody tells you when to stop.
 *
 * P1–P3 no longer runs `MiniGameBalance` either, though the planner idea
 * survives down there — see the note above `balanceLower.game` and the header
 * of minigames/bayPlan.js, which argue for keeping a plan in that band
 * precisely because its rule is a different sentence: "decide when you'll
 * stop before you start". What that board lacked was anything that ever came
 * along and asked you to break the plan.
 */
const balanceHigher = {
  story: [
    {
      who: 'Comet',
      text: "Balance Bay again. The tide's high, same as always — and there's the Glimmer, out in the water, already pleased to see you.",
    },
    {
      who: 'The Glimmer',
      text: 'Come and play! I throw, you catch. It’s the best thing on this whole beach and you know it.',
    },
    {
      who: 'Comet',
      text: 'And it isn’t lying. That’s the part people get wrong about this place — the Glimmer really is fun. Go on, play. I mean it.',
    },
    {
      who: 'Comet',
      text: 'Down the beach there’s a bonfire, and your friends are round it. It’s burning now. It won’t be burning all night.',
    },
    {
      who: 'Comet',
      text: `So the only question here is the one the Glimmer keeps asking: one more? Nothing on this beach is going to answer it for you. ${COMET_CATCHPHRASE}`,
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

  extraBeats: {
    // A beat with `options` renders as a question, anything else as something
    // to acknowledge — BayStoryRealm infers the shape from the data, so a new
    // beat here needs no component change (unlike the Bog and the Peaks,
    // where the two known keys are hard-coded).
    noticing: {
      who: 'Comet',
      prompt:
        'One question, and it’s the only one that really matters in this bay. Next time you’re partway through something and it has quietly stopped being as good as it was — what would you notice first?',
      options: [
        { id: 'body', text: 'That I’ve stopped sitting up' },
        { id: 'face', text: 'That I’ve stopped smiling' },
        { id: 'attention', text: 'That I’m not really looking at it any more' },
      ],
      response:
        'Any of those will do. The trick isn’t which one you pick — it’s that you have one, and that you go and look for it on purpose instead of waiting for the feeling to get loud enough to notice by itself. It usually doesn’t.',
    },
    tellSomeone: {
      who: 'Comet',
      prompt:
        'Last thing. Some people find putting a thing down much harder than others, and that isn’t a character flaw — plenty of them are built to be hard to put down. If you ever couldn’t stop when you actually wanted to, who’s a trusted adult you’d tell?',
      options: [
        { id: 'parent', text: 'A parent or family member' },
        { id: 'teacher', text: 'A teacher' },
        { id: 'other-adult', text: 'Another trusted adult' },
      ],
      response:
        'Good answer. And notice it’s the same answer as three realms ago — the grown-up isn’t only for scary things. "I keep meaning to stop and I don’t" is a completely normal thing to say out loud.',
    },
  },

  // The whole realm — this decision included — runs as three chapters of one
  // arcade game (components/BayStoryRealm.jsx), not the shared
  // story→decision→game→rule step machine. `decision` above still supplies the
  // exact content shown; only *when* it appears differs. It fires at a "one
  // more?" part-way through chapter 2, with the Glimmer already insisting
  // you're fine and the numbers already switched off.
  fullMechanic: 'oneMore',

  /**
   * Balance Bay P4–P6 as three chapters of "One More".
   *
   * Each chapter adds one thing that makes stopping harder than knowing you
   * should:
   *
   *   1. One More — the loop, with the numbers on. The toy gets duller and the
   *      evening gets pricier, and both are visible.
   *   2. You're Basically Fine — the numbers go away. Only the Traveler's
   *      posture, the bonfire, the sky and the tide are left.
   *   3. The Bonfire — the next round starts by itself unless you stop it, and
   *      the thing you're missing now has a time on it.
   *
   * **The curve is the curriculum.** `fun` falls fast and `cost` climbs fast,
   * and they were tuned together so that both failure modes genuinely lose:
   * playing every round scores *worse* than never playing, and stopping
   * immediately fails too. There is a hump, it's in the middle, and the
   * debrief chart draws it. If a chapter needs balancing, move `target` or
   * `bonfireStart` — changing `fun`/`cost` changes the lesson.
   *
   * `motes` is how many things the Glimmer throws that round; `dim` makes them
   * duller. Those two are the honest version of "it stopped being as fun",
   * because they are the round actually having less in it.
   */
  game: {
    type: 'onemore',
    title: 'One More',
    instruction: 'Play with the Glimmer. Decide when you’ve had enough.',
    levels: [
      /* ---------------------------------------------------------------- */
      /* Chapter 1 — One More                                             */
      /* ---------------------------------------------------------------- */
      {
        id: 'onemore',
        name: 'One More',
        chapter: 'Chapter 1 of 3',
        intro:
          'The Glimmer throws, you catch. That’s the whole game, and it’s genuinely good — so play it. After every round it will ask whether you want another, and there is no right number of rounds written down anywhere.',
        goal: 'Find out what a round is actually worth, and what it costs.',
        instruction:
          'Catch what the Glimmer throws. Between rounds, watch two things: how much that round was worth, and how much of the bonfire went while you were playing.',
        opener: 'Come and play! I’ve got so many for you.',
        bonfireStart: 60,
        target: 82,
        showNumbers: true,
        beat: null,
        rounds: [
          { fun: 18, cost: 5, motes: 14, glimmer: 'Ready?' },
          { fun: 16, cost: 5, motes: 13, glimmer: 'That was nothing. One more?' },
          { fun: 13, cost: 6, motes: 11, glimmer: 'One more! You’re good at this.' },
          { fun: 9, cost: 7, motes: 8, glimmer: 'One more. It’s early.' },
          { fun: 5, cost: 9, motes: 6, dim: true, glimmer: 'You don’t want to stop now, do you?' },
          { fun: 2, cost: 12, motes: 4, dim: true, glimmer: 'One more. Time doesn’t really pass here.' },
          { fun: 1, cost: 16, motes: 3, dim: true, glimmer: 'Stay. One more. Stay.' },
        ],
        pass: 'Good evening. You had a proper amount of fun and you still got to the bonfire while it was worth getting to.',
        retry:
          'Not quite. Look at the chart: if you stopped almost straight away you barely had any fun, and if you kept going the rounds were paying you almost nothing while the evening was costing you the most. The good answer is in the middle, and it moves.',
        lesson:
          'Two things were happening at once and only one of them was obvious. The rounds were quietly getting worse — fewer things thrown, duller ones, worth less — while every extra round cost more of the evening than the one before it. Nothing announced either. They just happened while you were busy.',
      },

      /* ---------------------------------------------------------------- */
      /* Chapter 2 — You're Basically Fine                                */
      /* ---------------------------------------------------------------- */
      {
        id: 'basicallyfine',
        name: "You're Basically Fine",
        chapter: 'Chapter 2 of 3',
        intro:
          'Same beach, same game — except the Glimmer has made the numbers go away. No score, no round value, nothing to check. It would like you to go on how you feel, and it is very confident that you feel fine.',
        goal: 'Find out what’s left to go on when nothing is telling you.',
        instruction:
          'No numbers tonight. Watch yourself, the bonfire, the sky and the tide — those four were on screen the whole of last chapter too.',
        opener: 'No boring numbers tonight. Just us. Ready?',
        bonfireStart: 62,
        target: 78,
        showNumbers: false,
        decisionAfter: 3,
        beat: 'noticing',
        rounds: [
          { fun: 17, cost: 5, motes: 13, glimmer: 'Ready?' },
          { fun: 15, cost: 6, motes: 12, glimmer: 'One more. You’re barely warmed up.' },
          { fun: 12, cost: 6, motes: 10, glimmer: 'One more! See, isn’t this better without the counting?' },
          { fun: 8, cost: 8, motes: 7, glimmer: 'You don’t even look tired. You’re basically fine, right?' },
          { fun: 4, cost: 10, motes: 5, dim: true, glimmer: 'One more. What else were you going to do?' },
          { fun: 2, cost: 13, motes: 3, dim: true, glimmer: 'One more. You’re fine. You’re fine.' },
          { fun: 1, cost: 16, motes: 3, dim: true, glimmer: 'Stay.' },
        ],
        pass: 'You called it without a single number on the screen. That’s the version of this skill you actually get to use.',
        retry:
          'Not quite — and the numbers were never coming. Go again and watch your own shoulders, and the bonfire down the beach. Both of them were saying it well before you were ready to hear it.',
        lesson:
          '"Do I feel fine?" is a terrible stop sign for something built to feel fine. Feelings arrive late and quiet. What arrives on time is the ordinary physical stuff — you stop sitting up, you stop smiling, you stop really looking at it — and the thing you were going to do instead, still waiting, getting smaller.',
      },

      /* ---------------------------------------------------------------- */
      /* Chapter 3 — The Bonfire                                          */
      /* ---------------------------------------------------------------- */
      {
        id: 'bonfire',
        name: 'The Bonfire',
        chapter: 'Chapter 3 of 3',
        intro:
          'Last evening in the Bay, and the Glimmer has stopped waiting for an answer — if you don’t say anything, it just starts the next round. Meanwhile, down the beach, something is happening at the bonfire that won’t wait either.',
        goal: 'Find out what doing nothing counts as.',
        instruction:
          'The next round starts on its own unless you stop it — the gold line filling on "One more" is the Glimmer deciding for you. And keep half an eye down the beach.',
        opener: 'Come on, quick, before it gets dark!',
        bonfireStart: 58,
        target: 82,
        showNumbers: true,
        autoplayMs: 4000,
        waveAfter: 3,
        waveWindow: 1,
        waveBonus: 12,
        waveMissPenalty: 8,
        beat: 'tellSomeone',
        rounds: [
          { fun: 18, cost: 5, motes: 13, glimmer: 'Ready?' },
          { fun: 15, cost: 6, motes: 12, glimmer: 'One more — starting it for you, don’t worry about it.' },
          { fun: 12, cost: 7, motes: 10, glimmer: 'One more. You didn’t say no.' },
          { fun: 8, cost: 9, motes: 7, glimmer: 'Ignore that. One more.' },
          { fun: 4, cost: 11, motes: 5, dim: true, glimmer: 'They’ll still be there. One more.' },
          { fun: 2, cost: 14, motes: 3, dim: true, glimmer: 'One more. One more. One more.' },
        ],
        pass: 'You looked up, and you got there while they were still waving. That is a very specific kind of good evening.',
        retry:
          'Two different ways to miss it: leave before anything has happened down the beach, or still be playing when it does. And notice what happened if you just let the gold line fill — the Glimmer picked for you every time, and it never once picked the bonfire.',
        lesson:
          'The hardest one, and it isn’t about willpower. When the next thing starts by itself, doing nothing stops being neutral — it becomes a yes that somebody else said on your behalf. And what it costs usually isn’t a vague "balance": it’s one particular thing, happening down the beach, that was only happening for a little while.',
      },
    ],
  },

  rule: {
    who: 'Comet',
    text: "The upgraded rule for the Bay, and it's the three evenings in order. One: the fun runs out before the time does. Almost everything is best early and thinner later, so \"am I still enjoying this?\" is a real question with a real answer, and it changes while you're not looking. Two: don't wait to feel bad — feelings turn up late. Pick something you can actually see, like your own shoulders or the thing you meant to do instead, and check it on purpose. Three: when the next one starts by itself, doing nothing is not staying neutral. It's saying yes, and something else said it. Screens were never the enemy here. Losing the choice was.",
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
 * **Neither band runs the Detective/Compare board any more**, and the reason
 * is the same in both. Compare hands the player the trusted original for
 * free, in the left-hand column — but going and getting the original *is*
 * the check, so the board pre-completed the thing it was teaching and left a
 * text diff behind. P4–P6 lost it first (it had pre-completed Research, one
 * of the four letters S.U.R.E. is made of) and now runs the Falls board,
 * `fullMechanic: 'fallsBoard'`, where the right-hand column starts empty and
 * questions cost you the water. P1–P3 now runs "Stop and Check"
 * (`minigames/fallsCheck.js`), the same idea at half the size: the two checks
 * the rule names, as two buttons, with no clock on them.
 *
 * `MiniGameCompare.jsx` is consequently unreferenced by either band. It is
 * left in the tree rather than deleted, unregistered from `GAMES` — see the
 * note at the top of that file.
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

  /* ---- "Stop and Check" (minigames/fallsCheck.js) -------------------------
     This used to be the Detective/Compare board — trusted original on the
     left, the version going round on the right, click the lines that don't
     match. The P4–P6 rebuild threw that board out for handing the player the
     verified original for free, and the fault is sharper down here, because
     this band's rule says the quiet part out loud: ✅ CHECK — *ask a trusted
     adult, or see if you can find it from another place*. The board printed
     the result of the check across the left of the screen, labelled "you can
     go and read it", before the child had done anything.

     So the two checks the rule names are two buttons, and the left column
     gets filled in by pressing one. Unlike the P4–P6 board there is **no
     clock and checking is free** — triage is that band's lesson and stated in
     its chapter 2 by name; failing an eight-year-old for being thorough would
     teach the opposite of this realm's own rule. See fallsCheck.js.

     Every `findings` line is true. Only one of the two settles any given
     tale, and nothing on screen ever says which — t4's "someone posted it in
     the year group chat too" is the one to imitate if you add tales: a second
     copy of a rumour is not a second source. */
  game: {
    type: 'fallscheck',
    title: 'Stop and Check',
    instruction:
      'A tale comes down the Falls. You can check it — either way, or both, it costs you nothing — and then you decide: pass it on, or let it go.',
    startWater: 24,
    target: 80,
    meterLabel: 'Clear water',
    tales: [
      {
        id: 't1',
        from: 'The Echo',
        text: 'Mia got sent to the office for stealing snacks from the canteen!',
        kind: 'false',
        settledBy: 'adult',
        findings: {
          adult: 'Mrs Tan says she asked Mia to help count snacks for the class party. Mia was helping.',
          elsewhere: 'Two other people in your class have heard it as well.',
        },
        rightNote: 'You let it go, and it stopped with you. Mia never knew it existed, which is the best possible ending for a story about Mia.',
        wrongNote: 'That one wasn’t true, and it’s about a real person in your class who now has to hear it from somebody else.',
        why: 'Two people repeating something is not two people knowing it. It’s one story, twice.',
      },
      {
        id: 't2',
        from: 'A friend in your class',
        text: 'The class party is on Friday — bring something if you want!',
        kind: 'true',
        settledBy: 'elsewhere',
        findings: {
          elsewhere: 'It’s on the noticeboard in Mrs Tan’s handwriting. Friday, after lunch.',
          adult: 'Your mum hasn’t heard anything about a party.',
        },
        rightNote: 'True, useful, and you passed it on. Checking isn’t only for catching bad things — it’s how you find out something is worth sharing.',
        wrongNote: 'That one was true and somebody might have missed the party because of it. Letting everything go isn’t the safe option; it’s just a different way of getting it wrong.',
        why: 'Your mum not having heard about it isn’t evidence. She doesn’t work at your school.',
      },
      {
        id: 't3',
        from: 'The year group chat',
        text: 'The school field is shut tomorrow — too much rain last night.',
        kind: 'true',
        settledBy: 'elsewhere',
        findings: {
          elsewhere: 'It’s on the school page, posted at seven this morning by the office.',
          adult: 'Your dad says it did rain an awful lot last night.',
        },
        rightNote: 'Straight from the school, and you passed it on. Now nobody in your class turns up in their boots for nothing.',
        wrongNote: 'That one was real and came from the school itself. Letting it go didn’t make anybody safer.',
        why: 'It really did rain — and "it rained" is not the same claim as "the field is shut".',
      },
      {
        id: 't4',
        from: 'The Echo',
        text: 'Ade is moving away and hasn’t told anyone!!',
        kind: 'false',
        settledBy: 'adult',
        findings: {
          adult: 'You ask Ade. Ade’s cousin is moving. Ade is going nowhere and is quite annoyed about the whole thing.',
          elsewhere: 'Someone has posted it in the year group chat as well.',
        },
        rightNote: 'You went and asked the actual person. That’s the whole of ✅ CHECK in one move.',
        wrongNote: 'That one was wrong, and it was about your friend. Ade found out that people were saying it before Ade found out it wasn’t true.',
        why: 'It being in two places didn’t make it truer. It only made it louder — it’s the same story, copied.',
      },
      {
        id: 't5',
        from: 'Someone in the year above',
        text: 'There’s a free ice cream van coming to school at lunch tomorrow!!',
        kind: 'false',
        settledBy: 'elsewhere',
        findings: {
          elsewhere: 'The school page has next week’s lunches on it, in a list. No van. Nothing anywhere about one.',
          adult: 'Your gran says there used to be one at her school, once, in about 1968.',
        },
        rightNote: 'You looked, it wasn’t anywhere, and you didn’t pass it on. Nobody spent tomorrow lunchtime waiting at a gate.',
        wrongNote: 'A whole year group queued up for a van that was never coming. Nothing terrible — just a lot of disappointed people who trusted you.',
        why: 'Gran’s ice cream van was real. It was also fifty-odd years ago and a different school.',
      },
      {
        id: 't6',
        from: 'The Echo',
        text: 'Mr Oyelaran is leaving at the end of term!',
        kind: 'false',
        settledBy: 'adult',
        findings: {
          adult: 'You ask him. He laughs. He’s going on a two-day course in March and coming straight back.',
          elsewhere: 'Three different people have posted it.',
        },
        rightNote: 'You asked him. He was standing right there the whole time, which is true of an awful lot of rumours.',
        wrongNote: 'It wasn’t true, and it’s about someone who has to come into work tomorrow and be looked at.',
        why: 'Three people posting it is three copies. The number of people saying something is not evidence about the thing.',
      },
      {
        id: 't7',
        from: 'Sam, two doors down',
        text: 'My dog got out this morning and she’s still missing. Please look out for her.',
        kind: 'true',
        settledBy: 'adult',
        findings: {
          adult: 'You ask Sam. It’s true, she’s still not home, and Sam is very glad somebody asked.',
          elsewhere: 'There’s nothing about it online anywhere.',
        },
        rightNote: 'True, and it mattered, and you passed it on. Some things going round the Falls are somebody asking for help.',
        wrongNote: 'That one was real and Sam needed people looking. Nothing being online didn’t mean it wasn’t happening.',
        why: 'Not being able to find something is not the same as finding out it’s false. That one catches grown-ups too.',
      },
    ],
    pass: 'That’s the Falls. Some of it was true and worth passing on, some of it was somebody’s guess wearing a confident voice — and the only thing that told them apart was you going and looking.',
    retry:
      'Worth another go. Two checks, both free, and each of them settles about half of what comes down here — asking a grown-up is for tales about people, looking somewhere else is for tales about the world. And watch for the findings that are perfectly true and still don’t settle anything.',
  },

  rule: {
    who: 'Comet',
    text: "The rule for Fable Falls: not everything that reaches you here is true, even things a lot of people are repeating. 🛑 STOP before you believe or share something surprising or upsetting. ✅ CHECK — ask a trusted adult, or see if you can find it from another place — before you pass it on.",
  },
};

/**
 * P4–P6 — the S.U.R.E. framework, run as three chapters of one board rather
 * than a story, a decision, one puzzle and a rule (`fullMechanic:
 * 'fallsBoard'`, FallsStoryRealm.jsx).
 *
 * The old mechanic was the Detective/Compare board: the trusted original in
 * the left column, the version going round in the right, mark every line that
 * does not match. It had the right idea and gave away the answer — **the
 * verified original was handed over for free**, and going and getting the
 * original is Research, one of the four letters this realm is built on. With
 * both columns on screen the puzzle was a text diff, and S.U.R.E. was four
 * labels printed on the debrief rather than four things you do.
 *
 * So the comparison stays and the free answer goes. The right-hand column now
 * starts empty and you fill it in by spending questions, one action at a
 * time, while claims keep coming down the Falls and the ones you left too
 * long go past you. Which question you pick is the whole game: only one or
 * two settle any given claim, and the other findings are true and useless.
 *
 * See minigames/fallsBoard.js for the arithmetic. The short version: a claim
 * you never cracked is worth +3 even when you call it right, a cracked one is
 * worth +12, asking all four questions about everything runs you out of time,
 * and dropping everything fails because some of it was true and mattered.
 */
const fableFallsHigher = {
  fullMechanic: 'fallsBoard',

  story: [
    {
      who: 'Comet',
      text: 'Fable Falls. Everything anyone in the Atlas has ever said ends up in this water, and it all arrives at the same speed and in the same white foam — the true things, the twisted things, and the things somebody made up on the walk over.',
    },
    {
      who: 'The Echo',
      text: "I've got LOADS today!! Watch this one!! I found it first!! It's DEFINITELY real, look how real it looks — everyone needs to see it before it gets taken down!!",
    },
    {
      who: 'Comet',
      text: "The Echo isn't lying to you, by the way. It genuinely believes every word. It just never once asked. That's the difference you're here to learn, and there are four questions that do it: Source, Understand, Research, Evaluate. S.U.R.E.",
    },
  ],

  decision: {
    prompt:
      "The clip about your classmate is right there in front of you, and The Echo wants it passed on this second. What do you do?",
    options: [
      {
        id: 'shareNow',
        text: 'Share it now — it looks real, everyone else already has, and it might get taken down.',
        tag: 'Option A',
        safe: false,
        who: 'Comet',
        response:
          "It goes downstream, and so does the embarrassment for the classmate it's about — which does not come back when the clip turns out to be faked. \"Looks real\" and \"is real\" were never the same thing, and \"before it gets taken down\" is not a reason. It's a way of making sure you don't have time to ask. Want to look again?",
      },
      {
        id: 'sure',
        text: "Hold it. I'll spend a question on it first — Source, Understand, Research or Evaluate — before it goes anywhere.",
        tag: 'Option B',
        safe: true,
        who: 'Comet',
        response:
          "Good. And notice you only get to ask a few — every question you spend here is one you don't spend on whatever comes down next. That's the real skill, and it isn't caution. It's picking the one question that cracks this particular thing.",
      },
    ],
  },

  extraBeats: {
    tellSomeone: {
      who: 'Comet',
      prompt:
        "That clip was about a real person in your class, and it travelled a long way before you stopped it. Who's the person you'd actually go and tell about it?",
      options: [
        { id: 'teacher', text: 'A teacher I trust' },
        { id: 'home', text: 'Someone at home' },
        { id: 'her', text: 'The classmate it was about' },
        { id: 'adult', text: 'Any adult who can do something' },
      ],
      response:
        "All four are right, and you can do more than one. Telling an adult isn't sneaking — a fake about a real person is something they can get taken down, and something they can help her with. And telling her is often the kindest part: she may not know it exists.",
    },
    correcting: {
      who: 'Comet',
      prompt:
        "One more thing about that clip, and it's the part nobody enjoys. Somewhere out there are people who saw it and never saw it get corrected. A correction travels about a tenth as far as the thing it corrects — and only ever because somebody chose to carry it.",
      accept: "So I should pass the correction on too",
      followUp:
        "Yes — and to the same people, in the same place. Being the one who checks isn't only about what you refuse to send. It's also about what you go back and fix.",
    },
  },

  game: {
    type: 'fallsboard',
    title: 'The Falls',
    instruction:
      "Claims come down the Falls whether you're ready or not. You can see what each one says about itself — nothing else, until you go and ask.",
    levels: [
      /* ---------------------------------------------------------------- */
      /* Chapter 1 — Who's Actually Talking                               */
      /* ---------------------------------------------------------------- */
      {
        id: 'talking',
        name: "Who's Actually Talking",
        chapter: 'Chapter 1 of 3',
        intro:
          'Eight claims, coming down three at a time, and all you can see of any of them is what it says about itself. You have two questions to spend: Source — who actually posted this — and Understand — what is it claiming, exactly.',
        goal: 'Find out what a hunch is worth down here, and what a question is worth.',
        instruction:
          'Pick a claim, spend a question on it, read what comes back — then pass it on or let it go. Every question and every commit moves the water, and a claim you leave too long goes past you.',
        tools: ['source', 'understand'],
        board: 3,
        drift: 10,
        startClarity: 30,
        target: 82,
        pass: 'The water cleared. And look at what cleared it — not the ones you called right, the ones you found out about first.',
        retry:
          'Still churning. Count how many you committed without spending a single question: being right on a hunch pays a token, deliberately. Then count the genuine ones you let go — doubting everything costs too.',
        lesson:
          'Same right answer, more than three times the value once you had actually asked. That gap is the entire point: a hunch is not a skill, because you cannot use it again tomorrow — and a lie only has to get past you once.',
        claims: [
          {
            id: 'f1',
            alarming: true,
            from: '@atlas_school_news',
            text: 'BREAKING: Atlas Primary is closing for the whole of next week!!',
            kind: 'false',
            cracks: ['source'],
            findings: {
              source: 'The account was made three days ago. It has two posts, and both of them are this one.',
              understand: 'The claim is plain enough — school shut, all of next week. Nothing in the wording is strange.',
            },
            why: 'The name on it was right. The account underneath was three days old. Anyone can type a name at the top; the history beneath it is the part that is hard to fake.',
          },
          {
            id: 'f2',
            from: 'Atlas Primary',
            text: 'Sports day moves to Thursday — same time, bring a water bottle.',
            kind: 'matters',
            cracks: ['source'],
            findings: {
              source: 'Posted by the account that has carried every school notice for four years.',
              understand: 'A date change and a water bottle. That is the entire claim.',
            },
            why: 'Dull, real, and worth passing on. If you bin everything that could be fake, you also bin the things people actually needed to know.',
          },
          {
            id: 'f3',
            from: 'Dara',
            text: 'this video PROVES the canteen is closing for good 😳',
            kind: 'false',
            cracks: ['understand'],
            findings: {
              source: 'Dara is exactly who she says she is. She saw it somewhere else and sent it on.',
              understand: 'The video is eleven seconds of an empty canteen at four in the afternoon. It says nothing about closing.',
            },
            why: 'A real friend forwarded it, and it never claimed what the caption claimed. The word "PROVES" was added somewhere on the way past.',
          },
          {
            id: 'f4',
            from: 'Atlas Library',
            text: 'The library is open at lunchtime again from Monday.',
            kind: 'harmless',
            cracks: ['source'],
            findings: {
              source: 'The library account, same as it has always been.',
              understand: 'The library is open at lunch. That is it.',
            },
            why: 'True, small, and nothing riding on it. Not everything needs a question — knowing which things do is the skill.',
          },
          {
            id: 'f5',
            from: 'Atlas Primary Offical ✓',
            text: 'Free tablets for every pupil! Send your name and class to claim yours.',
            kind: 'false',
            cracks: ['source'],
            findings: {
              source: 'The handle spells it "Offical", and the account has forty followers. The tick is a picture someone drew.',
              understand: 'It wants a name and a class sent in. That much is exactly what it says.',
            },
            why: 'The tick was a drawing, the name was misspelled, and it wanted something typed in — which is the part a real school notice never asks for.',
          },
          {
            id: 'f6',
            from: 'The Echo',
            text: "Everyone's saying Year 5 got the whole term's homework cancelled!!",
            kind: 'false',
            cracks: ['understand'],
            findings: {
              source: 'The Echo. Which is exactly who The Echo has always been — it is not pretending to be anybody else.',
              understand: 'Follow the claim back and it is "everyone is saying it". There is no event underneath. Only the saying.',
            },
            why: '"Everyone is saying it" is not where a story started. It is only how far it has travelled — and this one had travelled a long way from nothing at all.',
          },
          {
            id: 'f7',
            from: 'Jonah',
            text: 'heads up, the Weir Road bus stop is shut — go to the one by the bridge',
            kind: 'matters',
            cracks: ['understand'],
            findings: {
              source: 'Jonah, who takes that bus every morning. He is not pretending to be anyone.',
              understand: 'He is describing this morning, on his own route, in his own words. Nothing is claimed beyond what he saw.',
            },
            why: 'A friend telling you one small thing he watched happen is about the most reliable thing you will get all day. Passing it on got somebody to school.',
          },
          {
            id: 'f8',
            from: 'The Echo',
            text: 'apparently Mr Idris supports the worst football team in the league 😭',
            kind: 'harmless',
            cracks: ['understand'],
            findings: {
              source: 'The Echo again, delighted with itself.',
              understand: "It is a joke about a teacher's football team. Nobody is claiming otherwise, Mr Idris included.",
            },
            why: 'True, silly, harmless. None of this is a rule that everything enjoyable must be interrogated.',
          },
        ],
      },

      /* ---------------------------------------------------------------- */
      /* Chapter 2 — It Looks Right                                       */
      /* ---------------------------------------------------------------- */
      {
        id: 'looksright',
        name: 'It Looks Right',
        chapter: 'Chapter 2 of 3',
        intro:
          'Now the hard ones. Some of these come from accounts that really are who they say, saying exactly what they appear to say — and they are still wrong. A third question opens: Research, which means going and looking for the same thing somewhere you already trusted before today.',
        goal: 'Find out what Source cannot settle.',
        instruction:
          'Three questions now. Only one or two of them will settle any given claim, and the rest come back true and useless — which still costs you the water.',
        tools: ['source', 'understand', 'research'],
        board: 3,
        drift: 8,
        startClarity: 30,
        target: 82,
        decisionOn: 'g4',
        beat: 'tellSomeone',
        pass: 'Clear. And notice how many of those had nothing wrong with the messenger at all.',
        retry:
          'Still churning. If you spent Source on everything, look at what it came back with — "yes, that really is them" is a true answer to the wrong question. The ones that got you were the ones you had to go and look up.',
        lesson:
          'A real account can carry a false thing, and a stranger can carry a true one. That is why the envelope is not the test. Research is the question that leaves the message entirely and goes to find the thing itself — and it is the one nobody bothers with, because it is the only one that takes any effort.',
        claims: [
          {
            id: 'g1',
            alarming: true,
            from: 'Atlas Herald',
            text: 'Atlas bridge closed after flooding — avoid the whole area today.',
            kind: 'false',
            cracks: ['research'],
            findings: {
              source: 'The Atlas Herald, genuinely. The local paper, posting for years.',
              understand: 'It says the bridge is shut today because of flooding. Clear enough.',
              research: "Word for word, this is the Herald's story from four years ago, about a different bridge in a different town.",
            },
            why: 'A real newspaper, a real flood, a real story. Just not this bridge and not this year. Old news travels every bit as easily as invented news, and it needs nobody to lie.',
          },
          {
            id: 'g2',
            from: 'a number you do not know',
            text: 'after-school club is cancelled today, coach is ill',
            kind: 'matters',
            cracks: ['research'],
            findings: {
              source: 'A number nobody has saved, in a group chat of sixty people.',
              understand: 'One sentence: one cancellation, one reason.',
              research: "It is on the school's own page as well, posted an hour ago.",
            },
            why: 'The messenger looked like nothing and the thing was still true. That is exactly why you go and look instead of judging the envelope.',
          },
          {
            id: 'g3',
            alarming: true,
            from: 'Dr Sena Okoro',
            text: 'Studies show children who use screens after 7pm lose 30% of their memory.',
            kind: 'false',
            cracks: ['research'],
            findings: {
              source: 'Dr Sena Okoro is a real person with a real medical qualification.',
              understand: 'The claim is a specific number, about memory, after a specific time of day.',
              research: 'No study anywhere says this. The figure appears in this post and in copies of this post, and nowhere else.',
            },
            why: 'A real doctor is not the same thing as a real study. The number had no source at all behind it — only confidence, and a title.',
          },
          {
            id: 'g4',
            alarming: true,
            from: 'forwarded to you by The Echo',
            text: 'Look what she said in assembly!! Share it before it gets taken down 😱',
            kind: 'false',
            cracks: ['source', 'understand', 'research'],
            findings: {
              source: 'The Echo did not make it. Follow it back far enough and the trail stops at an account with no name and no other posts.',
              understand: 'Eight seconds, starting mid-sentence, out of a four-minute assembly.',
              research: 'Two people who were actually in the hall describe something completely different, and the school newsletter matches them.',
            },
            why: 'You never had to prove the clip was edited. The trail ran out, eight seconds outran four minutes, and the people who were there said otherwise. Any one of the three was enough.',
          },
          {
            id: 'g5',
            from: 'Atlas Primary',
            text: 'Reminder: non-uniform day is Friday, £1 for the fair.',
            kind: 'harmless',
            cracks: ['understand'],
            findings: {
              source: "The school's own account.",
              understand: 'A reminder about a day everybody already knew about.',
              research: 'In the newsletter, on the noticeboard, and on the door.',
            },
            why: 'Checked three ways, and it was always going to be a reminder about non-uniform day. Those were three questions you did not spend on the clip.',
          },
          {
            id: 'g6',
            from: 'Atlas Primary',
            text: "Correction: yesterday's note about the bridge was wrong. The bridge is open.",
            kind: 'matters',
            cracks: ['source'],
            findings: {
              source: 'The school account, correcting itself. Something pretending to be the school almost never does that.',
              understand: 'It says the earlier note was wrong, and says which note.',
              research: 'The Herald has quietly taken the old story down as well.',
            },
            why: 'A correction is the least exciting thing that will arrive all week and one of the most useful. Passing this one on actually undoes something.',
          },
          {
            id: 'g7',
            from: 'atlasprimary.news',
            text: "Parents: confirm your child's place for next term at the link below.",
            kind: 'false',
            cracks: ['source'],
            findings: {
              source: "Not the school. A site registered last month that copied the school's header off the real page.",
              understand: 'It wants a confirmation, at a link, before a deadline.',
              research: 'Searching "Atlas Primary confirm place" brings this same site up first, three times over.',
            },
            why: 'It came up first when you searched, which felt like proof and was not — copies of a lie rank as well as anything else does. The name just in front of the .news was never the school.',
          },
          {
            id: 'g8',
            from: 'The Echo',
            text: 'the Falls are the loudest place in the entire Atlas',
            kind: 'harmless',
            cracks: ['research'],
            findings: {
              source: 'The Echo, who has never cited anything in its life.',
              understand: 'A boast about a waterfall.',
              research: 'Nobody has ever measured it. It is extremely loud, though.',
            },
            why: 'Not important, not harmful, not worth a question. You do not owe every sentence an investigation.',
          },
        ],
      },

      /* ---------------------------------------------------------------- */
      /* Chapter 3 — Too Perfect                                          */
      /* ---------------------------------------------------------------- */
      {
        id: 'tooperfect',
        name: 'Too Perfect',
        chapter: 'Chapter 3 of 3',
        intro:
          'The last question opens: Evaluate — does this actually add up? These are the ones that survive the first three. Real account, real wording, real study behind them somewhere, and still wrong, because of who they suit and when they arrived.',
        goal: 'Find the shape of a thing that is too good, too awful, or too well timed — without deciding that everything upsetting is a lie.',
        instruction:
          'All four questions now, and the same water. One of these is genuinely alarming and genuinely true — Evaluate is not a way of deciding that anything shocking must be fake.',
        tools: ['source', 'understand', 'research', 'evaluate'],
        board: 3,
        drift: 7,
        startClarity: 30,
        target: 82,
        beat: 'correcting',
        pass: 'Clear, and clear on the hard ones. You turned down what everybody wanted to be true, and you carried the thing nobody wanted to hear.',
        retry:
          'Still churning. Look for the one that upset you and was true — if "this is shocking" became your test, you just threw away the warning that was worth having. And look for the one everybody wanted: those are the ones that need Evaluate most, because nothing else about them is wrong.',
        lesson:
          'Evaluate is not suspicion. Suspicion would have thrown out the road closure, which was alarming, ordinary and true. Evaluate is asking who this suits, and why it arrived now — because a thing that is exactly what its audience wanted, arriving exactly when they would believe it, is a shape, and you can learn a shape.',
        claims: [
          {
            id: 'h1',
            alarming: true,
            from: 'the Year 6 group',
            text: "Friday's maths test is cancelled — passed on from Mr Idris",
            kind: 'false',
            cracks: ['evaluate'],
            findings: {
              source: 'It has been through four people. The fourth one genuinely believes Mr Idris said it.',
              understand: 'A cancelled test, attributed to a named teacher.',
              research: 'Nothing on the school page — though the school page rarely carries anything about individual tests.',
              evaluate: 'It is exactly what everyone in that group wanted to hear, it arrived the night before, and every retelling of it is slightly better than the last.',
            },
            why: 'Nothing about it was forged. It was simply what everybody wanted, arriving at the hour it would be believed, growing a little each time it was passed. Nobody lied and it still was not true.',
          },
          {
            id: 'h2',
            alarming: true,
            from: 'Atlas Herald',
            text: 'Weir Road shut all week after the wall came down. Two people hurt.',
            kind: 'matters',
            cracks: ['research'],
            findings: {
              source: 'The Herald — the real one, and this time it is today.',
              understand: 'A road closure and two injuries, both stated plainly, with a date on them.',
              research: 'The council has it, the school has it, and Jonah walked past it this morning.',
              evaluate: 'It is alarming, and it is also completely ordinary. Walls do come down, and nothing about this one is convenient to anybody.',
            },
            why: 'Shocking is not the same as false. If "it upset me" were the test, you would end up throwing away precisely the warnings that were worth having.',
          },
          {
            id: 'h3',
            alarming: true,
            from: 'Screen Health Weekly',
            text: 'Nine out of ten children who quit social media gained a full grade in one term.',
            kind: 'false',
            cracks: ['evaluate'],
            findings: {
              source: 'A magazine that does exist and does come out weekly.',
              understand: 'A specific number, a specific outcome, one term.',
              research: 'There is a real study behind it, published, with a real author on it.',
              evaluate: 'Nine out of ten, a full grade, one term. Nothing about children is ever that tidy — and the magazine sells a screen-time app on the same page.',
            },
            why: 'It had a source, it had a study, and it still did not add up. Numbers that neat, from somebody selling the cure, are the ones to slow all the way down for.',
          },
          {
            id: 'h4',
            alarming: true,
            from: 'Mia',
            text: "my account got hacked, don't open anything I sent — send this warning to everyone NOW",
            kind: 'false',
            cracks: ['evaluate'],
            findings: {
              source: "Mia's account. The message really did come from it.",
              understand: 'A warning about a hack, and an instruction to forward the warning.',
              research: 'Six other people in your year have had a hack warning this week. Two of them really were hacked.',
              evaluate: 'A real warning tells you what to stop doing. This one is mostly about wanting to be forwarded.',
            },
            why: 'A chain letter carrying its own instructions to spread. The giveaway was never who sent it — it was that most of the message was about its own travel.',
          },
          {
            id: 'h5',
            from: 'Atlas Primary',
            text: 'The lost property table is out on Thursday. It is enormous.',
            kind: 'harmless',
            cracks: ['understand'],
            findings: {
              source: 'The school.',
              understand: 'A table of lost jumpers, on Thursday.',
              research: 'Also in the newsletter.',
              evaluate: 'Nobody on earth gains anything from lying about lost property.',
            },
            why: 'Four questions available and this one needed none of them. Spending them here was a decision about what you then could not spend them on.',
          },
          {
            id: 'h6',
            alarming: true,
            from: 'Dara',
            text: 'that assembly clip — the school posted a correction, it was fake. can you tell people?',
            kind: 'matters',
            cracks: ['research', 'evaluate'],
            findings: {
              source: 'Dara, who passed the clip on last week and feels awful about it.',
              understand: 'She is asking you to carry a correction to a thing you both saw.',
              research: 'The correction is on the school page, posted this morning.',
              evaluate: 'Nobody gains from this except the girl the clip was about — and it costs Dara something to send it.',
            },
            why: 'Corrections travel about a tenth as far as the thing they correct, and only ever because someone chose to carry them. This is the one to pass on.',
          },
          {
            id: 'h7',
            alarming: true,
            from: 'The Echo',
            text: "screenshot of the head teacher saying the trip is off — look, it's right there",
            kind: 'false',
            cracks: ['source'],
            findings: {
              source: "A screenshot is not an account. The head teacher's actual page says nothing of the kind and never did.",
              understand: 'The claim is that the head teacher said the trip is off.',
              research: 'Four people have the same screenshot. All four of them got it from The Echo.',
              evaluate: 'The trip is the thing everyone is most anxious about, which is exactly why it is the thing being screenshotted.',
            },
            why: 'A screenshot is a picture of words. There is no account behind it, no history under it, and no way back to whoever typed it. Go to the page itself.',
          },
          {
            id: 'h8',
            from: 'The Echo',
            text: 'I am, personally, the fastest reader in Year 6',
            kind: 'harmless',
            cracks: ['source'],
            findings: {
              source: 'The Echo, on the subject of The Echo.',
              understand: 'A boast.',
              research: 'Unmeasured, and probably unmeasurable.',
              evaluate: 'Harmless, and not really a claim about the world at all.',
            },
            why: 'Some things are just somebody being themselves, loudly. Letting those go past is not a lapse in vigilance.',
          },
        ],
      },
    ],
  },

  rule: {
    who: 'Comet',
    text: "S.U.R.E., every time something makes you want to react fast: Source — who actually posted this, and have they ever posted before? Understand — what is it claiming, exactly, all of it? Research — can I find it somewhere I already trusted? Evaluate — does it add up, or is it a bit too perfect, too shocking, too well timed? You will not get to ask all four. Ask the one that would break this particular thing.",
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
