# Statement Portfolio Tracker website

The product site for [Statement Portfolio Tracker](https://github.com/TiDeane/Statement-Portfolio-Tracker), served at
**statements.tiagodeane.com**. It explains the app to people who have never heard of it and lets them download it
without going near GitHub.

Built with Astro 5 and Tailwind CSS 3, with the look of [tiagodeane.com](https://tiagodeane.com) (several components
were copied from that site and adapted). Static output only. No analytics, no cookies.

## Commands

| Command           | Action                                                |
| :---------------- | :---------------------------------------------------- |
| `npm install`     | Install dependencies                                  |
| `npm run dev`     | Dev server at `localhost:4321`                        |
| `npm run build`   | Build the site to `./dist/`                           |
| `npm run preview` | Serve the build                                       |
| `npm test`        | Test the download logic (vitest)                      |
| `npm run check`   | Type check, ESLint, Prettier and tests (what CI runs) |
| `npm run fix`     | ESLint `--fix` and Prettier                           |

## Pages

- `/`: hero with the download button for the visitor's system, how it works (a pinned scroll demo), a bento grid
  of features, questions, and a final call to action.
- `/download`: every installer, the visitor's highlighted, and how to get past SmartScreen and Gatekeeper.
- `/guide`: the app's README user sections, rewritten for the web.

## Downloads

The buttons link straight to the installer files of the newest
[GitHub release](https://github.com/TiDeane/Statement-Portfolio-Tracker/releases). File names contain the version, so:

1. At build time, `releaseAtBuild()` (`src/utils/release.ts`) asks the GitHub API for the newest release, and the
   pages are built with real links, sizes and the version.
2. In the browser, `src/scripts/download.ts` marks `<html data-os>` (CSS then shows the button for that system)
   and asks GitHub again, so a release made after the last deploy shows up at once. The answer is kept in
   `sessionStorage` for the visit.
3. If GitHub can't be reached either time, every button points at the releases page.

The installers are found by the end of their name (`-windows-x64-setup.exe`, `-macos-apple-silicon.dmg`,
`-macos-intel.dmg`, `-linux-x64.tar.gz`, see `ASSET_SUFFIX`). If the app's release workflow renames them, change
those suffixes too. The deploy workflow also rebuilds on the 1st of each month; to update the built pages right
after a release, run it by hand (Actions › deploy › Run workflow).

## Screenshots

`src/assets/screenshots/` holds pictures of the app, made with fake prices and made-up investments, never real data:

- `NAME-dark.png` / `NAME-light.png` (the page shows the one matching its theme): from the app's repository, on
  Windows, with
  `.venv-win\Scripts\python scripts\screenshots.py <this repo>\src\assets\screenshots`. It also writes
  `spreadsheet.xlsx` there: move it out before committing.
- `sheet-holdings.png`, `sheet-history.png`: pictures of that workbook's two sheets, taken by Excel with
  `powershell -STA -File scripts\sheet-pictures.ps1 -Book <full path to spreadsheet.xlsx> -Out <folder>`
  (opens the file read-only; uses the clipboard).

A missing picture shows as a labelled placeholder.

## Licence

MIT (see `LICENSE.md`; the site started from the AstroWind template). The app itself is GPL-3.0-or-later.
