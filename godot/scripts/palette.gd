class_name Palette
extends RefCounted
## design.md §3 color tokens, ported verbatim. Realm accents live on
## StampManager (single source of truth for stamp presentation); this holds
## only the shared paper/ink tokens used outside any one realm.

const PAPER := Color("#f1f5f6")
const INK := Color("#1f3452")
const INK_SOFT := Color("#5c7185")
const GOLD := Color("#e0a030")
