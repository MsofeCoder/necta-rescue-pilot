# NECTA Rescue — immediate original-paper practice pilot

## What this package is

A mobile-friendly, dependency-free GitHub Pages site for **original-paper practice**, with eight subjects (2020–2025), the student's local PDF viewer, question-attempt notes, review status, a 25-minute timer, and JSON backup/restore. Notes and attempts are stored in the browser's localStorage. The PDF is read from the student's own device and is never uploaded. There is no login or cloud sync. Designed to operate on GitHub Pages without server-side code.

This pilot deliberately does **not** publish unreviewed questions, answers, automatic marking, or falsely imply NECTA endorsement. It does not ship any original PDFs. The user must supply the original examination PDF locally and ensure they have lawful access to it.

## Preview immediately

1. Extract this ZIP.
2. Open `docs/index.html` in a current browser. Most features work from a local file; installation/offline caching requires HTTPS hosting.
3. On the website, select subject/year, choose an original exam PDF from your device, and start recording attempts. Export a backup frequently.

## Publish on GitHub Pages (free for public repos)

1. Create a public repo (suggested `necta-rescue-pilot`) **or carefully incorporate the `docs/` folder into an existing suitable repository**. Do not overwrite an existing site, history, or local work.
2. Commit the `docs/` folder and `.nojekyll` into the default `main` branch (including the `docs/.nojekyll` file).
3. GitHub repository → Settings → Pages → Build and deployment → Source **Deploy from a branch** → Branch **main** → Folder **/docs** → Save.
4. Open the exact GitHub Pages URL supplied by GitHub; check the live status. The typical project URL pattern is `https://<owner>.github.io/<repo>/`, but it is not guaranteed until deployed.
5. Create `develop` from `main`; build improvements there. Only merge a reviewed PR from `develop` (or feature branch) to `main` when explicitly approved. Keep the Pages publishing source set to `main` `/docs`.

## Branch and approval workflow

| Stage | Branch | Behaviour |
|---|---|---|
| Production | `main` | GitHub Pages publishes `main` → `/docs`. A push here is a release. |
| Development | `develop` | Features and corrections are implemented and tested here. Never auto-deploys. |
| Approval | pull request | Every production change arrives as a reviewed PR from `develop` (or `feature/...`) and needs explicit owner approval before it is merged into `main`. |

Rules that follow from this: never commit directly to `main`; never point the Pages source at `develop`; open the PR with the change description, the test evidence and the rollback commit SHA. Re-test saved browser progress on every release, and take a backup before any change to the storage schema or the published domain.

**Security/privacy:** GitHub Pages is public web hosting, not an authentication service. Do not add passwords, personal student progress, source PDFs without appropriate rights, full private manifests/paths, or unresolved answer-bank data to the published repo. Browser notes may contain personal information and are stored locally; encourage anonymised notes and regular backups. Browser data are device/browser-specific and can be deleted by clearing site data. Different GitHub Pages URLs are different storage origins.

**Lifecycle:** Stable URL remains on `main`; `develop` is private development *workflow*, not a secret branch if the repo is public. To obtain a separate public preview URL, use a separate staging repo/site or a configured preview pipeline; merely making a development branch does NOT publish a second Pages site in the same repo.

## Release gate before importing review data

Any data-backed question feature must use an explicitly approved allowlist backed by review ledger record IDs and source page provenance. Verify the original exam source **and** supplied answer separately. Discard or hold any question record with boundary/hierarchy ambiguity, missing alternatives, image-only portions not represented, answer conflict, or an unapproved association. Never infer approval from `needs_review=false` or `verified`. Keep all corrections in the review ledger until authorised.

## Files

- `docs/index.html`: self-contained app shell, local paper viewer, attempt log and timer
- `docs/icon.svg`, `docs/icon-192.png`, `docs/icon-512.png`, `docs/manifest.webmanifest`: PWA metadata
- `docs/sw.js`: static asset caching for HTTPS deployment; PDF files are not cached (user-selected local files must be reselected)
- `docs/.nojekyll`: disable Jekyll asset handling

## Limitations

No PDF library, no server, no account sharing, no cloud backups, no answer engine, no progress synchronisation between devices, and no automatic marks. Embedded PDF rendering depends on the browser; use “Open PDF in new tab” if the embedded viewer is unsupported — the page says so directly beneath the viewer, because most phone and tablet browsers cannot display a PDF inside a web page. There is no dated timetable until the current examination date, daily study time and weakest subjects are reconfirmed.

**Minimum browser:** the app needs a browser with `Element.replaceChildren()` (Chrome/Edge 86+, Firefox 78+, Safari 14+, i.e. 2020 or later). Everything else in the file uses older or guarded APIs so that a student's saved attempts are never hidden or overwritten on an outdated device.
