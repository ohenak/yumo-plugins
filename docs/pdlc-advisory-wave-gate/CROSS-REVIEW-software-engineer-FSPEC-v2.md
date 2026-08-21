# Cross-Review: software-engineer — FSPEC

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-advisory-wave-gate/FSPEC-pdlc-advisory-wave-gate.md` (v1.6)
**Date:** 2026-08-20
**Iteration:** 2

## Prior-Round Disposition

Delta re-review against `5a6e795c` (the commit my v1 was written at). Five FSPEC commits landed
since: `106ec502` (§4), `3d0fd378` (§5), `0d4215bd` (§6), `33634b3d` (§2/§3.2), `9f80247a` (E-34
placement). I read only those diffs plus the code each new claim asserts over.

| v1 finding | Severity | Status | Where resolved |
|---|---|---|---|
| F-01 — BR-2 drops AC-2.2's first-matching-class rule; AT-02-1's set oracle cannot falsify a reorder | High | **Resolved** | BR-2 now states the set is **ordered**, first match wins; E-08b is the two-class row (`plan-ordering-defect`, never both); AT-02-1 is ordered-sequence equality plus the two-way-match arm. All three asked-for edits landed. |
| F-02 — BR-9's map ranges over ignored paths, making restoration destructive and the oracle non-deterministic | High | **Resolved** | BR-9 pins **Domain** (tracked + **non-ignored** untracked; `node_modules/`, tool caches, `.env`, the untracked wave ledger outside the map in both directions) and **Observation point** (immediately after restoration, before BR-13's writes). AT-05-1 and AT-05-2 carry the same domain, and AT-05-2 rules the ignored-output fixture out explicitly. |
| F-03 — AT-03-7's *When* and *Then* state mutually exclusive oracles | Medium | **Resolved** | *When* now reads "compared by **ordered-sequence** equality against the eight-member literal BR-15 transcribes"; the clause a transcribing author copies is now the one the *Then* wants. |
| F-04 — pre-A6 comparands no longer exist and no clause says they are transcribed | Medium | **Resolved** | §6's preamble names exactly the four ATs I named (AT-01-3, AT-01-4, AT-04-1, AT-05-3), sources them to M-WG-3/M-WG-7 at baseline v1.2, and states why a re-derived comparand passes unconditionally. |
| F-05 — BR-12's "told" signal unspecified across re-invocation | Medium | **Resolved** | BR-12 declares the signal **durable**, cites M-WG-6's re-entry, and names the two surviving carriers; AT-04-5 gains the second companion arm that re-invokes and re-dispatches, so an in-run-only signal reds. |
| F-06 — §3.2 step 9's disposition vocabulary enumerated but never asserted | Low | **Resolved** | Step 9 now carries the pointer ("the vocabulary is the tier's… its closed assertion belongs to the tier's own suite… no AT here re-asserts the set"), the AT-06-1 division I asked for. |

**Verified against code, not accepted from the document.** Every literal the revision newly
transcribes is what ships:

- BR-5's exclusion order `X-a, X-e, X-d, X-b, X-c` is `ADVISORY_EXCLUSIONS` verbatim
  (`pdlc/workflows/orchestrate-dev.js:2459`), and it is indeed not alphabetical.
- BR-15's eight reasons, in the order written, are `ADVISORY_REFUSAL_REASONS`
  (`orchestrate-dev.js:2446-2453`).
- BR-2's four classes in the order written are `ADVISORY_ROOT_CAUSES` (`orchestrate-dev.js:1956-1961`).
- AT-03-2's two literals are the ones `classifyEnvelope` returns: `X-a` → `revert-on-test-touch`
  (`:2566`), `X-d` → `out-of-envelope` (`:2573-2577`).
- §2's before-base: `bb4d36fb` is PR #66's merge, `11420461` is PR #67's, and `c8aa22a4` does carry
  the five-member `ADVISORY_SEAMS` M-WG-8 measured (`git show c8aa22a4:pdlc/workflows/orchestrate-dev.js:1669`).
  Baseline §4 lines 69-72 say the same thing, so §2 restates its source correctly.
- BR-9's ignored-path examples: `.claude/pdlc-wave-state.json` — the wave ledger — is in
  `.gitignore`, as are `node_modules/` and `coverage/`. The advisory record is not, which is what
  makes the observation-point clause load-bearing rather than redundant.
- E-23's new clause matches M-WG-7: the halt path rewrites the queue row to `halted` and commits
  that one file pathspec-scoped.

AT-07-1's partition survives the BR-4 move: proposable `{BR-2, 3, 4, 5, 6, 7, 8}`, not proposable
`{BR-1, BR-9…BR-16}` — still disjoint and still total over BR-1…BR-16, and now consistent with the
*Given* clause that named E-5/E-6 (BR-4's content) first.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | BR-2/E-08b's first-match rule and AT-02-1's two-class arm presuppose that the *seam* derives the classification; §7.1 O-5 still leaves that open, and under the shipped agent-supplied design the arm degenerates to asserting the stub's own echo | §4 BR-2, §5.2 E-08b, §6.2 AT-02-1, §7.1 O-5 |
| F-02 | Medium | Local | E-34 states three positive observables and no AT asserts any of them, while its sibling restoration row E-28 has AT-05-5 | §5.4 E-34, §6.5 |
| F-03 | Low | Local | AT-05-1's *When* ("each terminates") and its *Then* ("taken immediately after restoration completes and before the record and escalation writes") name two different observation points — the same two-clause mismatch v1 F-03 flagged in AT-03-7 | §6.5 AT-05-1 |

### F-01 (Medium) — the ordering rule is only script-observable if the seam classifies

The F-01 fix landed as asked, and the rule it states is the right one. What the revision did not
settle is *who* applies it. BR-2 says "the first matching class wins, so a failure matching both #1
and #2 is classed `plan-ordering-defect`"; E-08b's *Given* is "the gate output matches two classes";
AT-02-1's second arm is "*Given instead* a gate output matching both class 1 and class 2. *When* it
is classified. *Then* the class reported is `plan-ordering-defect`", with *Who* = the workflows
suite. Matching a gate output against classes is a derivation step.

§7.1's O-5 routes to the TSPEC "whether the root-cause classification is derived by the seam or
supplied by the wave's own agents", and its "This FSPEC states" cell still reads "Only the
vocabulary and its totality (BR-2)" — no longer accurate now that BR-2 also states a precedence
rule. The shipped tier takes the second branch: `parseA6RootCause` scans the reply for a
`ROOT-CAUSE:` trailer, keeps the **last** one, and checks membership — it never inspects gate output
and never ranks two candidates (`pdlc/workflows/orchestrate-dev.js:2378-2391`). If the TSPEC keeps
that design, a workflows-suite test for AT-02-1's second arm can only hand a stub a reply saying
`plan-ordering-defect` and assert `plan-ordering-defect` came back — the expected value derived from
the fixture's own input, which is the echo shape §6 elsewhere refuses.

Note this does not make the arm wholly vacuous: "exactly one class is carried" is observable in the
record whoever classifies. It is the *first-match* half that needs a classifier to be falsifiable.

**To resolve** (one clause plus one cell): state in BR-2 or E-08b where the ordering is enforced —
either the seam derives and the arm is exercised at the derivation site, or the class is
agent-supplied and the observable A6 owns is the record's single-class shape while the ordering
binds the prompt (in which case say the arm is a prompt-contract test, not a workflows-suite one) —
and update §7.1's O-5 cell to record that BR-2 now constrains the choice rather than being neutral
to it.

### F-02 (Medium) — E-34's safe branch is stated but never asserted

E-34 is a good addition and the right default: capture failure means "no repair is proposed and none
is applied", the wave halts on its own red gate, the agents' uncommitted work is untouched. That is
three positive, checkable observables — zero dispatches, the pre-A6 halt reason, an unchanged tree —
and §6 carries no AT for any of them. Its sibling row E-28 is asserted by AT-05-5, which is exactly
the model: halt, name the cause, reach no commit.

The gap matters more than the usual unasserted-row case because E-34's claim is mostly negative
("nothing ever wrote to the tree"), and §6's own preamble is strict about absence-only oracles. The
positive companion is available and cheap: dispatch count `0` on that wave, and the same
tracked-plus-non-ignored map BR-9 defines, taken at termination, equal to the pre-invocation map.

**To resolve:** add one AT in §6.5 — *Given* a run whose pre-A6 capture fails, *Then* zero A6
dispatches occurred on that wave, the halt reason is AT-05-3's transcribed literal, the escalation
names the capture as the cause, and the tree map is unchanged — citing (E-34, BR-9, AC-5.1).

### F-03 (Low) — AT-05-1's two observation points

AT-05-1's *When* is "each terminates" and its *Then* pins the map "immediately after restoration
completes and before the record and escalation writes". Termination is strictly later: E-23 now says
the halt path appends the record and escalation entries and rewrites and commits the `halted` queue
row after that point. A fixture author transcribing the *When* observes at termination and sees the
map differ by exactly the bytes BR-13 mandates — the difference BR-9's observation-point clause
exists to exclude. The *Then* already says the right thing; the *When* should say "*When* restoration
completes" and let the terminal assertions that need termination stay where they are.

## Questions

| ID | Question |
|----|---------|
| Q-01 | BR-12 names "the branch's committed state and the advisory record entry" as the durable carriers. E-23 says a halt commits only the queue row, so after an E-6 resolution followed by a later wave's halt the record entry survives as an **uncommitted** working-tree file. Durable across the run, yes — but is it durable across a fresh clone or a different machine, and does AT-04-5's second companion need to pin which of the two carriers the re-dispatch actually reads? |
| Q-02 | BR-9's Domain clause puts the untracked wave ledger outside the map, and `.claude/pdlc-wave-state.json` is indeed `.gitignore`d. Is the ledger's *content* after a restored red re-gate something the operator should be able to trust — i.e. does an A6 attempt leave wave-state entries a later re-invocation reads as authoritative, even though restoration deliberately does not touch them? |
| Q-03 | §2's before-base clause says a green result for AT-01-1, AT-07-2 or AT-04-5's first companion at any later base "is a vacuum, not a pass". Is there anything in the suite that makes that base explicit to a future runner, or does the FSPEC intend the TSPEC to carry the base pin? A comment in the fixture is cheap; a silent vacuum three months from now is not. |

## Positive Observations

- **The revision is a targeted edit, exactly as the v1 recommendation asked.** Five commits, each
  scoped to one section, no restructuring, no altitude drift into TSPEC contracts. The document is
  the same document with six holes filled.
- **The F-02 fix went further than the finding did.** I asked for a non-ignored qualifier; BR-9 came
  back with a named **Domain** and a named **Observation point**, plus the "a file the repair created
  is absent afterwards, not merely reset" clause that closes a hole I had not raised — a per-path
  restore of a *created* file has no pre-A6 entry to compare against, and now that case is pinned.
  AT-05-2's "a fixture whose generated output is `.gitignore`d tests nothing here" is the kind of
  clause that stops a whole class of green-but-empty test.
- **BR-5 and BR-15 transcribing the shipped orders is the right shape.** The v1 problem with
  ordered-sequence assertions was that the oracle had no spec-side literal, so a test would compare
  the catalogue against itself. Both now carry the literal, and both say *why* they carry it. I
  checked both against `orchestrate-dev.js:2446-2453` and `:2459` — character-exact, including
  `X-a, X-e, X-d, X-b, X-c`'s deliberately non-alphabetical order, which is precisely the property a
  copied-from-source oracle would fail to protect.
- **§2's "where before is measured" paragraph is the strongest new prose in the revision.** Three ATs
  define themselves against a state HEAD no longer carries; naming the base commit and saying "a
  green result at any later base is a vacuum, not a pass" converts a silent future failure into a
  loud one. Every commit it cites resolves, and the five-member reading at `c8aa22a4` is real.
- **AT-07-1's BR-4 move is a genuine self-consistency repair, not bookkeeping.** The *Given* had
  named E-5's scope rule and E-6's two halves — BR-4's content — while the partition listed BR-4 as
  not proposable. The partition is now total and disjoint and agrees with its own *Given*.
- **§6's transcribed-literal preamble states the reason, not just the rule.** "A comparand
  re-derived from the code under test compares the pipeline against itself and passes
  unconditionally" is the sentence that makes the constraint survive a future author who does not
  know why it is there.

## Recommendation

## Verdict
