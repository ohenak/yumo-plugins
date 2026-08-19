# Cross-Review: test-engineer — TSPEC

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-advisory-wave-gate/TSPEC-pdlc-advisory-wave-gate.md` (v1.5)
**Date:** 2026-08-20
**Iteration:** 6
**Scope:** Local
**Delta base:** `557aacbc` (the commit carrying my v5 review) → HEAD `f2705bf4`; 106 insertions / 14 deletions, TSPEC only.

## Round-5 findings: disposition

| Prior finding | Verdict | Evidence |
|---|---|---|
| F-29 (High) — step 6's anchor had no seam: `buildA6SeamOps`' `apply` cannot write into `runWaveGateSeam`'s scope, and a property on the returned SeamOps object dies in the shallow copies the driver and the §5.5 fixtures both work with | **Resolved** | The anchor is now a **mutable carrier**, exactly the `declaredScope` idiom the document already contained. `ledgerAnchor` appears in `buildA6SeamOps`' signature (§3.3 code block), has its own §3.3 row stating "Not a SeamOps member … written in place by `apply` and read by §3.2's step-6 check", the `apply` row states the write as its first statement and rules out both wrong spellings ("never an assignment to a variable of its own, never a property set on the returned SeamOps object"), and §3.2 carries the three-line code sketch Phase P transcribes. The mechanism is now stated end to end, and the shallow-copy argument is grounded: `orchestrate-dev.js:3499`, `:3503`, `:3521`, `:3546` all read members off the object the driver was handed |
| F-30 (Medium) — neither mutation fixture asserted an anchor was recorded, so a build that never records one passes the pair | **Resolved** | §5.5 gains a paragraph naming the construction (`{...seamOps, verifyGate: fake}` — real `apply`, real `producedPaths`) and a **positive companion per fixture**: attempt-2 fixture asserts `invocations` reads the four tokens attempt 1 genuinely produced and `ledgerAnchor.value === 4`; attempt-1 fixture asserts `ledgerAnchor.value === 2` with the pre-A6 pair below it. I re-derived both: pre-A6 pass appends 2, attempt 1's `apply` anchors at 2, its genuine red sequence appends 2, attempt 2's `apply` anchors at 4. Both literals are right, and the pair now distinguishes "refused for the right reason" from "refuses always" |
| F-31 (Low) — the anchor's pre-`apply` value was unstated and the first conjunct fixture-free | **Resolved** | §3.2 names `-1` as the fail-closed initial value, names both wrong choices (`undefined` restores the tail read; `invocations.length` at build time makes the conjunct vacuous), and states outright that the conjunct is defensive and no fixture falsifies it, with the reachability argument cited (`:3521` — `resolved` only follows a successful ACT) so Phase P does not go hunting for one |
| Q-01 (carrier lifetime per wave or per run) | **Answered** | §3.2 and §3.3 both tie the carrier's lifetime to `invocations`' lifetime — one per wave, created in the wave loop's own scope, "so a wave-2 seam cannot start holding wave 1's anchor even if a later refactor hoists `buildA6SeamOps` construction" |

Scan of the round's other changed content — §2.5/OQ-2's run-scoping limit, §5.2's two-attempt companion and gate-sequence enumeration closure — found no new High.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-32 | Medium | Local | **`sameSequence` is the comparator the whole conjunct (iii) rests on, and the document never defines it.** §3.2's step-6 block reads `sameSequence(invocations.slice(ledgerAnchor.value), gateSequence)`; `sameSequence` appears exactly once in the TSPEC (line 586), is not in §3.3's member table, not in §3.5's signature list, and does not exist at HEAD (`grep sameSequence pdlc/workflows/orchestrate-dev.js` is empty), so it is a new symbol Phase P invents from a name. The name alone does not pin length-sensitivity or order-sensitivity — the two properties three rounds of findings have been about. §5.5's fixtures do constrain it usefully in one direction (both mutation fixtures have an **empty** slice, so a comparator lenient about a short slice goes green and the fixtures catch it), but nothing pins the other: a containment- or prefix-shaped comparator that ignores extra tokens above the anchor passes every fixture in §5.2 and §5.5. One sentence — "element-wise equality, equal length, order-significant" — beside the code block closes it, and costs nothing since §3.2 already names the two wrong initial values for the same reason | §3.2 step 6, §3.3, §3.5 |
| F-33 | Low | Local | **§5.5's attempt-2 fixture cites `orchestrate-dev.js:3554-3568` for "driver reverts, `consumesAttempt: true`", and the revert half is not in that range.** `await doRevert()` on the red-verify path is `:3548`; `:3554-3568` is the `consumesAttempt === true` branch — attempt increment, budget check, `continue`. The claim is true, the anchor covers only its second half. `:3548, :3554-3568` reads correctly. Filed because this document's citations have otherwise been exact enough to check line by line, and a reader who opens `:3554` to find the revert will not find it | §5.5 |

## Questions

None this round.

## Positive Observations

- F-29 was answered by the idiom the document already had rather than by a new one. `ledgerAnchor` is described as "the same idiom and the same reason as `declaredScope`", the two rows now sit adjacent in §3.3, and the reason is stated once in a form Phase P can act on. That is cheaper to implement and cheaper to review than a bespoke mechanism would have been.
- The revision names the wrong answers, not just the right one. `-1` is stated as "a *stated* value, not an omission", with `undefined` and `invocations.length` each named and each with its failure mode spelled out. Specs usually state the choice; stating the near-misses is what stops a transcription error, and it is the same discipline §5.5's fixture table already applied to weaker quantities.
- §5.2's two-attempt companion now pins its own construction unprompted: the red-then-green outcome is driven through the injected `_runCommand`, not through a `verifyGate` double, and the paragraph explains that the §5.5-style construction would append nothing and make the six-token literal a red test against a correct implementation. A fixture that explains why the neighbouring section's technique is wrong *here* is a fixture Phase P cannot mis-transcribe.
- PM Q-02's enumeration closure is grounded, not asserted: "A6 is entered only under `scriptGate`, and `scriptGate` is `Boolean(implConfig.testCommand) && typeof runCommandFn === "function"`". Checked — `orchestrate-dev.js:14142-14144`, verbatim. The post-wave-command-only shape genuinely cannot reach the seam, so there is nothing uncovered, and the document says so with the mechanism rather than with a promise.
- Every code citation I sampled resolves: `:3499`/`:3503` (seam members read into `gateCtx`), `:3521` (`await seamOps.apply(verdict)`), `:3544` (`log("VERIFY")`), `:3546` (`await seamOps.verifyGate()`), `:3428`/`:3459` (the non-gate `attempts` paths), and `ADVISORY_REFUSAL_REASONS` really does hold eight members (`:2297-2306`), which is what §5.2's companion assertion pins.

## Recommendation

**Approved with minor changes**

All three of my round-5 findings are resolved and Q-01 is answered. The anchored-growth rule now has a carrier that can physically hold it, a stated fail-closed initial value, and a mutation pair that proves the anchor was recorded rather than merely that something was refused — conjunct (iii) is implementable as written. F-32 (define `sameSequence`) and F-33 (one citation range) are non-gating; both are single-sentence edits and can land with the next revision or in Phase P's lint pass.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 1}
