# Three recent source-checked questions — emergency beta integration

Baseline: deployed main `03f64944e3712cb0bcd3beb4281c109ea6fad41f`. Scope: three original 2025 questions, no educational answers, under the documented emergency-preview exception. Sole-agent engineering/source review does not provide human academic certification.

The prepared ledger from draft PR #10, commit `2c748e55657396ec02b6e1579eb4f1cf4523c0ab`, is retained byte-for-byte as `next-core-source-batch-2026-10-17.json`. A separate `core-three-integration-ledger.json` records the second source-page check, admitted display copies, exact original IDs/hierarchy, source/render fingerprints and canonical preservation hashes. Preparation history is not rewritten.

| Exact ID | Fresh original-page recheck | Hierarchy | Decision |
| --- | --- | --- | --- |
| english-2025-p1-q01v | English PDF p2, Q1(v), below Q1(iv) and above Q1(vi); original Q1 instruction and all five A–E alternatives retained. Remove OCR underscore/plus only. | Parent 1, subquestion (v) | Question-only |
| history-2025-p1-q08 | History PDF p5, Q8, after Q7's final word “statement.” and before SECTION C. Q8 ends “period.”; the Section C instruction is not part of Q8. | Parent/top-level Q8; no invented subquestion | Question-only |
| history-2025-p1-q09 | History PDF p5, Q9, within Section C, ends “Explain by giving six points.” before printed Q10. Retain Section C instruction as context; remove Q10 spillover. | Parent/top-level Q9; no invented subquestion | Question-only |

Full original pages were freshly rendered at 1.7x using PyMuPDF and visually inspected on 17 October 2026. English SHA-256: `a85ce4cac21318c1ef9d93f02f9609de5fc659bb35c7384dfd71c943d30089b1`; History SHA-256: `7ca2966f82b4a49734f181fc95e91887831f9cad33fbabe625f6051c9187f106`. Both match existing provenance and the prepared ledger. New render hashes also match the prepared ledger. No solutions were used to supply candidate wording. All three prompts are self-contained; no required diagram, table or passage is omitted. Section C's 30 marks is section context only; item marks remain null.

Added: **2 parent/top-level questions + 1 subquestion; zero accepted answers**. Beta total: **61 practice items = 30 provisional Civics + 31 question-only**, the latter comprising **14 parent/top-level questions + 17 subquestions**. English has seven question-only records; History has six. All 28 prior question-only records remain identical. Civics, accepted thirteen root files/fourteen cards, storage keys/schema, canonical JSONL, original PDFs, release policy and all historical records remain unchanged.

English exact q01iii/q01iv, C-02/C-08 and all six original Civics conflicts remain withheld. No dependent records are added. Only three existing beta assets change: sources.js, worker cache name and readiness cache name, v3 → v4. Review evidence remains outside docs; original page renders stay private.

Validation covers exact deployed v3 → v4 cache update, all cards at 320/360/390px, printed stems/context/options, absent answer controls/data, original source links, hidden/unknown progress, both old storage keys, combined and legacy backups, rollback on storage failures, offline reuse and accepted-root regression. Exact counts/results and tested head are recorded in the implementation PR and CI evidence.

Android: **NOT TESTED**. A fresh `adb devices -l` found no connected device. `ANDROID_5_MINUTE_CHECK.md` is retained unchanged and ready; its physical offline restart/progress steps are unexecuted. Human academic approval remains PENDING.

Rollback reference: `03f64944e3712cb0bcd3beb4281c109ea6fad41f` (v3). Revert the implementation merge with first parent on a review branch and advance both beta cache names to a **fresh v5 or later** before publication; do not simply reuse v3. Preserve learner storage, backups and accepted-root assets.
