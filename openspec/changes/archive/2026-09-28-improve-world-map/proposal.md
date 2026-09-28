# Proposal

## Why

GitHub issue #1 („map new“): the world map („Weltkarte“) is hard to read. Its 15px ASCII drawing
is small and dense, and every place name is printed into the drawing, so the landscape is covered in
text. The only thing to click is a tiny `[01]`-style number. The creator asks to make the map
larger, show place names only on mouse hover, and make places clickable.

## What Changes

- The map is drawn larger (about 22px instead of 15px), and players get „+“ / „−“ zoom buttons. The
  chosen zoom is remembered in this browser. The map still scrolls sideways when it is wider than
  the screen.
- Travel places no longer have their names printed in the ASCII drawing, and the `[01]` number tags
  are gone. Each place is instead a clickable marker in the landscape that shows its status
  (current, exploration open, available, completed, locked).
- Hovering the mouse over a marker, or moving keyboard focus onto it, shows the place name (and
  „noch gesperrt“ for locked places) right away. Clicking a marker travels there, as before.
- Region and landscape labels (e.g. MOOR UND WIESEN, ROSENHEIMER BECKEN, BAD FEILNBACH, BRUECKE) and
  the legend stay visible. The legend is updated to explain the new markers.
- The place list under the map stays, as the way to travel for touch and keyboard users and for
  screen readers. It no longer shows the removed numbers.
- Side effect: places that only appear late in the story (e.g. Wiechs, Litzldorf, Farrenpoint,
  Wendelstein) are no longer named in the drawing before they are unlocked.

## Capabilities

### New Capabilities

- `world-map`: how the Weltkarte presents places and lets the player travel: size and zoom, place
  markers with hover names, status, and the place list.

### Modified Capabilities

<!-- None: game-distribution and github-pages-deployment are not affected. -->

## Impact

- `src/js/ui.js`: `buildMapCanvas()` (drop place-name labels), `renderMap()` (markers, hover
  labels, zoom controls, list without numbers).
- `src/css/style.css`: the „Weltkarte“ section (sizes from a zoom variable, marker and hover-label
  styles, zoom buttons).
- Save format unchanged. The zoom level is stored separately in the browser as a display
  preference.
- No new files or dependencies. The game still runs by double-click.
