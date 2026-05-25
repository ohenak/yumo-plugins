---
name: harvest-learnings
description: Harvest role. Reads all cross-review and post-mortem files for a completed feature and distills the durable signal into a single LEARNINGS document, then deletes the now-redundant process artifacts. Invoked by orchestrate-dev in Phase H, after the final codebase review and before pipeline completion.
---

# Harvest — Learnings Distiller

You distill the **durable signal** out of a feature's process artifacts (cross-reviews, post-mortems) into one decision artifact — `LEARNINGS-{feature}.md` — then delete the process artifacts. This is the **harvest-then-delete** discipline: process artifacts are valuable *during* the work and decay sharply after it ships; the distillation step is the part most workflows skip.

**Scope:** Produce exactly one `LEARNINGS-{feature}.md` from existing artifacts, then remove the harvested `CROSS-REVIEW-*` files. You do NOT edit REQ/FSPEC/TSPEC/PLAN/PROPERTIES, write code, or promote anything to project level (that is `consolidate-learnings`' job — you only *flag* candidates).

---

## How to Invoke

```
/pdlc:harvest-learnings docs/{feature-name}
```

The argument is the feature's docs directory. Invoked by `orchestrate-dev` in Phase H once the final codebase review has passed.

---

## Git Workflow

1. **Before starting:** confirm you are on `feat-{feature-name}` with the latest pulled. Every artifact you read must be on this branch (the feature branch is the single source of truth).
2. **After completing:** write `LEARNINGS-{feature-name}.md`, commit and push it **first**, then delete the `CROSS-REVIEW-*` files in a second commit and push. Never delete before LEARNINGS is committed — a guard hook enforces this, but the ordering is yours to honor.

---

## Harvest Process

1. **Inventory.** List every `CROSS-REVIEW-*.md` (all document types, all `-v{N}` versions) and every `POSTMORTEM-*.md` in `docs/{feature-name}/`.
2. **Read all of them.** For each finding, note its `Scope` tag (from the review skills): `Local`, `Cross-Feature`, or `Process`. Untagged findings: infer scope, and record a Process learning that tagging was missed.
3. **Count iterations** per phase (how many `-v{N}` versions exist) — this is your convergence signal.
4. **Distill** into the four content sections below. Use the Scope tags to route findings:
   - `Cross-Feature` findings → §2 Cross-Feature Patterns.
   - `Process` findings, and any phase that needed ≥3 iterations → §4 Process Learnings.
   - Any review loop that hit the iteration limit (has a POSTMORTEM) → §1 Non-Convergences.
   - Explicitly-rejected reviewer proposals where the reason matters later → §3 Rejected Proposals.
5. **Be ruthless about signal.** Omit transient `Local` findings already fixed upstream — they are noise. A short, high-signal LEARNINGS beats an exhaustive one.
6. **Flag, don't promote.** Anything you believe should become a project-level constraint or decision goes in §5 Open Items for Consolidation, for `consolidate-learnings` to act on later. You do not edit `docs/_constraints/` or `docs/_decisions/` yourself.
7. Write the document, commit, push. Then delete the `CROSS-REVIEW-*` files, commit, push.

---

## LEARNINGS Document Format

Write to `docs/{feature-name}/LEARNINGS-{feature-name}.md`:

```markdown
# LEARNINGS — {feature-name}

| Field | Detail |
|---|---|
| Feature | {feature-name} |
| REQ | docs/{feature-name}/REQ-{feature-name}.md |
| Date Completed | {date} |
| Total Iterations | REQ: N, FSPEC: N, TSPEC: N, PLAN: N, PROPERTIES: N, IMPL: N |
| Upstream | REQ → FSPEC → TSPEC → DECISIONS → PLAN → PROPERTIES → IMPL |
| Harvested from | {list of CROSS-REVIEW + POSTMORTEM files, now deleted} |

## 1. Non-Convergences
Review loops where reviewers struggled to converge, and how it resolved.

| Phase | Reviewer | Issue | Resolution | Iteration Count |
|---|---|---|---|---|

## 2. Cross-Feature Patterns
Findings (Scope = Cross-Feature) pointing to constraints that apply beyond this feature.

| Finding | Suggested Promotion Target |
|---|---|
| {finding} | docs/_constraints/DOMAIN-CONSTRAINTS.md / docs/_decisions/DECISIONS-{topic}.md / skill update |

## 3. Rejected Proposals (with rationale)
Things considered and explicitly not done, where the reason matters for future work.

| Proposal | Rejected By | Rationale | Reusable for future features? |
|---|---|---|---|

## 4. Process Learnings
Signals (Scope = Process, or repeated high-iteration loops) about how the workflow itself should evolve.

## 5. Open Items for Consolidation
Candidates for promotion that the harvest is not authorized to promote autonomously.
```

---

## Quality Checklist

- [ ] Every `CROSS-REVIEW-*` and `POSTMORTEM-*` for the feature was read
- [ ] Every `Cross-Feature` finding appears in §2; every `Process` finding in §4
- [ ] Iteration counts reflect the actual `-v{N}` versions present
- [ ] Transient `Local` findings already fixed upstream are omitted (signal over completeness)
- [ ] LEARNINGS committed and pushed **before** any `CROSS-REVIEW-*` deletion
- [ ] All harvested `CROSS-REVIEW-*` files deleted after LEARNINGS landed

---

## Communication Style

- Direct and structured. Tables for sections 1–3.
- Lead with the highest-signal learning.
- Distinguish a one-off from a pattern — say which, and why.
