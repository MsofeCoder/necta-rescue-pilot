# Civics release candidate - production readiness

15 October 2026. **Engineering candidate complete; the owner explicitly accepted the fourteen-card pilot and authorized publication.** Approval of the exact public-file hashes and merge/release scope is recorded in [RELEASE_ACCEPTANCE.json](RELEASE_ACCEPTANCE.json). PR #3 targets `develop`; the approved release proceeds through a separate `develop` -> `main` PR. Unrelated dashboard PR #2 remains excluded. No independent human subject-expert certification is claimed.

## Final checks on the public bundle

| Executed suite | Result |
| --- | --- |
| Node content, storage contract, security, release and failed-worker-update checks | 24/24 |
| Real Chrome 155.0.8059.80, HTTPS project subpath | 94/94 |
| Real Edge 155.0.4283.45, HTTPS project subpath | 94/94 |
| Existing paper-practice regression against the final candidate | 59/59 |
| Physical Samsung Galaxy S22 Ultra / Android 15 / Chrome 154.0.8037.127 | 16/16 |
| Total executed assertions across the suites | **287/287** |

Counts include the same behavior verified in different browsers; they are not 287 distinct features. Machine-readable, sanitized results are in [qa-results.json](qa-results.json). Public-file SHA-256 fingerprints tie Chrome, Edge and device evidence to the same candidate. GitHub Actions runs 24 static/unit checks plus the 94-check Chrome suite on pushes/PRs and packages the exact tested public files without deploying.

Both 360px and 390px layouts were checked in desktop browsers. The physical phone used its own display metrics (513 CSS px wide, DPR about 2.106), without changing display settings. Physical touch opened topics, selected an MCQ, revealed the aligned answer, saved Revise Again, retried and recovered the state after reload. The preview server was then stopped, the test tab's network disabled through CDP, and a new navigation still loaded the bundle; answer reveal and saving passed offline. The phone already reported offline while USB forwarding delivered the initial local bundle; the readiness message correctly reflected that state. No phone-wide network settings or real production-origin storage were changed. The temporary preview storage was restored and forwarding removed.

Physical-device captures, inspected for clipping and readable content:

- [Home](screenshots/android-home.png)
- [Topics](screenshots/android-topics.png)
- [Question](screenshots/android-question.png)

The phone was disconnected after the passing run; a later attempt to improve the screenshot framing could not start. The passing report's public-file hashes still match this candidate. No unavailable screenshot run is counted as a passing test.

## Defects fixed during readiness work

- Legacy history used to filter unreadable records into an empty/partial list, allowing a later save to replace the original. It now retains the raw data and visibly pauses saving. A separate recovery export preserves raw text for repair.
- Failed legacy deletion/clear used to update the display despite a failed storage write. The display now changes only after persistence succeeds. Other-tab history is reread before writes, and the original storage key/schema is preserved.
- A valid exported history could exceed the old 3 MB import ceiling. Both importers now support 16 MB with existing count/shape validation. An actual 3.6 MB valid backup was restored in both browser routes.
- Network-first offline caching could stall on a slow connection or mix versions. Generation v6 precaches an explicit complete bundle and serves it immediately. A missing asset prevents activation; the prior cache remains available. Old NECTA caches are removed, unrelated caches preserved. An open old page offers reload when a newer bundle answers its readiness handshake.
- Browser Content Security Policy now restricts scripts to local files, blocks inline executable injection and embedded objects, and disables referrer disclosure. The legacy script was moved into a local file to support this. Normal operation produces no policy violations; the deliberate injected-script test is blocked.
- Authored variations now show the source example even when entered through their filter. The two State bullets distinguish the participant group from its direct decision-making role.
- CI and a deterministic release packager were added. Packaging rejects untested public-file changes, excludes private/source directories and verifies every archive entry against a SHA-256 manifest.

Cached load under 4x CPU slowdown, 400ms configured network latency and about 1 Mbit/s download passed the 5-second budget in Chrome and Edge. This is a controlled browser measurement, not a performance guarantee for every Android device. The public app's HTML/JS/CSS remains below the tested 150 KiB budget.

## Academic and provenance readiness

The collection remains **7 original cards plus 7 labelled authored variations**, with the other 23 Civics 2025 extraction records withheld. Original page transcription, all A-E alternatives, supplied-solution attribution and the separate raw/corrected ledger are preserved. [Independent primary-reference cross-checks](ACADEMIC_CROSSCHECK.md) now support the concepts using TIE, ILO, IMF and primary leadership research. No extra question bank or textbook content is imported. No new unresolved contradiction was identified; Q1(v) and Q1(viii) remain held.

The ledger records the subsequent owner approval for this pilot, with its original Codex review and human-review status preserved. Codex review is not a teacher certification. This is a bounded starter pilot, not full Civics syllabus coverage.

## Releasable artifact and remaining owner action

`npm run package:release` writes a deterministic ZIP and release manifest under ignored `.workbuddy-ai/release/`. Only the thirteen allowed files from `docs/` are included (twelve precached assets plus `sw.js` and `.nojekyll`, with the directory-root alias sharing index.html). The manifest records content hashes, browser/device evidence and deployment status. GitHub Actions retains the same bundle and evidence as a review artifact; it does not publish a site.

The owner approved the exact fourteen-card pilot and merge/release path after reviewing the engineering outcome and disclosed limits. Merge the reviewed feature into `develop`, open the separate `develop` -> `main` release PR, and verify the live Pages build/hash, v6 worker, old progress and offline use after deployment. Student progress remains local; each student should keep a combined backup. Keep PR #2 excluded.

Home-screen installation, iOS Safari/Firefox execution and large real-PDF performance are not claimed. The essential Android Chrome learning and offline flows are physically verified. Rollback remains a reviewed revert to baseline `d0df839621f6ef4ec09625eb5f21edfea1087343`, retaining both browser storage keys.
