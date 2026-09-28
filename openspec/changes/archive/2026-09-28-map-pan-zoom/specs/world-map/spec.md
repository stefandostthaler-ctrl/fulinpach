# Spec Delta

## REMOVED Requirements

### Requirement: Readable map size with zoom
**Reason**: Stepped zoom with a sideways scrollbar is replaced by smooth zoom and dragging inside a map window.
**Migration**: See „Map window with smooth zoom“ below. The old `fulinpach_map_zoom` setting is ignored, and players start at the first-time view.

## ADDED Requirements

### Requirement: Map window with smooth zoom

The map SHALL be shown inside a map window of fixed height that does not scroll sideways. Zoom SHALL
be smooth, not in fixed steps. The smallest zoom SHALL fit the whole map drawing inside the map
window. The largest zoom SHALL show map characters about 60px high. The drawing and its markers
SHALL scale together. At every zoom, the view SHALL be kept so that the map drawing covers the
window, or is centred in the window when the drawing is smaller than the window.

The first time a player opens the map in a browser, it SHALL be centred on the player's current
place with characters about 22px high. The zoom and the visible part of the map SHALL then be
remembered in that browser across reloads and while the map is rebuilt (for example after
travelling). They SHALL NOT be part of the exported save, and the map SHALL fall back to the
first-time view when browser storage is unavailable. The setting stored by the earlier stepped zoom
SHALL be ignored.

#### Scenario: First view
- **WHEN** a player opens the Weltkarte for the first time while at the Herz-Jesu-Kirche
- **THEN** the map window shows the Kirche marker near its centre, with characters about 22px high

#### Scenario: Whole map
- **WHEN** the player zooms out as far as possible
- **THEN** the whole map, including its frame, is visible in the map window without cut-off edges

#### Scenario: View is remembered
- **WHEN** the player zooms and drags the map, then travels to another place by clicking a marker
- **THEN** after the travel the map still shows the same part at the same zoom
- **AND** after a page reload the map again shows that part at that zoom

#### Scenario: Storage unavailable
- **WHEN** browser storage throws on read and write
- **THEN** the map still opens, centred on the current place at the first-time zoom, and the game works

### Requirement: Drag to move the map

The player SHALL move the visible part of the map by pressing the mouse button anywhere on the map
and dragging, including when the drag starts on a marker. While dragging, the pointer SHALL show a
grabbing hand. The map SHALL NOT be dragged past its edges. A press and release that moves the
pointer by only a few pixels SHALL count as a click, so clicking a marker still travels. A drag that
starts on a marker SHALL NOT travel.

#### Scenario: Dragging the map
- **WHEN** the player presses the mouse on an empty part of the map and drags to the left
- **THEN** the map follows the pointer and shows more of its eastern part

#### Scenario: Drag starting on a marker
- **WHEN** the player presses the mouse on the Rathausplatz marker, drags 100px and releases
- **THEN** the map has moved and the game has not travelled

#### Scenario: Click on a marker
- **WHEN** the player clicks an unlocked marker without moving the mouse
- **THEN** the game travels to that place

#### Scenario: Edge
- **WHEN** the player keeps dragging to the right after the western frame of the map has reached the window edge
- **THEN** the map does not move further

### Requirement: Wheel and touch gestures that leave page scrolling alone

Holding Ctrl while turning the mouse wheel over the map, or a trackpad pinch, SHALL zoom the map
while the point under the pointer stays in place. The page SHALL NOT scroll or zoom at the same
time. The plain mouse wheel over the map SHALL scroll the page as usual and SHALL show the hint
„Strg + Mausrad zum Zoomen“ over the map for about one and a half seconds. Double-clicking an empty
part of the map SHALL zoom in one step, centred on that point.

On touch screens, two fingers SHALL move the map, and pinching SHALL zoom it around the point
between the fingers, without the page zooming. One finger SHALL scroll the page as usual. A
one-finger swipe that starts on the map SHALL show the hint „Zum Verschieben zwei Finger
verwenden“. Tapping a marker SHALL still travel.

#### Scenario: Ctrl and wheel
- **WHEN** the mouse is over the Sterntaler Filze marker and the player turns the wheel up while holding Ctrl
- **THEN** the map zooms in, the Filze marker stays under the pointer, and the page does not scroll

#### Scenario: Plain wheel
- **WHEN** the player turns the mouse wheel over the map without Ctrl
- **THEN** the page scrolls and the hint „Strg + Mausrad zum Zoomen“ appears briefly over the map

#### Scenario: Pinch on a phone
- **WHEN** a player on a phone pinches outward with two fingers on the map
- **THEN** the map zooms in around the fingers and the page itself does not zoom

#### Scenario: One finger on a phone
- **WHEN** a player swipes up with one finger on the map
- **THEN** the page scrolls and the hint „Zum Verschieben zwei Finger verwenden“ appears briefly

### Requirement: Map controls and keyboard use

The map window SHALL show controls in one corner: „+“ (zoom in), „−“ (zoom out) and „Ganze Karte“
(zoom out to the whole map). „+“ and „−“ SHALL zoom around the centre of the window and SHALL be
disabled at the largest and the smallest zoom. The map window SHALL be reachable with the Tab key.
While it has focus, the arrow keys SHALL move the map and the „+“ and „−“ keys SHALL zoom it. The
controls and the text above or below the map SHALL describe how to move and zoom it. Place-name
labels shown on hover or focus SHALL stay at a readable size, at least about 14px, at every zoom.

#### Scenario: Buttons
- **WHEN** the player presses „Ganze Karte“
- **THEN** the whole map is visible and „−“ is disabled

#### Scenario: Keyboard
- **WHEN** a keyboard user tabs to the map window and presses the right arrow key and then „+“
- **THEN** the map moves to show more of its eastern part and then zooms in

#### Scenario: Label size when zoomed out
- **WHEN** the map is zoomed out to the whole map and the player hovers over a marker
- **THEN** the place name is shown at a readable size, not scaled down with the map
