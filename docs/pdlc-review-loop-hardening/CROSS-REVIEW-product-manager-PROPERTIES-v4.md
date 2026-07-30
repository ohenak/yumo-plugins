# Cross-Review: product-manager — PROPERTIES (round 4, delta)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-review-loop-hardening/PROPERTIES-pdlc-review-loop-hardening.md` (v1.3, 194,345 B)
**Date:** 2026-07-30
**Iteration:** 4
**Scope:** Delta re-review. Verification of the three findings in `CROSS-REVIEW-product-manager-PROPERTIES-v3.md` (0 High / 2 Medium / 1 Low, `1dfeb1c`) by **re-derivation from source**, never against §0 (DC-02), plus a new-defect scan restricted to the sections carrying diff hunks in `a03ecde..63490cb`. Unchanged sections are not re-litigated. Upstream REQ v1.6 / FSPEC v1.8 / TSPEC v1.7 / PLAN v1.4 are approved, closed, and treated as fixed contracts (R-5). Citation and `file:line` drift corrected silently, never filed (R-6).

---

## Method

| Step | What was done |
|---|---|
| Baseline | `git pull --rebase` on `feat-pdlc-review-loop-hardening` — already up to date at `63490cb` |
| Diff | The brief's inclusive range `d93b7ab..63490cb` is correct as *inclusive*: `d93b7ab` is itself the PM F-03 fix (*"§2.3 — withdraw the competing sole-ownership claim"*), so `git diff d93b7ab..63490cb` **excludes** it. The reviewed range was widened to `a03ecde..63490cb` (the se-review round-3 commit → HEAD), eight document commits. Reviewing the exclusive range alone would have left F-03 unverifiable |
| Prior findings | F-01, F-02, F-03 each re-derived from TSPEC / FSPEC / `QUEUE.md` / the tree, never from §0's claim |
| Changed-section scan | Hunks land at §0 (new-file 16, 27, 79), §2.3 (392), §4.2 (998, 1047, 1056, 1059, 1167, 1169), §4.3 (1417, 1523), §4.4 (1623), §5.2 (1740), §6.5 (1899), §8.4 (2084), §8.5 (2156). **§4.1 carries no hunk** — see the floor re-judgement below |
| Sources re-derived | TSPEC §4.3, §4.4's record grammar, §5.0's `scanLines`, §5.3's pre-count and branch table, §5.4's tier-1 search, §5.5's `isStale`, §3.7's signatures; FSPEC §5's carrier catalogue (line 372) and §7's append shape (line 1046) and §10.5 (line 1466); PLAN §9.2 item 3(c) and §7.3; every row of `docs/_queue/QUEUE.md`; `DOMAIN-CONSTRAINTS.md` DC-08 |
| Suite | `cd pdlc/workflows && npm test` — **1038 passed / 1 failed / 70 skipped, 1109 total, 36 suites, 383.695 s** on this machine. The single red is the pre-existing intentional `coveredViolations (§10, §10.1) › AT-22 [red-until-L-06]`, failing at `documentOracles.test.js:246`. Baseline reproduces exactly. Wall clock is machine-dependent and not compared to any other run |
| Reconciliation | `CROSS-REVIEW-software-engineer-PROPERTIES-v3.md` read in full. SE F-23 ≡ PM F-01 is one defect, fixed once |

---

## Verification of my round-3 findings — evidence I derived

| Prior | Sev | Disposition | Evidence I derived (not the author's report) |
|---|---|---|---|
| **F-01** ≡ SE F-23 | Medium | **Resolved** | I re-derived the counting unit before reading §4.2's derivation of it. **TSPEC §5.3**: *"Before appending, `scanLines` the file and collect the `APPROVAL-HASH:` lines outside fences"*, and its branch table keys on `0` / `1` / `≥ 2` — the *value* column reads `—` on the `0` and `≥ 2` rows and carries a comparison only on the two `1` rows, so at `≥ 2` the disposition is fixed with **no payload test**. **TSPEC §4.3** defines the sibling `duplicated` as *"more than one such line outside fenced regions"*. **TSPEC §5.0**'s `scanLines` visits every line except fence openers, closers and fenced content — the fence is the only exclusion. Three independent signals, all line-counting, none trailer-counting ⇒ **the unit is `APPROVAL-HASH:` lines outside fences, counted irrespective of payload**. That is what §4.2 now says, and the six conjuncts are all stated over that one `n`. **Re-derived on the document that started this** — one valid + one 63-hex trailer: `n = 2`, so (ii) returns `duplicated` and (i)'s `iff` is false in its `n === 1` half, both giving `ok: false`. The v1.2 contradiction (`iff` demanded `ok:true`, conjunct demanded `ok:false`) is gone, and it is gone by fixing the *measure*, not by deleting a clause. **Drawable population agrees**: the Generator now states *"Each document carries exactly one shape from this list, never a mixture — the list is a list of document shapes, not of candidates that may be combined"*, and the double-line shape is widened to *"both valid, or one valid and one malformed, since the count is payload-blind"* with a **≥2 mixed** sub-floor inside the ≥5. So the document that produced the finding is now explicitly drawn *and* both conjuncts agree on it — the stronger of the two answers my Q-01 offered |
| **F-02** | Medium (Cross-Feature) | **Resolved — and by withdrawal, which is the disposition DC-08 requires** | I read **every row** of `docs/_queue/QUEUE.md` rather than checking the author's claim. Rows present: 0 (this feature), 1 `done`, 2 `pdlc-merge-phase`, 3 `pdlc-advisory-tier`, 4 `pdlc-consolidation-agent`, 5 `pdlc-engineering-loop`, 6 `pdlc-install-mechanism` (D-DIST-01/-02/-03/-05: install, plugin-path loading, auto-sync, cache detection), 7 `pdlc-release-ci` (D-DIST-06 release automation), 9 `pdlc-authoring-contract`. **None charters reader-seam IO-failure coverage in `orchestrate-dev.js`.** Row 6 is the closest and is about the *distribution* channel, not the orchestrator's `_readFile`. So *"no successor row today"* is the honest disposition, not a softer evasion — it names **no** owner rather than a weaker one. Row 9's charter is now **quoted verbatim** and I diffed the quote against the file: *"the **same** underlying gap: the six author/review SKILLs are the authoring interface, and they declare nothing machine-readable about what they produce"* and *"Scope this row's REQ to *declaring* those contracts in the SKILLs, not to re-implementing row 0's mechanism — the mechanism is correct, it is the interface that is undeclared."* Both reproduce `QUEUE.md` exactly. Closing the residual is stated as an **action** on a queue owner (widen row 9's REQ scope when authored, or allocate a new row), which is what my Q-02 asked for. **§8.3's two surviving row-9 bindings genuinely fit that charter** — I checked each against `QUEUE.md`'s own bullets: `MAX_AUTHORING_WRITE_BYTES` is row 9's **T-Q-03** verbatim (*"a contract the script states and the SKILL does not"*), and SKILL-template ↔ `completeness.test.js` fixture drift is row 9's **Q-09** verbatim (*"Closing it means the SKILLs declaring the heading template themselves"*). Neither is row 0's mechanism. The third item was the outlier and it is the one withdrawn |
| **F-03** | Low | **Resolved** | Fixed at `d93b7ab`, the commit the exclusive diff range excludes. §2.3 now reads *"The table above is the sole owner of each property's disposition; a property's `Shrink.` line **restates its row here and owns nothing**"*, and states the withdrawal in its own words. §3.1's `Used by` cell (unchanged, no hunk) reads *"**§2.3's table is the sole owner of each one's disposition** and is not restated here"* — a pointer *to* the owner, not a competing claim. Grepped `sole owner` across the document: three occurrences, one in §0's v1.2 map row, one in §2.3 (the owner), one in §3.1 (pointing at it). One owner, one rule |

**Three of three resolved. None carried forward.** All three were repaired in the section that owns the substance, with the prior claim quoted and withdrawn rather than overwritten.

---

## Re-judgement: is the seven-property floor still met in substance?

**Yes — seven of seven, unchanged, and I did not re-derive it.** As instructed, I checked §4.1 for hunks first. Measured over the full `a03ecde..63490cb` range, §4.1 (new-file lines 609–980; old-file 570–941 after the +34/§0 and +5/§2.3 offsets) carries **no diff hunk** — the nearest are old-file 358 (§2.3) and old-file 959, whose context line *"H-4 presence vectors — is preserved intact"* sits at new-file 991, inside §4.2. `PROP-DIGEST-01/-02`, `PROP-SCAN-01`, `PROP-NAME-01`, `PROP-ROUND-01`, `PROP-FORCE-01` and `PROP-COMPLETE-01` are byte-identical to the versions I judged sufficient in round 3. Nothing regressed it, so the round-3 judgement stands unmodified.

I separately checked the two arithmetic claims §7 makes about the whole set, because §7.1's `PROP-HASH-01` cell was touched by adjacent edits: §7.1 lists eighteen ids over seventeen properties, and §7.3's *"Ten L1, seven L2, one L3"* re-derives exactly from §7.1's `Level` column (L1: DIGEST-01/-02, HASH-01, STALE-01, SCAN-01, NAME-01, ROUND-01, FORCE-01, COMPLETE-01, TRAILER-01 = 10; L2: LIST-01a/-01b, RESOLVE-01, APPROVE-01, GINV-01, EPISODE-01, WINDOW-01 = 7; L3: AWAIT-01 = 1). Both true.

### Does the approved PLAN stay closed?

**Yes.** v1.3 added no property, moved no property between levels, and changed no ledger window. §5.2's two new rows are falsifiers, not §7.3 entries. The only new §7.3 row in this document remains `PROP-TRAILER-01`'s, which round 3 ruled *not* a defect — §7.3's own per-assertion derivation rule (green from the batch that greens the assertion; permitted red = the batches between writing and greening) produces `batch 3 / none` mechanically from PLAN §4's placement of RLH-21 and RLH-05(f). Not re-filed, per the brief.

---

## The four risks the brief named, judged

**1. Recording rather than resolving the `> `-quoted pre-count question — the honest disposition, and it reds nothing drawn.** I checked the premise first: TSPEC §5.0's `scanLines` excludes fenced regions **and nothing else**, and §5.3 says only *"collect the `APPROVAL-HASH:` lines"*, pinning no matcher. A prefix-anchored matcher gives `n = 0` for a `> `-quoted line; a substring matcher gives `n = 1`. **No approved artifact decides it**, so §4.2 is right that this is a spec silence and not a property choice. I then walked all nine generator shapes against a conforming subject under **both** readings; every one lands on the same verdict:

| Drawn shape | Counting reading | Not-counting reading | Asserted |
|---|---|---|---|
| valid | `n=1`, well-formed, permitted ⇒ `ok:true` | same | (i), (v) |
| uppercase / 63 / 65 / non-hex payload | `n=1`, malformed ⇒ `ok:false` | same | (iv), (vi) — no named reason |
| valid inside a fence | `n=0` ⇒ `absent` (fence is a *stated* exclusion, §5.0) | same | (iii), (vi) |
| valid behind a `>` quote | `n=1`, position forbidden ⇒ `ok:false` | `n=0` ⇒ `absent` | `ok:false` + (vi) only — named reason deliberately not asserted |
| two lines outside fences | `n≥2` ⇒ `duplicated` | same | (ii), (vi) |
| no trailer | `n=0` ⇒ `absent` | same | (iii), (vi) |

Only the quoted shape differs between readings, and on it the document asserts exactly the two things both readings share. **No drawn case reds a conforming subject on this axis**, and the quoted-trailer *coverage* is not weakened: the ≥10 quoted-or-fenced floor, conjunct (i)'s position half, and §5.2's `PROP-HASH-01` (2nd) mutation all still bind. Recording was the correct call; resolving would have required inventing a matcher the specs decline to pin.

**2. Is §0 still inert? Yes — fourth round running, checked row by row, not by size.** The v1.3 block is eight rows plus three prose paragraphs. Each row was checked against the section it points at: SE F-21 → §5.2's `PROP-HASH-01` (3rd) and (4th) rows exist in the body ledger; SE F-23 ≡ PM F-01 → §4.2's (i)–(vi) and the Generator sentence; PM F-02 → §8.4 residual 6's two new paragraphs; SE F-22 → §4.3's two-return-sites paragraph; SE F-24 → §4.4 and §8.5 item 5, both quoting PLAN §9.2 item 3(c); PM F-03 → §2.3's withdrawal paragraph; SE Q-03 → carried, records a *non*-change and owns no substance; the R-6 row records a line-number correction applied in three places. **No property's only precise statement, and no live disposition, exists solely in a changelog row.** Not filed, and this should stop being re-derived.

**3. The new machinery does not disturb any floor's satisfiability.** §5.2's two rows are ledger entries and force nothing on the generator. The widened double-line shape splits an existing floor rather than adding one: ≥5 double-line, **of which ≥2** are mixed valid-plus-malformed. Summing §4.2's forced floors against its 100-case budget: 20 valid + 10 (63-char) + 10 (65-char) + 10 quoted-or-fenced + 5 double-line + 5 no-trailer = **60 of 100**, leaving 40 cases for the three unfloored shapes. Satisfiable with room. No other property's floors were touched.

**4. The approved PLAN stays closed** — derived above.

---

## New findings (changed sections only)

| ID | Severity | Scope | Finding | Ref |
|----|----------|-------|---------|-----|
| F-01 | **Medium** | Local | **`PROP-HASH-01` conjunct (v) states the wrong value shape for the thing it quantifies over, and reds a conforming subject on the property's largest forced floor.** Conjunct (v) reads *"the returned hash always matches `/^[0-9a-f]{64}$/`, totally over the input space"* — an **anchored** regex over `parseApprovalHash`'s `hash` field. Derived from the approved contracts, that field carries the `sha256:` label: **FSPEC §5**'s carrier catalogue gives the approval anchor's value catalogue as *"`sha256:` + 64 lowercase hex"*; **FSPEC §7**'s append shape and **TSPEC §4.4**'s record grammar both write `APPROVAL-HASH: sha256:{64 lowercase hex}`; **FSPEC §10.5** rejects a value that *"does not match §7's grammar (`sha256:` + 64 lowercase hex)"*; and **TSPEC §5.4** states *"§5.5 takes `recordedHash` from `anchor`"*, where `anchor ← parseApprovalHash(text)` — while **TSPEC §5.5**'s guard is `/^sha256:[0-9a-f]{64}$/`. A subject that returned a bare 64-hex `hash` would make `isStale` return `"UNEVALUABLE"` on every approval and the skip mechanism would never fire, so the prefixed value is the only conforming one. Conjunct (v) is therefore **false on every one of the ≥20 forced valid cases**, and the same reading propagates: §5.2's **new** `PROP-HASH-01` (3rd) row asserts *"(v) survives (the returned value is still 64 hex on the both-valid cases)"*, §7.2 sells the property as proving *"that **no** input yields a non-64-hex 'hash'"*, and the Generator's *"valid (64 lowercase hex)"* / *"63 and 65 characters"* read against (v)'s anchored regex as the whole line value — under which the ≥20 "valid" documents are ungrammatical and conjunct (i)'s `iff` reds on all of them too. **The document contradicts itself on the same value**: `PROP-STALE-01`'s generator draws anchors as *"`sha256:` + digest"* and its conjunct (i) guards `/^sha256:[0-9a-f]{64}$/`, i.e. prefixed — and TSPEC §5.4 says that is literally `PROP-HASH-01`'s output. `PROP-HASH-01` rides the digest row (green batch 3, permitted red batch 2), so this is a deterministic red at the batch-3 gate. This is my standing concern's exact shape — a claimed guarantee whose reality contradicts it — filed for the first time; it is not a re-file of F-01, whose subject was the *count*, not the *value* | PROPERTIES §4.2 (v), §4.2 Generator, §5.2 `PROP-HASH-01` (3rd), §7.2; FSPEC §5 carrier catalogue, §7, §10.5; TSPEC §4.4, §5.4, §5.5 |
| F-02 | Low | Local | **§5.2's new `PROP-HASH-01` (3rd) row over-claims which conjunct its mutation isolates.** The row states *"the red names **(ii) alone** and not the return shape"*. Derived: the mutation returns `{ ok: true, hash }` on a pre-count of `≥ 2`. Conjunct (i) is an `iff` — `ok:true` **iff** `n === 1` **and** the line is well-formed at a permitted position — so on those same ≥5 double-line cases the mutant's `ok:true` at `n = 2` violates **(i)** as well. The falsifier itself is sound and the row is owed (both pre-existing rows do survive the mutation, as claimed); what is wrong is only the isolation claim. Diagnostically this is harmless — (i) and (ii) both point at the count — but §5.1's rule is *"the conjunct that dies"*, and naming one when two die is the same over-precision the (4th) row avoids correctly (*"(i) survives — the answer is still `ok: false`"*). Fix: drop "alone", or state *"(ii) and (i)'s count half; (v) and (vi) survive"* | PROPERTIES §5.2 `PROP-HASH-01` (3rd), §4.2 (i)–(ii), §5.1 |
| F-03 | Low | Local | **Conjunct (iv) places the malformed-label shape at `n === 1`, which §4.2's own stated unit places at `n === 0`.** (iv) reads *"`n === 1` whose payload is uppercase hex, 63 or 65 characters, non-hex, **or carried under a malformed label** returns `ok: false`"*. But the unit §4.2 derives two paragraphs above is *"`APPROVAL-HASH:` lines outside fenced regions"* — and a line whose **label** is malformed is not an `APPROVAL-HASH:` line, so the shape is `n === 0` and falls under **(iii)**, which asserts the *named* reason `absent`. The two readings do not contradict on the verdict (both are `ok: false`, and `absent` is what a conforming subject returns for a document with no `APPROVAL-HASH:` line — TSPEC §4.3 reserves `unparseable` for a line that *exists* but whose value is wrong), so unlike round 3's F-01 **no assertion here is false on correct code**. But §1.1's bar is that two engineers write the same assertion, and here one writes `ok:false` only while the other writes `reason === "absent"`. This is the same silence class the author *did* record for the `> `-quoted line, one paragraph later, and it is the shape §4.2 is now three rounds into paying for. Fix: one clause — either move the malformed-label shape into (iii) explicitly, or state it as a second recorded ambiguity beside the quoted one | PROPERTIES §4.2 (iii)–(iv) and the unit paragraph; TSPEC §4.3, §4.4 |

### Candidates examined and *not* filed — do not re-file these

- **§0's size and the v1.3 block.** Inert, checked row by row against every owning section. Fourth round with the same result.
- **The `> `-quoted pre-count silence.** Judged above as the honest disposition; walked over all nine drawn shapes; reds nothing. Explicitly not a finding.
- **The `absent` row of §4.2's owner table not being renumbered to "(iii)" while the `duplicated` row was renumbered to "(ii)".** An internal pointer omission with an unambiguous referent. Mechanical, corrected silently (R-6).
- **`PROP-TRAILER-01`'s new §7.3 ledger row.** Ruled not a defect in round 3; §7.3's own derivation rule produces it. Not re-opened, per the brief.
- **TSPEC §8.1 / §8.2's count inconsistency.** Already reported upward in §8.1 with the substance-vs-count distinction stated. Upward-facing (R-5), not blocking.
- **The `absent`/`duplicated` ownership split in §4.2's table.** Re-checked after the restatement: `unparseable` → `PROP-STALE-01`(i) with four ≥5 shape floors, `duplicated` → `PROP-HASH-01`(ii) with the ≥5 double-line floor, `absent` → `PROP-HASH-01` with the ≥5 no-trailer floor, `unreadable` → nobody. Every non-empty side has conjuncts, generator draws and forced floors; the empty side says "nobody". Sound.
- **SE F-24's PLAN quote.** Verified independently: PLAN §9.2 item 3(c) reads *"to decide which §8.5 ruling, if any, applies"* and both §4.4 and §8.5 item 5 now reproduce it. Fixed, not a finding.
- **Wall clock and `file:line` drift** (the `:570` → `:574` corrections, `reviewLoop:531–543` vs `532–542`, the `"bytes"` arm span). Corrected silently, not filed (R-6).

---

## Questions

| ID | Question |
|----|---------|
| Q-01 | For F-01: is `parseApprovalHash`'s `hash` intended to be the line's **whole value** (`sha256:` + 64 hex, which TSPEC §5.4/§5.5 require of `isStale`'s `recordedHash`), or the hex run **after** the label with a caller re-prefixing? The first is the only reading the approved specs support; if the author believes otherwise, the place to say so is §8.5 as an upward report against TSPEC §3.7, not a conjunct that assumes it. |
| Q-02 | For F-03: is the malformed-label shape meant to be tested as `absent` (its `n === 0` disposition) or only as `ok: false`? Either is defensible; the generator's ≥-floor accounting does not depend on it, but the assertion does. |

---

## Positive Observations

- **F-01 was fixed at the measure, not at the sentence.** Three rounds of duplicate-handling defects were three paraphrases of a counting rule; v1.3 went to TSPEC §5.3's branch table, observed that the `≥ 2` row carries no payload column at all, and rebuilt the whole invariant as six conjuncts over one derived `n`. That is the difference between patching a contradiction and removing the thing that generates contradictions — and it is why my re-derivation of the unit landed on the same answer independently.
- **The generator was made to agree with the conjuncts, in both directions.** Stating *"exactly one shape, never a mixture"* closes the ambiguity, and then **widening** the double-line shape so the payload-blind case is actually drawn — with its own ≥2 sub-floor — means conjunct (ii)'s new strength is exercised rather than asserted. Answering "which reading?" by making the harder reading generable is the expensive answer.
- **F-02 was answered by withdrawing a claim rather than by finding a better claim.** The cheap fix was to name a different row. The document instead read all nine queue rows, concluded none charters the gap, and wrote *"no successor row today"* into a ledger whose whole purpose is to look closed. DC-08's failure mode is a false attribution; an admitted absence is its opposite, and the action that would close it is stated as an action on a named owner.
- **Every claim I could measure in this revision measured true**, including the two I expected to fail: `QUEUE.md`'s row-9 quotes reproduce byte for byte, §8.3's two surviving bindings map onto row 9's own T-Q-03 and Q-09 bullets, PLAN §9.2 item 3(c)'s quote is now the artifact's words, §7.3's level distribution re-derives from §7.1, and the suite baseline reproduces exactly (1038/1/70, 36 suites). The one Medium below is a value-shape claim inherited from v1.1 and re-emitted in a rewritten section — not a new mis-measurement.
- **The failure mode keeps shrinking.** Round 1: 8H/11M/5L. Round 2: 1H/6M/6L. Round 3: 0H/3M/4L. This round the count is lower again and nothing filed reopens a resolved finding.

---

## What must change for approval

1. **F-01** — restate conjunct (v) over the value the approved specs define: *"the returned `hash` always matches `/^sha256:[0-9a-f]{64}$/`, totally over the input space"* (citing FSPEC §5 / §7 and TSPEC §5.5's guard input, not paraphrasing), and make the Generator say that a *valid* candidate line is `APPROVAL-HASH: sha256:{64 lowercase hex}` with the 63/65-character shapes varying the **hex run**, not the label. Correct §5.2's `PROP-HASH-01` (3rd) row's *"still 64 hex"* clause and §7.2's *"non-64-hex 'hash'"* cell with the same value. No upstream document is touched.
2. **F-02** (Low, may ship) — drop "alone" from §5.2's (3rd) row, or name (i)'s count half alongside (ii).
3. **F-03** (Low, may ship) — put the malformed-label shape in one bucket, or record it as a second stated ambiguity beside the quoted-line one.

The Medium is a single-clause repair in the owning section plus two consequential clauses that already point at it, entirely within PROPERTIES and in line with R-5.

---

## Recommendation

**Needs revision**

Stated plainly, because round 4 of 5 deserves it: **all three of my round-3 findings are resolved**, each re-derived from source rather than accepted; the **seven-property floor is still met in substance, seven of seven**, and §4.1 carries no hunk in this range so that judgement is unmodified rather than re-argued; **§0 is inert for the fourth round running**; the new §5.2 rows and the widened Generator shape disturb no floor's satisfiability (60 forced cases of 100); the PLAN stays closed; the `> `-quoted silence is recorded honestly and reds nothing drawn; and the suite baseline reproduces exactly.

What blocks approval is one conjunct that says the returned hash is bare 64-hex when FSPEC §5, FSPEC §7, TSPEC §4.4 and TSPEC §5.5's guard all make it `sha256:`-prefixed — and which this document itself contradicts in `PROP-STALE-01`, over the very same value TSPEC §5.4 routes from one to the other. That is a property that fails on a correct implementation, on its own largest forced floor, at a gate with one batch of permitted red. It is the class I have flagged in every round, it is filed here for the first time on this surface, and it is a one-clause repair that reopens nothing upstream. I am not lowering the bar to converge and I have not raised it: had this been the only remaining issue in round 3 it would have been a Medium then too.

VERDICT: Needs revision
{"high": 0, "medium": 1, "low": 2}
