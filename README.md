# NECTA Rescue - Civics revision

A mobile-first, dependency-free learning app: **Civics -> topic -> question -> Show Answer -> short bullets and explanation -> Understood / Revise Again -> next question**. The first activity needs no PDF, account or download. The original-paper viewer, timer and practice log remain at `docs/paper-practice.html`.

This feature is a development candidate. Production stays on `main`; no merge or deployment is authorized by this branch.

## Preview and checks

Requires the available Node runtime; no package installation or build is needed.

```sh
npm run preview
# http://127.0.0.1:4173/necta-rescue-pilot/
npm test
```

For the real Chrome HTTPS suite, set `NECTA_TEST_CERT` and `NECTA_TEST_KEY` to an existing local test certificate and private key, and optionally `CHROME_PATH` to the available Chrome executable. Then run `npm run test:browser`. Credentials and certificates must stay outside this repository. The suite launches an isolated, hidden headless browser and serves only the public files under the GitHub Pages project subpath. It tests a real production-baseline upgrade, creates synthetic progress, exports/imports actual backups, stops the server for offline checks, and saves reports/screenshots in ignored `.workbuddy-ai/browser-evidence/`. GitHub Actions runs these checks and packages the tested public bundle on PR updates and pushes to main/develop, with pinned action revisions and read-only repository permissions.

For an owner-authorized Android phone connected over ADB, `node tools/device-check.mjs` verifies real touch, reload, persistence and offline operation in a temporary preview tab. It restores the preview origin's pre-test storage and removes its forwarding entries. It does not change Wi-Fi/mobile-data settings. Run `npm run package:release` after passing checks to produce a ZIP and SHA-256 manifest containing only `docs/`; packaging refuses files changed since the browser test and never deploys.

Open `docs/index.html` directly for a basic preview; offline installation needs HTTPS or localhost. On a normal deployment, wait for “Ready to study offline” after the first online load.

## Bounded content collection

The candidate contains **7 original Civics 2025 items** checked by Codex against complete original examination and supplied solution pages, plus **7 independently authored democracy variations**. The latter are visibly labelled and demonstrate Define, State, Mention, Explain, Describe, Give reasons and Discuss. These practice prompts carry no examination marks.

Historical MCQs retain all five printed A-E alternatives. Written question 3 explicitly asks for six points; the app shows six short explanatory bullets. No individual marks are inferred from section totals. TETEA solutions are credited to **Maria Marco for TETEA**, not presented as official NECTA marking schemes.

See [source review](review/SOURCE_REVIEW.md), [the auditable ledger](review/civics-starter-ledger.json) and [content/storage contracts](review/CONTENT_MODEL.md). Original pipeline text, source-page transcription, display text and answer paraphrases are separate ledger fields. The canonical source files and original PDFs are untouched.

The loader requires an exact card ID + review ID + review status allowlist entry, complete provenance and a valid content shape. Pipeline `verified`, provisional, held, missing-source, incomplete-MCQ and misaligned-key records cannot pass. Authored variations also require their source concept to pass. **23 other Civics 2025 extraction records stay withheld**, including the contradictory supplied key for 1(v); the private queue is excluded from Git. Parent/stub/nested extraction records are included in that withheld count, so it is not a count of distinct usable questions. The other held papers and the remaining corpus are not bundled.

## Progress and backups

- Existing key `necta-rescue-pilot-v1`, its original record shape and v1 paper-practice backups are preserved. Learning never writes that key during normal study.
- Civics self-checks use a separate `necta-rescue-learning-v1` key, with stable card IDs and self-reported states. They are not marks or mastery scores.
- The learning page exports the existing `necta-rescue-pilot` v1 envelope with an optional `learning` field. Its old `records` array remains compatible with the original importer.
- Importing an old backup restores its paper records and keeps existing Civics self-checks. A combined backup restores both, with validation and rollback if a write fails.
- Unreadable learning and paper-practice data are retained; saving pauses with a visible message. Full/unavailable storage never produces a false “Saved” or “Cleared” message. The recovery-export button downloads raw storage without changing it; a recovery copy requires repair before normal import.
- Both importers support valid backups up to 16 MB, avoiding the former 3 MB ceiling that could reject a large exported history.

Browser storage remains specific to the device/browser/origin. Export regularly. The paper-practice page continues to export its original paper-only backup; use the learning page to include self-checks.

## Offline and privacy

Service-worker generation `necta-rescue-static-v6` precaches the explicit public bundle, including the learning content and paper-practice page. A complete cached version loads without waiting for the network; incomplete updates never activate. Upgrade removes old NECTA generations and preserves unrelated caches. The offline-ready message requires confirmation from the current worker, and an already-open page offers a reload when a newer bundle is ready. Unknown URLs get no cached shell fallback and are never added to the cache.

No accounts, analytics, external scripts, font requests, uploads, automatic marks or cloud sync. Browser Content Security Policy blocks inline executable code, external scripts and unwanted embedded objects; referrer disclosure is disabled. Source PDF links load only when explicitly followed; no PDFs are bundled. Only `docs/` is the Pages publishing surface. Review evidence and tests are outside it; private manifests, filesystem paths, canonical data, personal student progress and original PDFs are excluded from the repository.

## Branch and release workflow

`feature/* -> develop -> main`, with explicit owner approval before any production merge. `main` -> `/docs` is the existing Pages source; a development branch has no independent public preview site. PR #2 (dashboard) is separate and must not be merged accidentally into this product change. The candidate is based on verified production commit `d0df839621f6ef4ec09625eb5f21edfea1087343`.

Before release: accept the named content collection, review the PR, back up progress, run the checks and phone acceptance in [the release policy](RELEASE_POLICY.md), then separately authorize the release PR. Roll back with an auditable revert through the same approval flow; no reset or force-push is necessary. A rollback does not delete either browser storage key.

Minimum browser remains the original pilot floor: `Element.replaceChildren()` (Chrome/Edge 86+, Firefox 78+, Safari 14+). Optional CSS enhancements degrade without preventing study. Actual Android 15 Chrome, desktop Chrome and desktop Edge have been tested; iOS, home-screen installation and large real-PDF performance are not yet verified. See [current readiness evidence](review/PRODUCTION_READINESS.md).
