# Cross-Review: test-engineer — TSPEC

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-plugin-retirement/TSPEC-pdlc-plugin-retirement.md` (v0.5)
**Date:** 2026-08-17
**Iteration:** 5

**Scope:** delta re-review. v4's three findings checked for resolution; only the sections changed
between `22f559bb` and HEAD (`92ae9145`) were scanned for new issues — §2.6's config-wired
carve-out paragraph, §5.2's TT-1b sentence, §5.5 in full, §6.1 erratum 8's routing note.
Unchanged sections are not re-litigated.

## v4 findings — disposition

| v4 ID | Disposition | Evidence |
|---|---|---|
| F-01 (High) — helper no-orphan oracle reds against live infrastructure | **Resolved** | §5.5 now carries a second wiring channel: `globalSetup` / `globalTeardown` read out of `pdlc/workflows/package.json` (`:37`–`:38` name `__tests__/helpers/skipSinkSetup.js` / `skipSinkTeardown.js`), re-derived at assertion time rather than transcribed. I re-ran the oracle over a simulated post-sweep tree (21 deleted `*.test.js` modules per §4.4, four deleted helpers, plus the new `consumerCleanup.test.js` importing `freshClone.js`): every surviving `helpers/*.js` is satisfied by channel (a) except `skipSinkSetup.js` / `skipSinkTeardown.js`, which channel (b) covers. Green-constructible. |
| F-02 (Medium) — grep matched bare names, so a stale comment satisfied it | **Resolved** | §5.5 scope rule 2 matches specifier forms (`"./helpers/<name>.js"` in import/require position, `new URL(...)`) and channel (b) compares resolved paths. `driftHelpers.test.js:108`'s comment mention of `skipSinkTeardown.js` no longer satisfies the universal. |
| F-03 (Medium) — TT-1b's skip collided with §5.5's own no-skip rule | **Partly resolved; the collision is now stated but the resolving oracle is not implementable as written** — see F-01/F-02 below. The mechanism cited is real (`itOrSkip` at `helpers/driftCapabilities.js:324`, `SKIP_INVENTORY` at `:93`, used by `skipSinkTransport.test.js:47` and `documentOracles.test.js:54`, both sweep survivors), and the inventory is extensible (no oracle pins it to a spec enumeration). What is missing is the join between jest's pending set and the sink, and the upstream routing of the narrowed clause. |

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | **§5.5 narrows an upstream acceptance test's oracle and routes nothing.** FSPEC AT-1.3 reads "the suite contains **no skipped or pending test at all** (repo-wide, not only among M-8's modules …)" (`FSPEC:615`–`:616`); REQ AC-1.3 reads "no skipped or pending test belonging to M-8" (`REQ:326`). §5.5 now asserts a different rule — "No **unregistered** `skip`" — and states as fact that "AT-1.3's clause reads 'no skip absent from the skip sink's inventory'". No upstream text says that today, and §6.1 carries no erratum routing the change (erratum 8 covers only the helper no-orphan conjunct). Consequence at the gate: on a root runner TT-1b's registered skip is a pending test, so AT-1.3 *as written upstream* fails while the TSPEC says it should pass; on a non-root runner nothing fires and the divergence stays invisible until CI moves. This is the same class of defect §2.6 fixed by withdrawing the AT-1.3 orphan citation — an upstream oracle reinterpreted TSPEC-side instead of routed. Fix: add a §6.1 erratum routing the AT-1.3 (and, if it inherits, AC-1.3) wording to "no skip absent from the skip sink's inventory", and state until it lands that the narrowed rule is TSPEC-side only. | §5.5, §6.1 |
| F-02 | High | Local | **The narrowed clause has no stated evaluation mechanism, and the sink comparator it leans on does not enforce the direction §5.5 claims.** Two gaps. (i) *No join.* Jest reports a registered `itOrSkip` skip and a bare `it.skip` identically as pending; `itOrSkip` records carry the **inventory entry name** (`"AT-14b"`, `"consumer-artifact-unreadable"`, …), not the jest test title (`driftCapabilities.js:324`, records built at `:93`ff). §5.5 states the clause but never says how "pending, and absent from the sink" is computed — by what key jest's pending list is joined to the sink records. Without that, an implementer either cannot write the test or writes the cheapest thing that passes (`pendingCount <= sinkRecords.length`), a count-only, absence-shaped oracle that cannot distinguish a sweep-introduced bare skip from a declared capability gap. (ii) *The comparator's C2 is conditional.* `validateSkipRecords` looks the record up by name and only checks agreement `if (entry)` (`pdlc/workflows/__tests__/helpers/skipSink.js:185`–`:200`); a named record that matches **no** inventory row produces no violation (C1 only requires a name, a known capability key from `KNOWN_CAPABILITY_KEYS` at `:54`, and a non-empty invariant list). So the claim "a skip the sweep adds without a sink registration still fails it" is not delivered by the existing sink — an implementer wiring AT-1.3 to `validateSkipRecords` gets a false green. Fix: state the oracle as a set relation — jest's pending set (from the run's JSON) joined by a named key to the sink records, each of which must validate clean against `SKIP_INVENTORY`, with equality (not containment) in both directions — and state that the membership direction (registered ⇒ on the ledger) must be asserted by the new test, since `skipSink.js:185` does not assert it. | §5.5, §5.2 TT-1b |
| F-03 | Medium | Local | **The `SKIP_INVENTORY` entry TT-1b needs is an edit to a *surviving* helper, and no class owns it.** §5.5 requires TT-1b to register "with a `SKIP_INVENTORY` capability entry naming the root/`chmod 000` gap", which means editing `helpers/driftCapabilities.js` — a file §2.6 disposes of as *surviving with live consumers* and which appears in no deletion or edit class. The commit-class table (§2.9 / §4.4's class 3) names `consumerCleanup.test.js` as the new module but not this helper edit, so the replay in §5.4 judges a commit touching `driftCapabilities.js` against a class that does not claim it. Name the edit in the class-3 scope, and state the entry's fields (`capability: "uid-nonroot"` — the only key in `KNOWN_CAPABILITY_KEYS` that fits — plus a non-empty invariant list, which C1/C3 require verbatim agreement on). | §5.5, §2.6, §4.4 |
| F-04 | Low | Local | **Channel (a) is satisfiable by a mutually-importing pair of orphans.** "imported by at least one surviving test module **or helper**" is the right widening (`helpers/skipSink.js` is imported only by helpers plus `skipSinkTransport.test.js`), but two helpers that import only each other satisfy it while being reachable from no test. Cheap fix: define channel (a) as reachability from the surviving `*.test.js` roots (transitive closure), not one-hop importer existence. | §5.5 scope rule 1 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | If AT-1.3's narrowing (F-01) is not accepted upstream, is the fallback to drop TT-1b's root-conditional arm entirely and leave row 4b's runtime-failure exit status uncovered, or to keep the arm and pin the gate runner non-root? §5.5 rejects the runner pin explicitly; the first option should be costed in the same paragraph so the choice is not re-derived at implementation time. |
| Q-02 | Q-01 of v4 is answered (`helpers/bin/` is scoped out, rule 3) and I verified the three `bin/*.sh` drivers are referenced only by `driftOrdering.test.js:395`, `driftFault.test.js:444` and the deleted `driftHelpers` rows — so post-sweep the directory is genuinely empty. Should §2.6 also state that the *directory* is removed, so a later reader does not read an empty tracked path as a survivor? |

## Positive Observations

- **F-01 of v4 is fixed at the level it was raised.** The two-channel oracle is not a hand-added exception for two files: channel (b) reads `globalSetup` / `globalTeardown` out of `package.json` at assertion time, so a future config-wired helper passes without editing the test, and one wired through neither channel still reds. I re-derived the post-sweep import graph mechanically and the universal comes out green — the round did not trade a false red for a false green.
- **The pre-sweep/post-sweep asymmetry is stated honestly.** §5.5 now says outright that "`driftOrdering.js` ends consumer-less" is a *pre-sweep* measurement recorded in §2.6, because after deletion no post-sweep predicate can tell "correctly deleted" from "deleted by mistake". That is the right call — the alternative would have been an oracle that passes vacuously — and it is the kind of limit that usually goes unwritten.
- **The positive direction survives the rewrite.** `helpers/freshClone.js` must be imported *by name*, so collateral sweeping reds rather than passing; I confirmed its only current importer is `bootstrap.test.js:40` (deleted), and that TT-3's fresh-clone half is what regains it.
- **TT-1b's unasserted arm is still argued, not quietly dropped.** The partial-`rm` arm remains explicitly contract-text-not-oracle with the non-constructibility reason attached, and the added sentence widens the row without weakening that boundary.

## Positive Observations

## Recommendation

**Needs revision**

Two High findings, both inside §5.5 — the section this round rewrote — and both about the same
sentence rather than about the round's main work. v4's three findings are discharged: the
two-channel oracle is green-constructible against the live tree, specifier matching replaced the
bare-name grep, and TT-1b's skip is routed through a real, extensible sink.

What is left is that §5.5 settles TT-1b's collision by *restating what AT-1.3 asserts* instead of
routing the change (F-01), and by leaning on a comparator direction `skipSink.js:185` does not
enforce, with no stated join between jest's pending set and the sink (F-02). Adding a §6.1 erratum
for the AT-1.3 wording, spelling the clause out as a set relation over (pending set, sink records
validated against `SKIP_INVENTORY`) with the membership direction asserted locally, and naming the
`driftCapabilities.js` entry edit in its commit class (F-03) closes the round.

## Verdict

VERDICT: Needs revision
{"high": 2, "medium": 1, "low": 1}
