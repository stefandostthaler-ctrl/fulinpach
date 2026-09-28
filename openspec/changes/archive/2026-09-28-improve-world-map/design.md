# Design

## Context

`renderMap()` in `src/js/ui.js` copies a cached 114×50 character canvas from `buildMapCanvas()`,
stamps a 4-character `[NN]` tag at each place's `col`/`row`, joins the rows, and turns the tags
back into inline `<button class="map-point">` elements with a regex. The place names are printed by
`put()` calls in `buildMapCanvas()`, often in the same string as a small house drawing (e.g.
`" |[]|  AU / TAXA"`). The CSS fixes `.terrain-map` at 1120×760px and `.map-art` at 15px. The body
font is monospace (`"Courier New"`) with `letter-spacing:.01em`. `.map-art` and `.terrain-map`
both use `overflow:hidden`. Below the map, `.map-marker` buttons list the places and show their
status with `::before` symbols (`[@] [?] [+] [X] [#]`).

## Goals / Non-Goals

**Goals:**
- Keep one source of truth for the place list (the `places` array in `renderMap()`) for both the
  markers and the list.
- Map dimensions follow the font size, so zoom needs no pixel constants.

**Non-Goals:**
- No redrawing or recomposition of the landscape art beyond removing place-name text.
- No pinch-zoom, dragging, or minimap; no change to `travel()` or place unlock rules.
- No save-format change.

## Decisions

- **Size from one CSS variable.** `.terrain-map` gets `font-size:var(--map-font,22px)`,
  `width:calc(114ch + 24px)` and `height:50em`, and `.map-art` sets `font-size:inherit`,
  `line-height:1` and `letter-spacing:0`, so `ch`/`em` match the character grid exactly. Zoom
  sets `--map-font` on the element. Alternative: `transform: scale()`, rejected because it blurs
  text and does not change the scroll size.
- **Zoom steps `[15,18,22,26,30]` px, default 22.** The value is stored under the `localStorage` key
  `fulinpach_map_zoom`, with reads and writes in `try/catch` and a fallback to 22 for missing or
  invalid values. It is kept out of `g` so exports and `normalizeSave()` stay untouched. The
  „−“ / „+“ buttons sit in a small bar above the map and are disabled at the ends. A zoom click
  updates the variable and the buttons in place instead of calling `render()`, which also keeps
  the scroll position.
- **Markers by position, not by regex.** Place tags are no longer stamped into the canvas text.
  `renderMap()` builds a lookup `row → [{col, place}]`. While writing each row, it emits text up to
  `col`, then a 3-character marker button, then skips 3 characters of the base row, so the marker
  replaces the ground under it just as the old tag did. This removes the `[NN]` regex and the
  numbers.
- **Marker glyph = status symbol.** The marker text is `[@]`, `[?]`, `[+]`, `[X]` or `[#]`. A helper
  `placeStatus(place)` returns `current|encounter|completed|locked|available`, and both the marker
  and the list entry use it. This moves the `pending`/`complete` logic that is now inline in the
  list loop. The list keeps its CSS `::before` symbols, driven by the same status classes.
- **Hover label as a child element, CSS-only.** Each marker button contains
  `<span class="map-label">Name</span>`, which is absolutely positioned above the marker and hidden
  unless the button is `:hover` or `:focus-visible`. There is no JavaScript and no delay. The
  native `title` is dropped so the browser tooltip does not appear twice. `aria-label` keeps the
  name for screen readers. For places with `col > 80`, the label is anchored to the right
  (`.map-point.label-left`) so it is not cut off at the right edge. `.map-art` switches to
  `overflow:visible` so labels near the top can extend past the text. `.terrain-map` stays
  `overflow:hidden`, and markers in rows 1–2 do not exist.
- **Remove place-name text from `buildMapCanvas()`.** Only the words go: AU / TAXA, BAHNHOF,
  RATHAUS, KIRCHE, WOHNHAEUSER, WIECHS, LITZLDORF, SPIELPLATZ, BIBERBURG, JENBACH, JENBACHTAL,
  TREGLER ALM, WIRTSALM, FARRENPOINT, WENDELSTEIN and STERNTALER FILZE. The drawings in the same
  strings stay, e.g. `" |[]|"`. Kept: the title line, MOOR UND WIESEN, ROSENHEIMER BECKEN,
  BAD FEILNBACH, BRUECKE and the compass. STERNTALER FILZE sits inside the moor pattern; its
  area is left as blank space rather than refilled.
- **Legend text.** The in-canvas legend lines and the `.map-legend` paragraph are rewritten:
  „[@] hier · [?] Erkundung offen · [+] anwählbar · [X] erledigt · [#] gesperrt – Namen erscheinen
  beim Darüberfahren“. The line „Nummer anklicken oder Ziel unten waehlen“ is replaced with
  „Ort anklicken oder unten waehlen“.

## Risks / Trade-offs

- [Touch screens have no hover, so names are not visible on the map] → The place list below names
  every place, and tapping a marker still travels.
- [Hover labels over neighbouring markers (Rathaus/Markt are close)] → Labels get a solid background
  and a higher `z-index`, and only one is visible at a time.
- [A different monospace fallback font changes the character width] → Width uses `ch` of the actual
  font, so the grid stays consistent.
- [A marker lands on a meaningful drawing character] → Same positions as the old 4-character tags,
  now one character narrower, so no new overlaps. Check visually at every zoom step.

## Migration Plan

No data migration. Old saves work as before. The zoom preference starts at the default.
