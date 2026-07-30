# Cross-Review: software-engineer — PROPERTIES

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-review-loop-hardening/PROPERTIES-pdlc-review-loop-hardening.md` v1.2
**Date:** 2026-07-30
**Iteration:** 3
**Scope:** `Local` — delta re-review of PROPERTIES v1.1 (`95529be`) → v1.2 (`d6b524d..b6773e7`),
technical lens only: is each property **implementable as stated** against the tree, and is it
**falsifiable on a wrong implementation and green on a correct one**. Upstream REQ v1.6 / FSPEC v1.8 /
TSPEC v1.7 / PLAN v1.4 are approved, closed, and not reopened (R-5). Citation and `file:line` drift is
corrected silently and filed at no severity (R-6). Cost, the TSPEC §8.1/§8.2 upward report, and every
round-1 finding remain settled.

**Note on the stated range.** The task named `d6b524d..b6773e7`. `d6b524d` is itself the §1.3 commit
that fixes SE F-20 / PM F-04, so that range *excludes* the F-20 repair. The real v1.1→v1.2 range is
`95529be..b6773e7` (ten commits). F-20 was verified by reading §1.3 at HEAD directly, not from the
diff.

---

## Verification basis (DC-02) — derived, not confirmed

Every number below was re-derived from the source before being compared to the document's claim.

| Quantity | Derived at HEAD | Document's claim |
|---|---|---|
| `reviewLoop` parameter list | `orchestrate-dev.js:532–542`; injects exactly `_agent`, `_parallel`, `_checkFile` | `:531–543`, same three — **substance right**, span off by one each side (R-6) |
| `recordPhase` declaration | `:1574`, inside `main()` | `:1574` ✓ |
| `recordPhase` consumer | passed to `checkConverged`, declared `:496`, called `:1659/:1685/:1711/:1752/:1781/:1807/:1923` | `checkConverged` at `:496` ✓; never a `reviewLoop` seam ✓ |
| Site-4 prompt construction | `:565–570`; the `Iterations (5 — limit reached)` string is `:567` | `:567` ✓ |
| Site-4 dispatch | **`:574`** — `const postmortemResult = await _agent(optimizer, postmortemPrompt);` | `:570` (that line is `].join(" ");`) — **surface `_agent` correct**, line wrong (R-6) |
| Non-converged return | `:598` — `return { converged: false, iterations: 5, lastResults };` | `:598` ✓ |
| Converged return | `:648` — `return { converged: true, iterations: iteration, lastOptimizerResult };` | `:648` ✓ |
| `BYTES_FLOOR` | `driftGenerators.js:423` — `const BYTES_FLOOR = 64;` | `:423` ✓ |
| `"bytes"` shrink arm | `:454–458`; `[]` at ≤64, one `slice(0, BYTES_FLOOR)` above | `:453–457` (R-6); behaviour ✓ |
| `__tests__/helpers/` | 13 entries = **12 `.js` modules + `bin/` directory** | "thirteen entries: twelve `.js` modules plus a `bin/` directory" ✓ |
| `__tests__/fixtures/` | 2 entries (`covered-violations/`, `tmpGitFixture.js`) | two ✓ |
| `HASH_FAILURES` | TSPEC `:853` — `["absent", "duplicated", "unparseable"]` | ✓ |
| TSPEC §6.2 row 6 | `APPROVAL-HASH:` absent / duplicated / unparseable → `UNEVALUABLE`; phase runs | ✓ |
| TSPEC §6.2 row 7 | *reviewed document unreadable at comparison time* → `_readFile` → `null` → `UNEVALUABLE` | ✓ — and distinct from `LIST_FAILURES`' `unreadable` (TSPEC `:850`, → halt), which `PROP-LIST-01a` owns |
| PLAN §9.2 item 3(c) | quoted verbatim below | reproduced in §4.4 — see F-12 |
| Queue row Order 9 | `docs/_queue/QUEUE.md`: `9 \| blocked \| pdlc-authoring-contract \| … \| pdlc-review-loop-hardening` | ✓ (§8.4 residual 6's DC-08 successor is real) |

**Suite baseline, re-run on this machine.** `cd pdlc/workflows && npm test` →
**1038 passed / 1 failed / 70 skipped, 1109 total, 36 suites, 382.082 s.** The single red is the
foreign intentional `documentOracles.test.js › coveredViolations (§10, §10.1) › AT-22
[red-until-L-06]`, failing at `:246` (the `expect`; `:245` is the `test(` line). The baseline
reproduces exactly. Wall time is this machine's under a parallel review load and is **not** comparable
to round 2's 335.918 s or pm-review's 312.478 s.

---

## Per-id disposition of round-2 findings

| ID | Sev (v2) | Disposition | Evidence I derived |
|----|----------|-------------|--------------------|
| **F-12** | **High** | **Resolved** | PLAN §9.2 item 3(c) raw text, extracted from `PLAN-…md`: *"…**backwards**, [the] nearest non-whitespace token before [the] call is `=>` or `return`; **and forwards**, [the] first non-whitespace token after [the] call's matching `)` — found [by] walking [the] same bracket-depth stack forward [to] depth zero — [is] `;`, `,`, `)`, `}` [or] end [of] line. Both halves must hold. [A] backward-only test [would] exempt `() => _agent(a) && other` [and] `return _checkFile(p) \|\| fallback;` … If [the] forward walk cannot reach [a matching `)` at depth zero, the site is unclassified]."* §4.4's rebuilt cell reproduces **both halves, the depth-zero forward walk, the five terminator tokens, the both-must-hold conjunction, and the `unclassified` fallback** — token for token, with §9.2 item 3(c) cited as owner. The semantic "awaited by the caller" phrasing is gone and explicitly withdrawn in the paragraph below the table. **Dependant 1** — §4.4's ≥10 backward-only floor is now generable: I checked `() => _agent(a) && other` against the corrected rule (backward token `=>` ✓; forward token after `)` is `&&`, not in `{; , ) } EOL}` ✗) ⇒ `unclassified`, and `_agent`/`_checkFile` are both scan-set names. **Dependant 2** — §5.3's `PROP-AWAIT-01` (4th) now cites §9.2 item 3(c) and names that same shape rather than restating the halves |
| **F-13** | Medium | **Resolved** | Re-derived, not confirmed. `reviewLoop`'s destructured parameter list at `:532–542` contains `doc, phase, reviewers, optimizer, feature, iteration, _agent, _parallel, _checkFile` — no `recordPhase`. `recordPhase` is declared `:1574` inside `main()` and every one of its seven consumers is a `checkConverged` call or a direct `recordPhase(...)` in `main()`. Site 4's prompt is assembled `:565–570` and dispatched **`:574`** as `await _agent(optimizer, postmortemPrompt)`. §4.3 and §6.5 both now name **`_agent`'s recorded prompt** for site 4 and **`reviewLoop`'s return value** for site 5, with the measurement stated and v1.1's claim withdrawn. The dispatch line number is `:570` in the document rather than `:574` — R-6, corrected here, not filed |
| **F-14** | Medium | **Resolved** | Both cited sites verified above. Re-derived the arithmetic independently: `reviewLoop`'s cap check is at loop top (`:562`, `iteration > 5`), so an exhausting run performs 5 optimizer dispatches (`:653`) before `:598` returns `iterations: 5` ⇒ episodes = `1 + 5 = 1 + I`. A run converging at round *k* returns `iterations: k` at `:648` with only `k − 1` revisions ⇒ episodes = `I`, not `1 + I`. So the equality is true **iff** the segment exhausts, which is exactly precondition (b) as written, and the inequality `≤ (1+I)×B` remains true on the converging case (`I·B ≤ (1+I)·B`). **`I` read per segment** is stated in conjunct (i) itself. **Floor still satisfiable:** exhaustion ⇒ 6 episodes per segment, each needing >`B`=6 attempted dispatches; the generator's per-episode ceiling is 8 and sequence length runs to 12, so a 6-episode segment at 7–8 attempts each is inside the domain |
| **F-15** | Medium | **Resolved** | The cardinality assertion is genuinely falsifiable, and by more than the one mutation §5.3 names. It forbids three distinct wrong answers on a doubly-exempt site: an array/set of both (§5.3's (5th) row), `unclassified` (the failure this row's *no permitted red, ever* window makes expensive — a classifier that evaluates both rulings, sees a conflict and fails loudly), and any outcome outside `{returned-promise, awaited-combinator-argument}` (e.g. `awaited`). It is weak in exactly one direction — a classifier that always answers `returned-promise` passes — and that weakness is the honest consequence of the missing precedence, which is reported upward rather than invented. **No leak into the round-trip:** §4.4's Generator says *"Each fragment **except** the both-rulings-applicable shape is generated together with its expected classification"* and *"the round-trip … holds over the labelled fragments only"*; the four-outcome set-equality floor is stated over *expected* outcomes, which the unlabelled fragments do not have, so they cannot be double-counted into it. I also checked the reachability of the other floors under the exclusion: labelled `awaited-combinator-argument` fragments remain generable (`await Promise.all([_agent(a), _agent(b)])` — backward token `[` or `,`, so ruling 2 never fires), so the ≥10-per-outcome floor does not depend on the excluded shape. And the shape itself is real: at `_agent(a)` inside `await Promise.all([() => _agent(a), x])` the backward token is `=>`, the forward token after the matching `)` is `,`, and the innermost unclosed delimiter is `[` — all three predicates fire |
| **F-16** | Low | **Resolved** | Stated in all three places: §4.3 conjunct (i) (*"**`B` does not**… measures its own wrong cap and satisfies the equality"*), §8.4 residual 5 (extended with the uniformly-wrong-cap case, distinguished from the pre-existing degenerate `B = ceiling` case), §8.5 item 4. The §8.5 item count is updated to five and the arithmetic checks (1 at v1.0 + 2 at v1.1 + 2 now) |
| **F-17** | Low | **Resolved** | §4.3's Generator paragraph now reads *"vary the **four externally controllable** `EpisodeKey` coordinates independently — `artifactSet`, `phase`, `round`, `mode`"* and names the withdrawal. No occurrence of "all five" survives in §4.3; the only remaining "five" is `EpisodeKey`'s field count, which is correct |
| **F-18** | Low | **Resolved to the measurement** | `/bin/ls -1 __tests__/helpers` → `bin`, `driftCapabilities.js`, `driftFixtures.js`, `driftGenerators.js`, `driftHarness.js`, `driftOrdering.js`, `driftProbe.js`, `freshClone.js`, `guardFixtures.js`, `guardRowIds.js`, `skipSink.js`, `skipSinkSetup.js`, `skipSinkTeardown.js` = **12 `.js` + 1 directory**. §6.1 states exactly that, names both prior errors, and notes the load-bearing `testPathIgnorePatterns` claim is unaffected |
| **F-19** | Low | **Resolved by citation, no precision lost** | §4.1's owning floor reads *"≥15 cases must contain a code point above U+FFFF and **≥5** must contain a lone surrogate"*. §5.2's (3rd) row now reads *"dies on the lone-surrogate cases §4.1's `PROP-DIGEST-02` **Non-vacuity** floor forces"* and names the v1.1 contradiction. A test author following that row lands on a single ≥5 floor; nothing is under-specified |
| **F-20** | Low | **Resolved by deletion, no precision lost** | The offending sentence is gone from §1.3. Its replacement states the row explicitly as a five-column table — `\| PROP-TRAILER-01 \| __tests__/pacingWrapper.test.js \| RLH-21 (batch 3) \| batch 3 \| none \|` — names **RLH-21** as the adopting task, and restates what stays closed as the PLAN's *content* rather than its row count. §7.1's `Row` cell now cross-references it (*"a genuinely new §7.3 entry, five cells stated in §1.3"*). Both statements agree, and the surviving text is more specific than the deleted one |

**Nine of nine resolved. None reopened.** The four inferred-surface errors of round 2 (`recordPhase`,
the missing exhaustion precondition, the semantic forward half, the label round-trip) were each fixed
at the surface the reviewer named, against the tree, with the prior claim explicitly withdrawn rather
than overwritten.

### pm-review round-2 fixes that touch engineering substance

| PM ID | Disposition | Evidence |
|---|---|---|
| **F-02** | **Resolved** | The withdrawn conjunct is gone. §4.2's `PROP-HASH-01` now states *"a document carrying **two** `APPROVAL-HASH:` lines outside fenced regions returns `{ ok: false, reason: "duplicated" }`"*, which matches TSPEC `:853`'s `HASH_FAILURES` and §6.2 row 6, and matches TSPEC §4.3's sibling definition of `duplicated` for `REVISION-COMPLETE:` (*"more than one such line outside fenced regions"*). The empty `§6.4 owns which` delegation is gone. The ≥5 floor survives **on the rejection shape**, which is the stronger of the two options PM Q-02 offered — it forces the named `reason`, which the hex-shape totality conjunct cannot reach. One residue is filed new as **F-21** |
| **F-03** | **Resolved; the residual is real, not a relabelled dodge** | I checked the deferral rather than the label. §4.2's owner table routes `unparseable`→`PROP-STALE-01`(i), `duplicated`/`absent`→`PROP-HASH-01` (both with ≥5 floors and matching generator draws — these are genuinely *owned*, not renamed), and `unreadable document`→**nobody**. That last class is TSPEC §6.2 **row 7** (`_readFile` → `null` → `UNEVALUABLE`, phase runs), which is a different failure from `LIST_FAILURES`' `unreadable` at TSPEC `:850` (`_listFiles` → halt) that `PROP-LIST-01a` already owns — so it is not covered elsewhere under another name, and §8.4 residual 6 says so. DC-08's named successor surface exists on disk: `docs/_queue/QUEUE.md` row **Order 9, `pdlc-authoring-contract`**, `blocked` on this very feature. Two of three classes acquired an owner and only the genuine IO-seam gap was deferred; that is the honest split, not the convenient one |

---

## New findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-21 | **Medium** | Local | `PROP-HASH-01` acquired three new conjuncts and two new forced floors in v1.2, and **§5.2's falsifiability ledger gained no row for any of them**. Both existing rows survive the obvious mutation, so §5.1's own rule — and DC-03 — is unmet for the conjunct §7.2 now advertises as the property's distinctive coverage | §4.2, §5.2, §7.2 |
| F-22 | Low | Local | §4.3's oracle paragraph still identifies `I` with *TSPEC §7.1 edit 5, "the one site that reports the constant"*. Conjunct (i)'s inequality now also reads `I` from `:648`, which is not an edit site and does not report the constant | §4.3 |
| F-23 | Low | Local | `PROP-HASH-01`'s leading `iff` and its `duplicated` conjunct give opposite verdicts on a document carrying one permitted-position trailer **and** one `>`-quoted `APPROVAL-HASH:` line. Whether the generator can draw that document is not decidable from §4.2's Generator sentence | §4.2 |
| F-24 | Low | Local | §4.4 and §8.5 item 5 put *"whichever, if any, applies"* in quotation marks as PLAN §9.2 item 3(c)'s words. §9.2 item 3(c) reads *"decide which §8.5 ruling, if any, applies"*. Not R-6 drift — the section reference is correct; the quoted words are not the artifact's | §4.4, §8.5 |

---

### F-21 (Medium) — the new `PROP-HASH-01` conjuncts have no falsifier

§5.1 states the rule this document holds itself to:

> every property in §4 is paired below with a **named mutation to a named source file** that turns it
> red, and with the conjunct that dies. A property whose row cannot be filled is deleted, not weakened.

v1.2's `PROP-HASH-01` (§4.2) adds three conjuncts and two forced floors:

1. *"a document carrying **two** `APPROVAL-HASH:` lines outside fenced regions returns
   `{ ok: false, reason: "duplicated" }` — never a hash, and never one of the two arbitrarily chosen"*
   — floor **≥5 double-trailer**;
2. *"a document carrying **no** `APPROVAL-HASH:` line outside a fenced region returns
   `{ ok: false, reason: "absent" }`"* — floor **≥5 no-trailer**;
3. *"Every `ok: false` return carries a `reason` that is a member of `HASH_FAILURES` (TSPEC §4.1),
   asserted by membership, so a subject inventing a fourth reason string dies."*

§5.2 carries exactly the two `PROP-HASH-01` rows it carried at v1.1:

| Row | Named mutation | Conjunct that dies |
|---|---|---|
| `PROP-HASH-01` | accept 63-or-more hex (`{63,}` instead of `{64}`) | the `/^[0-9a-f]{64}$/` return-shape conjunct |
| `PROP-HASH-01` (2nd) | scan the whole document instead of the permitted positions | the "never mid-document" conjunct |

I checked both against the three new conjuncts. A subject that returns
`{ ok: false, reason: "unparseable" }` for a duplicated document, or returns the **first** of two
trailers as `{ ok: true, hash }`, or omits `reason` entirely on the no-trailer path, passes row 1
(no non-64-hex hash is ever returned on those inputs) and passes row 2 (it is not scanning
mid-document). **The three conjuncts that PM F-02 and PM F-03 added to this property have no named
falsifier anywhere in §5.**

This is not bookkeeping. §4.2's new owner table routes **two of TSPEC §6.2 row 6's three
`UNEVALUABLE` classes** to `PROP-HASH-01`, and §7.2's coverage cell was rewritten this round to sell
exactly that conjunct — *"every rejection names a `HASH_FAILURES` member — `duplicated` and `absent`
included, which no AT states over the input space"*. A conjunct that carries a residual-ledger
routing decision and a coverage claim, with no mutation that kills it, is the shape §5.1 exists to
forbid. The document knew the rule this round: it added `PROP-AWAIT-01` **(5th)** for precisely this
reason when §4.4 gained the cardinality assertion.

**Required change.** Two rows in §5.2, each naming a mutation of `parseApprovalHash` in
`orchestrate-dev.js`:

- `PROP-HASH-01` (3rd) — *return the first of two trailers as `{ ok: true, hash }` instead of
  `{ ok: false, reason: "duplicated" }`* ⇒ the `duplicated` conjunct dies on the ≥5 double-trailer
  floor; the shape and never-mid-document conjuncts both survive, so the failure names the right
  conjunct.
- `PROP-HASH-01` (4th) — *return `{ ok: false }` with `reason` omitted (or a literal outside
  `HASH_FAILURES`)* ⇒ the membership conjunct dies on the ≥5 no-trailer floor, and set membership
  names which value went missing — the same construction §5.2's `PROP-TRAILER-01` (2nd) already uses
  for `TRAILER_FAILURES`.

### F-22 (Low) — `I`'s provenance sentence describes only one of the two return sites

§4.3's *Oracle* paragraph, unchanged since v1.1:

> `I`, the round count `reviewLoop` returns in its `iterations` field (TSPEC §7.1 edit 5 — the one
> site that reports the constant as a *count* rather than an index, and the only surface at any level
> that exposes it)

Conjunct (i) as rewritten this round reads `I` on **every** segment, including segments that converge
early — the inequality `dispatches(segment) <= (1 + I) × B` is asserted unconditionally. On those
segments `I` comes from `:648` (`iterations: iteration`), which is **not** a `MAX_REVIEW_ROUNDS` edit
site at all and does not report the constant. Only the exhausting case comes from edit 5 (`:598`).
The v1.2 paragraph three lines below gets this exactly right; the older paragraph above it now
under-describes the surface it names.

**Required change.** One clause: `I` is `reviewLoop`'s returned `iterations`, which is TSPEC §7.1
edit 5's constant **on the exhausting branch** and the actual round reached (`:648`) otherwise — which
is why the equality is restricted to (b) and the inequality is not.

### F-23 (Low) — the `iff` and the `duplicated` conjunct can disagree on one drawable document

§4.2's invariant opens *"`parseApprovalHash` returns `{ ok: true, hash, … }` **iff** a **single**
well-formed approval trailer appears at a position the format permits"* and later *"a document
carrying **two** `APPROVAL-HASH:` lines outside fenced regions returns
`{ ok: false, reason: "duplicated" }`"*.

Consider a document with one valid trailer at a permitted position **and** one `>`-quoted
`APPROVAL-HASH:` line. A quoted line is outside a fenced region, so the second clause says
`ok: false, reason: "duplicated"`. It is not at a permitted position, so under the first clause the
document still has exactly one well-formed trailer at a permitted position and the `iff` says
`ok: true`. The two conjuncts disagree, and one of them will red whichever way a conforming subject
decides.

Whether the case is drawable turns on one sentence: *"D3 prose interleaved with trailer **candidates**
drawn from: valid …, valid trailers placed inside a fence or behind a `>` quote, **two valid
trailers**, and **no trailer at all**."* Read as *one shape per document* — the reading I take, since
"two valid trailers" and "no trailer at all" are listed as shapes rather than as counts — the mixed
document is never generated and nothing reds. Read as *several candidates per document*, it is
generated and the property is false on correct code. `PROP-HASH-01` rides the digest row (green
batch 3, permitted red batch 2), so this is a batch-3 gate risk rather than a halt — which is the only
reason it is Low and not Medium.

**Required change.** One clause in §4.2's Generator: each document carries **one** candidate shape
drawn from the list. (Or, if multi-candidate documents are wanted, state that the duplicate predicate
counts only lines at permitted positions, and reconcile with TSPEC §4.3's *"more than one such line
outside fenced regions"* before doing so.)

### F-24 (Low) — a paraphrase inside quotation marks, in the paragraph that forswears paraphrase

§4.4: *"PLAN §9.2 item 3(c) says the walk decides **"whichever, if any, applies"**"*, and §8.5 item 5
repeats it. Measured: the phrase does not occur in `PLAN-pdlc-review-loop-hardening.md`. The text is
**"decide which §8.5 ruling, if any, applies"**.

The substance is unaffected — neither phrasing states a precedence, so §8.5 item 5's upward report
stands exactly as written. What is wrong is the form, in the one paragraph that says *"this document
cites both and states neither in its own words"*, about the one PLAN clause whose paraphrase has
produced the round's High twice running. This is not R-6 drift: the section reference is right; the
words in the quotation marks are not the artifact's.

**Required change.** Quote the clause as it is written, in both places.

---

## Checked and dropped — do not re-file these

- **`PROP-EPISODE-01`'s access to `converged` / `iterations` in `pacingWrapper.test.js`.** Conjunct
  (i)'s new precondition (b) requires observing a per-segment `converged: false`. I checked whether
  `pacingWrapper.test.js` can see a `reviewLoop` return at all: **it can** — D7 (§3.2) draws
  *"per-round sequences of dispatch outcomes … over 1…`MAX_REVIEW_ROUNDS` rounds"* including
  `trailer-yes` / `trailer-no`, i.e. the generator controls the loop's convergence signal, so the
  segment's outcome is generator-determined and the return object is in scope. Not a finding.
- **The ≥10 exhaustion floor's satisfiability.** Derived above: 6 episodes × 7–8 attempts inside a
  1…12-length sequence with an 8-attempt ceiling. Satisfiable. Not a finding.
- **Whether `unreadable document` is a relabelled dodge.** It is not — verified as a distinct TSPEC
  failure from `LIST_FAILURES`' `unreadable`, with a real successor row on the queue. pm-review Q-01
  explicitly offered the residual as an acceptable answer and the author took it for one class of
  three rather than all three. Not a finding.
- **Is §0 still inert?** **Yes.** The v1.2 block is ~14.6 KB and thirteen disposition rows, and I
  checked each row against the section it points at rather than trusting the pointer: F-12→§4.4 (the
  full §9.2 item 3(c) restatement is in the body table, not in §0); F-13→§4.3 + §6.5 (the measurement
  paragraph appears in both); F-14→§4.3 conjunct (i) (both preconditions, the per-segment `I`, the
  cause); F-15→§4.4 + §8.5 item 5 (the cardinality wording and the upward report are both in the
  body); F-16→§4.3 + §8.4 residual 5 + §8.5 item 4; F-17→§4.3 Generator; F-18→§6.1; F-19→§5.2 row
  citing §4.1; F-20→§1.3's five-cell table + §7.1's cell; PM F-01→§3.1/§8.2 deleted, §2.3's table is
  the owner; PM F-02→§4.2's rewritten invariant; PM F-03→§4.2's owner table + §8.4 residual 6.
  **Nothing's only precise statement lives in a changelog row.** §0 remains a map. No finding on size.
- **§5 row-by-row on every row the author touched.** `PROP-DIGEST-02` (3rd) — cites §4.1's ≥5 floor,
  and `throw` on a lone surrogate genuinely kills totality alone. `PROP-AWAIT-01` (4th) — the
  backward-only mutation genuinely flips `() => _agent(a) && other` from `unclassified` to
  `returned-promise`, verified against the corrected rule. `PROP-AWAIT-01` (5th) — returning an array
  genuinely dies on the cardinality assertion. All three true. The gap is an *absent* row, not a false
  one (F-21).
- **§4.4's four-outcome set-equality floor after the unlabelled exclusion.** Each of the four remains
  independently reachable with a labelled fragment; the excluded shape is not load-bearing for any
  floor. Not a finding.
- **Citation drift.** `reviewLoop:531–543` (is `532–542`), the site-4 dispatch at `:570` (is `:574`),
  the `"bytes"` arm at `:453–457` (is `:454–458`). All corrected above, none filed (R-6).
- **§5.3's `PROP-EPISODE-01` (4th) printed above (3rd).** Cosmetic ordering, pre-existing, not filed.

---

## Questions

| ID | Question |
|----|---------|
| Q-01 | For F-23: does one generated document carry one candidate shape, or can it carry several? One word in §4.2's Generator settles it and closes the only remaining way `PROP-HASH-01` can red on correct code. |
| Q-02 | For F-21: is the intent that the `HASH_FAILURES`-membership conjunct be falsified by a *reason-substitution* mutation (as `PROP-TRAILER-01` (2nd) does for `TRAILER_FAILURES`), or is there a reason that construction was thought unnecessary here? If the latter, say so in §5.4 — a deliberately unrowed conjunct is a different artefact from a forgotten one. |
| Q-03 | *(Carried from v1.0 and v1.1 unchanged, and not filed as a finding for the third time.)* `PROP-WINDOW-01`(i) asserts `deriveRoundWindow` is invoked *"exactly once per phase entry — call-count equality on the seam log"*. `deriveRoundWindow` is a module-internal call, not an injected seam, and ESM gives a test no interception point. Which recorded surface makes the count observable at L2, or is `RLH-LOOP-03`'s grep oracle (PLAN §11.5 `H-q`) the real owner of that clause? It will bite `RLH-22` in batch 3 either way. |

## Positive Observations

- **The High was fixed by transcription, and it shows.** §4.4's cell now carries the depth-zero
  forward walk, the exact five-token terminator set, the both-must-hold conjunction and the
  `unclassified` fallback, in §9.2 item 3(c)'s own order. This is the third round in which that clause
  has been at the centre of the review and the first in which the document contains it rather than a
  rendering of it. The two dependants moved with it: the ≥10 backward-only floor went from
  ungenerable to trivially generable, and §5.3's (4th) row stopped restating the rule.
- **F-15 was answered by declining to answer it.** Inventing a precedence would have been the cheap
  fix and would have shipped a hand-authored label onto the one ledger row with no permitted red,
  ever. Generating the shape unlabelled, asserting cardinality, and filing the gap as §8.5 item 5
  against TSPEC §8.5's rulings table — where a precedence would belong — is the right shape of answer,
  and the assertion still kills the failure that actually matters (a classifier that fails loudly on a
  doubly-exempt site).
- **F-14's fix reasons from the branch, not from the reviewer's sentence.** The paragraph derives the
  `1 + (rounds that yielded a revision)` identity, shows where it breaks, cites the two return sites
  that make it break, and *then* adds the precondition. I re-derived it from the loop structure and it
  reproduces exactly, including the `2B` against `3B` figure.
- **PM F-03 was answered by taking ownership of two classes rather than deferring three.** The easy
  reading of the finding was "file all three as a residual"; the document instead moved `duplicated`
  and `absent` to the parser property that already owns their parser, with real conjuncts and real
  floors, and deferred only the genuine IO-seam class with a successor row that exists on the queue.
  That is the more expensive answer and the correct one — and F-21 is precisely the bookkeeping the
  cheap answer would not have owed.
- **Everything measurable in this revision measured true.** Twelve modules plus `bin/`, `BYTES_FLOOR`
  at `:423`, `:598` and `:648`, `recordPhase` at `:1574` reaching `checkConverged` at `:496`,
  `HASH_FAILURES` at TSPEC `:853`, §6.2 rows 6 and 7, queue row Order 9, and the 1038/1/70/36
  baseline. Round 2's four defects were all *inferred* surfaces; this round's are one absent ledger
  row and three sentences that describe a correct thing imprecisely. The failure mode has kept
  shrinking in kind as well as in count.

## Recommendation

**Needs revision**

Zero High, one Medium, three Low — down from 1H/3M/5L. No property is unimplementable, no property
reds on a correct subject that I could construct except under F-23's disputed reading of one generator
sentence, and no round-1 or round-2 finding is reopened. F-21 is two ledger rows in §5.2 written in
the shape the document already uses for `PROP-TRAILER-01` (2nd). F-22, F-23 and F-24 are one clause
each. No structure moves, no floor changes, no property is restated.

---

VERDICT: Needs revision
{"high": 0, "medium": 1, "low": 3}
