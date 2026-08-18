# Cross-Review: product-manager — TSPEC

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-plugin-retirement/TSPEC-pdlc-plugin-retirement.md` (v0.6)
**Date:** 2026-08-17
**Iteration:** 6
**Scope:** Product lens only — requirements traceability, scope compliance, acceptance-criteria fidelity.

## v5 findings disposition

Delta re-review against `CROSS-REVIEW-product-manager-TSPEC-v5.md`; `git diff 92ae9145..HEAD` on the
TSPEC (99 insertions / 25 deletions, one file) scanned for new issues. Unchanged sections already
approved are not re-litigated.

| v5 ID | Severity | Status | Evidence |
|---|---|---|---|
| F-01 | High | **Resolved as written, then overtaken upstream** | v0.6 stops asserting the relaxed clause *is* AT-1.3 and routes it instead: §5.5's new second paragraph says plainly "This TSPEC does **not** restate AT-1.3 as if it already tolerated that skip. It *proposes* narrowing the clause … and routes the proposal upstream as §6.1 erratum 9" (TSPEC:815–818), and erratum 9 lands at TSPEC:1020–1032 with an owner (FSPEC) and a requested edit. That is exactly the change v5 asked for. It has since been overtaken: FSPEC accepted and folded erratum 9 in at v0.7, 2026-08-18 (`FSPEC-pdlc-plugin-retirement.md:838`–`:843`), so the "not yet landed" framing v0.6 now carries is stale in the opposite direction — see F-01 and F-02 below. |
| F-02 | Low | **Resolved** | §5.2's TT-1b now distinguishes the two files correctly: "both from the registration API `helpers/driftCapabilities.js` … the on-disk sink those records land in is `helpers/skipSink.js`" (TSPEC:738). Matches HEAD — `itOrSkip` is exported from `driftCapabilities.js:324`, `KNOWN_CAPABILITY_KEYS`/`validateSkipRecords` from `skipSink.js:55`/`:118`. |
| Q-01 | — | **Answered** | Erratum 9 states the collision predates the sweep because `SKIP_INVENTORY` already carries ten `uid-nonroot` entries (TSPEC:1025–1026). Verified at HEAD: `driftCapabilities.js:94`–`:121` holds exactly ten `capability: "uid-nonroot"` records. |
| Q-02 | — | **Answered** | §5.5's orphan universal ranges over `*.js` under `helpers/`, and TT-1b's inventory edit is placed in §2.9's class-3 row (TSPEC:861–864), so the criterion and the file it touches land in the same commit. |

Changed regions in this round: the version/lineage header, §2.6's class-3 row in the change table,
§5.2's TT-1b, all of §5.5's skip discussion (rewritten and roughly tripled), §5.5's orphan-oracle
scope rules (three → four), and §6.1's new erratum 9. Scanning those regions surfaces two High
findings, both from the same cause — the upstream moved between v0.5 and v0.6 and the TSPEC's
account of AT-1.3 did not follow it — plus one Medium and one Low.

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | High | Local | **§5.5 and §6.1 erratum 9 tell the implementer the AT-1.3 edit has not landed. It landed — FSPEC v0.7, and the TSPEC's own erratum is what landed it.** §5.5 reads "Until that edit lands, the binding text is the wider one, and an implementer reading only this TSPEC must not treat TT-1b's registered skip as accepted" (TSPEC:819–820), and erratum 9 closes "Until this edit lands, §5.5's join oracle exists but the binding acceptance wording is the wider one" (TSPEC:1030–1031). At HEAD, FSPEC is v0.7 (2026-08-18) and its erratum log records erratum 9 as "accepted and folded in, with the boundary corrected in v0.7" (`FSPEC-pdlc-plugin-retirement.md:838`, row at `:843`). The narrowed clause is now the approved text of both statements: AT-1.3 reads "the suite contains **no skipped or pending test absent from the skip sink's records for that run** — a capability-gated skip that registers itself into the sink is a declared runner limitation and does not fail this test" (`FSPEC:622`–`:628`), and BR-SWEEP-6 says the same at `FSPEC:285`–`:291`. Product consequence: an implementer who follows the TSPEC literally codes TT-1b to a criterion the product owner has already superseded, and either writes the row's skip out (losing the root-runner coverage §5.5 argues for) or ships it believing it violates an approved AC. The mechanism §5.5 specifies is right; only its account of what is binding is stale. Fix: state that erratum 9 was raised, accepted, and folded into FSPEC v0.7, and that the narrowed clause is the binding text TT-1b satisfies. | REQ AC-1.3; FSPEC AT-1.3, BR-SWEEP-6; TSPEC §5.5, §6.1 |
| F-02 | High | Local | **The narrowing the TSPEC carries is keyed to `SKIP_INVENTORY` membership; the clause FSPEC approved is keyed to the run's sink *records*, and FSPEC rejected the membership key by name.** TSPEC states the exemption three times as inventory membership: §5.2's TT-1b ("erratum 9's proposed narrowing to skips absent from the skip sink's inventory", TSPEC:738), §5.5 ("narrowing the clause to 'no skip or pending test absent from the skip sink's inventory'", TSPEC:817), and erratum 9 ("narrow AT-1.3's clause and BR-SWEEP-6 to 'no skip or pending test **absent from the skip sink's inventory**' — a registered `itOrSkip` skip carrying a `SKIP_INVENTORY` row is a declared capability gap", TSPEC:1027–1029). FSPEC approved a different boundary and says why: the exemption "reaches the run's **skip sink records**; the exemption is not keyed to `SKIP_INVENTORY` membership, since the inventory is deliberately not closed over registered skips" (`FSPEC:843`), answering SE FSPEC v8 F-04 — "membership-only exemption lets the inventory be widened to green the gate without a skip firing" (`FSPEC:843`, second row). The two differ on a real case: a `SKIP_INVENTORY` row added without any skip actually firing exempts nothing under the approved clause and would exempt under the TSPEC's. §5.5's *oracle* already implements the approved shape — its right set is "the sink's records for the same run … after `validateSkipRecords` returns zero violations" (TSPEC:848–850), records-keyed, not membership-keyed — so this is prose diverging from the TSPEC's own mechanism, not a design change. Fix: restate the clause in §5.2, §5.5 and §6.1 as "absent from the skip sink's records for that run", matching `FSPEC:622`–`:628`. | REQ AC-1.3; FSPEC AT-1.3, BR-SWEEP-6; TSPEC §5.2, §5.5, §6.1 |
| F-03 | Medium | Local | **§5.5 still asserts AT-1.3 is repo-wide; the approved AT-1.3 is scoped to the swept surface and puts the rest of the suite out of scope.** TSPEC:807–808 opens "AT-1.3 asserts this repo-wide, not only over M-8's modules: a skip introduced in a *surviving* module is the same defect as one left behind", and §5.5's join oracle takes its left set as "jest's pending set for the run" (TSPEC:847). FSPEC v0.7 scopes both AT-1.3 and BR-SWEEP-6 "across the **swept surface** (M-8's deleted modules and the surviving modules hosting R-8's re-homed assertions)" and adds "pending markers elsewhere in the suite are out of scope" (`FSPEC:622`–`:628`, `FSPEC:285`–`:291`). A run-wide left set is therefore stricter than the approved criterion, and would red on a pre-existing pending marker outside the swept surface that the product owner deliberately excluded (`FSPEC:293` names `guardMatrix.test.js`'s pre-existing case). Severity Medium, not High: the divergence over-enforces rather than under-enforces, so no required behaviour is lost — but it can fail the sweep for a defect the sweep did not introduce, which is the class of false halt this feature is trying to remove. Fix: scope §5.5's paragraph and the join oracle's left set to the swept surface, per `FSPEC:622`. | REQ AC-1.3; FSPEC AT-1.3, BR-SWEEP-6; TSPEC §5.5 |
| F-04 | Low | Local | **The join oracle's right⊄left direction has a known-benign counterexample in a surviving module, and the TSPEC does not name the condition that keeps it benign.** §5.5 asserts set equality in both directions, "right ⊄ left catches a record written for a test that did not actually skip" (TSPEC:852–854), with the soundness argument resting on `itOrSkip` passing the same `name` to `it.skip` and to `registerSkip` — true at HEAD (`driftCapabilities.js:324`–`:333`). But that same function's `isInsideRunningTest()` branch registers a record and returns *without* calling `it.skip` (`driftCapabilities.js:330`–`:331`), producing a record with no jest pending entry — precisely the right⊄left shape. `skipSinkTransport.test.js` (a survivor) uses that idiom deliberately and documents it at `:337`–`:340`. It is harmless only because the file redirects the sink env var to a temp path per test (`skipSinkTransport.test.js:63`–`:67`, restored at `:79`–`:83`), so those records never reach the run's authoritative sink. Worth one sentence in §5.5 so the next author knows the oracle depends on that redirection holding. | FSPEC AT-1.3; TSPEC §5.5 |

FINDING: High | delta | local | §5.5 (TSPEC:819–820), §6.1 erratum 9 (TSPEC:1030–1031) | says the AT-1.3 narrowing has not landed; FSPEC v0.7 accepted and folded erratum 9 in (`FSPEC:838`, `:843`) and AT-1.3/BR-SWEEP-6 already carry the narrowed clause (`FSPEC:622`–`:628`, `:285`–`:291`)
FINDING: High | delta | local | §5.2 TT-1b (TSPEC:738), §5.5 (TSPEC:817), §6.1 erratum 9 (TSPEC:1027–1029) | carries the exemption as `SKIP_INVENTORY` membership; approved AT-1.3 keys it to the run's sink records and FSPEC rejected the membership key by name (`FSPEC:843`)
FINDING: Medium | inherited | local | §5.5 (TSPEC:807–808, :847) | asserts AT-1.3 is repo-wide; approved AT-1.3 is scoped to the swept surface with the rest of the suite out of scope (`FSPEC:622`–`:628`)
FINDING: Low | delta | local | §5.5 join oracle (TSPEC:852–854) | right⊄left soundness depends on `skipSinkTransport.test.js`'s sink redirection (`:63`–`:67`), since `itOrSkip`'s in-test branch registers without a pending test (`driftCapabilities.js:330`)

## Questions

| ID | Question |
|----|---------|
| Q-01 | With erratum 9 folded in upstream, does §6.1's count word ("Nine claims and open surfaces …", TSPEC:924) still describe the section's product intent — errata *open* against upstream — or does erratum 9 now need a resolved marker so a reader can tell at a glance which of the nine still await an owner's edit? Errata 6 and 8 read as open; 9 is closed. |
| Q-02 | AT-1.3's approved exemption is keyed to the run's sink records and FSPEC notes the inventory "is deliberately not closed over registered skips" (`FSPEC:843`). §5.5's join oracle still filters the right set through `validateSkipRecords(…, SKIP_INVENTORY)` before comparing (TSPEC:848–850), which additionally requires TT-1b's gap to hold an inventory row. Is that extra conjunct intended as a TSPEC-side strengthening (fine, but worth saying so), or should the join stand on records alone? |

## Positive Observations

- **The v5 High was fixed by routing, not by rewording — the expensive, correct option.** v0.6 could have quietly adjusted §5.5's prose to sound compatible with AT-1.3. Instead it states outright that the TSPEC "does **not** restate AT-1.3 as if it already tolerated that skip" (TSPEC:815), files erratum 9 with a named owner and a requested edit, and tells the implementer what to do in the interim. That is what made the upstream fix possible: FSPEC's own erratum log credits "TSPEC §6.1 erratum 9" as the raise (`FSPEC:843`). The findings above are the cost of that route succeeding faster than the TSPEC could re-measure, which is a good problem.
- **The rejected alternative is costed, not dismissed.** §5.5's third paragraph prices pinning the gate runner to non-root — "cheaper today (no inventory entry, no join oracle, no upstream erratum)" — and rejects it for a product reason a PM can check: a green AT-1.3 that is an artefact of runner configuration reports nothing on a root runner, and the pin lives in CI config the TSPEC's oracles cannot see. Naming what the chosen path costs ("exactly erratum 9 plus the join oracle below") is the form that lets a reviewer disagree on evidence.
- **The comparator-is-not-an-oracle paragraph is the round's best work.** §5.5 walks `validateSkipRecords`' C1/C2/C3 and shows it observes only the registered direction, so a bare `it.skip` "produces no record and no violation — the comparator is silent, not green-with-evidence", and then names the cheapest wrong test (`pendingCount === sinkRecords.length`) and rejects it. Verified at HEAD: `skipSink.js:118`–`:180` iterates inventory entries and records only, and never touches jest state. This is exactly the absence-only-oracle trap the review bar exists to catch, caught by the author first.
- **The join is specified as set equality in both directions, with the key's soundness argued from source.** Left ⊄ right catches the bare skip; right ⊄ left catches a stale hand-written record (TSPEC:852–854). The join key's soundness — `itOrSkip` passing the same `name` to `it.skip` and `registerSkip` — is true at `driftCapabilities.js:324`–`:333`, and the choice of leaf title rather than `fullName` matters, since the `describeOrSkip` call sites that would break it (`driftClassify.test.js:226`, `driftBackups.test.js:62`, `driftOrdering.test.js:125`) are all M-8 members the sweep deletes. That check-out is not stated in the TSPEC but holds.
- **`KNOWN_CAPABILITY_KEYS` is now transcribed, not recalled.** §5.5's `["bash", "git", "hash", "uid-nonroot"]` matches `skipSink.js:55` exactly, and the argument that `uid-nonroot` is the only member naming the distinction TT-1b turns on is checkable against `PRINTED_REASONS` (`driftCapabilities.js:27`–`:33`). The `unverifiedInvariants` non-emptiness requirement traces to a real C3 clause (`skipSink.js:143`–`:151`).
- **Scope rule 4 closes a hole the reviewer had not raised.** "Two helpers that import only each other are orphans, and a one-hop 'imported by some surviving `.js`' rule would pass them" — reachability rooted at test modules and config entry points, closing over helper-to-helper edges. The v5 version would have false-greened exactly that pair. Rule 3's addition that git tracks files rather than directories, so deleting `helpers/bin/`'s three drivers removes the path outright, is the same instinct applied to a reader's misreading rather than an oracle's.

## Recommendation

**Needs revision** — two High findings, both mechanical, both from one cause: FSPEC moved to v0.7
between this TSPEC's measurement and this review, accepting the very erratum §6.1 raised. Nothing
previously approved is reopened, and no mechanism changes.

Required changes:

1. **F-01 (High)** — In §5.5 (TSPEC:819–820) and §6.1 erratum 9 (TSPEC:1030–1031), remove the
   "until that edit lands, the binding text is the wider one" framing. FSPEC v0.7 accepted and
   folded erratum 9 in (`FSPEC:838`, `:843`); AT-1.3 (`FSPEC:622`–`:628`) and BR-SWEEP-6
   (`FSPEC:285`–`:291`) already carry the narrowed clause. Mark erratum 9 resolved-upstream and
   state that TT-1b's registered skip satisfies AT-1.3 as approved.
2. **F-02 (High)** — In §5.2's TT-1b (TSPEC:738), §5.5 (TSPEC:817) and §6.1 (TSPEC:1027–1029),
   restate the exemption as "absent from the skip sink's **records for that run**", not "absent
   from the skip sink's inventory". FSPEC rejected the membership key explicitly (`FSPEC:843`,
   SE FSPEC v8 F-04) because an inventory row can be added without any skip firing. §5.5's own
   join oracle is already records-keyed, so this aligns the prose with the mechanism.

Recommended (F-03, Medium): scope §5.5's "AT-1.3 asserts this repo-wide" sentence (TSPEC:807–808)
and the join oracle's left set (TSPEC:847) to the swept surface, per `FSPEC:622`–`:628`, so a
pre-existing pending marker outside the sweep cannot red the gate.

Optional (F-04, Low): note in §5.5 that right⊄left holds only while `skipSinkTransport.test.js`
redirects the sink env var (`:63`–`:67`), since `itOrSkip`'s in-test branch registers without a
pending test (`driftCapabilities.js:330`).

§5.5's mechanism, the costed alternative, the comparator-is-not-an-oracle argument, the join's
both-direction set equality, the `SKIP_INVENTORY` field spec, the four scope rules and §2.9's
class-3 placement all check out against HEAD and are approved as written.

## Verdict

VERDICT: Needs revision
{"high": 2, "medium": 1, "low": 1}
