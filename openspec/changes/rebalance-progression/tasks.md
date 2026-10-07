# Tasks

## 0. Author sign-off

- [ ] 0.1 Present the balance table from design.md to the author and record their answer (table confirmed or adjusted numbers written back into design.md).

## 1. Upgrade data and rates

- [x] 1.1 Add `UPGRADES` to items.js with the six upgrades from the table (id, name, German desc, unlock function, cost, apples, seeds); verify `node --check` passes and each unlock function returns false on a fresh save.
- [x] 1.2 Add `g.upgrades`, `buyUpgrade(id)`, `seedRateNow()` and extend `appleRateNow()` to sum bought upgrades; use both in `creditElapsedTime()`; verify in a headless test that buying Holzrinnen raises the credited apples per second by 1.
- [x] 1.3 Apply the price changes from design.md (map, ledger, mannl, picker, vow) in items.js, game.js and the button labels in ui.js; verify every label matches its cost in the headless cost scan.
- [x] 1.4 Default `g.upgrades` in `fresh()` and `normalizeSave()`, bump `VERSION` to 13; verify a version 12 save keeps its apple rate and has no upgrades bought.

## 2. Streuobstwiese UI

- [x] 2.1 Render the "AUSBAU" list in `renderFarm()` with locked / available / bought rows and buy buttons using `btn()` with an affordability function; verify in the browser that the row state changes without reload after a story flag flips.
- [x] 2.2 Use `seedRateNow()` in the resource row; verify the displayed rate after buying Sortengarten.

## 3. Verification

- [x] 3.1 Fresh playthrough in the browser up to the Wirtsalm, noting the actual wait at each row of the table; adjust numbers only if a wait exceeds the table by more than half.
- [x] 3.2 Import an advanced JSON save (post-ending), check rates, upgrades and that all remaining costs are affordable within a few minutes.
- [x] 3.3 Update README (upgrade list lives in items.js) and Vergleich-Candy-Box-2.md (economy point resolved).
