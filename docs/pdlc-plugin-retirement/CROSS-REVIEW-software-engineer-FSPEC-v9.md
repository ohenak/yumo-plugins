# Cross-Review: software-engineer — FSPEC

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-plugin-retirement/FSPEC-pdlc-plugin-retirement.md`
**Date:** 2026-08-17
**Iteration:** 9

**Scope:** delta re-review over `337f3bcf..HEAD` (the two commits landed after the v8 round:
`b2bdd09a` erratum/SE-v8-F-04 routing in §7.3, `fe306b11` BR-SWEEP-6 / AT-1.3 wording
compression). Version header 0.6 → 0.7. Three places touched: **BR-SWEEP-6** (§4, `:285`–`:294`),
**AT-1.3** (§6.1, `:623`–`:628`), **§7.3 Downstream errata** (`:838`–`:844`). Everything else is
untouched and is not re-litigated. Decision-freeze round: only a defect this delta introduced, or
a load-bearing claim false at HEAD, can block.

## Disposition of prior findings (v8)

| Prior | Status |
|---|---|
| F-01 BR-CLN-3a name-only predicate vs E-18 | Open, inherited, nonlocal — untouched by delta; deferred to TSPEC per v8 |
| F-02 AT-5.2 field-set equality recursion depth | Open, inherited, nonlocal — untouched; deferred to TSPEC per v8 |
| F-03 §7.3 mis-stated REQ AC-1.3 | **Resolved.** Row now reads "REQ AC-1.3 and C-8 are M-8-scoped", which matches `REQ-pdlc-plugin-retirement.md:325`–`:330` (AC-1.3, "no skipped or pending test belonging to M-8") and `:261`–`:263` (C-8) |
| F-04 membership-only exemption buys green by widening the inventory | **Resolved as routed.** The exemption is no longer keyed to `SKIP_INVENTORY` membership at all but to the run's sink records, which cannot be widened by editing a spec table; §7.3 records the residue (whether the comparator also pins a join) as routed to TSPEC §5.5. Inventory-widening attack is closed |
| F-05 E-16b rationale weaker than shipped evidence | Open, inherited, nonlocal — untouched |
| F-06 Cross-Reviews header row stops at v4 | Open, inherited, nonlocal — untouched (`:11`) |

## Delta claims verified against HEAD

| Claim in delta | Verdict | Evidence |
|---|---|---|
| "capability-gated skips already register on a root runner at HEAD, so the wider clause was already false" | True | `pdlc/workflows/__tests__/helpers/driftCapabilities.js:93`–`:123` (ten `uid-nonroot` `SKIP_INVENTORY` entries), `:324` (`itOrSkip`) |
| The run's skip **sink records** are the run-time boundary, distinct from `SKIP_INVENTORY` | True | `pdlc/workflows/__tests__/helpers/skipSink.js:5`–`:13` (run-scoped on-disk sink, comparator in `globalTeardown`); `driftCapabilities.js:127`–`:136` (`REGISTERED_SKIPS` is per-file and deliberately not the comparator input) |
| "the inventory is deliberately not closed over registered skips, so keying the exemption to it would fail correct skips" | True, verbatim the shipped rationale | `skipSink.js:37`–`:47` ("Closure … is deliberately NOT enforced … Asserting closure would fail the whole run on any root runner for skips that are correct") |
| `guardMatrix.test.js`'s rows are the measured instance of out-of-surface pending markers | True | `guardMatrix.test.js:325` (`it.skip.each(NON_BESPOKE_BLOCK)`), `:334`; `skipSink.js:17`–`:21` states those rows never reach the helpers and so never reach the sink |
| REQ needs no edit | True as to AC-1.3/C-8 wording | `REQ-…:325`–`:330`, `:261`–`:263` are M-8-scoped and silent on registered skips |

No path, symbol or file newly named by the delta is missing at HEAD, and none of them is on the
sweep's deletion list (`skipSink.js`, `driftCapabilities.js`, `guardMatrix.test.js` all survive).

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | *(delta, local.)* §7.3's "the FSPEC clause is now no wider than its upstream" is true only through AC-1.3's *second* conjunct, not its first. The swept surface includes **surviving** modules that host R-8's re-homed assertions; those are not M-8 modules, so the first conjunct ("no skipped or pending test belonging to M-8", `REQ:326`) does not reach them. They are reached by AC-1.3's "every module named *retained* … is present and **passing**" (`REQ:328`–`:330`) — and a sink-registered skip in a re-homed host is exempt in FSPEC while not "passing" upstream. Narrow residual gap, not exercised by any planned skip (the only registered skip TSPEC plans is TT-1b in the new `consumerCleanup.test.js`, `TSPEC:738`), but the §7.3 sentence claims more than the M-8 scoping alone supports. One clause naming the second conjunct as the covering upstream would make the row exact. | §7.3 row 1; §6.1 AT-1.3 |
| F-02 | Medium | Local | *(inherited, nonlocal — carried from v5 F-01 / v7 F-01 / v8 F-01, untouched again.)* BR-CLN-3a's name-only expectation cannot decide E-18: classification rests on L-11's name set ("not content"), while E-18 (`:578`) concerns a git-tracked file in the directory and BR-CLN-5 forbids touching tracked files. A name-in-L-11 **and** path-untracked predicate resolves it without consulting a manifest. | BR-CLN-3a; BR-CLN-5; E-18 |
| F-03 | Medium | Local | *(inherited from v7 F-02 / v8 F-02, untouched.)* AT-5.2's field-set equality does not say whether it recurses. Clause 1 compares field sets at report level (`:773`); clause 2 exempts eight run-variable collections by "presence" (`:779`). Whole-report recursive key-set equality reds on `dispatches`/`loop` nesting (`pdlc/engine/lib/report.mjs:64`, `:70`, `:85`, `:91`). | §6.5 AT-5.2 (1)–(2); E-21 |
| F-04 | Low | Local | *(delta, local.)* The compression dropped BR-SWEEP-6's inline `helpers/skipSink.js` citation, so "the run's skip sink" is now named only abstractly in both BR-SWEEP-6 and AT-1.3. Defensible at FSPEC altitude (the file is a TSPEC-owned mechanism, `TSPEC:738`), but the reader loses the one pointer that made "sink membership at run time" checkable. | §4 BR-SWEEP-6; §6.1 AT-1.3 |
| F-05 | Low | Local | *(delta, local.)* The compression also dropped "neither creates nor" from "pre-existing state this feature neither creates nor repairs", leaving only "does not repair". The stronger half — the sweep does not *introduce* `guardMatrix.test.js`'s pending rows — was the part that made the carve-out principled rather than a convenience. | §4 BR-SWEEP-6 |
| F-06 | Low | Local | *(inherited v7 F-03 / v8 F-05.)* E-16b's rationale is weaker than the shipped evidence: the retired channel reserves the `.pdlc-` prefix for its own temporaries (`pdlc/hooks/scripts/sync-workflows.sh:299`, `:323`; `pdlc/hooks/scripts/lib/pdlc-drift.sh:735`). Outcome right, stated case understated. | §5, E-16b |
| F-07 | Low | Local | *(inherited v7 F-04 / v8 F-06.)* The `Cross-Reviews` header row still stops at v4 (`:11`) while v5/v7/v8 SE and v5–v8 TE cross-reviews are tracked in the feature directory. | §0 header |

## Questions

| ID | Question |
|----|---------|
| Q-01 | TSPEC §6.1 erratum 9 (`TSPEC:1019`–`:1028`) still records the *proposed* narrowing ("absent from the skip sink's **inventory**", "and REQ AC-1.3") — which is not what FSPEC v0.7 did, and FSPEC v0.7 is right on the merits (`skipSink.js:37`–`:47`). Who reconciles the erratum's own text, and `TSPEC:738`'s "AT-1.3 as approved forbids a skip of any kind"? Downstream, so not folded here. |

## Positive Observations

- The v8 F-04 attack is genuinely closed, not papered over. Keying the exemption to run-time sink
  records rather than `SKIP_INVENTORY` membership means no spec-table edit can buy a green gate:
  a skip must actually fire and be registered through `itOrSkip` to be exempt, and the inventory
  agreement direction (`skipSink.js:29`–`:33`, C2) still binds any registered skip that names a row.
- Diverging from the erratum *as raised* and saying so in §7.3, with the reason, is the right
  handling. The erratum asked for inventory membership; HEAD's comparator deliberately refuses
  closure over the inventory, so implementing the erratum literally would have failed correct
  skips on any root runner. The row records the divergence instead of silently complying.
- The prohibition that mattered survived the compression intact: a bare `it.skip` or unregistered
  pending marker in the swept surface still fails, in both BR-SWEEP-6 and AT-1.3, and the
  surrounding conjuncts (L-5's literal file count, L-6's two rows with named assertion titles each
  reverting red) are byte-identical.
- Scoping to the swept surface, rather than repo-wide, removes the pre-existing falsity v8 Q-01
  flagged without weakening anything the feature owns.

DEFERRED: name AC-1.3's "present and passing" conjunct in the §7.3 row so the "no wider than upstream" claim is exact (F-01).
DEFERRED: restore the `helpers/skipSink.js` pointer and the "neither creates" half in BR-SWEEP-6 at the next unfrozen edit (F-04, F-05).
DEFERRED: fold F-02 (BR-CLN-3a name+untracked predicate) and F-03 (AT-5.2 recursion depth) into TSPEC's implementing contracts while the FSPEC stays frozen.
DEFERRED: pin an expected maximum capability-skip set for the swept surface so future widening is a reviewed decision (v8 Q-01, still open).

## Recommendation

**Approved with minor changes**

No High findings. The delta introduced no defect: every claim it newly makes is true at HEAD and
cited above, and nothing the previous revision established was weakened. F-01 is a one-clause
precision fix on a self-description in §7.3, F-04/F-05 are compression residue, and the remaining
findings are inherited and already routed to TSPEC. Nothing here blocks in a frozen round.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 3, "low": 4}
