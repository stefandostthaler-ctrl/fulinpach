# Proposal

## Why

GitHub issue #7: apples and seeds stop mattering after the first hour. The apple rate is 1 per
second, rises to 2 once, and every later cost is a short wait. The author wants a progression
with a handful of passive upgrades tied to quests and local stories, while keeping the
Streuobstwiese simple (no more plots, no mandatory watering, no clicking loops).

The issue asks for the balance table to be presented before implementation. The table is in
design.md; implementation waits for the author's answer.

## What Changes

- A small list of passive upgrades ("Ausbau") that each raise apples or seeds per second. Each
  is unlocked by a quest, discovery or chronicle page, bought once with apples and/or seeds,
  and shown in the Streuobstwiese tab below the three plots. No new clicking.
- Existing passive sources stay: the farm milestone (+1/s after three harvests), the
  Kernsammler (0.5 Kerne/s) and the Goldener Apfel (+1/s).
- Shop and late-story prices move modestly to match the curve (no multiplying by ten).
- Save migration keeps existing rates and marks nothing as bought that was not.

## Capabilities

### New Capabilities
- `passive-upgrades`: which upgrades exist, what unlocks them, what they cost and how they
  change the income rates.

### Modified Capabilities
<!-- none -->

## Impact

- `src/js/content/items.js`: new `UPGRADES` list; adjusted shop prices.
- `src/js/game.js`: `g.upgrades`, `buyUpgrade()`, `appleRateNow()`/`seedRateNow()` summing
  upgrades, a few story costs, `normalizeSave()`.
- `src/js/ui.js`: upgrade list in the Streuobstwiese tab; resource row uses the summed rates.
- `src/js/content/story.js`: none.
