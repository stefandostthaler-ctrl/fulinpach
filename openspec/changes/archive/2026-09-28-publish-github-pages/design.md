# Design

## Context

The game is plain static files in `src/` with relative paths only (`css/...`, `js/...`) and no
network requests, so it works unchanged under the Pages sub-path `/fulinpach/`. The repo has no
`.github/` folder yet. Origin is `github.com/stefandostthaler-ctrl/fulinpach`.

## Goals / Non-Goals

**Goals:**
- One small workflow file using GitHub's official Pages actions.

**Non-Goals:**
- No custom domain, no build/minify step, no preview deployments for pull requests.
- No link checking or automated tests in the workflow.

## Decisions

- **Official "GitHub Actions" Pages source with `actions/upload-pages-artifact` +
  `actions/deploy-pages`**, uploading `path: src`. This publishes only `src/` as the site root.
  Alternatives: a `gh-pages` branch (extra branch, third-party action, clutters history) or
  "Deploy from branch" with `/docs` (Pages only allows `/` or `/docs`, not `/src`, and would
  require renaming the folder). Both rejected.
- **Triggers: `push` on `main` + `workflow_dispatch`.** Covers automatic and manual publishing.
  No `paths:` filter: README-only pushes also redeploy, which is cheap and avoids a stale site if
  the filter is ever wrong.
- **Permissions and concurrency as in GitHub's template:** `contents: read`, `pages: write`,
  `id-token: write`; `concurrency: group: pages, cancel-in-progress: false` so a running deploy
  finishes before the next starts.
- **Single job** (`deploy`) with `environment: github-pages` and the page URL as output: checkout
  → configure-pages → upload-pages-artifact → deploy-pages. A separate build job adds nothing
  without a build step.
- **Pin actions to current major versions** (`actions/checkout@v4`, `actions/configure-pages@v5`,
  `actions/upload-pages-artifact@v3`, `actions/deploy-pages@v4`); verify the latest majors when
  implementing.
- **Add `src/.nojekyll`? No.** Jekyll processing does not run for the Actions source with an
  uploaded artifact, so no marker file is needed in the game folder.

## Risks / Trade-offs

- [Pages source still set to "Deploy from a branch" or Pages disabled → deploy step fails] →
  README and final summary tell the repo owner to set Settings → Pages → Source: "GitHub
  Actions" once. `configure-pages` with `enablement: true` could automate this but needs an
  admin token; not used.
- [Repository is private on a free plan → Pages unavailable] → Documented in README; owner decides
  whether to make the repo public.
- [Online and local saves are separate (different origins)] → README mentions JSON export/import.
- [Only the repo owner can change settings; this machine pushes via SSH as a collaborator] →
  Verification of the live site happens after the owner enables Pages.

## Migration Plan

1. Merge the workflow to `main`. 2. Owner sets Pages source to "GitHub Actions" (if the first run
failed, re-run it). 3. Open the published link. Rollback: delete the workflow file and disable
Pages in settings.
