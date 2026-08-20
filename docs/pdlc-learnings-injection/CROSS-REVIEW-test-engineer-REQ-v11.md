# Cross-Review: test-engineer — REQ (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-learnings-injection/REQ-pdlc-learnings-injection.md
**Date:** 2026-08-19
**Iteration:** 11
**Round type:** delta confirmation — **no REQ delta this round**; routed item is TSPEC-scoped
**Scope:** whether the routed item requires any REQ change, whether REQ v0.9's settled reading still holds at HEAD, and re-verification of the upstream text REQ leans on.

## Problem / Context

Round 10 confirmed erratum v0.9 (`a2353445`) and approved the REQ with two Low findings. This
round routes one item, raised by se-author:

> §I.2/§I.4/§OQ.2 still gate the injector on `present && config.enabled && !sectionMalformed`
> and record the shipping default as open (`ERR-4`), while REQ v0.9 AC-5.1a and FSPEC v0.7
> BR-14 have settled it — an absent section is an enabled run on §4.1's defaults, "no second
> gate beyond the key". TSPEC needs re-grounding on REQ v0.9 / FSPEC v0.7 and `OQ.2` closed.

Every section id in that item (`§I.2`, `§I.4`, `§OQ.2`, `ERR-4`) belongs to
`TSPEC-pdlc-learnings-injection.md`, not to the REQ. The item does not ask the REQ for a byte;
it names REQ v0.9 as the *authority that already settled* the question, and asks a downstream
document to be re-grounded on it. DECISIONS v0.2 records exactly this routing at `D-O-9`
("TSPEC closes `OQ.2`, retires `ERR-4`, drops the `present`/`sectionMalformed` conjuncts from
§I.3 and aligns `LEARNINGS_DEFAULTS` with REQ §4.1 … | TSPEC").

Accordingly there is no REQ delta this round: `a2353445` is still the last commit touching the
REQ, `git status` is clean, and the reviewed bytes are byte-identical to those approved at v10.
The question a no-delta round has to answer is therefore not "did the edit land" but the one
DEC-ERR-03 makes standing: **does the REQ still say, at HEAD, the thing the routed item and its
downstream consumers are now leaning on it to say?** That is what I re-derived below, from the
REQ text and from the shipped code and sibling documents it cites — not from the item's summary
of them.

## Goals

- Determine whether the routed item requires any REQ change, or whether the REQ is correctly
  untouched and the obligation sits downstream.
- Re-verify that REQ v0.9 AC-5.1a and §4.1 actually carry the settled reading the item and
  DECISIONS attribute to them, in the current bytes.
- Re-verify every upstream premise the REQ leans on — shipped code claims in §1.2 claim 2 and
  AC-5.1b, the vendoring premise behind C-3/G-6 — at HEAD, per DEC-ERR-03, since a no-delta
  round is exactly when a premise can rot unnoticed.
- Check downstream coherence in the one direction that bears on the REQ's own testability: that
  FSPEC v0.7 BR-14 reads AC-5.1a the same way, so a test author reading either lands on one
  behaviour.
- Carry forward v10's two unresolved Low findings honestly rather than dropping them because
  no edit occurred.

## Non-Goals

- Reviewing TSPEC. `§I.2`, `§I.4`, `§OQ.2` and `ERR-4` are TSPEC sections and the erratum against
  them is a TSPEC round; nothing in this confirmation approves or blocks that work. TE review of
  TSPEC v0.5 is already recorded through v5 and will resume when the erratum lands.
- Re-litigating unchanged REQ sections approved in rounds 1–10. With no delta, the "scan only
  changed sections" rule leaves only the upstream-fidelity sweep DEC-ERR-03 mandates.
- Opening new decisions. The round remains frozen; anything I would have argued for in an open
  round is a `DEFERRED:` line, not a finding.
- TSPEC-altitude mechanics — seam design, fake construction, assertion placement. Findings here
  ask only whether the REQ's black-box observables remain writable as tests today.

## Constraints

- **No-delta round.** A finding can only be `inherited` this round; `delta` is unavailable
  because no bytes changed. With no changed sections, `local` is undefined, so every finding is
  tagged `nonlocal` under the strictest-reading rule.
- **Decision freeze.** A finding blocks only if (i) an edit broke something that worked, or
  (ii) a load-bearing claim contradicts the repository at HEAD. Neither applies below.
- **Rigour bar.** Any open High, old or new, means Needs revision. There is none; v10's two open
  findings are both Low.
- **REQ altitude.** Observable-outcome findings only. The routed item's subject matter — which
  conjuncts a builder gates on — is implementation mechanics and is out of lens for the REQ by
  construction, which is itself part of why the item is correctly addressed to TSPEC.

## Delta disposition

| Check | Result |
|---|---|
| Last REQ commit | `a2353445` (erratum v0.9) — unchanged since v10; no new commit touches the REQ |
| Working-tree modification to REQ | none (`git status --porcelain` is clean) |
| Bytes under review vs. bytes approved at v10 | identical; `REVIEWED-COMMIT: a2353445…` in v10 still names HEAD's REQ |
| Sections changed this round | none |
| Header / changelog | still 0.9, 2026-08-19 — correctly *not* bumped, since no edit landed |
| Round classification | **no-delta confirmation**; routed item is out of this document's scope |

A no-delta round is normally a red flag — v9 was one, and it meant a dispatched erratum had not
landed. This one is different in kind: the erratum this item calls for was never addressed to the
REQ. The absence of a REQ edit is the correct outcome, not a missing one.

## Routed-item disposition

| # | Routed item | Requires a REQ change? | Evidence |
|---|---|---|---|
| 1 | §I.2/§I.4/§OQ.2 gate on `present && config.enabled && !sectionMalformed`; `ERR-4` open; TSPEC needs re-grounding on REQ v0.9 / FSPEC v0.7, `OQ.2` closed | **No — TSPEC-scoped, and the REQ side is already discharged** | (a) All four ids are TSPEC's: `§I.2 Configuration` at `TSPEC:410`, the `enabled`-default row at `:1179`, `OQ.2` at `:1183`, `ERR-4` at `:1228`. The REQ contains no `§I.*` or `OQ.*` numbering. (b) The settlement the item cites is present in the reviewed bytes: AC-5.1a states "An **absent configuration section is not this state**: no consumer repository carries the section at HEAD, so absent must read as §4.1's declared defaults, which leave `enabled` at `true` and the run injecting under AC-1.1. Disablement is an explicit act, and there is no second gate beyond this key (G-1)". §4.1's table row is `learningsInjection.enabled | true | consumer config`. (c) DECISIONS v0.2 routes the obligation to TSPEC, not the REQ (`D-O-9`), and `DEC-LI-07` records that REQ v0.9 "has since settled it". |

The item is therefore **satisfied on the REQ side without an edit**. Nothing routed to this
document is outstanding, and nothing previously approved has been disturbed — there was no edit
that could disturb it.

One coherence check the item's phrasing invites, since it names FSPEC as co-authority: FSPEC
v0.7 reads AC-5.1a the same way. `D-1`'s outcome column is "disabled / enabled — absent,
malformed and wrong-typed read as enabled on §4.1's defaults" (`FSPEC:235`), Step 0's prose
matches (`:156-162`), and the traceability rows bind AC-5.1a/b/c to BR-14 with AT-31/AT-32
(`:128-130`). REQ and FSPEC give a test author one behaviour, so the two-readings hazard the
item names lives entirely in TSPEC.

## Upstream re-verification at HEAD

DEC-ERR-03 asks whether the upstream the REQ leans on still says what the REQ says it says. I
re-derived each load-bearing claim from the working tree this round rather than carrying v10's
verification forward on trust.

| REQ claim | Upstream at HEAD | Holds? |
|---|---|---|
| §1.2 claim 2: `enumerateCorpus` is total — "returns an unlistable outcome rather than throwing" | `consolidate-learnings.js:1348-1355`: returns `{unlistable: true, detail}` on a non-ok reply, else `{files}` | Yes |
| §1.2 claim 2: "the pass around it then marks itself `failed` and stops on that outcome" | `:587-593`: `state.status = "failed"; return await finishPass(...)`, with the comment "§10.3 row 1a — `failed` … Never `no-op`" | Yes |
| §1.2: enumeration reaches one level under `docs/` and one under `docs/completed/` | `LS_FILES_ARGV` pathspecs `:(glob)docs/*/LEARNINGS-*.md` and `:(glob)docs/completed/*/LEARNINGS-*.md` (`:1338-1346`), with `--cached --others --exclude-standard` | Yes |
| C-3 / G-6: the engine vendors only `orchestrate-dev.js` and `orchestrate-queue.js`, so the sibling cannot be imported | `pdlc/engine/scripts/prepack.mjs:20`: `MODULE_NAMES = ["orchestrate-dev.js", "orchestrate-queue.js"]` | Yes |
| AC-5.1b: a malformed section yields defaults (the precedent the fail-open decision leans on) | `orchestrate-dev.js:191-209`: `parseImplementationConfig` returns `{config: IMPLEMENTATION_DEFAULTS, sectionMalformed: true, invalidKeys: []}` for a non-object section | Yes — with the attribution caveat carried as F-01 below |

No premise has rotted since v10, and the divergence §1.2 claim 2 now names — this feature fails
**open** on an unlistable corpus where the sibling pass fails its run — remains true of the
shipped code, which is what makes it a divergence worth pinning rather than a paraphrase.

## Acceptance Criteria

What this confirmation had to establish, and whether it did:

| # | Criterion | Met? |
|---|---|---|
| CC-1 | The routed item is correctly placed — either landed in the REQ, or shown to belong elsewhere | Yes — all four ids are TSPEC's; `D-O-9` routes it to TSPEC |
| CC-2 | The REQ text the item leans on exists in the reviewed bytes and says what is attributed to it | Yes — AC-5.1a's "no second gate beyond this key", §4.1's `enabled: true` row |
| CC-3 | Nothing previously approved regressed | Yes — bytes identical to v10's `REVIEWED-COMMIT` |
| CC-4 | Every upstream code premise re-verified at HEAD | Yes — five claims, all holding (table above) |
| CC-5 | Downstream co-authority (FSPEC v0.7 BR-14) agrees, so one behaviour is testable | Yes — `FSPEC:235`, `:156-162`, `:128-130` |
| CC-6 | Prior-round open findings dispositioned rather than dropped | Yes — v10's two Lows carried forward as `inherited` below |

## Findings

## Questions

## Risks

## Obligations

## Positive Observations

## Recommendation

## Verdict
