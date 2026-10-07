# Design

## Context

See proposal.md for motivation. Place locking lives in three places today: the `places` array
in `renderMap()` (ui.js, `locked:` per place), the first line of `travel()` (only biberdamm and
siedlung) plus per-place early returns, and the `locked` expression in `journalGo()` (game.js).
Items are plain entries in `itemDb` (items.js) with drawings in `ITEM_ART` (art.js); `addItem()`
auto-equips a trinket when the slot is empty. Max LP are recomputed in `eatApples()` from
`insuranceBonus`, `eaten` and `candleLit`, and raised directly by the insurance purchase and
`lightCandle()`. Save migration happens in `normalizeSave()` keyed on `data.version`.

## Goals / Non-Goals

**Goals:**
- One shared predicate for "is this place locked" so map, travel and journal cannot drift.
- Item grants that are idempotent and reproducible on load.

**Non-Goals:**
- Rebalancing boot price or LP growth. The 980 goal is reachable today only via repeated
  insurance purchases; that is accepted for now (see Vergleich-Candy-Box-2.md).
- Changing how the map draws locked markers (covered by the world-map spec).

## Decisions

- **Central `placeLocked(id)` in game.js** returning `false` or a short German reason string.
  `renderMap()` uses `locked: Boolean(placeLocked(id))`, `travel()` refuses and `say()`s the
  reason, `journalGo()` switches to the map and `say()`s the reason. Alternative: patch the
  three existing expressions in place. Rejected because they already diverge (travel() does not
  check wall or tregler at all) and a fourth condition would make it worse.
- **Boots as inventory check, not a flag**: `has("hikingBoots")`. The boots are a normal item
  and the shop already adds them; no new state.
- **Migration grants the boots** for saves with `treglerVisited`, `wirtsalmVisited`,
  `farrenpointVisited` or `mountainVisited` set. Simpler than exempting visited places from
  the gate forever.
- **`goldenApple`** is granted inside `decideFate()` after the ending text, and in
  `normalizeSave()` when `flags.finalChoice` is set. Trinket with defense 5, damage 5, so it is
  a visible but not game-changing upgrade over `mannlgift`.
- **`appleADay`** is granted by a new `checkAppleADay()` called at the end of `eatApples()`,
  the insurance action, `lightCandle()` and `normalizeSave()`. Invincibility is implemented in
  `combatTick()` by skipping the HP reduction when `has("appleADay")`; the enemy still attacks
  (timers run) so the fight log stays alive. Alternative: huge defense value. Rejected because
  defense is subtracted from damage with a floor of 1, so it would never reach zero.
- **VERSION 12**: no structural change, but the bump documents that items were granted.

- **Issue #6, own vs. equip**: the gate checks ownership. Equipping would let a player unequip
  the boots on the Wirtsalm and be unable to leave; ownership can never be lost, so no
  stranding logic is needed.
- **Issue #6, no bypass**: `travel()` is the only function that changes `g.location` from the
  UI, and it starts with `placeLocked()`. Scene buttons ("Zu den Wohnhäusern gehen", "Zurück
  zur Jenbachbrücke") call `travel()` and inherit the check. `enterFinal()` also goes through
  `travel()`.
- **Issue #6, golden apple**: effective apple rate is `appleRateNow()` = `g.appleRate` + 1
  with the apple; used by `creditElapsedTime()` and the resource row. The item description is
  a function of `g.flags.finalChoice`; `itemDesc(id)` in ui.js resolves string or function.

## Risks / Trade-offs

- [Invincibility also applies to the final boss] → accepted; it is the author's explicit
  wish ("Spieler wird unbesiegbar"). Noted in Vergleich-Candy-Box-2.md as a point to revisit.
- [Players mid-game without boots suddenly see the Tregler Alm locked] → the hint names the
  Händler and the boots cost 40 Kerne, which such a player can afford.
- [Auto-equip replaces a better trinket] → `addItem()` only auto-equips when the slot is
  empty, so an equipped `mannlgift` is kept.
