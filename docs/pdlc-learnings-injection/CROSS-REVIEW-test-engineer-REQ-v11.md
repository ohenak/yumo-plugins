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

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Low | Local | **(inherited, nonlocal)** Carried unchanged from v10 F-01. AC-5.1b attributes the operator notice to the reader: "the same response `orchestrate-dev.js`'s `parseImplementationConfig` ships, whose malformed section yields defaults plus an explicit operator notice" (REQ:391-393). At HEAD the function returns `{config: IMPLEMENTATION_DEFAULTS, sectionMalformed: true, invalidKeys: []}` and emits nothing (`orchestrate-dev.js:192-209`); the notice is the caller's (`:14130-14134`), and the JSDoc says so ("The caller emits a notice naming each degraded key", `:300-301`). The second call site keeps only `.config` (`:11913`), so at that site a malformed section yields defaults with **no** notice. The precedent the AC leans on is real — defaults plus notice is what the shipped pipeline does in wave mode — so the decision is undisturbed; the imprecision is one a TSPEC author pinning "the reader reports" would encode as the wrong seam, which is the failure mode this round's routed item is itself an instance of. **Fix (non-gating):** "…yields defaults, on which its caller emits an explicit operator notice (`orchestrate-dev.js:14130-14134`)". | AC-5.1b (REQ:391-393) |
| F-02 | Low | Local | **(inherited, nonlocal)** Carried unchanged from v10 F-02. AC-3.2's mirror clause exempts an operator-visible field from every oracle: the run-level mirror is "additive, is not the oracle, and has a **deliberately unconstrained value that nothing asserts on**" (REQ:326-327). The per-dispatch oracle remains positively asserted so falsifiability is unchanged, but a mirror whose value contradicts the dispatch records it summarises would be undetectable by the suite and still green, while an operator reading the report top-down meets the contradiction first. **Fix (non-gating, or absorb at TSPEC):** drop the clause, or bound it with one consistency assertion — if a mirror is carried, it agrees with the dispatch records it summarises. | AC-3.2 (REQ:326-327) |

Both findings pre-date this round's dispatch and neither is a defect any edit introduced —
there was no edit. Neither meets the blocking bar under the freeze.

DEFERRED: v10's two `DEFERRED:` lines stand unchanged and remain TSPEC-time routing notes — (a) AC-3.1's set-equality test is vacuous for a dispatch that selected nothing, so the empty-dispatch assertion belongs to AC-3.2's "rows present and empty"; (b) §1.2 claim 2's three code claims should reach TSPEC as a literal restatement pin against `consolidate-learnings.js:1348-1355` and `:587-593`, per C-3/O-7's pinning discipline.
DEFERRED: When the TSPEC erratum lands, `AT-31`/`AT-32` should assert the absent-section case positively — dispatch runs, injection record present, corpus rows non-empty on a repository with a corpus — rather than only asserting that the `learningsInjection` key is present. An absence-shaped or key-presence-only oracle would pass under the old `present &&` gate too, and would not falsify the very reading this erratum retires.

## Questions

| ID | Question |
|----|---------|
| Q-01 | `D-O-9` obliges the TSPEC erratum to land "before `AT-31`/`AT-32` are authored against §I.3". Is PROPERTIES authoring sequenced behind that erratum in the queue, or could a PROPERTIES round start from TSPEC v0.5's `present &&` gate in the meantime? This is a scheduling question, not a REQ defect — the REQ is not the document that can answer it — but it is the mechanism by which this settled question could still produce red tests against a correct implementation. |

## Risks

- **The settlement is authoritative in two documents and contradicted in a third.** REQ v0.9 and
  FSPEC v0.7 agree; TSPEC v0.5 still gates on `present && … && !sectionMalformed`. Test authors
  read TSPEC. Until the erratum lands, the risk is not that the REQ is wrong but that a correct
  implementation of it reds against ATs written from the stale gate — the two-readings hazard
  TSPEC's own `ERR-7` names.
- **`RSN-UNLISTABLE` remains the one corpus-level outcome with no natural fixture.** It needs a
  failing `git ls-files` reply through the injected seam. A suite that never exercises it leaves
  this feature's most-argued divergence — fails open where the sibling pass fails its run —
  unproven while every catalogue set-equality test still passes.
- **§1.2 claim 2 has now been rewritten across four rounds and re-verified across two.** It is
  correct at HEAD, but it is background prose describing another module's behaviour, which is
  precisely the kind of claim that goes stale silently. Only a restatement pin turns a future
  sibling change into a red test rather than a wrong REQ.
- **Eleven rounds on one document.** The last two produced no REQ-side defect. Further rounds
  addressed to this REQ should carry a real routed item or be declined at dispatch.

## Obligations

- Both Lows are single-clause edits, unchanged from v10. They can ride any future erratum
  touching this document or be absorbed at TSPEC time, at the author's discretion.
- `D-O-9` (DECISIONS v0.2) is the live obligation this round's item belongs to: TSPEC closes
  `OQ.2`, retires `ERR-4`, drops the `present`/`sectionMalformed` conjuncts from §I.3 and aligns
  `LEARNINGS_DEFAULTS` with REQ §4.1. It must land before `AT-31`/`AT-32` are authored.
- O-7's pinning obligation still covers more surface than when written: the restatement pin
  should cover the pass-side `failed` transition (`consolidate-learnings.js:587-593`), not only
  `LS_FILES_ARGV`.

## Positive Observations

- **The REQ said the decidable thing early enough to be leaned on.** AC-5.1a does not merely set
  a default; it names the state that would otherwise be conflated ("An absent configuration
  section is not this state"), gives the reason from the repository ("no consumer repository
  carries the section at HEAD"), and closes the door explicitly ("no second gate beyond this
  key"). That last clause is what makes the TSPEC erratum mechanical rather than a re-argument —
  a reviewer can diff a conjunct against a sentence.
- **The routing worked as designed.** The contradiction was found by PM review of TSPEC v1,
  routed upward as an erratum, settled in the REQ, recorded in DECISIONS as `DEC-LI-07` with an
  explicit obligation row naming the sections to correct, and is now being pushed back down. No
  document closed a question it did not own.
- **Every upstream premise re-verified clean at HEAD**, including the two that describe another
  module's behaviour and the vendoring premise behind C-3/G-6. Nothing rotted between rounds.
- **REQ and FSPEC give a test author exactly one behaviour** for the absent, malformed and
  wrong-typed configuration states, with the AT bindings already drawn (`FSPEC:128-130`). The
  "write the test right now" check passes on all three states from the REQ alone.

## Recommendation

**Approved with minor changes**

No High findings. The routed item requires no REQ change: its subject sections belong to TSPEC,
and the REQ-side settlement it cites is present and correct in the reviewed bytes. Nothing
previously approved regressed — the bytes are identical to those approved at v10 — and all five
upstream premises re-verify at HEAD. The two Low findings are inherited attribution and
scope-of-assertion refinements that do not block.

The outstanding work is downstream and already recorded as `D-O-9`: TSPEC closes `OQ.2`, retires
`ERR-4`, and drops the `present`/`sectionMalformed` conjuncts from §I.3, before `AT-31`/`AT-32`
are authored.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 2}

APPROVAL-HASH: sha256:ff605dd373ded6dce3ee18212ecd44c0ad38dd1e669fe6100ba29f6dd92e84dd
APPROVAL-HASH-NORMALIZED: sha256:6a9544d4bbf0f0c09fbb863337f8cb41c5afec98138a76c47a7b40216bf5a958
REVIEWED-COMMIT: 4db24c50d51de6389173b9c14d0b59cd7f1079ed
