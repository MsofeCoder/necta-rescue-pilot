# Release policy: source-first learning

Production: `main` publishes `docs/` on GitHub Pages. Development: `feature/*` -> `develop`. A separate reviewed `develop` -> `main` PR requires explicit owner release approval. Never push a feature directly to `main` or change the Pages source.

The owner's 15 October 2026 takeover brief authorizes the bounded Civics Q&A implementation, card-by-card source review, commits and PR preparation. It supersedes the earlier prototype-only restrictions. It does not authorize merging or deploying. The dashboard PR #2 remains separate.

The only candidate historical content is the seven IDs explicitly enumerated in `docs/civics-content.js` and `review/civics-starter-ledger.json`. Each has original-page and supplied-answer-page evidence and a separate Codex conceptual review. Seven authored concept variations are clearly distinguished. Review status is an evidence description, not NECTA endorsement. The owner explicitly accepted this pilot and authorized publication on 15 October 2026, recorded in `review/RELEASE_ACCEPTANCE.json`; independent human subject-expert certification is not claimed.

All other Civics 2025 records and held English 2024, Kiswahili 2025 and Geography 2025 records remain excluded. Never infer accuracy from `pipeline-verified`, `verified`, `needs_review=false` or association confidence. No bulk source edits, unreviewed imports or silent repairs. Corrections belong in a separate auditable ledger; preserve the canonical files and IDs.

Original PDFs require verified permission before redistribution; none are included. No private manifests, local filesystem paths, secrets, personal student progress or raw corpus files may enter the public repository. Only the explicit static bundle in `docs/` is cached; no PDF uploads or third-party requests.

Before public release:

1. Have the owner/subject reviewer accept the seven historical items and seven authored variations using the ledger and original pages. Resolve any new objection by withholding the affected card and its dependent variations.
2. Review and accept the feature PR into `develop`; keep PR #2 out of the release unless separately approved.
3. Run core and browser suites on the exact release candidate. Test question/reveal/navigation, complete MCQs, source gates, empty states, keyboard/focus, 360/390px widths, offline operation, legacy notes/backups and cache upgrade.
4. Physical Android reading, touch, persistence and offline return have passed on the candidate. Recheck if public files change; verify home-screen installation and iOS Safari if included in the release scope. Emulation is not a physical-device test.
5. Export a current combined backup. Open a separate `develop` -> `main` release PR and obtain explicit owner approval before merging. Leave Pages on `main` `/docs`.
6. After the approved merge, verify the Pages build SHA, live file fingerprints, v6 worker, first-load offline-ready state, actual offline use and existing progress on the live origin. Record the production SHA and rollback target. The tested release ZIP and manifest are reproducible with `npm run package:release`; CI checks the public file hashes before packaging.

Rollback target for this change: `d0df839621f6ef4ec09625eb5f21edfea1087343`. Use a reviewed revert of the release commit; the older shell leaves the additive learning key intact. Releasing the feature again recovers those self-checks. Never erase browser data as part of rollback.
