# 2048-clone

See `README.md` for what the game does and how to play it. The thing to know before editing:
`src/game.ts` holds the whole game — board, merging, scoring, win/lose — and never touches the
DOM. It reaches the outside world only through injected managers and a single event-handler
callback, which is what lets the browser frontend and the Jest suite drive the same code.

## Commands

`README.md` → **Development Setup** and **Testing** cover installing, the two dev servers,
mkcert setup, and the optional ImageMagick icon labelling. Read it rather than guessing; what
follows is only what it does not say.

- `pnpm install` — `.tool-versions` pins Node 24.16.0 and pnpm 11.6.0; CI runs Node 24 with
  pnpm 10.
- `pnpm test` — Jest through `node --experimental-vm-modules` (the flag is in the script; run
  it via pnpm, not bare `jest`). Two suites, a couple of seconds. Run it on every change.
- The local gate is five commands: `pnpm test`, `pnpm lint`, `pnpm type-check`,
  `pnpm type-check:cypress`, `pnpm format:check`. `pnpm format` fixes the last one. CI covers
  the same ground with `pnpm run test-ci` in place of `pnpm test`, and adds the Cypress suite
  on top.
- `pnpm cypress:run` expects the **HTTPS** dev server — `baseUrl` in `cypress.config.ts` is
  `https://localhost:5173` — so it needs `pnpm devs` and the mkcert certs in `ssl/`, not
  `pnpm dev`.
- `pnpm build` writes to `build/`, not `dist/`. `dist/icons/` is a committed fallback holding
  the pregenerated `_LOCAL` app icons for machines without ImageMagick — the only part of
  `dist/` that is not gitignored.
- `scripts/bump.sh <version>` does the version bump, commit, and tag. `scripts/screenshot.sh`
  regenerates `screenshot.png` by running `cypress/e2e/misc/screenshot.cy.ts` and resizing the
  result with ImageMagick; both tools must be installed.

## Project layout

- `index.html` — the app shell. Every dialog and overlay is a `<template>` element pulled in
  at runtime by `createDialogContentFromTemplate` in `src/render.ts`, so new dialog markup
  goes here, not into a string in TypeScript. Vite loads `src/index.ts` and `vendor/snow.ts`
  as ES modules.
- `src/game.ts` — game logic: `initGame`, `newGame`, `move`, `undo`, `spawnBlock`,
  `getGameState`. It is injected with `ISpawnManager`, `IAnimationManager`, `IUndoManager`,
  and `IGameStorage`, and reports back by calling the `EventHandler` with an event id
  (`"init"`, `"draw"`, `"win"`, `"lose"`, `"error"`). Keep this file free of DOM access and of
  `import.meta` — the Jest run has neither.
- `src/index.ts` — browser entry point and by far the largest file: it constructs the
  managers, implements the event handler, and wires input, settings, themes, and dialogs.
- `src/render.ts` — DOM rendering (board, number boxes, dialogs, prompt dialogs,
  notifications).
- `src/manager/` — one concern each (`spawn`, `animation`, `undo`, `asset`, `theme`,
  `fullscreen`, `app-icon`, `action-icon`). The ones `game.ts` depends on are declared as
  interfaces, with Jest doubles in `src/manager/__mocks__/`.
- `src/storage/` — `index.ts` declares `IGameStorage`; `browser.ts` implements it over
  `localStorage`. Keys are prefixed `2048-`, and `migrateLocalStorage_v1_3_1` copies the
  legacy unprefixed keys forward on launch.
- `src/preferences.ts` — module-level preference store persisted through `IGameStorage`.
- `src/consts.ts` — theme, tileset, block-style, preference, and setting names. Use these
  constants instead of repeating the string literals.
- `src/component/` — self-contained UI pieces (tutorial, how-to-play), each with its own CSS.
- `src/styles/` — `global.css` is the entry point; themes, components, and panes are split
  into subdirectories under it.
- `plugins/` — the repo's own Vite plugins: app-icon labelling, `CHANGELOG.md` → HTML for the
  in-game changelog dialog, and canonical-link removal outside production.
- `vendor/snow.ts` — third-party snow effect for the Snow theme.

## Code style

Prettier 3 is a devDependency and `pnpm format:check` gates CI, so format with
`pnpm run format` rather than by hand: 4-space indent, 100 column width, per-file overrides in
`.prettierrc`. `.prettierignore` excludes `*.html`, `*.md`, `*.yml`, and the lockfile — those
are hand-maintained, so do not reformat `index.html` or the changelog.

TypeScript is `strict` with `noUnusedLocals` and `noUnusedParameters`. Prefix a deliberately
unused binding with `_` (ESLint is configured to allow that). Prefer working out the real type
over silencing the checker; where a suppression is genuinely unavoidable, use
`@ts-expect-error` with a one-line reason, never a bare `@ts-ignore`.

Comment only what the code cannot say, and keep it to one line per section. Skip anything a
well-named call, the symmetry with nearby code, or the very next line already makes clear. The
comments that earn their place explain why code sits where it does, or a constraint that is
invisible on the page. Reasoning about why one approach beat another belongs in the commit
message, where it will not go stale.

## Testing

- Game logic, storage, and migrations → Jest in `test/`. `test/game_test.ts` builds boards by
  hand and drives `move` through the mock managers in `src/manager/__mocks__/` plus a local
  `IGameStorage` double; `test/browser_storage_test.ts` stubs `localStorage` with sinon. Some
  passing cases exercise error paths and print stack traces — that output is expected, read
  the summary line.
- Anything touching the DOM, input handling, dialogs, themes, sharing, or layout → Cypress in
  `cypress/e2e/`. Specs set up a deterministic board by writing the `2048-*` localStorage keys
  in `cy.visit("/", { onBeforeLoad })`, before the app boots; follow that pattern rather than
  playing moves to reach a state.
- Custom commands live in `cypress/support/commands/`: `cy.verifyBoardMatches` and
  `cy.verifyBoardDoesNotMatch` for the board (`undefined` in an expected row means "don't
  care", which is how specs tolerate the randomly spawned tile), plus `cy.clearBrowserCache`,
  `cy.grantClipboardPermission`, `cy.shouldBeInViewport`, `cy.shouldNotBeActionable`, and
  `cy.waitUntilDialogAppears`. Declare any new command in `cypress/support/index.d.ts`.
- `cypress/screenshots/viewport.cy.ts/` and `screenshot.cy.ts/` are committed on purpose — the
  manual visual-regression set and the README screenshot. Everything else under
  `cypress/screenshots/` is gitignored, so an updated image in a diff should be deliberate.
- Analytics are blocked in tests via `blockHosts` in `cypress.config.ts`; keep new third-party
  hosts out of the test path the same way.

## CI

Every push runs two workflows, and both must be green:

- `.github/workflows/ci.yml` — `test-game-logic` (`pnpm run test-ci`) and `cypress-run`, which
  installs mkcert, generates certs, starts `pnpm run devs`, and runs the suite in Edge. Both
  publish JUnit XML that a third job turns into a check.
- `.github/workflows/code-quality.yml` — `type-check`, `type-check:cypress`, `lint`, and
  `format:check`.

`deploy.yml` publishes to GitHub Pages on `v*` tags; `deploy_dev.yml` pushes every commit to
Cloudflare Pages.

## Commits and pull requests

Match the existing history: a short imperative subject line, then body paragraphs explaining
what was wrong and why the fix works.

`CHANGELOG.md` follows Keep a Changelog. Player-visible changes go under `## [Unreleased]` in
the matching Added/Changed/Fixed section; internal refactors and CI work do not belong there.

Never carry issue-tracker or agent metadata into the repository:

- No issue-tracker references anywhere in pushed content — no ticket identifiers like
  `COT-123`, no tracker URLs, no `Fixes <ticket>` trailers — in commit messages, PR titles, PR
  descriptions, code comments, or changelog entries. Describe the change on its own terms.
- No agent session links, no "Generated with <tool>" footers, and no model names (`claude-*`,
  `gpt-*`, `gemini-*`, and the like) in commit subjects or bodies, PR titles, PR descriptions,
  or any file pushed to the repository. The one exception, matching existing history, is a
  `Co-Authored-By` trailer naming the assistant; nothing else about the tooling belongs in a
  commit.

## Agent instruction files

This file is the source of truth, and every rule belongs here. There is deliberately no
`CLAUDE.md`: Claude Code reads `AGENTS.md` directly in a project that has no `CLAUDE.md`, so a
second file would buy nothing. Do not add one back, and in particular do not let an
`/init`-style command write this file's contents into one, since duplicated instructions drift
apart and nothing says which copy is current.

## Environment gotchas

- Cypress binaries download from `download.cypress.io`, which is blocked in sandboxed agent
  environments, so `pnpm cypress:run` cannot run there. Install with `CYPRESS_INSTALL_BINARY=0`
  to get the rest of the dependencies, run the Jest suite and the four static checks (`lint`,
  both type checks, `format:check`), and drive the app in a real browser to check behaviour.
  CI runs the real suite.
- Where the sandbox ships Chromium and Playwright — Claude Code web sessions have them, with
  the browsers at `PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers` — pointing them at
  `pnpm run dev` is how DOM, theme, and input changes get verified.
- mkcert and ImageMagick are usually absent there too. Without certs use `pnpm run dev` over
  plain HTTP; the share sheet and clipboard need a secure context and will fall back or fail.
  Without ImageMagick the dev server logs `ImageMagick is not installed. Skipping icon
  labeling.` and uses the committed icons — both are expected, not failures.
- `vite.config.ts` reads the build-time commit hash with `git rev-parse`, so the app only
  builds inside a git checkout. Sentry warns about a missing auth token on every dev start;
  that is normal. Copy `.env.example` to `.env` for local configuration.
