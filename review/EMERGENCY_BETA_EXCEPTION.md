# Emergency beta — isolated provisional preview

Owner directive, 16 October 2026: autonomous emergency delivery targeted for 17 October Tanzania time; build all eight subject entry points and publish a clearly labelled beta where existing hosting permits. This directive explicitly permits a provisional preview before human academic review or physical Android acceptance, with deviations recorded. It does not make those checks pass.

## Scope of exception

The existing Pages source remains `main /docs`. This separate preview PR adds `docs/beta/` while preserving every byte of the thirteen accepted root public files at `79044ec5fce9e52baaaff4e3764ea569c5025e82`. Root worker, fourteen-card app, backups and rollback baseline remain unchanged. It does not promote the 32-card development app to production. The isolated beta uses its own worker scope and cache prefix, deleting only its own older cache generations. No PDF, page image, raw JSONL or private manifest is distributed.

Unlike an accepted production release, the beta is explicitly provisional: human academic acceptance and physical Android remain PENDING. Engineering review is Codex self-review, not independent certification. Publication follows a reviewed PR into main under this specific emergency preview exception; no silent policy rewrite or claim of full acceptance. RELEASE_POLICY.md remains unchanged.

## Actual usable coverage

Eight subject entry points, 64 original exam-paper references spanning 2020–2025, thirty provisional Civics cards from exact corrected baseline `8140fc5c9b0e0c46a3d4a15a234979b196b605f0`, and fourteen source-page-checked question-only items. Seven other subjects have two checked questions each: Kiswahili, English, Geography, History, Literature in English and Biology (2025), Basic Mathematics (2023). Other years offer source-reference practice only, not checked in-app question/answer coverage.

The fourteen-question batch is recorded separately in emergency-beta-question-ledger.json: original canonical IDs and pipeline text, printed references, display copies, source URLs/pages/hashes and inspected-render hashes. Rendered originals were visually inspected. OCR/list spillover is removed in these display copies only. No canonical source record is repaired. No marks, missing diagrams or answers are invented; the chosen questions require no omitted diagram/table/passage. The Literature subquestion retains its printed parent instruction. The Basic Mathematics records remain subquestions of their original parent, with no invented numbering.

No new checked answers outside the prior bounded Civics evidence are offered. Pipeline-verified associations, provisional/ambiguous associations and missing answers have distinct visible notices, with no answer reveal. Raw-paper links do not certify educational answers. Supplied TETEA solutions are educational sources, not official NECTA marking schemes.

C-02/C-08 are absent from the beta's selectable cards and answer data, marked PENDING HUMAN REVIEW. Their originals, historical acceptance and saved progress stay intact. Thirty Civics cards = fifteen originals + fifteen authored variants; no claim of human approval. C-03 unchanged. Six source-conflict holds and their dependants remain excluded. The 14 new practice records comprise nine parent questions and five subquestions; together with the fifteen original Civics cards, this does not imply complete papers or full eight-subject coverage.

## Student data and rollback

Same-origin storage retains both existing keys and v1 combined backup/recovery formats. Saves read and merge validated progress, preserving hidden/unknown IDs. Malformed/full storage fails visibly. Combined backup export/import uses established validation, explicit user confirmation and two-key rollback; no private student data was exported in testing, only synthetic records in isolated profiles. New academic caution does not erase old progress.

Rollback this preview by a reviewed revert of its PR commit, preserving root public files and learner storage. Never clear browser data. The accepted root app remains usable throughout. External PDF references require internet; only explicit beta assets cache offline. Local/browser tests are not real-device acceptance.
