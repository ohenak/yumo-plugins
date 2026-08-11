# POSTMORTEM — Phase T — pdlc-headless-engine

| Field | Value |
|---|---|
| Upstream | `REQ` → `FSPEC` → `TSPEC` → **POSTMORTEM-T** |
| Downstream | operator decision; `LEARNINGS-pdlc-headless-engine.md` at harvest |
| Cross-Reviews | `CROSS-REVIEW-{product-manager,test-engineer}-TSPEC-v{1..6}.md` (12 files); `CROSS-REVIEW-{software-engineer,test-engineer}-FSPEC-v5.md` (erratum delta confirmation, 2 files) |
| LEARNINGS | `docs/pdlc-headless-engine/LEARNINGS-pdlc-headless-engine.md` |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | halted | Claude (se-author) | 2.0 | 2026-08-11 |

RESOLVED: no

This is the **second** halt of Phase T on this feature. The first — five rounds spent on TSPEC
§7.4's model-map witness — was cleared on 2026-08-11 (`22eb0b3b`) and round 6 converged the TSPEC
with both approvals recorded (`7cd5caf8`). That record is preserved at the end of this file as
§Prior Halt. Everything above it describes the current halt, which has a different shape: the
TSPEC is converged and nobody disputes it. Phase T halted on the ERRATUM-PROTOCOL step that runs
*after* convergence — the delta confirmation of the **FSPEC** erratum round.

## Phase

**Phase T — TSPEC authoring and cross-review. The halt is not a review-round exhaustion. The TSPEC
converged in round 6 and carries both approvals. Phase T halted on the erratum protocol: one
erratum was routed upward to the FSPEC, the targeted edit landed, and the delta confirmation of
that edit was non-approving from both FSPEC approvers.**

| | |
|---|---|
| Documents | `docs/pdlc-headless-engine/TSPEC-pdlc-headless-engine.md` (v1.5, **converged**, anchors recorded in `7cd5caf8`) and its upstream `docs/pdlc-headless-engine/FSPEC-pdlc-headless-engine.md` (v1.4) |
| Branch | `feat-pdlc-headless-engine` |
| Halt reason as reported | *ERRATUM-PROTOCOL — FSPEC delta confirmation non-approving: `[se-review, te-review]`* |
| The erratum | BR-MODEL-3 (`FSPEC:654-656` as raised) claimed M-ENG-07's model-map corpus is "reachable from dry runs"; the dry-run surface composes one skill's prompt and dispatches nothing (`bin/pdlc.mjs:97-104`, `:189-191`), so the corpus is reachable from hermetic fixture-driven runs only |
| Round budget | **not exhausted.** `MAX_REVIEW_ROUNDS = 5`; the TSPEC converged at round 6 of the 6–10 window opened by the prior halt's re-invocation. The binding limit was the erratum bound: **one erratum round per upstream document per phase** |
| Erratum window | `7cd5caf8` (TSPEC approval anchors) → `d98c7e88` (targeted FSPEC edit) → `c417862d` / `14480fc5` (both non-approving confirmations) |
| Terminal state | the erratum is **resolved at the site it names and unresolved for the document**: BR-MODEL-3 now says the dry-run surface "is never the corpus's source", while §6.3's preamble (`FSPEC:573-576`) still says the dry-run surface is what exercises the §7.3 model map. No second erratum round is available, so the phase halted |

The distinction matters for the fix. Nothing here says the TSPEC is unconverged, and nothing says
the erratum edit was wrong — both reviewers verified its factual claim against HEAD and both said
so. What they refused to confirm is a **document left contradicting itself on the exact point the
erratum round existed to settle**.

## Iterations

Phase T's own review loop, after the prior halt was cleared:

| Round | Document | Version reviewed | PM verdict | TE verdict | Note |
|---|---|---|---|---|---|
| 1–5 | TSPEC | v1.0 → v1.4 | see §Prior Halt | see §Prior Halt | first halt: budget exhausted with v1.5 authored but unread |
| **6** | TSPEC | **v1.5** | **Approved with minor changes** `{0, 1, 1}` (`75729c2f`) | **Approved with minor changes** (`6ae18f8a`) | converged. Anchors recorded in `7cd5caf8`. Confirmation round, exactly as the prior POSTMORTEM predicted |
| **E1** | **FSPEC (erratum)** | **v1.4** | `se-review` **Needs revision** `{1, 0, 0}` (`14480fc5`) | `te-review` **Needs revision** `{1, 0, 0}` (`c417862d`) | delta confirmation of the erratum round — **the halt** |

One erratum was routed upward, and it landed as one commit:

| Commit | Erratum carried |
|---|---|
| `d98c7e88` | BR-MODEL-3: "reachable from dry runs and hermetic fixture-driven runs" → "reachable from hermetic fixture-driven runs", plus a new sentence bounding the dry-run surface at "at most one row"; FSPEC version `1.3 → 1.4` with a change note |

The edit is small and correctly scoped by every measure the protocol asks for: `+12/−3`, two hunks,
no new `AC`/`AT`/`EC`/`BR` id, `AT-ENG-29` (`:700`) and `EC-DISP-6` (`:691`) byte-identical to v1.3
because both were already scoped to recorded descriptors, and no decision from v1.0–v1.3 reopened.
Both reviewers said so explicitly and both listed it under Positive Observations.

It failed on what it did **not** touch: `FSPEC:573-576`, the §6.3 preamble sentence that is the
origin of the claim BR-MODEL-3 was corrected to deny.

## Reviewers

| Role | E1 verdict | Blocking finding | Character of the review |
|---|---|---|---|
| `se-review` (software-engineer) | **Needs revision** `{1, 0, 0}` | `F-24` (High): §6.3's preamble still asserts the dry-run surface is "the mechanism … by which the model map of §7.3 is exercised over descriptors rather than executed calls" | Re-derived the erratum's factual claim from HEAD rather than accepting it on report — `inertTransport()` throwing at `bin/pdlc.mjs:97-104`, installed at `:174`; `--dry-run-skill` defaulting `pm-author` at `:172`, `:189-191` — then checked the corrected clause against REQ AC-3.3 and confirmed the delta moves FSPEC *toward* the REQ. Also searched for further sites and reported the search's blind spot: §6.3 says "it", not "dry run", so a literal token search misses it |
| `te-review` (test-engineer) | **Needs revision** `{1, 0, 0}` | `F-01` (High): the same sentence, same fix | Scored the erratum "partially resolved" rather than resolved-or-not, and carried the consequence through to the test: an implementer reading §6.3 would build AT-ENG-29's corpus from `--dry-run --dry-run-skill …` invocations, get five descriptors with no module-pinned model, and either fail the set-equality for reasons unrelated to the map or quietly narrow the corpus so `EC-DISP-6`'s unreachable-row case never fires |

**The two reviewers agree completely — same defect, same site, same one-clause fix, same severity.**
This is the first round in this feature's history with no split of any kind. Both offer the same two
acceptable repairs: end the sentence at "without billing a token", or requalify the trailing clause
to name the hermetic fixture-driven suite as what exercises the map. TE adds a third reading — if
the sentence means the *compose-without-dispatch principle* rather than the `--dry-run` CLI surface,
say so, since the sentence's subject is `--dry-run`.

Under the High-only convergence bar a single open High from either reviewer fails the delta
confirmation; here both raised one, so the failure is unambiguous rather than marginal. With the
erratum bound at one round per upstream document per phase, the failure is terminal for the phase.

Worth recording plainly: `se-review` states that `F-24` is **not a regression introduced by the
delta**. §6.3 carried the claim before the erratum and was approved with it in v1–v4. The erratum
did not break §6.3; it exposed it. What gates is the *state the document is now in* — the
pre-erratum FSPEC was consistently wrong, the fully-corrected FSPEC is consistently right, and the
current one is neither, which is the worst of the three to hand to an implementer.

## Pattern of Disagreement

## Best-Guess Root Cause

## Recommendation

## Prior Halt (2026-08-11, cleared — superseded by the record above)
