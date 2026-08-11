# Cross-Review: test-engineer — TSPEC

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-headless-engine/TSPEC-pdlc-headless-engine.md` (v1.6)
**Date:** 2026-08-11
**Iteration:** 8

**Scope:** delta re-review of v1.6 against v1.5, the revision I reviewed in round 7.
`git diff 68810c41..HEAD -- docs/pdlc-headless-engine/TSPEC-pdlc-headless-engine.md`
is +329/−? across nine sections: §3.3 (the scanner measurement and the no-bare-literal
guard), §4.1 and §7.0/§7.4/§8.3 (settlement-only), §4.3 (`RUNG_ORDER`, rung 4a),
§5.3 (escape scoping), §6.5 (the M-ENG-09 obligation split), §7.4 row 4 (injection
point), §7.5 (the two live tests), §7.6 (the CI matrix), §8.3 (two added rows) and
§9.3. Unchanged sections are not re-reviewed. Every claim below is grounded in HEAD
source on `feat-pdlc-headless-engine`, cited `file:line`.

## Prior findings disposition

All three v7 findings and both v7 questions are addressed, and each repair is
verified against HEAD rather than against the changelog's account of it.

| v7 finding | Disposition | Verification at HEAD |
|---|---|---|
| F-36 Medium — the "composed but never executed → `null` terminals" branch has no producer | **Resolved, in the direction upstream took.** The branch and all four restatements are deleted; the replacement rule is "every recorded line is a settlement line", and it is grounded in the seam rather than asserted. The accumulator hangs off `_agent` (`lib/adapter.mjs:271`) and `composePrompt` is a separate entry point (`:259`, exported `:373`) that nothing accumulates from; `emitDryRun` calls `adapter.composePrompt(skill, …)` directly (`bin/pdlc.mjs:190`) on an adapter built with `inertTransport()` (`:173`), so the dry-run surface writes nothing. Every citation checks out | `adapter.mjs:259`, `:271`, `:373`; `bin/pdlc.mjs:173`, `:190` |
| F-37 Medium — row 4's `transport-contract-violation` vs §5.3's engine-fatal rule | **Resolved, and stated on both sides as asked.** §5.3 gains the escape-scoping paragraph and §7.4 row 4 gains the matching bullet. The reconciliation is the one I re-derived in v6 and v7: `resolveAdvisoryRung` handles its own rejection at `:1856` and re-dispatches at `:1861`, and the non-model-resolution case becomes a `{kind: "dispatch-error"}` value the caller consumes at `:3143`, never rethrown, so nothing reaches `runDev`/`runQueue`'s top-level catch | `orchestrate-dev.js:1856`, `:1861`, `:3143`; `run.mjs:187`, `:228` |
| F-38 Low — run iv's fixture is not tied to the class `classifyThrown` yields | **Resolved, and more completely than the finding asked.** The row now names the injection point (`queryFn`, §7.1's `createTransport({queryFn})` rule, real adapter) *and* both obligations the injected rejection must satisfy at once. I checked the conjunction is actually satisfiable: a plain `Error("unknown model \"fable\"")` is not `timedOut`, is not rate-limit-shaped (`looksLikeRateLimit`, `transport.mjs:91-96`), so it falls to the unrecognised arm → `TransportError` (`:123`), and the same message matches `MODEL_ERROR_RE` (`:1780-1781`) so `isModelResolutionError` (`:1791-1792`) takes the fallback arm. The counter-examples given (`TimeoutError`, a `TransportError` reading `boom`) each fail exactly one obligation, as stated | `transport.mjs:91-96`, `:123`; `orchestrate-dev.js:1780-1781`, `:1791-1792` |
| Q-16 (`corpusRun != null`: essential or defensive?) | **Answered, and the answer is load-bearing rather than reassuring** — `_bootstrap.mjs` is `--import`ed into every test-file process, so direct-adapter unit tests do write into `${PDLC_TEST_RUN_DIR}` and dropping the filter turns the row red on correct code. §7.5's new paragraph extends the same answer to the two live tests (`corpusRun === null`) instead of denying they write records |
| Q-17 (the dry-run surface's complete oracle set) | **Answered as a closed set** — §5.4's exit-`0` row and §7.1's prompt-composition assertions, "that is the whole set", with the reason no §7.4 row can hang off it |

F-39's five stale `FSPEC:{line}` citations are re-anchored and I re-checked each
against FSPEC v1.6, not v1.5: `FSPEC:215-217` (no transport selector — the sentence
begins at `:215`), `FSPEC:680-684` (BR-MODEL-3), `FSPEC:737` (`agent-reported-failure`'s
meaning), `FSPEC:1203-1213` (§12.2's nine rows), `FSPEC:210` (`--dry-run-skill`), plus
`REQ:522` and the two §9.3 anchors `FSPEC:562-564` and `REQ:502-506`. All seven land on
the text they claim.

## Findings

Two High, both in material this revision introduced. Neither is a regression of a
section I approved: F-40 is the replacement guard §3.3 substituted for the allow-list
test, and F-41 is the new rung 4a arriving in the data model without a test.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-40 | **High** | Local | **The no-bare-literal guard's "skill-identifier shape" predicate is unstated, and the two predicates a harness author would reach for are red-at-HEAD and tautological respectively — so the guard is either unwritable or unfalsifiable.** The rule quoted in §3.3 (and verbatim in DEC-ENG-05) selects literals "that match a skill-identifier shape" and asserts each is a union member. Everything turns on the selector, and the document defines it nowhere. (a) *Shape as syntax.* The obvious reading — lowercase words joined by hyphens — selects **54 distinct literals in `orchestrate-dev.js` and 24 in `orchestrate-queue.js`** at HEAD (`grep -oE '"[a-z]+(-[a-z]+)+"'`), among them `"command-failed"`, `"dispatch-error"`, `"rev-parse"`, `"cross-review"`, `"out-of-envelope"`, `"awaiting-merge"`. Containment fails on all of them: the test is red on correct code and the only repair is loosening the predicate, which is the exact pressure §3.3 exists to remove. The document's own counter-example makes this concrete and inverts against it: it says the reviewer-role map's *values* `"software-engineer"` (`orchestrate-dev.js:6229`), `"product-manager"` (`:6230`), `"test-engineer"` (`:6231`) "do not match the shape" — but they are syntactically indistinguishable from `"se-review"`, `"pm-author"`, `"te-review"`, which sit as the *keys* on the same three lines. No syntactic predicate separates a key from its value here. (b) *Shape as membership.* Narrow the predicate to "equals a member of `DISPATCHABLE_SKILLS`" and containment becomes `x ∈ S for all x ∈ S` — a test that cannot fail, for any source, ever, including the drift it is written to catch: a new dispatch site naming a **non-exported** identifier is not selected, so it is not checked. That is a vacuous oracle in the strict sense. (c) A third reading — "equals a shipped skill directory name" — is also red at HEAD: `"orchestrate-queue"` (`orchestrate-queue.js:45`) and `"orchestrate-dev"` (`orchestrate-dev.js:3316`) are `name:` fields naming directories under `pdlc/skills/`, and neither is in the derived 10. So no exhibited predicate is simultaneously green-at-HEAD and falsifiable, and §3.3's "green at HEAD by measurement" is asserted without the measurement (the measurement given is of the ten identifiers' occurrences, which is a different claim). **What would resolve it:** drop the shape predicate and scope the guard by **site**, which the rule already half does — literal in first-argument position of a dispatch call, `PHASE_DISPATCH` role field, `skill:` field, module-local `SKILL_*`/`ADVISORY_RUNG_SKILL` constant. Sites are structurally enumerable, all eleven carry union members at HEAD (§3.3's own measurement, which I re-verified line by line), and the guard then fails exactly on the drift case. Add one conjunct with it: **assert the extracted site count (11 at HEAD, as an assertion on a derived cardinality, not a transcription of names)** — containment over an extracted set is vacuously green whenever extraction returns ∅, so an extractor that silently stops matching (a call-form change, a prettier reflow of the two multi-line forms §3.3 already flags) turns the guard green rather than red | §3.3 (the guard block; mirrored in DEC-ENG-05, which must move with it) |
| F-41 | **High** | Local | **Rung 4a arrives in the data model with no test, no fixture seam, and no traceability row — the one new fail-closed refusal in this revision is the one nothing proves.** §4.3 correctly types `RUNG_ORDER` as seven string labels and asserts set-equality of a run's emitted rung ids against it (good — that catches an *unrecorded* rung). But rung 4a's behaviour is a two-branch execution routing, fixed upstream: refuse when no candidate runs, naming each candidate and its outcome plus the remedy, exit `1`, nothing dispatched (EC-START-10); and **pass** when a later candidate runs while an earlier one is present-but-not-runnable (EC-START-11), because "presence is not executability" — FSPEC `:299`, `:406-407`, BR-GUARD-6 `:911-923`, AT-ENG-11a `:967`. Neither branch has an oracle here: `grep -n -i "interpreter\|candidate"` over the TSPEC finds rung 4a's prose in §4.3 and nothing in §7 at all. §6.4 is not its home — that section is EC-GUARD-4, a transport-capability probe, and still says the check "belongs to the ladder's rung 5 neighbourhood", written before 4a existed; a reader following §8.3's `lib/startup.mjs` row (which points at §4.3, §6.4) lands there and finds a different check. The gap is not just a missing test row: **the fixture seam does not exist in this design.** FSPEC fixes observation as "by **running** a candidate", so an EC-START-11 test must present a `python3` that is on `PATH` and fails to execute while `python` succeeds. §7.0/§7.1's bootstrap traps sockets and records `fs`; no process-spawn or `PATH` seam is specified for startup, and `_runCommand` is a module seam, not a startup one. A harness author cannot write either test without inventing that seam — which is the "ask a clarifying question before you can write one test" case, on a rung whose whole purpose is to gate unattended use. Finally §8.2's constraint table stops at C-10 (`| C-10 plugin version handshake | §4.3 rung 3 |`) with **no C-11 row**, and §8.1 has no AC/AT row reaching AT-ENG-11a, so the omission is invisible to the traceability check that would otherwise catch it. **What would resolve it:** a §7 paragraph naming the probe seam (an injectable `runProbe`/candidate-runner on the startup module, consistent with §3.x's seam inventory), two hermetic tests — no-candidate-runs → refusal text contains each candidate and its outcome and the remedy, exit `1`, **and zero dispatch descriptors recorded** (the positive conjunct that makes "nothing dispatched" falsifiable via §7.0's accumulator rather than an absence assertion); present-but-not-runnable-then-runnable → rung 4a `state === "pass"` — plus the C-11 row in §8.2 | §4.3 (`:892-899`), §6.4, §7 (absent), §8.1/§8.2, §8.3's `lib/startup.mjs` row |
| F-42 | Medium | Local | **The derivation test recomputes the expected value from the same imported data the production derivation reads, so nothing pins the set to a spec transcription — and §7.4 makes the opposite choice two sections later without reconciling them.** §3.3's first test asserts `DISPATCHABLE_SKILLS` ≡ "the union recomputed in the test from `PHASE_DISPATCH` + the named constants, read as imported data", and the document is honest that this is "impossible by construction … a regression guard on the derivation itself". That honesty is the problem once F-40 lands: if the second test is repaired as containment-by-site, then **no oracle in the document fails when a `PHASE_DISPATCH` role field is deleted** — the export shrinks, the test's recomputation shrinks with it, both stay equal, and rung 4's set-equality against readable prompt files also stays green because the deleted identifier's file is simply no longer expected. Meanwhile §7.4 pins M-ENG-07 as "a **transcription** of the modules' constants, never an import from them — importing it would make the drift AC-3.3 exists to catch invisible", which is the same argument applied to a different constant with the opposite conclusion. The asymmetry may be defensible (BR-START-4 forbids a hand-maintained *production-side* declaration; a test-side transcription is not that, which is exactly why §7.4 is allowed one) — but it is currently unstated, and §3.3 explicitly declines the transcription: "At HEAD the derived union is 10 identifiers — an observation, never the assertion". Either add the transcription conjunct (the 10 names, test-side, as §7.4 does) or state in one clause why the model map earns a transcription and the skill set does not | §3.3 (derivation row), §7.4 (M-ENG-07 preamble) |
| F-43 | Low | Local | **§5.3's new paragraph cites the caller's consumption site as the return site.** It reads "the non-model-resolution case is returned to the caller as a `{ kind: "dispatch-error" }` value (`orchestrate-dev.js:3143`), never rethrown". `:3143` is `if (raced.kind === "dispatch-error") {` — where the caller *reads* the value; the two sites that *construct and return* it are `:1847` and `:1857`. §7.4 row 4's parallel bullet gets this right ("the caller consumes as a loop continue (`:3143-3149`)"). One citation swap keeps the two passages saying the same thing | §5.3 (`:1259-1265`), §7.4 row 4 |

## Questions

| ID | Question |
|----|---------|
| Q-18 | §7.5 now says the two live tests inherit `_bootstrap.mjs`'s writer and are excluded from the suite-wide row by carrying `corpusRun === null`. Is that exclusion **asserted** anywhere, or only supplied? The design sentence is "the harness supplies `corpusRun` only for the five corpus configurations" — a construction fact. If a later live test is added by copying a corpus run's helper, it inherits a non-null `corpusRun` and lands inside rows 1–4 with a real model's `errorText`. One conjunct in `_assert-suite-wide.mjs` — every record with `corpusRun != null` names one of the five configurations, set-equality against that five-member set — would make the scoping falsifiable rather than conventional, and it is the same shape as the four properties already there. |
| Q-19 | §6.5's obligation table is now satisfiable, and I agree with the split. One thing it leaves implicit: what does the M-ENG-09 gate assert *about* the row it demands — presence keyed on `process.platform`, or presence plus a specific measured value? "Unrecorded is red" is stated; "recorded as *guard did not fire*" is the outcome that would make every well-formedness test in §6 vacuous, and the document says exactly that in its own words two paragraphs above. Whether the gate is allowed to be green on a row recording a **negative** measurement is the question a harness author has to answer, and it is a one-clause answer either way. |

## Positive Observations

- **The F-36 repair chose the harder direction and grounded it in a seam, which is why I could
  falsify it cheaply.** The v1.5 clause could have been deleted with a one-line "no producer" note.
  Instead §4.1 now says *why* there is no producer — the accumulator hangs off `_agent`
  (`adapter.mjs:271`) and `composePrompt` is a separate exported entry point (`:259`, `:373`) — and
  then names the two things that follow from it (`emitDryRun` writes nothing at `bin/pdlc.mjs:190`;
  had `_agent` been called, `inertTransport().dispatch()` throws and *that* settles as an error, so
  still not a `null` line). Every one of those five citations lands. A reader can check the claim
  without trusting the document, which is the property this whole review contract is about.
- **§7.4 row 4's injection bullet is the best-specified fixture in the document.** It names where to
  inject (`queryFn`), what to inject (a message like `unknown model "fable"`), and — the part most
  specs omit — *why both obligations are load-bearing*, with a failing counter-example for each
  (`TimeoutError` fails the classification, `TransportError("boom")` fails `MODEL_ERROR_RE` and
  leaves no `B` to pair). I traced the conjunction through `classifyThrown` (`transport.mjs:91-96`,
  `:123`) and `isModelResolutionError` (`orchestrate-dev.js:1791-1792`) and it holds. This is a
  fixture an implementer can write on the first attempt.
- **§8.3's `.claude/pdlc.config.json` row is a finding the author raised against their own plan, and
  it is correct.** `implementation.testCommand` at HEAD is `cd pdlc/workflows && npm test …`
  (`.claude/pdlc.config.json:3`) and nothing else, so Phase I's script-owned wave gate would run the
  workflows suite and never `pdlc/engine`'s — every wave of this feature green without one engine
  test executing, first execution deferred to `engine-tests` at Phase PUB. That is a green-and-proves-
  nothing gate found by reading the gate rather than the code, and it is exactly the class of defect
  the review checklist asks reviewers to look for. Naming the owning task ("the task that first adds
  an engine test") makes it dischargeable rather than an observation.
- **§7.6's matrix correction is a small, honest reversal.** v1.5 asserted a two-platform matrix
  "same as `unit-tests`"; HEAD is `os: [ubuntu-latest]` (`pr-tests.yml:40`, narrowed in `410f3a07`),
  and the surrounding comment still describes the two-platform intent — a stale comment that would
  have propagated straight into the new job. v1.6 states the value, flags the comment as stale, and
  then does the harder thing: it stops claiming per-platform coverage from CI and moves the
  obligation onto `process.platform` keying, which is where the measurement actually lives.
- **§9.3 converted from an open erratum list to a resolution record with the resolving upstream text
  cited.** Both errata now carry the FSPEC/REQ line that closed them (`FSPEC:562-564`,
  `REQ:502-506`), both of which I verified. A later reader can see the round each closed in instead
  of re-raising it — this is the append-only discipline applied to the erratum channel itself.

## Recommendation

**Needs revision**

The convergence question this round is whether the v7 findings were resolved and whether the
revision broke anything. The first half is unambiguously yes: F-36, F-37, F-38 and F-39 are all
discharged, each in the direction the finding argued for, and I re-verified every repair against
HEAD rather than against the changelog. Q-16 and Q-17 are answered in the design where a later
reader will find them. If the document had stopped there I would have approved it.

It did not stop there, and both High findings are in the new material — which is the honest reading
of "did the revision break anything", not a widening of scope. **F-40** is the more serious: §3.3
replaced a test it correctly showed to be unwritable (the allow-list absence test, red at HEAD by
its own eleven-site measurement) with one whose selector is undefined, and every way of defining it
that I could measure lands in one of two failure modes — red at HEAD on ~78 unrelated hyphenated
literals, or a tautology that cannot fail on any input. The document's own counter-example is the
proof: it asserts that `"software-engineer"` does not match the shape while `"se-review"` does,
and those two strings sit on the same line (`orchestrate-dev.js:6229`) as a key and its value. A
guard that cannot fail is worse than the allow-list it replaced, because the allow-list at least
failed loudly. The repair is available and small — scope by site rather than by shape, and assert
the extracted site cardinality so an extractor that matches nothing cannot pass.

**F-41** is the one I expect to be least welcome, because rung 4a arrived from upstream mid-round
and §4.3 handled the part it was asked to handle — the typing — well. `RUNG_ORDER` as string
labels with a set-equality assertion is the right shape, and the reasoning about why renumbering is
forbidden is correct. But a rung is a refusal, and this refusal has two branches fixed upstream
(EC-START-10 and EC-START-11, AT-ENG-11a), no oracle in §7, no probe seam anywhere in the seam
inventory, and no C-11 row in §8.2 to make the omission visible. The EC-START-11 branch is the one
that worries me: "presence is not executability" is precisely the distinction that goes untested by
default, and a design that cannot express a present-but-not-runnable interpreter in a fixture will
ship a rung 4a that passes on every developer machine and proves nothing about the hosts it exists
to refuse. Note also that the "nothing dispatched" half needs a positive conjunct — zero records in
§7.0's accumulator — rather than an absence assertion, which the document is well equipped to give
it since the accumulator is already there.

F-42 and F-43 are not gating. F-42 is a genuine tension rather than an error, and it may resolve
into one sentence explaining the asymmetry with §7.4. F-43 is a citation swap.

On the review contract's three oracle clauses, applied to the changed sections only: **no
implementation echoes** — §7.4's transcription discipline is intact and strengthened (M-ENG-07 is
still explicitly a transcription; row 4's `errorText` conjunct is a transcription of the fixture
string, never an import of `MODEL_ERROR_RE`), but §3.3's derivation test *is* an echo by
construction and F-42 records it. **No absence-only oracles** — the settlement-only rewrite removed
a `null`-terminal case that rows had to exclude, which strictly improves this; the one new absence
shape is rung 4a's "nothing dispatched", flagged inside F-41 with the positive conjunct that fixes
it. **Completeness is set-equality** — §4.3's rung-id set-equality against `RUNG_ORDER` is new and
correct, §7.5's live-test exclusion is supplied rather than asserted (Q-18), and §3.3's second
guard is containment by an explicit same-phase decision (DEC-ENG-05) whose reasoning I accept —
containment is the right *direction* there — but whose predicate is the F-40 defect.

No erratum is raised. I re-grounded every upstream citation this revision touched, including the
seven re-anchored ones and FSPEC v1.6's rung-4a material (`FSPEC:299`, `:406-407`, `:911-923`,
`:967`, `:1376`, `:1493`), and found no defect in REQ, FSPEC, DECISIONS, PLAN or PROPERTIES. F-41
is a TSPEC-side gap in covering upstream that is itself correct and complete.

## Verdict

VERDICT: Needs revision
{"high": 2, "medium": 1, "low": 1}
