# Cyber Wellness Quest: Storyline

## World & Premise

One evening, the player finds an old, slightly glowing journal, the kind
with a brass clasp and blank pages. The moment they open it, the pages fill
in on their own, drawing a map. A small paper-airplane spirit unfolds itself
out of the last page.

This is **the Atlas**: a living map of the internet, made of four realms.
The journal is the player's **passport**, and they are now a **Traveler**.
Each realm they visit teaches them something about traveling the Atlas
safely and kindly, and leaves a stamp in their passport as proof.

## Characters

**The Traveler**, the player. Name entered at the start, used throughout
("Alright, Traveler [Name], the Stream's calling us to Passworld!"). No
fixed appearance is described in text, so the eventual art can keep the
avatar simple/abstract and inclusive.

**Comet**, the guide. A paper-airplane spirit who has delivered messages
across the Atlas for as long as it is existed, and knows every realm and its
tricks. Warm, a little playful, never lectures, Comet asks questions more
than it gives answers, and treats mistakes as normal parts of exploring.
Comet's catchphrase, used to open each realm: *"Every good traveler carries
two things: curiosity, and a second thought."*

**Realm characters** (one per realm, introduced below):
- **Keeper Vex** (Passworld): a good-natured but overly chatty vault
  guardian who *thinks* every question is fine to ask a stranger.
- **The Fog** (Privacy Peaks): not a villain, just mist that hides who is
  really on the other side of a message. Different fog-shapes speak with
  different scam tactics.
- **Pockets the frog** (Bully Bog): a shy bog-dweller who gets a mean
  comment posted about their singing. Central to the "stand up, do not join
  in" lesson.
- ~~**The Glimmer** (Balance Bay)~~: retired in the school revision pass
  (too much of a riddle for the youngest pupils). Balance Bay now has Comet
  talk plainly about splitting your time between screens, school, hobbies
  and rest, then goes straight into the seesaw.

## Story Arc Overview

> This document is the original outline. Since the school's revision pass
> (31 Aug 2026) the shipped game differs in a few places, `src/data/realms.js`
> is the source of truth:
> - A 5th realm, **Fable Falls** (fake news & edited pictures), sits after
>   Balance Bay.
> - **Privacy Peaks P1–3** and **Fable Falls** teach through a plain
>   5-question Q&A rather than a Spot/Sort pile.
> - **Balance Bay** has no branching choice and no Glimmer character (plain
>   talk about balancing screen time). It runs a walkable beach for both
>   bands: the Traveler walks the sand picking activities up while a seesaw
>   sprite tips.
> - **Fable Falls'** rumour spreads online (a forwarded screenshot about
>   Mia), not by word of mouth. Both bands run that same Mia scenario;
>   P4–P6 layers the S.U.R.E. framework (Source, Understand, Research,
>   Evaluate) over it rather than a different, harder story.
> - The game is played once, so P4–P6 is **not** framed as a "level up" of
>   P1–P3. **Bully Bog** and **Balance Bay** run the exact same scenario,
>   mechanic and items for both bands, only the wording changes (short for
>   P1–P3, a little fuller for P4–P6). Passworld, Privacy Peaks and Fable
>   Falls do differ by band (harder scenarios for the older pupils), but
>   without any "again / this time / Level Up" language.
> - **Bully Bog** dropped the "which trusted adult would you tell" follow-up
>   and any "show an adult you trust" line from its rule (per the school).
>   It keeps the digital-footprint follow-up and the block/report option.
> - **Passworld** teaches "what is personal information" in both bands now:
>   P1–P3 has its Sort game plus a "which password is hardest to guess"
>   follow-up; P4–P6's platformer (passwords / impersonation) is followed by
>   a short "Before You Post" Sort on things that give you away in
>   combination (uniform, location tag, routine, real name as a handle).

| Order | Realm | Topic | Mini-game type | Stamp icon |
|---|---|---|---|---|
| 0 | Atlas Gate | Intro |, |, |
| 1 | Passworld | Passwords & personal info | Sort | Key |
| 2 | Privacy Peaks | Strangers & tricks online | Quiz (P1–3) / stepping-stones (P4–6) | Compass |
| 3 | Bully Bog | Cyberbullying & kindness | Sort | Heart |
| 4 | Balance Bay | Screen time balance | Balance (seesaw) | Sun |
| 5 | Fable Falls | Fake news & edited pictures | Quiz | Eye |
|, | Finale | Wise Traveller certificate |, |, |

Realms can be visited in any order; the table order is the suggested default
path shown in the hub.

---

## Prologue: The Atlas Gate

Comet unfolds from the journal's last page.

> **Comet:** "Oh, hello! You opened it. Most people just dust these off and
> put them back on the shelf."
>
> **Comet:** "I am Comet. This is the Atlas, every path the internet takes
> drawn out as a map. And you, lucky page-turner, are about to become a
> Traveler."

The player enters their name. Comet hands over the passport (visual: the
journal, now with 4 empty stamp circles) and gives the one rule that
threads through every realm:

> **Comet:** "Every good traveler carries two things: curiosity, and a
> second thought. You will need both. Ready to see the map?"

→ transitions to the Atlas hub.

---

## Realm 1: Passworld

**Setting:** A walled kingdom of vault doors, all slightly different sizes,
guarded by Keeper Vex.

**Story beat:**

> **Keeper Vex:** "A visitor! Wonderful. Before I let you through, I just
> need a few things, your full name, your school, your address, and
> oh, while we are at it, what is your password? Just so I know you are
> trustworthy."

**Decision point:**
- *A: Answer everything Vex asks.* → Vex's vault door creaks open... to
  reveal nothing but more fog. Comet gently interrupts: "Vex means well, but
  a stranger, even a friendly one, never needs your real info or your
  password to prove anything." Player is returned to try again.
- *B: "I do not think I should share that with someone I just met."* → Vex
  laughs, embarrassed. "Oh, right, right, good instinct! I ask everyone
  that, you know, just to check. Come on in properly, then."

**Mini-game, Sort:** "Guard the Vault." Items (some personal-info examples
some strong/weak password examples) are dragged into two bins: **Keep It
Locked** (address, full name, school, password, phone number) vs. **Safe to
Share** (favorite color, favorite game, a nickname, a hobby).

**Stamp earned:** The Key, "Passworld · Visited."

---

## Realm 2: Privacy Peaks

**Setting:** Misty mountain lookouts. Visibility is low, that is the point.

**Story beat:** A shape in the fog messages the Traveler directly.

> **The Fog:** "hii!! u just won a free tablet!! click here fast before it is
> gone, only for the next 5 minutes!! Also, what is your address so we can
> send it to you?"

**Decision point:**
- *A: Click the link.* → The fog thickens, nothing good happens, Comet
  steps in: "That is three signs at once, a prize you did not enter for, a
  rush to click fast, and a request for your address. Let us look again."
  Player retries.
- *B: "That looks like a scam. I am not clicking, and I will tell a trusted
  adult."* → The fog thins and drifts away, revealing the real path forward.

**Mini-game, Spot:** "Clear the Fog." A short fake chat/message is shown
on screen; the player taps the red-flag phrases within it (urgency, "you
won," requests for personal info or money, a stranger asking to meet up).
Tapped flags visually clear the fog around that line.

**Stamp earned:** The Compass, "Privacy Peaks · Visited."

---

## Realm 3: Bully Bog

**Setting:** A swampy bog, murky water reflecting whatever's posted about
its residents.

**Story beat:** Pockets the frog is mid-song when a comment appears in the
air above the water: *"nobody wants to hear this, go away."* Pockets stops
singing. Two other bog creatures are typing responses.

**Decision point:**
- *A: Type something to join in ("Yes, that is bad").* → The water darkens
  further, Pockets sinks lower. Comet: "That made it heavier for Pockets,
  not lighter. Want to try a different response?" Player retries.
- *B: "That was not kind. I liked your song, Pockets."* → The water clears
  where the kind words land; Pockets looks up.

Comet adds the wider point after the choice, regardless of path taken:

> **Comet:** "If it is ever about you instead of Pockets, same rule. Do not
> respond to be mean back. Save it, and show a trusted adult."

**Mini-game, Sort:** "Clear the Water." A set of comments drop in; sort
them into **Send It** (kind, encouraging, neutral) vs. **Leave It** (mean,
mocking, excluding). Each correctly-sorted "Send It" comment visibly clears
a patch of the murky water.

**Stamp earned:** The Heart, "Bully Bog · Visited."

---

## Realm 4: Balance Bay

**Setting:** A beach at dusk. The tide is unusually high, that is the
Glimmer's doing.

**Story beat:**

> **The Glimmer:** "Stay a little longer! One more round, one more video,
> one more level, time does not really pass here, promise."

Outside the bay's glow, in the distance, other travelers (friends) are
visible waiting by a bonfire.

**Decision point:**
- *A: "Just a little longer."* → The Glimmer brightens, the bonfire in the
  distance dims slightly (friends waiting longer). Comet: "The Glimmer says
  that every time. Let us see what a balanced day actually looks like."
  Player moves to the mini-game either way, but this path starts it with the
  scale already tipped.
- *B: "I have had a good amount of time here, I am heading to the bonfire."*
  → The tide recedes to a normal level, bonfire glows warm.

**Mini-game, Sort:** "Balance the Day." Daily activity tiles (screen time
sleep, homework, outside play, meals, family time) are dragged onto a
balance scale (or clock face) until it settles level, there is no single
correct split, but extreme all-or-nothing arrangements (e.g. all screen
time, zero sleep) visibly tip the scale hard, teaching balance rather than a
strict number.

**Stamp earned:** The Sun, "Balance Bay · Visited."

---

## Finale: The Wise Traveler

Once all four stamps are earned, returning to the Atlas Gate triggers the
close:

> **Comet:** "Four stamps. Four realms. You picked curiosity *and* a second
> thought, every time, that is the whole trick, honestly."

**Certificate screen:** shows the Traveler's name, the four stamps in a row,
and a short **Traveler's Pledge** the child "signs" (types their name again
or taps to confirm), written in the child's own future voice, not as
rules handed down:

> *I will keep my personal info to myself.*
> *I will stop and think before I click.*
> *I will be kind, and stand up for others.*
> *I will balance my screen time with the rest of my day.*

Ends on Comet folding back into the journal with a last line, leaving the
door open for replay: "The Atlas does not change much, but you can always
visit again."

---

## Tone & Writing Guidelines

- **No fear-based framing.** Nothing is a monster or a villain; every
  "wrong choice" is a misunderstanding to retry, not a danger the child
  narrowly escaped.
- **Comet asks, rarely tells.** Prefer "let us look again" over "wrong."
- **Active voice, plain words, age-appropriate.** No jargon like "phishing"
  or "PII" without immediately explaining it in kid terms if used at all
  prefer plain description over the technical term.
- **Choice consequences are always reversible**: a child should never feel
  they have "lost" or broken the story by picking the unsafe option.
- **Every realm's real-world rule is stated once, plainly**, near the end of
  that realm (as Comet does explicitly in Bully Bog) so the takeaway is not
  left only implicit in the game mechanic.

## Writing rules for all player-facing copy (client requirement)

These are the client's rules. They apply to everything a child, a teacher or a
parent can read: game copy in `src/data/realms.js`, screen copy in the
components, Phaser toasts, button labels and the documents in this repository.

1. **School language.** Full, proper English that a teacher would be happy to
   read aloud in class.
2. **No short forms.** Write "do not", "it is", "you are", "I am", "cannot".
   Never "don't", "it's", "you're", "I'm", "can't". Possessives are fine
   ("Sam's vault").
3. **No text-speak.** No "lol", "btw", "omg", "u", "ur" or similar, including
   inside quoted example messages. A scam message in the game is written in
   plain English, not in deliberately broken spelling.
4. **No em-dashes.** Use a comma, a colon or a full stop instead.
5. **School-kid friendly.** Short sentences, concrete words, nothing a 7 year
   old would need an adult to unpack. The P1 to P3 band is shorter and plainer
   than the P4 to P6 band, never the same text at a different length.
6. **It has to make sense.** Every sentence has to read as something a real
   person would say. No filler and no half-sentences.
