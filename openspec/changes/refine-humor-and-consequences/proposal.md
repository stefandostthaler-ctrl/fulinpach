# Proposal

## Why

GitHub issue #8: the author wants the writing sharpened with a light touch. The quiet main
story (Fulinpah, water, old names, two endings) stays. Dry humour in encounters, merchant
lines and reactions should get stronger, every major decision should have a visible later
consequence, each place should sound different, the chronicle stays source-bound, and stale or
contradictory texts must go.

## What Changes

- **Consequences**: every water-quest decision (Osterbach solution, flood warning, flood
  protection) and every Wegbuch choice (six threads, two options each) gets at least one later
  story or gameplay response. The rat, wall and Golem routes get one each too. The full list
  is in design.md.
- **Voice per place**: a one-line "voice note" per place in design.md guides the rewrite of
  that place's texts (scene text, arrival line, hotspot labels).
- **Merchant**: the Händler reacts to state (what you bought, what you did) with a rotating
  line above the offer.
- **Reactions**: a few unexpected responses to repeated or odd player actions (eating with
  full LP, feeding the crow at the wrong place, whispering nonsense repeatedly).
- **Consistency pass**: a scan of every scene text and journal step for "quest still open"
  wording after completion, duplicate events, and contradictory flags; fixes applied.
- **Chronicle**: no new historical claims unless verified against the Gemeinde pages already
  cited in story.js. No in-game meta notices about what is real or invented.

## Capabilities

### New Capabilities
- `story-consequences`: which decisions the game remembers and how each shows up later.
- `scene-text-consistency`: what a scene text and journal step may say after a quest is
  finished, and the merchant's state-dependent lines.

### Modified Capabilities
<!-- none -->

## Impact

- `src/js/content/story.js`: consequence texts, voice rewrites.
- `src/js/game.js`: consequence hooks (small conditionals in existing functions), merchant
  line selection.
- `src/js/ui.js`: scene texts per place, merchant line, reaction messages.
- No save format change.
