# Tasks

## 1. Place access with hiking boots (Issue #2)

- [x] 1.1 Add `placeLocked(id)` to game.js that returns `false` or a German reason, covering biberdamm, siedlung, wall, tregler, wirtsalm, farrenpoint, wendelstein and fulinpach, with the four mountain places additionally requiring `has("hikingBoots")`; verify in the console that `placeLocked("tregler")` returns the boots hint on a fresh save after `g.flags.jenbachWon=true`.
- [x] 1.2 Use `placeLocked()` in `travel()` (refuse and `say()` the reason) and in `journalGo()` (open the map and `say()` the reason); verify that following the journal entry for the Wendelstein without boots opens the map tab and shows the hint.
- [x] 1.3 Use `placeLocked()` for the `locked:` field of every place in `renderMap()`; verify that the Tregler Alm marker reads „noch gesperrt“ without boots and becomes clickable right after buying them in the shop.
- [x] 1.4 Bump `VERSION` to 12 and grant `hikingBoots` in `normalizeSave()` when any of `treglerVisited`, `wirtsalmVisited`, `farrenpointVisited`, `mountainVisited` is set; verify by importing an old JSON save with `wirtsalmVisited:true` and checking the boots are in the inventory.

## 2. Goldener Apfel der Stadt (Issue #3)

- [x] 2.1 Add `goldenApple` to `itemDb` (trinket, defense 5, damage 5, German desc) and an `ITEM_ART` drawing; verify the inventory shows the drawing after `addItem("goldenApple")` in the console.
- [x] 2.2 Grant `goldenApple` in `decideFate()` for both endings and in `normalizeSave()` when `flags.finalChoice` is set; verify by setting `g.flags.finalWon=true` and choosing each ending once on two fresh saves, and by importing a finished save.

## 3. An apple a day… (Issue #4)

- [x] 3.1 Add `appleADay` to `itemDb` (trinket, German desc) and an `ITEM_ART` drawing; verify it renders in the inventory.
- [x] 3.2 Add `checkAppleADay()` that grants the item once when `g.maxHp>=980` with a message referencing the year 980, and call it from `eatApples()`, the insurance shop action, `lightCandle()` and `normalizeSave()`; verify with `g.insuranceBonus=880;eatApples()` that the item appears once and a second insurance purchase adds nothing.
- [x] 3.3 Skip the player HP reduction in `combatTick()` while `has("appleADay")`; verify by starting the Golem fight with the item that LP stay constant and the Golem still dies.

## 4. Issue #6 refinements

- [x] 4.1 Add `appleRateNow()` (base rate + 1 with `goldenApple`) and use it in `creditElapsedTime()` and the resource row; verify in the headless test that offline credit and the displayed rate both rise by 1 after the ending.
- [x] 4.2 Make the Goldener Apfel description depend on `g.flags.finalChoice` (resolve via `itemDesc(id)` in ui.js, used by all three inventory description sites) and give `decideFate()` a different grant message per ending; verify both texts in the headless test.
- [x] 4.3 Headless route test: for every place in the game, `travel()` with and without boots and with each story flag set, asserting `g.location` only changes when `placeLocked()` is false; verify the test passes.

## 5. Verification

- [x] 5.1 Open `src/index.html` by double-click, play from a fresh save through shop, boots, Tregler Alm; confirm no console errors and that an exported JSON re-imports cleanly.
- [x] 5.2 Update the README item list hint if needed (items.js still the place for new items) and update Vergleich-Candy-Box-2.md to mark Issues 2, 3, 4 as done.
