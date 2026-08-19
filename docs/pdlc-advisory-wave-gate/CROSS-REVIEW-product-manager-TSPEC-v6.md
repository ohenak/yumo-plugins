# Cross-Review: product-manager — TSPEC

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-advisory-wave-gate/TSPEC-pdlc-advisory-wave-gate.md` (v1.5)
**Upstream read:** `REQ-pdlc-advisory-wave-gate.md` v1.8, `FSPEC-pdlc-advisory-wave-gate.md` v1.3
**Previous review:** `CROSS-REVIEW-product-manager-TSPEC-v5.md` (iteration 5)
**Date:** 2026-08-20
**Iteration:** 6
**Scope:** Product lens only — requirements traceability, scope compliance, acceptance-criteria fidelity.

## Grounding note

Delta protocol followed. Re-read v5, then `git diff d55f4496..HEAD -- <TSPEC>`: the v1.5 changelog,
§2.5's run-scope paragraph, §3.2's carrier block and first-conjunct note, §3.3's signature plus the
`apply`, `verifyGate` and new `ledgerAnchor` rows, §5.2's two-attempt companion and gate-sequence
enumeration, §5.5's TE F-30 paragraph, and OQ-2. Sections approved in earlier rounds were not
re-litigated.

Code claims in the delta were checked against the shipped tree, not the TSPEC's prose:
`seamOps.declaredScope` is read off the handed object at `orchestrate-dev.js:3499` and `:3503`,
APPLY is `:3521` and VERIFY `:3546` inside one iteration of the attempt loop, the
`consumesAttempt` re-entry sits at `:3554`-`:3568`, `scriptGate` is
`Boolean(implConfig.testCommand) && typeof runCommandFn === "function"` at `:14143-14144` exactly as
quoted, and the `declaredScope` live-array idiom the carrier copies is `:2653-2654`
(`.length = 0; push(...)`). `buildA6SeamOps` is new work and correctly carries no existing citation.

## Resolution of previous findings

| ID | Severity | Status | Evidence |
|----|----------|--------|----------|
| F-01 | Medium | **Resolved** | §5.2's two-attempt companion now states it keeps the shipped `verifyGate` and every other shipped seam op, drives red-then-green through the injected `_runCommand`, and names what the §5.5-vocabulary transcription would have cost (`TSPEC:1121-1131`). The six-token literal is now observed, not stipulated |
| F-02 | Low | **Resolved** | §2.5 states the promise is run-scoped, names the re-run overwrite of `refs/pdlc/a6-snapshot-1` and the unpruned accumulation, bounds the cost to inspectability rather than content, and gives the operator the copy-the-ref workaround (`TSPEC:325-334`); OQ-2 records the same with a run-id remedy |
| Q-01 | — | **Still open upstream** | `FSPEC:206` still reads "generated outputs included"; re-emitted below |
| Q-02 | — | **Answered** | §5.2 closes the enumeration at two configured shapes via `scriptGate`, which I verified at `orchestrate-dev.js:14143-14144` (`TSPEC:1157-1164`) |

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Medium | Local | §5.5's attempt-2 mutation fixture asks one injected `verifyGate` double to both *run* a genuine red sequence (attempt 1) and *drop* the gate (attempt 2), without saying how the first half happens; its new expected literals (`four tokens`, `ledgerAnchor.value === 4`) only hold under a delegating double | REQ AC-4.1 (iii) |
| F-02 | Low | Local | §3.2 creates the carrier "at step 4, beside `ledgerAtDispatch`" while §3.3 calls its lifetime `invocations`' lifetime, "both created per wave" — two different creation sites for the same object | REQ AC-4.1 |

### F-01 — the attempt-2 double is asked to do two incompatible things (Medium, delta, local)

§5.5's TE F-30 paragraph (`TSPEC:1264-1277`) fixes the construction as `{...seamOps, verifyGate: fake}`
— the real `buildA6SeamOps` with exactly one member replaced — and then adds the positive halves:
on the attempt-2 fixture, `invocations` reads `["post-wave", "test", "post-wave", "test"]` and
`ledgerAnchor.value === 4`. The row above it (`TSPEC:1262`) describes attempt 1 as running "a genuine
red sequence".

Those two sentences do not compose. If the single `verifyGate` double is the one §5.5's other row
describes — "records its call and returns `{passed: true}` without running the gate sequence" —
then nothing appends on attempt 1 either. The ledger stays at the pre-A6 pass's
`["post-wave", "test"]`, attempt 2's `apply` re-anchors at 2, and both new literals are false: the
fixture goes red against a correct implementation. This is exactly the failure class round 4's
TE F-27 and round 5's PM F-01 caught one section earlier — an expected value that only holds under a
construction the document leaves to the transcriber.

The intended reading is recoverable and is almost certainly a *delegating* double: call 1 forwards to
the real `verifyGate` (which runs `runWaveGateSequence`, appends `["post-wave", "test"]` and returns
red with `consumesAttempt: true`, `orchestrate-dev.js:3554-3568`), call 2 returns `{passed: true}`
without running anything. Under that reading the four-token ledger and `ledgerAnchor.value === 4` are
both observed, and the mutation is precisely "the re-gate was dropped on attempt 2" rather than a
differently-broken seam — which is the property the paragraph itself says the construction exists to
guarantee.

Non-gating because the rule under test (§3.2 step 6) is right and unchanged, and because §5.2's
companion now carries the correct pattern one section earlier. But it is the last remaining place in
the ledger story where a literal expected value depends on an unstated fixture construction.

**To resolve** — one clause on the attempt-2 row or in the TE F-30 paragraph: the double *delegates
to the real `verifyGate` on its first call* and drops the sequence on its second, so attempt 1's four
tokens and the anchor at 4 are produced rather than assumed. Worth saying in the same breath that the
first fixture's double drops on its only call, which is what makes `ledgerAnchor.value === 2` right
there.

### F-02 — the carrier has two stated creation sites (Low, delta, local)

§3.2's code block puts it at step 4 (`TSPEC:566-569`, "created at step 4, beside `ledgerAtDispatch`"),
which is after the wave's first gate pass has already gone red and A6 is being dispatched. §3.3's new
row (`TSPEC:651`) and §3.2's TE Q-01 sentence (`TSPEC:576-580`) instead tie it to `invocations`'
lifetime, "both are created per wave, in the wave loop's own scope (§2.4, §4.3)" — and `invocations`
demonstrably predates A6, since it is what the pre-A6 pass pushes into (`TSPEC:228`, `:252-254`).

The invariant both sentences are defending — one carrier per wave, never reused across waves — holds
either way, because A6 is entered at most once per wave. So this costs nothing behaviourally. It costs
a reader, and possibly Phase P, one reconciliation: "beside `ledgerAtDispatch`" and "beside
`invocations`" are different scopes. Naming step 4 as the site and the wave as the guarantee ("created
once per A6 dispatch, and A6 runs at most once per wave, so no wave can hold another's anchor") says
both true things without asking anyone to choose.

## Questions

| ID | Question |
|----|---------|
| Q-01 | OQ-7's `.gitignore` boundary is now open on FSPEC BR-9 for five rounds. `FSPEC:206` still reads "generated outputs included" while §3.3's `apply` refuses a repair writing only ignored paths and §5.2 pins `git clean -fd` over `-fdx`. The TSPEC has done everything available to it — both halves written, boundary flagged upstream-pending. Re-emitted below; is there a routing reason it has not reached the FSPEC author? |
| Q-02 | §5.5's first fixture now asserts `ledgerAnchor.value === 2`. That literal is the configured sequence length, which §3.2 is careful never to hard-code. Should it be spelled `gateSequence.length` in the fixture, so the one-token `testCommand`-only arrangement of §5.2 could reuse the same mutation without a second literal? |

## Positive Observations

- **TE F-29's fix is a real mechanism, not a rename.** The carrier is justified from the two facts that
  actually defeat the alternatives — a top-level export cannot close over the caller's scope, and the
  driver reads members off shallow copies (`orchestrate-dev.js:3499`, `:3503`, which I checked) — and
  it reuses `declaredScope`'s shipped idiom rather than inventing one. The failure mode of getting it
  wrong is named as "round 3's defect restored as an implementation detail", which is the sentence a
  transcriber needs.
- **Both wrong initial values are named, not just the right one.** `undefined` restoring the suffix read
  and `invocations.length` collapsing into growth-since-dispatch are each stated with their
  consequence (`TSPEC:571-576`). That is the form of guidance Phase P can act on without re-deriving
  the round-3 and round-2 histories.
- **The defensive first conjunct is labelled as fixture-free, in the document.** A conjunct no test
  falsifies is normally a smell; here it is kept with a stated reason and an explicit instruction not
  to hunt for the missing fixture. That is cheaper than the alternative of a contrived test, and it is
  honest about what the suite does and does not prove.
- **PM Q-02 was closed with code, not with prose.** The enumeration is shut by quoting `scriptGate`'s
  actual definition and pointing out that a post-wave-only arrangement never reaches the seam. I read
  `orchestrate-dev.js:14143-14144` and the quote is exact, including the `runCommandFn` conjunct.
- **§2.5 records the limit of its own promise.** The run-scope paragraph could have been one hedging
  sentence; instead it names the trigger that survives, bounds the cost to inspectability, tells the
  operator what to do about it, and records the remedy in OQ-2. A reader who hits the overwrite in six
  months finds it already described rather than discovered.

## Recommendation

**Approved with minor changes** — no High findings.

Both of round 5's findings are resolved, and resolved at the layer they were raised at: §5.2's
companion now names its construction, §2.5 and OQ-2 now bound the snapshot promise honestly. The
round's own new material — the `ledgerAnchor` carrier — is the strongest part of the delta, grounded
in shipped driver behaviour I verified line by line.

Two non-gating items:

1. **F-01 (Medium)** — say that §5.5's attempt-2 double delegates to the real `verifyGate` on its
   first call, so the four-token ledger and `ledgerAnchor.value === 4` are observed rather than
   assumed.
2. **F-02 (Low)** — reconcile the carrier's two stated creation sites (step 4 vs. "beside
   `invocations`"), keeping the per-wave guarantee.

Plus Q-01's FSPEC `.gitignore` boundary, still unlanded upstream after five rounds and re-emitted as
an erratum.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 1}

APPROVAL-HASH: sha256:93385165ef7c7ad8ce2c87d990c48007fa80090dcd8980cb980513692611b4f2
APPROVAL-HASH-NORMALIZED: sha256:37c708431609bd5f086cd565f8957951a7ed91f21f168ce9111bbb6f858dd58c
REVIEWED-COMMIT: 85463b70f1d19954b78fdfc9184c09fe69d1c56f
UPSTREAM-STATE: REQ sha256:a10396e88a52c1905b0d2cdfe0bbb2174b8f100888b7a7b2d69b0e0bd5ed9645
UPSTREAM-STATE: FSPEC sha256:82f74a2da52df5be64bf266d61341a0879df8bdafe69adf2f85f5ba9db961c3e
