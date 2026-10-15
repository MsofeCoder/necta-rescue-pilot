# Release policy: source-first safety

Production: `main` publishes `docs/` on GitHub Pages. Development: `develop` or `feature/...`, via PR and user approval. No direct unreviewed change to `main`.

Publication of original PDFs requires verified permission; otherwise provide source attribution and user-side document selection. No student identifiers, medical or personal histories, private manifests or Windows paths, API tokens, passwords, or raw private files committed to the public repo.

Question/answer data remain excluded until each candidate has source-page evidence, complete question hierarchy and options, independently checked answer-source alignment, and an explicit decision in the review ledger. `pipeline-verified` does not mean answer correct. Civics 2025, English 2024, Kiswahili 2025, and Geography 2025 remain quarantined at paper level based on the supplied reports.

Before release: test subject/year selectors, local PDF view/new-tab fallback, attempt logging, status stats, timer, local backup export, restore, reload persistence, mobile 360px view, and app loading on GitHub Pages subpath; verify no third-party analytics/network calls and no unintended PDF uploads. Each PR must document changes, test evidence and rollback commit SHA. Keep content change history versioned. Re-test saved browser progress on new releases; backup before introducing changes to storage schema or domain.
