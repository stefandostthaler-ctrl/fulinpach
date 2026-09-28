# Design

## Context

Today `index.html` in the root loads `css/style.css` and six classic scripts from `js/` via
relative paths, in a fixed order (content → logic → UI → start). The scripts share a global
scope and contain no file paths of their own. The project is deliberately build-free so its
non-technical creator can double-click it and share it as a ZIP (see README "Für Entwickler").

## Goals / Non-Goals

**Goals:**
- Pure relocation: every game file moves under `src/` with its relative structure intact.
- Git history of each file is preserved.

**Non-Goals:**
- No build tools, bundlers, npm, dev server, or ES modules.
- No changes to CSS, JavaScript logic, content, script order, or the save format/key.
- No `public/` split or root redirect page (the chosen layout puts `index.html` in `src/`).

## Decisions

- **Move with `git mv`, keep internal paths.** Moving `index.html`, `css/` and `js/` together
  keeps all `href`/`src` references (`css/style.css`, `js/...`) valid, so `index.html` needs no
  edits. Alternative: rewriting paths to `../` or absolute URLs — unnecessary and breaks
  `file://` portability.
- **`index.html` inside `src/`, not in the root.** Chosen by the user. Keeps the root free of
  game code. Alternative considered: root `index.html` loading `src/` — rejected by the user.
- **README stays in the root, in German.** It is the first thing people see; it now points to
  `src/index.html` and shows the `src/` tree. Hosting note: publish the `src/` folder (e.g.
  GitHub Pages from a folder, or upload `src/` contents to webspace).

## Risks / Trade-offs

- [Local saves may not carry over over `file://`: some browsers scope `localStorage` per file
  path/directory] → README tells players to export their save ("Speichern" → "Spielstand als
  JSON herunterladen") before updating and import it afterwards. Verify in Chrome that the save
  is still found; note the outcome in the README only if it is lost.
- [Players with the old habit/shortcut open the root and find no `index.html`] → README "Spielen"
  section is updated first and prominently.
- [Hosted copy at the old URL breaks] → Hosting note in README; no hosting exists yet as far as
  the repo shows.

## Migration Plan

1. Export save (players) → move files → update README → verify by opening
   `src/index.html` via `file://` in a browser.
2. Rollback: `git revert` the move commit; paths inside files were never changed.
