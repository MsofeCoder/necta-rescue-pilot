# English 2025 exact-ID source review — 17 October 2026

Baseline: main `20f3a79a15ef027871c46b4cd41d19bd31e297e0`, merged PR #8. Sole-agent source and engineering review under the existing emergency-beta exception; no human academic acceptance claimed. The named queue attachment was not found in accessible local files. The owner's four exact IDs were reviewed directly against the original, without borrowing candidate text from solutions.

Original: [English-F4-2025.pdf](https://maktaba.tetea.org/past-papers/csee/english/English-F4-2025.pdf#page=2), six pages. SHA-256 `a85ce4cac21318c1ef9d93f02f9609de5fc659bb35c7384dfd71c943d30089b1`, matches local inventory and existing beta provenance. PDF pages 2–3 (also printed pages 2–3) rendered with PyMuPDF at 1.7x and visually inspected in full. Render fingerprints and original canonical text/page spans are in `english-2025-source-review-ledger.json`. Images remain private; original PDF bytes are unchanged.

| Exact record | Source finding and proposed display correction | Decision |
| --- | --- | --- |
| english-2025-p1-q01i | p2 Q1(i): restore “Your friend asks you to write his personal information at the back of his diary.” before the existing final question. Printed A–E: References; Autobiography; Bibliography; Abstract; Biography. | Approved for question-only |
| english-2025-p1-q01ii | p2 Q1(ii): restore printed alternatives: “I am as tall as him”; “I am as tall with him”; “I am as tall like him”; “I am tall as like him”; “I am tall as he”. Keep printed grammar. | Approved for question-only |
| english-2025-p1-q01iii | Canonical p3 text is Q2(iii), List A “He might be right.” Adjacent “D Ask for permission” belongs to independent List B, and is not an answer. Proposed fragment correction is recorded separately, conditional on complete matching context and a separately reconciled hierarchy. | Withheld; canonical parent 1 conflicts with printed parent 2 |
| english-2025-p1-q01iv | Canonical p3 text is Q2(iv), List A “I can solve the problem.” Adjacent “E Express movement” is independent List B, and is not an answer. Proposed fragment correction has the same full-context/hierarchy condition. | Withheld; canonical parent 1 conflicts with printed parent 2 |

Both admitted records retain the printed Q1 instruction, exact IDs, parent `1`, subquestion labels, source URL and PDF hash. No marks or correct choices are inferred. All educational answers remain unavailable.

The actual printed Q1(iii), beginning “I have been playing for five hours,” and Q1(iv), beginning “The cards expressing sympathy,” both occur on p2 inside canonical `english-2025-p1-q01ii~2`. They must not replace the exact requested iii/iv IDs. That combined record and duplicate matching fragments q01i~2/q01ii~3 remain unadmitted. Full matching-table repair is outside this bounded update.

Counts: four exact subquestion records reviewed; two admitted, two withheld; zero new parent records; two new subquestion records under one existing parent; zero accepted answers. Candidate beta: 30 provisional Civics + 28 question-only = 58 cards. English: six question-only cards. Existing 26 question-only cards, all Civics content, C-02/C-08 holds and all six original source-conflict holds remain identical to baseline. Root public files, canonical JSONL, historical data, storage keys and release policy are preserved.

Android: **NOT TESTED**. `adb devices -l` returned no connected devices. Each step of the retained `ANDROID_5_MINUTE_CHECK.md`, including offline browser reopening and progress preservation on a physical phone, is NOT TESTED. Desktop browser checks do not satisfy that requirement.

Implementation: additive display ledger and two beta cards; beta worker/cache v2 → v3; accurate generic review notice. No storage or UI schema change. Regression checks cover the deployed v2 → v3 update, exact display text, source links, unavailable answers, mobile widths, both storage keys, hidden progress, backups and offline reuse. Results are recorded in the PR and exact-commit CI evidence.

Rollback: reviewed revert, retaining student storage and advancing the beta cache to a fresh generation (v4 or later). Restoring an old worker generation alone can serve stale content. The accepted root app stays available throughout.
