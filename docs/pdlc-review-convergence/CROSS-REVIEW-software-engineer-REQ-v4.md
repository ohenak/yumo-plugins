# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-review-convergence/REQ-pdlc-review-convergence.md`
**Date:** 2026-07-31
**Iteration:** 4
**Scope:** REQ-pdlc-review-convergence v1.2, delta re-review against the v1.1 tree reviewed at iterations 2 and 3 — technical lens (feasibility, implementability, integration risk)

## Delta baseline

The document **was revised this round**, substantially and on purpose. Round 3's empty-round finding
(F-08) is answered by its own AC.

- Baseline: `f4560d3` (*"docs(pdlc-review-convergence): SE REQ v3 — verdict"*), the commit carrying my
  v3 cross-review. `git diff f4560d3 HEAD -- docs/pdlc-review-convergence/REQ-pdlc-review-convergence.md`
  is **+354 / −75** across 20 commits (`9ff3de8` … `6430f89`), tree clean.
- The version row now reads **1.2**, there is a *Revision note (v1.2)*, and **§10.7** maps every
  round-2/3 finding from both panels to where it is answered.
- Scanned sections: the header, §3 BL-01, §4.3 M-3d, §4.7, §5 (both definition tables and the string
  catalogue), AC-1.5(4), AC-2.2, AC-2.4, AC-2.7, **AC-2.8 (new)**, AC-3.2(2), AC-3.3, AC-3.4,
  AC-3.5(a)(e), AC-4.1, AC-4.7, §6, N-3, N-7, O-4, **O-12 (new)**, O-10, R-5, **R-8 (new)**, §9.3,
  §10.7. Unchanged sections I approved earlier are not re-litigated.
- Verification pass this round: three existing-code claims are **new or restated** in v1.2 and I checked
  all three against the citation baseline `9486c81` in one pass, plus one claim the REQ makes about the
  digest it reuses. Results are in *Positive Observations* and in G-03.

## Round-2/3 disposition

**All eight prior findings are closed.** Each was checked at the surface it named, not at the
revision note that claims it.

| Prior finding | Sev | Disposition | Evidence |
|---|---|---|---|
| F-01 — `DOC-BYTES:` cannot be written by `appendApprovalAnchors`; growth formula circular | High | **closed** | AC-4.1 now names **`appendRoundAnchors`**, an unconditional per-round writer that runs "after round N's reviewers have returned — before AC-2 is evaluated, and regardless of the round's verdict"; §5 carries a two-writer table separating it from `appendApprovalAnchors`; growth is restated as `DOC-BYTES(N) − DOC-BYTES(N−1)`, both endpoints past; §6's `DOC-BYTES:` row and O-4 restated to match. The read-instant/persist-instant split is stated explicitly and is the right fix. |
| F-02 — a failed verifier round reads as *crashed* | High | **closed**, twice over | §5's *panel shape* and *crashed* are now stated over the **on-disk role-slug set alone** with the marker explicitly excluded; AC-2.4 gains a "why over slugs" paragraph; and AC-3.5(a) independently widens the Given to "a single verifier — **whatever verdict it returned**". Belt and braces, correctly, since either alone would close it. |
| F-03 — AC-3.2(2)'s "not counted" rule has no reader | High | **closed** | Reading 2 chosen and stated: the verifier excludes the finding from **its own** trailer; "The loop performs no subtraction and parses no findings table"; `blocking(N)` keeps one definition. §5's S-9 receiver, N-3 and R-5 all restated consistently. R-5 additionally records the failure direction (a verifier that ignores it halts *earlier*, never later) — that is the right thing to say about an unenforced clause. |
| F-04 — trailer placement unspecified; anchor makes a trailer-less file *malformed* | Medium | **closed in substance** (one residue, G-05) | AC-3.4 now requires the trailer to be the first non-empty line after `VERDICT:` and excludes anchor lines as candidates; AC-2.7 gains a five-row observation table whose fourth row makes an anchor line read *unavailable*. The operator-facing inversion is fixed. The two clauses do not agree on the reader's algorithm — see G-05. |
| F-05 — AC-1.5(3)'s reset has no durable observable | Medium | **closed in substance** (one residue, G-04) | AC-1.5 gains clause 4: `WINDOW-START: {N}` appended by the loop to the resolved POSTMORTEM, one-shot consumption, fail-closed receive side; §5's durability table gains both rows. The consumption half was not asked for and is a genuine improvement. Its durability across a *second* halt is unstated — see G-04. |
| F-06 — §4.7 pins claims to the unreachable `d11dad5` | Low | **closed** | Both bullets restated at `9486c81`, with the v1.1 pin recorded as the defect rather than deleted. |
| F-07 — `7bc559a` called a merge commit | Low | **closed** | §3 BL-01 now says "single-parent, not a merge commit"; the closing paragraph drops the parenthetical. |
| F-08 — a re-review round dispatched with no intervening revision | Low/Process | **closed, and mechanised** | AC-2.8 makes a zero-delta round a halt with its own reason (S-11), `DOC-SHA256:` (S-10) supplies the exact endpoint, R-8 records the authoring-side residue and binds it to the runtime-measurement spike, O-12 specifies the plumbing, §9.3 gains the binding row. This is more than the finding asked for and the reasoning in "Why this is a halt and not a notice" is correct. |

The five open findings below are **all new in v1.2** — every one of them is in text this revision
added. None re-litigates a section I approved.

## Findings

## Findings in detail

## Questions

## Positive Observations

## Mechanical fixes

## Recommendation

## Verdict
