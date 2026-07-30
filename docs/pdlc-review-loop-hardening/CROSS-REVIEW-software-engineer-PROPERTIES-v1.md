# Cross-Review: software-engineer — PROPERTIES

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-review-loop-hardening/PROPERTIES-pdlc-review-loop-hardening.md` v1.0
**Date:** 2026-07-30
**Iteration:** 1
**Scope:** PROPERTIES v1.0 (95,831 B, commits `556e56d..3790f56`), technical lens only — implementability,
falsifiability, and compatibility with the approved REQ v1.6 / FSPEC v1.8 / TSPEC v1.7 / PLAN v1.4 interfaces.
Upstream documents are not reopened. Citation/`file:line` drift is out of scope (R-6).

**Verification basis (DC-02).** Everything below was measured at branch HEAD `3790f56`:
`pdlc/workflows/__tests__/helpers/driftGenerators.js` read in full; `pdlc/workflows/package.json`;
`pdlc/workflows/orchestrate-dev.js`; `docs/_queue/QUEUE.md`; TSPEC §2.5, §4.5, §4.8, §8.1–§8.5; PLAN §7.2,
§7.3, §9.2. The full suite was re-run in the background (`cd pdlc/workflows && npm test`).

---

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | **High** | Local | `PROP-AWAIT-01`'s outcome catalogue contradicts the mechanism PLAN §9.2 item 3 prescribes, and reds on correct source | §4.4, §5.3 |
| F-02 | **High** | Local | `PROP-ROUND-01`'s width identity and `PROP-EPISODE-01`'s 36-bound reference constants TSPEC §4.8 makes unexported and unreachable at L1/L2; as written they are either unimplementable or tautological, and two §5 ledger rows are wrong | §4.1, §4.3, §5.2, §5.3, §6.5 |
| F-03 | **High** | Local | `PROP-EPISODE-01` conjunct (i) states TSPEC §4.5's **per-phase** bound as a **total** bound, contradicting its own conjunct (iii) and its own generator | §4.3 |
| F-04 | **High** | Local | `PROP-EPISODE-01`'s per-coordinate non-vacuity floor is unsatisfiable for the `invocation` coordinate, which TSPEC §4.5 defines as derived, not as an input | §4.3, §8.5 |
| F-05 | **Medium** | Local | The `shrink` workaround is sound but overstated: the shipped `"bytes"` branch is not a ladder and is a no-op for most of the cases assigned to it | §2.3, §8.2 |
| F-06 | **Medium** | Local | `PROP-GINV-01`'s "exit catalogue" has no owning artifact; its set-equality floor and §5.3's third falsifier are the test falsifying its own list | §4.3, §5.3, §2.5 |
| F-07 | **Medium** | Local | D8 deliberately generates source shapes PLAN §9.2 states the bracket-depth walk cannot decide, on a ledger row with no permitted red, ever | §3.2, §4.4 |
| F-08 | **Medium** | Cross-Feature | `PROP-AWAIT-01` claims the classification is a **total partition**; measured, it is a total *cover* with a shipped unsound exemption | §4.4, §7.2 |
| F-09 | Low | Local | §6.1's measured fixture/helper inventory is off by one in both directions | §6.1 |
| F-10 | Low | Local | §2.5's 179.795 s baseline wall time did not reproduce (299.503 s here); the pass/fail baseline did reproduce exactly | §2.5, §7.3 |
| F-11 | Low | Local | Queue row Order 9 exists, but the REQ path it names does not exist on disk; §8.3 overstates it as a row that "already owns" the contract | §8.3 |

---

### F-01 (High) — `PROP-AWAIT-01`'s five-element outcome catalogue cannot be produced by the prescribed scanner

§4.4 states the invariant as: for every site `s ∈ S`, *"exactly one of four things holds: `s` is `await`ed;
or `s` is classified by TSPEC §8.5 ruling **1** (alias), **2** (returned promise) or **3** (argument to an
awaited combinator)"*, adds *"a site matching **two** rulings is equally a failure: the classification is a
partition, not a cover"*, and requires in non-vacuity that *"each of the three rulings, plus 'awaited' and
plus 'unclassified', must be the expected outcome for ≥10 fragments — set equality against the five-element
outcome catalogue."*

Measured against the mechanism the PLAN owns, PLAN §9.2 item 3(c):

> for each call site of a scan-set name **not** lexically preceded by `await`, walk *backwards* … and decide
> the three rulings from it — returned promise (…), awaited combinator argument (…), **alias (already
> discharged by (b))**.

And TSPEC §8.5's alias row does not exempt anything — it *widens the scan set* (*"scans the local name in
addition to the `_`-prefixed one … Both spellings are the same obligation"*). Its own worked instances are
`await readFileFn(planPath)`, `await checkFileFn(reqPath)`: **awaited**.

Three consequences, all blocking:

1. The classifier can never emit "ruling 1" as an outcome — alias is discharged when the scan set is built,
   before any site is classified. The ≥10-fragments floor for that outcome, and the set equality against a
   five-element catalogue, are unsatisfiable by construction.
2. Every aliased site that is *correct* is correct because it is awaited, so it matches both "awaited" and
   "ruling 1". §4.4 declares a two-match a failure. The property therefore **reds on shipped, correct
   source** — the same defect class as TSPEC §8.5's own v1.0 AT-19 and v1.0 AT-64 histories, which that
   section exists to record.
3. It reds on the one row in PLAN §7.3 whose permitted-red window is **"none, ever"**, i.e. an immediate
   §11.3 `H-h`/`H-k` halt in batch 2.

**Required change.** State the outcome catalogue as **four** elements — `awaited`, `returned-promise`,
`awaited-combinator-argument`, `unclassified` — and state alias as what PLAN §9.2 item 3(b) makes it: a
scan-set construction rule that is not an outcome and cannot be a co-classification. The disjointness
conjunct then means something (rulings 2 and 3 are genuinely disjoint: one requires the nearest preceding
token to be `=>`/`return`, the other requires the innermost unclosed delimiter to be `[`).

### F-02 (High) — the two constant-bearing identities cannot be asserted as written

TSPEC §4.8, verbatim:

> Module-level, not `main()` parameters … **They are not exported** — an export widens the bundle's published
> surface for no caller. Tests reach them through observable behaviour (round windows, dispatch counts) …

§6.5 of this document correctly restates that rule. But §4.1 and §4.3 then state two invariants that need
the values:

- `PROP-ROUND-01`: *"`endIndex === startIndex + MAX_REVIEW_ROUNDS - 1` (the width identity, over all inputs
  including the empty set)"*, and §5.2 claims the mutation *"compute `endIndex` as `startIndex +
  MAX_REVIEW_ROUNDS` (off by one)"* → *"the width identity dies on **every** case."*
- `PROP-EPISODE-01`(i): *"total authoring dispatches never exceed `(1 + MAX_REVIEW_ROUNDS) ×
  MAX_AUTHORING_DISPATCHES` … asserted against the constants, never against the literal 36"*, reinforced by
  §5.3's anti-oracle row and §5.4.

Measured: `export function deriveRoundWindow(basenames, docType)` (TSPEC §3.7/§5.2) takes **no** width
parameter, `const MAX_REVIEW_ROUNDS = 5;` and `const MAX_AUTHORING_DISPATCHES = 6;` are unexported (TSPEC
§4.8), and TSPEC §8.4 forbids L1 touching the filesystem — so the L1 property cannot read the source text
either, the way `PROP-AWAIT-01` is permitted to.

So the strongest form an L1 test can express is *"the width is the same for every input"*. The §5.2 off-by-one
mutation **satisfies that** — the width simply becomes a constant 6 — so the ledger row is wrong: the
conjunct does not die on any case, let alone every case. The `PROP-ROUND-01` row is the executable statement
of H-1 and currently is not falsifiable.

The `PROP-EPISODE-01` case is the mirror image: there is no injected surface exposing
`MAX_AUTHORING_DISPATCHES` either, so the only observable is the cap the subject enforces on itself, and
"asserted against the constants" degenerates to comparing the subject's cap with the subject's cap.

**Required change.** Pick one and say so: (a) name the width and the bound literally in the property and
accept the maintenance coupling (this contradicts §6.5 and §5.4's anti-oracle, so §6.5 must be amended too);
or (b) weaken the invariants to what is observable (*"the width is invariant across inputs"*, *"the cap is
invariant across episodes"*) and **rewrite the two §5 ledger rows** so they name a mutation that actually
kills the weakened conjunct; or (c) route the constant to the property through an existing injected surface
and name it. As written the document asserts (a) and justifies (b).

### F-03 (High) — `PROP-EPISODE-01`(i) states a per-phase bound as a total bound

TSPEC §4.5, verbatim: *"Worst-case dispatch count **in one phase** `(1 + MAX_REVIEW_ROUNDS) ×
MAX_AUTHORING_DISPATCHES` = 36."*

§4.3 states it as *"**total** authoring dispatches never exceed …"*, quantified over *"every generated
interleaving of **phases** and rounds"*, with a generator (D7, extended) of *"Sequence length 1…12; per
episode, 0…8 attempted dispatches"* and non-vacuity floors of *"≥15 must revisit a phase"* and *"≥10 must
decrease `roundIndex` across episodes"* — and conjunct (iii) explicitly says each such revisit *"gets its own
budget rather than a exhausted one."*

A correct subject over a 12-episode, multi-phase interleaving therefore dispatches legitimately more than 36
in total, and conjunct (i) reds on it. Conjuncts (i) and (iii) contradict each other under this document's own
generator.

**Required change.** Scope the bound per phase, as TSPEC §4.5 does, and state the aggregation rule for
multi-phase interleavings (or restrict D7 to a single phase for conjunct (i)).

### F-04 (High) — the per-coordinate floor is unsatisfiable for `invocation`

TSPEC §4.5's typedef:

```js
invocation: number, // monotonic within (artifactSet, phase, round, mode)
```

`invocation` is **derived by the subject**, not an input — it is precisely the counter that distinguishes the
second episode with the other four coordinates equal. §4.3's non-vacuity requires *"each of the five
coordinates must be the **sole** differing coordinate in ≥3 pairs — set equality against the coordinate list."*

An L2 property driving `main()`/`reviewLoop` through the sync doubles cannot hold `artifactSet`, `phaseId`,
`roundIndex` and `mode` fixed and vary `invocation`: doing so *is* re-entering the same episode, which is what
increments it. There is no seam that lets the test set it. The floor cannot be met, so the property cannot go
green — on a row (RLH-21's) whose permitted-red window closes at batch 7.

**Required change.** Either state the floor over the **four** externally-controllable coordinates and say why
`invocation` is excluded (it is the counter, not a key input), or name the mechanism by which a test varies it.
§8.5's honest note about the missing canonical serialisation should be extended to cover this.

### F-05 (Medium) — the `shrink` workaround is sound in principle, overstated in fact

The workaround respects PLAN §7.2 exactly: no second primitive library, generators and ladders stay per-file
and unexported, `driftGenerators.js` is unmodified. That part is right and I agree with the disposition over
extending `shrink` with five kinds.

What is overstated is §2.3's *"wrap the failing case as `{ kind: "bytes", … }` and **walk `shrink`'s existing
ladder** (floor 64 bytes)"*. Measured at HEAD (`driftGenerators.js:454–458`):

```js
case "bytes": {
  const bytes = caseValue.bytes;
  if (!bytes || bytes.length <= BYTES_FLOOR) return [];
  return [{ kind: "bytes", bytes: bytes.slice(0, BYTES_FLOOR) }];
}
```

- It is **not a ladder** — it returns at most **one** candidate.
- It returns `[]` for any case ≤ 64 bytes. `PROP-DIGEST-01`/`-02` draw `n ∈ 0…512`, so roughly an eighth of
  every generated corpus has no shrink step at all.
- The single rung is a raw byte truncation, which splits multi-byte UTF-8 sequences — exactly the shapes
  `PROP-DIGEST-02`'s ≥15/≥5 floors exist to force — so the shrunk case is in a different domain and usually
  stops falsifying, at which point the walk reports the original.
- For `PROP-HASH-01` ("shipped `"bytes"` kind for the prose") and `PROP-STALE-01` ("shipped `"bytes"` kind for
  the document"), truncating at byte 64 removes the 64-hex trailer the case turns on, so the rung is a
  guaranteed no-op.

Net: the four properties assigned to the shipped kind get, in practice, no shrinking. That is acceptable —
but the document should say it, because an implementer reading §2.3 will expect a ladder and spend a batch
discovering there is not one. Simplest honest fix: use file-local ladders uniformly and record that the
shipped `"bytes"` kind is reused only where a 64-byte truncation is genuinely simpler.

(Unrelated but worth recording since the file was read: `shrink`'s `"id"` branch returns a ladder containing
the input itself when `value === "a"`, so a naive walker can loop. This feature does not use that kind.)

### F-06 (Medium) — `PROP-GINV-01`'s exit catalogue has no owner

§4.3 requires *"the property enumerates the exits from the **catalogue** of exits, not from an observed run"*,
non-vacuity requires *"set equality against the exit catalogue"*, and §5.3's third falsifier is *"remove an
exit from the exit catalogue while leaving the machine's exit in place."*

No artifact owns such a catalogue. TSPEC §2.5's G-INV is deliberately *not* an enumeration:

> No path — forced, unforced-with-no-candidate, unforced-not-approving, `STALE`, `UNEVALUABLE`, **or any exit
> added later** — may reach `reviewLoop` without having passed step G … never by enumerating which steps
> happen to reach it today.

So the catalogue is a list the property's own test file writes. That makes §5.3's third row a falsifier of the
test *by* the test — deleting a line from a list and observing that a comparison against the same list fails
says nothing about `orchestrate-dev.js`. It also reintroduces exactly the enumeration §4.3 says the property
exists to replace.

Compounding it: §2.5 says *"`PROP-GINV-01`'s **six** exits × three POSTMORTEM states"*, TSPEC §2.5 names five
(plus `FRESH`, which does not run the phase), and TSPEC AT-13a names four gated exits plus `FRESH`. Three
different counts.

**Required change.** Name the artifact the catalogue is read from, or restate the floor as reachability over
the generated state space (which is what the invariant actually says) and drop the §5.3 third row or replace
it with a mutation to the subject.

### F-07 (Medium) — D8 generates outside the domain the prescribed walk claims to decide

PLAN §9.2 item 3's justification for a hand-rolled walk over a parser is explicitly domain-bounded:

> the walk needed here is small and **its input is known-shaped: two files, top-level functions unindented, no
> nested combinator calls anywhere at HEAD**. It also stays honest about its own limits — a shape it cannot
> decide is an unclassified site, which fails loudly.

§3.2's D8 generates the opposite: *"calls inside template literals, inside string literals containing brackets,
inside comments, split across lines, nested inside another call's argument list."* §4.4 then requires *"Each
fragment is generated together with its **expected** classification, so the property is a round-trip:
`classify(fragment) === expected`"*, and *"≥15 fragments must place a seam call inside a masked region … where
the expected outcome is that **no site is found at all**."*

Two of those shapes are not decidable by a masking pass without a lexer, and a parser is forbidden (PLAN
§11.4 `H-n`, `jest` is the only declared dependency — confirmed in `pdlc/workflows/package.json`):

- **Regex-vs-division.** `const re = /[)]/;` — masked as a regex, correct; `x = a /_agent(b)/ c;` — masked as a
  regex, and the real call site vanishes. A masking pass that guesses wrong either hides a genuine site (silent
  pass — the failure mode the whole assertion exists to prevent) or leaves an unbalanced `)` in the depth stack
  and corrupts every classification after it in the fragment. This is the "decides confidently but wrongly"
  case, and the generator is instructed to produce it.
- **Nested combinator calls**, which PLAN §9.2 states do not occur at HEAD and which the walk is not claimed to
  handle, are in D8's stated draw list.

This lands on RLH-31's row: batch 2, green on arrival, **permitted red: none, ever**. A single generated
fragment the walk decides differently from the author's `expected` is a §11.3 halt.

**Required change.** Either restrict D8 to the shapes PLAN §9.2 says the walk decides, or state explicitly that
the expected outcome for a lexically ambiguous fragment is `unclassified` (the walk's honest-limits contract) —
and drop the "no site is found at all" expectation for the regex sub-case. Note that the PLAN's exemption-
predicate was fail-open twice during PLAN authoring; a property whose expectations are hand-authored per
fragment inherits that hazard.

### F-08 (Medium, Cross-Feature) — "total partition" claims more than the classification provides

§4.4 and §7.2 both state the property proves *"the classification as a **total partition** over the site set."*
Measured, it is a total **cover**, and one branch of it is unsound. TSPEC §8.5's returned-promise ruling:

> **The exemption is unconditional on naming; only the inheritance depends on it.** … An *anonymous* arrow has
> no name to inherit it, and **the obligation is then inherited by nobody** … and the shape is shipped:
> `batch.map((task) => agentFn(…))`

Confirmed at HEAD: `pdlc/workflows/orchestrate-dev.js:1866` carries `batch.map((task) =>`. That site is exempt
and nothing in the classification verifies the map's result is awaited. A property reporting green on a "total
partition" therefore tells a reader that every seam call is either awaited or safely exempt, which is stronger
than what is checked.

This is a property of the approved TSPEC ruling, not a request to reopen it. What must change is this
document's claim about it: state the property as **totality of the cover** (every site is classified or fails
loudly), and record the two exemptions that are total-but-not-sound so the green is read correctly. §8.4's
residual-risk list is the natural home.

### F-09 (Low) — §6.1 inventory

§6.1: *"`pdlc/workflows/__tests__/fixtures/` currently holds **one** entry — `covered-violations/`"* and
*"`__tests__/helpers/` holds **twelve** modules."* Measured at HEAD: `fixtures/` holds **two**
(`covered-violations/` and `tmpGitFixture.js`); `helpers/` holds **13**. Neither changes a conclusion — both
paths are in `testPathIgnorePatterns`, which §6.1's load-bearing claim is about and which is correct.

### F-10 (Low) — §2.5's baseline wall time did not reproduce

Re-run at this branch HEAD, backgrounded:

```
Test Suites: 1 failed, 35 passed, 36 total
Tests:       1 failed, 70 skipped, 1038 passed, 1109 total
Time:        299.503 s
```

The pass/fail/skip/suite baseline reproduces **exactly**, and the single red is the foreign intentional
`documentOracles.test.js › AT-22 [red-until-L-06]` — §2.5's substantive claim holds. The **179.795 s** figure
does not: the parallel critical path here is `guardMatrix.test.js` (298.8 s), `driftFault.test.js` (296.8 s)
and `driftSync.test.js` (252.0 s). Since §2.5 uses "sits on the 180 s foreground watchdog" as the load-bearing
premise for backgrounding every run, state the number as machine-dependent — the conclusion (always background,
generous timeout) is right on both machines, and is more robustly right on this one.

### F-11 (Low) — queue row Order 9 exists; the REQ it names does not

Verified `docs/_queue/QUEUE.md:30`: `| 9 | blocked | pdlc-authoring-contract |
docs/pdlc-authoring-contract/REQ-pdlc-authoring-contract.md | pdlc-review-loop-hardening |`. The row exists,
carries the right dependency, and is `blocked`, so the queue driver will not pick it. But
`docs/pdlc-authoring-contract/` does not exist on disk, so §8.3's *"the row that **already owns** the authoring
contract"* overstates it. DC-08 is satisfied — both deferrals name a queue row, not a person or a promise — but
say "the row reserved for it" rather than "already owns".

---

## Answers to the six questions

**1. Are these properties implementable within C-2?** Yes for the test side, and §2.4 draws the line correctly
and does not blur it: it states plainly that C-2 governs `pdlc/workflows/*.js`, that the test files are ordinary
ESM and may `import`/`Buffer`/`crypto`, and — the part that matters — that no property may require the
*subject* to acquire a forbidden capability. §4.1's refusal to oracle `sha256Hex` against `require("crypto")`,
with the stated reason (the property would stay green on a subject that breached C-2), is the correct call and
the sharpest paragraph in the document. §2.4's note that `PROP-AWAIT-01` reads source and never `dist/` respects
the artifact tiers, as does §7.3's "no property runs at L4". The one place C-2's neighbourhood does bite is
F-02: TSPEC §4.8's no-export rule, which exists *because* of C-2's no-configuration-channel bundle, makes two
stated identities unassertable. That is a real implementability blocker, not a C-2 breach.

**2. Is `PROP-AWAIT-01`'s "total partition" the right property, decidable by the prescribed mechanism, and can
a generated input make the walk decide confidently but wrongly?** Three answers, all qualified:

- **Right property?** Totality is right and is the single most valuable thing in this document — an unclassified
  site failing loudly is exactly what turns §8.5 from prose into a checked sentence. **"Partition" is not
  right** (F-08): the classification is a total *cover*, and TSPEC §8.5's returned-promise ruling is
  unconditional on naming, so the shipped `orchestrate-dev.js:1866` anonymous arrow is exempt with the
  obligation "inherited by nobody". Total, yes. Sound, no.
- **Decidable by the prescribed mechanism?** **Not as stated.** The five-element outcome catalogue is
  unproducible: PLAN §9.2 item 3(b) discharges alias when the scan set is built, so the classifier's outcome
  space is three-valued for a non-awaited site (F-01). Fix the catalogue to four elements and the totality claim
  becomes decidable for the shapes PLAN §9.2 bounds.
- **Can a generated input make it decide confidently but wrongly?** **Yes** (F-07). Regex-literal masking is a
  lexer problem, not a masking problem: `const re = /[)]/;` and `x = a /_agent(b)/ c;` cannot be distinguished
  from division by the prescribed pass, and D8 is instructed to generate exactly that neighbourhood. Wrong in
  the hiding direction is a silent pass — the failure mode the assertion is the sole guard against — and wrong
  in the other direction corrupts the depth stack for the remainder of the fragment. Given the PLAN records this
  scanner's exemption predicate failing open twice already, generating outside its stated domain onto a
  never-red ledger row is the wrong trade.

**3. Is the `shrink` workaround technically sound?** **Sound, and overstated** (F-05). Verified against
`driftGenerators.js` at HEAD: `shrink` switches on four kinds and `default: return []`, exactly as §2.3/§8.2
report; every domain this feature generates hits the default. The workaround respects PLAN §7.2 to the letter —
file-local, unexported, no second primitive library, `driftGenerators.js` untouched — and rejecting the
alternative (five new kinds in a helper seven suites depend on) is the right judgement in a feature about not
breaking things quietly. What is wrong is the claim to "walk `shrink`'s existing ladder": the `"bytes"` branch
returns `[]` below 64 bytes and one truncation above it, and for the trailer-bearing documents of
`PROP-HASH-01`/`PROP-STALE-01` that one rung is a guaranteed no-op. Say so, or use file-local ladders uniformly.

**4. Does the weaker `EpisodeKey` property protect the 36-dispatch bound?** **Partly, and it is currently
self-contradictory.** §8.5's reasoning for choosing independence-over-pairs rather than "equal keys share a
budget" is correct and well argued: with no canonical serialisation the direct form would require the test to
invent one, and `S-INV` makes `roundIndex` and `mode` per-episode derivations, so the key is deliberately
unpinned. Independence across one-coordinate-differing pairs is the right shape for that constraint. But it
protects the bound only in one direction — it catches a key that is too *coarse* (the §5.3 falsifier, keying on
`phase` alone) and cannot catch a key that is too *fine*, where every dispatch gets a fresh budget and
independence passes trivially. The global cap in conjunct (i) is what should close that direction, and as
written it does not: it is stated as a total rather than TSPEC §4.5's per-phase bound (F-03), so it reds on a
correct multi-phase interleaving, and it is asserted "against the constants" that cannot be read (F-02), so its
only available oracle is the subject's own cap. Fix (i) per-phase and give it a real oracle, and the pair —
coarse-key detection from (ii), too-fine detection from (i) — does protect the bound. Also drop `invocation`
from the coordinate floor (F-04).

**5. Determinism and reproducibility.** The generator layer is genuinely deterministic and the document's
measurements of it are accurate: `seeded` is a stateful xorshift32 seeded from `(seed >>> 0) || 0x9e3779b9`
(§3.1's warning that seed 0 silently becomes `0x9e3779b9` is correct and non-obvious), `shuffle` copies via
`arr.slice()` and does not mutate, `bytes(n)` returns a `Buffer`, and `resolveSeed` reads `PDLC_PROP_SEED`,
returns the literal when unset or empty, throws on a non-decimal, else `parseInt(raw, 10)`. Replay-not-index
reproduction is stated correctly and matches the primitive's contract. `int`'s modulo reduction is slightly
biased for ranges that do not divide 2³², which is immaterial for every domain here.

On search-space adequacy, the design decision that carries it is §3.3's *forced* floors: because the adversarial
shapes are constructed rather than sampled, each §5 mutation meets its discriminating shape deterministically
at 100 cases, and `PDLC_PROP_SEED` genuinely widens without flaking. Two caveats. §3.3 rule 1 names four shapes
as forced while §4 states roughly sixty floors across the seventeen properties; the document should state
plainly that *every* floor is forced, because any floor met by sampling is a seed-dependent red on a correct
subject the first time somebody sets the override — precisely the failure mode §2.2 rule 3 warns about. And
`PROP-AWAIT-01` is the one property whose reproducibility depends on hand-authored per-fragment expectations
rather than on a forced draw (F-07). Everything else: deterministic, reproducible, large enough, not so large it
will flake.

**6. Cost.** **Acceptable — my estimate is a negligible wall-clock increment, well under 10 s, and plausibly
zero.** Reasoning from the measured run rather than from case counts: the suite's wall time is set by the
parallel critical path, and that path is entirely shell-spawning drift suites — `guardMatrix` 298.8 s,
`driftFault` 296.8 s, `driftSync` 252.0 s, `driftClassify` 231.5 s, `driftBackups` 216.8 s. Every one of the
seventeen properties is L1 or L2: pure string/record work or `main()`/`reviewLoop` driven through synchronous
doubles, no process spawn, no filesystem, no `dist/` read (§7.3 states this and it checks out). 17 × 100 = 1,700
cases; L1 cases over ≤512-byte inputs are microseconds, L2 cases through sync doubles are single-digit
milliseconds, so the total added CPU is on the order of 5–10 s spread across six suites
(`approvalHash`, `scanLines`, `roundDerivation`, `forcePhases`, `completeness`, `pacingWrapper`,
`approvalSearch`, `haltAndQueue`, `reviewLoop`, `runtimeBundle`). None of those becomes the critical path, so
the wall clock is unchanged in practice. The 100-case default budget and the preference for exhaustive
enumeration where the space is small (§2.5) are the right calls and are what keep this true; do not raise the
budget without re-measuring. I am **not** proposing any change to the existing suite — the correct response to a
suite that exceeds the foreground watchdog is the one §2.5 already takes: background every run with a generous
timeout.

---

## Also verified

- **Every one of the ten new properties rides an existing §7.3 ledger row — confirmed row by row** against
  PLAN §7.3. `PROP-HASH-01` → digest row (green 3, red 2); `PROP-STALE-01` → `RLH-AT-15/-16/-18` (green 8, red
  2–7); `PROP-TRAILER-01`/`-LIST-01b`/`-EPISODE-01` → RLH-21's `RLH-AT-35…-54, -58, -43a, -61-loop` (green 7,
  red 3–6); `PROP-RESOLVE-01`/`-APPROVE-01` → `RLH-AT-08…-11, -56, -57` (green 8, red 3–7);
  `PROP-LIST-01a`/`-GINV-01` → RLH-25's row (green 9, red 3–8); `PROP-WINDOW-01` → `RLH-LOOP-01`/`-02` (green 9,
  red 3–8); `PROP-AWAIT-01` → row 1, green on arrival, no permitted red. Every window in §7.1 matches the PLAN's.
  **No new ledger row is proposed and the approved PLAN is unchanged** — correct, and the right constraint to
  have held itself to.
- **Namespace collision.** Reproduced exactly: `grep -rn "PROP-" pdlc/workflows/__tests__/` → **431 matches
  across 28 files**; `describe("PROP-GATE-01: …")` is live at `pipelineWiring.test.js:235`; all **sixteen**
  chosen domains (`DIGEST SCAN NAME ROUND FORCE COMPLETE HASH TRAILER RESOLVE STALE LIST APPROVE GINV EPISODE
  WINDOW AWAIT`) return **zero** matches at HEAD. The `PROP-GATE-01` → `PROP-GINV-01` rename is necessary and
  §8.4's note that the verification is point-in-time is the right residual to carry.
- **TSPEC §8.1 vs §8.2 — reporting upward is correct.** §8.1 asserts a universal over the L1 row and §8.2
  enumerates seven of the thirteen components in it; that is a converged spec asserting a universal and
  discharging a proper subset — structurally the same defect this feature exists to fix, so it belongs to the
  TSPEC's owner. A downstream document cannot amend an approved upstream, and quietly writing four extra
  properties to *make* the universal true would hide the inconsistency behind a green suite. §8.1's disposition
  — close four, decline two with stated reasons, leave §8.2 the authority on its seven, report the discrepancy —
  is exactly right. Do not absorb it.
- **DC-08 routing.** Queue row Order 9 `pdlc-authoring-contract` exists at `docs/_queue/QUEUE.md:30`, status
  `blocked`, `Depends-On: pdlc-review-loop-hardening`, and is the right home for both deferrals
  (`MAX_AUTHORING_WRITE_BYTES` has no behavioural oracle — TSPEC §4.8 says so in as many words; SKILL↔fixture
  drift, PLAN §10.2 / `H-j`). Both name a surface rather than a person. Caveat in F-11.
- **Artifact tiers respected.** §2.4 and §7.3 keep every property on `pdlc/workflows/*.js` source or on injected
  seams; nothing reads `pdlc/workflows/dist/` or `.claude/workflows/`; §8.3's last row states the distinction
  explicitly for a reader who might wonder. No property implies a change to a generated artifact, so the
  build-and-commit-in-the-same-commit discipline is untouched.
- **No contradiction with an approved interface** other than those in F-01…F-04. `LIST_FAILURES`,
  `FILENAME_FAILURES`, `HASH_FAILURES` and `TRAILER_FAILURES` are `export const` in TSPEC §4.1, so §6.5's
  "the generator enumerates the catalogue itself" and the set-equality floors built on them are implementable;
  the constants are the sole exception and are the subject of F-02.

## Questions

| ID | Question |
|----|---------|
| Q-01 | Which artifact owns the exit catalogue `PROP-GINV-01` quantifies over? If the answer is "the test file", what does §5.3's third falsifier prove about `orchestrate-dev.js`? |
| Q-02 | Is `MAX_REVIEW_ROUNDS` observable to an L1 test by any route TSPEC §4.8 and §8.4 both permit? If not, which of F-02's three resolutions do you take? |
| Q-03 | Are *all* §4 non-vacuity floors forced (§3.3 rule 1 names four shapes), or are some sampled? A sampled floor is a seed-dependent red the first time `PDLC_PROP_SEED` is set. |
| Q-04 | `PROP-AWAIT-01` sits on the only row with no permitted red, ever. Is the generated 100-fragment round-trip intended to carry that guarantee from batch 2, or should the fragment half be scoped so a scanner-domain disagreement is a finding rather than an `H-h` halt? |

## Positive Observations

- **§5's falsifiability ledger is the best artifact in this feature's document set.** Forty named source
  mutations, each naming the file, the construct and *the conjunct that dies* — and §5.4's two anti-oracle rows
  (`PROP-COMPLETE-01` (2nd) and `PROP-GINV-01` (3rd) falsifying against the specification; `PROP-EPISODE-01`
  (2nd) falsifying the *test*) are the kind of thing that normally gets discovered at batch 10. Recording the
  wrong way to write the 36-dispatch assertion, in the document, before anyone writes it, is worth more than
  several of the properties.
- **§3.3's set-equality floors derived from the catalogue** rather than hand-listed. That is what makes
  `PROP-COMPLETE-01` red when `R` itself shrinks and `PROP-FORCE-01` red when the catalogue grows without the
  generator — a property that notices its own domain narrowing is rare and is the correct answer to the decay
  mode §5.4 names.
- **§2.4's C-2 reasoning**, and specifically the refusal to oracle `sha256Hex` against `crypto`. The stated
  reason — that the comparison would stay green on a subject that reached for `crypto` — is the non-obvious one
  and is exactly right.
- **Measurement discipline throughout.** The `shrink` limitation, the `PROP-` namespace collision, the
  `bytes(n)`-returns-a-`Buffer` and `seed 0 → 0x9e3779b9` notes, the bare-`npx jest` trap, the §8.1/§8.2
  discrepancy: all of these were found by reading the tree rather than assuming, and all of them reproduce. The
  three §6.1/§2.5 slips (F-09, F-10) are the exceptions that prove how consistently the rest was measured.
- **§1.3's discipline of riding existing ledger rows** rather than proposing new ones. Deriving each window
  mechanically from the greening task's batch and then reporting "measured outcome: every one of the ten rides
  an existing row" is the right way for a downstream document to stay inside an approved PLAN.

## Recommendation

**Needs revision**

Four High and four Medium findings. The document's structure, its measurement discipline and its falsifiability
ledger are strong enough that the revision is bounded: F-01 and F-03 are wording corrections against the
mechanism and the bound their own upstream already states; F-04 is dropping one coordinate from a floor; F-05,
F-08 and F-11 are honest restatements of what is actually bought. F-02 is the one that needs a real decision,
because two properties and two ledger rows currently assert an identity no test at their level can observe, and
F-07 needs the D8 domain reconciled with what the prescribed walk claims to decide before it lands on a row that
may never be red.

---

VERDICT: Needs revision
{"high": 4, "medium": 4, "low": 3}
