# NECTA Rescue - Civics revision

A mobile-first, dependency-free learning app: **Civics -> topic -> question -> Show Answer -> short bullets and explanation -> Understood / Revise Again -> next question**. The first activity needs no PDF, account or download. The original-paper viewer, timer and practice log remain at `docs/paper-practice.html`.

**Phase D is a development candidate: 32 cards across 10 topics, pending separate owner release approval.** See [the Phase D report](review/PHASE_D.md). The live fourteen-card release is commit `79044ec` (PR #4).

The current candidate implements owner-approved C-01/C-04 through a [versioned correction record](review/phase-d-approved-wording-v1.json) and v8 offline cache. [Correction preservation and remaining gates](review/PHASE_D_WORDING_UPDATE.md) supersede earlier unchanged-content claims for these two exact fields. C-02/C-08 remain unchanged pending human subject review; the 32-card update is not published.

The owner accepted the earlier fourteen-card pilot and authorized its release on 15 October 2026; [the acceptance record](review/RELEASE_ACCEPTANCE.json) identifies the exact public-file hashes. Production uses `main` `/docs`, through the reviewed release workflow.

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

The Phase D candidate contains **15 source-checked original items** from Civics 2022, 2023 and 2025, plus **17 independently authored revision cards**. This adds eight originals and ten authored cards to the released collection. All 14 released IDs, questions, answers and provenance are preserved. New transfer guidance helps students adapt their knowledge to different wording. Practice options explain Define, State, Mention, Explain and Discuss; the earlier Describe and Give reasons variations remain available.

Historical MCQs retain all five printed A–E alternatives, including a documented printed spelling error. Written questions follow the count in the actual prompt, with no marks inferred from section totals. Authored prompts are explicitly labelled and have no examination marks. TETEA-hosted solutions are educational aids, **not official NECTA marking schemes**. Maria Marco is credited only where the 2025 supplied file identifies her; an individual author is not identified in the 2022/2023 supplied files.

See [the Phase D source/acceptance ledger](review/phase-d-ledger.json), [the 14-card re-audit](review/phase-d-existing-audit.json), [separate corrections](review/phase-d-corrections.json), [exclusions](review/phase-d-held.json) and [content/storage contracts](review/CONTENT_MODEL.md). The historical starter ledger and its approval record are unchanged. Original pipeline wording, page transcription and answer adaptations stay separate; canonical files and original PDFs are untouched.

The loader requires an exact card ID + review ID + review status allowlist entry, complete provenance, the matching source year/filename/URL and valid content. Provisional, held, missing-source and misaligned records fail closed. A variation is withheld if its source card fails. Four newly inspected candidates and two previously held contradictory items are explicitly withheld. One previously withheld 2025 record (Q7) now has its own completed review; the other 22 extraction records remain excluded. These include stubs/nested records and are not 22 distinct questions. No unreviewed corpus is bundled.

## Progress and backups

- Existing key `necta-rescue-pilot-v1`, its original record shape and v1 paper-practice backups are preserved. Learning never writes that key during normal study.
- Civics self-checks use a separate `necta-rescue-learning-v1` key, with stable card IDs and self-reported states. They are not marks or mastery scores.
- The learning page exports the existing `necta-rescue-pilot` v1 envelope with an optional `learning` field. Its old `records` array remains compatible with the original importer.
- Importing an old backup restores its paper records and keeps existing Civics self-checks. A combined backup restores both, with validation and rollback if a write fails.
- Unreadable learning and paper-practice data are retained; saving pauses with a visible message. Full/unavailable storage never produces a false “Saved” or “Cleared” message. The recovery-export button downloads raw storage without changing it; a recovery copy requires repair before normal import.
- Both importers support valid backups up to 16 MB, avoiding the former 3 MB ceiling that could reject a large exported history.

Browser storage remains specific to the device/browser/origin. Export regularly. The paper-practice page continues to export its original paper-only backup; use the learning page to include self-checks.

## Offline and privacy

Service-worker generation `necta-rescue-static-v7` precaches the explicit public bundle, including the learning content and paper-practice page. A complete cached version loads without waiting for the network; incomplete updates never activate. Upgrade removes old NECTA generations and preserves unrelated caches. The offline-ready message requires confirmation from the current worker, and an already-open page offers a reload when a newer bundle is ready. Unknown URLs get no cached shell fallback and are never added to the cache.

No accounts, analytics, external scripts, font requests, uploads, automatic marks or cloud sync. Browser Content Security Policy blocks inline executable code, external scripts and unwanted embedded objects; referrer disclosure is disabled. Source PDF links load only when explicitly followed; no PDFs are bundled. Only `docs/` is the Pages publishing surface. Review evidence and tests are outside it; private manifests, filesystem paths, canonical data, personal student progress and original PDFs are excluded from the repository.

## Branch and release workflow

`feature/* -> develop -> main`, with explicit owner approval before any production merge. `main` -> `/docs` is the existing Pages source; a development branch has no independent public preview site. PR #2 (dashboard) is separate and must not be merged accidentally into this product change. The candidate is based on verified production commit `79044ec5fce9e52baaaff4e3764ea569c5025e82`.

Before release: accept the named content collection, review the PR, back up progress, run the checks and phone acceptance in [the release policy](RELEASE_POLICY.md), then separately authorize the release PR. Roll back with an auditable revert through the same approval flow; no reset or force-push is necessary. A rollback does not delete either browser storage key.

Minimum browser remains the original pilot floor: `Element.replaceChildren()` (Chrome/Edge 86+, Firefox 78+, Safari 14+). Optional CSS enhancements degrade without preventing study. The preceding release was tested on Android 15. Phase D has fresh desktop Chrome/Edge tests at small screen sizes; physical Android rechecking is pending because no device is connected. iOS, home-screen installation and large real-PDF performance are not verified. See [Phase D evidence and release gates](review/PHASE_D.md); [the earlier readiness report](review/PRODUCTION_READINESS.md) is historical.
