# Design

## Context

- `renderMap()` (`src/js/ui.js`) rebuilds the whole map DOM whenever the map tab is shown or the
  player travels. The DOM is: `.map-scroll` (`overflow-x:auto`) > `.terrain-map` > `pre.map-art`
  with inline `button.map-point` markers.
- The map size comes from `--map-font`. `.terrain-map` is `calc(114ch + 24px)` × `calc(50em + 4px)`.
  Zoom rewrites that variable in steps `[15,18,22,26,30]` saved under `fulinpach_map_zoom`.
- Hover labels (`.map-label`) use `font-size:max(14px,.75em)` and are positioned inside the marker.
- The game must stay a no-build, double-click page with classic `<script>` tags. There are no
  libraries and no ES modules.
- Locked markers are `disabled` buttons. Browsers do not reliably send pointer events to disabled
  controls, so a drag that starts on one would do nothing.

## Goals / Non-Goals

**Goals:**
- Google-Maps-like drag, smooth zoom toward the pointer, pinch, and fit-to-window, in about 150 lines
  of plain JS.
- Cooperative gestures: page scrolling with the plain wheel or one finger is never captured.
- The view survives map rebuilds and reloads.

**Non-Goals:**
- Momentum or inertia after a drag, and animated zoom transitions.
- Changing the map drawing, marker positions or the place list.
- Making marker hit targets larger at low zoom. The place list stays the accessible alternative.

## Decisions

1. **CSS transform instead of re-laying out the font.** `.terrain-map` stays at a fixed base of
   `--map-font:22px`. The view is applied as
   `transform:translate(tx px,ty px) scale(s)` with `transform-origin:0 0`. A transform does not
   cause a text relayout, so it stays smooth during drags and pinches. Scale limits:
   `sMin = min(vw/W, vh/H)` (fit), where W and H are the base size measured with
   `offsetWidth/offsetHeight`, and `sMax = 60/22`. *Alternative:* keep changing `--map-font`.
   That reflows about 5,700 characters on every wheel tick and makes anchoring to the pointer
   imprecise.

2. **View state in map coordinates.** A module-level `mapView = {s, cx, cy}` holds the scale and the
   map point shown at the window centre. `applyMapView()` computes `tx = vw/2 − cx·s` and clamps it.
   When `W·s ≤ vw`, the map is centred (`tx=(vw−W·s)/2`); otherwise `tx ∈ [vw−W·s, 0]`. The same
   applies to y. The clamped values are written back into `cx/cy`. Storing the centre instead of
   `tx/ty` keeps the view stable when the window is resized. A `ResizeObserver` on the viewport
   re-applies the view. It is disconnected before `renderMap()` builds a new one.

3. **Zoom around a point.** For viewport point `(px,py)`: `mx=(px−tx)/s`, `s'=clamp(s·k)`,
   `tx'=px−mx·s'`, then derive `cx` and clamp. Buttons and keys use the window centre with k=1.5.
   Double-click uses k=2. Ctrl+wheel uses `k=exp(−deltaY·0.002)`, with `deltaY` multiplied by 16
   when `deltaMode` is 1 (lines).

4. **Persistence.** Save `{s,cx,cy}` as JSON under `fulinpach_map_view` at the end of a gesture and
   after a button or key action, inside try/catch. On load, accept it only if all three are finite
   numbers. `s` is clamped when applied. With no valid saved view, centre on
   `.map-point.current` (its `offsetLeft/Top` plus half its size, relative to `.map-art`, which fills
   `.terrain-map`) at `s=1`. If there is no current marker, centre on the middle of the map.
   Remove the old `fulinpach_map_zoom` key inside try/catch. Nothing is added to the save object.

5. **Mouse and pen: Pointer Events on the viewport.** On `pointerdown` (not touch, primary button,
   not inside `.map-controls`), remember the start point. Once the pointer has moved more than 4px,
   enter drag mode: `setPointerCapture`, class `.dragging` (`cursor:grabbing`), pan by the delta.
   On `pointerup`, save. A capture-phase `click` listener on the viewport swallows the click that
   follows a drag, so a drag from a marker never travels. The viewport uses `cursor:grab`.

6. **Touch: Touch Events with `{passive:false}`.** With two or more touches, call `preventDefault()`
   and track the midpoint and distance between the fingers. The midpoint change pans, and the
   distance ratio zooms around the midpoint. With one touch, do not call `preventDefault` (the page
   scrolls). If the finger moves more than 10px, show the two-finger hint. The viewport gets
   `touch-action:pan-x pan-y`, so the browser never pinch-zooms the page from inside the map. Pointer
   Events alone would need `touch-action:none`, which would block one-finger page scrolling.

7. **Locked markers use `aria-disabled="true"` instead of `disabled`.** Their click handler is a
   no-op, and they keep the disabled styling through `[aria-disabled="true"]`. This keeps drag
   behaviour the same on every marker. Keyboard users can now also focus a locked marker and hear
   „· noch gesperrt“.

8. **Hints.** One `.map-hint` overlay element is centred in the viewport with
   `pointer-events:none`. `showMapHint(text)` sets the text, adds `.visible`, and removes it after
   1500ms, restarting the timer on repeated calls. The plain wheel (no ctrlKey) shows
   „Strg + Mausrad zum Zoomen“. The hint is the same on every platform, because the check is `ctrlKey`
   everywhere.

9. **Controls and keyboard.** `.map-controls` is absolutely positioned top-right inside the viewport
   and holds three `btn()`s: „+“, „−“ and „Ganze Karte“, with aria-labels. „+“ and „−“ use the
   existing function-form `disabled`, comparing `s` with the limits (±0.001). After each view change,
   `refreshButtons()` runs. The viewport gets `tabindex="0"` and an `aria-label` explaining arrows
   and +/−. `keydown`: arrows pan by 80px, `+`/`=` and `-` zoom, each with `preventDefault`.
   `:focus-visible` shows an outline.

10. **Readable labels at any zoom.** `applyMapView()` also sets `--map-scale:s` on `.terrain-map`.
    `.map-label` uses `font-size:calc(14px / var(--map-scale))` and
    `border-width:calc(1px / var(--map-scale))`, so a label stays about 14px on screen. `.label-left`
    stays as it is.

11. **Layout.** `.map-scroll` becomes `.map-viewport`:
    `position:relative; overflow:hidden; height:min(70vh,620px); min-height:300px;
    background:#f7f8ec; border:1px dashed var(--line)`. The „Kartengröße“ row and the
    `.map-scroll-hint` paragraph are removed, together with the `.map-zoom` and
    `.map-scroll-hint` CSS rules. `.map-intro` and `.map-legend` explain drag, Ctrl + wheel and two
    fingers.

## Risks / Trade-offs

- **Blurry text during a transform.** Chrome re-rasterises text after a transform settles when
  `will-change` is not set. Do not set `will-change`.
- **Hover labels clipped by the viewport edge.** `overflow:hidden` can cut off a label of a marker
  right at the top edge. This is acceptable, because a small drag reveals it.
- **Measuring while hidden.** `renderMap()` only runs for the active tab, so `offsetWidth` is valid.
  If W or H is 0, `applyMapView()` returns early and the `ResizeObserver` applies the view later.
- **Focus scrolls the viewport.** An `overflow:hidden` element can still be scrolled by focus, so
  tabbing to an off-screen marker shifted the map under the transform. The viewport resets its
  `scrollLeft/Top` to 0 on `scroll`. On `focusin` of a marker outside the visible area (40px margin),
  the view is centred on that marker.
- **Hit targets at low zoom.** At fit zoom on a phone, markers are about 5px. The place list below
  the map is the way to travel there, as the spec already says.
- **Trackpad pinch on macOS Safari** sends `gesture*` events instead of ctrl+wheel. This is not
  handled, and Safari users use the buttons instead.
