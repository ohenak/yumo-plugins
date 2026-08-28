# Agent B — dispatch-cost / prompt-size / redundancy map (orchestrate-dev.js 17,460 lines)

## Dispatch model
- Per review round: 2 reviewers (parallel) + 1 optimizer on any FAIL. MAX_REVIEW_ROUNDS=5/invocation, MAX_LIFETIME_ROUNDS=15/doc.
- Best case (round-1 double PASS): 2 dispatches/phase + 1 creator where a doc is authored.
- Best-case end-to-end ≈ 22–24 dispatches BEFORE Phase I fan-out (R:2, F:3, T+D:3–7, P:3, PR:3, PT:1, CR:2, DOD:1, H:1, PUB:1–2, MERGE:0).
- Each extra review round: +2–3 dispatches. Each erratum item batch: +3–4 (author + 2 confirmers + land-proof retry).
- TSPEC+DECISIONS folded into one session BUT keeps two docType round windows ⇒ up to 2× review cost (deliberate: deriveRoundWindow per-docType invariant).

## Prompt payload per dispatch
basePrompt (role template, NOT the SKILL.md body — that loads once per skill) + groundingClause (1–3 lines) + ORACLE_QUALITY_CLAUSE + ERRATUM_PROTOCOL_CLAUSE + PACING_CONTRACT_CLAUSE (fixed boilerplate each round) + opener (resumeClause can carry the ENTIRE current document) + learningsBlock (authoring only, ≤20KB: 5 docs × 6KB, 20KB total cap).
Dominant repeated payloads: full-document opener on resume; 20KB learnings suffix per authoring dispatch; fixed clause boilerplate every reviewer round.

## Redundancy
- CR and DoD: two fully separate dispatch chains over the same shipped diff, adjacent lenses (pm/te review vs stub/mock/coverage scan), no shared read.
- Delta-scoped round-2+ review ALREADY EXISTS (REVIEW_CONVERGENCE_CLAUSE + git-diff instruction; High-only bar); erratum confirm is already "answer one question". Remaining redundancy is structural, not prompt-content.
- PT exists in two code paths (legacy worktree vs V-wave) — mutually exclusive at runtime.
- Land-proof retry is deliberate redundancy (catches confirmer-PASS-without-token-landing).

## Existing knobs (no code change)
PHASE_DOD_ENABLED(:27), PHASE_H_ENABLED(:24), MODEL_DEFAULT="opus"(:1872), MODEL_IMPLEMENTATION="sonnet"(:1966), MODEL_QUEUE="sonnet", reviewer sets in PHASE_DISPATCH(:5142), round caps, mergeMode, learningsInjection budgets, forcePhases.

## SKILL.md composition
Reviewer/author SKILLs 279–331 lines each; ~45–55% shared procedural boilerplate (Git Workflow, Review Process, Delta Re-Review, erratum sections, file formats, verdict contract); role judgment concentrated in one "Review Scope" block per file.
