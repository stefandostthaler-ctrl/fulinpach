# Tasks

## 1. Move game files

- [x] 1.1 Create `src/` and `git mv index.html css js` into it; verify `git status` shows only renames (R) and the root no longer contains `index.html`, `css/` or `js/`
- [x] 1.2 Confirm `src/index.html` still references `css/style.css` and the six `js/...` scripts in the original order with no edits needed; verify with `git diff -M --stat` showing 100% similarity for every moved file

## 2. Update documentation

- [x] 2.1 Update README "Spielen": open `src/index.html`; add a hint to export the save ("Speichern" → "Spielstand als JSON herunterladen") before updating and import it afterwards; verify every path named exists
- [x] 2.2 Update README "Was liegt wo?" tree and the `js/content/` editing hints to `src/` paths; verify each listed path exists with `ls`
- [x] 2.3 Update README "Für Entwickler": load-order note refers to `src/index.html`, hosting note says to publish the `src/` folder; verify no remaining root-level `index.html`/`js/`/`css/` references via `grep -n "index.html\|js/\|css/" README.md`

## 3. Verify

- [x] 3.1 Open `file:///C:/games/fulinpach/src/index.html` in the browser (dev-browser skill): title, resources and tabs render and the console shows no errors
- [x] 3.2 In that page, perform an action (e.g. collect apples), reload, and confirm progress is restored; note whether a save made from the old root `index.html` was still found
- [x] 3.3 Copy only `src/` to a scratch folder, open its `index.html`, and confirm the game starts without errors
