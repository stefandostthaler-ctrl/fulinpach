# Tasks

## 1. Map drawing

- [x] 1.1 In `buildMapCanvas()` (`src/js/ui.js`) remove the place-name words listed in design.md while keeping house/church drawings, region labels, title and compass; verify with a grep that none of the removed words remain in `buildMapCanvas()` and MOOR UND WIESEN / ROSENHEIMER BECKEN / BAD FEILNBACH / BRUECKE still do
- [x] 1.2 Rewrite the two in-canvas legend lines for the new markers (no „Nummer“); verify both lines fit inside the frame (≤ 110 characters)

## 2. Markers and hover labels

- [x] 2.1 Add `placeStatus(place)` returning `current|encounter|completed|locked|available` and use it for the list entries instead of the inline `pending`/`complete` logic; verify list classes are unchanged for the current save in the browser
- [x] 2.2 Replace the `[NN]` tag stamping and regex in `renderMap()` with a row/column lookup that emits 3-character marker buttons showing the status symbol, disabled when locked, `aria-label` with name (+ „ · noch gesperrt“), no `title`, click → `travel(place.id)`; verify marker count equals list count and no `[0` / `[1` number tags appear in the map text
- [x] 2.3 Add a `.map-label` span per marker with CSS that shows it only on `:hover` / `:focus-visible`, with solid background and high `z-index`, and a `label-left` variant for `col > 80`; set `.map-art` `overflow:visible`; verify in the browser that hovering the Kirche marker shows „Herz-Jesu-Kirche“ and the Sterntaler Filze label is fully visible
- [x] 2.4 Remove the numbers from the place list labels and update the `.map-legend` paragraph; verify list entries read e.g. „Rathausplatz“ and the legend mentions hover

## 3. Size and zoom

- [x] 3.1 Change the „Weltkarte“ CSS so `.terrain-map` size derives from `--map-font` (`calc(114ch + 24px)` × `50em`, default 22px) and `.map-art` uses `line-height:1; letter-spacing:0`; verify in the browser that at 22px the frame's right `|` and bottom `+---+` line are visible when scrolled to the end
- [x] 3.2 Add „−“ / „+“ zoom buttons above the map with steps `[15,18,22,26,30]`, disabled at the ends, updating `--map-font` in place and saving to `localStorage` key `fulinpach_map_zoom` (try/catch, fallback 22); verify zoom changes size, survives a reload, and the game still works when storage throws

## 4. Verify

- [x] 4.1 In the browser (dev-browser, `file:///C:/games/fulinpach/src/index.html`): screenshot the map at 15, 22 and 30px, check no marker overlaps a label or cuts the frame, clicking an unlocked marker travels to that place, clicking a locked marker does nothing, and the console has no errors
- [x] 4.2 With a fresh game state that has only the map unlocked (not the ending), verify no ending-only place (Wiechs, Litzldorf, Farrenpoint, Wendelstein, Au) has a marker or visible name; before the test copy the raw `localStorage` value of `fulinpach_bad_feilnbach_v3` and write it back afterwards, then verify the old apple count is restored
