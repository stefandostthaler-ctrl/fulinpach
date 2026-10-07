# Tasks

## 1. Quest status at the Jenbach bridge

- [x] 1.1 Give the flood journal entry `at:["jenbach","siedlung"]` and change `renderQuests()` to filter by `at` and fall back to the last entry at the place; verify in the headless test that the hint at the bridge names the next flood step during the quest and the flood outcome after it, never the rat decision.
- [x] 1.2 Change the Jenbach arrival message in `travel()` to describe the flood state and outcome; verify the message after a solved flood does not mention rats.

## 2. Telegraphed rat attack

- [x] 2.1 Add `special` to the Bachrattenkönig in items.js and implement wind-up, heavy hit and attack counting in `combatTick()`; verify in the headless test that the third attack winds up and then deals double damage.
- [x] 2.2 Implement the interrupt in `strike()` (cancel wind-up, stagger bonus, delayed next attack); verify with and without the knife that a strike during the wind-up prevents the heavy hit.
- [x] 2.3 Show the wind-up in `combatStatusText()`, the strike button label and a `windup` portrait class with CSS; verify in the browser that the text and class appear during the wind-up and vanish after.
- [x] 2.4 Rebalance rewards (fight +15 apples, peaceful +6 Kerne) and the Jenbach scene text that lists both options; verify both routes in the headless test.

## 3. Verification

- [x] 3.1 Headless run covering: fight with knife, fight without weapon, peaceful route, flee during wind-up, death by heavy attack, autosave after victory, import of a version 11 save mid-flood; all assertions pass.
- [x] 3.2 Browser run of the rat fight with console open; no errors, wind-up visible.
