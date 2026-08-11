---
name: consolidate-learnings
description: Consolidation ritual. Reads every feature-level LEARNINGS file produced since the last pass and promotes recurring patterns into project-level DOMAIN-CONSTRAINTS and DECISIONS, and proposes (never auto-commits) updates to skill prompts. Fires on cadence or corpus volume, and on demand. A human approves every promotion.
---

# consolidate-learnings — Pointer/Contract

This skill delegates to a workflow script. It does not run the pass itself.

The pass is performed in code by `pdlc/workflows/consolidate-learnings.js` (shipped as
`pdlc/workflows/dist/consolidate-learnings.bundle.js`). Everything below is the **contract that
module implements** — a description of what it does, not a runbook for you to execute. Performing
the pass by hand bypasses the machinery this skill exists to drive: the `.consolidation-log.md`
boundary, deterministic `failure-mode-id` derivation (AC-5.1), NFR-4 duplicate suppression, the
AC-3.1 guard-set PR route, and the AC-1.3 in-progress marker.

**Scope:** Read LEARNINGS files; promote durable patterns into `docs/_constraints/` and `docs/_decisions/`; propose skill-prompt changes as a reviewable artifact. The pass does NOT autonomously edit skill files, and does NOT promote a signal seen in only one feature unless it is unambiguously a standing constraint.

**Cadence:** the pass is *not* manual-only. It fires on three occasions, and the workflow decides which applies before you are asked to do anything:

- **Elapsed interval** — `consolidation.cadenceHours` has passed since the last recorded pass, with no per-pass operator invocation (AC-1.1).
- **Corpus volume** — un-consolidated LEARNINGS reach `consolidation.volumeThreshold`, even if `cadenceHours` has not elapsed (AC-1.2).
- **On demand** — an operator sets the `direct` input, which bypasses both gates (AC-1.1's final clause).

A `SessionStart` nudge hook additionally reminds when un-consolidated LEARNINGS accumulate.

---

## Invocation Contract

```
/pdlc:consolidate-learnings
```

No positional argument — the pass operates across the whole repo's `docs/`. One optional input:

| Input | Type | Default | Effect |
|---|---|---|---|
| `direct` | boolean | `false` | Run unconditionally, bypassing the cadence and volume triggers. A bare invocation is cadence-gated. |

---

## Git Workflow

**The pass does not create, check out, or switch a branch, and does not open a PR for the promotions themselves.** It writes in the **invoking tree, on whatever branch it is already on** (AC-3.8, AC-3.8b) — changing the branch is forbidden.

1. **Before starting:** nothing. The writes already belong where the tree is.
2. **After completing:** the promoted constraints/decisions, the proposal artifact, and the updated log are committed with a **pathspec-scoped** commit naming exactly those files (never `git commit -a`). If a commit is not possible, the writes are left in the working tree — the run reports `writes-uncommitted`, which is an honest outcome, not a failure to hide.

Skill-prompt changes remain proposals for a human to apply — the pass never applies them itself.

---

## Consolidation Process

1. **Find the boundary.** Read `docs/_decisions/.consolidation-log.md` (create it if absent). A LEARNINGS file is in scope when its basename is un-consolidated per the block/legacy predicate (`docs/_constraints/pdlc-consolidation-vocabularies.md` §3).
2. **Read them all.** It collects §2 Cross-Feature Patterns, §4 Process Learnings, and §5 Open Items from each.
3. **Cluster.** Items pointing at the same underlying concern across features are grouped.
4. **Distinguish pattern from coincidence.** Two features mentioning the same concern *might* be a pattern or *might* be coincidence. Only a durable signal is promoted: it recurs across ≥2 unrelated features, **or** a single occurrence states a standing invariant (security, data integrity, regulatory) that obviously generalizes. Otherwise the item is left in the proposal for a human to judge — not promoted.
5. **Route each promoted item:**
   - Domain invariant future REQs must respect → append to `docs/_constraints/DOMAIN-CONSTRAINTS.md` (read by `pm-author`).
   - Architectural decision now project-level → `docs/_decisions/DECISIONS-{topic}.md` (read by `se-author`; {topic} = failure-mode-id for a consolidation-promoted pattern).
   - Process learning about a skill prompt / review checklist / workflow phase → **proposed**, never applied (next section).
6. **Record the pass** in `.consolidation-log.md`: date, which LEARNINGS files were consumed, what was promoted, what was deferred.

---

## Skill-Update Proposals (human-in-the-loop)

When a learning says a skill prompt itself should change, the pass does **not** edit the skill. It writes `docs/_decisions/CONSOLIDATION-PROPOSAL-{passId}.md`, where `passId` is `{YYYY-MM-DD}-{n}` — the per-day ordinal keeps two same-day passes from colliding:

```markdown
# CONSOLIDATION-PROPOSAL-{passId}

| Source LEARNINGS | Target skill | Proposed change | Rationale |
|---|---|---|---|
| {features} | pdlc/skills/{skill}/SKILL.md | {concrete edit} | {why, and the pattern that motivates it} |
```

A human reviews and applies (or rejects) each row. This is deliberate: agents proposing changes to the prompts that govern agents must pass through human judgment.

---

## Output Formats

`docs/_constraints/DOMAIN-CONSTRAINTS.md` entries:

```markdown
## DC-{NN}: {Constraint title}
**Constraint:** {what must hold for all future features in this domain}
**Origin:** promoted {date} from LEARNINGS of {features}
**Applies to:** {REQ authoring / TSPEC / testing / all}
```

`docs/_decisions/DECISIONS-{topic}.md` reuses the per-feature DECISIONS format (`DEC-{topic}-{NN}`), with an **Origin** line citing the source features.

---

## Reading the Result

The pass reports against the vocabularies in `docs/_constraints/pdlc-consolidation-vocabularies.md` §1. When reading a run report, the load-bearing rows are:

- Which LEARNINGS files the boundary admitted, and which it did not.
- What cleared the pattern-vs-coincidence bar, and what was deferred with a reason.
- Where each promotion landed — a PR URL (AC-3.4) or the proposal-file fallback (AC-3.5).
- The open-promotion count over the whole log, not just this pass (FSPEC §10.4, item 10).

---

## Communication Style

- Lead with what was promoted and why it cleared the pattern-vs-coincidence bar.
- Be explicit about what was deferred and what a human needs to decide.
- Tables for promotions and proposals.
