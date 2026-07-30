# Cross-Review: software-engineer — PROPERTIES

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-review-loop-hardening/PROPERTIES-pdlc-review-loop-hardening.md` v1.3 (194,345 B)
**Date:** 2026-07-30
**Iteration:** 4
**Scope:** `Local` — delta re-review of PROPERTIES v1.2 → v1.3 (`d93b7ab..63490cb`, 8 commits),
technical lens only: is each property **implementable as stated** against the tree, and is it
**falsifiable on a wrong implementation and green on a correct one**. Upstream REQ v1.6 / FSPEC v1.8 /
TSPEC v1.7 / PLAN v1.4 are approved, closed, and not reopened (R-5). Citation and `file:line` drift is
corrected silently and filed at no severity (R-6). Every round-1 and round-2 finding remains settled
and none is reopened.

---

## Verification basis (DC-02) — derived, not confirmed

| Quantity | Derived at HEAD | Document's claim |
|---|---|---|
| Document size | `wc -c` = **194,345 B** | brief's figure ✓ |
| Commit range | `d93b7ab` (§2.3, PM F-03) … `63490cb`; 8 commits inclusive. `git log b6773e7..63490cb` confirms `d93b7ab` is the first and carries the §2.3 hunk absent from the `d93b7ab..63490cb` diff | ✓ — the §2.3 fix is only visible if `d93b7ab` is read as a member, which it is |
| Site-4 dispatch | `orchestrate-dev.js:574` — `const postmortemResult = await _agent(optimizer, postmortemPrompt);` | `:574` in all three places (§0, §4.3, §6.5) ✓ — v1.2's `:570` corrected |
| Non-converged return | `:598` — `return { converged: false, iterations: 5, lastResults };` | `:598` ✓ |
| Converged return | `:648` — `return { converged: true, iterations: iteration, lastOptimizerResult };` | `:648` ✓ |
| `reviewLoop` signature | opens `:532`, destructured names `:533–541`, `}) {` at `:542`; injects exactly `_agent`, `_parallel`, `_checkFile` | `:531–543` — substance right, span off by one each side (R-6, same as round 3) |
| TSPEC §5.3 pre-count | `:1283–1293` — *"collect the `APPROVAL-HASH:` lines outside fences"*; branch table rows `0` / `1` / `≥ 2`, the "Existing value vs. computed hash" column populated **only** in the two `1` rows, `—` at `0` and `≥ 2` | quoted and characterised exactly ✓ |
| TSPEC §4.3 `duplicated` | `:893` — *"more than one such line outside fenced regions"*, in the `parseRevisionComplete` table | quoted ✓, and the document correctly labels it **the sibling** rather than the hash parser's own definition |
| TSPEC §5.0 `scanLines` | `:1096–1112` — the only exclusion is the fenced region; fence opener/closer lines are themselves unvisited | ✓ |
| TSPEC §5.0 caller list | `:1128` — *"the `APPROVAL-HASH:` scan **and pre-count** (§5.3)"*, one entry | ✓ — this is what makes §5.3 the owning section for the parse-side scan too, not only the append-side pre-count |
| `HASH_FAILURES` | TSPEC `:853` — `["absent", "duplicated", "unparseable"]` | ✓ |
| PLAN §9.2 item 3(c) | `PLAN:794–817`. Its own words are *"walk **backwards** from its offset maintaining a stack of unclosed `(` / `[` / `{` to find the enclosing context, **and decide the three rulings from it**"* | see F-24 disposition — R-6, not filed |
| PLAN §0's F-03 row | `PLAN:1504` — *"…to decide which §8.5 ruling, if any, applies"* | this is where the newly quoted phrase actually lives |
| `docs/_queue/QUEUE.md` | table rows `0,1,2,3,4,5,6,7,9`; row 9's two quoted sentences reproduce **verbatim** (`:48–51`, `:67–69`) | ✓ |
| TSPEC §5.6.1 `refreshReviewState` | `:1424–1441` — *"called at **every** wrapped episode entry"*, body line `:1433` is `w ← deriveRoundWindow(r.files, docType)` | **not reconciled anywhere in §4.3** — see F-25 |
| TSPEC §5.4 | `:1314` — *"Runs once per skip-eligible phase entry, after `deriveRoundWindow` and before `reviewLoop`"* | the gate call, a second invocation site |
| TSPEC §2.5 step 5 / §7.1 edit 3 | `:470` `reviewLoop(…, iteration = startIndex, docType)`; `:1897` `if (iteration > endIndex)` | the window **values** are threaded positionally — §4.3 (i)'s second clause and (iii) are sound |

**Suite baseline, re-run on this machine.** `cd pdlc/workflows && npm test` →
**1038 passed / 1 failed / 70 skipped, 1109 total, 36 suites, 377.109 s.** The single red is the
foreign intentional `documentOracles.test.js › coveredViolations (§10, §10.1) › AT-22
[red-until-L-06]`, failing at `:246`. Baseline reproduces exactly. Wall time is this machine's and is
not compared to any other run.

**One correction to the brief, stated so it is not carried forward.** The brief says the
`> `-quoted-line question "lands on §7.3's row with no permitted red, ever." It does not.
`PROP-HASH-01` rides the digest row — **green from batch 3, permitted red batch 2** (§4.2 *Owner*,
re-derived). The no-permitted-red-ever row is §7.3 row 1 (`RLH-AT-19`, `-20`, `RLH-SCAN-01`), which
`PROP-AWAIT-01` rides (§4.4, `:1588`). This does not change any judgement below; it changes the cost
of being wrong about the quoted shape from a gate break to one batch of permitted red.

---

## Per-id disposition of round-3 findings

| ID | Sev (v3) | Disposition | Evidence I derived |
|----|----------|-------------|--------------------|
| **F-21** | **Medium** | **Resolved; one residue filed as F-26 (Low)** | Both rows exist in §5.2 (`:1741`, `:1742`). **Row (4th) re-derived and correct in every clause.** Mutation: on the `n === 0` path return `{ok:false}` with `reason` omitted or outside `HASH_FAILURES`. (vi) membership dies on the ≥5 no-trailer floor ✓; (iii)'s named `absent` dies with it ✓; **(i) genuinely survives** — `ok:false` is still the right accept/reject answer for `n===0`, so the red is localised to the catalogue ✓; (v) survives — no hash is returned ✓; rows 1 and 2 both green — no hash of any shape is returned and nothing scans mid-document ✓. The `PROP-TRAILER-01` (2nd) construction is genuinely the same shape. SE Q-02 is answered in the row itself. **Row (3rd) is owed, present, and does kill (ii)** — but its localisation claim does not survive re-derivation (F-26). Rows 1 and 2 *are* green under both mutations, which is the check that establishes both rows were owed, and I reproduced it independently |
| **F-22** | Low | **Resolved** | §4.3 `:1416–1425` now names both sites and the split. Re-derived at HEAD: `:598` `return { converged: false, iterations: 5, … }` is the exhausting branch and is TSPEC §7.1 edit 5 (the constant reported as a *count*); `:648` `return { converged: true, iterations: iteration, … }` is the converging branch, is not an edit site, and reports no constant. The paragraph states that split **as the cause** of conjunct (i)'s equality being restricted to precondition (b) while its inequality is not — which is the connection v1.2's sentence was missing, not merely the second line number. The prose is awkward (`B`'s clause resumes after a long interjection) but it parses and both surfaces are named |
| **F-23** ≡ PM F-01 | Low (SE) / Medium (PM) | **Resolved in the measure; one residue filed as F-27 (Low)** | **The measurement re-derived from source before being compared.** TSPEC §5.3 `:1283–1293`: the collection unit is *"the `APPROVAL-HASH:` lines outside fences"*, the branch table keys on `0` / `1` / `≥ 2`, and the value column is `—` at `≥ 2` — so at `≥ 2` the disposition is fixed with no payload test, exactly as §4.2 states. TSPEC §4.3 `:893` defines the sibling as *"more than one such line outside fenced regions"*, and §4.2 correctly calls it **the sibling** rather than borrowing it as the hash parser's own definition (TSPEC states no algorithm for `parseApprovalHash`'s matcher — that gap is real and §4.2 does not paper over it). TSPEC §5.0 `:1096–1112` makes the fence the only exclusion. **Unit = `APPROVAL-HASH:` lines outside fenced regions, counted irrespective of payload.** The derivation holds. **The contradiction is gone:** on one valid trailer plus one malformed line, (i) gives `n === 2` ⇒ RHS false ⇒ `ok:false`, and (ii) gives `duplicated`; they agree. **The generator now pins it:** *"Each document carries exactly one shape from this list, never a mixture"*, with the double-line shape widened to *both valid, or one valid and one malformed*, and a **≥2 mixed** sub-floor inside the ≥5. That sub-floor is the thing that actually discriminates line-counting from trailer-counting — a subject counting well-formed trailers answers `n === 1` on a mixed document and returns `ok:true`, which (ii) kills. I walked all ten drawable shapes against all six conjuncts; nine are mutually consistent, and the tenth (malformed label) is F-27 |
| **F-24** | Low | **Resolved in substance; the section attribution is R-6 and not filed — and it is inherited from my own round-3 wording** | §4.4 and §8.5 item 5 now read *"to decide which §8.5 ruling, if any, applies"*. Measured against `PLAN-…md`: that phrase **is** the PLAN's, at `:1504` — inside **§0's changelog row for F-03**, describing what §9.2 gained. §9.2 item 3(c) itself (`:794–817`) reads *"…walk **backwards** from its offset maintaining a stack of unclosed `(` / `[` / `{` to find the enclosing context, **and decide the three rulings from it**"*. So the words are the artifact's and the section reference is one section off. That is squarely R-6 — and my round-3 F-24 gave the phrase without its location, so the misattribution is one I induced. Corrected here, filed at no severity. **The substance is unaffected and I re-checked it:** neither §9.2 item 3(c) nor PLAN §0's row nor TSPEC §8.5's table states an ordering between rulings 2 and 3, so §8.5 item 5's upward report stands exactly as written |
| **Q-03** | Question | **No longer carryable — promoted to F-25 (Medium)** | See below. What is new is not the observability half I have asked about three times; it is that a conforming subject's call count is **not one**, derived from TSPEC §5.6.1 and from this document's own `PROP-LIST-01b` |

### pm-review round-3 findings that touch engineering substance

| PM ID | Disposition | Evidence I derived |
|---|---|---|
| **F-02** | **Resolved — the withdrawal is correct and the "none charters it" conclusion reproduces** | I read every row of `docs/_queue/QUEUE.md` rather than checking the author's count. The table holds rows **0, 1, 2, 3, 4, 5, 6, 7, 9** (no row 8 — the banner at `:12–18` explains why, and §8.4's "0–7 and 9" is exactly right). Charter by charter: row 2 merge phase; row 3 advisory model tier / CI triage; row 4 cross-repo promotion; row 5 the integration of 2–4; row 6 D-DIST-01/-02/-03/-05 (`pdlc install`, plugin-path loading, auto-sync, marketplace cache); row 7 D-DIST-06 release automation, scoped at `:77–80` to *"release automation"* with the PR-test half already discharged; row 9 the SKILL authoring contract. **None charters reader-seam IO-failure coverage.** Row 9's two quotes in §8.4 reproduce verbatim (`:48–51`, `:67–69`), including the exclusion *"not to re-implementing row 0's mechanism"*. **§8.3's two surviving row-9 bindings do fit:** `MAX_AUTHORING_WRITE_BYTES` is row 9's own bullet **T-Q-03** (`:60–62`), and SKILL-template ↔ `completeness.test.js` drift is row 9's bullet **Q-09** (`:53–59`, *"the acute one, and the reason this row exists at all"*). Both are interface-declaration items; neither is mechanism. The third really was the outlier. §4.2's owner table (`:1168`) was updated in the same direction — `unreadable document` now reads *"no queue row charters it either"* — so the two statements agree |
| **F-01** | Same defect as my F-23 | Treated once, above |
| **F-03** | **Resolved** | `d93b7ab` withdraws §2.3's competing sole-ownership sentence and replaces it with *"The table above is the sole owner of each property's disposition; a property's `Shrink.` line restates its row here and owns nothing."* §3.1's cell already pointed at the table and is unchanged. One owner, named in one place |

---

## New findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-25 | **Medium** | Local | `PROP-WINDOW-01` (i) asserts `deriveRoundWindow` is invoked **exactly once per phase entry**, as a call-count *equality*. A conforming subject invokes it once at the phase gate (TSPEC §5.4) **plus once at every wrapped episode entry** (TSPEC §5.6.1's `refreshReviewState`, whose body is `w ← deriveRoundWindow(…)`). This document's own `PROP-LIST-01b` asserts the contradicting count as an equality on the same subject at the same level. The conjunct is false on correct code, not merely unobservable | §4.3 `PROP-WINDOW-01` (i); §4.2 `PROP-LIST-01b` |
| F-26 | Low | Local | §5.2's new `PROP-HASH-01` (3rd) row claims *"the red names (ii) alone"*. Re-derived: the mutation also kills (i)'s only-if half on every double-line case, and kills (v) on any mixed case where the malformed line is the first collected. The row is owed and it does kill (ii); the localisation claim it is sold on is not true, and a mutation that **does** isolate (ii) exists | §5.2 `PROP-HASH-01` (3rd) |
| F-27 | Low | Local | §4.2 conjunct (iv) buckets *"carried under a malformed label"* under `n === 1`. Under §4.2's own definition of `n` a malformed label is not an `APPROVAL-HASH:` line, so that shape is `n === 0` and conjunct (iii) claims it with a **named** reason. (iv) already gives the fence exactly this treatment and stops one clause short | §4.2 (iii), (iv) |

---

### F-25 (Medium) — `deriveRoundWindow` is not invoked once per phase entry, and this document says so twice

`PROP-WINDOW-01` (§4.3, `:1529–1532`), conjunct (i), unchanged since v1.0:

> **Computed once.** `deriveRoundWindow` is invoked **exactly once** per phase entry — call-count
> equality on the seam log, not a floor; every subsequent consumer receives `startIndex` and
> `endIndex` **positionally** from that single computation; …

and *Beyond the examples* (`:1560`): *"'Computed once' is a claim about call **counts** across a run."*

I have carried the observability half of this as **Q-03** for three rounds without filing it, on the
reading that it was a question about *which surface* `RLH-22` would use. Re-deriving it this round
against TSPEC rather than against my own prior note, that reading is wrong. The clause is not
under-specified — it is **false on a conforming subject**, for a reason the approved TSPEC states
twice:

- **TSPEC §5.4** (`:1314`): the approval search *"Runs once per skip-eligible phase entry, **after
  `deriveRoundWindow`** and before `reviewLoop`."* — the gate invocation.
- **TSPEC §5.6.1** (`:1424–1441`): `reviewLoop` *"declares one module-local helper, called at **every**
  wrapped episode entry inside its `while (true)` — the round's optimizer episode and each reviewer
  episode alike"*, and that helper's body is:

  ```
  refreshReviewState():
    r ← await _listFiles(`docs/${feature}`)
    …
    w ← deriveRoundWindow(r.files, docType)          ← TSPEC :1433
  ```

  This is not incidental: `:1443` — *"**Every** episode re-reads, the first included, so the loop needs
  no seed maps"* — is the whole of N-01's fix, and is why `reviewLoop`'s signature gained `_listFiles`
  and `_readFile` at all.

So a phase entry with *k* wrapped episodes invokes `deriveRoundWindow` **1 + k** times, by design. The
equality asserts 1.

**The document contains its own counter-example.** `PROP-LIST-01b` (§4.2, `:1289–1290`):

> `refreshReviewState()` is called at **every** episode entry (call count equals episode count,
> asserted as an **equality**, not a floor)

with a forced floor of *"≥15 [sequences] must be length ≥5"*. Both properties are L2 over the same
subject; both are written in **batch 3** (`RLH-21` and `RLH-22`). On a subject satisfying
`PROP-LIST-01b` on a length-5 sequence, `deriveRoundWindow` is invoked five times inside `reviewLoop`
alone. The two equalities cannot both hold. This is not the kind of tension that resolves at
implementation time — both are stated as equalities precisely so they cannot be softened.

**The rest of the property is sound and should not be disturbed.** I checked the two clauses that
depend on the window *values* rather than on the invocation count, and both re-derive true:
TSPEC §2.5 step 5 (`:470`) passes `reviewLoop(…, iteration = startIndex, docType)` and §7.1 edit 3
(`:1897`) makes the cap `if (iteration > endIndex)`, so `endIndex` is threaded, not re-derived; TSPEC
§4.8's T-Q-02 (`:2407`) leaves only the *carrier shape* (two positionals vs. a record) to
implementation, never the derivation. Conjunct (iii) — *"the window does not move"* — is therefore
true of the threaded pair, even though `refreshReviewState`'s internal `w.startIndex` advances as
rounds write new files (TSPEC §5.6.1 rule 2, `:1467–1473`: `selectMode` and `deriveRoundWindow`
*"answer different questions"*). Conjunct (ii)'s width identity is untouched. **Only (i)'s first
clause is wrong.**

**Required change — one clause, no structure moves, no floor changes, no upstream document reopened.**
Replace the invocation-count equality with the observable that actually exists and actually
discriminates:

> **Computed once, at the gate.** The `endIndex` `reviewLoop` enforces and the `startIndex..endIndex`
> pair `checkConverged` renders are the values the phase gate supplied **positionally**, never a
> re-derivation: driving `reviewLoop` with an `endIndex` that disagrees with what a re-derivation from
> the `_listFiles` double's answer would produce, the loop's cap follows the **parameter**. The values
> are identical across every consumer and every call within one phase entry.

That is fully observable at L2 with the doubles `reviewLoop` already injects, it is an equality rather
than a floor, and it kills the mutation the current clause is aiming at (a `reviewLoop` that recomputes
its own window and drifts as the listing grows) while staying true on the per-episode
`refreshReviewState` calls TSPEC mandates. `PROP-LIST-01b` keeps the per-episode count; this property
keeps the window's immutability; neither claims the other's ground.

If instead the intent is to assert something about the *gate*, say so and move it: the gate is not
inside `reviewLoop` and `reviewLoop.test.js` cannot see it.

### F-26 (Low) — the (3rd) ledger row's localisation claim does not re-derive

§5.2 `:1741`:

> `PROP-HASH-01` (3rd) | same file · in `parseApprovalHash`, when the pre-count is `≥ 2`, return the
> **first** collected line as `{ ok: true, hash }` … conjunct **(ii)** dies … (v) survives (the
> returned value is still 64 hex on the both-valid cases) and (vi) survives (no reason is returned at
> all on this path), **so the red names (ii) alone** and not the return shape.

Two of the three claims hold and the headline does not:

- **(vi) survives** ✓ — the mutant's return on this path carries no `reason`, and (vi) quantifies over
  `ok:false` returns, of which there are none here.
- **(ii) dies** ✓, on the forced ≥5 double-line floor.
- **(i) also dies.** (i) is an `iff`, and §4.2 says so explicitly: *"Both halves are required in both
  directions."* On a double-line document `n === 2`, so (i)'s right-hand side is false and (i) demands
  `ok:false`. The mutant returns `ok:true`. (i) reds on all five-plus double-line cases.
- **(v) can die too.** The mutation returns *the first collected line*, and collection is payload-blind
  — that is the point of the measure. On the ≥2 **mixed** cases the first collected line may be the
  malformed one, in which case the mutant returns `{ok:true, hash: <63-hex | uppercase | non-hex>}` and
  the `/^[0-9a-f]{64}$/` totality conjunct fails. The row's parenthetical is hedged to *"on the
  both-valid cases"*, which is true, but "(v) survives" is a statement about the corpus and the corpus
  now contains the mixed cases by a forced floor.

Consequence: the mutation is caught, so §5.1's rule is met, but the row does **not** show that (ii) is
owed — (i) alone catches this mutant. The rows exist to demonstrate each conjunct earns its place, and
this one demonstrates it for a conjunct that was already covered. Note this mutation was one of the two
I prescribed in round-3 F-21; the prescription was mine and the imprecision is not the author's
invention — but it is still wrong in the document.

**Required change.** Either state the effect honestly — *(i)'s only-if half and, on the mixed cases
where the malformed line is collected first, (v) die alongside (ii); (ii) is the conjunct that names
why* — or, better, swap in the mutation that genuinely isolates (ii):

> `PROP-HASH-01` (3rd) — same file · on a pre-count of `≥ 2` return `{ ok: false, reason:
> "unparseable" }` instead of `{ ok: false, reason: "duplicated" }`.

I checked that one against all six conjuncts: (i) green (`ok:false` is the correct accept/reject
answer at `n === 2`), (iii) not applicable, (v) green (no hash is returned), (vi) green
(`unparseable ∈ HASH_FAILURES`), rows 1 and 2 green — and **(ii) alone dies**, on the ≥5 double-line
floor, naming the catalogue member that went missing. That is the `PROP-TRAILER-01` (2nd) construction
the (4th) row already borrows, applied to the other new conjunct.

### F-27 (Low) — (iv) buckets the malformed-label shape by the rule (iv) itself replaced

§4.2 conjunct (iv), new this round:

> (iv) `n === 1` whose payload is uppercase hex, 63 or 65 characters, non-hex, **or carried under a
> malformed label** returns `ok: false`. A **fenced** trailer is not collected at all, so a fenced-only
> document is `n === 0` and falls under (iii) — the fence is an exclusion from the count, not a
> malformed payload.

The second sentence is exactly right and is the round's best sentence: it notices that one member of
its own list is an exclusion from `n` rather than a bad value of `n`, and re-routes it. The same is
true of the member immediately before it and the sentence stops one clause short. `n` is defined as the
count of **`APPROVAL-HASH:` lines** outside fences. A line under a malformed label is not an
`APPROVAL-HASH:` line, so the malformed-label document is `n === 0` — which conjunct (iii) claims,
with the **named** reason `absent`.

So (iii) and (iv) disagree about which bucket that shape is in. Following (iv), a test asserts bare
`ok:false` and never reds. Following (iii), a test asserts `reason === "absent"`, and a conforming
subject whose label matcher is loose enough to find the line and call it `unparseable` reds. TSPEC
states no matcher for `parseApprovalHash`, so both subjects are conforming — this is the *same*
undetermined boundary as the `> `-quoted line, which §4.2 handles correctly one paragraph later and
does not extend here.

**Required change.** One clause, in (iv)'s own shape:

> …a **fenced** trailer is not collected at all, and neither is a line under a malformed label — it is
> not an `APPROVAL-HASH:` line — so both shapes are `n === 0`. Whether the *named* reason `absent` is
> asserted on the malformed-label shape depends on the matcher TSPEC does not specify, so it is
> excluded from (iii)'s named reason on the same ground as the quoted shape; (i), (v) and (vi) still
> bind.

---

## Checked and dropped — do not re-file these

- **The `> `-quoted line, under both readings.** This is what the brief asked me to judge hardest and
  it holds. §4.2 records that `scanLines` excludes fences *and nothing else*, so whether a `> `-quoted
  `APPROVAL-HASH:` line enters the pre-count is undecided by any approved artifact; under the counting
  reading a quoted-only document is `n === 1` at a forbidden position, under the not-counting reading
  it is `n === 0`. I derived both branches independently: **counting** ⇒ (i)'s position half fails ⇒
  `ok:false`, reason `unparseable` ∈ `HASH_FAILURES`; **not counting** ⇒ (iii) ⇒ `ok:false`, reason
  `absent` ∈ `HASH_FAILURES`. (i), (v) and (vi) are true under both, and the paragraph withholds (ii)
  and (iii)'s **named** reasons from the quoted shapes. That withholding is stated in the owning
  subsection, four paragraphs below the conjunct list, under a heading that names it, and it names the
  exact shapes. Two engineers reading §4.2 in full write the same assertion. **No red on a conforming
  subject on the quoted shapes.** Not a finding.
- **The "unquoted, unfenced lines" gloss vs. (iv)'s fence routing.** I first read the gloss as
  excluding fenced-only documents from (iii), which would have contradicted (iv). Re-read, *"unquoted,
  unfenced lines"* describes **which lines enter `n`**, not which documents the conjuncts apply to —
  under which a fenced-only document has zero counting lines, `n === 0` unambiguously (§5.0's code is
  explicit), and (iii) applies exactly as (iv) says. Consistent. Not a finding.
- **The whole drawable population against all six conjuncts.** Ten shapes, one per document: valid;
  uppercase; 63; 65; non-hex; malformed label; fenced; quoted; two lines (both-valid or mixed); none.
  Nine are mutually consistent under (i)–(vi); the tenth is F-27. In particular the **mixed** shape,
  which started this three rounds ago, now has (i) and (ii) agreeing on `duplicated` — and the ≥2
  sub-floor makes it the case that discriminates line-counting from trailer-counting, which is real
  discriminating power the ≥5 floor did not have at v1.2. Not a finding.
- **Whether §5.3's pre-count is the right owner for the *parse* side.** §5.3's branch table governs the
  **append** path, not `parseApprovalHash`. I checked whether borrowing it was a category error: TSPEC
  §5.0's caller list (`:1128`) names *"the `APPROVAL-HASH:` scan **and pre-count** (§5.3)"* as one
  entry, so §5.3 owns both scans and they share the unit. The derivation is sound. Not a finding.
- **Whether §4.2 over-reads TSPEC §4.3.** It does not — §4.3's `duplicated` definition sits in the
  `parseRevisionComplete` table, and §4.2 calls it *"the **sibling** `duplicated`"* rather than
  presenting it as the hash parser's own. TSPEC genuinely states no matcher for `parseApprovalHash`;
  the document says so where it matters. Not a finding.
- **`PROP-HASH-01` (4th)'s isolation.** Re-derived clause by clause above; exact. Not a finding.
- **§8.4 residual 6's honesty.** The binding is withdrawn, row 9's scope is quoted rather than
  characterised, the gap is recorded as **unowned**, and closing it is stated as an *action* with two
  named options. I read all nine queue rows to check the "none charters it" conclusion rather than the
  claim. Correct. Not a finding.
- **§8.3's two surviving row-9 bindings.** Both map to row 9's own bullets (T-Q-03, Q-09). They stand.
  Not a finding.
- **Is §0 still inert?** **Yes**, fourth round running. The v1.3 block is seven disposition rows plus a
  through-line paragraph, and I checked each row against the section it points at rather than the
  pointer: SE F-21→§5.2's two new rows (both in the body table); SE F-23/PM F-01→§4.2's measure
  paragraph, six conjuncts, undetermined-case paragraph and Generator (all body); PM F-02→§8.4
  residual 6 + §4.2's owner table; SE F-22→§4.3; SE F-24→§4.4 + §8.5 item 5; PM F-03→§2.3. **Nothing's
  only precise statement lives in a changelog row.** No finding on size.
- **Citation drift.** `reviewLoop:531–543` (is `532–542`); PLAN §9.2 item 3(c) as the home of a phrase
  that lives at PLAN `:1504`. Corrected above, neither filed (R-6).
- **§4.2's owner table `absent` row** still says *"named-`reason` conjunct"* without the number while
  the `duplicated` row above it now says *"conjunct (ii)"*. Cosmetic asymmetry from `63490cb`. Not
  filed.
- **§8.4 residual 6's opening phrase** *"TSPEC §6.2 rows 6–7's `absent` and `duplicated` trailer
  classes"* — `absent`/`duplicated`/`unparseable` are all row **6**; row 7 is the unreadable document,
  which the next sentence separates correctly. Unchanged text, reads right in context. Not filed.

---

## Questions

| ID | Question |
|----|---------|
| Q-04 | For F-25: is conjunct (i)'s first clause aiming at *the gate deriving the window once* (in which case it belongs at a level that can see the gate, not `reviewLoop.test.js`), or at *`reviewLoop` not re-deriving the cap it was handed* (in which case the parameter-vs-re-derivation oracle above states it observably and truly)? Both are worth asserting; only the second is `PROP-WINDOW-01`'s. |
| Q-05 | For F-26: was the (3rd) row's mutation chosen because round-3 F-21 prescribed it, or because the `{ok:false, reason:"unparseable"}` mutation was considered and rejected? If the former — which is my reading, and my fault — the swap is free. |

## Positive Observations

- **The measure was extracted, not paraphrased, and that is why the contradiction is finally gone.**
  Three rounds of this property failed the same way: each revision restated the counting rule in the
  property's own words and each restatement drifted. v1.3 goes to the owning sections, quotes the unit,
  states *why* the branch table proves payload-blindness (the value column is `—` at `≥ 2`), and then
  states all six conjuncts over one named quantity. I re-derived the unit from TSPEC §5.3, §4.3 and
  §5.0 independently and got the same answer. The `iff`/`duplicated` disagreement is not patched, it is
  structurally impossible now — both read `n`.
- **The generator fix does real work rather than closing a question.** Pinning one shape per document
  answers Q-01 the cheap way; *also* widening the double-line shape to one-valid-plus-one-malformed and
  putting a ≥2 sub-floor under it is the expensive way, and it is the one that gives conjunct (ii)
  discriminating power it did not have. A subject that counts well-formed trailers passes every
  both-valid case and dies on the mixed ones. That is the difference between a sentence and an
  assertion, and §4.2 says so in those words.
- **The one thing the specs do not settle was reported, not invented.** The quoted-line paragraph
  states the gap, derives both branches, shows the conjuncts that survive both, and withholds exactly
  the assertions that would not. That is the second time this document has declined to invent a rule
  it would have been cheaper to invent (the ruling-2/3 precedence was the first), and both times the
  withheld assertion was replaced by a weaker one that still kills the failure that matters.
- **PM F-02 was answered by reading the queue, not by softening the sentence.** The easy fix was
  "whose scope is *related to* the read/write contract". The document instead quotes row 9's exclusion
  clause — the sentence that convicts the old binding — records the gap as unowned, and states the
  action. Writing "no successor row today" into a residual ledger is the sentence a weaker document
  omits, and it is what makes DC-08 mean anything.
- **Everything measurable in this revision measured true.** `:574`, `:598`, `:648`, TSPEC `:853`,
  `:893`, `:1096–1112`, `:1128`, `:1283–1293`, every quoted string from `QUEUE.md`, the nine queue
  rows, the 194,345 B, and the 1038/1/70/36 baseline. Not one number in v1.3 is wrong. The two Lows
  below are one over-claimed localisation and one clause that stops short of its own insight; the
  Medium is in text nobody has touched since v1.0.

## Recommendation

**Needs revision**

Zero High, one Medium, two Low. All four of my round-3 findings are resolved at the surface I named,
against the tree, and both convergent Mediums (SE F-23 ≡ PM F-01, PM F-02) are resolved by
re-derivation rather than by relabelling. Nothing from rounds 1–3 is reopened.

The Medium is not a v1.3 regression — `PROP-WINDOW-01` (i) has read this way since v1.0, and I carried
its observability half as Q-03 for three rounds rather than filing it. What changed is that I stopped
asking *which surface makes the count observable* and derived *what the count is*: TSPEC §5.6.1 puts a
`deriveRoundWindow` call at every wrapped episode entry, §5.4 puts one at the gate, and this document's
own `PROP-LIST-01b` asserts the contradicting equality on the same subject at the same level. An
equality that is false on correct code is exactly what this feature exists to stop shipping, and it
would have redded `RLH-22` in batch 3. Carrying it a fourth time as a question would have been the
comfortable call and the wrong one.

All three findings are single-clause repairs inside the owning conjunct or ledger row. No property is
restated, no floor changes, no generator changes, no structure moves, and no upstream document is
reopened.

---

VERDICT: Needs revision
{"high": 0, "medium": 1, "low": 2}
