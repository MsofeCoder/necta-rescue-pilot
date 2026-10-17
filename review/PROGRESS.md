# NECTA Rescue delivery progress

Verified student beta: [open provisional beta](https://msofecoder.github.io/necta-rescue-pilot/beta/).

Content deployment: `e6d5cba4c64010742f601c848245d4472f349a52`; implementation review head: `ebec994f907371a331cac46c56e8b2021a2c09a6`. [Release PR](https://github.com/MsofeCoder/necta-rescue-pilot/pull/41). Verified 2026-10-17T08:35:52.696Z. Later repository-only checkpoint commits do not change the student bundle.

180 live items = 150 source-checked question-only + 30 provisional Civics. Question-only: 29 original parent/top-level and 121 original subquestion records. Civics originals: 5 parent/top-level and 10 subquestion records; 15 separately labelled authored variations. Prior bounded source/editorial answer review supports 30 provisional Civics cards; **zero independent human academic acceptances are claimed**. No new answers generated.

## Actual in-app subject/year coverage

Cells: Q = source-checked question-only; C = original Civics with prior bounded answer review; A = authored variation. Zero means original-paper references only, not checked in-app content. All eight subjects retain paper references across 2020–2025 (64 papers). A subset is not a complete paper.

| Subject | 2020 | 2021 | 2022 | 2023 | 2024 | 2025 |
| --- | --- | --- | --- | --- | --- | --- |
| Kiswahili | 0 Q | 0 Q | 0 Q | 0 Q | 2 Q | 29 Q |
| English | 0 Q | 0 Q | 4 Q | 4 Q | 8 Q | 8 Q |
| Civics | 0 Q + 0 C + 0 A | 0 Q + 0 C + 0 A | 0 Q + 3 C + 1 A | 0 Q + 4 C + 4 A | 12 Q + 0 C + 0 A | 0 Q + 8 C + 10 A |
| Geography | 0 Q | 0 Q | 0 Q | 5 Q | 2 Q | 18 Q |
| History | 0 Q | 0 Q | 0 Q | 0 Q | 9 Q | 15 Q |
| Literature in English | 0 Q | 0 Q | 0 Q | 0 Q | 15 Q | 12 Q |
| Biology | 0 Q | 0 Q | 0 Q | 0 Q | 0 Q | 5 Q |
| Basic Mathematics | 0 Q | 0 Q | 0 Q | 2 Q | 0 Q | 0 Q |

## Answer state and held evidence

All 150 Q records have unavailable educational answers, regardless of association state. Association counts: missing_answer = 4; pipeline_verified = 15; provisional_or_ambiguous = 131. Pipeline verification is not academic correctness. Missing/provisional associations are not missing student progress.

C-02/C-08 remain withheld pending human review: concept-democracy-state, concept-democracy-reasons. Six original Civics conflicts remain withheld:

- civics-2023-p1-q01ii: Supplied key D describes directions to a location, while the mandatory-sign stem calls for what users must do (printed B). Withhold rather than silently replacing the key. Printed “future” also requires transcription review.
- civics-2022-p1-q01vi: The complete negotiation scenario is printed in the exam, but the supplied solution omits it and labels a different culture stem (vi). No verified supplied answer alignment; candidate excluded.
- civics-2023-p1-q01i: Printed question asks for the government’s official seal and badge (Coat of Arms, D); supplied answer A is the Uhuru Torch. Contradiction unresolved; excluded.
- civics-2023-p1-q01v: Political-threat stem asks about sovereignty; supplied A describes investment inflows instead of the listed sovereignty risk. Contradiction unresolved; excluded.
- civics-2025-p1-q01v: Prior hold retained: stem asks for a challenge avoided; supplied D gives increased lifespan and beauty, which are benefits. A checked 2023 maintenance item does not repair or approve this source.
- civics-2025-p1-q01viii: Prior hold retained: source scenario and supplied explanation do not establish a unique reliable cause among the options. No inferred replacement key or medical claim is released.

English 2025 exact q01iii/q01iv remain withheld for printed/canonical parent conflicts. Additional findings: Kiswahili exact q01i is a matching fragment (not printed Q1(i)); History printed Q10 has no standalone canonical ID and remains unadmitted. Geography 2024 exact q01ii points to printed iii/iv; English 2024 printed ix lacks a standalone canonical ID. No canonical repair or invented ID. These remain outside all selectable records. All other unadmitted corpus records are outside coverage; this dashboard does not claim they passed or failed source review.

## Validation and recovery

Checks actually executed: 35 unit/static, 1008 beta browser, 95 root browser and 73 live checks passed. [CI](https://github.com/MsofeCoder/necta-rescue-pilot/actions/runs/39017864865). [Pages](https://github.com/MsofeCoder/necta-rescue-pilot/actions/runs/39017864612). Public asset hashes compared to the deployment; accepted root thirteen files/fourteen-card app unchanged. Both storage keys, historical/hidden progress, combined/legacy backups and offline beta reuse preserved. Evidence/limitations: .workbuddy-ai/batch32-live/report.json, published asset fingerprints and screenshots; necta-rescue-beta-v32 to necta-rescue-beta-v33 upgrade tested on controlled local origin and CI, actual public fresh-profile offline/progress/backup checks; Android NOT TESTED..

Additional source restrictions from immutable ledgers (an absent standalone ID is not an invented canonical record):

- kiswahili-2025-p1-q01i: Prior identity hold: matching fragment, not printed Q1(i).
- history-2025-p1-q10: Prior hold: no standalone canonical ID for printed Q10.
- geography-2024-p1-q01ii: Prior identity hold: canonical text points to printed Q1(iii)/(iv).
- english-2024-p1-q01ix: Printed Q1(ix) is absorbed in canonical viii and has no standalone exact canonical ID; unadmitted, no new ID invented.
- kiswahili-2024-p1-q01: Q1 parent canonical container absorbs printed Q1(i); standalone Q1(i) ID unavailable, no invented subquestion ID.
- kiswahili-2024-p1-q02: Canonical Q2 container is an extraction of Q1(v)–(vii), rather than printed Q2 matching; hierarchy cannot be admitted unchanged.
- kiswahili-2024-p1-q02viii: Canonical parent Q2 disagrees with printed Q1(viii) on original p2; no reparenting.
- geography-2025-p1-q03: The referenced Kazikazi Sheet 140/1 map extract is required; no map reproduced or inferred.
- geography-2025-p1-q06: Question depends on original photograph, not included in these text-only display copies; keep source-reference-only.
- literature-2025-p1-q03f: Printed Q3(f) absorbed by canonical Q3(e), no standalone canonical Q3(f) record exists. Do not invent ID.
- english-2023-p1-q01u1: Printed Q1(i) has unknown-label canonical suffix u1. Preserve identity; do not invent canonical q01i.
- english-2023-p1-q01iv: Meaning depends on underlined home; plain-text display would lose the source cue, so not admitted in this text-only batch.
- english-2023-p1-q01vi~2: Canonical duplicate vi is printed Q1(vii), hierarchy conflict; no reparenting.
- kiswahili-2025-p1-q06g: Printed Q6(g) absorbed by canonical Q6(f), standalone Q6(g) ID absent; do not invent ID.
- kiswahili-2025-p1-q06i: Printed Q6(i) lacks standalone canonical identity; unadmitted.
- kiswahili-2025-p1-q05i: Printed Q5(i) continuation lacks standalone exact canonical ID; no new ID invented.
- history-2025-p1-q01vii~2: Canonical duplicate vii is printed viii on original p3; parent/subquestion conflict, no reparenting.
- history-2024-printed-q1: Original p2 Q1 was visually available, but canonical questions.jsonl has no corresponding History2024 Q1 records; no new IDs or bulk extraction invented.
- biology-2025-p1-q01u1: Printed i has unknown-label canonical u1; no relabelling or invented standalone i ID.
- biology-2025-p1-q01u2: Printed ii is mixed with i alternatives and labelled u2; identity unresolved.
- biology-2025-p1-q01ii: Canonical ii is printed iii doughnut question. Preserve source hierarchy boundary; do not reparent.
- english-2022-p1-q01iii: Original meaning depends on underlined prefers coffee than tea; this plain-text batch does not preserve underline cue, so excluded.

Display corrections are separately traceable in [english-2024-parent-instruction-amendment.json](english-2024-parent-instruction-amendment.json). Historical ledgers remain unchanged; these amendments do not accept answers.

Rollback baseline: `0a0208f0e3d6e309e1acea451dfd4f19dda3cd04`. Revert implementation merge `e6d5cba4c64010742f601c848245d4472f349a52` with first parent through reviewed PR; use a **new cache generation** in worker and readiness checks, never reuse an old generation. Preserve storage and backups; accepted root fallback remains available.

Human academic approval: **PENDING**. Physical Android: **NOT TESTED**, device testing excluded by the owner for this delivery window. [Five-minute checklist](ANDROID_5_MINUTE_CHECK.md) retained; emulation does not pass it. Release policy and emergency-beta restrictions unchanged.

## Exact restart checkpoint

Next: English2021 Q4four batch33.json/Q5three batch34.json p4; English2020 first5 batch35.json p2 (replace2020empty browser assumption with actual year counts); Math2025 four batch36/four batch37 p2/3; Geography2020 first5 batch38 p2; Kiswahili2020 first6 batch39 p2. Prepared specs/renders source-checked. Preserve exact paper URLs via engine guard, English amendment, all holds; no answers/human/phone. Deadline10:08UTC.

Use the deployed SHA above as the content baseline, inspect git status before proceeding and retain unrelated review/staging files. Do not repeat admitted IDs. Use beta-current-release.json for the current bounded batch, its immutable ledger and test expectations; advance the cache, run all required suites, publish only under the exception, verify the public bytes/counts, then update this checkpoint. No overall completion percentage is inferred.
