# Cross-Review: product-manager — TSPEC

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-plugin-retirement/TSPEC-pdlc-plugin-retirement.md` (v0.10)
**Date:** 2026-08-17
**Iteration:** 10
**Scope:** Product lens only — requirements traceability, scope compliance, acceptance-criteria fidelity. Frozen round: only delta-introduced defects or contradictions with the repository at HEAD can block.

## v9 findings disposition

Delta re-review against `CROSS-REVIEW-product-manager-TSPEC-v9.md`. Diffed `3b7003e6..HEAD` on the TSPEC (97 insertions / 24 deletions, one file, six commits `634e67a1`…`f6643915`); only changed sections scanned for new issues.

| v9 ID | Severity | Status | Evidence |
|---|---|---|---|
| F-01 | High | **Resolved** | `consolidationHookParity.test.js` is now a swept-surface table row (TSPEC:829), a member of both children's file lists (TSPEC:936–941, :988–993), and carries a §2.9 class-6 disposition (TSPEC:299). The four bare capability ternaries are dispositioned by *conversion*, not exemption, in the same commit as the AT-3.3 clause 2 addition, with the reason stated (an exemption would be a standing carve-out inside an executable oracle). Verified in the tree: `(canRunDifferential ? test : test.skip)` at `consolidationHookParity.test.js:203`, `:227`, `:343` and `(hasBash ? test : test.skip)` at `:382`; `const hasBash` `:51`, `probePyBin()` `:54`, `const PY_BIN = probePyBin()` `:65`, `const canRunDifferential = hasBash && !!PY_BIN` `:73` — every cited anchor is exact. The stated fifth-key cost is real: `KNOWN_CAPABILITY_KEYS` is `["bash", "git", "hash", "uid-nonroot"]` at `pdlc/workflows/__tests__/helpers/skipSink.js:55`, so `python` is genuinely new. |
| F-02 | High | **Resolved** | The absence-only join now carries a positive half (TSPEC:1005–1015): per invocation, the set of `testResults` file paths from the child's `--json` output **set-equals** the literal list transcribed from §5.5's table, and the child's exit status is asserted (`0` green, non-zero red, violation matched on the fixture's leaf title). Set-equality rather than containment, expected side transcribed from the spec table rather than derived from the child — no implementation echo, and a silently uncollected module reds. The document states the pairing as one obligation ("either alone leaves the join provable-by-vacuity"). |
| F-03 | Medium | **Resolved** | The out-of-domain paragraph is now a **package rule** rather than a file list (TSPEC:877–888), and names all three edited engine modules. Confirmed all three exist: `pdlc/engine/__tests__/ci-arrangement.test.js`, `smoke.test.js`, `fs-observation.test.js`. |
| F-04 | Low | **Resolved** | The cost paragraph moved below the second falsifiability bullet (TSPEC:1085–1093); the two naming/configuration bullets are contiguous again. It also now pins `--runInBand` as a member of the set-equality argument vector, which is more than was asked. |
| Q-01 | — | **Answered** | TSPEC:1053–1060 pins the host's `mkdtempSync` constructions to the OS temp directory, never the repo root, with the `documentOracles.test.js` / `coveredViolations` whole-tree walk given as the reason a repo-root fixture would red the child for an unrelated cause. Consistent with §5.2:708. |
| Q-02 | — | **Answered** | TSPEC:1060–1066: every PLAN task that edits or adds a `*.test.js` module under `pdlc/workflows/__tests__/` carries the obligation to extend the table and both lists in the same task, with PLAN holding a one-line pointer back to §5.5. |

Arithmetic re-checked: the table now enumerates **nine** surviving in-surface modules; green child = nine minus the host `consumerCleanup.test.js` = **eight**; red child = green ∪ `fixtures/skipJoinFalsifier.js` = **nine**. The membership sentence (TSPEC:939–941), part 1 (TSPEC:988–993) and the cost paragraph ("eight modules green, nine red", TSPEC:1086) all agree.

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Low | Local | **Two sentences disagree on how many edits are "addition-shaped".** The swept-surface table calls `consolidationHookParity.test.js` "the sweep's one *addition*-shaped edit to a surviving module" (TSPEC:829), while §7's rule-shape note names *two* addition-shaped edits, that module and `skillFiles.test.js` (TSPEC:1352–1355). Both readings are defensible — `skillFiles.test.js`'s work is a retarget plus AT-3.1's static half — but a later reader auditing table completeness will hit the mismatch. Nothing in the join or in any acceptance criterion depends on the count; recorded, not gating. | FSPEC AT-1.3; TSPEC §5.5, §7 |
| F-02 | Low | Local | **The class-6 serialisation story needs one reading pass to resolve.** §2.9's class-6 row and TSPEC:1044–1050 together describe three serialised edits to `helpers/driftCapabilities.js` (class 3's TT-1b row, the ten `"bash"` conversions, then the `python` key plus four rows), the last "riding in the same class-6 commit as the parity module's new assertion". Since two of the three commits are class-6, "never batched with either" reads at first as if a single class-6 commit held both. The content is correct and the PLAN can implement it as written; a clause naming the class-6 commits as *two* would make it read once. | TSPEC §2.9, §5.5 |

DEFERRED: the `python` capability key widens `KNOWN_CAPABILITY_KEYS` from four to five and the `WHAT IS NOT ENFORCED, AND WHY` paragraph is restated in the same edit — worth a PLAN-time check that the restated paragraph is derived from the spec rather than from the new key list.

FINDING: Low | delta | local | §5.5 swept-surface table row (TSPEC:829) vs §7 rule-shape note (TSPEC:1352–1355) | "one addition-shaped edit" vs two named addition-shaped edits
FINDING: Low | delta | local | §5.5 serialisation paragraph (TSPEC:1044–1050) + §2.9 class-6 row (TSPEC:299) | three serialised `driftCapabilities.js` edits, two of them class-6, reads ambiguously on first pass

## Questions

| ID | Question |
|----|---------|
| Q-01 | The green child now collects `consolidationHookParity.test.js`, whose differential rows spawn a real `bash` and a real Python (`probePyBin()`, `:54`–`:65`). After conversion those become registered `itOrSkip` sites, so the join stays satisfiable on a capability-poor runner — but the child's `--json` exit-status assertion (TSPEC:1010–1013) expects `0` for the green child. A registered skip keeps jest's exit at `0`, so this looks consistent; worth one PLAN-time confirmation that no converted row leaves a non-zero exit on a runner without Python. |

## Positive Observations

- **Both v9 High findings were closed in oracle terms, not prose.** F-02's repair in particular states the positive half as set-equality over the child's own `--json` `testResults` paths against a literal transcription of §5.5's table, and binds it to the argument-vector check as a single obligation (TSPEC:1005–1015). That is the shape that makes "the join came out empty" mean something for AC-1.3 rather than being satisfiable by a child that collected nothing.
- **The parity module was admitted with its cost priced rather than waived.** Converting the four ternaries instead of carving them out, and naming the fifth capability key and the four `SKIP_INVENTORY` rows that follow, is the product-honest choice: AC-3.3's new assertion lands on the module that already spawns the hook, and AC-1.3's promise is not weakened by a standing exemption. Every anchor cited for that argument checks out in the tree exactly as written.
- **The out-of-domain closure is now a rule, so it stays true as the sweep grows.** Stating the exclusion over the `pdlc/engine` package rather than over a two-item list (TSPEC:877–888) means a later engine-side edit cannot silently falsify the paragraph a reader uses to confirm the domain is closed.
- **Q-01's answer connects a real repository hazard to a readable failure.** Pinning host fixtures outside the repo root because `coveredViolations` walks the whole tree is the same hazard this repo has hit before; recording it in the TSPEC keeps a red child interpretable as "the join failed".

## Recommendation

**Approved with minor changes**

Both v9 High findings are resolved, the Medium and the Low are resolved, both v9 questions are answered, and no previously approved section was reopened. The two findings above are Low, wording-level, and neither changes an acceptance criterion or an obligation. Nothing in the delta contradicts the repository at HEAD — every production symbol and line anchor introduced this round was verified in the tree.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 2}
