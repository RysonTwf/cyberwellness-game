## graphify

This project can have a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

graphify-out/ is **local only and gitignored**. It is a derived artefact, and its sidecars record the interpreter path and scan root of whoever built it, so committing it broke every other machine. If you do not have one, build it with `graphify .` and never commit the result. The same goes for .claude/settings.json, which registers graphify's hooks against an absolute path.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).

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
