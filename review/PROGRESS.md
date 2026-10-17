# NECTA Rescue delivery progress

Verified student beta: [open provisional beta](https://msofecoder.github.io/necta-rescue-pilot/beta/).

Content deployment: `05cf730697b3255b513f663b672bda7bc4ba5a29`; implementation review head: `4b7a403bef9352879559569041b229bb661098c0`. [Release PR](https://github.com/MsofeCoder/necta-rescue-pilot/pull/23). Verified 2026-10-17T07:12:52.863Z. Later repository-only checkpoint commits do not change the student bundle.

94 live items = 64 source-checked question-only + 30 provisional Civics. Question-only: 19 original parent/top-level and 45 original subquestion records. Civics originals: 5 parent/top-level and 10 subquestion records; 15 separately labelled authored variations. Prior bounded source/editorial answer review supports 30 provisional Civics cards; **zero independent human academic acceptances are claimed**. No new answers generated.

## Actual in-app subject/year coverage

Cells: Q = source-checked question-only; C = original Civics with prior bounded answer review; A = authored variation. Zero means original-paper references only, not checked in-app content. All eight subjects retain paper references across 2020–2025 (64 papers). A subset is not a complete paper.

| Subject | 2020 | 2021 | 2022 | 2023 | 2024 | 2025 |
| --- | --- | --- | --- | --- | --- | --- |
| Kiswahili | 0 Q | 0 Q | 0 Q | 0 Q | 2 Q | 10 Q |
| English | 0 Q | 0 Q | 0 Q | 0 Q | 3 Q | 8 Q |
| Civics | 0 C + 0 A | 0 C + 0 A | 3 C + 1 A | 4 C + 4 A | 0 C + 0 A | 8 C + 10 A |
| Geography | 0 Q | 0 Q | 0 Q | 0 Q | 2 Q | 11 Q |
| History | 0 Q | 0 Q | 0 Q | 0 Q | 5 Q | 6 Q |
| Literature in English | 0 Q | 0 Q | 0 Q | 0 Q | 6 Q | 7 Q |
| Biology | 0 Q | 0 Q | 0 Q | 0 Q | 0 Q | 2 Q |
| Basic Mathematics | 0 Q | 0 Q | 0 Q | 2 Q | 0 Q | 0 Q |

## Answer state and held evidence

All 64 Q records have unavailable educational answers, regardless of association state. Association counts: missing_answer = 4; pipeline_verified = 15; provisional_or_ambiguous = 45. Pipeline verification is not academic correctness. Missing/provisional associations are not missing student progress.

C-02/C-08 remain withheld pending human review: concept-democracy-state, concept-democracy-reasons. Six original Civics conflicts remain withheld:

- civics-2023-p1-q01ii: Supplied key D describes directions to a location, while the mandatory-sign stem calls for what users must do (printed B). Withhold rather than silently replacing the key. Printed “future” also requires transcription review.
- civics-2022-p1-q01vi: The complete negotiation scenario is printed in the exam, but the supplied solution omits it and labels a different culture stem (vi). No verified supplied answer alignment; candidate excluded.
- civics-2023-p1-q01i: Printed question asks for the government’s official seal and badge (Coat of Arms, D); supplied answer A is the Uhuru Torch. Contradiction unresolved; excluded.
- civics-2023-p1-q01v: Political-threat stem asks about sovereignty; supplied A describes investment inflows instead of the listed sovereignty risk. Contradiction unresolved; excluded.
- civics-2025-p1-q01v: Prior hold retained: stem asks for a challenge avoided; supplied D gives increased lifespan and beauty, which are benefits. A checked 2023 maintenance item does not repair or approve this source.
- civics-2025-p1-q01viii: Prior hold retained: source scenario and supplied explanation do not establish a unique reliable cause among the options. No inferred replacement key or medical claim is released.

English exact q01iii/q01iv remain withheld for printed/canonical parent conflicts. Additional findings: Kiswahili exact q01i is a matching fragment (not printed Q1(i)); History printed Q10 has no standalone canonical ID and remains unadmitted. No canonical repair or invented ID. These remain outside all selectable records. All other unadmitted corpus records are outside coverage; this dashboard does not claim they passed or failed source review.

## Validation and recovery

Checks actually executed: 33 unit/static, 552 beta browser, 95 root browser and 54 live checks passed. [CI](https://github.com/MsofeCoder/necta-rescue-pilot/actions/runs/39012736544). [Pages](https://github.com/MsofeCoder/necta-rescue-pilot/actions/runs/39012736211). Public asset hashes compared to the deployment; accepted root thirteen files/fourteen-card app unchanged. Both storage keys, historical/hidden progress, combined/legacy backups and offline beta reuse preserved. Evidence/limitations: .workbuddy-ai/batch14-live/report.json, published asset fingerprints and screenshots; necta-rescue-beta-v14 to necta-rescue-beta-v15 upgrade tested on controlled local origin and CI, actual public fresh-profile offline/progress/backup checks; Android NOT TESTED..

Rollback baseline: `1b158b0669bd21c8713e3dadf1a9ff439bf83778`. Revert implementation merge `05cf730697b3255b513f663b672bda7bc4ba5a29` with first parent through reviewed PR; use a **new cache generation** in worker and readiness checks, never reuse an old generation. Preserve storage and backups; accepted root fallback remains available.

Human academic approval: **PENDING**. Physical Android: **NOT TESTED**, no connected ADB device. [Five-minute checklist](ANDROID_5_MINUTE_CHECK.md) retained; emulation does not pass it. Release policy and emergency-beta restrictions unchanged.

## Exact restart checkpoint

Urgent window until 2026-10-17 13:08 Africa/Dar_es_Salaam. Do not perform human verification or phone tests. Next batch15: seven source-checked records from Literature2024 p4, English2024 p2, Geography2025 p3; spec .workbuddy-ai/batch15.json. Fix stale beta homepage summary26 with dynamic eligible counts and add home-summary assertions before next release. Then add Civics2024 question-only support/records in a separate bounded change; sources p2 already inspected.

Use the deployed SHA above as the content baseline, inspect git status before proceeding and retain unrelated review/staging files. Do not repeat admitted IDs. Use beta-current-release.json for the current bounded batch, its immutable ledger and test expectations; advance the cache, run all required suites, publish only under the exception, verify the public bytes/counts, then update this checkpoint. No overall completion percentage is inferred.
