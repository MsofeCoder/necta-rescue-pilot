# Phase D — Civics content expansion

Development candidate, 16 October 2026. **No merge or deployment authorized or performed.** Production baseline: `79044ec5fce9e52baaaff4e3764ea569c5025e82` (merged PR #4). Development baseline: `fb6195c70c82fa87ac57f57ded13c58e0ab1dd88`; the production merge added no content changes. Branch: `feature/civics-content-expansion`, target: `develop`. Dashboard PR #2 remains separate.

## Outcome

- **14 existing cards audited and retained:** seven originals and seven authored democracy variations. No content correction was required. All prior IDs, questions, answers, options, explanations, styles and source objects are unchanged; regression compares them with the released Git file.
- **18 additions accepted for development review:** eight source-checked originals and ten independently authored revision cards. Total: **32 cards, 10 topics, 15 originals and 17 authored cards**. Phase D owner approval is pending.
- **Four newly inspected candidates withheld**, alongside the two previously held contradictory items. This bounded selection does not certify the entire corpus.
- Every card has short bullets, an explanation, command guidance and advice for differently worded questions. Answers, explanations and transfer advice remain concealed until Show Answer.
- Source attribution now uses the actual year and displays the review note, including shifted solution numbering. Authored cards link their concept exam and supplied solution. Practice options explain Define, State, Mention, Explain and Discuss.
- Topic navigation, Understood / Revise Again, difficult-card filtering and paper practice remain available. Offline generation is v7. Storage keys, schemas and origin are unchanged.

## Existing-card audit

The [14-entry audit](phase-d-existing-audit.json) records wording, intended concept, answer accuracy, explanation, command response, provenance and classification separately for every card. The [starter ledger](civics-starter-ledger.json), [earlier academic cross-check](ACADEMIC_CROSSCHECK.md) and [original owner acceptance](RELEASE_ACCEPTANCE.json) remain unchanged. Old approval does not approve Phase D publication.

Page numbers below are **one-based PDF pages**.

| Existing card | Kind | Exam / solution pages | Audit decision |
| --- | --- | --- | --- |
| 2025 Q1(i), rights | Original MCQ | 2 / 2 | Retain E, complete rights category |
| 2025 Q1(iii), imports exceed exports | Original MCQ | 2 / 2–3 | Retain B, trade deficit |
| 2025 Q1(iv), charisma | Original MCQ | 2 / 3 | Retain C, inspiration |
| 2025 Q1(vi), assembly | Original MCQ | 2 / 4 | Retain B, pure/direct democracy |
| 2025 Q1(ix), comparing living conditions | Original MCQ | 3 / 5 | Retain A, relative poverty |
| 2025 Q1(x), human resources | Original MCQ | 3 / 6 | Retain C, population |
| 2025 Q3, career development | Original written | 4 / 7–8 | Retain six explanatory benefits |
| concept-democracy-define | Authored | Parent Q1(vi), 2 / 4 | Clear meaning |
| concept-democracy-state | Authored | Same parent | Two concise features |
| concept-democracy-mention | Authored | Same parent | Names the requested assembly example |
| concept-democracy-explain | Authored | Same parent | Links participation to concept |
| concept-democracy-describe | Authored | Same parent | Who participates and what happens; no invented procedure |
| concept-democracy-reasons | Authored | Same parent | Two linked reasons |
| concept-democracy-discuss | Authored | Same parent | Supported explanation and stated information limit |

## New originals and page evidence

The [18-entry Phase D ledger](phase-d-ledger.json) separates raw pipeline text, source transcription, display text, answer adaptations, command guidance and independent reasoning. It includes source URLs, SHA-256 hashes and exact answer-page locators. Complete selected exam and solution pages were rendered and visually checked alongside text extraction using the PDF workflow. No original PDF is redistributed.

TETEA-hosted supplied solutions are **not official NECTA marking schemes**. The 2025 file credits Maria Marco; individual authors are not identified in the supplied 2022/2023 files.

| New original ID | Topic / answer | Exam PDF page | Solution PDF page | Source handling |
| --- | --- | --- | --- | --- |
| civics-2023-p1-q01iv | Economy; D, vicious circle of poverty | 2 | 2 | All five printed alternatives restored; persistence is not inevitable |
| civics-2023-p1-q01viii | Culture; C, performing art | 3 | 3 | Solution labels stem (ix); full stem/options matched. Printed “Peforming” retained and explained |
| civics-2023-p1-q01ix | Public property; C, maintenance | 3 | 3 | Solution labels stem (x); full stem/options and key matched |
| civics-2022-p1-q05 | Road safety; five reasons | 4 | 5–6 | Printed grammar retained; five supplied reasons adapted |
| civics-2022-p1-q07 | Development; explain five factors | 4 | 6 | OCR “Tanzani1a” corrected against print; causal explanations |
| civics-2022-p1-q13 | Leadership; five qualities | 5 | 8–9 | Integrity, service, unity, empathy, vision; Section C response guidance |
| civics-2025-p1-q07 | Road safety; six advantages | 4 | 10 | Previously held record now independently reviewed; six adapted bullets |
| civics-2023-p1-q08a | Life skills; four benefits | 6 | 8 | OCR “chailenges” corrected; benefits distinguished from steps |

Direct source files: [2022 exam](https://maktaba.tetea.org/past-papers/csee/civics/Civics-F4-2022.pdf), [2022 solutions](https://maktaba.tetea.org/past-papers/csee/civics/solutions/Civics-F4-2022-Solutions.pdf), [2023 exam](https://maktaba.tetea.org/past-papers/csee/civics/Civics-F4-2023.pdf), [2023 solutions](https://maktaba.tetea.org/past-papers/csee/civics/solutions/Civics-F4-2023-Solutions.pdf), [2025 exam](https://maktaba.tetea.org/past-papers/csee/civics/Civics-F4-2025.pdf), [2025 solutions](https://maktaba.tetea.org/past-papers/csee/civics/solutions/Civics-F4-2025-Solutions.pdf).

Repeated knowledge is directly evidenced by road-sign benefits in **2022 Q5 and 2025 Q7**, with five versus six requested points. Maintenance appears in 2023 Q1(ix) and the still-held 2025 Q1(v); its faulty key is not repaired by analogy. Leadership moves from 2022 qualities to 2025 identification of charisma. These patterns do not predict a future exam.

## New authored cards

Each prompt is independently authored, explicitly labelled and carries no examination marks. Hypothetical numbers and requested counts belong to the practice prompt only.

| ID | Command / focus | Concept parent; exam / solution pages |
| --- | --- | --- |
| concept-rights-state | State two economic/social rights | 2025 Q1(i); 2 / 2 |
| concept-trade-deficit-define | Define deficit | 2025 Q1(iii); 2 / 2–3 |
| concept-trade-deficit-explain | Explain authored 80/50-unit example | Same parent |
| concept-population-explain | Explain human resources | 2025 Q1(x); 3 / 6 |
| concept-careers-state | State two individual benefits | 2025 Q3; 4 / 7–8 |
| concept-rational-decision-define | Define rational decision | 2023 Q8(a); 6 / 8 |
| concept-rational-decision-explain | Explain use of limited study time | Same parent |
| concept-maintenance-explain | Explain extended useful life | 2023 Q1(ix); 3 / 3 |
| concept-leadership-discuss | Discuss inspiration’s value and limits | 2022 Q13; 5 / 8–9 |
| concept-performing-arts-mention | Mention two examples | 2023 Q1(viii); 3 / 3 |

Conceptual cross-checks supplement supplied solutions. [TIE Civics Form One (2021)](https://fliphtml5.com/rwbnv/ewmp/Civics_Form_One/), printed pp99–102, supports information, alternatives and reasoning in decisions; p113 supports road-sign safety and discipline. [TIE Civics Form Three (2022)](https://fliphtml5.com/rwbnv/fxub/Civics_Form_Three/), chapter one’s leadership qualities and printed pp37–40 on development, support integrity, planning and the roles of skills, capital and technology. These checks do not claim official marks. Existing concepts retain their separately linked primary-source cross-checks. No textbook is bundled.

## Exclusions and corrections

The [held ledger](phase-d-held.json) includes four newly inspected candidates: 2023 Q1(ii) mandatory signs (supplied D contradicts the concept), 2022 Q1(vi) negotiation (aligned solution missing), 2023 Q1(i) official seal (supplied A contradicts the item), and 2023 Q1(v) political threat (supplied A does not answer the threat). Prior holds 2025 Q1(v) and Q1(viii) remain. These six explicit holds do not count all unreviewed corpus records. No dependants of held items are bundled.

[Separate corrections](phase-d-corrections.json) document restored OCR choices, spelling corrections checked against print and shifted solution numbering. The historical 14-card evidence is preserved. The five canonical JSONL files and twelve 2020–2025 Civics PDFs are unchanged: [17 fingerprints](phase-d-source-fingerprints.json). Apart from newly accepted Q7, the other 22 Civics 2025 extraction records remain excluded; that includes stubs/nested records, not 22 distinct questions.

## QA and progress compatibility

| Check | Final local result |
| --- | --- |
| Node unit/static/worker tests | 27 passed, 0 failed |
| Chrome 155.0.8059.84 | 356 passed, 0 failed; [report](phase-d-chrome-results.json) |
| Edge 155.0.4283.45 | 356 passed, 0 failed; [report](phase-d-edge-results.json) |
| Existing paper-practice regression | 59 passed, 0 failed; [report](phase-d-legacy-results.json) |
| Source preservation | 17/17 fingerprints unchanged |
| JavaScript exceptions / automatic third-party requests | 0 / 0 in both full browser runs |
| Fresh physical Android | Pending; `adb devices` returned no connected devices |
| iOS / home-screen installation | Not tested in Phase D |

**798 local assertions passed, zero failed** (27 + 356 + 356 + 59). Both full browser suites check every card’s prompt, exact displayed answer, explanation, transfer guidance, concealment and source identity/date, plus complete MCQs, review gates, dependant exclusion, navigation and filters. Every card fits **320, 360 and 390 CSS px** without horizontal overflow. Keyboard Enter, focus movement and accessibility-tree hide/reveal checks passed; this does not certify every assistive technology.

Upgrade tests create a real note and download a backup in the earlier v2 pilot, load the actual released v6 starter, save a real self-check, then upgrade to v7. **Both localStorage keys survive byte-for-byte.** IDs, states and backup formats remain compatible. New-card saving and a real combined-backup round trip preserve old and unknown future IDs. Malformed backups, corrupt/full storage, two-key rollback and valid backups above the former 3 MB limit are covered.

Offline tests disable browser networking **and stop the server**, then reload and reveal every one of the 32 answers. All 12 explicit cache entries exist. Raw/private paths return 404 and are never cached. Incomplete installation cannot activate or purge the last good bundle. The original regression verifies notes, local PDFs, timer, backups and mobile paper practice.

Reports identify exact public-file hashes; packaging refuses content changed since testing and contains only the 13 allowed public files. Packaging does not publish. All test progress is synthetic in isolated profiles; no real student storage was accessed. No migration runs against student data.

## Mobile screenshots

Fresh, visually inspected **emulated** captures; these do not replace physical-device acceptance.

- [Topics, 390px](screenshots/phase-d/topics-390.png)
- [Hidden answer, 360px](screenshots/phase-d/road-question-360.png) · [390px](screenshots/phase-d/road-question-390.png)
- [Revealed answer and transfer guidance, 360px](screenshots/phase-d/road-answer-360.png) · [390px](screenshots/phase-d/road-answer-390.png)
- [Authored life-skills card](screenshots/phase-d/life-skills-390.png)
- [Offline revision](screenshots/phase-d/offline-390.png)

## Exact release approval required

The live site stays on `main` `/docs`, with 14 cards. **Do not merge this development PR without separate approval.** Fresh physical Android reading/touch/persistence/offline acceptance remains required by the release policy. Re-run exact-candidate CI if public files change.

After remaining checks, the owner must **accept the 32-card Phase D collection (14 retained, eight new originals, ten new authored cards) and recorded corrections; authorize merging the feature PR into `develop`; then review and separately authorize the `develop` → `main` release PR and GitHub Pages publication.** No human subject-expert certification is claimed. Keep dashboard PR #2 excluded. Rollback target: `79044ec`; preserve both storage keys during any reviewed revert.
