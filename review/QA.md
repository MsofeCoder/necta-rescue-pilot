# Executed QA - 15 October 2026

**154 checks passed, zero remaining failures.** Machine-readable evidence: [qa-results.json](qa-results.json).

| Suite | Executed result | Environment |
| --- | --- | --- |
| Content, provenance, allowlist and backup validation | 16/16 | Node built-in test runner; no package installation |
| Learning browser flow, upgrade, accessibility and offline | 79/79 | Actual headless Chrome 155.0.8059.80, HTTPS under `/necta-rescue-pilot/` |
| Existing paper-practice regression | 59/59 | Existing available `probe.mjs`, adapted to the new paper-practice URL, current manifest name and isolated temporary paths/endpoints |

The production-upgrade test serves the actual Git tree at `d0df839621f6ef4ec09625eb5f21edfea1087343`, records an attempt through that UI and downloads its old backup, then serves the candidate at the same HTTPS origin. The original storage bytes survive. v2 and stale v3 caches are removed; an unrelated cache survives. The old backup imports into the candidate without removing Civics self-checks, and the original importer accepts the combined backup's additive field.

The learning suite verifies hidden answer text and hidden accessibility-tree content before reveal, complete printed A-E choices and answer alignment for each MCQ, six explanatory career points, all command variants, next/previous/retry reset, topic/filter empty states, keyboard Enter and focus, self-check/reload persistence, corrupt/full storage, import rollback, escaping of injected markup, and held-content exclusion. The original practice script was also compared to production and is unchanged; the only addition to that copied page is a return link.

Offline was tested with Chrome reporting offline **and the HTTPS server stopped**. The app, bundled content, reveal and save flow continue from the explicit cache. Unknown/private paths return 404 online and are not served as the app shell offline. No original PDFs, raw manifests, corpus JSONLs, private queue or source filesystem paths are served. Zero JavaScript errors and zero third-party requests were recorded. Source PDF links are not fetched until a student follows them.

## Mobile screenshots

All captures were generated from the final candidate and visually inspected for clipping, overflow, readable type and usable actions. Widths are emulated, not physical devices.

- [Home, 360px](screenshots/home-360.png)
- [Topics, 390px](screenshots/topics-390.png)
- [Question before reveal, 360px](screenshots/question-360.png)
- [Revealed answer and self-check, 390px](screenshots/answer-390.png)
- [Authored concept variation, 390px](screenshots/concept-390.png)
- [Offline answer flow, 390px](screenshots/offline-390.png)

## Failures encountered and resolved

The first browser run failed before the feature tests: Chrome's CacheStorage returned an internal error under the deeply nested Windows profile path. The harness now creates a short isolated temporary profile; the actual production worker then installed normally. The first complete run also exposed two test-driver defects: a missing async-function invocation in the worker-scope assertion and an incomplete CDP Enter sequence. The driver was corrected, and the suite was rerun. These failed runs were not counted as passes.

Code review additionally tightened malformed allowlist handling, made the offline-ready message wait for the current worker, and limited caching/deletion to the public bundle and NECTA cache generations. The final 79-check run includes these changes. The old 59-check suite then passed against the final implementation.

## Limits and release work

No physical Android/iOS device test, Safari/Firefox execution, large real-PDF timing, or live post-deployment smoke test has been performed. No production merge or deployment occurred. Academic review by a human subject expert and owner acceptance of the named collection remain pending; Codex source checking is explicitly documented as such. Follow [RELEASE_POLICY.md](../RELEASE_POLICY.md) before public release.
