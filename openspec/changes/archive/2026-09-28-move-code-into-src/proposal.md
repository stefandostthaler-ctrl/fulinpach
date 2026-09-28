# Proposal

## Why

The game's source files (`index.html`, `css/`, `js/`) sit loose in the repository root next to
tooling folders (`openspec/`, `.claude/`) and the README. As the project grows, a conventional
web layout with all shipped code under `src/` makes it obvious what is "the game" versus project
tooling, and gives future assets (images, sounds) a clear home.

## What Changes

- Move `index.html`, `css/` and `js/` (including `js/content/`) into a new `src/` folder, keeping
  their internal structure: `src/index.html`, `src/css/style.css`, `src/js/...`.
- Relative `<link>`/`<script>` paths inside `index.html` stay valid because the files move together;
  no JavaScript or CSS content changes.
- **BREAKING** (for players/hosting): the game is now started by double-clicking
  `src/index.html` instead of `index.html` in the root. Static hosting (e.g. GitHub Pages) must
  serve from `src/` or link to `/src/index.html`.
- Update the German `README.md`: play instructions, the "Was liegt wo?" file map, and the
  developer/hosting notes.
- Still no build tools, npm, dev server or ES modules: the game must keep running via
  `file://` by double-click.

## Capabilities

### New Capabilities

- `game-distribution`: how the game is laid out, started and shared: entry point under `src/`,
  runnable by double-click over `file://` without a build step, shareable as a folder/ZIP.

### Modified Capabilities

<!-- None: there are no existing specs. -->

## Impact

- Files moved: `index.html`, `css/style.css`, `js/content/art.js`, `js/content/items.js`,
  `js/content/story.js`, `js/game.js`, `js/ui.js`, `js/main.js`.
- Docs: `README.md` (paths, play and hosting instructions).
- Saves: `localStorage` key `fulinpach_bad_feilnbach_v3` is unchanged. Over `file://`, browsers
  may scope storage by path, so existing local saves might not appear after the move; players can
  export their save first (tab "Speichern") and import it afterwards.
- No dependencies added; git history is kept by moving with `git mv`.
