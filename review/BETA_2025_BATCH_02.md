# 2025 source batch 02 — provisional question-only practice

Owner sprint authorization: select approximately 10–12 additional 2025 records from original pages, keep canonical records unchanged and implement a bounded isolated-beta update. Publication, if performed, continues only under the existing emergency-preview exception in EMERGENCY_BETA_EXCEPTION.md; RELEASE_POLICY.md and accepted root files remain unchanged. This is Codex self-review, not independent human certification. No academic or physical Android gate is marked passed.

Baseline: main `77636ece7e63d4183c934130e4b8268f7fb39a4e`. Added **12 original records = 3 parent/top-level questions + 9 subquestions**. All twelve are question-only, with **zero new accepted answers** and no inferred marks. The beta becomes 30 provisional Civics cards plus 26 question-only records. Existing 14 question-only cards, Civics data, hidden progress and backups remain unchanged.

| Subject, 2025 paper 1 | Added printed questions | Parent / subquestion records | Original PDF pages | Supplied solution pages inspected |
| --- | --- | --- | --- | --- |
| Kiswahili | 1(iv), 1(vii), 1(ix) | 0 / 3 | 2–3; parent instruction p2 | 3, 4, 5 |
| English | 1(vii), 1(viii) | 0 / 2 | 3; parent instruction p2 | 4–5 |
| Geography | 1(i), 1(ii), 11 | 1 / 2 | 2, 5 | 2, 12 — conflicts/renumbering below |
| History | 6, 7 | 2 / 0 | 5 | 8–9 |
| Literature in English | 5(b), 5(c) | 0 / 2 | 5, including parent Q5 instruction | 10 |

The per-record ledger beta-2025-batch-02-ledger.json records original IDs, literal pipeline text/text hash, preserved hierarchy, display corrections, source URL/SHA-256/pages, inspected page-render hashes and solution-association assessments. Ten original PDF files were hash-verified against the existing manifest before and after preparation. Seven canonical migration inputs were fingerprinted and preserved. Original page images remain private and are not distributed. Selected records require no omitted diagram, table, map, passage or poem. The preceding Literature poem is not the context of Q5.

## Source findings

- Geography Q1(i)/(ii): the printed original A–E choices are restored from the exam page. The supplied solution p2 changes/reorders choices and omits an alternative. Its key cannot be transferred; both remain question-only with a visible conflict notice and no accepted item-level solution association. The generic paper-level solution link is not certification.
- Geography Q11: its full prompt occurs on supplied solution p12 under number **10**. The ledger records that discrepancy explicitly; neither a numeric join nor an accepted answer is inferred. The unrelated following map spillover is removed from this display only.
- Geography Q7 is not added: its parent record absorbs printed (a), q07a contains printed (b), and q07b contains printed (c). No canonical ID or subquestion label was rewritten.
- History Q6/Q7: remove the preceding Q5 tail from Q6; restore Q7's final word from its printed boundary, which the pipeline attached to Q8.
- Kiswahili Q1(iv): full stem distinguishes it from a duplicate-label matching fragment. Pipeline ambiguity remains in the canonical ledger. Other corrections restore printed option labels/letters and remove OCR punctuation only.
- English: keep printed grammar, restore swallowed option labels and inspect p5 for the continuation of the Q1(viii) supplied key. No answer is promoted by this location check.
- Literature Q5(b)/(c): include the original parent instruction. The supplied solution location matches the device and instruction; this establishes location only, not human academic approval.

C-02/C-08 and all six original source-conflict holds stay withheld, with no new dependants admitted. C-01/C-04 remain intact. The original 14-card accepted root app, policy, PDFs, canonical JSONL and historical review files are untouched.

## Engineering scope and validation plan

Content and explanatory notices only; no interface rebuild or storage/schema changes. Advance the beta cache generation from v1 to v2 so an existing offline installation can receive the batch. Validate a real v1 → v2 worker update from exact baseline assets while preserving root v6 cache and synthetic legacy/new progress; check every card at 320/360/390px, no answer reveal for question-only practice, per-subject/year counts, source references, offline reload and combined backups. Run the unit/static preservation checks and preserve exact-commit browser evidence in CI. Record results in the PR before any publication. The accepted root browser suite is unchanged and CI retains it.

Rollback: retain baseline main77636ec and its seven beta assets. A reviewed revert must use a **new cache generation** when restoring earlier content, so installed v2 clients update; merely serving old v1 code can resurrect stale cached assets. Preserve both learner storage keys and backups throughout. The accepted root link remains available.

Five-minute unexecuted manual device checklist: ANDROID_5_MINUTE_CHECK.md. Browser emulation is not physical Android acceptance.
