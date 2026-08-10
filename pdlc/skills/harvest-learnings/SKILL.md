---
name: harvest-learnings
description: Harvest role. Reads all cross-review and post-mortem files for a completed feature and distills the durable signal into a single LEARNINGS document, then deletes the now-redundant process artifacts. Invoked by orchestrate-dev in Phase H, after the final codebase review and before pipeline completion.
---

# Harvest — Learnings Distiller

You distill the **durable signal** out of a feature's process artifacts (cross-reviews, DoD code reviews, post-mortems) into one decision artifact — `LEARNINGS-{feature}.md` — then delete the process artifacts. This is the **harvest-then-delete** discipline: process artifacts are valuable *during* the work and decay sharply after it ships; the distillation step is the part most workflows skip.

**Scope:** Produce exactly one `LEARNINGS-{feature}.md` from existing artifacts, then remove the harvested `CROSS-REVIEW-*` and `CODE_REVIEW-*` files. You do NOT edit REQ/FSPEC/TSPEC/PLAN/PROPERTIES, write code, or promote anything to project level (that is `consolidate-learnings`' job — you only *flag* candidates).

---

## How to Invoke

```
/pdlc:harvest-learnings docs/{feature-name}
```

The argument is the feature's docs directory. Invoked by `orchestrate-dev` in Phase H once the final codebase review has passed.

---

## Git Workflow

1. **Before starting:** confirm you are on `feat-{feature-name}` — run `git rev-parse --abbrev-ref HEAD` and check the output; do not assume it — with the latest pulled. Every artifact you read must be on this branch (the feature branch is the single source of truth). Only run `git checkout` (or create the branch) when invoked standalone and the tree is confirmed not already on the feature branch.
2. **Immediately before every commit:** re-run `git rev-parse --abbrev-ref HEAD`. If it prints anything other than `feat-{feature-name}` — especially `main` — STOP and report the mismatch; never commit or delete artifacts on the default branch.
3. **After completing:** write `LEARNINGS-{feature-name}.md`, commit and push it **first**, then delete the `CROSS-REVIEW-*` and `CODE_REVIEW-*` files in a second commit and push. Never delete before LEARNINGS is committed — a guard hook enforces this, but the ordering is yours to honor.

---

## Harvest Process

1. **Inventory.** List every `CROSS-REVIEW-*.md` and `CODE_REVIEW-*.md` (all document types, all `-v{N}` versions) and every `POSTMORTEM-*.md` in `docs/{feature-name}/`. `CODE_REVIEW-*` are the DoD verifier's versioned findings (Phase DOD) — treat them as cross-reviews from the Definition-of-Done lens.
2. **Read all of them.** For each finding, note its `Scope` tag (from the review skills): `Local`, `Cross-Feature`, or `Process`. Untagged findings: infer scope, and record a Process learning that tagging was missed. For `CODE_REVIEW-*`, the count of `-v{N}` versions is the DoD convergence signal (how many remediation rounds the feature needed to satisfy the Definition of Done).
   **Under-tagging check** — *(promoted 2026-07-19 consolidation)*: reviewers historically under-tag — treat any `Local`-tagged finding that references a sibling feature or a repo-wide mechanism as candidate `Cross-Feature` signal even though it wasn't tagged that way, and route it to §2 accordingly. If you re-route findings this way, note the tag under-use itself in §4 Process Learnings so consolidation sees the routing gap.
3. **Count iterations** per phase (how many `-v{N}` versions exist) — this is your convergence signal.
4. **Distill** into the four content sections below. Use the Scope tags to route findings:
   - `Cross-Feature` findings → §2 Cross-Feature Patterns.
   - `Process` findings, and any phase that needed ≥3 iterations → §4 Process Learnings.
   - Any review loop that hit the iteration limit (has a POSTMORTEM) → §1 Non-Convergences.
   - Explicitly-rejected reviewer proposals where the reason matters later → §3 Rejected Proposals.
5. **Be selective about signal.** Omit transient `Local` findings already fixed upstream — they are noise. A short, high-signal LEARNINGS beats an exhaustive one.
6. **Flag, don't promote.** Anything you believe should become a project-level constraint or decision goes in §5 Open Items for Consolidation, for `consolidate-learnings` to act on later. You do not edit `docs/_constraints/` or `docs/_decisions/` yourself.
7. **Build the Approval Record (`## 6. Approval Record`) before deleting anything.** Every `CROSS-REVIEW-*` whose `## Verdict` section is approving (`Approved` or `Approved with minor changes`) contributes one row, in the six columns below, in this order:

   | Column | Value |
   |---|---|
   | Document Type | `REQ` \| `FSPEC` \| `TSPEC` \| `PLAN` \| `PROPERTIES` \| `DECISIONS` |
   | Round | the same `N` as the filename's `-v{N}` (a file with no `-v{N}` is round 1) |
   | Role | `product-manager` \| `software-engineer` \| `test-engineer` |
   | Verdict | `Approved` \| `Approved with minor changes` \| `Needs revision` |
   | Approval Hash | the file's `APPROVAL-HASH:` value — `sha256:{64 lowercase hex}` \| `unavailable` |
   | Reviewed Commit | the file's `REVIEWED-COMMIT:` value — lowercase hex sha \| `unavailable` |

   **Copy, never recompute.** Take the `APPROVAL-HASH:` and `REVIEWED-COMMIT:` bytes verbatim out of the cross-review file. Never recompute the digest and never substitute a harvest-time hash — recomputing at harvest time would hash the document as it stands *after* the phase, turning every harvested approval into a false "fresh" one. If either anchor line is missing, write `unavailable`; do not invent a value.

   One row per (document type, round, role) — a round approved by two roles contributes two rows. Order the rows totally: document type in pipeline order (REQ → FSPEC → TSPEC → PLAN → PROPERTIES → DECISIONS), then round ascending, then role slug ascending, so the section is byte-stable across re-derivations.
8. Write the document. Re-verify the branch per **Git Workflow** step 2, then commit, push. Then delete the `CROSS-REVIEW-*` and `CODE_REVIEW-*` files, re-verify the branch again, commit, push.

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
| Harvested from | {list of CROSS-REVIEW + CODE_REVIEW + POSTMORTEM files, now deleted} |
| Phases exercised | {list of phases this feature's pipeline ran, e.g. R, F, T, P, D, PR} |
| DoD rounds | {count of CODE_REVIEW-v{N} versions} |

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
Candidates for promotion that the harvest is not authorized to promote autonomously. If a candidate's failure mode was named in the handed open-promotion list (FSPEC §8.3, §8.4), copy that list's id verbatim onto the item — never re-slug, abbreviate, or mint a new id:

```
failure-mode-id: {id}
```

## 6. Approval Record
The durable (tier-2) record of every approving cross-review round, copied out of the `CROSS-REVIEW-*` files before they are deleted. Never omitted: a feature with no approving round still emits this heading and the header row, with no data rows.

| Document Type | Round | Role | Verdict | Approval Hash | Reviewed Commit |
|---|---|---|---|---|---|
| TSPEC | 2 | software-engineer | Approved | sha256:{64 lowercase hex} | {lowercase hex sha \| unavailable} |
```

---

## Quality Checklist

- [ ] Every `CROSS-REVIEW-*`, `CODE_REVIEW-*`, and `POSTMORTEM-*` for the feature was read
- [ ] Every `Cross-Feature` finding appears in §2; every `Process` finding in §4
- [ ] Iteration counts reflect the actual `-v{N}` versions present (including DoD rounds from `CODE_REVIEW-v{N}`)
- [ ] Transient `Local` findings already fixed upstream are omitted (signal over completeness)
- [ ] The metadata table carries its `| Harvested from | … |` row — the record of what step 8 deleted. It is **half of the completeness criterion** (FSPEC §16.5): without it the file is structurally incomplete and the harvest is re-dispatched, however well written the five sections are
- [ ] `## 6. Approval Record` is present (heading + header row even when there are no approving rounds), and its Approval Hash / Reviewed Commit cells were **copied verbatim, never recomputed**. Unlike the row above, this section is **excluded** from the completeness criterion (AC-4.2c) — its absence is reported, never a halt
- [ ] LEARNINGS committed and pushed **before** any `CROSS-REVIEW-*` / `CODE_REVIEW-*` deletion
- [ ] All harvested `CROSS-REVIEW-*` and `CODE_REVIEW-*` files deleted after LEARNINGS landed

---

## Communication Style

- Direct and structured. Tables for sections 1–3.
- Lead with the highest-signal learning.
- Distinguish a one-off from a pattern — say which, and why.
