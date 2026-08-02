# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-rcv-budget-stop/REQ-pdlc-rcv-budget-stop.md` (v2.3, 2026-08-01)
**Date:** 2026-08-01
**Iteration:** 9
**Scope:** every finding below carries its own Scope tag in the findings table.
**Protocol:** delta re-review. The baseline reviewed at v8 was the REQ as of `dde2670`; this review
covers `dde2670..HEAD` on that file — commits `27ab566`, `677dc4d`, `0761a09`, `9806894`, `21297cd`
(97 changed lines across the §0 header/changelog, §3.1 X-06, §4's delegation, §4.1's two derivation
rows, §5 AC-1.5(4), §7 NB-3 and the collision pointer, §8 O-10, §9 R-14 and §10) plus the two files
the change reaches outside this document: `docs/_constraints/pdlc-rcv-split.md` (new §5.1, new §6)
and `docs/pdlc-rcv-reset-region/REQ-pdlc-rcv-reset-region.md` X-07/R-16/O-10 (`3105033`). Sections
unchanged since v8 were not re-litigated.

## 1. Disposition of the v8 findings

**All four Lows are closed, each at the surface the finding named.** Nothing was closed by assertion;
every one was closed by an edit I could diff.

| v8 id | Sev | Status | What was checked |
|---|---|---|---|
| **F-01** (AC-1.5(4) and §4.1 state the conjunct unconditionally, no back-pointer to X-06) | Low | ✅ closed | `0761a09` adds a paragraph immediately after AC-1.5(4)'s false-branch bullet: *"**This conjunct's wiring waits for its decision procedure** (X-06): at this REQ's ship the gate evaluates its **first two conjuncts only**, so the dispositions above — and §4.1's two rows that restate them — are the **target state**, reachable at `REQ-RCV-07`'s commit, not behaviour this REQ's own delivery exhibits."* That is the clause I asked for, and it is placed where the misreading starts. Both §4.1 rows carry the matching qualifier (`W` row: *"the validation guard is unwired until `REQ-RCV-07` (X-06)"*; clearance row: *"**target state; that conjunct is unwired until `REQ-RCV-07` (X-06)**"*), so the two rows now read alike as asked. The one thing the `W` row's qualifier sweeps up is broader than the conjunct it defers — F-01 below, **Medium**, and it is the only reason this is not an approval. |
| **F-02** (the *any interim procedure* trichotomy over-claims) | Low | ✅ closed, and relocated | `21297cd` narrows X-06 to *"a **narrower** one deciding only what this REQ specifies must still disagree with AC-7.1 on ordering and highest round, unclearable in the **refusing** direction until AC-7.4"* — the narrower objection I named, in the terms I named it. The full argument moved to `pdlc-rcv-split.md` **§5.1**, which I read: it states the refusing horn, the granting horn, the narrower procedure (*"escapes both horns, but must still disagree with AC-7.1 on ordering and highest-round analysis"*) and the co-delivery rejection, each once, and says in its own header line that it was relocated *"so both ends of the paired edge cite one copy of the argument instead of restating it; nothing changed meaning in the move."* R-14 now cites §5.1 rather than restating. Carried to both sibling ends: `REQ-RCV-07` X-07 and R-16 both gained the narrower-procedure sentence — but in a **separate commit**, which is F-04 below. |
| **F-03** (the deliberately-unconsulted seam is the shape `dod-verify` flags) | Low | ✅ closed, in NB-3, with the formula I pointed at | `9806894` appends to NB-3: *"So is the *validate* seam being **present and unconsulted in production** at this ship (X-06): a DoD finding that it is an unwired integration is correct and known by construction, `REQ-RCV-07` wires it with AC-7.1, and it is **not** to be remediated by wiring it here."* That is NB-3's existing *correct and known by construction — file it there* pattern extended by one row, which is exactly the cheap fix, and it sits where the verifier reads. The §0 changelog names it too, so it is discoverable from the header. |
| **F-04** (O-10 leg 1 binds `{N}` twice) | Low | ✅ closed with concrete numbers | `27ab566` restates leg 1 as *"a readable `RESOLVED: yes`, and highest round on the branch = `windowEnd(1)` = **3** ⇒ the entry **grants** — exactly one `WINDOW-START: 4` appended at the end of the region"*. Both bindings are now literals, and they are the right two literals: the window that halted is `[1, 3]`, and the clearance opens at 4. The leg is now a fixture body a test can use verbatim, which was the point. |

**Independent re-verification of the new cross-document claims:**

- **`pdlc-rcv-split.md` §5.1 and §6 exist and carry what the REQ now delegates to them.** The file's
  headings are `## 5. Paired edges…`, `### 5.1 Why the validation conjunct is not wired before its
  procedure ships`, `## 6. The catalogue delegation, stated once`. The §0 header row's new citation
  (*"the shared *why the validation conjunct is unwired* argument (§5.1) and the catalogue delegation
  (§6)"*) resolves, as do §4's and R-14's.
- **The relocated catalogue delegation lost nothing.** I diffed the deleted §4 paragraph against
  `pdlc-rcv-split.md` §6 clause by clause: the S-12/S-13/S-14/S-16 receive-side rule, the *rule is
  over the references, not one phrase* justification, catalogue §3's row-schema reach (*"AC-1.5(4)'s
  step-4 path"*, *"fixed by `pdlc-rcv-budget-stop` §6"*) and the *catalogue may say so directly once
  `REQ-RCV-07` ships* closer are all present, with the REQ-relative references re-anchored to
  `REQ-RCV-01`. This is a move, not a compression that dropped a clause.
- **The `O-*`/`R-*`/`X-*` collision rule survived §7's rewrite** as a pointer
  (*"`pdlc-rcv-split.md` §5's rule applies — every cross-document citation names the owning REQ, as
  each here does"*), which is where I said the load-bearing half lives.
- **Sizes are mine, not the document's:** `wc -lc` gives **455 lines / 55,238 bytes** against
  `check-req-size.sh:47-48`'s soft thresholds (630 / 55,296). Headroom is **58 bytes**, down from
  171 — Q-01 below.

## 2. Disposition of the v8 questions

## 3. Findings

## 4. Questions

## 5. Positive Observations

## 6. Recommendation

## Verdict
