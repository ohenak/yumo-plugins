# Cross-Review: product-manager — PLAN

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-learnings-injection/PLAN-pdlc-learnings-injection.md` (v0.3)
**Date:** 2026-08-20
**Iteration:** 3
**Mode:** delta re-review — prior findings PM F-07, F-08 (v2, reviewed at commit `94539626`), then the v0.2→v0.3 changed sections only.

## Prior findings disposition

| Prior | Severity | Status in v0.3 | Evidence |
|---|---|---|---|
| F-07 — LI-01's `learningsPremises.test.js` asserted the §Overview change-surface table's **absence** claims as standing premises, which this PLAN's own tasks falsify at batches 3 and 4, so the suite as written halted every batch after 3 | High | **Resolved** | Two coordinated edits, and no residue anywhere else in the document. §Overview gains an explicit rule — "Existence claims and absence claims are checked differently (PM F-07)": existence rows (`orchestrate-dev.js`'s symbols, `consolidate-learnings.js`'s exports, `helpers/seams.js`'s doubles) stay standing premises asserted every batch; the four absence rows (no `learnings*` file under `__tests__/`, no root `scripts/`, no `.baseline-worktree` ignore rule, no `fixtures/learnings-baseline/` subtree) become **one-time measurements at HEAD**, with the falsifying tasks named against their batches (LI-01/LI-02/LI-03/LI-13 at 1–2, LI-04 and LI-05 at 3, LI-06 at 4 — each matches the §File-ownership manifest's batch column). LI-01's row now says the suite asserts existence and shape "and **never an absence claim**", and re-homes the four measurements as one of two **written records in the completion note**, beside the H-2 engine-failure triage. I grepped the whole document for `absence` and `premise`: no surviving sentence asks a standing suite to assert an absence, and the batch-1 and green-terminal gate rows (§Verification) are consistent with the new reading |
| F-08 — DoD 4's lower-case sentence fragment left the byte-identity criterion unreadable as one sentence | Low | **Resolved** | DoD 4 now reads "… still prompt-identical. **The claim is:** a disabled run, an empty corpus, an unlistable corpus and an admits-nothing configuration each compose prompts character-for-character equal to the committed pre-feature baseline (AC-4.1, AC-5.1a, AT-24); every non-authoring dispatch likewise (AC-4.3)." The four-state enumeration is now a criterion a verifier reads as one clause, and the deliberate-strengthening framing I asked about in Q-02 is untouched |

**Q-04 and Q-05 both answered, and both answers changed the artifact rather than only the prose.** Q-04 (would a fifth authoring site still surface early once the absence claims left the suite?) is answered by re-specifying P-2a as a **set equality over the four authoring call sites** in LI-01, so a fifth site reds at batch 1 instead of waiting for LI-11's composition-site equality at batch 12 — the right instinct, and the answer I wanted; F-09 below is about the *key* that equality is taken over, not about the answer. Q-05 (are the PROPERTIES obligations T-O-4…T-O-6 inside the expected-red ledger?) is answered by new **P-A-3**: the ledger's universe is this PLAN's own `learnings*` files, PROPERTIES sits outside it, and the process obligation that makes that sound is now stated — a PROPERTIES suite may be committed to this branch **only once green**, or after batch 14, else its rows enter the ledger by name. That closes the hole I flagged: the ledger stays a set equality either way, and a red suite outside it is named as the thing that must not happen.

**Verified independently at HEAD on `feat-pdlc-learnings-injection`**, since the delta rests on measured claims: `pdlc/workflows/__tests__/` still contains no `learnings*` file (so LI-14's directory glob has exactly the twelve members the manifest schedules); `orchestrate-dev.js` is **15,311** lines, as §File-ownership and LI-23 both state; `consumerCleanup.test.js`'s `AT-4.1` runs `execFileSync("git", ["status", "--porcelain"])` at the repository root and asserts `""` with **no `-uno`**, exactly as the rewritten §Verification paragraph now says, so untracked-but-uncommitted new test files do red it; TSPEC §D.2 carries `corpusOutcome: null, // | "RSN-UNLISTABLE" | "RSN-EMPTY"`, which is the premise LI-23's non-`null` scoping rests on; and FSPEC's AT-15 bullet plus its E-07/E-35 edge rows do carry **four** clauses, the fourth being the direct `docs/discarded/LEARNINGS-x.md` document as an ordinary corpus member — which REQ **AC-2.6** states in its own words ("*and given* one directly at `docs/discarded/LEARNINGS-*.md`, it is a corpus member on ordinary terms"). The four-clause restatement is faithful to REQ, not a widening.

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
