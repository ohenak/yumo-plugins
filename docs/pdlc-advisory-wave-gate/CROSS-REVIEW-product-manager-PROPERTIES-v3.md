# Cross-Review: product-manager — PROPERTIES (upstream-cascade confirmation)

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-advisory-wave-gate/PROPERTIES-pdlc-advisory-wave-gate.md
**Date:** 2026-08-20
**Iteration:** 3
**Scope:** Upstream-cascade confirmation only. PROPERTIES' own bytes are unchanged since my v2 approval
(`REVIEWED-COMMIT: 7f8dcda6`). TSPEC moved from `sha256:c0ee14a4…` (v1.7, commit `61a9605d`) to
`sha256:79777fa6…` (v1.8, commit `a349767b`) in a Phase PR erratum round. The single question answered
here: does PROPERTIES still hold as a faithful compression of TSPEC as it now stands?

## Delta Examined

One TSPEC commit stands between my approval and HEAD: `a349767b` *"mark ADVISORY_SEAM_PHASES
module-private, name PROP-REC-07's entry oracle"*, 43 insertions / 3 deletions, all of it in the
version cell, the changelog, and §3.1's interface prose. REQ (`sha256:a10396e8…`) and FSPEC
(`sha256:82f74a2d…`) are byte-identical to the state my v2 anchors recorded, so the only upstream
surface that can have moved under PROPERTIES is TSPEC §3.1.

What the round decided, and what PROPERTIES leans on:

| TSPEC v1.8 change | PROPERTIES text that reads it | Still faithful? |
|---|---|---|
| §3.1 marks `ADVISORY_SEAM_PHASES` *(module-private)*; absence from the export list is stated as construction, not omission (`TSPEC:531`–`:534`) | PROP-REC-07: "`ADVISORY_SEAM_PHASES` is module-private at `orchestrate-dev.js:3108` and TSPEC §3.1 does not export it" | Yes — and now corroborated rather than merely unchallenged |
| §3.1 names the behavioural oracle as the **written escalation entry**, not the constant (`TSPEC:540`–`:545`) | PROP-REC-07: "The oracle is the **written entry**, not the constant" | Yes — verbatim agreement |
| §3.1 names the `unknown` fallback as the observable making a missing `A6` row visible outside the module | PROP-REC-07's `unknown`/`unknown` negative control on a fixture seam absent from the table | Yes |
| §3.1 confirms `advisoryEscalationLog.test.js` as the file home, already on §5.1's edited-files map (`TSPEC:551`, `:1198`) | PROP-REC-07's Home cell `advisoryEscalationLog.test.js` (A6-17); PLAN manifest `:152` | Yes |
| §6 OQ-12 restated: A6 only ever entered on an already-red wave, so `outcome: "halted"` is true by construction | PROP-REC-07's trace `AC-6.2, TSPEC §3.1, §6 OQ-12` | Yes |

The direction of the edit is the point: TSPEC moved **toward** the position PROPERTIES already held.
The se-review erratum could have been resolved by widening the interface (exporting the table so a
unit test could import it); §3.1 explicitly declined that and adopted PROPERTIES' entry-observable
oracle instead, naming the reason — a frozen-literal assertion restates the diff rather than testing
behaviour. No acceptance criterion was narrowed, broadened, or re-triggered. AC-6.2 at `REQ:460`–`:462`
still obliges an appended entry carrying the root-cause class, the tier's existing fields, and one
decision sentence; PROP-REC-03, PROP-REC-04 and PROP-REC-07 still map to it at `PROPERTIES:336`.


## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Low | Process | The `orchestrate-dev.js:3338` anchor that PROP-REC-07 uses for "falls back to the literal `unknown`" points at the lookup line (`const placement = ADVISORY_SEAM_PHASES[seam];`); the `"unknown"` literals themselves are at `:3345`–`:3346`. This is my v2 F-01, and it is no longer a PROPERTIES-only drift: TSPEC v1.8 (`TSPEC:543`) now pairs the same `:3338` anchor with a quote of the `:3345` line, so the two documents are consistent with each other and inconsistent with the file by the same seven lines. Downstream cost is a reader jumping to a lookup rather than a ternary — not a semantic error, and it does not touch AC-6.2's obligation. Correct in whichever document is edited next; do not re-open the round for it. | AC-6.2 |

FINDING: Low | inherited | nonlocal | PROP-REC-07 Home/trace cell | `orchestrate-dev.js:3338` anchors the `ADVISORY_SEAM_PHASES[seam]` lookup, not the `"unknown"` literals at `:3345`–`:3346`; TSPEC v1.8 now carries the same off-by-seven pairing, so the documents agree with each other rather than with the file.

No High findings. Nothing in the TSPEC delta cites a claim PROPERTIES no longer supports, and nothing
PROPERTIES asserts about TSPEC §3.1 has become false — the reverse: two of its sentences moved from
"true but unstated upstream" to "true and stated upstream".


## Questions

| ID | Question |
|----|---------|
| Q-01 | None for this round. My v2 Q-01 (PROP-REC-07's RED task A6-17 spanning two GREEN tasks, A6-05 and A6-18) is untouched by this delta and still needs no answer. |


## Positive Observations

- **The erratum was resolved in the direction that costs the product nothing.** Exporting
  `ADVISORY_SEAM_PHASES` would have widened a shipped module's public surface to satisfy a test-shape
  convenience, and TSPEC §3.1 says so in as many words (`TSPEC:535`–`:539`). PROPERTIES had already
  chosen the observable an operator can actually see — the written entry's *Pipeline state* field —
  and the upstream round ratified it. Convergence toward the downstream document is a good sign that
  the downstream document was reading the requirement correctly.
- **AC-6.2's fidelity survived a round it could easily have lost.** The criterion is about an
  *appended entry carrying named fields*. Both plausible resolutions kept the code identical; only
  one kept the oracle on the criterion's own observable. PROP-REC-07's positive-first, absence-paired
  shape (A6 reads `I`/`halted`; A3–A5 keep `DOD`/`halted` and `PUB`/`halted` on the same suite; a
  fixture seam absent from the table reads `unknown`/`unknown`) is unchanged and now has an upstream
  paragraph explaining why it is the right shape.
- **The trace chain is intact end to end.** AC-6.2 → PROP-REC-07 (`PROPERTIES:336`) → A6-17
  (`PROPERTIES:397`, PLAN `:111`, PLAN manifest `:152`) → `advisoryEscalationLog.test.js` as an
  *edited* file on TSPEC §5.1's map (`TSPEC:1198`) → AT-06-3/-5/-6 (`TSPEC:1558`–`:1561`). I walked
  every hop against HEAD; no link broke in the round.
- **The changelog does the re-grounding bookkeeping honestly.** v1.8 records that REQ and FSPEC were
  re-read at HEAD, found byte-identical, and that nothing upstream was decided in the round, so
  nothing was owed absorption. That is exactly the statement a downstream reviewer needs in order to
  bound a confirmation to one section instead of re-reading the chain.


## Recommendation

**Approved with minor changes**

PROPERTIES still holds against TSPEC as it now stands. The round touched one section of one upstream
document, and it touched it in PROPERTIES' favour: the two sentences PROP-REC-07 leans on
(`ADVISORY_SEAM_PHASES` is module-private; the oracle is the written entry, not the constant) are now
asserted upstream rather than merely uncontradicted. No acceptance criterion moved, no property lost
its trace, no oracle lost its observable. The single Low finding is a shared file:line anchor
imprecision now common to both documents; per `DEC-DOC-01` it is `Process`-scoped and non-gating, and
it should be absorbed by whichever of the two documents is edited next rather than by re-opening this
round.


## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 1}

APPROVAL-HASH: sha256:7a88c5f01e4850d4e0c11e1865b4bbc7ed08f952cfa8b6ed0f68afc331ab502d
APPROVAL-HASH-NORMALIZED: sha256:b5f27734c8c3ee8d054961df670e9c08c6abf333fa720898b6298c9485490082
REVIEWED-COMMIT: 87d4c23367e29e4ecc28f5df4fc9317f74a69b06
UPSTREAM-STATE: REQ sha256:a10396e88a52c1905b0d2cdfe0bbb2174b8f100888b7a7b2d69b0e0bd5ed9645
UPSTREAM-STATE: FSPEC sha256:82f74a2da52df5be64bf266d61341a0879df8bdafe69adf2f85f5ba9db961c3e
UPSTREAM-STATE: TSPEC sha256:79777fa6310e87180c6901e9d1b87ddcb9f926147fefb9f07c52720d0c5ff8d6
UPSTREAM-STATE: DECISIONS sha256:5145d90af8ed14261979b0c46fa60791c11ac9fd672950f1fab634f7e6c5ccc3
UPSTREAM-STATE: PLAN sha256:bfb7dc37498abd7aef4a55d54d5adba7537d7cac345d20530afbcf0e664bb37f
