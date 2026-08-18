# Cross-Review: product-manager — TSPEC

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-plugin-retirement/TSPEC-pdlc-plugin-retirement.md` (v0.5)
**Date:** 2026-08-17
**Iteration:** 5
**Scope:** Product lens only — requirements traceability, scope compliance, acceptance-criteria
fidelity. Delta re-review against `CROSS-REVIEW-product-manager-TSPEC-v4.md`; only the changed
hunks (`git diff 60c3efdd..HEAD`, 75 insertions / 17 deletions, one file) were scanned for new
issues. Unchanged sections already approved are not re-litigated.

## v4 findings disposition

| v4 ID | Severity | Status | Evidence |
|---|---|---|---|
| F-01 | High | **Resolved** | §5.5's orphan-freedom universal is now two-channel: a surviving `*.js` file directly under `pdlc/workflows/__tests__/helpers/` must be *either* imported by a surviving test module or helper *or* referenced by `globalSetup` / `globalTeardown` in `pdlc/workflows/package.json`. Both channels are specified as re-derived at assertion time rather than transcribed, and rule 2 requires specifier-form matching so that `driftHelpers.test.js`'s stale *comment* mention of `skipSinkTeardown.js` cannot satisfy channel (a). Verified at HEAD: `pdlc/workflows/package.json:37`–`:38` name `__tests__/helpers/skipSinkSetup.js` and `__tests__/helpers/skipSinkTeardown.js`; grepping `__tests__/` shows `skipSinkTeardown.js`'s only `*.test.js` mention is the comment at `driftHelpers.test.js:108`, a module M-8 deletes (`FSPEC-pdlc-plugin-retirement.md:370`). The universal is now true post-sweep. §2.6 carries the matching prose carve-out, closing Q-01. |
| F-02 | Low | **Resolved** | §5.5 now separates the directions explicitly: the oracle's coverage is the **survival** direction, while "`driftOrdering.js` ends the sweep consumer-less" is stated as a **pre-sweep** measurement recorded in §2.6 and not re-checked post-sweep. Verified at HEAD: `driftOrdering.js`'s consumers are `bootstrap.test.js` and `drift*.test.js` modules, all M-8 members; the three `helpers/bin/*.sh` drivers are consumed only by `driftFault.test.js` and `driftOrdering.test.js`, both swept, so rule 3's "empty post-sweep" claim also holds. |
| Q-01 | — | **Answered** | §2.6 now states the config channel and names `package.json`'s `globalSetup` / `globalTeardown` as the consumer, so the "consumed only by modules the sweep deletes ⇒ delete" rule can no longer be misapplied to `skipSinkTeardown.js`. |
| Q-02 | — | **Answered** | §6.1 erratum 8 gained a routing note fixing the conjunct's field set (files under `helpers/`, not `*.test.js`) and requiring the same two channels, so criterion and test cannot end up scoped differently. |

The changed hunks are §2.6's carve-out, §5.2's TT-1b sentence, §5.5's rewritten no-skip and
orphan-freedom paragraphs, §6.1 erratum 8's routing note, and the version/lineage header. Scanning
those surfaces one new High finding (F-01 below), inside §5.5's *new* "unregistered skip"
paragraph, plus one Low on TT-1b's wording. Nothing previously approved was reopened.

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | High | Local | **§5.5's new paragraph relaxes an approved acceptance test and attributes the relaxed wording to AT-1.3, which does not say it.** The rewritten line 806 reads "No **unregistered** `skip`, no pending marker … (C-8, BR-SWEEP-6)", and line 819 asserts "AT-1.3's clause reads 'no skip absent from the skip sink's inventory'". Neither upstream text says that. `FSPEC-pdlc-plugin-retirement.md:615`–`:616` states AT-1.3 as "the suite contains **no skipped or pending test at all** (repo-wide, not only among M-8's modules — a skip in a surviving module is the same defect and BR-SWEEP-6 forbids both)", and `FSPEC:285`–`:287` states BR-SWEEP-6 flatly: "No `skip`, no pending marker, no assertion left vacuously true". REQ AC-1.3 (`REQ-pdlc-plugin-retirement.md:325`–`:330`) is narrower still — "no skipped or pending test belonging to M-8" — and is silent on registered skips, so FSPEC's repo-wide clause is the binding statement, and the TSPEC is unilaterally widening what passes it. The divergence is real, not academic: on a root runner TT-1b's `chmod 000` arm skips, which the TSPEC's reading tolerates ("a root CI runner must still report the gap rather than silently pass") and the FSPEC's reading fails outright. Product consequence: the acceptance test a maintainer runs to accept AC-1.3 would be coded to a bar the approved FSPEC never authorised, and no erratum routes the change back — §6.1's eight errata cover M-11p, `runtime-adapter.js`, `consolidate-learnings`, A-1's allow-list, C-5/M-11h, L-5, the usage-error criterion and `driftOrdering.js`, none of them this. Fix: keep TT-1b's registered-skip mechanism (it is the right design and the mechanism already exists), but state it in §5.5 as a *proposed* amendment to AT-1.3 rather than as AT-1.3's existing reading, and route the wording change as a new §6.1 erratum against the FSPEC — the ERRATUM line in this review's trailer raises it. | REQ AC-1.3; FSPEC AT-1.3, BR-SWEEP-6; TSPEC §5.5, §5.2 TT-1b |
| F-02 | Low | Local | **§5.2's TT-1b calls `helpers/driftCapabilities.js` "the sink"; the sink is `helpers/skipSink.js`.** TT-1b's new sentence reads "`itOrSkip` with a `SKIP_INVENTORY` capability entry from `helpers/driftCapabilities.js` (the sink already used by `skipSinkTransport.test.js` and `documentOracles.test.js`)". At HEAD `driftCapabilities.js` exports `SKIP_INVENTORY` (`:93`) and `itOrSkip` (`:324`) and is the *registration* API; the on-disk sink is `skipSink.js`, which `driftCapabilities.js:134`–`:135` itself names as "the on-disk sink in `skipSink.js`, compared to `SKIP_INVENTORY` once at end of run by `skipSinkTeardown.js`". §5.5's own prose gets this right ("the skip sink's inventory", `skipSink.js` as sink). The two named consumers do check out (`skipSinkTransport.test.js:47`, `documentOracles.test.js:54` both import `itOrSkip`). Naming only, but §2.6/§5.5 turn on which helper survives for which reason, so the imprecise label is worth one word. | REQ AC-1.3; TSPEC §5.2 TT-1b |

FINDING: High | delta | local | §5.5 "unregistered skip" paragraph (lines 806, 819) | attributes "no skip absent from the skip sink's inventory" to AT-1.3, which reads "no skipped or pending test **at all**" (`FSPEC:615`–`:616`); relaxation is unrouted by any §6.1 erratum
FINDING: Low | delta | local | §5.2 TT-1b | calls `driftCapabilities.js` "the sink"; the sink is `skipSink.js` (`driftCapabilities.js:134`)

## Questions

| ID | Question |
|----|---------|
| Q-01 | If the FSPEC amendment F-01 asks for is accepted, should the amended AT-1.3 clause also require the *inventory* side — that every `SKIP_INVENTORY` entry the sweep adds names a capability and a non-empty invariant list? At HEAD `validateSkipRecords` (`pdlc/workflows/__tests__/helpers/skipSink.js:120`–`:152`) already enforces exactly that on every run, records or not, so the criterion would be citing existing behaviour rather than asking for new work — and it is what keeps "registered" from degrading into "listed". |
| Q-02 | §5.5 rule 1 says a future helper "wired through neither channel reds". `helpers/` also holds files reachable only from `pdlc/workflows/lib/` or from the runtime bundle rather than from `__tests__` — none today, but if the sweep's re-homing moves a fixture that way, is the intended answer to widen channel (a)'s grep or to move the file out of `helpers/`? Worth one clause so the next reader does not widen the oracle by reflex. |

## Positive Observations

- **The F-01 fix landed as a rule, not a patch.** §5.5 could have appended two filenames to an
  exception list; instead it names *two wiring channels*, specifies both as re-derived at
  assertion time, and then adds three scope rules that say exactly what the universal ranges
  over. Rule 2 in particular is the kind of detail that only comes from actually running the
  grep: matching `"./helpers/<name>.js"` in import position and `new URL(…)` rather than bare
  names, because the bare-name grep would be satisfied by `driftHelpers.test.js:108`'s comment —
  which is precisely the false-green the v4 finding was about. Verified at HEAD.
- **§2.6 and §5.5 now say the same thing in two registers.** The prose carve-out and the oracle
  are stated from the same evidence (`package.json:37`–`:38`), so a reader who applies §2.6's
  disposition rule by hand and a test that applies §5.5's universal mechanically reach the same
  answer for `skipSinkSetup.js` / `skipSinkTeardown.js`. Prose and oracle drifting apart is the
  usual failure mode here, and this round closed it deliberately.
- **The pre-sweep / post-sweep split is honest about what an oracle can see.** Rather than
  inventing a post-sweep predicate for "`driftOrdering.js` was correctly deleted", v0.5 states
  plainly that once the file is gone no post-sweep assertion can distinguish correct deletion
  from mistaken deletion, and grounds that half in §2.6's measurement instead. Naming an
  unassertable claim as unassertable is more useful to the implementer than a plausible-looking
  assertion that proves nothing.
- **TT-1b's registered-skip mechanism is the right one and is checkable today.** The design
  works against HEAD as written: `SKIP_INVENTORY` (`driftCapabilities.js:93`) already carries ten
  `uid-nonroot` entries, and `validateSkipRecords` (`skipSink.js:120`+) reds on a skip *absent*
  from the inventory while an inventory entry that never fires on a non-root runner is not a
  violation — so adding a TT-1b entry costs nothing on CI and still reports the gap on a root
  runner. F-01 is about the FSPEC attribution, not about this mechanism.
- **§6.1 erratum 8's routing note fixes the field set, not just the wording.** It states that an
  AC-1.3 conjunct must range over files under `helpers/` rather than `*.test.js` modules, and
  must carry both channels — closing v4's Q-02 concern that criterion and test could land scoped
  differently.

## Recommendation

**Needs revision** — one High finding, narrow and mechanical. Both v4 findings and both v4
questions are resolved; nothing previously approved was reopened.

Required change:

1. **F-01 (High)** — In §5.5, stop attributing the relaxed clause to AT-1.3. Say instead that
   AT-1.3 as approved reads "no skipped or pending test at all" (`FSPEC:615`–`:616`), that
   TT-1b's root-conditional arm cannot satisfy that reading on a root runner, and that this
   TSPEC *proposes* narrowing the clause to skips absent from the skip sink's inventory. Add the
   proposal to §6.1 as a ninth erratum against the FSPEC so the upstream owner makes the change
   in AT-1.3 and BR-SWEEP-6, rather than the TSPEC carrying a wording the FSPEC never approved.
   The mechanism (`itOrSkip` + `SKIP_INVENTORY` entry) stays exactly as specified.

Optional (F-02, Low): in §5.2's TT-1b, call `driftCapabilities.js` the registration API and
`skipSink.js` the sink, matching §5.5's own usage.

§2.6's carve-out, §5.5's three scope rules, the pre-sweep/post-sweep split and §6.1 erratum 8's
routing note all check out against HEAD and are approved as written.

## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 0, "low": 1}
