# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-headless-engine/REQ-pdlc-headless-engine.md`
**Date:** 2026-08-11
**Iteration:** 6
**Scope:** Delta re-review of the v5 revision. Technical feasibility, implementability,
completeness of error handling, architectural compatibility. Product framing, UX and
test-pyramid choices are out of scope.

## Method

Delta re-review. I diffed `afe0351f..HEAD` — the commit carrying my v5 review — across the
whole tree, not only the REQ, because v5's blocker had one half in the REQ and the larger
half in the REQ-owned extraction `docs/_constraints/pdlc-engine-baseline.md`. The revision is
three files: one line in the REQ, seven lines in the baseline, and a new POSTMORTEM-F (not an
artifact I review). Everything else is unchanged, so unchanged sections are not re-litigated.

Per DEC-ERR-03 I re-derived every changed row against HEAD rather than reading the edit as
self-certifying: I opened each `file:line` in the changed cells, and I recomputed the table's
totality claim from scratch, since this edit *split rows* and totality is exactly what a row
split can break. Nothing in this round rests on the author's summary of its own work.

## Disposition of v5 Findings

All three resolved. Each verified against HEAD, not against the diff's description of itself.

| ID | v5 finding | Disposition |
|---|---|---|
| F-25 (High) | M-ENG-06's AC-4.4 row and §1.2a's red list both declared AC-4.4 **red at HEAD**, contradicted by the line the row cited | **Resolved, both halves.** The row now reads *partially green* and names the split exactly as the evidence supports: an auth outcome is classified, named with its failing source, excluded from the retry loop and test-covered; unasserted are the halt-path stop and the closed-catalogue naming AC-4.1 owns. I re-derived every citation: `AuthPolicyError` is defined at `transport.mjs:23`; `classifyThrown` opens at `:98` and names it **first** at `:100`; it is thrown at `:204` with the failing source interpolated into the message, before any model output (`resultYielded` is asserted `false` in the covering test); `adapter.mjs:291` rethrows anything that is not a `RateLimitedError`, so an auth failure is structurally unreachable from the retry loop; `__tests__/transport.test.js:50` covers it with `instanceof AuthPolicyError` at `:63`. §1.2a's red list dropped AC-4.4 in the REQ's one changed line. |
| F-26 (Medium) | AC-4.1 sat in the "green — regression-protecting" row while its set-equality half was unasserted, contradicting the table's new totality claim | **Resolved.** AC-4.1 was lifted out of the green row into its own *partially green* row. I re-derived the new row's three factual claims: `transport.mjs` defines exactly four error classes (`AuthPolicyError:23`, `RateLimitedError:33`, `TimeoutError:46`, `TransportError:55`) plus the success path; `transport-contract-violation` and `agent-reported-failure` appear nowhere under `pdlc/engine/`; no test under `pdlc/engine/__tests__/` asserts set-equality over any outcome catalogue (the one sorted `deepEqual`, `smoke.test.js:260`, is over a review-file list, not the taxonomy). |
| F-27 (Low) | AC-2.3 row cited production lines only, so a reader could not check the asserted half | **Resolved.** The evidence cell now appends `__tests__/transport.test.js:170`; that line is indeed `test("dispatch env spreads the provided env rather than replacing it", …)`. The row's state description is unchanged and still correct. |

**Totality recomputed independently.** This is the claim the row split most easily breaks, so I
did not take it on trust. The REQ declares 26 `**AC-n.m**` criteria (AC-1.1…1.5, 2.1…2.5,
3.1…3.5, 4.1…4.5, 5.1/5.2, 6.1…6.4). M-ENG-06 now has seven data rows; the union of their AC
cells is exactly those 26, with each criterion in exactly one row. AC-4.1 is no longer
double-counted — it left row 1 when it gained row 2. AC-4.5 does appear in two rows, but as an
explicit clause-level partition ("except its per-dispatch auth clause" / "AC-4.5's per-dispatch
auth clause"), which pre-dates this round and is the intended reading of a split criterion, not
a duplicate. Set-equality holds in both directions.

**The two documents now agree.** §1.2a's red list and M-ENG-06's red row enumerate the same
nine entries (AC-1.1, AC-2.1/2.2/2.4, AC-3.3, AC-3.5, AC-4.5's per-dispatch auth clause,
AC-5.1/5.2, AC-6.2/6.3/6.4). Before this round they diverged by AC-4.4; the divergence is gone,
and it is gone in the direction the evidence pointed rather than by editing the list to match
the wrong row.

## Findings

None. No open High, Medium or Low findings remain against this document.

The revision changed one line of the REQ and seven lines of its extraction, and I could not
break either against HEAD. No new issue appeared in the changed sections, and the change did
not disturb anything downstream of it: the criteria text is untouched, no approved decision was
reopened, and the only structural invariant this edit could have broken — M-ENG-06's totality —
still holds under an independent recount.

## Questions

Q-06, Q-08 and Q-09 carry forward unchanged from v4/v5. All three are TSPEC-level decisions
rather than REQ gaps, none is in this round's scope, and none gates approval. They are restated
only so they are not lost at the phase boundary.

| ID | Question |
|----|---------|
| Q-06 | *(carried)* How does AC-6.2's opt-in live smoke coexist with AC-6.1's hermeticity guard, when AC-6.1 states the guard "fails the suite on any attempt to construct a real transport"? Presumably the guard is armed per-suite rather than per-process; which one owns the switch is a TSPEC decision that AC-6.1's wording currently forecloses. |
| Q-08 | *(carried)* Corpus run iv reaches `MODEL_ADVISORY_FALLBACK`, forcing `fable` model resolution to fail. That is HEAD's behaviour (`orchestrate-dev.js:1861`); the question of what the engine does with it is TSPEC's, not the REQ's. |
| Q-09 | *(carried)* Is M-ENG-08's `~/.claude.json` `$HOME`-relative or cwd-relative for AC-2.1 rows 2/4/5? Fixturing via per-test `HOME` is the natural reading — the SDK reads the file in-process — but the REQ leaves it to TSPEC. |

## Positive Observations

- **The fix went where the evidence pointed, not where it was cheapest.** A row declaring AC-4.4
  red and a section quoting that row is a contradiction with two exits: correct the row, or
  delete the mention. The cheap exit would have left the baseline wrong and the REQ quiet. The
  revision took the expensive one — it rewrote the row to the state the cited lines actually
  support, then let §1.2a follow. That is the ordering that keeps the extraction authoritative.
- **`partially green` is now carrying real weight as a category.** Both rewritten rows name
  *which half* is asserted and *which half* is open, in the same sentence. AC-4.4's row is the
  best example: four distinct pieces of green (classified, named with source, excluded from
  retry, test-covered) and two named gaps. A planner reading that row knows what to build without
  re-deriving HEAD, which is the whole point of a baseline extraction.
- **F-26 was fixed by splitting the row rather than softening the green row's label.** Relabelling
  the multi-AC green row would have downgraded seven healthy criteria to protect one. Lifting
  AC-4.1 into its own row keeps the green row honest and gives AC-4.1 a place to describe its own
  split. It also preserved totality, which the lazier fix would have quietly broken.
- **F-27, a Low, was fixed rather than deferred.** The AC-2.3 row was the one row citing only
  production lines; it now cites the covering test like every sibling. Small, but it removes the
  outlier that would have sent a planner hunting for an assertion that already existed.

## Recommendation

**Approved**

All three v5 findings are resolved, verified against HEAD rather than against the diff. Every
`file:line` in the changed cells resolves to what the cell claims: `transport.mjs:23`/`:98`/`:100`
/`:204`, `adapter.mjs:291`, `transport.test.js:50`/`:63`/`:170`. The two counting claims I could
not take on trust — the four-class error catalogue and the table's totality over 26 criteria —
I recomputed independently, and both hold. §1.2a and M-ENG-06 now enumerate the same red set.

No High findings are open, and none were introduced. Nothing in this round's changes needs
further work before Phase F proceeds; Q-06, Q-08 and Q-09 remain TSPEC-level and are recorded,
not gating.

## Verdict

VERDICT: Approved
{"high": 0, "medium": 0, "low": 0}
