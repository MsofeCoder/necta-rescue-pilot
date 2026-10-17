# NECTA Rescue delivery progress

Verified student beta: [open provisional beta](https://msofecoder.github.io/necta-rescue-pilot/beta/).

Content deployment: `72eb5ac15e772938ca4316b8f4d7e8ef20c866f9`; implementation review head: `4d35121999fb813bdd33776feb50962675e5a6c1`. [Release PR](https://github.com/MsofeCoder/necta-rescue-pilot/pull/24). Verified 2026-10-17T07:18:07.182Z. Later repository-only checkpoint commits do not change the student bundle.

101 live items = 71 source-checked question-only + 30 provisional Civics. Question-only: 20 original parent/top-level and 51 original subquestion records. Civics originals: 5 parent/top-level and 10 subquestion records; 15 separately labelled authored variations. Prior bounded source/editorial answer review supports 30 provisional Civics cards; **zero independent human academic acceptances are claimed**. No new answers generated.

## Actual in-app subject/year coverage

Cells: Q = source-checked question-only; C = original Civics with prior bounded answer review; A = authored variation. Zero means original-paper references only, not checked in-app content. All eight subjects retain paper references across 2020–2025 (64 papers). A subset is not a complete paper.

| Subject | 2020 | 2021 | 2022 | 2023 | 2024 | 2025 |
| --- | --- | --- | --- | --- | --- | --- |
| Kiswahili | 0 Q | 0 Q | 0 Q | 0 Q | 2 Q | 10 Q |
| English | 0 Q | 0 Q | 0 Q | 0 Q | 5 Q | 8 Q |
| Civics | 0 Q + 0 C + 0 A | 0 Q + 0 C + 0 A | 0 Q + 3 C + 1 A | 0 Q + 4 C + 4 A | 0 Q + 0 C + 0 A | 0 Q + 8 C + 10 A |
| Geography | 0 Q | 0 Q | 0 Q | 0 Q | 2 Q | 13 Q |
| History | 0 Q | 0 Q | 0 Q | 0 Q | 5 Q | 6 Q |
| Literature in English | 0 Q | 0 Q | 0 Q | 0 Q | 9 Q | 7 Q |
| Biology | 0 Q | 0 Q | 0 Q | 0 Q | 0 Q | 2 Q |
| Basic Mathematics | 0 Q | 0 Q | 0 Q | 2 Q | 0 Q | 0 Q |

## Answer state and held evidence

All 71 Q records have unavailable educational answers, regardless of association state. Association counts: missing_answer = 4; pipeline_verified = 15; provisional_or_ambiguous = 52. Pipeline verification is not academic correctness. Missing/provisional associations are not missing student progress.

C-02/C-08 remain withheld pending human review: concept-democracy-state, concept-democracy-reasons. Six original Civics conflicts remain withheld:

- civics-2023-p1-q01ii: Supplied key D describes directions to a location, while the mandatory-sign stem calls for what users must do (printed B). Withhold rather than silently replacing the key. Printed “future” also requires transcription review.
- civics-2022-p1-q01vi: The complete negotiation scenario is printed in the exam, but the supplied solution omits it and labels a different culture stem (vi). No verified supplied answer alignment; candidate excluded.
- civics-2023-p1-q01i: Printed question asks for the government’s official seal and badge (Coat of Arms, D); supplied answer A is the Uhuru Torch. Contradiction unresolved; excluded.
- civics-2023-p1-q01v: Political-threat stem asks about sovereignty; supplied A describes investment inflows instead of the listed sovereignty risk. Contradiction unresolved; excluded.
- civics-2025-p1-q01v: Prior hold retained: stem asks for a challenge avoided; supplied D gives increased lifespan and beauty, which are benefits. A checked 2023 maintenance item does not repair or approve this source.
- civics-2025-p1-q01viii: Prior hold retained: source scenario and supplied explanation do not establish a unique reliable cause among the options. No inferred replacement key or medical claim is released.

English exact q01iii/q01iv remain withheld for printed/canonical parent conflicts. Additional findings: Kiswahili exact q01i is a matching fragment (not printed Q1(i)); History printed Q10 has no standalone canonical ID and remains unadmitted. Geography 2024 exact q01ii points to printed iii/iv; English 2024 printed ix lacks a standalone canonical ID. No canonical repair or invented ID. These remain outside all selectable records. All other unadmitted corpus records are outside coverage; this dashboard does not claim they passed or failed source review.

## Validation and recovery

Checks actually executed: 33 unit/static, 604 beta browser, 95 root browser and 71 live checks passed. [CI](https://github.com/MsofeCoder/necta-rescue-pilot/actions/runs/39012986944). [Pages](https://github.com/MsofeCoder/necta-rescue-pilot/actions/runs/39012986782). Public asset hashes compared to the deployment; accepted root thirteen files/fourteen-card app unchanged. Both storage keys, historical/hidden progress, combined/legacy backups and offline beta reuse preserved. Evidence/limitations: .workbuddy-ai/batch15-live/report.json, published asset fingerprints and screenshots; necta-rescue-beta-v15 to necta-rescue-beta-v16 upgrade tested on controlled local origin and CI, actual public fresh-profile offline/progress/backup checks; Android NOT TESTED..

Rollback baseline: `05cf730697b3255b513f663b672bda7bc4ba5a29`. Revert implementation merge `72eb5ac15e772938ca4316b8f4d7e8ef20c866f9` with first parent through reviewed PR; use a **new cache generation** in worker and readiness checks, never reuse an old generation. Preserve storage and backups; accepted root fallback remains available.

Human academic approval: **PENDING**. Physical Android: **NOT TESTED**, device testing excluded by the owner for this delivery window. [Five-minute checklist](ANDROID_5_MINUTE_CHECK.md) retained; emulation does not pass it. Release policy and emergency-beta restrictions unchanged.

## Exact restart checkpoint

Next: admit the three original Civics 2024 Q1(ii)–(iv) question-only candidates after per-record answer-state routing; preserve all holds and both storage keys.

Use the deployed SHA above as the content baseline, inspect git status before proceeding and retain unrelated review/staging files. Do not repeat admitted IDs. Use beta-current-release.json for the current bounded batch, its immutable ledger and test expectations; advance the cache, run all required suites, publish only under the exception, verify the public bytes/counts, then update this checkpoint. No overall completion percentage is inferred.
