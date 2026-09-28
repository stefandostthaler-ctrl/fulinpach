# Proposal

## Why

Moving around the Weltkarte is awkward. The map only scrolls sideways inside a strip, and zoom jumps
between five fixed sizes using two buttons. Players expect the map to behave like Google Maps: grab
it and drag it, zoom smoothly toward the spot they are looking at, and see the whole map at a glance.

## What Changes

- The map sits in a fixed-height map window. Players move it by dragging with the mouse (or with two
  fingers on touch screens) instead of using a sideways scrollbar.
- Zoom is smooth instead of stepped. The smallest zoom fits the whole map in the window. The largest
  zoom is about twice the current largest size (about 60px characters).
- **Ctrl + mouse wheel** (and trackpad pinch) zooms toward the mouse pointer. The plain mouse wheel
  keeps scrolling the page. When the player uses the plain wheel over the map, a short hint shows
  „Strg + Mausrad zum Zoomen“, as in embedded Google Maps.
- On touch screens, two fingers pan and pinch-zoom the map, and one finger keeps scrolling the page.
  A single-finger drag on the map shows the hint „Zum Verschieben zwei Finger verwenden“.
- Double-clicking an empty part of the map zooms in there.
- „+“, „−“ and „Ganze Karte“ buttons float in a corner of the map window. The keyboard also works:
  when the map window has focus, the arrow keys pan and +/− zoom.
- Clicking a marker still travels, and a drag that starts on a marker does not trigger travel. Hover
  labels keep a readable size at any zoom.
- The first time a player opens the map, it centres on their current place. After that, the zoom and
  the view are remembered in this browser. They are kept when the map is rebuilt after travelling,
  and they are not part of the save. **BREAKING** (minor): the old `fulinpach_map_zoom` step setting
  is ignored.
- The „Kartengröße: − +“ row above the map and the scrolling hint are removed.

## Capabilities

### New Capabilities

_None._

### Modified Capabilities

- `world-map`: the requirement „Readable map size with zoom“ is replaced by „Map window with smooth zoom“, changing from stepped zoom with a
  sideways scrollbar to smooth zoom with dragging in a map window. New requirements cover dragging
  (pan), wheel and touch gestures with cooperative hints, and the map controls with keyboard use.

## Impact

- `src/js/ui.js`: the zoom code (`MAP_ZOOM_*`, `loadMapZoom`, `setMapZoom`) and the map part of
  `renderMap()` are replaced by a small pan/zoom controller (a transform on `.terrain-map`, plus
  pointer, wheel, touch and key handlers).
- `src/css/style.css`: the „Weltkarte“ rules — viewport, overlay controls, hint overlay and
  counter-scaled `.map-label`.
- No new files, libraries or build step. The game still runs by double-clicking `src/index.html`.
