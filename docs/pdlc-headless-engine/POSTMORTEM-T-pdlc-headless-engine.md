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

Three shapes, in order of how much they cost.

**1. There is no disagreement between people to resolve.** This is the first round in this
feature's twenty-plus review rounds where two reviewers filed the *identical* finding, at the
identical site, with the identical fix and the identical severity. The prior Phase-T halt turned on
a severity split (PM High vs TE Medium on one defect); the Phase-F halt turned on one reviewer
re-deriving a cell the other did not. Here the roles are interchangeable. The dispute is entirely
*within the document* — §6.3 and §7.3 assert opposite things — and it is mechanically checkable, so
there is nothing for an operator to adjudicate. That is a good signal about the finding and a bad
one about the cost: a phase halted over a defect that no participant disputes.

**2. The erratum's change note cites the section that contains the defect, as if it were the
authority for the fix.** The v1.4 note reads: "which this document already fixed in BR-SKILL-5/6,
so the claim contradicted §6.3". That is half right in a way that is worse than being wrong.
BR-SKILL-5/6 *do* live in §6.3 and *are* correct — the section's second half establishes exactly
the one-skill-per-invocation bound the erratum needed. The author read down to them, took them as
support, and never re-read the four lines of §6.3's preamble immediately above, which state the
opposite. The correction then cited `§6.3, BR-SKILL-5/6` inline — pointing the next reader straight
at the unfixed sentence. `se-review` records that this citation is precisely what made `F-24`
findable. The edit contained its own falsifier.

**3. An erratum names a site; the defect is a claim.** The routed item was
"BR-MODEL-3 (`FSPEC:654-656`) claims …". Everything about that framing — a doctype, a line range,
a quoted sentence — describes a *location*, and the targeted versioned edit is scoped to it by
design. But the obligation the reviewers enforced is document-wide: after the round, the false
statement must be gone from the document, not from the coordinates. The two are the same thing only
when a claim is asserted once. Here it was asserted twice, and the second site was unfindable by
the obvious search: §6.3's sentence refers to the surface as "it", so `grep dry.run` over the FSPEC
returns the change note and the corrected BR-MODEL-3 and nothing else. `se-review` ran that search,
got the misleadingly clean result, and read the section anyway. The author, working from the cited
range, did not.

## Best-Guess Root Cause

**A duplicated claim meets a site-scoped edit protocol with a one-round budget. The edit fixes the
cited site, the duplicate survives, and the round that would have caught the duplicate is the round
that was spent.**

The chain:

1. §6.3 was written to introduce the dry-run surface, and its preamble does what an introduction
   does — it lists what the surface is good for. One item on that list ("the model map of §7.3 is
   exercised over descriptors rather than executed calls") is a claim about a *different section's*
   oracle. It reads as scene-setting and was approved as scene-setting through v1–v4 by both FSPEC
   approvers, who were reviewing §6.3's own behavioural rules.
2. §7.3's BR-MODEL-3 then restated the same claim in the section that owns it, where it is
   load-bearing for AC-3.3's corpus. Two sites, one claim, different registers: prose in one,
   normative business rule in the other.
3. Phase T's TSPEC work made the claim testable for the first time. Designing AT-ENG-29's corpus
   forces the question "what run produces these descriptors?", and the answer is visible in the
   engine at `bin/pdlc.mjs:97-104` (`inertTransport()` throws) and `:189-191` (one skill per
   invocation). `te-review` raised it upward as an erratum — correctly, since editing the FSPEC
   from the TSPEC is the mis-filing the erratum channel exists to prevent.
4. The erratum was routed with its coordinates, as the protocol requires. The author edited those
   coordinates, verified the new text against HEAD and against REQ AC-3.3, confirmed the downstream
   artefacts (`AT-ENG-29`, `EC-DISP-6`) needed no change, and cited the supporting rules in §6.3 —
   a careful edit by every criterion except one it was never asked for: *is this claim asserted
   anywhere else?*
5. The delta confirmation asked exactly that, found the second site, and had no round left to spend
   on it. One erratum round per upstream document per phase is a shipped constant; a second batch
   would have carried a one-clause deletion.

Two contributing factors, neither sufficient alone:

- **The duplicate was search-resistant.** The two sites share no distinguishing token: §7.3 names
  "dry runs", §6.3 says "it". Any mechanical de-duplication an author could reasonably run before
  editing — grep the quoted phrase, grep `dry.run`, grep the id — returns nothing. Finding it
  required reading the section the erratum cited as support, in full, for a claim it was not about.
- **The erratum bound is one round, and this is the second consecutive halt to hit it.**
  POSTMORTEM-F halted the same way, on a REQ erratum round whose fix was "three cells and one
  word"; this one halts on "one clause". The bound is right in purpose — it stops upstream churn
  from reopening settled documents — but both halts to date have cost a phase for a repair smaller
  than the postmortem describing it. That is now a pattern, not an incident.

## Recommendation

## Prior Halt (2026-08-11, cleared — superseded by the record above)
