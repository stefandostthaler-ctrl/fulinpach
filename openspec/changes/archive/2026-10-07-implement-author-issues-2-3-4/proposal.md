# Proposal

## Why

The original author opened three GitHub issues (#2, #3, #4) with gameplay wishes: the
mountains should need hiking boots, finishing the story should hand out a "Goldener Apfel
der Stadt", and reaching 980 LP should make the player invincible. They are small,
self-contained, and give the game a clearer item-gated progression in the Candy Box 2 style.

## What Changes

- Issue #2: Tregler Alm, Wirtsalm, Farrenpoint and Wendelstein can only be entered when the
  "Jenbachtaler Wanderstiefel" (shop item `hikingBoots`) are in the inventory, on top of the
  existing story conditions. The map shows them as locked, travelling is refused with a hint,
  and the journal routes the player to the map. Existing saves that already visited one of
  these places receive the boots on load.
- Issue #3: After the final decision at Fulinpach (both endings) the player receives a new
  trinket "Goldener Apfel der Stadt" with its own ASCII art. Existing saves that already made
  the final decision receive it on load.
- Issue #4: When the player's maximum LP reaches 980 (the year Fulinpah was first mentioned)
  the player receives a new trinket "An apple a day…". While it is in the inventory the player
  takes no damage in combat.
- Save format version is bumped to 12 with migration for the three cases above.
- Issue #6 (follow-up by the author, 7 Oct 2026) refines #2 and #3: the boots gate is enforced
  centrally so no button can bypass it, owning the boots (not equipping) is the rule so the
  player can never strand themselves, and the Goldener Apfel gets a small postgame effect
  (+1 Apfel pro Sekunde) and an ending-specific description so both endings keep their meaning.

## Capabilities

### New Capabilities
- `place-access`: which travel places the player may enter and what the game does when a
  place is locked (story conditions and required items).
- `milestone-rewards`: items the player receives for reaching story or stat milestones
  (finishing the story, reaching 980 LP) and their effects.

### Modified Capabilities
<!-- none: the world-map spec already shows locked markers from the place's locked state -->

## Impact

- `src/js/game.js`: travel guards, journal routing, combat damage, maxHp milestone check,
  `decideFate`, `normalizeSave`, `VERSION`.
- `src/js/ui.js`: locked state of the four mountain places in the map place list.
- `src/js/content/items.js`: two new trinket entries.
- `src/js/content/art.js`: two new `ITEM_ART` drawings.
- No build step, no new files, save migration only.
