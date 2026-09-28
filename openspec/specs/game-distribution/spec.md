# game-distribution Specification

## Purpose

Defines how the Fulinpach game is laid out, started and shared, so that it stays playable by
double-click without any build step while keeping all shipped code in a dedicated `src/` folder.

## Requirements

### Requirement: Game code lives under src/

All files that make up the playable game (HTML entry page, stylesheets, scripts and editable
content files) SHALL be located inside the `src/` folder of the repository. The repository root
SHALL NOT contain game code; it holds only documentation and project tooling.

#### Scenario: Entry page location
- **WHEN** a person looks for the page to open the game
- **THEN** it is found at `src/index.html`
- **AND** no `index.html`, `css/` or `js/` exists in the repository root

#### Scenario: Editable content stays grouped
- **WHEN** a person wants to change art, items or story texts
- **THEN** those files are found together in `src/js/content/`

### Requirement: Runs by double-click without a build

The game SHALL start and be fully playable by opening `src/index.html` directly from disk
(`file://`) in a current desktop browser, without installing packages, running a build, or
starting a server, and without an internet connection.

#### Scenario: Offline double-click start
- **WHEN** a person double-clicks `src/index.html` with no network connection
- **THEN** the game renders its title, resources and tabs
- **AND** the browser console shows no errors about missing files or blocked scripts

#### Scenario: Gameplay and saving work after the move
- **WHEN** a person plays from `src/index.html`, triggers an action and reloads the page
- **THEN** the game reacts to the action and the progress is restored after reload

### Requirement: Shareable as one folder

The game SHALL be shareable by passing on the `src/` folder (or the whole repository) as a
ZIP; unpacking it and opening `index.html` inside SHALL start the game with no other files needed.

#### Scenario: Sharing only the src folder
- **WHEN** someone receives only the `src/` folder, unpacks it anywhere and opens `index.html`
- **THEN** the game starts and plays the same as in the repository

### Requirement: Documentation matches the layout

The German `README.md` in the repository root SHALL tell players to open `src/index.html`, list
file locations with their `src/` paths, name the public link where the game is published, and
explain that pushes to `main` publish the game automatically, including the one-time repository
setting required for that.

#### Scenario: Following the README
- **WHEN** a non-technical person follows the README's play instructions and file map
- **THEN** every file and folder the README names exists at the stated path

#### Scenario: Finding the online version
- **WHEN** someone reads the README's play instructions
- **THEN** they find the link `https://stefandostthaler-ctrl.github.io/fulinpach/` to play online
