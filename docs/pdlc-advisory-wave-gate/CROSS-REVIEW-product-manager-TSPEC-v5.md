# Cross-Review: product-manager — TSPEC

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-advisory-wave-gate/TSPEC-pdlc-advisory-wave-gate.md` (v1.4)
**Upstream read:** `REQ-pdlc-advisory-wave-gate.md` v1.8, `FSPEC-pdlc-advisory-wave-gate.md` v1.3
**Previous review:** `CROSS-REVIEW-product-manager-TSPEC-v4.md` (iteration 4)
**Date:** 2026-08-20
**Iteration:** 5
**Scope:** Product lens only — requirements traceability, scope compliance, acceptance-criteria fidelity.

## Grounding note

Delta protocol followed. Re-read `CROSS-REVIEW-product-manager-TSPEC-v4.md`, then
`git diff 7ec5c8b9..HEAD -- docs/pdlc-advisory-wave-gate/TSPEC-pdlc-advisory-wave-gate.md`
(193 insertions, 78 deletions). Change set taken: the v1.4 changelog block, §2.5's snapshot-ref
bullet and plumbing listing, §3.2 steps 3 and 6, §3.3's `apply` and `verifyGate` rows, §3.5's
capture bullet, §4.5's artifact row, §5.2's four new/rewritten bullets, §5.5's two-row mutation
table, §6 OQ-2 and the new OQ-14/OQ-15. Sections approved in rounds 3-4 were not re-litigated.

Every behavioural claim this round was checked against shipped code, not against the TSPEC's prose:
the driver's attempt loop opens at `pdlc/workflows/orchestrate-dev.js:3393` (`while (true)`), APPLY
is `:3521` (`seamOps.apply(verdict)`) and VERIFY is `:3544`/`:3546` in the *same* iteration, so
`apply` does run strictly before that attempt's `verifyGate`, as §3.3's new sentence claims. The
three non-gating `attempts += 1` paths the changelog leans on are real and are preemption `:3421`,
dispatch error `:3428` and malformed verdict `:3459` — each `continue`s or terminates without
reaching VERIFY, which is exactly why `attempts` is the wrong operand. The `consumesAttempt`
re-entry §5.5's second fixture depends on is `:3554`-`:3568`. Upstream boundary re-checked directly:
`FSPEC:204` and `FSPEC:410` still read "tracked and untracked files alike, generated outputs
included" with no `.gitignore` carve-out (OQ-7, re-emitted below); `REQ:441-445` (AC-5.1) delegates
the mechanism to O-1 and so carries no conflicting claim.

## Disposition of round-4 findings

| ID | Severity | Disposition | Evidence |
|----|----------|-------------|----------|
| F-01 | High | **Resolved** | Step 6 now measures **growth since the last `apply`**, with `apply` recording `ledgerAtLastApply = invocations.length` as its first statement (`TSPEC:520-545`, §3.3's `apply` row). The anchor sits above the pre-A6 pass's own `[post-wave, test]`, so the failure mode I raised — a `verifyGate` returning `{passed:true}` without running anything, granted resolution by the suffix reading — now leaves an empty slice and is refused. The anchor is code A6 owns and the driver's ordering makes it decidable (`orchestrate-dev.js:3521` before `:3546`, verified). §3.3's `verifyGate` row, §5.2's companion and §5.5 all now state the same anchored quantity — the three-way reconciliation I asked for |
| F-02 | Medium | **Resolved** | The false coverage claim is withdrawn in the paragraph that made it (`TSPEC:479-487`), and §5.2 gains the positive case instead: one run, over budget on entry, asserting `reason: "budget-exhausted"`, record + escalation entries written, `commit-tree === 1` with an `update-ref` observed, and no `_agent` call (`TSPEC:1074-1082`). Positive facts on a single run, no absence-only oracle |
| F-03 | Medium | **Resolved, and better than the fix I proposed** | The ref is wave-scoped everywhere it appears — `TSPEC:263`, `:295-303`, `:483`, `:566`, `:741`, `:910`, `:1300` — with no surviving unscoped spelling (grepped). §2.5 states the multi-wave consequence explicitly ("a run that resolves wave 1 and then escalates over budget on wave 2 ends holding both refs"), and OQ-2 records *why* the name changed rather than only *that* it did. FSPEC/REQ never name the ref, so this is TSPEC's to choose under O-1 — no upstream conflict |
| Q-01 | — | **Still open upstream** | Re-emitted as an erratum below; `FSPEC:204`, `:410` unchanged |
| Q-02 | — | **Answered and covered** | §5.2's capture-failure fixture gains a containment assertion that the failing git verb reaches the escalation entry, recorded as OQ-14 (`TSPEC:1050-1055`, `:1312`). Containment rather than equality keeps §5.5's fixed-sentence `diagnosis` oracle intact — the right shape |

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Medium | Local | §5.2's two-attempt positive companion describes its fixture by the values `verifyGate` *returns* — the same phrasing §5.5 uses for a fixture that **injects** `verifyGate` — while its assertions (six ledger tokens, a non-empty slice above the second `apply`) are only satisfiable if the real `verifyGate` runs and appends. Read the way its neighbour reads, the positive companion is unsatisfiable | REQ AC-4.1 (iii); AC-4.6 |
| F-02 | Low | Local | §2.5 and OQ-2 promise the wave-scoped ref preserves each wave's pre-repair record, but the scoping is per *wave number*, not per run: a later run's wave 1 overwrites `refs/pdlc/a6-snapshot-1` from the halted run an operator is still investigating. Nothing deletes the refs either, so the cost the section tallies is incomplete in both directions | REQ AC-5.1; §6 OQ-2 |

### F-01 — the positive companion is described in the mutation fixtures' vocabulary (Medium, delta, local)

§5.2 now reads (`TSPEC:1058-1062`): "a fixture whose first `verifyGate` returns
`{passed: false, consumesAttempt: true}` and whose second returns `{passed: true}` asserts the run
reports the wave **resolved** … and that `invocations` reads
`["post-wave", "test", "post-wave", "test", "post-wave", "test"]` — **six** tokens".

§5.5's mutation fixtures are described in the same vocabulary, one section later
(`TSPEC:1176-1178`): "`verifyGate` records its call and returns `{passed: true}` **without running
the gate sequence**". There the phrase means an injected double replacing the shipped op — that is
the mutation, and it is the point.

Compose the two readings. If Phase I transcribes §5.2's sentence the way §5.5's sentence must be
transcribed — inject a `verifyGate` double returning red then green — nothing appends to
`invocations`. The ledger stays at the pre-A6 pass's `["post-wave", "test"]`, the six-token literal
is false, and the slice above the second `apply` is empty, so the wave the fixture asserts
**resolved** is refused by the very rule the fixture exists to demonstrate. The positive companion
becomes a red test against a correct implementation — the same failure class TE F-27 caught in the
four-token literal last round, arriving this time through the fixture's construction rather than its
expected value.

The intended reading is recoverable: six tokens can only come from three real sequence runs driven
by a `_runCommand` double that fails once and then passes, with the shipped `verifyGate` left in
place. But the document does not say so, and it is the one bullet in §5.2 where the distinction is
load-bearing — everywhere else in the section the doubles are named explicitly (`_git` double,
`_agent` call count).

This is Medium rather than High because the six-token literal and the "slice above the second
`apply`" assertion together make the intended construction inferable, and because §5.5's paired-
companion sentence points back at the same run; nothing here reopens F-01's substance, which is
genuinely closed. It is worth fixing because the pairing is the only thing standing between §5.5's
two mutation fixtures and the absence-only shape they were written to escape — if the companion is
transcribed wrong and deleted as flaky, the mutations pass against an implementation that resolves
nothing.

**To resolve** — one clause in that bullet: state that the run keeps the shipped `verifyGate` and
drives red-then-green through the injected `_runCommand`, and that the two attempts' outcomes are
therefore observed rather than stipulated. Optionally mirror it in §5.5's table by saying what those
two fixtures replace, since the contrast is what makes each fixture legible.

### F-02 — the ref promise is scoped to a run, and the section does not say so (Low, delta, local)

§2.5 (`TSPEC:295-303`) and OQ-2 (`TSPEC:1300`) now argue that a fixed ref name "destroyed the record
of an earlier, resolved wave's pre-repair tree", and that wave-scoping preserves it. Both hold
within a run. Neither holds across runs: `refs/pdlc/a6-snapshot-{waveNum}` is derived from the wave
number alone, so a re-run of a halted feature — the ordinary next step after the halt OQ-2 is
written about — reaches wave 1, captures, and overwrites the ref an operator was told to keep for
recovery. The exact loss F-03 named is still reachable; only its trigger moved from "a later wave"
to "the next run".

The second half is the unbounded accumulation the same bullet half-acknowledges ("nothing in this
feature deletes them"): one dangling commit per wave per run, on a ref namespace no other tool
prunes. Individually trivial; worth a sentence where the cost is being tallied for the reader,
because it is the operator, not the pipeline, who is left holding it.

Low because content is never at risk — a resolved wave's repair is gate-verified and committed in
the wave's own commit, so this is inspectability, exactly as I priced F-03 last round.

**To resolve** — either state the scope honestly in OQ-2 ("the record survives a multi-wave run; a
subsequent run's same-numbered wave overwrites it, and the refs are never pruned"), or, if a
cheap run-scoped discriminator is already in hand at capture time, use it in the name.

## Questions

## Positive Observations

## Recommendation

