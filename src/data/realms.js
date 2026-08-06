/**
 * All game content, lifted from storyline.md.
 *
 * Tone rules being honoured here (storyline.md "Tone & Writing Guidelines"):
 *  - nothing is a villain; every unsafe pick is a misunderstanding to retry
 *  - Comet asks rather than tells ("let's look again", never "wrong")
 *  - plain words, no jargon ("phishing", "PII") unless explained in kid terms
 *  - each realm states its real-world rule once, plainly, near the end
 *
 * Each realm also carries a `world` block: where the Traveler spawns, how far
 * they can roam, and which spot in the scene each step of the realm happens
 * at. Coordinates are 0-100 across the scene box (see world/useWalker.js).
 */

export const COMET_CATCHPHRASE =
  'Every good traveler carries two things: curiosity, and a second thought.';

/** Realm order here is the suggested path shown on the Atlas (storyline.md). */
export const REALMS = [
  /* ---------------------------------------------------------------- 1 ---- */
  {
    id: 'passworld',
    name: 'Passworld',
    accent: 'var(--gold)',
    accentWash: 'rgba(224, 160, 48, 0.13)',
    blurb: 'A walled kingdom of vault doors, and a guard who asks a lot of questions.',
    topic: 'Passwords & personal info',
    stamp: { icon: 'key', label: 'Passworld · Visited' },

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
  },

  /* ---------------------------------------------------------------- 2 ---- */
  {
    id: 'privacy',
    name: 'Privacy Peaks',
    accent: 'var(--teal)',
    accentWash: 'rgba(45, 140, 127, 0.13)',
    blurb: 'Misty mountain lookouts where you can’t quite see who’s talking.',
    topic: 'Strangers & scams online',
    stamp: { icon: 'compass', label: 'Privacy Peaks · Visited' },

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
  },

  /* ---------------------------------------------------------------- 3 ---- */
  {
    id: 'bullybog',
    name: 'Bully Bog',
    accent: 'var(--coral)',
    accentWash: 'rgba(224, 99, 122, 0.13)',
    blurb: 'Murky water that reflects whatever gets posted about the folks who live here.',
    topic: 'Cyberbullying & kindness',
    stamp: { icon: 'heart', label: 'Bully Bog · Visited' },

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
  },

  /* ---------------------------------------------------------------- 4 ---- */
  {
    id: 'balance',
    name: 'Balance Bay',
    accent: 'var(--periwinkle)',
    accentWash: 'rgba(123, 110, 246, 0.13)',
    blurb: 'A beach at dusk where the tide is much too high, and time goes strange.',
    topic: 'Screen time balance',
    stamp: { icon: 'sun', label: 'Balance Bay · Visited' },

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
  },
];

export const REALM_BY_ID = Object.fromEntries(REALMS.map((r) => [r.id, r]));

/** Traveler's Pledge, written in the child's own voice (storyline.md finale). */
export const PLEDGE = [
  { realm: 'passworld', text: 'I’ll keep my personal info to myself.' },
  { realm: 'privacy', text: 'I’ll stop and think before I click.' },
  { realm: 'bullybog', text: 'I’ll be kind, and stand up for others.' },
  { realm: 'balance', text: 'I’ll balance my screen time with the rest of my day.' },
];
