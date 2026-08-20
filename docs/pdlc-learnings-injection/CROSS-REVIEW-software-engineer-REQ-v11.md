# Cross-Review: software-engineer — REQ (delta confirmation, round 11)

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-learnings-injection/REQ-pdlc-learnings-injection.md` (v0.9)
**Date:** 2026-08-19
**Iteration:** 11 (delta over commit `a2353445` → HEAD)

## Context

The orchestrator routed this confirmation as a targeted erratum round over the REQ, naming one
item: TSPEC `§I.2`/`§I.4`/`§OQ.2` still gate the injector on
`present && config.enabled && !sectionMalformed`, while REQ v0.9 `AC-5.1a` and FSPEC v0.7 `BR-14`
have settled the shipping default open; TSPEC needs re-grounding on that settled upstream and
`OQ.2` closed.

Two structural facts shape the answer, and both are worth stating before the findings:

1. **The item is not a REQ item.** `§I.2`, `§I.4` and `§OQ.2` are TSPEC sections
   (`TSPEC:410`, `TSPEC:515`, `TSPEC:1183`). The REQ is the *authority* the item asks TSPEC to
   re-ground on, not the document owing an edit. Nothing in the item, read literally, is a defect
   in the REQ.
2. **The REQ delta this round is empty.** `git diff a2353445 HEAD -- docs/…/REQ-…md` is zero
   bytes. `a2353445` ("REQ erratum v0.9") is still HEAD for this file, and it is exactly the
   commit my v10 reviewed, approved, and anchored (`REVIEWED-COMMIT: a2353445…` in
   `CROSS-REVIEW-software-engineer-REQ-v10.md`).

So the round's question is not "did the edit break anything" — there was no edit. It is the
second question the confirmation contract asks: **is the REQ still a faithful compression of the
upstream it leans on, at that upstream's current version?** That is what I verified.

## Scope of this round

Everything changed on the branch since `a2353445` is documentation, and none of it is the REQ:

| Changed since `a2353445` | Bearing on this confirmation |
|---|---|
| `DECISIONS-pdlc-learnings-injection.md` (new, 664 lines, then revised to v0.2) | **Where the routed item actually landed.** See the item disposition below. |
| `TSPEC-…md` (+112 lines) | Touched, but **not** on the gate. The `present && config.enabled && !sectionMalformed` conjunction survives verbatim at `TSPEC:435`, and `OQ.2` is still open at `TSPEC:1179-1183`. |
| Nine cross-review files (PM/TE on TSPEC v4–v5 and DECISIONS v1–v2, SE/TE on FSPEC v8, REQ v10) | Review artifacts; no upstream the REQ cites. |
| **No source file at all** | Every shipped-code claim the REQ makes is over bytes that have not moved since v10 verified them. |

Because the delta is empty I did not re-read the REQ from scratch and I am not re-litigating any
section approved in rounds 1–10. What I did do, per this round's charter: re-opened each piece of
**upstream** the REQ leans on at its current version and checked the REQ is still a faithful
compression of it.

### Disposition of the routed item

The item **did land — as a decision, not as the TSPEC edit it asks for.** `DEC-LI-07` ("An absent
configuration section is an enabled run, and no configuration mistake disables the feature",
`DECISIONS:385`) decides the gate is `config.enabled` alone, quotes REQ v0.9's settled text
correctly, and carries the five-state table matching FSPEC v0.7 `BR-14`. The residue is tracked in
writing and owned:

- `DECISIONS:437-448` states the divergence plainly — "TSPEC v0.5 still builds the injector on
  `present && config.enabled && !sectionMalformed` (§I.3) … so TSPEC and DECISIONS now disagree in
  writing" — and names the consequence I would otherwise have filed myself: "**PROPERTIES and PLAN
  authors read TSPEC, not this document**, so an `AT-31`/`AT-32` written against §I.3 would be red
  against the correct implementation."
- It raises `DEC-ERR-01` against TSPEC and records `D-O-9` (`DECISIONS:664`): TSPEC closes `OQ.2`,
  retires `ERR-4`, drops the two conjuncts, aligns `LEARNINGS_DEFAULTS` — "**this must land before
  `AT-31`/`AT-32` are authored against §I.3**".
- `D-O-5` (`DECISIONS:660`) is the standing IMPL-side protection until it does.

That is a legitimate landing at the level the item names, with an owner, a gate and a deadline —
not a silent drop. It is **not** discharge: the TSPEC bytes still contradict settled upstream.
Findings F-01 records that, non-gating on the REQ. The REQ itself was owed nothing and correctly
received nothing.

## Constraints re-verified against HEAD

Every upstream anchor the REQ leans on, re-opened at its current version this round. All hold; no
citation points at text that has changed or moved.

| REQ claim | Upstream, current version | Verdict |
|---|---|---|
| §1.2 claim 2: `enumerateCorpus` is total — returns an unlistable outcome rather than throwing | `pdlc/workflows/consolidate-learnings.js:1349-1355` — `if (!reply \|\| !reply.ok) return { unlistable: true, detail: … }` | **Holds**, byte-identical to v10. |
| §1.2 claim 2: the pass around it then marks itself `failed` and stops | `consolidate-learnings.js:588-594` — `state.status = "failed"; return await finishPass(…)`, comment pinning "§10.3 row 1a … Never `no-op`" | **Holds.** |
| §1.2: the engine vendors only `orchestrate-dev.js` and `orchestrate-queue.js`, so `consolidate-learnings.js` is unreachable to import | `pdlc/engine/scripts/prepack.mjs:20` — `const MODULE_NAMES = ["orchestrate-dev.js", "orchestrate-queue.js"];` | **Holds** — the cited line is still exactly the module list, and the list is still two entries. |
| §1.2: DEC-CONS-05 ships *one predicate, two enumerations*, and claims nothing about readers agreeing on sets | `docs/completed/pdlc-consolidation-agent/DECISIONS-pdlc-consolidation-agent.md:54` and §7 at `:422` — "Two corpus enumerations pinned literally on each side; only the **predicate** is held equal by a differential test" | **Holds**, and the citation still sits only where the decision reaches. |
| AC-5.1b: `parseImplementationConfig`'s malformed section yields defaults | `pdlc/workflows/orchestrate-dev.js:191-210` — `if (!isPlainObject(section)) return degraded(true)`, `degraded` returning `IMPLEMENTATION_DEFAULTS` | **Holds** on the defaults half. The notice half is still over-attributed — carried as F-03. |
| AC-5.1b, AC-5.1b's `DC-01`; AC-5.2's `DC-09` | `docs/_constraints/DOMAIN-CONSTRAINTS.md` — both ids exist; the file is unchanged on this branch since `a2353445` | **Holds.** |
| §4.1 `learningsInjection.enabled` default `true` (`REQ:223`) | Nothing upstream constrains it; it is the REQ's own declaration | **Sound** — and it is now the settled authority two downstream documents read. |

Two cross-checks in the other direction, since a compression is only faithful if downstream reads
it as written:

- `DEC-LI-07` quotes REQ v0.9 accurately on both load-bearing clauses — "there is no second gate
  beyond this key (G-1)" (`REQ:384`, verbatim) and the absent-section scoping (`REQ:381-383`).
- FSPEC v0.7 `BR-14` and its decision row `D-1` (`FSPEC:235`) carry the same five states the REQ
  declares: "absent, malformed and wrong-typed read as enabled on §4.1's defaults". No drift.

## Findings

No finding below is a defect in the REQ. The REQ was owed no edit this round and its text is
sound against every upstream it cites. All three are tagged `nonlocal` because the round's edit
set on this document is empty, so nothing is inside a changed section.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Cross-Feature | *(delta, nonlocal.)* The routed item's **TSPEC half has not landed.** `TSPEC:435` still reads "injector is built **only** when `present && config.enabled && !sectionMalformed`"; the divergence-table row at `TSPEC:432` still says "an absent section is `present:false`, so the feature is still off until an operator writes the section"; `TSPEC:448` still maps the malformed state to "**absent** (behaviour is AC-5.1a's)", which is the opposite of REQ `AC-5.1b`'s "the run stays **enabled** on §4.1's declared defaults"; and `OQ.2` is still open at `TSPEC:1179-1183`, where it justifies the provisional gate by quoting `AC-5.1a`'s "or the configuration section absent" — **text REQ v0.9 no longer contains** (`REQ:378-386` scopes `AC-5.1a` to an explicit `enabled: false` and says an absent section "is not this state"). Consequence, in TSPEC's own words as `DECISIONS:441-443` restates it: an `AT-31`/`AT-32` authored against §I.3 would be red against the correct implementation, and the feature would ship **off** in this repository, which carries no `.claude/pdlc.config.json` at all — the exact case `G-1` exists to serve. **Not gating on the REQ** and not filed High, because the obligation is landed, owned and sequenced: `DEC-LI-07` decides it, `DEC-ERR-01` raises it against TSPEC, `D-O-9` (`DECISIONS:664`) owns it to TSPEC with the deadline "before `AT-31`/`AT-32` are authored against §I.3", and `D-O-5` (`DECISIONS:660`) guards the IMPL side meanwhile. **What must not happen:** this round being recorded as "item resolved" and `D-O-9` losing its deadline. The TSPEC erratum is still owed. | TSPEC `§I.2`/`§I.4`/`§OQ.2` vs `REQ:378-390` |
| F-02 | Low | Local | *(inherited, nonlocal.)* FSPEC's upstream pointer still reads "**REQ** — `…REQ-pdlc-learnings-injection.md` (v0.8)" (`FSPEC:11`) while the REQ is at v0.9. The FSPEC **body** is correctly re-grounded — its v0.6/v0.7 erratum notes and `BR-14` carry REQ v0.9's settled five states, so this is a stale version pointer, not stale content. It matters only because `DEC-LI-07` and this round both reason from "FSPEC v0.7 is grounded on REQ v0.9", and the header currently denies it. **Fix:** bump the pointer to v0.9 with the next FSPEC touch. | `FSPEC:11` |
| F-03 | Low | Local | *(inherited, nonlocal — carried unchanged from v10 F-01.)* `AC-5.1b` still attributes the operator notice to the parser: "the same response `orchestrate-dev.js`'s `parseImplementationConfig` ships, whose malformed section yields defaults plus an explicit operator notice" (`REQ:386-388`). Re-verified at HEAD this round and still imprecise: the parser ships only the flag — `{config: IMPLEMENTATION_DEFAULTS, sectionMalformed: true, invalidKeys: []}`, emitting nothing (`orchestrate-dev.js:191-210`). The notice comes from one caller on the wave-mode path (`orchestrate-dev.js:14130-14135`); the other call site drops the flag entirely (`:11913`). The AC's decision is unaffected and remains implementable. **Fix (still not owed):** "the reader-plus-caller path around `parseImplementationConfig` ships this response — defaults from the parser, the notice from its caller", or drop the "whose …" clause. | `AC-5.1b` (`REQ:386-388`) |

## Questions

| ID | Question |
|----|---------|
| Q-01 | Was this round dispatched against the REQ deliberately, or was the item mis-slotted? The item names three TSPEC sections and asks for a TSPEC edit; the REQ is its authority, not its subject. If the intent was to confirm the REQ still says what `DEC-LI-07` claims it says, the answer is yes (see the re-verification table). If the intent was to confirm the TSPEC erratum landed, the answer is no (F-01), and the round should be re-dispatched against `TSPEC-pdlc-learnings-injection.md`. I have answered both readings so neither is left open. |

## Risks

## Obligations

## Positive Observations

## Recommendation

## Verdict
