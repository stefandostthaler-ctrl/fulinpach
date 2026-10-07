# Design

## Context

See proposal.md. Combat is a 200 ms tick: `combatTick()` applies the player's automatic hit
every 850 ms and the enemy's hit every `interval` ms; `strike()` is the targeted attack with a
3.2 s cooldown. The scene hint in `renderQuests()` picks `atPlace.find(!done) || atPlace[0]`,
where `atPlace` filters `journalEntries()` by `entry.place === g.location`. The flood entry's
`place` is "siedlung" while the houses must be warned, so at the bridge only the finished rat
entry is "at place", and after the flood `atPlace[0]` is again the rat entry.

## Goals / Non-Goals

**Goals:**
- A telegraph the player can read and answer inside the existing tick engine.
- Hint selection that generalises to any place with several quests.

**Non-Goals:**
- Changing Golem or Pflücker behaviour (they get the engine but no special attack yet).
- Any text pass beyond the Jenbach texts (that is issue #8).

## Decisions

- **Enemy `special` config** on the enemy record: `{name, every, windup, factor}`. The combat
  state gets `attacks` (count), `windupUntil` (timestamp or 0). In `combatTick()`, when the
  enemy's attack timer fires and `attacks % every === every-1`, instead of hitting it sets
  `windupUntil = now + windup` and `say()`s the announcement. When `now >= windupUntil` the
  heavy hit lands with `damage * factor`. Alternative: a separate timer per attack type.
  Rejected as more state for no benefit.
- **Interrupt in `strike()`**: if `g.combat.windupUntil > now`, clear it, add a stagger bonus
  (+6) to the impact, push `nextEnemy` by 2 s and `say()` the interrupt. The strike cooldown
  stays 3.2 s so an interrupt is a choice, not a free action.
- **UI**: `combatStatusText()` appends a wind-up line while `windupUntil` is set, the strike
  button reads "Jetzt zuschlagen!" and the enemy portrait gets class `windup` (CSS pulse).
- **Hint selection**: journal entries get an optional `at` array; `atPlace` uses
  `(e.at||[e.place]).includes(g.location)`. Fallback when all are done is the last entry at
  the place, which is the newest quest because `journalEntries()` appends in story order.
- **Rewards**: the rat `reward()` adds 15 apples; `resolveRatPeacefully()` adds 6 seeds.
- **Save compatibility**: `combat` is always reset to null on load, so no migration.

## Risks / Trade-offs

- [Wind-up too short to react on a 200 ms tick] → 1.5 s wind-up, strike cooldown unchanged;
  the player can hold the strike for the telegraph.
- [Interrupt makes the fight trivial with the knife] → stagger bonus is small and the heavy
  attack comes only every third hit; the auto-attack race still decides the fight.
