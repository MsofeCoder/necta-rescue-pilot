# Release policy: source-first learning

Production: `main` publishes `docs/` on GitHub Pages. Development: `feature/*` -> `develop`. A separate reviewed `develop` -> `main` PR requires explicit owner release approval. Never push a feature directly to `main` or change the Pages source.

The owner's 15 October 2026 takeover brief authorizes the bounded Civics Q&A implementation, card-by-card source review, commits and PR preparation. It supersedes the earlier prototype-only restrictions. It does not authorize merging or deploying. The dashboard PR #2 remains separate.

The released fourteen-card collection was accepted on 15 October 2026; its immutable acceptance evidence is `review/RELEASE_ACCEPTANCE.json`. That approval does not cover Phase D. The 16 October 2026 Phase D brief authorizes inspection, 14-card re-audit, 15–20 reviewed additions, implementation, testing, commits and a PR into `develop`. It explicitly withholds merge/deployment authority. The candidate has 32 allowlisted cards: 15 originals and 17 authored variations. Eight originals and ten authored cards have separate decisions in `review/phase-d-ledger.json`; the released 14 have a separate re-audit. Review status describes Codex evidence checks, not NECTA endorsement or independent human subject-expert certification.

Civics 2025 Q7 has now passed its own Phase D source review. The remaining 22 Civics 2025 extraction records and held English 2024, Kiswahili 2025 and Geography 2025 records remain excluded. Never infer accuracy from `pipeline-verified`, `verified`, `needs_review=false` or association confidence. No bulk source edits, unreviewed imports or silent repairs. Corrections belong in a separate auditable ledger; preserve the canonical files and IDs.

Original PDFs require verified permission before redistribution; none are included. No private manifests, local filesystem paths, secrets, personal student progress or raw corpus files may enter the public repository. Only the explicit static bundle in `docs/` is cached; no PDF uploads or third-party requests.

Before public release:

1. Have the owner/subject reviewer accept the named 32-card Phase D candidate, including all 18 additions and recorded display corrections, using the new ledger and source pages. Resolve any new objection by withholding the affected card and its dependent variations.
2. Review and accept the feature PR into `develop`; keep PR #2 out of the release unless separately approved.
3. Run core and browser suites on the exact release candidate. Test question/reveal/navigation, complete MCQs, source gates, empty states, keyboard/focus, 360/390px widths, offline operation, legacy notes/backups and cache upgrade.
4. Physical Android reading, touch, persistence and offline return passed on the preceding release. A fresh Phase D physical-device check is pending; no phone was connected for this pass. Complete it before release; verify home-screen installation and iOS Safari if included in the release scope. Emulation is not a physical-device test.
5. Export a current combined backup. Open a separate `develop` -> `main` release PR and obtain explicit owner approval before merging. Leave Pages on `main` `/docs`.
6. After the approved merge, verify the Pages build SHA, live file fingerprints, v7 worker, first-load offline-ready state, actual offline use and existing progress on the live origin. Record the production SHA and rollback target. The tested release ZIP and manifest are reproducible with `npm run package:release`; CI checks the public file hashes before packaging.

Rollback target for this change: `79044ec5fce9e52baaaff4e3764ea569c5025e82`. Use a reviewed revert of the release commit; the older shell leaves the additive learning key intact. Releasing the feature again recovers those self-checks. Never erase browser data as part of rollback.

Phase D release approval must explicitly name the accepted content collection and authorize merging the feature PR into `develop`, then a separately reviewed `develop` -> `main` release PR and publication of `docs/` to the existing GitHub Pages site. Physical-device acceptance and exact-candidate CI must pass first. Preparation of a ZIP or a feature PR is not publication approval. The daily dashboard PR #2 remains excluded.
