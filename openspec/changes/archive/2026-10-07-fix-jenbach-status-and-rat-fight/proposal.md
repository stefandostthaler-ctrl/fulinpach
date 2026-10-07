# Proposal

## Why

GitHub issue #5 from the original author: at the Jenbach bridge the quest hint keeps showing
the result of the rat fight while the flood quest is running or finished, and the rat fight
itself is a passive timer race in which the targeted knife attack hardly matters. The fight is
the player's first combat, so it should teach the combat loop instead of hiding it.

## What Changes

- The Jenbach scene's "Nächster Schritt" hint follows the flood quest as soon as it starts and
  shows the flood outcome once it is solved. The rat decision and the flood decision stay as
  two separate journal entries. The arrival message after the flood no longer talks about rats.
- The Bachrattenkönig gets a telegraphed heavy attack ("Sprung von der Brücke"): a short
  wind-up is announced in the fight view, then a double-damage bite lands. A targeted attack
  during the wind-up interrupts it and staggers the rat. HP stays at 90. The same engine works
  for the Golem and the Pflücker but only the rat uses it for now.
- Both rat solutions keep crown and bark; the fight additionally yields the rats' apple hoard
  (15 apples), the peaceful route the seeds they left behind (6 Kerne), so neither path is
  strictly better.

## Capabilities

### New Capabilities
- `combat`: how a fight runs: automatic attacks, the targeted attack, telegraphed enemy
  actions, fleeing and defeat.
- `quest-status`: what the scene hint and arrival message show for a place with more than one
  quest.

### Modified Capabilities
<!-- none -->

## Impact

- `src/js/game.js`: `combatTick()`, `strike()`, `journalEntries()` (an `at` list per entry),
  `travel()` arrival text for Jenbach.
- `src/js/ui.js`: `renderQuests()` hint selection, `combatStatusText()`, `updateCombatView()`.
- `src/js/content/items.js`: enemy definitions (special attack), rat rewards.
- `src/css/style.css`: a wind-up animation class for the enemy portrait.
