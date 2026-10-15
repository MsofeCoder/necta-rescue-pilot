# Civics starter collection - bounded source review

Reviewed 15 October 2026 by Codex. This is an original-page comparison and independent conceptual assessment by the coding agent, not a human subject-expert certification. The owner subsequently accepted the collection and authorized publication, recorded in [RELEASE_ACCEPTANCE.json](RELEASE_ACCEPTANCE.json). No paper-level clearance is implied.

Original documents were present, opened, hashed against the actual manifest, rendered and visually inspected:

| Source | SHA-256 | Reviewed PDF pages |
| --- | --- | --- |
| `Civics-F4-2025.pdf` | `603b5513f4071ec9366f2418378d9e3ca55109e132c83e06420dd1e7fc24ff6a` | 2, 3, 4 |
| `Civics-F4-2025-Solutions.pdf` | `d6768804869ec297e736ada34d17ea024d0462fac4206cffe82b520ff467043f` | 2-8 |

Page numbers are one-based PDF pages and match the printed page numbers for these sources. The question PDF controls wording, hierarchy and option labels. The supplied solution is credited on its pages to **Maria Marco for TETEA**, and is not an official NECTA marking scheme.

| Stable question record | Topic | Exam page | Supplied solution pages | Reviewed answer | Evidence/correction |
| --- | --- | --- | --- | --- | --- |
| `civics-2025-p1-q01i` | Human rights | 2 | 2 | E | All five printed options restored in the display copy; pipeline options were under q01ii. Economic and social needs distinguish the complete category. |
| `civics-2025-p1-q01iii` | Economy and development | 2 | 2-3 | B | Full item visually checked. Imports exceeding exports defines a trade deficit. The mispaired extracted a01iii is not answer evidence. |
| `civics-2025-p1-q01iv` | Leadership | 2 | 3 | C | Full A-E alternatives checked. Inspiring followers distinguishes charismatic leadership. Ambiguous pipeline associations not used. |
| `civics-2025-p1-q01vi` | Democracy | 2 | 4 | B | Direct decision participation matches pure/direct democracy. No boundary repair required. |
| `civics-2025-p1-q01ix` | Economy and development | 3 | 5 | A | Missing alternatives restored from the original; comparison within a community identifies relative poverty. |
| `civics-2025-p1-q01x` | Our nation | 3 | 6 | C | Removed foreign preceding options from the display copy; A-E order restored. Population supplies people and abilities. |
| `civics-2025-p1-q03` | Work and careers | 4 | 7-8 | Six explanatory points | The source explicitly asks for six points. Six distinct supplied paragraphs were checked and paraphrased. No marks assigned. |

Six MCQs plus one standalone written question = **7 original cards**. Six MCQ subitems and one standalone top-level question are counted; structural parents are not extra learning cards. All explanations are short, independently authored educational explanations. Historical question wording is transcribed from the print, with whitespace/line wrapping normalized and ordinary typographic punctuation retained. It is separate from the defective pipeline extraction.

**7 authored concept variations** derive only from reviewed Q1(vi). They cover Define, State, Mention, Explain, Describe, Give reasons and Discuss. Each is labelled as authored, carries its own editorial review ID and assigns no exam marks. Counts such as “two reasons” come from the authored prompt itself. An open “Explain”/“Discuss” command does not imply a fixed point count.

The machine-readable [ledger](civics-starter-ledger.json) preserves original pipeline question text, page transcription, corrected display copy, source hashes/pages/URLs, supplied solution attribution/transcription, original association IDs/confidence, new review decisions and conceptual reasoning. Where no valid answer record exists, the new review points directly to the supplied PDF page rather than inventing a canonical answer ID. No canonical JSONL or PDF was rewritten.

## Withheld material

The on-disk Civics 2025 extraction has **30 records**. Seven record IDs support this candidate; **23 extraction records remain held** in the ignored local review queue. This includes stubs and missegmented nested rows, so “23” must not be presented as 23 distinct unanswered exam questions. Across the complete 2,215-record corpus, **2,208 records are not included** in the student bundle. They have not been cleared by this work.

Q1(v) is specifically withheld: the question asks which challenge maintenance avoids, but the supplied key selects a benefit of maintenance. We did not silently substitute a different answer. Q1(viii) also remains unresolved: the supplied explanation invokes inherited predisposition despite the scenario excluding a family history, and the scenario cannot establish a cause. All other non-allowlisted records need a separate review. The raw/private queue and original PDFs are not in Git or `docs/`.

## Corpus reconciliation and preserved work

Recounted locally: **135 manifest documents, 894 inventory pages, 2,215 question records, 1,991 answer records, 2,839 association links, 2,601 review entries**. All 135 manifest PDFs were physically present and their SHA-256 hashes matched the manifest. Civics 2025 has 11 top-level extraction records and 19 subquestion/nested records. The match statistics report 941 pipeline-verified, 431 provisional and 843 missing-answer exam records. These are extraction/linking statistics, not academically validated counts.

The website is its own Git repository. The surrounding pipeline directory has no Git root. The clean starting checkout was `feature/daily-revision-dashboard` at `723575d3c39333499b87ea701d85525f3355afc6`; PR #2 was open against `develop`. A new feature branch starts from verified `origin/main` at `d0df839621f6ef4ec09625eb5f21edfea1087343`. Production HTML matched that commit byte-for-byte before implementation, and Pages remained `main` `/docs`.

The phase reports, review continuations, matching records, original documents, local project memories and the Downloads Codex handover were actually located and read. The two older preliminary artifacts named in the migration report (`NECTA_Phase2_Migration_Acceptance_Checkpoint.md` and `Civics_2025_Source_Review_Ledger.jsonl`) were not found; the available continuation ledger and original PDFs were used instead. Current explicit owner instructions supersede earlier prototype-only handover restrictions.

Hashes of the manifest, inventory, question/answer/link/review JSONLs, existing Civics review ledger and both original PDFs were recorded locally and checked again after implementation. All were unchanged. No dashboard commits were altered or included.
