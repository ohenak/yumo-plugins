---
Status: Draft
Author: se-author
Version: 1.0
Feature: pdlc-loop-economics
---

| Field | Value |
|---|---|
| Upstream | REQ → FSPEC → **TSPEC** |
| Downstream | DECISIONS, PLAN, PROPERTIES, IMPL |
| Cross-Reviews | (none yet) |
| LEARNINGS | docs/pdlc-loop-economics/LEARNINGS-pdlc-loop-economics.md |

# TSPEC — pdlc-loop-economics

Technical design for FSPEC §1–§5. FSPEC says *what* the loop computes; this document says
*which symbol in which module* computes it, through which seam, and how it is falsified.

Evidence for every claim about shipped code is the feature's verified seam map
(`docs/pdlc-loop-economics/_evidence/seam-map.md`), re-verified against the working tree while
this document was written. Per DEC-DOC-01 this spec cites **stable content** — exported symbol
names, function names, literal source strings — not line numbers; the seam map holds the
`file:line` positions and is the artifact that carries the re-verification obligation.

---

## 1. Module placement and the vendoring constraint

All production changes land in **one file: `pdlc/workflows/orchestrate-dev.js`**.

No new module under `pdlc/workflows/lib/` may be created by this feature. The engine's
`prepack.mjs` vendors a frozen list (`MODULE_NAMES`: `orchestrate-dev.js`,
`orchestrate-queue.js`, `lib/loop-session.mjs`, `lib/escalation-view.mjs`); a new lib module
would be silently absent from the published engine unless that list changed, and REQ NG-3
forbids editing `pdlc/engine/`. See DECISIONS DEC-LOOPECON-08.

Consequences that bind PLAN:

- Every implementation task writes the same physical source file, so implementation tasks are
  **serialised into distinct batches** (se-author batch-safety rule 2). Test files are
  one-per-task and may run in parallel.
- `pdlc/workflows/package.json`'s `c8.include` already names `**/pdlc/workflows/orchestrate-dev.js`;
  no coverage-config change is needed, and the stage-2 per-file `--branches 85` gate already
  applies to every branch this feature adds.
- Any commit touching `pdlc/workflows/*.js` must regenerate and stage `pdlc/workflows/dist/`
  (`node pdlc/workflows/build-runtime.mjs`) in the **same** commit — the wave gate's
  `postWaveCommand`/`postWavePathspecs` do this per wave. `dist/pdlc-cli.mjs` is never hand-edited.
- The landing commit bumps `pdlc/.claude-plugin/plugin.json` `version` (currently `0.23.5`).

No SKILL.md file is edited (REQ NG-2). The three vestigial "do so verbatim" sentences in
`pm-review`, `se-review` and `te-review` SKILL.md stay exactly as they are; touching them would
trip the digest manifest for no behavioural gain.

---

## 2. Config parsing (`cascade.pinCheck`, `review.derivativeStop`)

### 2.1 Shape

Both new blocks live in the same file every other pdlc config block lives in —
`MERGE_CONFIG_PATH` (`".claude/pdlc.config.json"`), already re-exported as
`LEARNINGS_CONFIG_PATH`:

```json
{ "cascade": { "pinCheck": { "enabled": false } },
  "review":  { "derivativeStop": { "enabled": false, "rounds": 2 } } }
```

The key spellings are fixed by REQ C-3 and no other nesting satisfies it. Note both are
**two-level** blocks, where `learningsInjection` is one level; §2.3 handles that.

### 2.2 New exported symbols

| Symbol | Kind | Contract |
|---|---|---|
| `PIN_CHECK_DEFAULTS` | frozen object | `{ enabled: false }` |
| `DERIVATIVE_STOP_DEFAULTS` | frozen object | `{ enabled: false, rounds: 2 }` |
| `parsePinCheckConfig(text)` | pure, total | `{ config, sectionMalformed, invalidKeys }` |
| `parseDerivativeStopConfig(text)` | pure, total | same shape |

Both are direct structural clones of the shipped `parseLearningsConfig` precedent: a local
`degraded(sectionMalformed)` closure returning the frozen defaults with `invalidKeys: []`;
`text == null` ⇒ `degraded(false)`; `JSON.parse` in a `try` whose `catch` ⇒ `degraded(false)`;
a missing top-level block ⇒ `degraded(false)`; a present-but-not-plain-object block ⇒
`degraded(true)`; then **per-key independent** `boolField` / `nonNegativeInt` helpers that push
the offending key onto `invalidKeys` and substitute that key's default alone.

Divergences from `parseLearningsConfig`, both deliberate:

1. `enabled` defaults to `false`, not `true` — these features ship off (REQ C-2).
2. `rounds` validates as a **positive** integer (`Number.isInteger(v) && v >= 1`), not a
   non-negative one: `rounds: 0` would mean "converge after zero flat rounds", i.e. converge
   immediately, which is the exact over-suppression R-2 names. `0` is therefore an invalid
   value that falls back to `2` and is reported in `invalidKeys`.

### 2.3 Two-level descent

A module-private helper does the descent once for both parsers:

```
descendSection(parsed, ["cascade", "pinCheck"]) -> { section, malformed }
```

Walking level by level: a level that is absent ⇒ `{ section: null, malformed: false }` (block
simply not configured); a level that is present but not a plain object ⇒
`{ section: null, malformed: true }`. `malformed` at **any** level is the `sectionMalformed`
this parser reports; it never leaks into the sibling block, satisfying REQ-LOOPECON-08's
independence obligation (a malformed `cascade` block cannot retune `review.derivativeStop`).

### 2.4 Read site and threading

`readLearningsConfigSafely(readFileFn, path)` is reused verbatim — it is already the
never-throwing read of this exact file. `main()` reads the file **once** and hands the same
text to all three parsers, alongside the existing `learningsInjection` read. The parsed
configs are threaded as values; nothing re-reads.

Notices follow the shipped `notices` channel (the run-scoped array in `main()` whose docblock
records that it is additive and never smuggled into a phase row's `detail`). Two ids:

- `NTC-PINCHECK-MALFORMED` / `NTC-PINCHECK-KEYTYPE`
- `NTC-DSTOP-MALFORMED` / `NTC-DSTOP-KEYTYPE`

emitted only when the corresponding parser reports `sectionMalformed` or a non-empty
`invalidKeys`. On the default path (block absent) **no notice is emitted**, which is what keeps
the disabled-state report byte-identical (REQ-LOOPECON-04/07).

---

## 3. M1a — anchor write path: pinned, not built (FSPEC §1.2)

### 3.1 What already exists

`appendApprovalAnchors` is the **sole writer** of the anchor block. It composes, through the
injected `_appendFile` seam, the literal template
`"\nAPPROVAL-HASH: " … "APPROVAL-HASH-NORMALIZED: " … "REVIEWED-COMMIT: " …` followed by
`upstreamStateLines(upstreamState)`, then best-effort `_git(["add", …])` / `_git(["commit", …])`.
It has exactly three call sites: `reviewLoop`'s PASS branch, `cascadeDownstream`'s re-confirm
branch, and the erratum confirmation's own re-anchor branch. `parseApprovalHash` is the sole
reader; `APPROVAL_ANCHOR_LINE` is the recogniser `parseVerdict` uses.

M1a builds none of this. Its obligation is a **regression guard** (DEC-LOOPECON-07).

### 3.2 The census oracle

New test file `pdlc/workflows/__tests__/loopEconomicsAnchorGuard.test.js`. It reads
`pdlc/workflows/orchestrate-dev.js` as bytes and derives the prompt-builder census
structurally:

```
/^(?:export\s+)?(?:async\s+)?function\s+([A-Za-z0-9_]+)\s*\(/   per line
keep names matching /(Prompt|Clause)$/
body = source lines from the declaration to the next top-level function declaration
```

Three conjuncts, each independently falsifying:

1. **Set equality on the census.** The derived name set equals a hand-transcribed frozen
   literal of **30** names, pinned in the test file (`planLintFeedForwardClause`,
   `headingFeedForwardClause`, `nearestHeadingMissClause`, `branchPinClause`, `skeletonClause`,
   `resumeClause`, `continuationClause`, `groundingClause`, `reviewerPrompt`, `optimizerPrompt`,
   `creatorPrompt`, `erratumAuthorPrompt`, `upstreamHeadClause`, `erratumConfirmPrompt`,
   `erratumRestatementPrompt`, `findingGrammarClause`, `erratumSupersetClause`,
   `cascadeConfirmPrompt`, `implementPrompt`, `waveImplementPrompt`, `propertiesTestPrompt`,
   `harvestPrompt`, `advisoryDistilPrompt`, `createPrPrompt`, `rebasePrompt`, `dodVerifyPrompt`,
   `dodReVerifyPrompt`, `dodDocRemediatePrompt`, `dodRemediatePrompt`, `dodRoutedAwayClause`)
   plus this feature's `pinCheckPrompt`. Set equality, never containment: a builder **added**
   without being covered reds, and a builder **deleted** reds too.
2. **Zero anchor tokens.** No builder body contains any of the literals `APPROVAL-HASH`,
   `REVIEWED-COMMIT`, `UPSTREAM-STATE`. This is verified true of HEAD today, which is exactly
   why it is a pin: the absence is the property, and the assertion is the thing that keeps it.
3. **Sole writer.** The literal `"\nAPPROVAL-HASH: "` template occurs exactly once in the
   module, inside `appendApprovalAnchors`, and is passed to `_appendFile` — never to `_agent`.

A behavioural conjunct completes it: `appendApprovalAnchors` invoked with scripted
`_hashFile` / `_git` doubles writes the hash the seam returned **at call time**, and a
`REVIEWED-COMMIT` equal to `_git(["rev-parse","HEAD"])`'s stdout at call time. No caller-supplied
"previous" value can reach the file.

The oracle deliberately does **not** grep SKILL.md files: those three sentences are out of
scope (REQ NG-2) and the conditional path that would reach them is unreachable from this module.

---

## 4. M1b — dispatch-time re-derivation (FSPEC §1.3)

### 4.1 The defect, precisely

`deriveUpstreamState(target, mintedHashes)` derives `upstreamState` from **live disk** via
`erratumDocHash` (which is `probeDocument`-or-`hashFileFn` over the current bytes), and
separately reports `movedSinceMinted` against the mint-time snapshot from
`snapshotErratumDocs()`. That mint-time snapshot is legitimate — it is drift *detection*, and
DEC-ERR-03's whole point.

The defect is downstream of it. In the erratum round, `upstreamState` is derived once, **before
the author dispatch**, and the same array is then reused as the confirmers' `confirmUpstreamState`
(`let confirmUpstreamState = upstreamState;`). `erratumSupersetClause` renders it into
agent-visible text under the header *"The upstream documents, at their current version as of
this dispatch"*. Between the author dispatch and the confirmer dispatch the author's own edit
has landed and a sibling erratum round may have moved the chain — so the confirmers are shown a
value that is a **snapshot quoted as current**. That is the R-5 shape: 54 Low findings, no edit
ever owed.

### 4.2 The change

One assignment. The confirmers' state is re-derived from disk **immediately before the first
`dispatchConfirmers` call**:

```
const { upstreamState: confirmState } = await deriveUpstreamState(target, null);
let confirmUpstreamState = confirmState;
```

`mintedHashes` is passed as `null` here on purpose: at this point the question is not "did
upstream move since the item list was minted" (already answered and already noticed on the
author side) but "what is upstream, now, as I construct this dispatch".

Everything else in the flow is untouched and is **pinned by test**:

- the post-return drift check that compares `deriveUpstreamState(target, null)` against
  `confirmUpstreamState` and re-dispatches once at the next derived round index
  (confirmation-window freeze) keeps its exact behaviour;
- the anchor written on approval keeps taking its `upstreamState` from `confirmUpstreamState`,
  so the anchor now records the state the confirmers were actually shown — self-consistency
  (DEC-LOOPECON-02);
- `cascadeDownstream` already re-derives per downstream document immediately before its own
  dispatch (`const { upstreamState } = await deriveUpstreamState(downstream, null);`). This is
  correct today and gets a pin, not a change.

`erratumSupersetClause`, `upstreamHeadClause` and `cascadeConfirmPrompt` keep byte-identical
grammar. Only the values change, and only when disk actually moved.

### 4.3 Falsification

`pdlc/workflows/__tests__/loopEconomicsAnchorFreshness.test.js`. A scripted probe/hash double returns hash
`A` for the upstream doc on the first read and hash `B` on every read after the author dispatch.
Assertion: the confirmer prompt text contains `B`, never `A`. Mutation proof: reverting §4.2's
assignment reds this and nothing else.

---

## 5. M1c — DoD round index from disk (FSPEC §3)

### 5.1 New pure function

```
deriveDodRoundIndex(basenames, feature) -> number
```

Total and synchronous, taking no seam — the same discipline as `deriveRoundWindow`. Over the
supplied basenames it matches `CODE_REVIEW-{feature}-v{N}.md` with `N` a run of decimal digits,
takes `max(N) + 1`, and returns `1` when no basename matches. A non-array input, a
non-numeric suffix, or a file for a different feature contributes nothing. `feature` is
matched literally, and regex metacharacters in it are escaped.

### 5.2 Wiring in `dodVerifyLoop`

`dodVerifyLoop` gains one injected seam, `_listFiles = defaultListFiles`, threaded from
`main()`'s `listFilesFn` exactly as `_readFile` is threaded from `readFileFn` today. Inside the
loop body, before the verify dispatch:

```
const version = await deriveVersionForRound();   // awaited: the seam's impl is async
```

where `deriveVersionForRound` calls `_listFiles(\`docs/${feature}\`)` inside a `try` and returns
`deriveDodRoundIndex(listing, feature)`; on throw, non-array return, or empty listing where a
CODE_REVIEW is nonetheless expected, it returns the pre-M1c value `iteration` (fail-open to
today's behaviour, FSPEC §7.1).

`version` — not `iteration` — is then interpolated into `dodVerifyPrompt(feature, version)`,
`dodReVerifyPrompt`, the `codeReviewPath` literal, and each remediation/log string that names a
CODE_REVIEW round. `iteration` keeps its one remaining job: bounding the loop against
`DOD_MAX_ITERATIONS`. The two were conflated; they are now separated.

This is derivation from disk *per round*, so the resumed/re-run case works without any state:
round 2 lists `…-v1.md` and derives `2`; a resumed run against a branch already carrying `v1`
and `v2` derives `3` on its first iteration instead of colliding on `v1`.

### 5.3 Falsification

`pdlc/workflows/__tests__/loopEconomicsDodRoundIndex.test.js`: the pure function over crafted listings
(empty, `v1`, `v1`+`v3` ⇒ `4`, other-feature noise, `v10` vs `v9` ordering — string sort would
say `9`, numeric says `11`), plus a `dodVerifyLoop` run whose `_listFiles` double already
reports `v1`/`v2` and whose captured prompt must name `v3`, and a run whose `_listFiles` throws
and which must fall back to `iteration`.

---

## 6. M1d — finding identity and carried/new accounting (FSPEC §2)

### 6.1 Reuse of the one finding grammar

`parseConfirmationFindings(text)` is already channel-agnostic ("an agent's response string and
the cross-review file's contents parse identically"), fence-aware via `scanLines`, splits on the
first four delimiters only, and reports unparseable lines in `malformed` rather than dropping
them. It is reused as-is. No second grammar is introduced (DEC-LOOPECON-09).

### 6.2 New pure functions

| Symbol | Contract |
|---|---|
| `normalizeFindingText(text)` | FSPEC §2.2's normalisation |
| `findingIdentityKey(finding)` | the §2.1 triple, serialised |
| `classifyRoundFindings(prev, curr)` | `{ carried, added, resolved }` |

`normalizeFindingText` applies, in order: coerce non-string to `""`; strip a leading/trailing
whitespace run; delete round/version tokens matching `/\b(?:round|v)\s*\.?\s*\d+\b/gi`; delete
hash-shaped tokens matching `/\b(?:sha256:)?[0-9a-f]{7,64}\b/gi`; collapse every internal
whitespace run to a single space; lowercase. Nothing else is stripped — in particular the
section anchor and severity components are never touched (FSPEC §2.2's last paragraph).

`findingIdentityKey` returns `` `${severity}\x00${section.trim()}\x00${normalizeFindingText(text)}` ``.
`\x00` is the separator because it cannot occur in a parsed `FINDING:` field, so two distinct
triples can never collide by concatenation. Severity and section are compared **exactly**
(severity is already canonicalised by `parseConfirmationFindings`' closed set); only the free
text is normalised.

`classifyRoundFindings(prev, curr)` builds a `Set` of `prev`'s keys, then partitions `curr`
into `carried` (key present in `prev`) and `added` (key absent), and reports `prev` entries with
no match in `curr` as `resolved`. It is a set operation over keys, so the result does not depend
on the order findings were recorded in either round (FSPEC §2.3's order-independence).

### 6.3 Staleness dedup (REQ-LOOPECON-02, FSPEC §2.4)

A finding classified `carried` mints **no** new entry in the round's finding list; the existing
open item from the earlier round remains the single record. A finding classified `added`
always mints a fresh entry. Dedup therefore collapses only repeats of an already-open item and
can never collapse a genuinely new one — the over-suppression R-3 names is structurally
impossible, because collapse is keyed on an exact-match triple (DEC-LOOPECON-06).

The dedup applies to the round's *accounting*; it does not edit any cross-review file on disk,
and nothing about the append-only review history changes.

---

## 7. M2 — pin-cascade round (FSPEC §4)

### 7.1 Where it attaches

`cascadeDownstream({ phaseId, target, editedIn })` currently walks `erratumDocTypesBelow(target)`
and, for each downstream document whose recorded `UPSTREAM-STATE` row for `target` no longer
matches `targetHash`, immediately dispatches a full delta re-confirmation round.

M2 splits that single pass into **collect** then **dispatch**:

- **Pass 1 (collect).** Unchanged predicates: skip when the doc is not on the branch, when the
  owning phase has no reviewers, when there is no approving record, when the row already
  matches, when the lifetime cap is reached (that notice and its `continue` are byte-identical).
  Surviving downstreams become candidate records carrying `{ downstream, docPath, docHash,
  record, row, window, round, paths, upstreamState }`. `upstreamState` is still derived
  per-candidate by `deriveUpstreamState(downstream, null)` at this point.
- **Pass 2 (dispatch).** When `cascade.pinCheck.enabled` is `false` — the default — pass 2
  iterates the candidates in collection order and runs exactly the code that used to run inline.
  The dispatch stream is byte-identical to pre-M2 (REQ-LOOPECON-04); §9 proves it with a
  committed fixture, not with an assertion.

### 7.2 Eligibility (FSPEC §4.3)

A candidate is pin-check-eligible iff **both**:

1. `record.hash === docHash` — the approval record's own-bytes anchor equals the document's
   current on-disk hash, i.e. its own bytes have not moved since the approval. `record.hash` is
   `tier1ApprovalRecord`'s unanimity-checked value; an UNEVALUABLE or disagreeing anchor yields
   `null`, which can never equal a real hash, so such a document is never eligible.
2. It is in the walk at all, which already means at least one recorded `UPSTREAM-STATE` row for
   `target` moved.

Ineligible candidates take the §7.1 pass-2 path unchanged. There is no second signal and no
heuristic: an own-bytes-changed document always gets a full review.

### 7.3 The batched dispatch

New builder `pinCheckPrompt({ feature, target, upstreamPath, targetHash, docs })` where `docs`
is the eligible list. It states, per document, the doctype, path, the specific upstream pin
that moved (old `row.hash` → current `targetHash`), and asks the single question FSPEC §4.5
grammars:

```
PIN-CHECK: {DOCTYPE}: PASS | FAIL
```

The batch is dispatched to the **union of reviewer roles** across the eligible documents'
owning phases (`PHASE_DISPATCH[ERRATUM_PHASE_BY_DOC_TYPE[downstream]].reviewers`), one
`agentFn` call per role, in parallel through the existing `parallelFn` seam. It is dispatched
through `agentFn` directly rather than `wrappedDispatch` because no artifact is produced and
there is nothing for the write-verification wrapper to verify.

### 7.4 Verdict parsing

New pure function `parsePinCheckVerdicts(text)` → `Map<docType, "PASS"|"FAIL">`. Fence-aware via
`scanLines`, matching `/^PIN-CHECK:\s*([A-Z]+):\s*(PASS|FAIL)\s*$/` on the trimmed line —
`PASS`/`FAIL` case-sensitive, no third token, one line per document. A duplicated line for one
doctype resolves to `FAIL` (disagreement is not approval). Anything else is not a verdict line.

A document PASSes iff **every** dispatched role's reply carries an explicit `PASS` line for it.
An absent line, a malformed line, or any role's `FAIL` ⇒ `FAIL` (DEC-LOOPECON-03). This mirrors
the shipped rule that a missing or malformed `VERDICT:` is `Needs revision`.

### 7.5 PASS routing (FSPEC §4.6)

`appendApprovalAnchors` is re-invoked with the same call shape as the existing re-confirm site:
the document's own current `docHash`, its normalised hash, `headCommitSha(gitFn)`, and
`upstreamState.map((e) => ({ docType: e.docType, hash: e.hash }))` from the freshly derived
state. No cross-review file is written, `window.startIndex` is not consumed, and no round is
recorded — so neither `MAX_REVIEW_ROUNDS` nor `MAX_LIFETIME_ROUNDS` moves (DEC-LOOPECON-04;
DEC-TERM-02: a staleness-only round is not a review round). One `notices` line per PASSed
document reports the re-anchor.

### 7.6 FAIL routing (FSPEC §4.7)

The candidate falls through to §7.1 pass 2's ordinary re-confirmation path — the same dispatch
it would have received with pin-check disabled, at the same derived round index, with the same
prompt bytes. A `FAIL` therefore costs one pin-check dispatch and then behaves exactly as
today; it never approves anything and never skips anything.

---

## 8. M3 — derivative-stop (FSPEC §5)

### 8.1 Evidence channel

Derivative-stop consumes findings, and ordinary reviewer prompts do not emit `FINDING:` lines
today (only the erratum/cascade confirmation prompts carry `findingGrammarClause()`).
`reviewerPrompt` therefore gains one optional parameter, `findingGrammar = false`, which appends
`findingGrammarClause()` when true. It is set true **iff** `review.derivativeStop.enabled` is
true. With the key off — the default — `reviewerPrompt`'s output is byte-identical to HEAD
(REQ-LOOPECON-07). See DEC-LOOPECON-09.

Each round's finding list is `parseConfirmationFindings` over each reviewer's response, unioned
across reviewers and deduplicated by `findingIdentityKey` (two reviewers filing the same finding
are one finding). `reviewLoop` keeps a per-document `roundHistory` array of
`{ round, findings, malformedCount, verdicts }`, in-memory for the invocation.

### 8.2 Flat-round predicate (FSPEC §5.3, as amended)

A round is **flat** iff all of:

1. **No new ≥Medium finding.** No finding classified `added` by
   `classifyRoundFindings(previousRound.findings, thisRound.findings)` has severity `High` or
   `Medium`. A new **Low** finding does **not** break flatness — DEC-TERM-01 keys convergence on
   "no new ≥Medium finding for N consecutive rounds", and a stream of new Lows is exactly the
   noise the derivative signal is meant to see through. Carried findings of any severity do not
   break flatness either.
2. **No open High.** No finding in the round, carried or new, has severity `High`.
3. **Evaluable.** Every reviewer's verdict parsed readably (`verdictReadable`), no reviewer's
   verdict reports `high > 0`, and `parseConfirmationFindings` reported zero `malformed` lines
   for any reviewer.
4. **Not silently empty.** If any reviewer's parsed verdict counts sum to more than zero while
   the round's parsed finding set is empty, the round is **unevaluable**, not flat. This is the
   one guard against the vacuous flat round: a reviewer who reported findings in its verdict
   trailer but whose `FINDING:` lines did not parse must never look like agreement
   (DEC-LOOPECON-06, FSPEC §7.1's fail-open direction).

Conjunct 2 is the open-High override and is evaluated independently of conjunct 1, so a High
carried forward from an earlier round keeps every subsequent round non-flat for as long as it
is still filed (FSPEC §5.7).

Round 1 has no predecessor; `classifyRoundFindings([], round1.findings)` classifies every
finding as `added`, so round 1 is flat only if it recorded no new ≥Medium finding at all.

### 8.3 Convergence and outcome

#### 8.3.1 The reachability hole, and the gate that closes it

`reviewLoop`'s standing convergence gate is
`const gatePass = isPassResult(verdict1) && isPassResult(verdict2);`, and `isPassResult` returns
true when `parsed.malformed !== true && parsed.high === 0` — the **high-only relaxation**
(operator decision 2026-08-08, `docs/_decisions/DECISIONS-review-severity-bars.md`), under which
a `Needs revision` filed over Mediums alone still converges.

That bar strictly dominates §8.2. Every flat round has `high === 0` on every reviewer (§8.2
conjunct 3), so **every flat round already passes `gatePass` and converges on the spot** — the
loop can never reach a second consecutive flat round, `derivativeStopReached` can never fire,
and `converged-by-derivative-stop` is unreachable dead code. This was found by T-09's red-test
work; it is a design defect in §8.2/§8.3 as first written, not an implementation slip.

**Resolution (coordinator decision, DEC-LOOPECON-10).** When `review.derivativeStop.enabled` is
`true`, the high-only shortcut is **suspended for that document's review loop**. In enabled mode a
round converges iff either:

- **(a) literal approval** — every reviewer's verdict is readable and its verdict *string*
  approves under the existing verdict grammar, i.e. the pre-relaxation reading; or
- **(b) derivative stop** — `derivativeStopReached(history, rounds)` fires.

With the key `false` — the default — the high-only bar applies exactly as today.

#### 8.3.2 The symbol T-15 touches

`isPassResult` itself is **not** modified: it has seven call sites, five of which
(`resolveReviewState`'s tier-2 predicate, `checkConverged`'s non-approving detail, the tier-1
approval record, the erratum re-confirm gate, the confirmer `approving` field) are outside this
feature's scope and must keep the high-only reading. Changing it in place would silently retune
the erratum channel and the phase gate's approval search.

Instead, T-15 adds a module-scope gated wrapper and changes **one** call site — `reviewLoop`'s
`gatePass` at the review-gate step:

```
function loopPassResult(parsed, { strictVerdict = false } = {}) {
  if (!parsed) return false;
  if (strictVerdict) return parsed.malformed !== true && isPass(parsed.verdict);
  return isPassResult(parsed);
}
```

`isPass` is the existing verdict-string predicate `isPassResult` already delegates to on its
first limb, so limb (a) reuses the shipped grammar rather than introducing a second one. The
`malformed !== true` guard is carried across unchanged: a malformed trailer still fails closed
(and still gets the existing one-shot Haiku `recoverVerdict` attempt first, untouched).

`reviewLoop` becomes:

```
const strictVerdict = derivativeStop.enabled === true;
const gatePass = loopPassResult(verdict1, { strictVerdict })
              && loopPassResult(verdict2, { strictVerdict });
```

**Flag-off byte-identity.** With `strictVerdict === false`, `loopPassResult` is
`isPassResult` by construction — same operands, same short-circuit order, same result for every
input. No prompt byte, no dispatch, no report string and no convergence decision differs from
HEAD, which is what REQ-LOOPECON-07 requires and what the §9 baseline fixtures prove. The
2026-08-08 experiment is undisturbed on the default path.

#### 8.3.3 Interplay

Enabling the key changes the loop's shape, deliberately: **a flat round no longer auto-converges.**
It is recorded in `roundHistory` and accumulates toward the derivative stop, and the loop keeps
dispatching unless a literal approving verdict lands first. So in enabled mode a document exits
the loop by one of exactly three routes — literal approval, derivative stop after
`review.derivativeStop.rounds` consecutive flat rounds, or the pre-existing round/lifetime caps —
and `converged-by-derivative-stop` is reachable on the second.

The two limbs are evaluated in that order and (a) wins: a round that is both a literal approval
and a flat round records the ordinary `Approved (...)` detail, not `converged-by-derivative-stop`.
The distinct outcome is reserved for documents that actually stopped producing new substance
without ever getting a clean approving verdict.

#### 8.3.4 Outcome recording

When (b) fires, `reviewLoop` stops dispatching and returns
`{ converged: true, derivativeStop: true, iterations, … }`. `converge()` reads
`loop.derivativeStop` and records the phase row detail as
`converged-by-derivative-stop (${loop.iterations} iterations)` instead of
`Approved (${loop.iterations} iterations)`. The `✅` glyph is kept — this is a success outcome,
not a halt — but the detail string is distinct and never substituted for an approval verdict
(FSPEC §5.5). `checkConverged` is untouched: `loopResult.converged !== false` returns early, so
no POSTMORTEM is written and no halt is raised.

Approval anchors are appended on this path exactly as on the ordinary approval path; the
document's approval is real, it was simply reached by a derivative signal rather than by a
unanimous approving verdict.

### 8.4 Lifetime accounting (FSPEC §5.6, REQ C-4)

Rounds consumed while accumulating toward derivative-stop are ordinary rounds: they write
cross-review files, they advance the derived round index, and they count toward
`MAX_LIFETIME_ROUNDS` exactly as today. Nothing resets, pauses or exempts the lifetime counter.
Derivative-stop is only ever a way to stop **earlier** than the cap.

This section is **unaffected by the §8.3 amendment.** Suspending the high-only shortcut changes
*which* rounds converge, not how rounds are counted: a flat round that previously converged and
now continues is still one ordinary round against `MAX_REVIEW_ROUNDS` and
`MAX_LIFETIME_ROUNDS`, and the caps remain the outer bound in both modes. The one operator-visible
consequence is on the enabled path only — a document that would have converged on Mediums alone
may now consume additional rounds before stopping, bounded by the unchanged caps and by
`review.derivativeStop.rounds` (DEC-LOOPECON-10).

The three lifetime-related constants (`MAX_REVIEW_ROUNDS = 5`, `MAX_LIFETIME_ROUNDS = 15`,
`MAX_ERRATUM_FOLLOWUP_ROUNDS = 1`) are not changed (REQ NG-4), and their literal declarations
are pinned by an existing-value assertion in the derivative-stop test file.

---

## 9. Byte-identity proof (FSPEC §7.4, REQ C-2)

The disabled-state claims (REQ-LOOPECON-04, -07) are proven against a **committed fixture
baseline captured from the merge base**, not by same-branch assertions — the
`learningsBaselineGuard.test.js` precedent, whose falsifying anchor is a hand-transcribed digest
literal per `{caseId}`, asserted against **both** the recomputed file digests **and**
`MANIFEST.json`, with the `{caseId}` key set compared by **set equality**.

- Fixtures: `pdlc/workflows/__tests__/fixtures/loop-economics-baseline/{caseId}/{dispatchIndex}.txt`
  plus `MANIFEST.json`, captured from the merge-base worktree by the shipped
  `scripts/capture-learnings-baseline.mjs` harness, driven by an uncommitted one-off script, with
  the merge-base sha recorded in the guard's header comment.
- Case ids: `CASCADE-DOWNSTREAM-REDISPATCH` (a cascade walk over two stale downstream documents,
  pin-check key absent) and `PHASE-T-REVIEW-ROUNDS` (two reviewer dispatches over a review round,
  derivative-stop key absent).
- Guard: `pdlc/workflows/__tests__/loopEconomicsBaselineGuard.test.js`, hand-transcribed
  `EXPECTED_DIGESTS`, set equality on case ids, and the three-step mutation proof (flip one byte;
  delete one case directory; add a spurious case) transcribed in the task's completion note.

Because the fixtures must record **pre-M2/M3** bytes, capture and the guard land **before** any
M2 or M3 production task (PLAN batch 1).

The fixtures pin dispatch *bytes*. The disabled-mode **decision** identity introduced by §8.3.2 —
`loopPassResult(p, { strictVerdict: false }) === isPassResult(p)` — is pinned separately, by a
table-driven assertion in `loopEconomicsDerivativeStop.test.js` over the representative parsed
verdicts (approving; `Needs revision` with `high: 0` and Mediums; `high > 0`; `malformed: true`;
`null`), so the 2026-08-08 high-only behaviour is falsifiable on the default path independently of
the fixture corpus.

---

## 10. Seams and test doubles

Every injected IO/git/agent seam call added by this feature is `await`ed. The production
implementations are async; the test doubles are sync; `await` over a sync value is correct and
is the shipped convention.

| Seam | Added use |
|---|---|
| `_listFiles` | `dodVerifyLoop`'s round-index derivation (§5.2) |
| `_readFile` | one additional read of `.claude/pdlc.config.json` — none: the existing single read is reused (§2.4) |
| `_probeDoc` / `_hashFile` | via `erratumDocHash` in the re-derivation (§4.2) and the pin-check eligibility hash |
| `_appendFile` / `_git` | via `appendApprovalAnchors` on the pin-check PASS path (§7.5) |
| `_agent` / `_parallel` | the batched pin-check dispatch (§7.3) |

No test in this feature touches live git or a live filesystem. Doubles follow the two shipped
patterns:

- `loopQueueDriver.test.js`'s `baseSeams(overrides)` — every IO/agent/git call scripted, with
  `_git: async () => ({ ok: true, stdout: "", stderr: "" })` as the trivial default.
- `__tests__/helpers/loopDoubles.js`'s `makeGitFn(script)` — argv-keyed responder that skips a
  leading `-C dir` / `-c key=value` pair when deriving the key and records every argv on `.calls`.

The `_git` stub is **mandatory in every new test file** (commit `f325016`: a seam left at its
real default shelled out to live git and committed 46 junk `chore(queue)` commits). Each new
test file asserts, in an `afterEach`, that its `makeGitFn` recorded no `commit`/`push` argv it
did not script — a live-default leak reds immediately rather than silently writing to the repo.

---

## 11. Error handling — the fail-open matrix

| Failure | Resolution | FSPEC |
|---|---|---|
| `.claude/pdlc.config.json` absent / unreadable | both parsers `degraded(false)`; features off | §7.3 |
| File present, not JSON | `degraded(false)`; features off; no notice | §7.3 |
| `cascade` present but not an object | `sectionMalformed: true` for pin-check only; `review.derivativeStop` unaffected | §4.1, §7.3 |
| `pinCheck.enabled: "yes"` | key on `invalidKeys`, defaults to `false`; sibling keys unaffected | §4.1 |
| `derivativeStop.rounds: 0` or `-1` or `"2"` | key on `invalidKeys`, defaults to `2` | §5.1, §2.2 |
| `_listFiles` throws in `dodVerifyLoop` | version falls back to `iteration` (pre-M1c behaviour) | §7.1 |
| Pin-check reply absent / unparseable / partial | that document is `FAIL` ⇒ full re-confirmation | §7.2 |
| Pin-check dispatch throws | every eligible document is `FAIL` ⇒ full re-confirmation | §7.1 |
| `appendApprovalAnchors` fails on the PASS path | existing behaviour: emit, `appended:false`, no approval recorded | §1.2 |
| A round's `FINDING:` lines malformed | round is unevaluable ⇒ not flat ⇒ no derivative-stop | §7.1 |
| `deriveUpstreamState` returns `[]` (no upstream) | unchanged: `upstreamStateLines([])` writes nothing, grandfathered | §1.2 |

Nowhere does a failure resolve toward silently approving or silently skipping a document.

---

## 12. Test strategy

| Level | What |
|---|---|
| Pure-function unit | `parsePinCheckConfig`, `parseDerivativeStopConfig`, `deriveDodRoundIndex`, `normalizeFindingText`, `findingIdentityKey`, `classifyRoundFindings`, `parsePinCheckVerdicts`, `derivativeStopReached` — total, no seams, table-driven |
| Source oracle | `loopEconomicsAnchorGuard.test.js` (§3.2) |
| Driver-level | `reviewLoop` / `cascadeDownstream` / `dodVerifyLoop` exercised through fully scripted seams, asserting captured prompt bytes and seam call sequences |
| Baseline guard | `loopEconomicsBaselineGuard.test.js` (§9) — committed fixtures, transcribed digests |
| Property | order-independence of `classifyRoundFindings`; totality of both parsers over arbitrary JSON (`fast-check`, already a devDependency) |

Coverage: the existing `npm run test:coverage` gate applies unchanged — aggregate branches ≥ 85,
lines/functions/statements ≥ 90, and stage 2's per-file `--branches 85` on every included module
including `orchestrate-dev.js`. Every branch added here is reachable from a driver-level or
pure-function test; no `/* c8 ignore */` is introduced.

---

## 13. Traceability — FSPEC → TSPEC

| FSPEC | TSPEC |
|---|---|
| §1.1 anchor grammar (unchanged) | §3.1 |
| §1.2 engine self-write, pinned not built | §3.1, §3.2 |
| §1.3 dispatch-time re-derivation | §4.1, §4.2 |
| §1.4 no transcription-shaped instruction | §3.2 conjunct 2 |
| §2.1–§2.3 identity triple, normalisation, carried/new | §6.2 |
| §2.4 dedup feed | §6.3 |
| §3.1–§3.2 DoD round index from disk | §5.1, §5.2 |
| §4.1 pin-check config gate | §2.2, §2.3 |
| §4.2 disabled ⇒ byte-identical | §7.1, §9 |
| §4.3 batch eligibility | §7.2 |
| §4.4 batching | §7.3 |
| §4.5 verdict grammar | §7.4 |
| §4.6 PASS routing | §7.5 |
| §4.7 FAIL routing | §7.6 |
| §5.1 derivative-stop config | §2.2 |
| §5.2 disabled ⇒ identical decision | §8.1, §8.3.2, §9 |
| §5.3 flat round (as amended) | §8.2 |
| §5.4 convergence predicate | §8.3.1–§8.3.3 (enabled-mode gate, DEC-LOOPECON-10) |
| §5.5 outcome recording | §8.3.4 |
| §5.6 lifetime interaction | §8.4 |
| §5.7 never overrides open High | §8.2 conjunct 2 |
| §7.1 fail-open direction | §11 |
| §7.2 unparseable pin-check verdict | §7.4 |
| §7.3 config fail-open level | §2.3, §11 |
| §7.4 byte-identity method | §9 |
