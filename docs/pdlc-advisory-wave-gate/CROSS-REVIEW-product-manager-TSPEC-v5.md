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

| ID | Question |
|----|---------|
| Q-01 | OQ-7's `.gitignore` boundary has now been open on FSPEC BR-9 / AT-05-1 for four rounds; `FSPEC:204` and `:410` are unchanged and still say "generated outputs included", while §3.3's `apply` row refuses a repair that writes only ignored paths and §5.2's round-trip case pins `git clean -fd` over `-fdx`. TSPEC has done everything it can here — both halves are written to the boundary and flagged upstream-pending. Re-emitted as an erratum below; is there a reason it has not landed on FSPEC, or has the routing simply not reached it? |
| Q-02 | §5.2's new configuration-driven case asserts `["test", "test"]` for a `testCommand`-only run. §2.4's third row is the source of that shape — does any fixture cover the *other* truncated form (a configured post-wave command with no test command), or is that arrangement excluded by `implementation.testCommand` being required upstream? One sentence either way would close the enumeration rather than leave a reader counting rows. |

## Positive Observations

- **The anchor is A6's own code, not an inference about the driver.** The fix I proposed recorded a
  dispatch-time floor; the document went further and anchored on `apply`, which A6 owns and which
  the driver runs once per attempt strictly before VERIFY. I checked the ordering rather than
  taking it (`orchestrate-dev.js:3521` APPLY, `:3546` VERIFY, one iteration). Anchoring on a
  quantity the seam writes itself is the stronger construction, and it is why the attempt-2 drop —
  a shape my own fix would have admitted, since growth-since-dispatch is non-empty there — is
  refused.

- **TE's proposed operand was taken seriously and then correctly refused, in writing.** §3.2's
  "Why the anchor is the last `apply` and not `attempts`" paragraph names the three code paths that
  consume an attempt without gating and cites each (`:3421`, `:3428`, `:3459`). All three check out.
  Rejecting a reviewer's suggested fix with a cited counter-example, rather than adopting it to
  close the finding, is the behaviour that keeps a review loop honest.

- **§5.5 became a two-row table, and the second row is the one that matters.** The attempt-2 drop
  is precisely the shape every unanchored quantity admits — suffix, non-empty growth, whole
  multiples — and the table says so per row, in the "what only the real rule refuses" column. That
  column turns a fixture list into a statement about which rules are excluded, which is what a
  mutation fixture is for.

- **The withdrawal in §3.2 step 3 is explicit rather than quiet.** Round 3's coverage claim is
  named wrong "in both halves" and the replacement oracle is stated in the same paragraph. A
  document that records its own retracted claims is one a later reader can trust about the claims
  it keeps.

- **F-03's fix carried its reasoning into OQ-2.** The ref name changed *and* the open question
  explains what the old name cost, so the decision survives the diff that made it.

- **OQ-14's containment assertion is scoped exactly as narrowly as it should be.** One line, on the
  free-text slot, leaving §5.5's fixed-sentence equality oracle untouched — the answer to Q-02 does
  not weaken the oracle it sits next to.

## Recommendation

**Approved with minor changes** — no High findings.

Round 4's single blocker is genuinely closed, and closed at the right layer: step 6's quantity is
now anchored on `apply`, a position A6 records itself, and the anchoring is reconciled across §3.2,
§3.3, §5.2 and §5.5 rather than stated once. F-02's false coverage claim was withdrawn and replaced
with a positive one-run oracle; F-03's ref is wave-scoped everywhere, with the reasoning preserved
in OQ-2. Both remaining findings are non-gating:

1. **F-01 (Medium)** — say, in §5.2's two-attempt bullet, that the run keeps the shipped
   `verifyGate` and drives red-then-green through `_runCommand`, so the bullet cannot be read in
   §5.5's injection vocabulary.
2. **F-02 (Low)** — state in OQ-2 that the record survives a multi-wave *run*, that a later run's
   same-numbered wave overwrites it, and that nothing prunes the refs.

One upstream item is unchanged and re-emitted below: OQ-7's BR-9 `.gitignore` boundary, open since
round 1 and still unlanded on FSPEC.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 1}

