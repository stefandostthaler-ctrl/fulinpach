## Purpose

Defines how the Weltkarte shows the landscape and the travel places, and how the player reads place
names and travels from it, so that the map stays legible and uncluttered.

## ADDED Requirements

### Requirement: Readable map size with zoom

The map SHALL be shown with a default character size of about 22px. The map SHALL offer „+“ and „−“
controls that change the size in steps between a smallest size of about 15px and a largest size of
about 30px. The whole drawing SHALL scale with the chosen size, and the map area SHALL scroll
sideways when the drawing is wider than the available space. The chosen size SHALL be remembered in
the same browser across reloads, SHALL NOT be part of the exported save, and SHALL fall back to the
default when browser storage is unavailable.

#### Scenario: Default size
- **WHEN** a player opens the Weltkarte for the first time
- **THEN** the map characters are about 22px high, larger than the previous 15px

#### Scenario: Zooming in and out
- **WHEN** the player presses „+“
- **THEN** the drawing and its markers become larger, with nothing cut off, and the map can be scrolled to every edge
- **AND** „+“ is disabled at the largest size and „−“ is disabled at the smallest size

#### Scenario: Zoom is remembered
- **WHEN** the player changes the zoom and reloads the page
- **THEN** the Weltkarte opens at the chosen zoom

### Requirement: Place names only on hover or focus

Travel places SHALL NOT have their names printed permanently in the map drawing. Each travel place
SHALL be shown as a marker at its position. When the mouse is over the marker, or the marker has
keyboard focus, the place name SHALL appear next to it without delay; for a locked place, the name
SHALL be followed by „noch gesperrt“. The label SHALL disappear when the mouse leaves or focus moves
away. Region and landscape labels that are not travel places, and the legend, SHALL stay visible.

#### Scenario: Map without place names
- **WHEN** the Weltkarte is shown
- **THEN** no travel place name (e.g. RATHAUS, BAHNHOF, TREGLER ALM) is visible in the drawing
- **AND** region labels such as MOOR UND WIESEN and ROSENHEIMER BECKEN are still visible

#### Scenario: Hovering a marker
- **WHEN** the player moves the mouse over the marker of the Herz-Jesu-Kirche
- **THEN** the label „Herz-Jesu-Kirche“ appears next to the marker
- **AND** it disappears when the mouse moves away

#### Scenario: Locked place
- **WHEN** the player hovers over the marker of a locked place
- **THEN** its label reads „<Name> · noch gesperrt“

#### Scenario: Keyboard focus
- **WHEN** a keyboard user tabs onto a marker
- **THEN** the same label is shown while the marker has focus

#### Scenario: Late places stay unnamed
- **WHEN** the story ending has not been reached
- **THEN** the map shows neither markers nor names for places that are only added at the ending (e.g. Wiechs, Litzldorf, Farrenpoint, Wendelstein)

### Requirement: Clickable place markers with status

Each marker SHALL be clickable and SHALL take the player to that place, exactly like the matching
entry in the place list. Locked places SHALL NOT be clickable. The marker SHALL show the place
status with the same symbols as the legend: current place, exploration open, available, quest
completed, locked. The clickable area SHALL be at least as large as the marker's visible symbol.

#### Scenario: Travel by clicking a marker
- **WHEN** the player clicks the marker of an unlocked place
- **THEN** the game travels there and shows that place, as when choosing it from the list

#### Scenario: Locked marker
- **WHEN** the player clicks the marker of a locked place
- **THEN** nothing happens and the marker looks disabled

#### Scenario: Status symbols
- **WHEN** the player is at the Rathausplatz and the Jenbach flood quest is solved
- **THEN** the Rathausplatz marker shows the current-place symbol and the Jenbach marker shows the completed symbol

### Requirement: Place list as alternative

Below the map, a list SHALL name every place shown on the map with its status, and SHALL let the
player travel there. This list SHALL be the way to travel without a mouse, e.g. on touch screens. It
SHALL NOT show place numbers. The legend SHALL explain the marker symbols and that names appear on
hover.

#### Scenario: Travelling from the list
- **WHEN** a player on a touch screen taps „Wirtsalm“ in the list and the Wirtsalm is unlocked
- **THEN** the game travels to the Wirtsalm

#### Scenario: List matches the map
- **WHEN** the Weltkarte is shown
- **THEN** every marker on the map has exactly one entry in the list and vice versa
