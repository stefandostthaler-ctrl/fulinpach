# Proposal

## Why

The game can only be played by downloading the folder. Publishing it on GitHub Pages gives it a
public link that anyone can open in a browser, and an automatic workflow keeps that link up to
date whenever `main` changes, without the non-technical creator having to do anything by hand.

## What Changes

- Add a GitHub Actions workflow `.github/workflows/pages.yml` that publishes the contents of
  `src/` to GitHub Pages on every push to `main`, and can also be started manually.
- Only `src/` is published: the site root is `src/index.html`, so the game opens at
  `https://stefandostthaler-ctrl.github.io/fulinpach/`. `README.md`, `openspec/` and `.claude/`
  are not part of the site.
- No build step: the workflow uploads the files unchanged.
- Update the German `README.md` hosting note: link to the published game and explain the one-time
  repository setting (Settings → Pages → Source: "GitHub Actions").

## Capabilities

### New Capabilities

- `github-pages-deployment`: automatic publishing of the game from `main` to GitHub Pages.

### Modified Capabilities

- `game-distribution`: the "Documentation matches the layout" requirement changes from describing
  manual static hosting to naming the published link and the automatic publishing.

## Impact

- New file: `.github/workflows/pages.yml`. No changes to game code under `src/`.
- Docs: `README.md` ("Spielen" gets the online link, "Für Entwickler" hosting note).
- Repository settings (manual, one-time, by a repo admin): GitHub Pages source must be set to
  "GitHub Actions". Pages on a private repository requires a paid GitHub plan; on a free plan
  the repository must be public.
- Saves: the online game stores progress in the browser under the `github.io` address, separate
  from saves of the locally opened file; players can move saves with the existing JSON
  export/import.
