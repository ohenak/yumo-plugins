---
name: consolidate-learnings
description: Consolidation ritual. Reads every feature-level LEARNINGS file produced since the last pass and promotes recurring patterns into project-level DOMAIN-CONSTRAINTS and DECISIONS, and proposes (never auto-commits) updates to skill prompts. Manually invoked, periodically. A human approves every promotion.
---

# Consolidate — Cross-Feature Learning Promotion

Per-feature LEARNINGS files are write-only until something promotes their recurring signal to a level future features actually read. That is this skill. You read the LEARNINGS accumulated since the last consolidation pass and promote **patterns** (not one-offs) into project-level context.

**Scope:** Read LEARNINGS files; promote durable patterns into `docs/_constraints/` and `docs/_decisions/`; propose skill-prompt changes as a reviewable artifact. You do NOT autonomously edit skill files, and you do NOT promote a signal seen in only one feature unless it is unambiguously a standing constraint.

**Cadence:** Manually invoked. A `SessionStart` nudge hook reminds when ≥5 un-consolidated LEARNINGS exist, but you may be run any time.

---

## How to Invoke

```
/pdlc:consolidate-learnings
```

No argument — operates across the whole repo's `docs/`.

---

## Git Workflow

1. **Before starting:** check out or create `chore-consolidate-learnings-{date}`. Pull latest.
2. **After completing:** commit promoted constraints/decisions, the proposal artifact, and the updated log; push. Open for human review — do not merge skill-prompt changes yourself.

---

## Consolidation Process

1. **Find the boundary.** Read `docs/_decisions/.consolidation-log.md` (create it if absent). Every `docs/*/LEARNINGS-*.md` with a Date Completed after the last logged pass is in scope.
2. **Read them all.** Collect §2 Cross-Feature Patterns, §4 Process Learnings, and §5 Open Items from each.
3. **Cluster.** Group items pointing at the same underlying concern across features.
4. **Distinguish pattern from coincidence.** Two features mentioning the same concern *might* be a pattern or *might* be coincidence. Promote only when the signal is durable: it recurs across ≥2 unrelated features, **or** a single occurrence states a standing invariant (security, data integrity, regulatory) that obviously generalizes. When in doubt, leave it in the proposal for a human to judge — do not promote.
5. **Route each promoted item:**
   - Domain invariant future REQs must respect → append to `docs/_constraints/DOMAIN-CONSTRAINTS.md` (read by `pm-author`).
   - Architectural decision now project-level → `docs/_decisions/DECISIONS-{topic}.md` (read by `se-author`).
   - Process learning about a skill prompt / review checklist / workflow phase → **propose**, never apply (next section).
6. **Record the pass** in `.consolidation-log.md`: date, which LEARNINGS files were consumed, what was promoted, what was deferred.

---

## Skill-Update Proposals (human-in-the-loop)

When a learning says a skill prompt itself should change, you do **not** edit the skill. Write `docs/_decisions/CONSOLIDATION-PROPOSAL-{date}.md`:

```markdown
# Consolidation Proposal — {date}

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

## Quality Checklist

- [ ] Every LEARNINGS file since the last logged pass was read
- [ ] Nothing promoted on a single coincidental mention (pattern ≥2, or clear standing invariant)
- [ ] Skill-prompt changes are proposed in CONSOLIDATION-PROPOSAL, never auto-applied
- [ ] `.consolidation-log.md` updated with date, consumed files, promoted + deferred items
- [ ] Promotions cite their origin features

---

## Communication Style

- Lead with what you promoted and why it cleared the pattern-vs-coincidence bar.
- Be explicit about what you deferred and what a human needs to decide.
- Tables for promotions and proposals.
