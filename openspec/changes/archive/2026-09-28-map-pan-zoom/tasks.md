# Tasks

## 1. Viewport and view state

- [x] 1.1 In `renderMap()` (`src/js/ui.js`), replace the „Kartengröße“ row, the `.map-scroll-hint` paragraph and `.map-scroll` with a `.map-viewport` (`tabindex="0"`, aria-label for arrows and +/−) that holds `.terrain-map`, an empty `.map-controls` and a `.map-hint`. In `src/css/style.css`, add the `.map-viewport` / `.map-hint` rules from design.md and delete `.map-zoom`, `.map-scroll` and `.map-scroll-hint`. Verify with grep that `map-zoom`, `map-scroll`, `MAP_ZOOM` and `setMapZoom` no longer occur in `src/`
- [x] 1.2 Replace `MAP_ZOOM_*`, `loadMapZoom` and `setMapZoom` with `mapView {s,cx,cy}`, `loadMapView()` (JSON from `fulinpach_map_view`, finite-number check, try/catch, removes `fulinpach_map_zoom`), `saveMapView()` and `applyMapView()` (measure W/H, `sMin` fit / `sMax = 60/22`, clamp or centre per design.md decision 2, write `transform` and `--map-scale`, early return when W or H is 0). Verify in the browser console that `applyMapView()` with a huge `cx` still keeps the frame's right edge at the window edge
- [x] 1.3 Add the first view (centre on `.map-point.current` at `s=1`, else the map centre) and a `ResizeObserver` that is disconnected on every rebuild. Verify that with `fulinpach_map_view` deleted the current place's marker is near the window centre, and that resizing the browser window keeps the same centre

## 2. Gestures

- [x] 2.1 Add `zoomMapAt(px,py,k)` and the mouse/pen drag with Pointer Events (4px threshold, pointer capture, `.dragging` cursor, capture-phase click suppression after a drag, no drag from `.map-controls`). Verify that dragging from empty map and from a marker moves the map without travelling, and that a plain click on an unlocked marker travels
- [x] 2.2 Switch locked markers from `disabled` to `aria-disabled="true"` with a no-op click and matching CSS. Verify that a drag starting on a locked marker moves the map, that clicking it does nothing, and that its focus label reads „<Name> · noch gesperrt“
- [x] 2.3 Add a non-passive `wheel` handler: with Ctrl, zoom at the pointer and `preventDefault`; without Ctrl, `showMapHint("Strg + Mausrad zum Zoomen")`. Also add `dblclick` on non-marker targets for ×2 zoom. Verify that the marker under the pointer stays in place during Ctrl+wheel, that the page does not zoom, and that the plain wheel scrolls the page and shows the hint for about 1.5 s
- [x] 2.4 Add non-passive touch handlers (two fingers pan and pinch around the midpoint with `preventDefault`; one finger only shows „Zum Verschieben zwei Finger verwenden“ after 10px) and `touch-action:pan-x pan-y` on the viewport. Verify in dev-browser with a mobile viewport and touch emulation (or on a phone) that pinch zooms the map but not the page, and one-finger swipes scroll the page

## 3. Controls, keyboard, labels, texts

- [x] 3.1 Fill `.map-controls` with „+“, „−“ and „Ganze Karte“ (`btn()` with function-form `disabled` against the scale limits, aria-labels, `refreshButtons()` after view changes), and add viewport `keydown` handling (arrows pan by 80px, `+`/`=`/`-` zoom, `preventDefault`) with a `:focus-visible` outline. Verify that „Ganze Karte“ shows the whole frame and disables „−“, and that Tab → right arrow → „+“ pans then zooms
- [x] 3.2 Make `.map-label` font size and border counter-scale with `--map-scale`. Verify that at fit zoom and at max zoom a hovered label measures about 14px text height on screen (`getBoundingClientRect`)
- [x] 3.3 Update `.map-intro` and `.map-legend` texts to explain drag, Ctrl + Mausrad and two fingers. Verify that the texts no longer mention scrolling sideways

## 4. Verify

- [x] 4.1 In the browser (dev-browser, `file:///C:/games/fulinpach/src/index.html`): zoom and pan, travel via a marker, switch tabs and come back, reload. Check that the view is the same each time, that the console has no errors, and that the place list still travels. Take screenshots at fit zoom, the default zoom and max zoom
- [x] 4.2 With `localStorage` access patched to throw (e.g. overriding `Storage.prototype.getItem/setItem` before the scripts run), verify that the map opens at the first view and the game works. Before any storage experiment, copy the raw `fulinpach_bad_feilnbach_v3` value and restore it afterwards, then verify the apple count is unchanged
