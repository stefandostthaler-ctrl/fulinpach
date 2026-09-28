# Tasks

## 1. Workflow

- [x] 1.1 Look up the current major versions of `actions/checkout`, `actions/configure-pages`, `actions/upload-pages-artifact` and `actions/deploy-pages`; verify each tag exists on its GitHub releases page
- [x] 1.2 Create `.github/workflows/pages.yml`: triggers `push` on `main` + `workflow_dispatch`; permissions `contents: read`, `pages: write`, `id-token: write`; concurrency group `pages` without cancel; one `deploy` job on `ubuntu-latest` with `environment: github-pages` (url from deploy output) running checkout → configure-pages → upload-pages-artifact (`path: src`) → deploy-pages; verify the YAML parses (e.g. `python -c "import yaml,sys;yaml.safe_load(open(sys.argv[1]))" .github/workflows/pages.yml`) and contains no install/build step

## 2. Documentation

- [x] 2.1 README "Spielen": add the online link `https://stefandostthaler-ctrl.github.io/fulinpach/` and note that online and local saves are separate (JSON export/import to move them); verify the link text is present
- [x] 2.2 README "Für Entwickler": replace the hosting note with: pushes to `main` publish `src/` automatically via `.github/workflows/pages.yml`; one-time setting Settings → Pages → Source „GitHub Actions“; Pages on private repos needs a paid plan; verify every path named exists

## 3. Publish and verify

- [x] 3.1 Commit and push to `main` (ask the user before pushing); verify a "pages" run appears with `gh run list --workflow pages.yml`
- [x] 3.2 If the run fails because Pages is not enabled for Actions, tell the owner to set Settings → Pages → Source „GitHub Actions“ and re-run; verify the run succeeds with `gh run view`
- [x] 3.3 Open `https://stefandostthaler-ctrl.github.io/fulinpach/` in the browser (dev-browser skill): game renders with no console errors, `…/js/game.js` matches `src/js/game.js`, and `…/README.md` returns 404
