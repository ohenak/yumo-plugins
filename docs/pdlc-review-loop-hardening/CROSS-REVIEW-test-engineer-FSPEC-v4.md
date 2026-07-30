# Cross-Review: test-engineer — FSPEC

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-review-loop-hardening/FSPEC-pdlc-review-loop-hardening.md (v1.3)
**Date:** 2026-07-30
**Iteration:** 4

**Scope:** Delta re-review, testing/verifiability lens. Change surface is
`git diff cc0d80e..HEAD -- docs/pdlc-review-loop-hardening/FSPEC-pdlc-review-loop-hardening.md`
(59 insertions / 17 deletions, of which 27 insertions are the v1.3 changelog). Prior findings
TE-v3 F-01…F-03 verified against the normative text, not the changelog. New defects sought **only** in
changed sections: §1.2 rule 5, §15.5's form-selection paragraph, §19 (AT-19 and its measured-basis
paragraph), AT-62, AT-65, §21.4's DC-01 row. Unchanged sections previously passed are not re-litigated.
Per post-mortem lesson R-6, no citation-drift nit is raised at any severity.

## Disposition of iteration-3 findings

| Prior | Severity at v3 | Disposition | Evidence in the normative text |
|---|---|---|---|
| F-01 — rule 5's scope clause was narrower than the hazard the rule states, leaving §16.2/§15.5/§16.4 and the response carrier uncovered | Medium | **Resolved** | The eleven words are gone. §1.2 rule 5 now reads "Every mechanical scan this feature specifies **over a markdown artifact it reads**", and its enumeration is the full site list: "the verdict scan and its duplicate pre-count (§6.3), the `APPROVAL-HASH:` scan and its pre-count (§7.4), the hash read at either tier (§10.1, §10.5), the completeness heading scan (**§16, all four classes**) and the heading walk that feeds the resume prompt (**§15.5**), and the **`RESOLVED:` scan (§12.2)**". Both directions I named are closed. *Fail-open:* a required §16.2 heading can no longer be satisfied by a quotation, because a fenced `## …` line is not a heading for the scan — so a truncated spec cannot score structurally complete on a section that exists only inside a code block. *False halt:* the same exclusion means a quoted bare-heading or `TBD` skeleton no longer inflates `T`, so a finished document cannot sit permanently at `S < T`, exhaust `MAX_AUTHORING_DISPATCHES` and trip §15.6. And the direction now has an oracle rather than an inference: **AT-62** gained "*And given* the same fixture with one further body carrying a fenced block that contains a `## …` line. *Then* `T` is **unchanged** by it — the fenced heading is not a top-level section (§1.2 rule 5, which §16.2 inherits)", with the falsifier stated ("without it a quoted heading inflates `T` and the episode never reaches terminal"). That is exactly the fixture line I asked for, on the AT I asked for it on. §12.2's inclusion is a bonus and points the right way: a quoted `RESOLVED: yes` — the FSPEC prints one inside a fenced block at §12.2 itself — no longer contributes to the uniqueness count, so a genuine single marker is honoured and a quoted one cannot resolve a POSTMORTEM. |
| F-02 — "the matching closer" undefined for a different fence character and for a shorter run; AT-65's fixture not pinned to the nested form | Low | **Resolved** | Rule 5 now defines it: "A line is the **matching closer** only if its fence run uses the *same* fence character as the opener and is *at least as long*; every other fence line is content, so a three-backtick line inside a four-backtick block does not close it." Both enumerable mismatches are covered, and the closing clause ("every other fence line is content") means the definition is total rather than a pair of examples. **AT-65** is pinned to the case that exercises it: "The quotation is **nested**: a four-backtick wrapper containing the template's own three-backtick lines, which is the form a reviewer must use to quote §6.2", with the naive-implementation falsifier named in place ("a 'next fence line closes it' implementation reds here because the inner opener would end the block and re-expose both lines"). An implementer can no longer satisfy AT-65 with a flattened fixture that never reaches the nesting case. |
| F-03 — §15.5's form-selection paragraph named cross-review and LEARNINGS but not code-review | Low | **Resolved** | §15.5 now reads "For the cross-review, code-review and LEARNINGS classes the form is selected on the class's own §16 criterion instead". The paragraph and §15.5's own resume-field mapping table (which carries a Code-review row citing §16.4's two markers) now agree on three non-spec classes, and TE Q-01 is answered in the direction that keeps the rows rather than deleting them — consistent with §16.6, which enumerates code-review as one of the four wrapped classes. |

**The deliberate non-extension to the response carrier.** Accepted, and I want to be explicit that this
is not a concession made to close the loop. I wrote at v3 that "§6.2 declares the response parser out of
change scope" and accepted it at v2; the scope boundary has not moved, and rule 5's new phrasing — "a
markdown artifact it **reads**" — is honest about covering the file carrier only rather than silently
implying the response too. Widening it here would pull the response parser into the change surface at
FSPEC round 4, which is the wrong place and the wrong time. No finding.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Low | Local | **Rule 5 now reaches §16.2, and §16.2 has two tests, not one — the heading test and the non-empty-body test. The widened rule does not say whether a fenced block counts as body content, and the natural single-pass implementation (strip fenced regions, then apply the criterion) answers "no", which makes a section whose body is only a code block score empty forever.** §16.2's body rule is "at least one non-blank, **non-heading** line between it and the next `##` heading"; a `###` subheading is a heading, so a `## Interfaces` section built from `###` subheads plus fenced type signatures — or a PROPERTIES `## Fixtures` section that is fenced fixtures — has zero countable lines once fenced lines are skipped. It scores empty, `S < T` permanently on a finished document, and §15.6 halts the phase: the same false-halt class §16.3 withdrew "exactly one" to remove. This is not blocking, for three reasons I checked rather than assumed. (1) It is not demonstrable: I scanned all 44 spec artifacts under `docs/*/` for a top-level section whose only non-heading body content is fenced — **zero hits**, including this FSPEC, the REQ, and the one complete TSPEC/PLAN/PROPERTIES/LEARNINGS set under `docs/pdlc-workflow-distribution/`. (2) The failure is loud, not silent: §15.4's report prints `{S} of {T}` and §15.5's resume clause names the section, so an operator sees a written section named as unwritten. (3) The rule's own wording ("the completeness **heading** scan") already points at the harmless reading. Cheapest fix, at TSPEC altitude rather than by reopening the FSPEC: scope the §16 entry in rule 5 to *matching* — headings and the `Scope:` / `VERDICT: ` / `APPROVAL-HASH:` / `RESOLVED:` markers — and state that a fenced block still counts as body content for §16.2's non-empty test. One clause, and one conjunct on AT-62 (`S` unchanged as well as `T`) makes it falsifiable. | §1.2 rule 5, §16.2, §16.5, §15.5, AT-62 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | (Carried, non-blocking, for TSPEC.) Will the fence-stripping helper be a shared line iterator used by all six enumerated scan sites, or a per-site pre-filter? The shared-iterator shape is the one rule 5's "stated once, referenced rather than restated" rationale asks for, and it is also the shape that produces F-01's behaviour by default — so the answer decides whether F-01 needs a clause or nothing at all. |

## Positive Observations

- The one-line deletion was taken as a deletion. Rule 5 grew a definition (the matching closer) and lost a
  scope clause, and every one of the four newly-reached sites inherits it with **no per-site clause** —
  §16.2, §16.4, §15.5 and §12.2 carry nothing new. That is the shape the rule's own rationale demanded,
  and it is why this round's fix is auditable in a single paragraph instead of five.
- Both fixture pins are falsifier-first rather than description-first. AT-62 names what goes red without
  the exclusion ("a quoted heading inflates `T`"); AT-65 names what goes red under the naive closer ("the
  inner opener would end the block and re-expose both lines"). Neither is satisfiable by an implementation
  that does not exercise the case, which is the whole point of pinning a fixture.
- AT-19's weakening is stated with its measurement rather than asserted. Striking the bare-identifier
  disjunct makes the assertion strictly weaker (`const { env } = process` would now evade both regexes),
  but the residual is benign — `process` does not exist in the runtime, so that form throws at load rather
  than false-greening — and the paragraph shows *why* the stronger form was red on healthy bundles (the
  banner's `child_process`, `rebaseOntoDefault`'s `git fetch origin`, word boundaries supplied by
  backticks and spaces) instead of just removing it. A weakened assertion with a measured justification is
  reviewable; a weakened assertion without one is how a test quietly stops testing.
- §12.2 was pulled into rule 5 unprompted. Neither reviewer asked for it; the author found the third
  carrier of the same grammar while fixing the first two. That is the difference between closing a finding
  and closing a defect class.

## Recommendation

**Approved**

All three of my v3 findings are resolved in the normative text, in the form I specified, and the change
surface introduced no High or Medium defect. I said at v3 that I expected to approve at v4 if these
landed; they landed, so I approve. The single Low above is a residual ambiguity created by the widening
itself — one clause, no artifact in this repo exhibits it, and it belongs to TSPEC, not to a fifth FSPEC
round. Trajectory across the loop: 15 → 6 → 2 → 0 blocking findings.

**Findings: 0 High, 0 Medium, 1 Low.**

VERDICT: Approved
