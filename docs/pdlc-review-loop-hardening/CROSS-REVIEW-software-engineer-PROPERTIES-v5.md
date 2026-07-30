# Cross-Review: software-engineer — PROPERTIES

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-review-loop-hardening/PROPERTIES-pdlc-review-loop-hardening.md` v1.4 (208,911 B)
**Date:** 2026-07-30
**Iteration:** 5 (final round)
**Scope:** `Local` — delta re-review of PROPERTIES v1.3 → v1.4 (`8fd9930..f873d34`, 6 commits),
technical lens only: is each property **implementable as stated** against the tree, and is it
**falsifiable on a wrong implementation and green on a correct one**. Upstream REQ v1.6 / FSPEC v1.8 /
TSPEC v1.7 / PLAN v1.4 are approved, closed, and not reopened (R-5). Citation and `file:line` drift is
corrected silently and filed at no severity (R-6). Nothing settled in rounds 1–4 is reopened.

---

## Verification basis (DC-02) — derived at HEAD, not confirmed against the document

| Quantity | Derived at HEAD | Document's claim |
|---|---|---|
| Document size | `wc -c` = **208,911 B** | brief's figure ✓ |
| Commit range | `git log 8fd9930~1..f873d34` = 6 commits, `8fd9930` first (§4.2 (v) + malformed-label routing), `f873d34` last (§4.2 (iii) scoping) | ✓ inclusive as stated |
| Diff shape | `git diff 8fd9930~1..f873d34` on the document = **+143 / −39 lines**, 17 hunks, landing at §0 (16, 27), §4.2 (1047, 1085, 1107, 1129, 1229), §4.3 (1357, 1577, 1591, 1600, 1633, 1648, 1658), §4.4 (1722), §5.2/§5.3 (1841, 1843, 1872), §7.2 (2050, 2064), §8.5 (2258) | consistent with the changelog's account |
| Version line | `:16` — `1.4`, `2026-07-30` | ✓ |
| `reviewLoop` span | `orchestrate-dev.js` — `export async function reviewLoop({` at **`:532`**, `}) {` at **`:542`**; injects exactly `_agent`, `_parallel`, `_checkFile` | `:532–542` ✓ — round 4's R-6 correction applied |
| Site-4 dispatch / non-converged / converged returns | `:574` `await _agent(optimizer, postmortemPrompt)`; `:598` `return { converged: false, iterations: 5, lastResults }`; `:648` `return { converged: true, iterations: iteration, … }` | ✓ all three |
| TSPEC §3.7 | `:715–716` — `sha256Hex(text) // 64 lowercase hex`; `approvalHashOf(text) // \`sha256:${sha256Hex(text)}\`` | ✓ — the split is exactly as §4.2 (v) states it |
| TSPEC §4.3 | `:896` — `parseApprovalHash(fileText)` returns `{ ok: true, hash, reviewedCommit }` \| `{ ok: false, reason }` over `HASH_FAILURES` | ✓ — `hash` is the field (v) quantifies over |
| TSPEC §5.4 → §5.5 routing | `:1326` `anchor ← parseApprovalHash(text)`; `:1358` *"§5.5 takes `recordedHash` from `anchor`"*; `:1364` guard `/^sha256:[0-9a-f]{64}$/`; `:1366` `approvalHashOf(documentBytes) === recordedHash` | ✓ — see the grammar derivation below |
| TSPEC §5.6.1 | `:1424–1425` *"called at **every** wrapped episode entry inside its `while (true)`"*; `:1433` `w ← deriveRoundWindow(r.files, docType)`; **`:1435` returns `{ present: w.present, reviewFiles, startIndex: w.startIndex }` — no `endIndex`**; `:1443` *"**Every** episode re-reads"* | ✓, and the `:1435` return shape is the fact that makes the new (i) true — see F-25 |
| TSPEC §7.1 edit sites | `:1895` site 1 `checkConverged` message names `rounds ${startIndex}..${endIndex}`; `:1897` site 3 `if (iteration > endIndex)`; `:1898` site 4 `Iterations (${MAX_REVIEW_ROUNDS} — limit reached)`; `:1899` site 5 `iterations: MAX_REVIEW_ROUNDS`; `:1901` *"only sites 4 and 5 … use the constant alone"* | ✓ quoted and characterised exactly at §4.3 `:1584–1588` |
| TSPEC §5.2 / §4.8 | `:1210` `endIndex ← startIndex + MAX_REVIEW_ROUNDS - 1`; `:2407` T-Q-02 leaves only the **carrier shape** (two positionals vs. a record) to implementation | ✓ — the *values* are the gate's under either carrier |
| `HASH_FAILURES` | TSPEC `:853` — `["absent", "duplicated", "unparseable"]` | ✓ |
| PLAN §9.2 item 3(c) / §0's F-03 row | `PLAN:804` — *"…and decide the three rulings from it"*; `PLAN:1504` — *"to decide which §8.5 ruling, if any, applies"* | ✓ — §4.4 `:1722–1724` and §8.5 item 5 `:2258–2260` now quote each phrase where it lives, with the attribution corrected in place. Round-4 R-6 discharged |

**Suite baseline, re-run on this machine.** `cd pdlc/workflows && npm test` →
**1038 passed / 1 failed / 70 skipped, 1109 total, 36 suites, 435.224 s.** The single red is the
foreign intentional `documentOracles.test.js › coveredViolations (§10, §10.1) › AT-22
[red-until-L-06]`, failing at `:246`. Baseline reproduces exactly. Wall time is this machine's and is
compared to no other run.

---

## The grammar, derived independently before reading any of the five clauses

pm-review's Medium turns on the shape of `parseApprovalHash`'s `hash`. I derived it from the six
owning sources before opening §4.2, and then measured each of the five clauses against my answer.

| Source | What it says at HEAD |
|---|---|
| FSPEC §5 carrier catalogue (`:372`) | `APPROVAL-HASH:` value catalogue = **`sha256:` + 64 lowercase hex** |
| FSPEC §7 append shape (`:1046`) | `APPROVAL-HASH: sha256:{64 lowercase hex}` |
| FSPEC §10.5 (`:1466`) | a tier-1 line that *"does not match §7's grammar (`sha256:` + 64 lowercase hex)"* ⇒ `UNEVALUABLE` |
| TSPEC §4.4 record grammar (`:921`) | `APPROVAL-HASH: sha256:{64 lowercase hex}`; tier-2 `Approval Hash` column (`:944`) `sha256:{64 lowercase hex}` \| `unavailable` |
| TSPEC §3.7 (`:715–716`) | `sha256Hex` returns the **bare** 64 hex; `approvalHashOf` **prefixes** it. The two halves are named separately, which is the fact that decides which one `hash` is |
| TSPEC §5.4 → §5.5 (`:1326`, `:1358`, `:1364`, `:1366`) | `anchor ← parseApprovalHash(text)`; *"§5.5 takes `recordedHash` from `anchor`"*; guard `/^sha256:[0-9a-f]{64}$/`; and past the guard the comparison is `approvalHashOf(documentBytes) === recordedHash` |

**Answer: `/^sha256:[0-9a-f]{64}$/`, the line's whole value.** The routing settles it twice over, not
once: a bare-hex `hash` fails §5.5's guard, and *even if the guard were removed* it could never equal
`approvalHashOf(documentBytes)`, which is prefixed by construction — so `FRESH` would be unreachable
and the skip mechanism could never fire. pm-review's derivation reproduces exactly.

### Each of the five clauses, measured against that answer

| # | Clause | At HEAD | Verdict |
|---|---|---|---|
| 1 | §4.2 conjunct (v) | `:1061` — *"the returned `hash` always matches `/^sha256:[0-9a-f]{64}$/`, totally over the input space — the **whole** value of the `APPROVAL-HASH:` line, label included, never the bare hex run"*, followed by the six-source derivation and the `PROP-STALE-01` contradiction stated as withdrawn | ✓ agrees |
| 2 | §4.2 Generator | `:1107–1113` — *"A **valid** candidate line is the grammar verbatim — `APPROVAL-HASH: sha256:{64 lowercase hex}` — and every malformed payload shape varies the **hex run** while keeping the `sha256:` label, since the label is what the *malformed-label* shape varies instead"* | ✓ agrees, and see the load-bearing consequence below |
| 3 | §4.2 *Beyond the examples* | `:1129–1132` — *"no input, however malformed, produces a `hash` that is not `sha256:` + 64 lowercase hex — the exact shape TSPEC §5.5's guard admits"* | ✓ agrees |
| 4 | §5.2 `PROP-HASH-01` row 1 | `:1841` — mutation `{63,}`; *"conjunct (v)'s `/^sha256:[0-9a-f]{64}$/` return-shape assertion dies … the mutant returns `sha256:` + 63 hex, which the anchored grammar rejects"* | ✓ agrees, and the mutant's *value* is restated in the prefixed form too, not just the regex |
| 5 | §7.2 coverage cell | `:2050` — *"that **no** input yields a `hash` outside `/^sha256:[0-9a-f]{64}$/` — the whole labelled value TSPEC §5.5's guard admits, not a bare hex run"* | ✓ agrees |

**Propagation is complete, and — the check that actually matters — it is not over-propagated.** I
grepped every `{64}` regex and every *"64 hex"* prose mention in the document. Six sites carry the
prefixed form and are correct; **three sites carry the bare form and are correct to**: `:677`
(`PROP-DIGEST-02` (i) — `sha256Hex(t)` matches `/^[0-9a-f]{64}$/`, which TSPEC §3.7 says is exactly
right for `sha256Hex`), `:1824` (§5.2's `PROP-DIGEST-02` row, *"still 64 hex"*, same subject), and the
withdrawal notes at `:42`, `:1071`, `:1841` which quote the old text in order to retire it. A blanket
find-and-replace would have broken the two digest properties; this revision distinguishes the two
halves TSPEC §3.7 distinguishes. That is the difference between propagating a value and propagating a
string, and it is what four rounds of partial propagation failed at.

**One consequence of clause 2 is load-bearing and I want it named**, because it closes a hole nobody
filed: by pinning malformed *payload* shapes to vary the hex run **while keeping the `sha256:` label**,
the Generator guarantees the mixed double-line document's malformed member is still an
`APPROVAL-HASH:` line. So the mixed shape is `n === 2` **unambiguously**, under either label matcher —
and conjunct (ii)'s *named* `duplicated` can be asserted on it without depending on the silence §4.2
records two paragraphs earlier. Had the mixed shape's malformed member been a malformed *label*, (ii)
would have asserted a named reason on a document whose count is undetermined, and it would have redded
a prefix-exact subject. The F-27 fix and the PM F-01 fix interlock here; only one of them was aimed at
this.

---

## Per-id disposition of round-4 findings — with the evidence I derived

| ID | Sev (v4) | Disposition | Evidence I derived |
|----|----------|-------------|--------------------|
| **F-25** | **Medium** | **Resolved.** The oracle is true on correct code, observable in `reviewLoop.test.js`, genuinely falsifiable, says nothing about any call count, and the new floor is satisfiable | See below |
| **F-26** | Low | **Resolved by swapping the mutation.** Isolation re-derived clause by clause; **(ii) alone dies** | See below |
| **F-27** | Low | **Resolved.** The shape is routed to `n === 0` and recorded as a second silence; both matchers answer `ok: false` and no named reason is asserted on it | See below |
| **PM F-01** | Medium | **Resolved.** Grammar derived independently above; all five clauses agree; the two `sha256Hex` sites correctly left bare | Table above |
| **PM F-02 ≡ my F-26** | Low | One defect, fixed once | Below |
| **PM F-03 ≡ my F-27** | Low | One defect, fixed once | Below |

### F-25 — the provenance oracle is sound, and I checked the three ways it could have failed

Conjunct (i) now reads (`:1600–1606`):

> **Threaded from the gate, not re-derived.** The `endIndex` `reviewLoop` enforces and the
> `startIndex..endIndex` pair `checkConverged` renders are the values the phase gate supplied
> **positionally** — never a value the loop computed for itself. Asserted by disagreement: drive
> `reviewLoop` with an `endIndex` that *differs* from what a re-derivation over the `_listFiles`
> double's answer would produce, and the loop's cap follows the **parameter**. …

This is the oracle I prescribed, and I re-derived it rather than recognising it.

**(a) Is it true on a conforming subject?** Yes, and the decisive fact is one I did not have in round 4:
TSPEC §5.6.1's `refreshReviewState` returns `{ present: w.present, reviewFiles, startIndex: w.startIndex }`
at `:1435` — **it does not return `endIndex` at all**. So the per-episode re-derivation cannot reach the
cap even accidentally. The cap is §7.1 edit 3's `if (iteration > endIndex)` (`:1897`) over the threaded
parameter, and `checkConverged`'s render is §7.1 edit 1's `rounds ${startIndex}..${endIndex}` (`:1895`),
supplied by the caller under either of T-Q-02's two carrier shapes (`:2407`). Both named consumers are
threaded. On a disagreeing run a conforming subject caps at the **handed** `endIndex`. (i) is true.

**(b) Is it falsifiable?** Yes. §5.3's `PROP-WINDOW-01` row 1 (`:1872`) names the mutation — *"ignore
the `endIndex` parameter and recompute `startIndex + MAX_REVIEW_ROUNDS - 1` inside `reviewLoop` from
its own `_listFiles` re-derivation"* — and under it the cap follows the re-derivation, so (i) reds on
exactly the disagreeing runs and survives on the agreeing ones. That asymmetry is the property's whole
discriminating power and it is why the floor is forced rather than sampled. The row correctly records
the old call-count framing as withdrawn with the `1 + k` reason.

**(c) Does it still say anything about the call count?** No. I read all three conjuncts and the
*Beyond the examples* paragraph (`:1658–1662`) and §7.2's cell (`:2064`): every one of them is stated
over **values** or over the width identity. No count survives anywhere in the property. (iii)
(`:1633–1637`) gained the scoping clause and it is correctly worded — *"This is a claim about the
threaded pair only. `refreshReviewState`'s own `w.startIndex` legitimately advances … and nothing here
asserts otherwise"*. That last clause disclaims for the **whole property**, which is what makes (i)'s
*"identical across every consumer"* sentence safe: `refreshReviewState`'s internal `w` is not a
consumer of the threaded pair, and the property says so. The placement is four paragraphs below (i),
which is the same structure §4.2 uses for the quoted-line silence and which I ruled sufficient in
round 4; ruling it insufficient here would be raising the bar.

**(d) Is the new ≥15 floor satisfiable, and does it break an existing one?** Satisfiable, with room.
`PROP-WINDOW-01`'s floors are now ≥20 overflow, ≥20 exhaustion, ≥15 non-1 `startIndex`, ≥10
early-convergence, ≥15 disagreeing — **80 of 100 even if every axis were disjoint**, and they are not:
overflow implies exhaustion, and the `startIndex` and disagreement axes are attributes layered on cases
rather than cases consumed. The disagreement is constructible without touching the subject because the
same test owns both the `_listFiles` double and the window parameters. No other property's floors were
touched — I diffed for it, and the only floor hunk in the range is this one.

**The `PROP-LIST-01b` reconciliation partitions the ground; it does not overlap and it leaves no hole
that matters.** `:1357–1365` states the arithmetic (`1 + k`), assigns the *k* to `PROP-LIST-01b`'s
per-episode equality, and states that `PROP-WINDOW-01` asserts nothing about the count. I checked both
directions: `PROP-LIST-01b` asserts a `refreshReviewState` call-count equality and says nothing about
window values; `PROP-WINDOW-01` asserts window values and says nothing about counts. Disjoint. The
only quantity now unclaimed is *the gate invoking `deriveRoundWindow` exactly once per phase entry* —
and that is correctly unclaimed: `deriveRoundWindow` is pure (TSPEC §3.7), so a second gate call is a
performance detail with no observable consequence, it is invisible from `reviewLoop.test.js`, and §0's
`SE Q-04` row says so in as many words rather than smuggling it in. Not a hole.

### F-26 — the swapped mutation isolates (ii); I re-derived it against all six conjuncts and both sibling rows

§5.2 `:1843`: *"in `parseApprovalHash`, when the pre-count is `≥ 2`, return `{ ok: false, reason: "unparseable" }` instead of `{ ok: false, reason: "duplicated" }`."*

| Conjunct / row | Under the mutation | Derived |
|---|---|---|
| (i) `ok:true` **iff** `n===1` ∧ well-formed ∧ permitted | at `n === 2` the RHS is false and the mutant returns `ok:false` — the correct accept/reject answer | **green** ✓ |
| (ii) `n>=2` ⇒ `{ok:false, reason:"duplicated"}` | the mutant returns `unparseable` | **dies**, on the forced ≥5 double-line floor ✓ |
| (iii) `n===0` ⇒ `absent` | `n !== 0` on this path | **N/A** ✓ |
| (iv) `n===1` malformed payload ⇒ `ok:false` | `n !== 1` on this path | **N/A** ✓ |
| (v) returned `hash` matches `/^sha256:[0-9a-f]{64}$/` | no `hash` is returned on this path; the quantifier is empty | **green** ✓ |
| (vi) every `ok:false` carries a `HASH_FAILURES` member | `unparseable ∈ ["absent","duplicated","unparseable"]` (TSPEC `:853`) | **green** ✓ |
| §5.2 row 1 (`{63,}` payload) | no hash of any shape is returned | **green** ✓ |
| §5.2 row 2 (whole-document scan) | nothing scans mid-document | **green** ✓ |

**(ii) alone dies.** The row's claim re-derives exactly. The old mutation is recorded as withdrawn
with the true reason — that it reds (i) on every double-line case and (v) on the mixed cases where the
malformed line is collected first, so it *was* caught but demonstrated nothing about (ii). That is the
honest disposition, and the withdrawal note is more precise than my finding was.

**One thing I checked because the swap could have caused it, and it did not.** Removing the old
mutation removed the only ledger row whose red lands on (i)'s **count** half. §5.1's rule (`:1796–1799`)
is per-**property** — *"every property in §4 is paired below with a **named mutation** … and with the
conjunct that dies"* — not per-conjunct, so nothing is owed. And the discrimination is not lost in
substance: a trailer-counting subject answers `n === 1` on the mixed document and returns `ok:true`,
which reds (i) and (ii) together, and the Generator's ≥2 mixed sub-floor is stated as exactly that
discriminator (`:1115–1117`). Covered where it belongs. Also worth stating: §5.2 row 1's mutation kills
(iv) and (i)'s only-if half alongside (v) — but row 1 names (v) without claiming exclusivity, so unlike
the old (3rd) row it over-claims nothing. No new F-26.

### F-27 — routed, and the second silence is recorded on the same ground as the first

(iv) (`:1051–1059`) now routes the malformed-label shape out of `n === 1` alongside the fence, and the
new paragraph at `:1089–1095` records it as the second instance of the matcher silence. I walked the
shape against a conforming subject under **both** matchers:

- **prefix-exact matcher** ⇒ `n === 0` ⇒ (iii)'s disposition ⇒ `{ok:false, reason:"absent"}`.
- **loose matcher** ⇒ `n === 1` at a shape TSPEC §4.4's grammar forbids ⇒ `{ok:false, reason:"unparseable"}`.

(i) is false-RHS under both, so `ok:false` under both. (v) is vacuous under both (no hash). (vi) holds
under both — `absent` and `unparseable` are both `HASH_FAILURES` members. The **named** reasons in (ii)
and (iii) are withheld on this shape, exactly as they are on the quoted shape. **No conforming subject
reds on it under either matcher.** §4.2's owner table `absent` row was renumbered to *conjunct (iii)*
(`:1229`), closing the cosmetic asymmetry I declined to file in round 4.

---

## New findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-28 | Low | Local | `PROP-WINDOW-01`'s new ≥15 disagreement floor and conjunct (ii)'s width identity can collide on a case that is both **disagreeing and exhausted**, if the disagreement is realised by moving `endIndex` alone. Conjunct (i)'s own sentence names `endIndex` alone, which steers toward the risky construction | §4.3 `PROP-WINDOW-01` (i), (ii), *Non-vacuity* |
| F-29 | Low | Local | §4.2 (iv)'s summary sentence asserts the malformed-label document *"is `n === 0`"* flatly, which the very next sentence and the recorded-silence paragraph both correctly leave undetermined | §4.2 (iv); §4.2's second recorded silence |

### F-28 (Low) — one clause would keep the new floor orthogonal to (ii) in fact as well as in claim

Conjunct (ii) (`:1624–1631`) is *"for a run driven to exhaustion, `endIndex - startIndex + 1 ===
loopResult.iterations`, where … the left-hand side comes from the window the gate computed."* At HEAD,
site 5 returns the **constant** — TSPEC §7.1 `:1899`, `iterations: MAX_REVIEW_ROUNDS` — so (ii) is in
substance *"the gate's window is `MAX_REVIEW_ROUNDS` wide"*, cross-checked against a value sourced from
a different site. That is a real check: §5.3's `PROP-WINDOW-01` (3rd) row kills it with
`startIndex + MAX_REVIEW_ROUNDS` (off by one), and the width of `deriveRoundWindow`'s own answer
(TSPEC §5.2 `:1210`) is always `MAX_REVIEW_ROUNDS` on a conforming subject.

The new floor (`:1648–1653`) requires *"in ≥15 runs the window pair handed to `reviewLoop` must
**disagree** with what a re-derivation over the `_listFiles` double's listing would produce"*, and is
sold as *"orthogonal to those four"*. It **is** orthogonal — provided the disagreement is an
equal-width **shift** of the pair (hand `6..10` where the listing implies `3..7`). Provenance is then
fully observable, and (ii)'s identity is untouched. But conjunct (i)'s own sentence says *"drive
`reviewLoop` with an **`endIndex`** that differs from what a re-derivation … would produce"* — naming
`endIndex` alone. Move `endIndex` alone and the handed width is no longer `MAX_REVIEW_ROUNDS`; if that
case is also one of the ≥20 exhaustion cases, then under the reading where *"the window the gate
computed"* is the pair the test handed (at L2 the test **is** the gate), (ii) reds on a conforming
subject.

Nothing here is false on correct code under the intended reading — (ii)'s *"the window the gate
computed"* can equally be read as `deriveRoundWindow(listing)`, which is always `MAX_REVIEW_ROUNDS`
wide, and §5.3's (3rd) row makes that the evidently intended reading. So this is a generator-realisation
ambiguity, not a wrong assertion, and it is Low. But it is one an implementer can walk into at
`RLH-22`, guided by the property's own sentence.

**Required change — one clause, no floor changes.** In the *Non-vacuity* paragraph, after *"must
disagree with what a re-derivation … would produce"*, add:

> …realised as an **equal-width shift** of the pair — both indices moved together, so the handed width
> stays `MAX_REVIEW_ROUNDS` and conjunct (ii)'s identity is undisturbed on any run that is both
> disagreeing and driven to exhaustion.

and, in (i), replace *"an `endIndex` that differs"* with *"a `startIndex..endIndex` pair that differs"*
so the conjunct and the floor describe the same construction.

### F-29 (Low) — (iv)'s summary sentence over-commits by one word

§4.2 (iv), `:1052–1055`:

> …a **fenced** trailer is not collected, and neither is a line under a **malformed label** — it is
> not an `APPROVAL-HASH:` line — so **both documents are `n === 0`**, an exclusion from the count
> rather than a malformed payload.

Two sentences later (`:1056–1058`) the same conjunct says the malformed-label document's disposition
*"turns on the label matcher TSPEC does not specify"*, and the owning silence paragraph (`:1091–1093`)
states it precisely: *"a prefix-exact matcher gives `n === 0` ⇒ `absent`, while a matcher loose enough
to recognise the line gives `n === 1`."* So the count for that shape is `0` **or** `1`, and (iv)'s
summary asserts `0`.

The fence half of the sentence is exactly right — `n === 0` there is a *stated* exclusion (TSPEC §5.0)
— and it is the parallelism that carried the malformed-label half further than the evidence goes. **No
assertion is false on correct code**: every conjunct that binds on this shape ((i), (v), (vi)) answers
identically under both counts, and the named reasons are withheld. This is a Low purely because §4.2's
job is that two engineers read it and write the same thing, and this is the one section that has paid
for imprecision four rounds running.

**Required change — one clause.** *"…so the fenced document is `n === 0` and the malformed-label
document is `n === 0` under a prefix-exact matcher; neither is a malformed payload, and neither is a
value of `n === 1` that (iv) governs."*

---

## Checked and dropped — do not re-file these

- **Is §0 still inert? Yes, fifth round running.** The v1.4 block is 5,883 B: seven disposition rows
  plus two prose paragraphs. I checked each row against the section it points at, not against the
  pointer: PM F-01 → §4.2 (v)'s derivation, the Generator, *Beyond the examples*, §5.2 row 1, §7.2's
  cell (all body); SE F-25 → §4.3's restated (i), (iii)'s scoping clause, the new floor,
  `PROP-LIST-01b`'s reconciling paragraph, §5.3 row 1, §7.2's cell (all body); SE F-26 → §5.2's (3rd)
  row; SE F-27 → §4.2 (iv) and the second silence paragraph; the R-6 row → the three corrections, all
  applied in place; SE Q-04 / Q-05 / PM Q-01 / PM Q-02 → answers to questions, owning no substance,
  each restating a body disposition rather than establishing one. **No property's only precise
  statement, and no live disposition, exists solely in a changelog row.** The document grew
  +14,566 B and §0 accounts for 5,883 of it; the balance is body text — §4.2 (v)'s six-source
  derivation, §4.3's F-25 restatement, the `PROP-LIST-01b` reconciliation, the second silence
  paragraph, and the expanded (3rd) ledger row. No finding on size.
- **`PROP-HASH-01` as a whole — the full pass the brief asked for, not only the touched clauses.** All
  ten drawable document shapes (valid; uppercase run; 63; 65; non-hex; malformed label; fenced; quoted;
  double-line both-valid; double-line mixed; no trailer) against all six conjuncts. Every shape lands
  on a single verdict under every matcher reading, the two named reasons are asserted only where the
  count is unambiguous, and **no shape reds a conforming subject**. The Generator's one-shape-per-
  document rule and the new hex-run-vs-label split make the mixed shape's count unambiguous, which is
  what lets (ii)'s named `duplicated` be asserted on it. The §5.2 ledger has four rows covering (v),
  (i)'s position half, (ii), and (vi)+(iii); (iv) is covered incidentally by row 1 and (i)'s count half
  by the Generator's mixed sub-floor. Forced-case budget: 20 valid + 10 (63) + 10 (65) + 10
  quoted-or-fenced + 5 double-line + 5 no-trailer = **60 of 100**, unchanged this round — the second
  silence added no floor. Not a finding.
- **The `> `-quoted line.** Settled in round 4 under both readings; unchanged this round; per the brief,
  not re-opened.
- **§4.1, §8.4 residual 6, the queue-row withdrawal, `PROP-TRAILER-01`'s §7.3 row.** Dropped per the
  brief. None carries a hunk in this range; I confirmed that rather than assuming it.
- **§7.1 / §7.3 arithmetic.** Re-derived from §7.1's `Level` column: L1 = DIGEST-01/-02, HASH-01,
  STALE-01, SCAN-01, NAME-01, ROUND-01, FORCE-01, COMPLETE-01, TRAILER-01 = **10**; L2 = LIST-01a/-01b,
  RESOLVE-01, APPROVE-01, GINV-01, EPISODE-01, WINDOW-01 = **7**; L3 = AWAIT-01 = **1**. §7.3's
  *"Ten L1, seven L2, one L3"* holds. `PROP-WINDOW-01`'s and `PROP-LIST-01b`'s §7.1 rows still match
  their §4.3 *Owner* lines after the restatements (batch 3 → 9, permitted red 3–8; batch 3 → 7,
  permitted red 3–6). Not a finding.
- **Citation drift.** None found this round. Round 4's two items are both discharged: `reviewLoop`
  reads `:532–542` and measures `532–542`; the PLAN phrase is attributed to `PLAN:1504` with §9.2 item
  3(c)'s own words quoted separately at `PLAN:804`. Filed at no severity (R-6), and there is nothing
  left to correct.
- **Whether removing the call-count clause left `PROP-WINDOW-01` weaker than the mutation it aims at.**
  It does not: §5.3 row 1's mutation is precisely *"recompute the cap from its own `_listFiles`
  re-derivation"*, which is the drift the old clause was reaching for, and the new oracle kills it
  directly rather than by proxy. Not a finding.

## Questions

None. Q-04 and Q-05 are both answered in the document (§0 rows), and both answers re-derive.

## Positive Observations

- **The two Mediums were fixed at the value and at the observable, and both fixes are the expensive
  one.** PM F-01 could have been closed by editing one regex; instead §4.2 (v) carries the derivation
  from six sources, the Generator was rebuilt to vary the hex run rather than the label, and — the part
  that convinces me — the two `sha256Hex` sites were **left bare**, because TSPEC §3.7 splits the value
  and this revision read the split. A blanket replace would have broken `PROP-DIGEST-02`. F-25 could
  have been closed by deleting a clause; instead the property gained an oracle, a forced floor to make
  that oracle non-vacuous, a scoping clause on (iii), and a reconciling paragraph in the *other*
  property so the two partition rather than merely coexist.
- **Two independent fixes interlocked and the document noticed.** Pinning malformed payloads to vary
  the hex run (a PM F-01 consequence) is what makes the mixed double-line shape `n === 2` under either
  label matcher — which is what lets conjunct (ii) assert a *named* reason on the shape the F-27
  silence would otherwise have made undetermined. Neither fix was aimed there. I re-derived it because
  it is exactly the seam where a final-round repair usually opens a hole, and it closed one instead.
- **The withdrawal notes are more precise than the findings that prompted them.** §5.2's (3rd) row does
  not merely swap the mutation; it records that the old one *"is caught, but only by conjuncts already
  covered elsewhere, so it demonstrated nothing about (ii)"* — which is a sharper statement of my F-26
  than I wrote, and it names my round-3 prescription as the source rather than quietly dropping it.
  §4.3 does the same for the `1 + k` count. A document that records why a claim was wrong is a document
  the next reader can audit.
- **Everything measurable in this revision measured true.** `:532–542`, `:574`, `:598`, `:648`,
  TSPEC `:715–716`, `:853`, `:896`, `:921`, `:944`, `:1210`, `:1326`, `:1358`, `:1364`, `:1366`,
  `:1435`, `:1895–1901`, `:2407`, FSPEC `:372`, `:1046`, `:1466`, PLAN `:804`, `:1504`, the 208,911 B,
  the six-commit range, and the 1038/1/70/36 baseline. Not one number in v1.4 is wrong, and there is no
  citation drift left to correct silently — the first round of this document for which that is true.
- **The trajectory closed the way it should.** 8H/11M/5L → 1H/6M/6L → 0H/3M/4L → 0H/2M/4L → **0H/0M/2L**.
  Both Mediums were the same class — a conjunct that reds a correct implementation — and both are gone
  by re-derivation, not by softening. The two Lows below are new, narrow, and neither reds anything.

## Recommendation

**Approved with minor changes**

**Zero High, zero Medium, two Low. This is an approval, and I state it without qualification: the
document is implementable as written and I recommend it proceed to implementation.**

What I verified to support that, each derived rather than confirmed:

1. **F-25 is resolved and the replacement is sound in all four ways it could have failed.** The
   provenance oracle is *true* on a conforming subject — decisively, because TSPEC §5.6.1's
   `refreshReviewState` returns no `endIndex` at `:1435`, so the per-episode re-derivation cannot reach
   the cap; it is *observable* at L2 with doubles `reviewLoop` already injects; it is *falsifiable* by
   §5.3's named recompute mutation, which reds on the disagreeing runs and survives on the agreeing
   ones; and it says *nothing* about any call count anywhere in the property. The new ≥15 floor is
   satisfiable — 80 of 100 even if every axis were disjoint, and they are not — and disturbs no other
   property's floors.
2. **The grammar is `/^sha256:[0-9a-f]{64}$/` and all five clauses agree.** I derived it from FSPEC §5,
   §7 and §10.5, TSPEC §4.4, §3.7's `sha256Hex`/`approvalHashOf` split, and the §5.4 → §5.5 routing
   before reading any clause, and then measured each. Crucially the propagation is *complete without
   being blanket*: the two properties over `sha256Hex` correctly keep the bare form. Partial
   propagation is how this property failed in each of the last four rounds; this time it did not fail
   in either direction.
3. **F-26's swapped mutation isolates (ii)** — re-derived against all six conjuncts and both sibling
   rows, tabulated above. **F-27's shape is routed and recorded**, and reds nothing under either matcher.
4. **§0 is inert for the fifth round**, checked row by row against the owning section, and the +14,566 B
   is mostly body text. **`PROP-HASH-01` passed a full pass** — ten shapes × six conjuncts, four ledger
   rows, 60 of 100 forced cases — not merely the touched clauses.
5. **The suite baseline reproduces exactly**: 1038/1/70, 1109 total, 36 suites, 435.224 s, the single
   red being the intentional `AT-22 [red-until-L-06]` at `documentOracles.test.js:246`.

**Neither Low blocks, and I want to be explicit about why, because the cost of being wrong here is a
halt.** F-28 is a generator-realisation ambiguity: under the reading §5.3's (3rd) row makes evidently
intended, nothing reds; under the other reading, an implementer sees the red the first time they write
the case and fixes it by shifting the pair. F-29 changes no assertion at all — every conjunct that
binds on the malformed-label shape answers identically under both counts, which the document itself
derives two sentences later. Neither is a property that reds correct code, which is the only class I
have withheld approval for in four rounds. Both are one-clause repairs that can ride into implementation
as `se-implement` notes; neither needs a v1.5.

I have not lowered the bar to converge. I re-derived the two Mediums' fixes from TSPEC and FSPEC rather
than from the document's account of them, went looking specifically for the hole a final-round oracle
and a new floor usually open, and found instead that two independent fixes closed one. I have not
raised it either: I declined to file (i)'s *"every consumer"* phrasing, because (iii)'s disclaimer
covers it under exactly the structure I ruled sufficient for §4.2's quoted-line silence in round 4, and
I declined to file the missing per-conjunct falsifier for (i)'s count half, because §5.1's rule is
per-property and the discrimination is carried by the Generator's mixed sub-floor.

This document is ready.

---

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 2}
