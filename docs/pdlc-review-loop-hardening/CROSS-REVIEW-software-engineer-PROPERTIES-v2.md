# Cross-Review: software-engineer — PROPERTIES

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-review-loop-hardening/PROPERTIES-pdlc-review-loop-hardening.md` v1.1
**Date:** 2026-07-30
**Iteration:** 2
**Scope:** Delta re-review of PROPERTIES v1.0 (`3790f56`) → v1.1 (`da89ea2..95529be`), technical lens
only — implementability, falsifiability, and compatibility with the approved REQ v1.6 / FSPEC v1.8 /
TSPEC v1.7 / PLAN v1.4 interfaces. Upstream documents are not reopened. Unchanged sections already
accepted in v1 are not re-litigated. Citation/`file:line` drift is out of scope (R-6). Cost and the
TSPEC §8.1/§8.2 upward report are settled and not revisited.

**Verification basis (DC-02).** Everything below was measured at branch HEAD `95529be`:
`pdlc/workflows/orchestrate-dev.js` (`reviewLoop`'s parameter list, the postmortem dispatch,
both `return` sites, `checkConverged`, `recordPhase`, `:1863–1870`);
`pdlc/workflows/__tests__/helpers/driftGenerators.js` (`BYTES_FLOOR`, the `"bytes"` arm);
`pdlc/workflows/__tests__/helpers/` and `fixtures/` directory listings; TSPEC §2.5, §3.7, §4.5,
§7.1, §8.5; PLAN §7.3, §9.2 item 3, §11.5 `N-b`, §4's `RLH-05` sub-groups and batch table.
Full suite re-run in the background: **1038 passed / 1 failed / 70 skipped, 36 suites, 335.918 s**,
single red the foreign intentional `documentOracles.test.js › AT-22 [red-until-L-06]` — the v1.1
baseline reproduces exactly.

---

## Verification of round-1 findings

| ID | Sev (v1) | Disposition | Evidence |
|----|----------|-------------|----------|
| F-01 | High | **Resolved** | TSPEC §8.5's rulings table has exactly three rows (alias, returned promise, awaited combinator argument); PLAN §9.2 item 3(c) ends `…, alias (already discharged by (b))`. The four-element space `awaited` / `returned-promise` / `awaited-combinator-argument` / `unclassified` **is** the classifier's real outcome space, the ≥10-per-element floors are satisfiable, and §8.5's own alias instances (`await readFileFn(planPath)`, `await checkFileFn(reqPath)`) classify as `awaited`, so no correct aliased site can red `RLH-AT-19`. See **F-12** and **F-15** for two defects introduced *inside* the rebuilt table |
| F-02 | High | **Resolved for the round-window identity; partially for the dispatch bound** | `orchestrate-dev.js:598` `return { converged: false, iterations: 5, … }` (TSPEC §7.1 edit 5) is a genuinely different site from the window derivation, so `endIndex - startIndex + 1 === loopResult.iterations` is two observables, not one value read twice, and an off-by-one on either side dies. §8.5 item 3 honestly records the residue (both sites could be wrong together). `PROP-EPISODE-01`'s `I` is likewise independent; its `B` is **not** — see **F-16**. The third surface is misnamed — see **F-13** |
| F-03 | High | **Resolved** | TSPEC §4.5 reads *"the whole phase would then be bounded by 6, not 36"*, confirming 36 is a per-phase bound. Maximal-run segmentation of an episode sequence by phase is total, disjoint and well-defined for any sequence, and matches "one phase entry" (a re-entry gets a fresh budget). Conjunct (iii) no longer contradicts (i): (i) is per segment, the multi-phase total is stated as the sum and explicitly not bounded by 36. New ≥10 multi-segment floor present. Caveat at **F-14** |
| F-04 | High | **Resolved** | Floor is over `artifactSet`, `phase`, `round`, `mode`; `invocation` gets a re-entry-consumes-the-same-budget conjunct, §5.3's `PROP-EPISODE-01` (2nd) is the matching subject mutation, §8.5 item 2 records the direct statement as unwritable. One leftover sentence contradicts it — **F-17** |
| F-05 | Medium | **Resolved** | Measured: `driftGenerators.js:423` `const BYTES_FLOOR = 64;`; the `"bytes"` arm (`:453–457`) returns `[]` at or below 64 bytes and one `slice(0, 64)` rung above. §2.3's "Applies to" lists are gone, §2.3's table, §3.1's `Used by` cell, §4.2's `PROP-HASH-01`/`PROP-STALE-01` `Shrink.` lines and §8.2's table all now say no-op. File-local ladders stated as the mechanism for every property |
| F-06 | Medium | **Resolved** | TSPEC §2.5's G-INV sentence enumerates exactly five — *forced, unforced-with-no-candidate, unforced-not-approving, `STALE`, `UNEVALUABLE`* — plus the open clause. One owner, one count, restated identically in §2.5, §4.3, §6.5, §7.2. §5.3's `PROP-GINV-01` (3rd) is now a subject mutation (step G inside the `STALE` branch) |
| F-07 | Medium | **Resolved** | §3.2 withdraws regex literals and nested combinator calls from D8's draw list, bounds the masked pool to strings/templates/comments, and makes a lexically ambiguous fragment expect `unclassified` rather than "no site found" |
| F-08 | Medium | **Resolved** | §4.4 and §7.2 now say *total partition of the scan set `S`*, discharging the obligation as a **cover**; §8.4 residual 4 names the shipped unsound exemption. Both line numbers verified: `orchestrate-dev.js:1866` is `batch.map((task) =>`, `:1867` is `agentFn(` |
| F-09 | Low | **Partially resolved** | `fixtures/` holds **two** ✓. `helpers/` holds 13 entries but only **12 are modules** — `bin/` is a directory. See **F-18** |
| F-10 | Low | **Resolved** | §2.5 states the wall clock as machine- and load-dependent and defers to PLAN §4.1's 300 s halt. Re-measured here at 335.918 s with the four counts identical |
| F-11 | Low | **Resolved** | §8.3 now says "the row **reserved for**" and states as measured that `docs/pdlc-authoring-contract/` does not exist on disk |

**Structural changes checked.** `PROP-RESOLVE-01` at L2 is correct against PLAN §11.5 `N-b`
(*"non-exported, and no test may name it"*) and PLAN §4's `RLH-24` row (*"Drives the search through
`main()` with injected seams (L2, §7), so it needs no exported identifier"*); the sixteen-vector
enumeration survives intact (§4.3 asserts all 16 by set equality, not a count), which is the value
pm-review named. §7.1's Level column yields exactly **ten L1 / seven L2 / one L3**, 17 properties and
18 ids — the recount is right.

**`PROP-TRAILER-01`'s window, re-derived independently.** PLAN §4: `RLH-05` is batch 3 and its
sub-group **(f)** is the five record parsers (`parseApprovalHash`, `parseRevisionComplete`,
`parseResolvedMarker`, `extractRecommendation`, `parseForcePhases`); `RLH-21` is likewise batch 3
(PLAN §4.3's batch table). The catalogue the property closes over is created by `RLH-05(b)`, also
batch 3. Written batch 3, greened batch 3 ⇒ permitted red is the empty set of intervening batches,
green from batch 3. **The document's derivation reproduces.** The pacing row's *batches 3–6* would
have been a co-location artefact. One consequence is under-stated — **F-20**.

**Is §0 load-bearing?** **No.** Every disposition row in §0 has an owning section that states the
substance independently: SE F-01 → §4.4; F-02 → §4.1(iii), §4.3, §6.5, §8.5 item 3; F-03 → §4.3;
F-04 → §4.3, §8.5 item 2; F-05 → §2.3, §8.2; F-06 → §4.3, §5.4; F-07 → §3.2; F-08 → §4.4, §8.4;
F-09/-10/-11 → §6.1, §2.5, §8.3; PM F-01 → §4.1; PM F-03 → §4.2; PM F-07 → §1.3, §4.2, §7.1;
PM Q-02 → §8.4 residual 3; PM Q-03 → §8.1. §0 is a map, not an owner. The document may keep it.

---

## New findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-12 | **High** | Local | §4.4's decision test for `returned-promise` states ruling 2's forward half as *"the returned value is awaited by the caller"*; PLAN §9.2 item 3(c) defines it as a **local syntactic** test. As stated it is undecidable by the prescribed walk, on the row with no permitted red | §4.4, §5.3 |
| F-13 | **Medium** | Local | §4.3 and §6.5 name the `recordPhase` double as the capture point for TSPEC §7.1 site 4. `recordPhase` is not a seam of `reviewLoop`; the site-4 prompt reaches the **`_agent`** double | §4.3, §6.5 |
| F-14 | **Medium** | Local | `PROP-EPISODE-01`(i)'s tight equality `dispatches(segment) === (1 + I) × B` is guarded only by "every episode driven past `B`". On a saturated segment that converges early it is **false on a correct subject** | §4.3 |
| F-15 | **Medium** | Local | §4.4 deliberately generates ≥10 fragments both rulings appear to claim, but no artifact states a precedence between rulings 2 and 3, and the property is a round-trip against a hand-authored `expected` | §4.4 |
| F-16 | Low | Local | `PROP-EPISODE-01`'s `B` is measured with the same instrument that produces the left-hand side, so a uniformly wrong cap is invisible; §8.5 records the analogous gap for `MAX_REVIEW_ROUNDS` but not for `B` | §4.3, §8.4, §8.5 |
| F-17 | Low | Local | `PROP-EPISODE-01`'s **Generator** paragraph still says "vary all **five** `EpisodeKey` coordinates independently", contradicting the F-04 fix three paragraphs above it and §8.5 item 2 | §4.3 |
| F-18 | Low | Local | §6.1's "thirteen modules" — measured, `helpers/` holds twelve `.js` modules plus a `bin/` **directory** | §6.1 |
| F-19 | Low | Local | §4.1's `PROP-DIGEST-02` lone-surrogate floor is **≥5**; §5.2's new (3rd) row names "the **≥10** lone-surrogate cases" | §4.1, §5.2 |
| F-20 | Low | Local | §1.3 asserts no property here needs a genuinely new §7.3 row; §7.1's `PROP-TRAILER-01` Row cell reads "**own row**" | §1.3, §7.1 |

---

### F-12 (High) — ruling 2's forward half is stated as a semantic test the prescribed walk cannot make

§4.4's rebuilt decision table:

> | `returned-promise` | TSPEC §8.5 ruling **2** | nearest preceding token is `=>` or `return` (backward half) **and** *the returned value is awaited by the caller* (forward half) — **both**, not either |

PLAN §9.2 item 3(c), verbatim, and this clause is itself the repair for TE `F-01(a)`:

> **backwards**, the nearest non-whitespace token before the call is `=>` or `return`; **and
> forwards**, the first non-whitespace token after the call's matching `)` — found by walking the
> same bracket-depth stack forward to depth zero — is `;`, `,`, `)`, `}` or end of line. Both halves
> must hold. A backward-only test would exempt `() => _agent(a) && other` and
> `return _checkFile(p) || fallback;` … If the forward walk cannot reach a matching `)` at depth
> zero, the site is **unclassified**.

The forward half is a **local syntactic** test that the call is the *entire* body/operand. It is not
a claim about the caller. "The returned value is awaited by the caller" is not decidable at the call
site by a bracket-depth walk — it needs every caller of the enclosing function — and D8's fragments
are synthetic snippets that have no caller at all, so the expectation cannot be authored for them
either.

Three places inherit the wrong statement: the table row itself; §4.4's floor *"≥10 fragments must
satisfy ruling 2's backward half but **not** its forward half, expected `unclassified`"* — which under
PLAN's real forward half is the trivially generable `() => _agent(a) && other` shape and under the
document's is ungenerable; and §5.3's `PROP-AWAIT-01` (4th) row, whose whole subject is the forward
half.

This lands on §7.3's row 1 — green on arrival, **permitted red none, ever** — which is precisely why
F-01 was High.

**Required change.** Restate the forward half as PLAN §9.2 item 3(c) writes it: *the first
non-whitespace token after the call's matching `)`, at depth zero, is `;` `,` `)` `}` or end of
line*, and cite §9.2 rather than paraphrasing it. §4.4's floor and §5.3's (4th) row then describe
generable fragments.

### F-13 (Medium) — `recordPhase` is not a seam of `reviewLoop`

§4.3 (`PROP-WINDOW-01`) and §6.5 both name a third observation surface:

> site 4 the `Iterations (${MAX_REVIEW_ROUNDS} — limit reached)` line in `reviewLoop`'s prompt, which
> the `recordPhase` double captures

Measured at HEAD. `reviewLoop`'s parameter list (`orchestrate-dev.js:531–543`) injects exactly
`_agent`, `_parallel`, `_checkFile` — no `recordPhase`. `recordPhase` is a local callback declared
inside `main()` (`:1574`) and passed **to `checkConverged`** (`:496`), never to `reviewLoop`. Site 4's
prompt is built at `:567` and dispatched at `:570` as `await _agent(optimizer, postmortemPrompt)`, so
the double that captures it is **`_agent`**.

The surface is real and the identity in conjunct (ii) is unaffected — its primary oracle is
`loopResult.iterations`, which is sound. What is wrong is the name, and it is wrong in the two
paragraphs that exist specifically to answer F-02's "name the surface precisely". An implementer at
`RLH-22` will look for a `recordPhase` double in `reviewLoop.test.js` and not find one.

**Required change.** Name `_agent` in both places. §6.5's "Which injected surface, precisely" bullet
should state that site 4 is observed through the **agent** double's recorded prompt, and site 5
through `reviewLoop`'s return value.

### F-14 (Medium) — the tight equality's precondition is incomplete, and reds on a correct subject

§4.3 conjunct (i):

> Where every episode in a segment is driven past `B`, the **equality**
> `dispatches(segment) === (1 + I) × B` is asserted

with `I` = *"the round count `reviewLoop` returns in its `iterations` field"*. Measured:
`orchestrate-dev.js:598` returns `iterations: 5` (post-edit, `MAX_REVIEW_ROUNDS`) **only on the
non-converged branch**; `:648` returns `{ converged: true, iterations: iteration, … }` — the *actual*
round reached.

So on a segment whose loop converges at round 2, `I = 2`, while the episodes actually run are one
authoring plus one revision — a phase produces `1 + (rounds that yielded a revision)` episodes, which
equals `1 + I` only when the loop runs to exhaustion. Saturating every episode makes the left-hand
side `2B`; the right-hand side is `3B`. The equality is false on a correct subject, and the ≥10
"drive every episode of a segment past `B`" floor is *forced*, so this is deterministic, not
seed-dependent. `PROP-EPISODE-01` rides the pacing row (green batch 7, permitted red batches 3–6), so
it is a false red at the batch-7 gate rather than an immediate halt — but it is still a property that
cannot go green.

`PROP-WINDOW-01` gets exactly this right two pages later: *"≥20 must run to exhaustion so conjunct
(ii)'s identity is reachable — a run that converges early never returns the `iterations` count the
identity needs"*.

**Required change.** Add the same precondition: assert the equality only over segments that run to
exhaustion (`converged: false`) **and** whose every episode saturated. State also that `I` is read
per segment, not once per run — a multi-phase interleaving has one `iterations` value per phase entry.

### F-15 (Medium) — the deliberate overlap fragments have no owned expected outcome

§4.4 introduces the disjointness shape and §4.4's floor requires ≥10 of them:

> a call inside an `await`ed `Promise.all([...])` whose element is itself an arrow body … Such
> fragments are generated, and exactly one outcome must be returned.

The shape is real and generable — walking back from the call, the nearest preceding token is `=>`
(ruling 2's backward half) while the innermost unclosed delimiter is still `[` (ruling 3), and when
the element is followed by `,` ruling 2's forward half also holds. But the property is stated as a
round-trip, *"`classify(fragment) === expected`"*, and **no artifact says which of the two outcomes
is correct**: PLAN §9.2 item 3(c) lists the three rulings and decides *"whichever, if any, applies"*
without a precedence, and TSPEC §8.5's table is unordered. Both rulings exempt the site, so either
answer is *behaviourally* right — but a label mismatch reds the property on a correct classifier, on
the one row with no permitted red, ever. This is F-01's failure mode in a new place.

**Required change.** Either state the precedence (and say which artifact owns it — this document may
own it as a classifier-construction rule, the way §3.2 owns D8's bound), or scope the assertion for
this floor to **cardinality** — the classifier returns exactly one outcome, and it is one of ruling 2
or ruling 3 — rather than to a hand-authored label. Say which, in §4.4, not in §0.

### F-16 (Low) — `B` is not an independent observable, and §8.5 does not say so

§4.3 claims *"Both `I` and `B` are read from the run, from different surfaces, so the two sides of
the identity have independent provenance."* `I` genuinely is: `reviewLoop`'s return value is a
different site from the dispatch counter. `B` is not — it is *"observed by driving a single episode
past saturation and counting the dispatch doubles' calls"*, i.e. the same instrument that produces
the left-hand side, applied to a different input. A subject whose cap is uniformly 7 instead of 6
measures `B = 7` and satisfies the equality; the conjunct cannot see it.

That is an acceptable trade — what the equality *does* catch is the structural error (`1 + I`
episodes, per-segment reset), which is what §5.3's (4th) row exercises. §8.4 residual 5 covers only
the degenerate no-cap case (`B < ceiling`), and §8.5 item 3 makes exactly this admission for
`MAX_REVIEW_ROUNDS` (*"Both could be wrong together, consistently, and every property here would stay
green"*). The same sentence is owed for `B`.

**Required change.** One clause in §8.5 (or §8.4 residual 5): a uniformly wrong
`MAX_AUTHORING_DISPATCHES` is invisible to `PROP-EPISODE-01`, and the equality's discriminating power
is over segment structure, not over the cap's value.

### F-17 (Low) — a leftover sentence re-asserts the five-coordinate generator

§4.3, three paragraphs after the four-coordinate repair: *"D7 episode interleavings, extended to vary
**all five** `EpisodeKey` coordinates independently"*. §4.3's own "The floor is over four coordinates,
not five" paragraph and §8.5 item 2 both state that no seam lets a test set `invocation`. The
generator sentence is v1.0 text the F-04 pass did not reach.

### F-18 (Low) — §6.1's helper count

Measured at HEAD: `__tests__/helpers/` contains twelve `.js` modules and one directory (`bin/`) —
thirteen *entries*, twelve *modules*. v1.0 said twelve modules, v1.1 says thirteen; "twelve modules
and one directory" is the measurement. Neither figure changes §6.1's load-bearing claim
(`testPathIgnorePatterns` excludes the directory), which is correct.

### F-19 (Low) — two floors for the same shape

§4.1 `PROP-DIGEST-02` **Non-vacuity**: *"≥15 cases must contain a code point above U+FFFF and **≥5**
must contain a lone surrogate"*. §5.2's new `PROP-DIGEST-02` (3rd) row: *"**totality**, conjunct (i),
dies on the **≥10** lone-surrogate cases"*. The owning floor is §4.1's; the ledger row should cite it.

### F-20 (Low) — §1.3 and §7.1 disagree on whether a new row is needed

§1.3: *"**The approved PLAN stays closed:** a property that would need a genuinely new row is a
defect in the property, and none here does"*, and *"adding the property's name to that row's
`Assertion(s)` cell is the whole of the mechanical PLAN edit"*. §7.1's `PROP-TRAILER-01` Row cell:
*"**own row**"*. Both cannot be true: no existing §7.3 row carries (file `pacingWrapper.test.js`,
green batch 3, permitted red none), so adopting the derived window is a new row, not a new cell.

§1.3 already concedes the substance (*"the one place the mechanical derivation produces a window §7.3
does not already carry"*), and the derivation is right — I re-derived it independently above. What is
wrong is only the sentence claiming no property needs a new row. Say instead: one property needs one
new row, and here is its five cells.

---

## Questions

| ID | Question |
|----|---------|
| Q-01 | For an overlap fragment (F-15), does the classifier return ruling 2 or ruling 3, and which artifact owns that answer? If the honest answer is "either", the floor's assertion must be cardinality-only — please state it that way in §4.4. |
| Q-02 | Is `I` in `PROP-EPISODE-01`(i) read once per run or once per phase segment? The formula is per segment; the prose says "the round count `reviewLoop` returns", singular. |
| Q-03 | `PROP-WINDOW-01`(i) asserts `deriveRoundWindow` is *"invoked exactly once per phase entry — call-count equality on the seam log"*. `deriveRoundWindow` is a module-internal call, not an injected seam, and ESM does not let a test intercept a module's own internal calls. Which recorded surface makes the call count observable at L2 — or is `RLH-LOOP-03`'s grep oracle (PLAN §11.5 `H-q`) the real owner of that clause? *(Carried from v1.0 unchanged, so not filed as a finding; it will bite `RLH-22` in batch 3 either way.)* |

## Positive Observations

- **The two identities were repaired by routing, not by weakening.** `PROP-ROUND-01` dropping to
  width invariance while `PROP-WINDOW-01` picks up the identity against `reviewLoop`'s returned
  `iterations` is the right split, and §5.2's rewritten row plus §5.3's new (3rd) row make it visible
  that the off-by-one moved rather than vanished. §8.5 item 3's admission — that nothing asserts the
  count and the derivation read the *same* constant, so both could be wrong together — is the
  sentence a weaker document would have omitted, and it is what makes the repair trustworthy.
- **`PROP-TRAILER-01`'s window was re-derived rather than accepted.** Taking the tighter window when
  the co-location argument offered four free batches of permitted red, and stating the gate loss
  explicitly, is the single best judgement call in this revision. It reproduces on independent
  re-derivation from PLAN §4.
- **F-06 and F-04 were fixed by finding the owner, not by deleting the claim.** The exit catalogue
  now has one owner (TSPEC §2.5) and one count (five), `FRESH` is separated out with its own negative
  obligation, and §5.4's "one such row is deliberate; two would have been a habit" is a better
  sentence than the finding that prompted it.
- **Everything measurable in the revision measured true.** `BYTES_FLOOR = 64` at `:423`,
  `orchestrate-dev.js:1866`/`:1867` (both correct, for different things), the five G-INV exits
  verbatim, `RLH-05(f)`'s membership, PLAN §11.5 `N-b`, all sixteen `PROP-` domains still returning
  zero matches, and the 1038/1/70/36 baseline. The four errors above are all *inferred* surfaces, not
  mis-measured ones — which is a different and less worrying failure mode than round 1's.

## Recommendation

**Needs revision**

One High and three Medium. The revision is much smaller than round 1's: F-12 is one table cell
restated from PLAN §9.2 item 3(c) verbatim (and two dependants that then become generable), F-13 is
a double's name in two paragraphs, F-14 is one added precondition already written correctly for
`PROP-WINDOW-01`, and F-15 is one sentence choosing between a precedence rule and a cardinality
assertion. The five Lows are single-clause corrections. No property needs restructuring, no ledger
row moves, and none of the eleven round-1 findings reopened.

---

VERDICT: Needs revision
{"high": 1, "medium": 3, "low": 5}
