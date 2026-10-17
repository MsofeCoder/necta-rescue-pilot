# PR #9 deployed and verified — 17 October 2026

Reviewed head: `6e7bb5e5090e3264cbad4ce1f4b882d75dcc3401`. Rechecked unchanged head, seven-file diff, whitespace, passing PR CI and emergency-beta exception before an exact-head guarded merge. Independent ChatGPT engineering review was supplied by the owner; it did not independently recheck PDF pages. Original page-render evidence is retained locally. No human academic certification is claimed.

Deployment merge SHA: `03f64944e3712cb0bcd3beb4281c109ea6fad41f`.

- [Merged PR #9](https://github.com/MsofeCoder/necta-rescue-pilot/pull/9).
- [Post-merge Release quality CI](https://github.com/MsofeCoder/necta-rescue-pilot/actions/runs/39008260604): SUCCESS, attempt 2. Attempt 1 failed before tests with “Chrome did not start”; the unchanged job passed on rerun. No product defect was found or code changed for this retry.
- [Pages deployment](https://github.com/MsofeCoder/necta-rescue-pilot/actions/runs/39008260283): SUCCESS. Pages API latest build reports built at the deployment SHA.
- [Student beta](https://msofecoder.github.io/necta-rescue-pilot/beta/).
- [Accepted fourteen-card root app](https://msofecoder.github.io/necta-rescue-pilot/).

## Checks actually executed

Live automated Chrome checks ran against the public HTTPS URL in a new isolated profile, using synthetic storage and backups only. **48/48 passed.** All 20 public files (13 root + seven beta) were fetched with cache disabled and compared byte-for-byte by SHA-256 to the deployment commit. The 13 root files also match accepted root commit `79044ec5fce9e52baaaff4e3764ea569c5025e82`.

The public version 3 contains **58 practice items = 30 provisional Civics + 28 question-only**. English contains six checked question-only records. Both new exact IDs, `english-2025-p1-q01i` and `english-2025-p1-q01ii`, were navigated in the public UI and checked for exact source-reviewed stem, Q1 instruction and all five alternatives against the review ledger. Reveal controls and answer panels are hidden, with no answer text. Screenshots were captured. No JavaScript exceptions occurred.

Live synthetic checks: saved a new self-check while retaining C-02's hidden progress and an unknown future ID; reloaded and compared both existing storage keys; downloaded a combined backup; imported it after replacing synthetic learning storage; imported a legacy-only backup and confirmed learning survives. With networking disabled, the deployed beta reopened and showed six English records with saved progress intact.

The deployed-byte-equivalent local and post-merge CI beta regression exercises the exact deployed v2 baseline `20f3a79a15ef027871c46b4cd41d19bd31e297e0` → v3 worker upgrade, preserving the root cache and unrelated caches, both storage keys, hidden/unknown IDs and backups. This controlled upgrade was executed on a local isolated origin; the public fresh-profile check verifies deployed v3 caching/offline reuse, not a historical public v2 installation. Prior exact-head local checks: 31/31 unit/static, 366/366 beta browser and 94/94 HTTPS root browser. Post-merge CI repeated the required suites and packaging successfully at the merge SHA.

English exact IDs q01iii/q01iv remain absent because their canonical hierarchy conflicts with printed Q2 matching fragments. C-02/C-08 remain pending and absent, and all six original Civics conflicts retain identical hold records. The live hold arrays were compared to the English review ledger. No canonical JSONL or PDF was modified. Human academic approval remains PENDING; physical Android acceptance remains NOT TESTED. The retained five-minute checklist is not passed evidence.

Private evidence is retained under `.workbuddy-ai/pr9-live/`: live report, published-asset fingerprints, screenshots and full original English pages 2–3 plus History page 5 renders. The live harness and logs are retained outside the public bundle. Original English render hashes remain those in the PR #9 ledger. No original PDFs/page images or student backups are published.

## Rollback

Exact pre-PR #9 reference: `20f3a79a15ef027871c46b4cd41d19bd31e297e0` (v2 beta). Revert merge `03f64944e3712cb0bcd3beb4281c109ea6fad41f` with first parent (`git revert -m 1 03f64944e3712cb0bcd3beb4281c109ea6fad41f`) on a review branch. Before publishing that revert, set both beta worker and readiness cache names to **a fresh generation, v4 or later**, and adjust regression expectations. Reusing v2 alone can leave stale cached content. Keep both progress keys, backups and accepted root files intact; no reset, force push or storage clearing.

## Next bounded batch prepared

`next-core-source-batch-2026-10-17.json` proposes only English 2025 Q1(v), History 2025 Q8 and Q9: **two parent records + one subquestion; zero answers**. Full original pages were visually checked, PDF hashes verified against existing provenance, original IDs/hierarchy preserved, and OCR spillover corrections recorded. Candidates are prepared only: no public assets, cache generation or live counts changed. All ten canonical JSONL fingerprints remain unchanged. Integration would require a separate bounded change and regression; human academic approval and physical Android remain pending.
