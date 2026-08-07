# Cross-Review: test-engineer — FSPEC (delta confirmation, erratum round v11.3)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-consolidation-agent/FSPEC-pdlc-consolidation-agent.md
**Date:** 2026-08-06
**Iteration:** 13
**Scope:** DELTA CONFIRMATION only. Diff reviewed: `767b6b59..0499e532` (the six erratum commits
`b68dddea`, `fcb8a4bc`, `858797f6`, `838868e3`, `b9f66cb4`, `0499e532`), against my v12 approval at
`767b6b59`. I did not re-read the document; I read the diff, the seven erratum items, and the
sections each item names, plus the HEAD sources the new text cites.

## Item-by-item disposition

| # | Erratum item | Disposition | Evidence |
|---|---|---|---|
| 1 | §4.1's "Removed at step 16" states a capability no seam has (te-review + se-author, same item) | **Resolved** | The `Removed` row is split into `Released` — "an **in-place rewrite** of the same file to a single line, `RELEASED: {passId} {ISO-8601}`" (`:424`) — and a new `Removed` row that says **never by the pass** (`:425`). The justification (`:427-430`) cites the grep I raised; I re-ran it at HEAD: `grep -nc "unlink\|rm -f\|rmdir" pdlc/workflows/runtime-adapter.js` → `0`. The spec now describes only operations the adapter ships. |
| 2 | §4.2's `empty (truncated write)` arm is unreachable under a write-empty release; and the product question — must the durable log witness a pass that dies mid-take? (te-review + se-author, same item) | **Resolved, both halves** | The release form is a **sentinel line, not an empty file** (`:437-442`), which is what makes the empty arm reachable at all rather than being the normal end state of every pass; §4.2 grows from three outcomes to four with an explicit `RELEASED:` row (`:463`) and re-labels the last row "Present but **empty**, or a line that is neither form" (`:467`). The product question is answered in the document rather than deferred: **"The durable log must witness that pass"** (`:484`), with the reason stated (the abandoned pass appended no row of its own, so the reclaiming pass's `reclaimed-stale-lock` / `unknown` is the only trace). E-11 is re-grounded (`:2644`), E-11b is new (`:2645`), BR-14 is narrowed to `IN-PROGRESS:` and BR-14a is new (`:2550-2551`), AT-M3 gains the two-fixture form and AT-M11 is the paired negative (`:2084-2085`). See L-03 for one sentence of that rationale that is over-claimed. |
| 3 | AT-P7's *When*/*Then* would be red on correct code (se-author) | **Resolved at the level that matters** | AT-P7 (`:2072`) now compares **the two predicates** over a fixture root rather than running the hook, and states the exclusion explicitly: the `THRESHOLD` gate (`:25`) and the advisory line "govern whether the hook *speaks*, not what it counts, and are asserted neither way here". The stdout oracle that made the row red is gone. The residual is the observation channel, filed as L-04. I verified the cited hook anchors at HEAD: `THRESHOLD = 5` at `:25`, the corpus glob at `:28`, the log read at `:36-37` and the predicate at `:41`. |
| 4 | AC-3.2's PR-body obligation has no acceptance test (se-author) | **Resolved** | **AT-Q13** is new (`:2126`), two fixtures (a multi-feature recurrence and a single-occurrence standing-invariant promotion), asserting all three body obligations — sources **set-equal** to the derived features, the `symptom` line verbatim, and the AC-2.3 evidence *in the form that fixture cleared the bar with*. The AC→AT map now binds AC-3.2 to `AT-Q2` (trailers) **and** `AT-Q13` (body) (`:2320`). §6.2 carries the pointer and the separation ("not discharged by them", `:827-829`). |
| 5 | §5.3's "when, and only when" has no test for the "only when" half (se-author) | **Resolved** | **AT-R7** is new (`:2106`), three fixtures with `docs/_decisions/` listed **before and after** each pass: (a) a `promoted` pass with no §5.3 cause, (b) a `no-op` pass whose promotions were all duplicate-suppressed, (c) a positive control that degrades. AC-1.4 gains AT-R7 in the map (`:2312`) and §5.3 names it inline (`:689-691`). |
| 6 | T-10's `phase`-arm subject (v12 Low) | **Resolved** | T-10 (`:2211`) now excludes "**§8.3's `phase` arm** and §8.1's `failure-mode-id` arm" rather than the whole `phase` arm, and records why. This closes my v12 **L-01**. |
| 7 | BR-33a's `phase`-arm subject (v12 Low) | **Resolved** | BR-33a's `phase` clause (`:2591`) now adds "§8.4 steps 2–3's question is still asked, with the `phase` half stated unavailable". |

## Findings

All four are **Low** on `DEC-SEV-02`'s stated test: no test is missing and no test would be written
wrong. Three are new with this diff; L-02 is carried unchanged from v12.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| L-01 | Low | Local | **BR-13 was not narrowed alongside BR-14.** The same table now reads "BR-13: … a second pass observing it **fresh** terminates `refused`" (`:2549`) beside "BR-14: An **`IN-PROGRESS:`** marker older than …" (`:2550`). Read literally, BR-13 refuses on a `RELEASED:` marker written seconds ago, which §4.2's table (`:463`) and BR-14a (`:2551`) say is taken with no reason code. §4.2's table is normative and AT-M11's fresh fixture falsifies the misreading, so no test is at risk — but this is one register disagreeing with another, and the repair is one word (`IN-PROGRESS:`) in BR-13's rule cell. | §14 BR-13 (`:2549`) vs §4.2 (`:463`), BR-14a (`:2551`) |
| L-02 | Low | Local | **Carried from v12, unchanged.** E-12b still attributes the whole `phase` arm to §14.5 LD-5 ("The `phase`, `failure-mode-id`, `action` and `symptom` arms are likewise … PROPERTIES-owned per §14.5 LD-5", `:2647`), while BR-33a and T-10 have now both been narrowed to say that §8.4 steps 2–3's `phase` half is collected with the `artifact` and `symptom` halves of the same arm (LD-1). Item 7 fixed two of the three registers; E-12b is the third. Deletion-shaped repair; adds no rule, no BR, no AT, no register entry. | §14 E-12b (`:2647`) vs BR-33a (`:2591`), T-10 (`:2211`) |
| L-03 | Low | Local | **The new §4.2 rationale over-claims the empty arm's single producer.** It says the empty state "means exactly one thing: a pass died between opening the marker write and completing it", and that "the abandoned pass appended no terminal row, by construction, since it did not survive its own take" (`:481-489`). The step-16 **release** is also a marker write (§4.1 `:424`), and it runs *after* the terminal row is appended (§4.3 `:509-510`) — so a process killed inside its release leaves the same present-but-empty file, having completed and having written its row. The empty arm therefore has two producers, and on the second the reclaiming pass records a `reclaimed-stale-lock` / `unknown` for a pass that did not abandon anything. The **behaviour** is right in both cases and fails safe (over-recording, never under-recording), and no AT asserts the uniqueness — AT-M3's oracle is reclaim + `unknown`, which holds either way — so nothing is untestable. The sentence is what is wrong, not the arm. Suggested repair: name the second producer and say the record is deliberately conservative. | §4.2 (`:479-489`), §4.1 (`:424`), §4.3 (`:509-512`) |
| L-04 | Low | Local | **AT-P7 does not name the channel the hook's set is observed through.** The *When* is "the hook's [predicate], obtained by executing the shipped `nudge-consolidation.sh` Python block … verbatim against the same root" (`:2072`), but a verbatim execution's only output is the threshold-gated advisory line — which the *Then* rightly refuses to use as the oracle. The set is recoverable (exec the extracted block source in a namespace and read its `pending` binding, computed at `:41` before the `THRESHOLD` comparison at `:42`), so I can write the test today and it is not blocking; but the row would be unambiguous if it named `pending` as the observation. Two adjacent facts belong with it: the block early-exits at `if not learnings: sys.exit(0)` (`:29-30`) so `pending` is unbound on an empty-corpus case, and §14's change register (`:2401`) has the glob at `:28` widened and the predicate at `:41` re-scoped by this very feature — so "the shipped block" means the post-edit block, and the cited line numbers are locators that will drift. | AT-P7 (`:2072`); `pdlc/hooks/scripts/nudge-consolidation.sh:25,28,29-30,36-41` |

## Questions

| ID | Question |
|----|---------|
| Q-01 | AT-M11's older fixture asserts that a `RELEASED:` marker is free "at any age". Nothing now ages a released marker out, so the file persists in the working tree indefinitely (git-ignored, §5.4). Is a released marker older than, say, several cadence periods worth *reporting* — not refusing on, not reclaiming — as evidence of a long-idle repo? I am not asking for an AT; I am asking whether you considered and declined it, so a later reader does not read the silence as an oversight. |

## Positive Observations

- **The sentinel choice is the load-bearing decision in this diff, and it is argued rather than
  asserted.** The easy repair for erratum item 1 was "release truncates the file to empty" — it needs
  no new vocabulary and is one seam call. Taking it would have made item 2 unanswerable: a released
  marker and a half-written one would have been the same observed state, and §4.2's last row would
  have become the *normal* end state of every pass rather than an error arm. §4.1 (`:437-442`) picks
  the harder form and says exactly why, in terms of what the existence seam can distinguish
  (`file_empty` vs `file_missing`). I checked that claim at HEAD: `rtCheckFile`
  (`pdlc/workflows/runtime-adapter.js:817-831`) returns `{ok:false, reason:"file_empty"}` for a
  present-but-empty path and `"file_missing"` for an absent one, exactly as cited. Two errata that
  arrived as separate items were correctly seen as one decision.
- **Every new AT arrived with its falsifying pair, unprompted.** AT-M3's fixture (a) would be passed
  by an implementation that recorded `reclaimed-stale-lock` on *every* take — so AT-M11 exists and
  says so in its own cell ("The older fixture is what stops an implementation from routing every
  non-`IN-PROGRESS:` file through the stale-lock arm"). AT-Q13's fixture (b) exists to stop a body
  that emits a recurrence list unconditionally. AT-R7's fixtures (a) and (b) reach "no cause" by two
  different routes, so an implementation that wrote a proposal file on every `no-op` fails one of
  them. This is the discipline I have been asking for since v10 applied without being asked.
- **The two negative-half ATs close real false-green gaps, not bookkeeping ones.** AT-Q13 states its
  own reason for existing in falsification terms — "a body carrying nothing but the three trailers is
  green under AT-Q2 and red here" — and AT-R7 does the same ("an implementation that wrote a proposal
  file on every pass … was green everywhere"). Both are the correct shape for an "only when"
  obligation: the negative fixture, not a restatement of the positive.
- **AT-P7's re-scoping names what it does *not* assert.** The row now excludes the `THRESHOLD` gate
  and the printed line explicitly, and gives the falsifying reason ("a case whose set is smaller than
  the threshold is still a case, and an oracle that compared the hook's stdout would be red on it
  while the predicate agreed"). It also states what happens to the row if T-08 resolves the other way
  — fixture table and comparison unchanged, both evaluations route to one implementation — so the
  test survives the open decision it depends on.
- **The erratum is scoped and declared.** The v11.3 header block (`:12-19`) enumerates the seven items
  and asserts "nothing else is changed"; the diff bears that out — 14 hunks, every one traceable to a
  numbered item, no new repo path, no new lexicon value, no new config key, and no edit to a section
  outside the seven. I re-checked the set-equalities I have tracked since v10 (§8.1 cell-level rule,
  §14.5 register, BR-33a's enumeration, AT-F19/F20/F21/Q7c) and none was touched.
- **Nothing I previously approved is broken.** I re-derived §4.2's outcome table as a total function
  over the observed states — absent, `RELEASED:`, `IN-PROGRESS:` young, `IN-PROGRESS:` old, empty,
  neither-form — and all six are covered exactly once, with the two free states agreeing on outcome
  and differing only in bookkeeping, as §4.2 `:469-471` says. §4.3's terminal-status/release table
  (`:500-507`) needed no change and got none: `refused` and `skipped-cadence` still hold no marker,
  and §4.3's "a process killed before step 16 leaves the marker behind, and the §4.2 stale rule is
  what recovers it" is still true under the new release form. The AC→AT map picked up all three new
  rows (AC-1.3 → AT-M11, AC-1.4 → AT-R7, AC-3.2 → AT-Q13), and every new AT has a BR or an E row
  pointing at it (BR-14a and E-11b → AT-M11).

## Recommendation

**Approved with minor changes**

**The delta resolves all seven errata and breaks nothing I previously approved.** Both items I
raised myself are answered at the width I asked for: §4.1 no longer claims a removal the runtime
cannot perform (grep re-run at HEAD, still `0`), and the empty-marker arm is no longer unreachable —
because the release form was changed to a sentinel, which is the repair that makes the arm mean
something, rather than the deletion of the arm, which would have been the cheap one. The product
question I put behind that arm is **answered in the document**, in the affirmative, with the reason
stated: the durable log must witness a pass that died mid-take, because that pass wrote no row of its
own and the reclamation record is its only trace. That is an FSPEC answering a product question at
the layer it belongs to.

The five se-author items are equally clean. AT-P7 is re-scoped from the hook's output to the
predicate, with the excluded surface named rather than left implied; AC-3.2's body obligation and
§5.3's "only when" half each gained a test whose negative fixture is the reason it exists; and the
two v12 Lows were taken as narrowings, not rewrites.

Four **Low** findings are open — L-01, L-03 and L-04 new, L-02 carried from v12. None blocks: no
test is missing and no test would be written wrong on any of them. L-01 and L-02 are one-register
disagreements whose normative counterpart is correct and whose repair is a word or a deletion; L-03
is a sentence of new rationale that over-claims a single producer for a state that has two, where
the behaviour is right and fails safe in both; L-04 asks AT-P7 to name `pending` as the channel its
comparison reads, which I can supply myself if it is not spelled.

Per `DEC-CONV-01`, this approval **stands** into subsequent rounds of Phase F. I will re-open it only
if a later diff touches a section this review's Scope named, or if I score something Medium-or-higher
against a later delta. Suggested disposition for the optimizer: if a revision is opened for any other
reason, take **L-03** first — a rationale sentence that states a falsehood about a failure mode is
the one of the four a later reader is most likely to build on — then L-01, then L-04's one-clause
addition. Carry L-02 as a tracked deferral. Do not open a revision solely for any of them.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 4}
