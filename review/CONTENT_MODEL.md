# Content and storage contracts

The buildless content script exposes `window.NECTA_CIVICS = {version: 1, cards, allowlist}`. `learning-core.js` is the shared browser/Node runtime validator. Unknown or incomplete content fails closed. Tests exercise the validator and real browser behavior.

| Card field | Contract |
| --- | --- |
| `id`, `topic` | Stable unique card ID and human-readable topic. |
| `kind` | Exactly `original_exam` or `authored_concept`; visibly labelled in the UI. |
| `type` | Exactly `mcq` or `written`. |
| `question` | Display question, up to 2,000 characters. Originals must equal `originalQuestion`, the checked page transcription. |
| `answer` | One to eight short bullet strings; first MCQ bullet must equal the labelled correct printed option. |
| `explanation`, `style` | Brief educational explanation (maximum 400 characters) and specific answer-structure guidance. |
| `options`, `correctOption` | MCQ only: exactly five complete A-E options, in order, plus one matching key. |
| `marks`, `requiredPoints` | Null when unsupported. A non-null point count must match the answer bullets and the wording; never infer marks from section totals. |
| `review` | ID, exact status, displayed review date and non-empty note; `source_checked` for originals, `editorially_checked` for authored variations. |
| `recordId`, `reference`, `parentQuestion`, `subquestion`, `year`, `paper` | Original source identity and hierarchy, preserving canonical record IDs. Phase D accepts only the reviewed years 2022, 2023 and 2025, paper 1; both filenames and full URLs must match that year. |
| `exam`, `solution` | Original-only objects: source filename, original URL, SHA-256 and one-based page array. Links are restricted to the expected TETEA source host/path. |
| `solutionAttribution`, `answerTreatment` | Supplied-solution credit and explicit transcription/paraphrase distinction. |
| `transfer` | Required short guidance on differently worded questions; revealed with the answer, cleared on navigation. |
| `derivedFrom`, `command` | Authored-only: an eligible original card ID and the command practised. No fabricated exam provenance. |

The allowlist requires an exact `{id, reviewId, status}` match, rather than trusting a card's self-declared status. Duplicate cards do not inflate the collection. `pipeline-verified`, `verified`, provisional, pending and held are never accepted statuses. A variation is withheld if its source card is withheld. The historical starter ledger uses `include_in_feature_candidate`; Phase D uses `include_in_development_candidate` in its separate ledger, with `pending_phase_d` owner approval. Prior approval never grants new content publication permission.

Self-check storage is `{version:1, records:[{card_id,status,updated}]}` under `necta-rescue-learning-v1`. `status` is `understood` or `revise_again`; `updated` must parse as a date. IDs are unique, up to 5,000 records. Unknown future card IDs are retained rather than discarded. Writes reread the latest stored value to preserve changes made in other tabs, and the storage event refreshes the displayed self-check.

The old `necta-rescue-pilot-v1` key remains the original array of `{id,subject,year,paper,question,status,notes,created}`. The paper-practice code retains its original validator and backup format. The learning page reads that array only for export and explicitly approved import; question study never changes it.

A combined backup uses the original `{format:'necta-rescue-pilot',version:1,exported_at,records}` envelope and adds optional `learning`. The old importer ignores the extra field and restores its own original records. An old backup without the field leaves Civics self-checks unchanged. Import validates both parts before writing, asks before replacement, and restores the previous values if a storage write fails. A double storage failure is explicitly reported; browser localStorage has no cross-key transaction primitive.

Both importers now accept up to 16 MB, while maintaining their existing record-count and field-length checks. The original paper-practice logic has been moved into a local external script for CSP and hardened: unreadable/partially invalid history is kept rather than filtered away, saving pauses, destructive changes only update the display after a successful write, and other-tab changes are reread. The learning recovery export preserves the raw text from both keys in a distinct `necta-rescue-recovery` envelope; it is not silently treated as a validated progress backup.

No backup contains PDFs. The local preview serves only explicit static filenames in `docs/`, and the worker caches only its own explicit public asset list. Neither accesses the canonical corpus or review directory over HTTP.
