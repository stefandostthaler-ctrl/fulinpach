# Tasks

## 1. Consequence hooks

- [ ] 1.1 Implement the water-quest consequences from the design table (Osterbach, warning, protection) as conditionals in cost tables, `travel()` lines and scene texts with once-flags for rewards; verify each in a headless test by setting the decision and asserting the cost, text or reward.
- [ ] 1.2 Implement the route consequences (rats, wall, Golem) the same way; verify in the headless test.
- [ ] 1.3 Implement the Wegbuch-choice consequences (name, moor, water, promise, mountain); verify in the headless test, including that no quest becomes unsolvable (every route still available at equal or lower cost).

## 2. Voice and humour

- [ ] 2.1 Rewrite each place's scene text, arrival line and hotspot labels along the voice notes, keeping facts; verify by reading all texts of a place in sequence in the browser.
- [ ] 2.2 Add `merchantLine()` and render it above the offer; verify in the browser for first visit, after NICHT KAUFEN and after the ending.
- [ ] 2.3 Add reactions to repeated or odd actions (eating at full LP, repeated nonsense whispers, feeding the crow before it arrived); verify each message in the headless test.

## 3. Consistency

- [ ] 3.1 Write a headless scan that prints every scene text and journal step for each terminal quest state and flags "open" wording after completion, duplicate paragraphs and meta words; fix findings; verify the scan reports zero.
- [ ] 3.2 Check every new historical mention against the Gemeinde pages cited in story.js; remove anything not supported; verify by listing each claim with its source in design.md.

## 4. Verification

- [ ] 4.1 Fresh browser playthrough to the ending on one decision set, then import a save with the opposite decisions and read the differing texts; no console errors.
- [ ] 4.2 Update Vergleich-Candy-Box-2.md (tone point resolved) and note in README that consequences live in game.js next to the decision.
