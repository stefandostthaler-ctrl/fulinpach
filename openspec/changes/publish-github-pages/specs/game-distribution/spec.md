## MODIFIED Requirements

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
