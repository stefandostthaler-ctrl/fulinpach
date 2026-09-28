# github-pages-deployment Specification

## Purpose
Publishes the Fulinpach game automatically to GitHub Pages so it can be played from a public
link that always reflects the current state of the `main` branch.

## Requirements

### Requirement: Publish on push to main

Every push to the `main` branch SHALL publish the current contents of `src/` to GitHub Pages
without any manual step. A repository maintainer SHALL also be able to start a publish manually.

#### Scenario: Change on main goes live
- **WHEN** a commit that changes a file under `src/` is pushed to `main`
- **THEN** a publish run starts automatically and succeeds
- **AND** the published game shows the change after the run finishes

#### Scenario: Manual publish
- **WHEN** a maintainer starts the publish workflow by hand from the Actions tab
- **THEN** the current `main` is published

#### Scenario: Other branches are not published
- **WHEN** a commit is pushed to a branch other than `main`
- **THEN** no publish run starts

### Requirement: Only the game is published

The published site SHALL contain exactly the files under `src/`, unchanged, with `src/index.html`
served as the site's start page. Files outside `src/` (README, planning notes, tooling) SHALL NOT
be reachable on the site.

#### Scenario: Opening the site root
- **WHEN** someone opens `https://stefandostthaler-ctrl.github.io/fulinpach/`
- **THEN** the game loads with its title, resources and tabs, with no missing stylesheet or scripts

#### Scenario: Non-game files are absent
- **WHEN** someone requests `README.md` or `openspec/` on the published site
- **THEN** the site responds that the page does not exist

### Requirement: No build step

Publishing SHALL NOT install packages or transform the game files; the published files SHALL be
byte-identical to those in `src/` at the published commit.

#### Scenario: Published file matches source
- **WHEN** `js/game.js` is downloaded from the published site
- **THEN** its content equals `src/js/game.js` at the published commit
